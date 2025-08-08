const labyrinth = document.getElementById("labyrinth");
const timerDisplay = document.getElementById("timeLeft");
const messageDisplay = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const controls = document.getElementById("controls");

const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const ROWS = 8;
const COLS = 8;

let labyrinthMap = [];
let playerPos = { row: 1, col: 1 };
let timer = 60;
let timerInterval;
let darknessTimerId;
let inDarkness = false;
let darknessVisited = false;

// Labyrinth-Layout
// W = wall, F = floor, R = red trap, B = black trap, P = purple trap, S = Start, E = End
const mapTemplate = [
  ['W','W','W','W','W','W','W','W'],
  ['W','S','F','F','R','F','B','W'],
  ['W','F','W','F','W','F','F','W'],
  ['W','F','W','P','W','F','W','W'],
  ['W','F','F','F','F','F','F','W'],
  ['W','B','W','W','W','W','F','W'],
  ['W','F','F','F','P','F','E','W'],
  ['W','W','W','W','W','W','W','W']
];

function createLabyrinth() {
  labyrinth.innerHTML = "";
  labyrinthMap = JSON.parse(JSON.stringify(mapTemplate)); // tiefe Kopie

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      const cellType = labyrinthMap[r][c];

      switch(cellType) {
        case 'W':
          cellDiv.classList.add("wall");
          break;
        case 'F':
          cellDiv.classList.add("floor");
          break;
        case 'R':
          cellDiv.classList.add("trap-red");
          break;
        case 'B':
          cellDiv.classList.add("trap-black");
          break;
        case 'P':
          cellDiv.classList.add("trap-purple");
          break;
        case 'S':
          cellDiv.classList.add("start");
          playerPos = { row: r, col: c };
          break;
        case 'E':
          cellDiv.classList.add("end");
          break;
      }
      cellDiv.id = `cell-${r}-${c}`;
      labyrinth.appendChild(cellDiv);
    }
  }
  updatePlayerPosition();
}

// Spieler anzeigen
function updatePlayerPosition() {
  // Entferne bisherigen Spieler
  document.querySelectorAll(".cell.player").forEach(c => c.classList.remove("player"));

  const cell = document.getElementById(`cell-${playerPos.row}-${playerPos.col}`);
  if (cell) cell.classList.add("player");
}

// Prüft, ob ein Feld begehbar ist
function isWalkable(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
  return labyrinthMap[r][c] !== 'W';
}

// Spieler bewegen
function movePlayer(dr, dc) {
  const newRow = playerPos.row + dr;
  const newCol = playerPos.col + dc;

  if (!isWalkable(newRow, newCol)) return;

  playerPos = { row: newRow, col: newCol };
  updatePlayerPosition();

  const cellType = labyrinthMap[newRow][newCol];

  // Effekte Fallen
  if (cellType === 'R') {
    // rote Falle: zurück zum Start
    playerPos = findStart();
    updatePlayerPosition();
    showMessage("Hit red trap! Back to start.");
  } else if (cellType === 'P') {
    // lila Falle: 5 Sekunden abziehen
    timer -= 5;
    if (timer < 0) timer = 0;
    updateTimerDisplay();
    showMessage("Purple trap! -5 seconds.");
  } else if (cellType === 'B') {
    // schwarze Falle: Sicht einschränken 5 Sekunden
    startDarknessEffect();
    showMessage("Entered dark trap!");
  } else {
    clearMessage();
  }

  onPlayerMoveUpdateDarkness();

  checkVictory();
}

function findStart() {
  for (let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      if(labyrinthMap[r][c] === 'S') return { row:r, col:c };
    }
  }
  return { row:1, col:1 };
}

// Nachricht zeigen
function showMessage(msg) {
  messageDisplay.textContent = msg;
}

// Nachricht löschen
function clearMessage() {
  messageDisplay.textContent = "";
}

// Timer starten
function startTimer() {
  timer = 60;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timer--;
    if(timer <= 10){
      timerDisplay.classList.add("blink");
    } else {
      timerDisplay.classList.remove("blink");
    }
    updateTimerDisplay();

    if (timer <= 0) {
      clearInterval(timerInterval);
      gameOver(false);
    }
  }, 1000);
}

// Timer aktualisieren
function updateTimerDisplay() {
  timerDisplay.textContent = timer;
}

// Spiel starten
function startGame() {
  startBtn.style.display = "none";
  retryBtn.style.display = "none";
  controls.style.display = "block";
  labyrinth.classList.add("active");
  createLabyrinth();
  startTimer();
  clearMessage();
  inDarkness = false;
  darknessVisited = false;
  clearDarknessEffect();
}

// Spiel beenden
function gameOver(success) {
  clearInterval(timerInterval);
 
