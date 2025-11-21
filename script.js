const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const speedEl = document.getElementById('speed');
const playPauseBtn = document.getElementById('playPause');
const restartBtn = document.getElementById('restart');
const helperText = document.querySelector('.helper');
const statusText = document.getElementById('status');

const tileSize = 20;
const tiles = canvas.width / tileSize;
const baseSpeed = 120;
const bestKey = 'classic-snake-best';

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;
let best = 0;
let paused = false;
let gameOver = false;
let touchStart = null;
let accumulator = 0;
let lastTime = 0;
let frameId = null;

function init() {
  best = loadBestScore();
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = createFood();
  score = 0;
  paused = false;
  gameOver = false;
  helperText.textContent =
    'Use the arrow keys (or W/A/S/D) to move the snake. Press spacebar to pause.';
  setStatus('Game on! Collect food and avoid the walls or yourself.');
  playPauseBtn.textContent = 'Pause';
  playPauseBtn.disabled = false;
  updateScore();
  updateBest(best);
  updateSpeedDisplay();
  draw();
  startLoop();
}

function startLoop() {
  if (frameId) cancelAnimationFrame(frameId);
  accumulator = 0;
  lastTime = 0;
  const tick = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    if (!paused && !gameOver) {
      accumulator += delta;
      const speedMs = getSpeedMs();

      while (accumulator >= speedMs) {
        step();
        accumulator -= speedMs;
      }
      draw();
    }

    frameId = requestAnimationFrame(tick);
  };

  frameId = requestAnimationFrame(tick);
}

function step() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const willGrow = head.x === food.x && head.y === food.y;

  if (hitsWall(head)) {
    endGame();
    return;
  }

  const bodyToCheck = willGrow ? snake : snake.slice(0, snake.length - 1);
  if (hitsSelf(head, bodyToCheck)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (willGrow) {
    score += 10;
    updateScore();
    updateBest(score);
    updateSpeedDisplay();
    food = createFood();
  } else {
    snake.pop();
  }
}

function hitsWall({ x, y }) {
  return x < 0 || x >= tiles || y < 0 || y >= tiles;
}

function hitsSelf(head, body = snake) {
  return body.some((segment) => segment.x === head.x && segment.y === head.y);
}

function createFood() {
  let point;
  if (snake.length >= tiles * tiles) return { x: 0, y: 0 };
  do {
    point = {
      x: Math.floor(Math.random() * tiles),
      y: Math.floor(Math.random() * tiles),
    };
  } while (snake.some((segment) => segment.x === point.x && segment.y === point.y));
  return point;
}

function draw() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < tiles; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = '#38bdf8';
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#22d3ee' : '#38bdf8';
    ctx.fillRect(
      segment.x * tileSize + 2,
      segment.y * tileSize + 2,
      tileSize - 4,
      tileSize - 4
    );
  });

  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.arc(
    food.x * tileSize + tileSize / 2,
    food.y * tileSize + tileSize / 2,
    tileSize / 2 - 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function updateScore() {
  scoreEl.textContent = score.toString();
}

function updateBest(currentScore) {
  if (typeof currentScore === 'number' && currentScore > best) {
    best = currentScore;
    localStorage.setItem(bestKey, best.toString());
  }

  bestEl.textContent = best.toString();
}

function setDirection(newDir) {
  if (gameOver) return;
  const isOpposite = newDir.x === -direction.x && newDir.y === -direction.y;
  if (isOpposite) return;
  nextDirection = newDir;
}

function getSpeedMs() {
  const bonus = Math.floor(score / 50) * 8;
  return Math.max(60, baseSpeed - bonus);
}

function updateSpeedDisplay() {
  const speedMs = getSpeedMs();
  const multiplier = (baseSpeed / speedMs).toFixed(1);
  speedEl.textContent = `${multiplier}x`;
}

function setStatus(message) {
  statusText.textContent = message;
}

function loadBestScore() {
  const stored = parseInt(localStorage.getItem(bestKey) || '0', 10);
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
}

function handleKeydown(event) {
  const { key } = event;
  const normalizedKey = key.toLowerCase();
  if (normalizedKey === ' ') {
    event.preventDefault();
    togglePause();
    return;
  }

  const mapping = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (mapping[normalizedKey]) {
    event.preventDefault();
    setDirection(mapping[normalizedKey]);
  }
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  playPauseBtn.textContent = paused ? 'Resume' : 'Pause';
  setStatus(paused ? 'Paused. Press spacebar or Resume to continue.' : 'Running.');
}

function endGame() {
  gameOver = true;
  playPauseBtn.textContent = 'Game Over';
  setStatus('Game over. Press Restart or R to try again.');
  helperText.textContent = 'Game over! Hit restart or press R to try again.';
}

function restartGame() {
  init();
}

function handleTouchStart(event) {
  const touch = event.touches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}

function handleTouchEnd(event) {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    setDirection({ x: deltaX > 0 ? 1 : -1, y: 0 });
  } else {
    setDirection({ x: 0, y: deltaY > 0 ? 1 : -1 });
  }
  touchStart = null;
}

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'r' && gameOver) {
    restartGame();
  }
  handleKeydown(event);
});
canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
canvas.addEventListener('touchend', handleTouchEnd);
playPauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

init();
