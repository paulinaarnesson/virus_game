/**
 * Socket controller
 */

const debug = require('debug')('virus_game:socket_controller');

//global variables
let io = null;
let lowestTime = null;
const players = {};
let playerArray =[];
let playerClicked = null;
let playerReady = null;
let playerTimes = [];
let startTime = null;
let scoreArray = [];

function handleCompareClick() {
	//Stop timer and count the difference from start to now, convert to seconds
	const time = (Date.now()-startTime) / 1000;
	//save in array to get all players times
	playerTimes.push(time);

	//add variable for every player that clicked the virus
	playerClicked += 1;

	//Save object with name and time to another array
	playerArray.push(
		{
			name: players[this.id],
			clickTime: time,
		}
	);

	//Wait so you have 2 players that clicked
	if (playerClicked === 2){
		//find fastest click in array
		lowestTime = Math.min(...playerTimes);

		//Find the fastest time in array of users and times
		let fastestPlayer = playerArray.find(player => {
			return player.clickTime === lowestTime
		});

		//Push winner to array of all rounds
		scoreArray.push(
			fastestPlayer,
		)
		//emit and send winners with
		io.emit('render-timeAndScore', scoreArray);
	}
}

function handleDisconnect() {
	//Empty all variables
	playerReady = 0;
	playerTimes = [];
	playerArray = [];
	playerClicked = 0;
	scoreArray = [];

	// broadcast to all connected sockets that this player has left the chat
	if (players[this.id]) {
		io.emit('player-disconnected', players[this.id]);
		// remove player from list of connected players
		delete players[this.id];
	}
}

function handleFindWinner(playersScoreArray){
	//find winner with highest score or equal
	winner = playersScoreArray.reduce( (prev, current) => {
		if(prev.score > current.score){
			return `Congrats!!! The winner is: ${prev.name}!`;
		}else if(prev.score < current.score){
			return `Congrats!!! The winner is: ${current.name}!`;
		}else if(prev.score === current.score){
			return `Congrats!!! You both are winners!`
		}
	});
	this.emit('render-winner', winner);
}

function getOnlinePlayers() {
	return Object.values(players);
}

function handleRegisterPlayer(player_name, callback) {
	//If three or more players try to connect alert NO
	if(getOnlinePlayers().length === 2){
		this.emit('wait-player');
		return;
	}
	//save player_name to players Object with socket.id as key
	players[this.id] = player_name;
	//Send back onlineplayers with joinGame so front end can render game area
	callback({
		joinGame: true,
		onlinePlayers: getOnlinePlayers(),
	});

	//emit online players
	this.broadcast.emit('online-players', getOnlinePlayers());
}

function handleStartGame (measures) {
	//New game so empty all variables
	playerTimes = [];
	playerArray = [];
	playerClicked = 0;

	//Get online players
	let onlinePlayers = getOnlinePlayers();
	//For every submit add 1
	playerReady += 1;

	//Wait for two players to start game
	if(onlinePlayers.length === playerReady) {
		//Save random coordinats and time in object
		const virusObject = {
			topCoordinates: Math.floor(Math.random()*(measures.height)),
			bottomCoordinates: Math.floor(Math.random()*(measures.height)),
			rightCoordinates: Math.floor(Math.random()*(measures.width)),
			leftCoordinates: Math.floor(Math.random()*(measures.width)),
			setTime: Math.floor(Math.random()*5000),
		};

		//Start timer
		startTime = Date.now();
		//clear
		playerReady = 0;
		io.emit('game-started', virusObject);
	}

}

module.exports = function(socket) {
	debug(`${socket.id}, just connected`);
	io = this;

	//Listeners
	socket.on('compare-click', handleCompareClick);

	socket.on('disconnect', handleDisconnect);

	socket.on('find-winner', handleFindWinner);

	socket.on('register-player', handleRegisterPlayer);

	socket.on('start-game', handleStartGame);
}
