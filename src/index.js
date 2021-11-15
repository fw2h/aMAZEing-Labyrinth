const tableArea = document.querySelector("#tablearea");
const arrowArea = document.querySelector("#arrows");
const outArea = document.querySelector("#outarea");

const stats = document.querySelector("#stats");
const game = document.querySelector("#game");
const menu = document.querySelector("#menu");
const desc = document.querySelector("#desc");

const newgame = document.querySelector("#newgame");
const restart = document.querySelector("#restart");
const quit = document.querySelector("#quit");
const gamedesc = document.querySelector("#gamedesc");

const playerInput = document.querySelector("#playernum");
const treasureInput = document.querySelector("#treasurenum");

const winner = document.querySelector("#winner");

let numberOfPlayers = 2;
let numberOfTreasure = 2;
//MENU

newgame.addEventListener("click", newGame);
restart.addEventListener("click", newGame);
window.addEventListener("resize", render);
quit.addEventListener("click", quitGame);
gamedesc.addEventListener("click", gameDesc);

playerInput.addEventListener("input", changeInputPlayer);
treasureInput.addEventListener("input", changeInputTreasure);

function changeInputTreasure(e) {
    n = Number(e.target.value);
    if (!isNaN(n)) {
        if (n < 1 || n > 24 / numberOfPlayers) {
            e.target.value = 24 / numberOfPlayers;
            numberOfTreasure = 24 / numberOfPlayers;
        } else {
            numberOfTreasure = n;
        }

    } else {
        e.target.value = 2;
    }
}

function changeInputPlayer(e) {
    let n = Number(e.target.value);
    if (!isNaN(n)) {
        if (n < 1 || n > 4) {
            e.target.value = 2;
            numberOfPlayers = 2;
        } else {
            numberOfPlayers = n;
        }

    } else {
        e.target.value = 2;
    }
    if (treasureInput.value > 24 / numberOfPlayers) {
        treasureInput.value = 24 / numberOfPlayers;
        numberOfTreasure = 24 / numberOfPlayers;
    }
}

function gameDesc(e) {
    if (desc.style.display == "none") {
        desc.style.display = "block";
    } else {
        desc.style.display = "none";
    }
}

function quitGame() {
    menu.style.display = "block";
    game.style.display = "none";
    desc.style.display = "none";
}

function newGame() {
    menu.style.display = "none";
    desc.style.display = "none";
    game.style.display = "block";
    startGame();
}


// GAME

//constans
const gameSize = 7;
const type1 = 15;
const type2 = 13;
const type3 = 6;
const colors = ["red", "blue", "green", "indigo"];

//game
let gameBoard = [];
let outside = null;
let unusableArrow = null;
let gameEnded = false;

//player
let players = [];
let playerIndex = 0;
let canStep = false;
let avaiableElems = [];




class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.treasures = [];
        this.pos = [];
        this.startPos = [];
    }
}

class Treasure {
    constructor(pos, player) {
        this.pos = pos;
        this.player = player;
    }
}


class Elem {
    constructor(type, deg) {
        this.type = type; //1,2,3
        this.deg = deg; //0(0) 1(90) 2(180) 3(270)
        this.players = [];
        this.treasure = null;
    }

    rotate(n) {
        this.deg += n;
        this.deg = this.deg % 4;
    }

    getAvaiableNeighbors(i, j) {
        let list = [];
        if (this.type == 1) {
            if (this.deg == 0) {
                list = [
                    [0, 1],
                    [1, 0]
                ];
            } else if (this.deg == 1) {
                list = [
                    [1, 0],
                    [0, -1]
                ];
            } else if (this.deg == 2) {
                list = [
                    [0, -1],
                    [-1, 0]
                ];
            } else if (this.deg == 3) {
                list = [
                    [-1, 0],
                    [0, 1]
                ];
            }
        } else if (this.type == 2) {
            if (this.deg == 0 || this.deg == 2) {
                list = [
                    [0, 1],
                    [0, -1]
                ];
            } else if (this.deg == 1 || this.deg == 3) {
                list = [
                    [1, 0],
                    [-1, 0]
                ];
            }
        } else if (this.type == 3) {
            if (this.deg == 0) {
                list = [
                    [0, -1],
                    [-1, 0],
                    [0, 1]
                ];
            }
            if (this.deg == 1) {
                list = [
                    [-1, 0],
                    [0, 1],
                    [1, 0]
                ];
            }
            if (this.deg == 2) {
                list = [
                    [0, 1],
                    [1, 0],
                    [0, -1]
                ];
            }
            if (this.deg == 3) {
                list = [
                    [1, 0],
                    [0, -1],
                    [-1, 0]
                ];
            }
        }
        let l = list.filter(function(item) {
            return !((item[0] + i) < 0 || (item[0] + i) > 6 || (item[1] + j) < 0 || (item[1] + j) > 6);
        })
        return l;
    }
}

