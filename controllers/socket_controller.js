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
	const differenceTime = (clickTime-startTime) / 1000;
	console.log(`${players[this.id]} managed to click the virus in ${differenceTime} seconds`);
}

/**
 * Handle user disconnecting
 */
function handleDisconnect() {
	debug(`Socket ${players[this.id]} left the game`);

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
	debug(`${player_name} connected to the game`);
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
	const virusObject = {
		topCoordinates: Math.floor(Math.random()*(350-0)),//350
		rightCoordinates: Math.floor(Math.random()*(550-0)),//550
		setTime: Math.floor(Math.random()*10000),
	}
	startTime = Date.now();
	this.emit('game-started', virusObject);
}

module.exports = function(socket) {
	debug(`Client ${socket.id} connected!`);

	socket.on('compare-click', handleCompareClick);

	socket.on('disconnect', handleDisconnect);

	socket.on('start-game', handleStartGame);

	socket.on('register-player', handleRegisterPlayer);
}
