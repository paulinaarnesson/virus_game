/**
 * Socket controller
 */

const debug = require('debug')('virus_game:socket_controller');

let io = null;
let lowestTime = null;
const players = {};
let playerArray =[];
let playerClicked = null;
let playerReady = null;
let playerTimes = [];
let startTime = null;
let scoreArray = [];

/**
 * handle and compare click time to start time
 */
function handleCompareClick() {
	const time = (Date.now()-startTime) / 1000;
	playerTimes.push(time);

	playerClicked += 1;

	playerArray.push(
		{
			name: players[this.id],
			clickTime: time,
		}
	);

	if (playerClicked === 2){
		lowestTime = Math.min(...playerTimes);

		let fastestPlayer = playerArray.find(player => {
			return player.clickTime === lowestTime
		});

		scoreArray.push(
			fastestPlayer,
		)
		io.emit('render-timeAndScore', scoreArray);
	}
}

/**
 * Handle user disconnecting
 */
function handleDisconnect() {
	debug(`Socket ${players[this.id]} left the game`);
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
/**
 * Handle find winner
 */
function handleFindWinner(playersScoreArray){
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
/**
 * Get nicknames of online players
 */
function getOnlinePlayers() {
	return Object.values(players);
}

/**
 * Handle a new player connecting
 */
function handleRegisterPlayer(player_name, callback) {
	//debug(`${player_name} connected to the game`);
	players[this.id] = player_name;
	callback({
		joinGame: true,
		onlinePlayers: getOnlinePlayers(),
	});

	// // emit to all connected sockets
	// this.broadcast.emit('player-connected', player_name);

	//emit online players to all connected sockets
	this.broadcast.emit('online-players', getOnlinePlayers());
}

/**
 * Handle and start the game
 */
function handleStartGame () {
	playerTimes = [];
	playerArray = [];
	playerClicked = 0;

	let onlinePlayers = getOnlinePlayers();

	playerReady += 1;

	if(onlinePlayers.length === playerReady) {
		const virusObject = {
			topCoordinates: Math.floor(Math.random()*(350-0)),
			rightCoordinates: Math.floor(Math.random()*(550-0)),
			setTime: Math.floor(Math.random()*5000),
		};

		startTime = Date.now();
		playerReady = 0;
		io.emit('game-started', virusObject);
	}

}

module.exports = function(socket) {
	debug(`${socket.id}, just connected`);
	io = this;

	socket.on('compare-click', handleCompareClick);

	socket.on('disconnect', handleDisconnect);

	socket.on('find-winner', handleFindWinner);

	socket.on('register-player', handleRegisterPlayer);

	socket.on('start-game', handleStartGame);
}