function startGame() {
    setProperties();
    initPlayers();
    initTreasures();
    fillBoard();
    placePT();
    render();
}

function setProperties() {
    winner.style.display = "none";
    gameBoard = [];
    outside = null;
    unusableArrow = null;
    gameEnded = false;
    players = [];
    playerIndex = 0;
    canStep = false;
    avaiableElems = [];
}

function initPlayers() {
    players = new Array(numberOfPlayers);

    for (let i = 0; i < numberOfPlayers; i++) {
        players[i] = new Player(i, colors[i]);
    }
}

function initTreasures() {
    let randPositions = randMatrixPositions(gameSize);
    for (let i = 0; i < numberOfPlayers; i++) {
        players[i].treasures = new Array(numberOfTreasure);

        for (let j = 0; j < numberOfTreasure; j++) {
            players[i].treasures[j] = new Treasure(randPositions.shift(), players[i]);
        }
    }
}

function randMatrixPositions(matrixSize) {
    let temp = [];
    for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
            if (!(i == 0 && j == 0 || i == 0 && j == (matrixSize - 1) || i == (matrixSize - 1) && j == 0 || i == (matrixSize - 1) && j == (matrixSize - 1))) {
                temp.push([i, j]);
            }
        }
    }
    temp.sort(() => (Math.random() > .5) ? 1 : -1);
    return temp;

}

function placePT() {
    let corners = [
        [0, 0],
        [0, 6],
        [6, 0],
        [6, 6]
    ];
    for (let i = 0; i < numberOfPlayers; i++) {
        gameBoard[corners[i][0]][corners[i][1]].players.push(players[i]);
        players[i].pos = corners[i];
        players[i].startPos = corners[i];

        gameBoard[players[i].treasures[0].pos[0]][players[i].treasures[0].pos[1]].treasure = players[i].treasures[0];
    }
}

function fillBoard() {
    gameBoard = new Array(7);

    for (let i = 0; i < gameSize; i++) {
        let row = new Array(7).fill(null);
        gameBoard[i] = row;
    }

    gameBoard[0][0] = new Elem(1, 0);
    gameBoard[0][2] = new Elem(3, 2);
    gameBoard[0][4] = new Elem(3, 2);
    gameBoard[0][6] = new Elem(1, 1);

    gameBoard[2][0] = new Elem(3, 1);
    gameBoard[2][2] = new Elem(3, 1);
    gameBoard[2][4] = new Elem(3, 2);
    gameBoard[2][6] = new Elem(3, 3);

    gameBoard[4][0] = new Elem(3, 1);
    gameBoard[4][2] = new Elem(3, 0);
    gameBoard[4][4] = new Elem(3, 3);
    gameBoard[4][6] = new Elem(3, 3);

    gameBoard[6][0] = new Elem(1, 3);
    gameBoard[6][2] = new Elem(3, 0);
    gameBoard[6][4] = new Elem(3, 0);
    gameBoard[6][6] = new Elem(1, 2);

    let rand = new Array(type1).fill(1).concat(new Array(type2).fill(2), new Array(type3).fill(3)).sort(() => (Math.random() > .5) ? 1 : -1);

    outside = new Elem(rand.shift(), Math.floor(Math.random() * 4));
    for (let i = 0; i < gameSize; i++) {
        for (let j = 0; j < gameSize; j++) {
            if (gameBoard[i][j] == null) {
                gameBoard[i][j] = new Elem(rand.shift(), Math.floor(Math.random() * 4));
            }
        }
    }
}

