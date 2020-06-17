/**
 * Virus Game front end
 */

const socket = io();

//Save html in variables that needs in several places
const alertWinner = document.querySelector('.alert');
const loading = document.querySelector('#loadingVirus');
const playerContainer = document.querySelector('#playerContainer');
const player_name_form = document.querySelector('#player_name_form');
const roundsContainer = document.querySelector('#roundsContainer');
const sign_in = document.querySelector('#sign_in');
//const stopWatch = document.querySelector('#stopWatch');
const virus = document.querySelector('#virus');
const wrapper = document.querySelector('#wrapper');

//Array to save object with name of user and score
let playersScoreArray = [];
//let runClock;

const getMeasures = () => {
	//Get game area size so the server can send the virus inside game area
	const gameArea = document.querySelector('#game_area');
	const gameAreaObject = {
		width: gameArea.clientWidth,
		height: gameArea.clientHeight,
	}
	return gameAreaObject;
}

const handleGameStarted = (virusObject) => {
	setTimeout(() => {
		//Hide spinner and show virus
		loading.classList.add('hide');
		virus.classList.remove('hide');
		//Add styles with coordinates to Virus and set timeout
		virus.style.top = `${virusObject.topCoordinates}px`;
		virus.style.bottom = `${virusObject.bottomCoordinates}px`;
		virus.style.right = `${virusObject.rightCoordinates}px`;
		virus.style.left = `${virusObject.leftCoordinates}px`;

		//Start timer
		//startTimer();
	}, virusObject.setTime);
}

// const stopTimer = () => {
// 	console.log('timer stopped');
// 	clearInterval(runClock);
// }

// const startTimer = () => {
// 	console.log('timer started');
// 	runClock = setInterval(handleTimer, 10);
// }

// const handleTimer = () => {
// 	let counter = 0;
// 	console.log('handle timer', counter);
// 	stopWatch.innerHTML = moment().minute(0).second(0).milliseconds(counter++).format('mm : ss : SSS');
// }

const handlePlayerDisconnected = (player) => {
	//Empty array with score
	playersScoreArray = [];
	//Alert a message
	alert(`Your opponent ${player} gave up and you won the game!`);
	//And show first page
	sign_in.classList.remove('hide');
	wrapper.classList.add('hide');
}

const handleRenderTimeAndScore = (playerObject) => {
	//Get the last winner and loser in the arrays
	let winner = playerObject.winner[playerObject.winner.length -1];

	let loser = playerObject.loser[playerObject.loser.length -1];

	//Loop the array with players and their score to find the number of scores for this winner and render it!
	playersScoreArray.map(player => {
		if(player.name === winner.name){
			player.score += 1;
			document.querySelector(`.${player.name}`).innerHTML = `<span>${player.score}</span>`;
		}
	});

	//Render total of rounds, and this rounds winner and loser.
	roundsContainer.innerHTML = `
		<p>${playerObject.winner.length}</p>
		<p><strong>This round</strong></p>
		<p id="playerTime">${winner.name}: ${winner.clickTime}</p>
		<p id="playerTime">${loser.name}: ${loser.clickTime}</p>
	`;

	//Check if 10 rounds
	if(playerObject.winner.length === 10){
		socket.emit('find-winner', playersScoreArray);
	}else{
		socket.emit('start-game', getMeasures());
	}
}

const handleRenderWinner = (winner) => {
	//render winner and hide spinner
	alertWinner.innerHTML = winner;
 	alertWinner.classList.remove('hide');
 	loading.classList.add('hide');
}

const handleWaitPlayer = () => {
	//Alert when a third player or more trying to connect
	alert('Sorry, there is already two players. Please try again later!');
}

const updateOnlinePlayersAndStart = (players) => {
	//Empty old information in DOM
	alertWinner.classList.add('hide');
	roundsContainer.innerHTML = '';
	//Show spinner while waiting for player and hide Virus
	loading.classList.remove('hide');
	virus.classList.add('hide');

	//Render online players to DOM
	playerContainer.innerHTML = players.map(player => `<p id="player">${player}<span class=${player}>0</span></p>`).join("");

	//Start game when 2 players are "online"
	if(players.length === 2){
		//Save players in object with score for future in front end
		playersScoreArray = players.map(player => {
			return {
				name: player,
				score: 0,
			}
		});
		socket.emit('start-game', getMeasures());
	}
}

/**
 * EventListeners
 */

 //Listen to click on virus
virus.addEventListener('click', () => {
	virus.classList.add('hide');
	loading.classList.remove('hide');
	//stopTimer();
	socket.emit('compare-click');
});

//listen to submit in form when adding player nickname
player_name_form.addEventListener('submit', e => {
	e.preventDefault();

	//Get value of input and save
	player_name = document.querySelector('#player_name').value;

	//Register player and send nickname and a callback
	socket.emit('register-player', player_name, (status) => {

		//if joinGame is true show game and update players in list
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
	handlePlayerDisconnected(player);
});

socket.on('render-timeAndScore', (differenceTime) => {
	handleRenderTimeAndScore(differenceTime);
});

socket.on('render-winner', (winner) => {
	handleRenderWinner(winner);
});

socket.on('wait-player', () => {
	handleWaitPlayer();
});
