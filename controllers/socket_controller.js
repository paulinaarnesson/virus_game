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
const playerTimes = [];
let startTime = null;
let scoreArray = [];

/**
 * handle and compare click time to start time
 */
function handleCompareClick() {
	const time = (Date.now()-startTime) / 1000;
	playerTimes.push(time);

	console.log('playerTimes', playerTimes);

	console.log(`${players[this.id]} managed to click the virus in ${time}`);

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
		console.log('scoreArray', scoreArray);
		io.emit('render-time', scoreArray);
	}

	console.log('playerArray', playerArray);

}

/**
 * Handle user disconnecting
 */
function handleDisconnect() {
	debug(`Socket ${players[this.id]} left the game`);

	// broadcast to all connected sockets that this player has left the chat
	if (players[this.id]) {
		this.broadcast.emit('player-disconnected', players[this.id]);
		rounds = 0;
		playerReady = 0;
		// remove player from list of connected players
		delete players[this.id];
	}
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
	playerArray = [];
	let onlinePlayers = getOnlinePlayers();

	debug(`${onlinePlayers} with socket id: ${this.id} started the game`)

	playerReady += 1;
	//console.log('playerReady', playerReady)
	//console.log('onlinePlayers', onlinePlayers)

	if(onlinePlayers.length === playerReady) {
		const virusObject = {
			topCoordinates: Math.floor(Math.random()*(350-0)),
			rightCoordinates: Math.floor(Math.random()*(550-0)),
			setTime: Math.floor(Math.random()*10000),
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

	socket.on('start-game', handleStartGame);

	socket.on('register-player', handleRegisterPlayer);
}