function rotateElem(e) {
    if (!gameEnded) {
        outside.rotate(1);
        render();
    }

}

function nextPlayer() {
    playerIndex += 1;
    playerIndex %= numberOfPlayers;
}

function endGame(n) {
    winner.innerHTML = `P${players[n].name} játékos nyerte a játékot!`;
    winner.style.display = "block";


}

function recursiveSteps(i, j) {
    avaiableElems.push([i, j]);

    let sides = gameBoard[i][j].getAvaiableNeighbors(i, j);
    for (let k = 0; k < sides.length; k++) {
        if (JSON.stringify(avaiableElems).indexOf(JSON.stringify([i + sides[k][0], j + sides[k][1]])) == -1) {
            let l = gameBoard[i + sides[k][0]][j + sides[k][1]].getAvaiableNeighbors(i + sides[k][0], j + sides[k][1]);
            for (let n = 0; n < l.length; n++) {
                if (l[n][0] + sides[k][0] == 0 && l[n][1] + sides[k][1] == 0) {
                    recursiveSteps(i + sides[k][0], j + sides[k][1]);
                    break;
                }
            }
        }
    }
}

function getSteppableElems(player) {
    avaiableElems = [];
    recursiveSteps(player.pos[0], player.pos[1]);
}

function checkPlayerAndTreasure() {
    for (let i = 0; i < numberOfPlayers; i++) {
        if (gameBoard[players[i].pos[0]][players[i].pos[1]].treasure == players[i].treasures[0]) {
            gameBoard[players[i].pos[0]][players[i].pos[1]].treasure = null;
            players[i].treasures.shift();
            if (players[i].treasures.length > 0) {
                gameBoard[players[i].treasures[0].pos[0]][players[i].treasures[0].pos[1]].treasure = players[i].treasures[0];
            } else {
                if (JSON.stringify(players[i].pos) == JSON.stringify(players[i].startPos)) {
                    gameEnded = true;
                    endGame(i);
                }
            }

        }

    }
}

function movePlayer(e) {
    if (!gameEnded) {
        canStep = false;
        let i = e.target.parentElement.parentElement.rowIndex;
        let j = e.target.parentElement.cellIndex;
        let noPlayer = gameBoard[players[playerIndex].pos[0]][players[playerIndex].pos[1]].players.filter(p => p.name !== players[playerIndex].name);
        gameBoard[players[playerIndex].pos[0]][players[playerIndex].pos[1]].players = noPlayer;
        players[playerIndex].pos = [i, j];
        gameBoard[i][j].players.push(players[playerIndex]);
        nextPlayer();
        render();
    }

}

