const socket = io();

const player_name_form = document.querySelector('#player_name-form');
const sign_in = document.querySelector('#sign_in');
const virus = document.querySelector('#virus');
const wrapper = document.querySelector('#wrapper');
const playerContainer = document.querySelector('#playerContainer');

const handleGameStarted = (virusObject) => {
	setTimeout(() => {
		document.querySelector('#loadingVirus').classList.add('hide');
		virus.classList.remove('hide');
		virus.style.top = `${virusObject.topCoordinates}px`;
		virus.style.right = `${virusObject.rightCoordinates}px`;
	}, virusObject.setTime);
}

const renderTime = (fastestPlayer) => {

	const playerEl = document.querySelector('.player');

	playerEl.innerHTML += `<span id="playerTime">${fastestPlayer.clickTime}</span>`;

	if(fastestPlayer.rounds === 10){
		alert('Winner is !!!')
	}else{
		socket.emit('start-game');
	}
}

const updateOnlinePlayersAndStart = (players) => {
	playerContainer.innerHTML = players.map(player => `<p class="player">${player}</p>`).join("");

	if(players.length === 2){
		socket.emit('start-game');
	}
}

virus.addEventListener('click', () => {
	virus.classList.add('hide');
	document.querySelector('#loadingVirus').classList.remove('hide');
	socket.emit('compare-click');
});

player_name_form.addEventListener('submit', e => {
	e.preventDefault();

	player_name = document.querySelector('#player_name').value;

	socket.emit('register-player', player_name, (status) => {

		if (status.joinGame) {
			sign_in.classList.add('hide');
			wrapper.classList.remove('hide');

			updateOnlinePlayersAndStart(status.onlinePlayers);
		}
	});
});

socket.on('game-started', (virusObject) => {
	handleGameStarted(virusObject);
});

socket.on('online-players', (players) => {
	updateOnlinePlayersAndStart(players);
});

socket.on('render-time', (differenceTime) => {
	renderTime(differenceTime);
});

socket.on('player-disconnected', (player) => {
	alert(`Your opponent ${player} gave up and you won the game!`);

	sign_in.classList.remove('hide');
	wrapper.classList.add('hide');
});

// socket.on('player-connected', player_name => {
// 	addPlayerToList(player_name);
// });

// const startGame = (players) => {
// 	socket.emit('start-game', players, (callback) => {
// 		setTimeout(() => {
// 			document.querySelector('#loadingVirus').classList.add('hide');
// 			virus.classList.remove('hide');
// 			virus.style.top = `${callback.topCoordinates}px`;
// 			virus.style.right = `${callback.rightCoordinates}px`;
// 		}, callback.setTime);
// 	});
// }

// document.querySelector('#restartButton').addEventListener('click', () => {
// 	socket.emit('start-game');
// });


// const addPlayerToList = (player) => {
// 	playerContainer.innerHTML += `<p id="player">${player}</p>`;
// }

