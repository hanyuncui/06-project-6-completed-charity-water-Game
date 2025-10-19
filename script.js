let gameRunning = false;
let dropMaker, gameTimer;
let score = 0;
let timeLeft = 30;

// 游戏配置（根据难度）
const gameConfig = {
  easy: {
    winScore: 15,
    time: 40,
    dropInterval: 1000,
    thunderChance: 0.05,
    badDropChance: 0.15
  },
  normal: {
    winScore: 20,
    time: 30,
    dropInterval: 800,
    thunderChance: 0.1,
    badDropChance: 0.2
  },
  hard: {
    winScore: 25,
    time: 25,
    dropInterval: 600,
    thunderChance: 0.15,
    badDropChance: 0.25
  }
};

// 里程碑消息
const milestones = {
  5: "Great start! 👍",
  10: "Halfway there! 💪",
  15: "Keep going! 🌊",
  20: "Almost there! ⭐",
  25: "Outstanding! 🏆"
};

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const startBtn = document.getElementById("start-btn");
const difficultySelect = document.getElementById("difficulty");
const milestoneMsg = document.getElementById("milestone-message");

// messages
const winMessages = [
  "You’re a Water Hero! 💧",
  "Amazing! Every drop counts!",
  "Clean water for all – great job!",
  "You made a splash for charity: water!"
];
const loseMessages = [
  "Almost there! Try again! 💪",
  "Keep tapping — clean water needs you!",
  "Don’t give up, every drop matters!",
  "You’re learning the flow — try again!"
];

startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  
  // 根据难度设置游戏参数
  const difficulty = difficultySelect.value;
  const config = gameConfig[difficulty];
  timeLeft = config.time;
  
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  startBtn.disabled = true;
  gameContainer.innerHTML = "";

  dropMaker = setInterval(createDrop, config.dropInterval);
  gameTimer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function createDrop() {
  const rand = Math.random();
  let element;

  const difficulty = difficultySelect.value;
  const config = gameConfig[difficulty];

  if (rand < config.thunderChance) {
    element = document.createElement("div");
    element.className = "thunder"; // ⚡元素
  } 
  else if (rand < (config.thunderChance + config.badDropChance)) {
    element = document.createElement("div");
    element.className = "water-drop bad-drop";
  } 
  else {
    element = document.createElement("div");
    element.className = "water-drop";
  }


  const size = 60 * (Math.random() * 0.8 + 0.5);
  element.style.width = element.style.height = `${size}px`;
  const gameWidth = gameContainer.offsetWidth;
  const x = Math.random() * (gameWidth - size);
  element.style.left = x + "px";
  element.style.animationDuration = "4s";

  gameContainer.appendChild(element);

  element.addEventListener("click", () => {
    if (!gameRunning) return;

    // 点击雷电 → 直接结束游戏
    if (element.classList.contains("thunder")) {
      triggerThunderEnd();
      return;
    }

    // 防止重复点击与多次触发
    element.style.pointerEvents = "none";

    if (element.classList.contains("bad-drop")) {
      score -= 2;
      flash(element, "red");
    } else {
      score += 1;
      flash(element, "#2E9DF7");
    }
    scoreDisplay.textContent = score;
    
    // 检查里程碑
    if (milestones[score]) {
      showMilestone(milestones[score]);
    }
    
    // 延迟移除以确保闪光可见（与 flash 的时长保持一致）
    setTimeout(() => {
      element.remove();
    }, 220);
  });

  element.addEventListener("animationend", () => element.remove());
}

function flash(el, color) {
  const isDrop = el.classList.contains("water-drop");
  if (isDrop) el.style.borderRadius = "50%";
  el.style.boxShadow = `0 0 20px 5px ${color}`;
  setTimeout(() => {
    el.style.boxShadow = "none";
    if (isDrop) el.style.borderRadius = "";
  }, 220);
}

// ⚡ 点击雷电时的游戏结束效果
function triggerThunderEnd() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  document.querySelectorAll(".water-drop, .thunder").forEach((d) => d.remove());

  const overlay = document.createElement("div");
  overlay.className = "flash-overlay";
  gameContainer.appendChild(overlay);

  const msg = document.createElement("div");
  msg.className = "end-message";
  msg.innerHTML = `
    <div class="msg-box">
      <h2>⚡ Thunder Strike! Game Over!</h2>
      <p>Your final score: ${score}</p>
      <button id="reset-btn">Try Again</button>
    </div>
  `;
  gameContainer.appendChild(msg);

  document.getElementById("reset-btn").addEventListener("click", () => {
    msg.remove();
    overlay.remove();
    startGame();
  });
}

function endGame() {
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  gameRunning = false;
  startBtn.disabled = false;

  document.querySelectorAll(".water-drop, .thunder").forEach((d) => d.remove());
  const messageArr = score >= 20 ? winMessages : loseMessages;
  const message = messageArr[Math.floor(Math.random() * messageArr.length)];

  if (score >= 20) {
    const duration = 2000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#2E9DF7", "#FFC907", "#ffffff"]
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#2E9DF7", "#FFC907", "#ffffff"]
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  const endMsg = document.createElement("div");
  endMsg.className = "end-message";
  endMsg.innerHTML = `
    <div class="msg-box">
      <h2>${message}</h2>
      <p>Your final score: ${score}</p>
      <button id="reset-btn">Play Again</button>
    </div>
  `;
  gameContainer.appendChild(endMsg);

  document.getElementById("reset-btn").addEventListener("click", () => {
    endMsg.remove();
    startGame();
  });
}

// --- Reset button logic ---
const resetBtnMain = document.getElementById("reset-btn-main");
resetBtnMain.addEventListener("click", resetGame);

// 显示里程碑消息
function showMilestone(message) {
  milestoneMsg.textContent = message;
  milestoneMsg.classList.add("show");
  setTimeout(() => {
    milestoneMsg.classList.remove("show");
  }, 2000);
}

function resetGame() {
  if (!gameRunning && score === 0 && timeLeft === 30) return; // already fresh
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  document.querySelectorAll(".water-drop, .thunder").forEach((el) => el.remove());
  gameRunning = false;

  // reset stats
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;

  // re-enable Start button
  startBtn.disabled = false;

  console.log("Game reset.");
}