function arrowClick(e) {
    if (!gameEnded && !canStep && e.target.id != unusableArrow) {
        canStep = true;
        const a = e.target.id.split("_");
        if (a[0] == "l") {
            unusableArrow = `r_${a[1]}`;
            temp = outside;
            outside = gameBoard[Number(a[1])][6];
            if (outside.players.length != 0) {
                temp.players = outside.players;
                outside.players = [];
            }
            for (let i = 1; i < (gameSize); i++) {
                gameBoard[Number(a[1])][gameSize - i] = gameBoard[Number(a[1])][gameSize - i - 1];
                if (gameBoard[Number(a[1])][gameSize - i].players.length != 0) {
                    for (const p of gameBoard[Number(a[1])][gameSize - i].players) {
                        p.pos[1] += 1;
                    }
                }

            }
            gameBoard[Number(a[1])][0] = temp;
            for (const p of gameBoard[Number(a[1])][0].players) {
                p.pos[1] = 0;
            }

        } else if (a[0] == "r") {
            unusableArrow = `l_${a[1]}`;
            temp = outside;
            outside = gameBoard[Number(a[1])][0];
            if (outside.players.length != 0) {
                temp.players = outside.players;
                outside.players = [];
            }
            for (let i = 0; i < (gameSize - 1); i++) {
                gameBoard[Number(a[1])][i] = gameBoard[Number(a[1])][i + 1];
                if (gameBoard[Number(a[1])][i].players.length != 0) {
                    for (const p of gameBoard[Number(a[1])][i].players) {
                        p.pos[1] -= 1;
                    }
                }
            }
            gameBoard[Number(a[1])][6] = temp;
            for (const p of gameBoard[Number(a[1])][6].players) {
                p.pos[1] = 6;
            }
        } else if (a[0] == "t") {
            unusableArrow = `b_${a[1]}`;
            temp = outside;
            outside = gameBoard[6][Number(a[1])];
            if (outside.players.length != 0) {
                temp.players = outside.players;
                outside.players = [];
            }
            for (let i = 1; i < (gameSize); i++) {
                gameBoard[gameSize - i][Number(a[1])] = gameBoard[gameSize - i - 1][Number(a[1])];
                if (gameBoard[gameSize - i][Number(a[1])].players.length != 0) {
                    for (const p of gameBoard[gameSize - i][Number(a[1])].players) {
                        p.pos[0] += 1;
                    }
                }
            }
            gameBoard[0][Number(a[1])] = temp;
            for (const p of gameBoard[0][Number(a[1])].players) {
                p.pos[0] = 0;
            }
        } else if (a[0] == "b") {
            unusableArrow = `t_${a[1]}`;
            temp = outside;
            outside = gameBoard[0][Number(a[1])];
            if (outside.players.length != 0) {
                temp.players = outside.players;
                outside.players = [];
            }
            for (let i = 0; i < (gameSize - 1); i++) {
                gameBoard[i][Number(a[1])] = gameBoard[i + 1][Number(a[1])];
                if (gameBoard[i][Number(a[1])].players.length != 0) {
                    for (const p of gameBoard[i][Number(a[1])].players) {
                        p.pos[0] -= 1;
                    }
                }
            }
            gameBoard[6][Number(a[1])] = temp;
            for (const p of gameBoard[6][Number(a[1])].players) {
                p.pos[0] = 6;
            }
        }
        render();
    }
}



function updateStats() {
    // stats
    stats.innerHTML = "";
    let gstats = document.createElement("div");
    gstats.classList.add("gamestats");
    let p = document.createElement("p");
    p.innerHTML = `Aktuális játékos: P${players[playerIndex].name}`;
    p.style.color = players[playerIndex].color;
    gstats.appendChild(p);
    stats.appendChild(gstats);

    for (const player of players) {
        let ps = document.createElement("div");
        ps.classList.add("gamestats");
        p = document.createElement("p");
        p.innerHTML = `Név: P${player.name}`;
        p.style.color = player.color;
        ps.appendChild(p);
        p = document.createElement("p");
        p.innerHTML = `Hátralévő kincs: ${player.treasures.length}`;
        p.style.color = player.color;
        ps.appendChild(p);
        p = document.createElement("p");
        p.innerHTML = `Megszerzett kincs: ${numberOfTreasure - player.treasures.length}`;
        p.style.color = player.color;
        ps.appendChild(p);
        stats.appendChild(ps);
    }
}

