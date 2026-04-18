const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const timeEl = document.querySelector("#time");
const startButton = document.querySelector("#start");
const touchButtons = document.querySelectorAll("[data-move]");
const jumpButtons = document.querySelectorAll("[data-jump]");
const groundY = 404;
const gravity = 1800;
const jumpVelocity = -760;

const player = {
  x: 440,
  y: groundY,
  width: 58,
  height: 58,
  speed: 420,
  velocityY: 0,
  grounded: true,
};

let snacks = [];
let craters = [];
let keys = new Set();
let score = 0;
let timeLeft = 30;
let running = false;
let lastTime = 0;
let timerId = null;
let touchMove = 0;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function resetGame() {
  player.x = 440;
  player.y = groundY;
  player.velocityY = 0;
  player.grounded = true;
  score = 0;
  timeLeft = 30;
  snacks = Array.from({ length: 7 }, () => ({
    x: randomBetween(40, canvas.width - 70),
    y: randomBetween(270, 390),
    size: 24,
  }));
  craters = Array.from({ length: 4 }, () => ({
    x: randomBetween(50, canvas.width - 90),
    y: 438,
    width: randomBetween(44, 78),
    height: 24,
  }));
  updateHud();
}

function updateHud() {
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
}

function startGame() {
  resetGame();
  running = true;
  lastTime = performance.now();
  startButton.textContent = "Restart";
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) {
      running = false;
      clearInterval(timerId);
    }
  }, 1000);
  requestAnimationFrame(loop);
}

function drawBackground() {
  ctx.fillStyle = "#7bd1f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  drawCloud(96, 86);
  drawCloud(700, 114);

  ctx.fillStyle = "#3fa75d";
  ctx.fillRect(0, 462, canvas.width, 78);
  ctx.fillStyle = "#33864d";
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.fillRect(x, 462, 24, 78);
  }
}

function drawCloud(x, y) {
  ctx.fillRect(x, y + 18, 112, 32);
  ctx.fillRect(x + 18, y, 34, 34);
  ctx.fillRect(x + 58, y - 8, 42, 42);
}

function drawPlayer() {
  ctx.fillStyle = "#ef6658";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "#151822";
  ctx.fillRect(player.x + 14, player.y + 18, 9, 9);
  ctx.fillRect(player.x + 36, player.y + 18, 9, 9);
  ctx.fillRect(player.x + 18, player.y + 41, 22, 5);
}

function drawSnack(snack) {
  ctx.fillStyle = "#f5bf2e";
  ctx.beginPath();
  ctx.arc(snack.x, snack.y, snack.size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#151822";
  ctx.fillRect(snack.x - 2, snack.y - 10, 4, 20);
}

function drawCrater(crater) {
  ctx.fillStyle = "#151822";
  ctx.fillRect(crater.x, crater.y, crater.width, crater.height);
  ctx.fillStyle = "#ef6658";
  ctx.fillRect(crater.x + 8, crater.y + 5, crater.width - 16, crater.height - 10);
}

function rectanglesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function jump() {
  if (!running || !player.grounded) {
    return;
  }

  player.velocityY = jumpVelocity;
  player.grounded = false;
}

function update(delta) {
  let direction = touchMove;
  if (keys.has("ArrowLeft") || keys.has("a")) {
    direction -= 1;
  }
  if (keys.has("ArrowRight") || keys.has("d")) {
    direction += 1;
  }
  if (keys.has(" ") || keys.has("ArrowUp") || keys.has("w")) {
    jump();
  }

  player.x += Math.max(-1, Math.min(1, direction)) * player.speed * delta;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.velocityY += gravity * delta;
  player.y += player.velocityY * delta;

  if (player.y >= groundY) {
    player.y = groundY;
    player.velocityY = 0;
    player.grounded = true;
  }

  snacks = snacks.filter((snack) => {
    const snackRect = {
      x: snack.x - snack.size / 2,
      y: snack.y - snack.size / 2,
      width: snack.size,
      height: snack.size,
    };
    if (rectanglesOverlap(player, snackRect)) {
      score += 10;
      updateHud();
      return false;
    }
    return true;
  });

  if (snacks.length === 0) {
    timeLeft += 5;
    snacks = Array.from({ length: 5 }, () => ({
      x: randomBetween(40, canvas.width - 70),
      y: randomBetween(270, 390),
      size: 24,
    }));
  }

  for (const crater of craters) {
    if (rectanglesOverlap(player, crater)) {
      score = Math.max(0, score - 5);
      player.x = 440;
      player.y = groundY;
      player.velocityY = 0;
      player.grounded = true;
      updateHud();
    }
  }
}

function drawEndMessage() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.fillRect(260, 180, 440, 150);
  ctx.fillStyle = "#151822";
  ctx.font = "700 40px system-ui";
  ctx.fillText("Time!", 430, 238);
  ctx.font = "700 24px system-ui";
  ctx.fillText(`Score: ${score}`, 420, 282);
}

function loop(now) {
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  if (running) {
    update(delta);
  }

  drawBackground();
  craters.forEach(drawCrater);
  snacks.forEach(drawSnack);
  drawPlayer();

  if (!running && timeLeft <= 0) {
    drawEndMessage();
  }

  if (running) {
    requestAnimationFrame(loop);
  }
}

window.addEventListener("keydown", (event) => {
  if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
  }
  keys.add(event.key);
});
window.addEventListener("keyup", (event) => keys.delete(event.key));
startButton.addEventListener("click", startGame);

touchButtons.forEach((button) => {
  const move = Number(button.dataset.move);
  button.addEventListener("pointerdown", () => {
    touchMove = move;
  });
  button.addEventListener("pointerup", () => {
    touchMove = 0;
  });
  button.addEventListener("pointerleave", () => {
    touchMove = 0;
  });
});

jumpButtons.forEach((button) => {
  button.addEventListener("pointerdown", jump);
});

resetGame();
drawBackground();
craters.forEach(drawCrater);
snacks.forEach(drawSnack);
drawPlayer();
