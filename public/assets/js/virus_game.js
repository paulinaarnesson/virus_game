const socket = io();

const player_name_form = document.querySelector('#player_name-form');
const sign_in = document.querySelector('#sign_in');
const virus = document.querySelector('#virus');
const wrapper = document.querySelector('#wrapper');

const addPlayerToList = (player) => {
	document.querySelector('#players').innerHTML += `<li id="player">${player}<span>Your time</span></li>`;
}

const updateOnlinePlayers = (players) => {
	document.querySelector('#players').innerHTML = players.map(player => `<li class="player">${player}<span>Your time</span></li>`).join("");

	if(players.length === 2){
		socket.emit('start-game');
	}
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

socket.on('game-started', (virusObject) => {
	setTimeout(() => {
		virus.classList.remove('hide');
		virus.style.top = `${virusObject.topCoordinates}px`;
		virus.style.right = `${virusObject.rightCoordinates}px`;
	}, virusObject.setTime);

	virus.addEventListener('click', () => {
		socket.emit('compare-click');
	});
});

socket.on('online-players', (players) => {
	updateOnlinePlayers(players);
});

socket.on('player-disconnected', (player) => {
	alert(`Your opponent ${player} gave up and you won the game!`);

	sign_in.classList.remove('hide');
	wrapper.classList.add('hide');
});

socket.on('player-connected', player_name => {
	addPlayerToList(player_name);
});




