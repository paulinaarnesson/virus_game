/**
 * Socket controller
 */

const debug = require('debug')('virus_game:socket_controller');

//global variables
let io = null;
let loserArray = [];
let lowestTime = null;
let measuresArray = [];
const players = {};
let playerArray =[];
let playerClicked = null;
let playerReady = null;
let playerTimes = [];
let winnerArray = [];

function handleCompareClick(difference) {
	playerTimes.push(difference);

	//add variable for every player that clicked the virus
	playerClicked += 1;

	//Save object with name and time to another array
	playerArray.push(
		{
			name: players[this.id],
			clickTime: difference,
		}
	);

	//Wait so you have 2 players that clicked
	if (playerClicked === 2){
		//find fastest click in array
		lowestTime = Math.min(...playerTimes);

		//Find the fastest time in array of players push to winner else push to losers
		playerArray.map(player => {
			if(player.clickTime === lowestTime){
				winnerArray.push(player);
			}else{
				loserArray.push(player);
			}
		});

		//create an object to be able to send both arrays to front end
		const playerObject = {
			winner: winnerArray,
			loser: loserArray,
		};

		//emit and send winners with
		io.emit('render-timeAndScore', playerObject);
	}
}

function handleDisconnect() {
	//Empty all variables
	playerReady = 0;
	playerTimes = [];
	playerArray = [];
	playerClicked = 0;
	winnerArray = [];
	loserArray = [];

	// broadcast to all connected sockets that this player has left the chat
	if (players[this.id]) {
		io.emit('player-disconnected', players[this.id]);
		// remove player from list of connected players
		delete players;
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
	//Push meassures to array
	measuresArray.push(measures);

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
		//When two players, use the meassures of the smallest screen
		let smallestMeassures = measuresArray.reduce((prev, current) => {
			return {
				width: (prev.width < current.width) ? prev.width : current.width,
				height: (prev.height < current.height) ? prev.height : current.height,
			}
		});

		//Save random coordinats and time in object
		//Made a litle "ful hack". Hard coded 50 wich is the size of the virus so it definitely stays inside the box.
		const virusObject = {
			topCoordinates: Math.floor(Math.random()*(smallestMeassures.height-50)),
			bottomCoordinates: Math.floor(Math.random()*(smallestMeassures.height-50)),
			rightCoordinates: Math.floor(Math.random()*(smallestMeassures.width-50)),
			leftCoordinates: Math.floor(Math.random()*(smallestMeassures.width-50)),
			setTime: Math.floor(Math.random()*5000),
		};

		//clear
		playerReady = 0;
		smallestMeassures = null;
		measuresArray = [];
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
