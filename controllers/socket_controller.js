/**
 * Socket controller
 */

const debug = require('debug')('virus_game:socket_controller');

let io = null;
const players = {};
let playerReady = null;
const playerTimes = [];
let rounds = null;
let startTime = null;

/**
 * handle and compare click time to start time
 */
function handleCompareClick(clickTime) {

	const time = (clickTime-startTime) / 1000;
	playerTimes.push(time);

	const lowestTime = Math.min(...playerTimes);

	//console.log('playerTimes', playerTimes);
	//console.log('lowestTime', lowestTime);
	//console.log('rounds', rounds);

	const info = {
		lowestTime,
		rounds,
		players: players
	}

	this.emit('render-time', info);
}

/**
 * Handle user disconnecting
 */
function handleDisconnect() {
	debug(`Socket ${players[this.id]} left the game`);

	// broadcast to all connected sockets that this player has left the chat
	if (players[this.id]) {
		this.broadcast.emit('player-disconnected', players[this.id]);
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

	// emit online players to all connected sockets
	 this.broadcast.emit('online-players', getOnlinePlayers());
}

/**
 * Handle and start the game
 */
function handleStartGame () {
	onlinePlayers = getOnlinePlayers();

	debug(`${onlinePlayers} with socket id: ${this.id} started the game`)

	playerReady += 1;
	console.log('playerReady', playerReady)

	if(playerReady === 2) {
		rounds += 1;

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
	io = this;

	socket.on('compare-click', handleCompareClick);

	socket.on('disconnect', handleDisconnect);

	socket.on('start-game', handleStartGame);

	socket.on('register-player', handleRegisterPlayer);
}
