const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const gridSize = 20; // Size of each block
const columns = canvas.width / gridSize; // Number of columns
const rows = canvas.height / gridSize; // Number of rows

let dropInterval = 500; // Drop interval in m/s
let lastDropTime = Date.now(); // Last time the block was dropped
let fastDrop = false; // Flag for fast dropping
let score = 0;
let linesCleared = 0;
let isPaused = true;
let isGameOver = false;

const shapes = [
  [[1, 1, 1, 1]], // I
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // J
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // L
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
];

const colors = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
];

function randomShape() {
  const index = Math.floor(Math.random() * shapes.length);
  return {
    shape: shapes[index],
    color: colors[index],
  };
}

class Tetromino {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.position = { x: Math.floor(columns / 2), y: 0 }; // Start in the middle
  }

  draw() {
    context.fillStyle = this.color;
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col] === 1) {
          context.fillRect(
            (this.position.x + col) * gridSize,
            (this.position.y + row) * gridSize,
            gridSize,
            gridSize
          );
        }
      }
    }
  }

  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }

  rotate() {
    const newShape = [];
    for (let col = 0; col < this.shape[0].length; col++) {
      const newRow = [];
      for (let row = 0; row < this.shape.length; row++) {
        newRow.push(this.shape[this.shape.length - row - 1][col]);
      }
      newShape.push(newRow);
    }
    this.shape = newShape;
  }
}

const board = Array.from({ length: rows }, () => Array(columns).fill(0));

function isValidPosition(tetromino, dx = 0, dy = 0) {
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let col = 0; col < tetromino.shape[row].length; col++) {
      if (tetromino.shape[row][col] === 1) {
        const newX = tetromino.position.x + col + dx;
        const newY = tetromino.position.y + row + dy;

        if (
          newX < 0 ||
          newX >= columns ||
          newY >= rows ||
          (newY >= 0 && board[newY][newX] !== 0)
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

function addToBoard(tetromino) {
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let col = 0; col < tetromino.shape[row].length; col++) {
      if (tetromino.shape[row][col] === 1) {
        const x = tetromino.position.x + col;
        const y = tetromino.position.y + row;

        if (y >= 0 && x >= 0) {
          board[y][x] = tetromino.color;
        }
      }
    }
  }
}

function clearFullLines() {
  const fullRows = board.filter((row) => row.every((cell) => cell !== 0));
  const linesCleared = fullRows.length;

  if (linesCleared > 0) {
    board.splice(
      0,
      linesCleared,
      ...Array.from({ length: linesCleared }, () => Array(columns).fill(0))
    );
    score += linesCleared * 10; // Increase score by 10 per line
    dropInterval *= 0.95; // Speed up the game a bit
  }

  return linesCleared;
}

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (board[row][col] !== 0) {
        context.fillStyle = board[row][col];
        context.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
    }
  }
}

function gameLoop() {
  if (isPaused || isGameOver) return;

  const now = Date.now();
  const delta = now - lastDropTime;

  if (delta >= dropInterval) {
    if (isValidPosition(currentTetromino, 0, 1)) {
      currentTetromino.move(0, 1);
    } else {
      addToBoard(currentTetromino);
      const clearedLines = clearFullLines();
      linesCleared += clearedLines;

      document.getElementById("score").textContent = score;
      document.getElementById("lines").textContent = linesCleared;

      currentTetromino = new Tetromino(
        randomShape().shape,
        randomShape().color
      );

      if (!isValidPosition(currentTetromino)) {
        alert("Game Over");
        isGameOver = true;
        return;
      }
    }
    lastDropTime = now;
  }

  drawBoard(); // Redraw the board
  currentTetromino.draw(); // Draw the current Tetromino
  requestAnimationFrame(gameLoop); // Schedule the next frame
}

function resetGame() {
  score = 0;
  linesCleared = 0;
  dropInterval = 500; // Reset drop interval
  board.forEach((row) => row.fill(0));
  currentTetromino = new Tetromino(randomShape().shape, randomShape().color);
  isPaused = false; // Start the game
  isGameOver = false;
  document.getElementById("score").textContent = score;
  document.getElementById("lines").textContent = linesCleared;
  gameLoop(); // Start the game loop
}

document.getElementById("startStopButton").addEventListener("click", () => {
  if (isGameOver) {
    resetGame();
  } else {
    isPaused = !isPaused; // Toggle between pause/play
    if (!isPaused) {
      gameLoop(); // Resume the game loop
    }
  }
});

document.getElementById("pausePlayButton").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pausePlayButton").textContent = isPaused
    ? "Play"
    : "Pause";
  if (!isPaused) {
    gameLoop(); // Resume the game loop
  }
});

document.getElementById("resetButton").addEventListener("click", resetGame);

document.getElementById("rotateButton").addEventListener("click", () => {
  if (!isGameOver) {
    currentTetromino.rotate(); // Rotate the current Tetromino
  }
});

document.getElementById("leftButton").addEventListener("click", () => {
  if (!isGameOver && isValidPosition(currentTetromino, -1, 0)) {
    currentTetromino.move(-1, 0); // Move left
  }
});

document.getElementById("rightButton").addEventListener("click", () => {
  if (!isGameOver && isValidPosition(currentTetromino, 1, 0)) {
    currentTetromino.move(1, 0); // Move right
  }
});

document.getElementById("downButton").addEventListener("mousedown", () => {
  fastDrop = true; // Enable fast drop
});

document.getElementById("downButton").addEventListener("mouseup", () => {
  fastDrop = false; // Disable fast drop
});

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      document.getElementById("leftButton").click(); // Trigger Left movement
      break;
    case "ArrowRight":
      document.getElementById("rightButton").click(); // Trigger Right movement
      break;
    case "ArrowDown":
      fastDrop = true; // Enable fast again drop
      break;
    case "ArrowUp":
      document.getElementById("rotateButton").click(); // Trigger Rotation
      break;
    case " ":
      document.getElementById("pausePlayButton").click(); // Toggle between Pause/Play
      break;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowDown") {
    fastDrop = false; // Disable fast again drop
  }
});

resetGame(); // Start the game with a reset
