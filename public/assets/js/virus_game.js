const socket = io();

const player_name_form = document.querySelector('#player_name-form');
const sign_in = document.querySelector('#sign_in');
const wrapper = document.querySelector('#wrapper');

const addPlayerToList = (player) => {
	document.querySelector('#players').innerHTML += `<li id="player">${player}</li>`;
}

const updateOnlinePlayers = (players) => {
	document.querySelector('#players').innerHTML = players.map(player => `<li class="player">${player}</li>`).join("");
}


player_name_form.addEventListener('submit', e => {
	e.preventDefault();

	player_name = document.querySelector('#player_name').value;

	socket.emit('register-player', player_name, (status) => {
		console.log("Server acknowledged the registration :D", status);

		if (status.joinGame) {
			sign_in.classList.add('hide');
			wrapper.classList.remove('hide');
		}
	});
});

socket.on('player-connected', player_name => {
	addPlayerToList(player_name);
});

socket.on('online-players', (players) => {
	updateOnlinePlayers(players);
});