function render() {
    if (game.style.display == "none") {
        console.log("asd");
        return;
    }
    checkPlayerAndTreasure();
    getSteppableElems(players[playerIndex]);
    tableArea.innerHTML = "";

    for (let i = 0; i < gameSize; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < gameSize; j++) {
            let col = document.createElement("td");
            if (gameBoard[i][j] != null) {
                col.style.backgroundImage = `url('${gameBoard[i][j].type}.png')`;
                col.style.backgroundSize = "cover";
                col.style.transform = `rotate(${gameBoard[i][j].deg * 90}deg)`;
                col.classList.add("elem");
            }
            row.appendChild(col);
            if (gameBoard[i][j].players.length != 0 || gameBoard[i][j].treasure != null) {
                let div = document.createElement("div");
                div.classList.add("container");
                div.style.transform = `rotate(${-gameBoard[i][j].deg * 90}deg)`;
                for (let k = 0; k < gameBoard[i][j].players.length; k++) {
                    let box = document.createElement("div");
                    box.classList.add("box");
                    box.innerHTML = `P${gameBoard[i][j].players[k].name}`;
                    box.style.color = gameBoard[i][j].players[k].color;
                    box.style.borderColor = gameBoard[i][j].players[k].color;
                    div.appendChild(box);
                }
                if (gameBoard[i][j].treasure != null) {
                    let box = document.createElement("div");
                    box.classList.add("box");
                    box.innerHTML = "K";
                    box.style.color = gameBoard[i][j].treasure.player.color;
                    box.style.borderColor = gameBoard[i][j].treasure.player.color;
                    div.appendChild(box);
                }

                col.appendChild(div);

            }
            if (canStep) {
                if (JSON.stringify(avaiableElems).indexOf(JSON.stringify([i, j])) != -1) {
                    let div = document.createElement("div");
                    div.classList.add("step");
                    div.addEventListener("click", movePlayer);
                    col.appendChild(div);
                }
            }
        }
        tableArea.appendChild(row);
    }




    outArea.innerHTML = "";
    let div = document.createElement("div");
    if (outside != null) {
        div.style.backgroundImage = `url('${outside.type}.png')`;
        div.style.backgroundSize = "cover";
        div.style.transform = `rotate(${outside.deg * 90}deg)`;
        div.classList.add("elem");

        if (outside.treasure != null) {
            let out = document.createElement("div");

            out.classList.add("container");
            out.style.transform = `rotate(${-outside.deg * 90}deg)`;

            let box = document.createElement("div");
            box.classList.add("box");
            box.innerHTML = "K";
            box.style.color = outside.treasure.player.color;
            box.style.borderColor = outside.treasure.player.color;
            out.appendChild(box);
            div.appendChild(out);
        }

    }

    outArea.appendChild(div);

    arrowArea.innerHTML = "";

    for (let i = 0; i < 3; i++) { //bal
        const rect = tableArea.children[i * 2 + 1].children[0].getBoundingClientRect();
        const arrow = document.createElement("div");
        arrow.classList.add("arrow");
        arrow.style.left = `${rect.left  - 30 - 10}px`;
        arrow.style.top = `${rect.top + rect.height / 2 - 15}px`;
        arrow.style.transform = `rotate(${1 * 90}deg)`;
        arrow.id = `l_${i * 2 + 1}`;
        arrow.addEventListener("click", arrowClick);
        arrowArea.appendChild(arrow);
    }
    for (let i = 0; i < 3; i++) { //jobb
        const rect = tableArea.children[i * 2 + 1].children[gameSize - 1].getBoundingClientRect();
        const arrow = document.createElement("div");
        arrow.classList.add("arrow");
        arrow.style.left = `${rect.left + rect.width + 10}px`;
        arrow.style.top = `${rect.top + rect.height / 2  - 15}px`;
        arrow.style.transform = `rotate(${3 * 90}deg)`;
        arrow.id = `r_${i * 2 + 1}`;
        arrow.addEventListener("click", arrowClick);
        arrowArea.appendChild(arrow);
    }
    for (let i = 0; i < 3; i++) { //fent
        const rect = tableArea.children[0].children[i * 2 + 1].getBoundingClientRect();
        const arrow = document.createElement("div");
        arrow.classList.add("arrow");
        arrow.style.left = `${rect.left + rect.width/2 - 15}px`;
        arrow.style.top = `${rect.top - 30 - 10}px`;
        arrow.style.transform = `rotate(${2 * 90}deg)`;
        arrow.id = `t_${i * 2 + 1}`;
        arrow.addEventListener("click", arrowClick);
        arrowArea.appendChild(arrow);
    }
    for (let i = 0; i < 3; i++) { //lent
        const rect = tableArea.children[gameSize - 1].children[i * 2 + 1].getBoundingClientRect();
        const arrow = document.createElement("div");
        arrow.classList.add("arrow");
        arrow.style.left = `${rect.left + rect.width/2 - 15}px`;
        arrow.style.top = `${rect.top + rect.height + 10}px`;
        arrow.style.transform = `rotate(${0 * 90}deg)`;
        arrow.id = `b_${i * 2 + 1}`;
        arrow.addEventListener("click", arrowClick);
        arrowArea.appendChild(arrow);
    }

    document.querySelector("#outarea div").addEventListener("click", rotateElem);
    updateStats();
}