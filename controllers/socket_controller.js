/**
 * Socket controller
 */

const debug = require('debug')('virus_game:socket_controller');

let io = null;
const players = {};
const playerArray = [];
let playerReady = null;
const playerTimes = [];
let rounds = null;
let startTime = null;

/**
 * handle and compare click time to start time
 */
function handleCompareClick() {
	const time = (Date.now()-startTime) / 1000;
	playerTimes.push(time);

	playerArray.push({
		name: players[this.id],
		clickTime: time,
		rounds,
	});

	//console.log('PLAYERARRAY', playerArray);

	const lowestTime = Math.min(...playerTimes);

	const fastestPlayer = playerArray.find(player => {
		return player.clickTime === lowestTime;
	})

	console.log('fastestPlayer', fastestPlayer);
	//console.log('playerTimes', playerTimes);
	//console.log('lowestTime', lowestTime);
	//console.log('rounds', rounds);

	this.emit('render-time', fastestPlayer);
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
	onlinePlayers = getOnlinePlayers();

	debug(`${onlinePlayers} with socket id: ${this.id} started the game`)

	playerReady += 1;
	//console.log('playerReady', playerReady)
	//console.log('onlinePlayers', onlinePlayers)

	if(onlinePlayers.length === playerReady) {
		rounds += 1;
		console.log('ROUNDS', rounds);
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
