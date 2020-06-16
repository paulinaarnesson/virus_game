const socket = io();

const alertWinner = document.querySelector('.alert');
const loading = document.querySelector('#loadingVirus');
const playerContainer = document.querySelector('#playerContainer');
const player_name_form = document.querySelector('#player_name_form');
const roundsContainer = document.querySelector('#roundsContainer');
const sign_in = document.querySelector('#sign_in');
const virus = document.querySelector('#virus');
const wrapper = document.querySelector('#wrapper');

let playersScoreArray = [];

const handleGameStarted = (virusObject) => {
	setTimeout(() => {
		loading.classList.add('hide');
		virus.classList.remove('hide');
		virus.style.top = `${virusObject.topCoordinates}px`;
		virus.style.right = `${virusObject.rightCoordinates}px`;
	}, virusObject.setTime);
}

const handleRenderTimeAndScore = (scoreArray) => {
	let winner = scoreArray[scoreArray.length -1];

	playersScoreArray.map(player => {
		if(player.name === winner.name){
			player.score += 1;
			document.querySelector(`.${player.name}`).innerHTML = `<span>${player.score}</span>`;
		}
	});

	roundsContainer.innerHTML = `
		<p>${scoreArray.length}</p>
		<p><strong>This round</strong></p>
		<p id="playerTime">${winner.name}: ${winner.clickTime}</p>
	`;

	if(scoreArray.length === 10){
		socket.emit('find-winner', playersScoreArray);
	}else{
		socket.emit('start-game');
	}
}

const handleRenderWinner = (winner) => {
	alertWinner.innerHTML = winner;
 	alertWinner.classList.remove('hide');
 	loading.classList.add('hide');
}

const updateOnlinePlayersAndStart = (players) => {
	alertWinner.classList.add('hide');
	roundsContainer.innerHTML = '';
	loading.classList.remove('hide');
	virus.classList.add('hide');

	playerContainer.innerHTML = players.map(player => `<p id="player">${player}<span class=${player}>0</span></p>`).join("");

	if(players.length === 2){
		//Save players for future in front end
		playersScoreArray = players.map(player => {
			return {
				name: player,
				score: 0,
			}
		});

		socket.emit('start-game');
	}
}

virus.addEventListener('click', () => {
	virus.classList.add('hide');
	loading.classList.remove('hide');
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

socket.on('player-disconnected', (player) => {
	playersScoreArray = [];

	alert(`Your opponent ${player} gave up and you won the game!`);

	sign_in.classList.remove('hide');
	wrapper.classList.add('hide');
});

socket.on('render-timeAndScore', (differenceTime) => {
	handleRenderTimeAndScore(differenceTime);
});

socket.on('render-winner', (winner) => {
	handleRenderWinner(winner);
});
