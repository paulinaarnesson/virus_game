/**
 * Socket controller
 */

const debug = require('debug')('virus_game:socket_controller');

const players = {};
let startTime = null;

/**
 * handle and compare click time to start time
 */
function handleCompareClick() {
	const clickTime = Date.now();
	const differenceTime = startTime - clickTime;
	console.log(`${players[this.id]} managed to click the virus in ${differenceTime} time`);
}

/**
 * Handle user disconnecting
 */
function handleDisconnect() {
	debug(`Socket ${this.id} left the chat :(`);

	// broadcast to all connected sockets that this player has left the chat
	if (players[this.id]) {
		this.broadcast.emit('player-disconnected', players[this.id]);
	}

	// remove player from list of connected players
	delete players[this.id];
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
	debug("Player connected to the game", player_name);
	players[this.id] = player_name;
	callback({
		joinGame: true,
		onlinePlayers: getOnlinePlayers(),
	});

	// emit to all connected sockets
	this.emit('player-connected', player_name);

	// emit online players to all connected sockets
	 this.broadcast.emit('online-players', getOnlinePlayers());
}

/**
 * Handle and start the game
 */
function handleStartGame(){
	startTime = Date.now();
	this.emit('game-started');
}

module.exports = function(socket) {
	debug(`Client ${socket.id} connected!`);

	socket.on('compare-click', handleCompareClick);

	socket.on('disconnect', handleDisconnect);

	socket.on('start-game', handleStartGame);

	socket.on('register-player', handleRegisterPlayer);
}
