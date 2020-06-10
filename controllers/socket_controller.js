/**
 * Socket controller
 */

const debug = require('debug')('09-simple-chat:socket_controller');

const players = {};

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
	debug("Player '%s' connected to the game", player_name);
	players[this.id] = player_name;
	callback({
		joinGame: true,
		//usernameInUse: false,
		onlinePlayers: getOnlinePlayers(),
	});

	// emit to all connected sockets
	this.emit('player-connected', player_name);

	// emit online players to all connected sockets
	 this.broadcast.emit('online-players', getOnlinePlayers());
}

module.exports = function(socket) {
	debug(`Client ${socket.id} connected!`);

	socket.on('disconnect', () => {
		debug("Someone left the chat :(");
	});

	socket.on('register-player', handleRegisterPlayer);
}
