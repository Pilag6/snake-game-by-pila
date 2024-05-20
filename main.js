const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const scoreElement = document.getElementById("score");
const removeGrid = document.getElementById("removeGridBtn");
const highScoreElement = document.getElementById("highScore");
const gameOverModal = document.getElementById("gameOverModal");
const finalScoreElement = document.getElementById("finalScore");
const closeModalButton = document.getElementById("closeModalButton");
const highScoreModal = document.getElementById("highScoreModal");
const highScoreMessage = document.getElementById("highScoreMessage");
const playerNameInput = document.getElementById("playerName");
const submitNameButton = document.getElementById("submitNameButton");
const startModal = document.getElementById("startModal");
const startGameButton = document.getElementById("startGameButton");
const countdownElement = document.getElementById("countdown");

const gridSize = 20; // Size of each cell in the grid
const canvasSize = 400; // Size of the canvas
const numCells = canvasSize / gridSize; // Number of cells per row/column

let snake = [{ x: 10, y: 10 }]; // Initial position of the snake
let direction = { x: 0, y: 0 }; // Initial direction (not moving)
let food = getRandomPosition(); // Initial position of the food
let score = 0;
let highScore = 0;
let highScoreName = "";
let gameInterval;
let speed = 100; // Initial speed
let isGridVisible = true; // Track the grid visibility

// Fetch the high score from the server
async function fetchHighScore() {
    try {
        const response = await fetch(`${"https://snake-game-by-pila.onrender.com"}/highscore`);
        const data = await response.json();
        if (data) {
            highScore = data.score;
            highScoreName = data.name;
            updateScore();
        }
    } catch (err) {
        console.error("Failed to fetch high score:", err);
    }
}

// Save the high score to the server
async function saveHighScore(name, score) {
    try {
        const response = await fetch(`${"https://snake-game-by-pila.onrender.com"}/highscore`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, score })
        });
        const data = await response.json();
        console.log("High score saved:", data);
    } catch (err) {
        console.error("Failed to save high score:", err);
    }
}

// Function to generate a random position for the food
function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * numCells),
        y: Math.floor(Math.random() * numCells)
    };
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
}

function drawSnake() {
    snake.forEach((segment) => drawCell(segment.x, segment.y, "#4ACF7F"));
}

function drawFood() {
    drawCell(food.x, food.y, "#DF2B7A");
}

// Function to draw the grid
function drawGrid() {
    if (!isGridVisible) return;
    ctx.strokeStyle = "#e0e0e0"; // Color of the grid lines
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvasSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.stroke();
    }
    for (let y = 0; y <= canvasSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize, y);
        ctx.stroke();
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    drawGrid();
    drawSnake();
    drawFood();
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check for collision with walls or self
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= numCells ||
        head.y >= numCells ||
        snake.some(
            (segment, index) =>
                index !== 0 && segment.x === head.x && segment.y === head.y
        )
    ) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Check for collision with food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = getRandomPosition();
        updateScore();

        // Increase speed after reaching 80 points
        if (score >= 80) {
            clearInterval(gameInterval);
            speed = 80; // Increase speed
            gameInterval = setInterval(gameLoop, speed);
        }
    } else {
        snake.pop();
    }
}

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
        case "Enter":
            resetGame();
            break;
        case " ":
            startCountdown();
            break;
    }
});

function gameLoop() {
    moveSnake();
    drawBoard();
}

function startGame() {
    if (!gameInterval) {
        direction = { x: 1, y: 0 }; // Set initial direction to the right
        gameInterval = setInterval(gameLoop, speed);
    }
}

function resetGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    food = getRandomPosition();
    score = 0;
    speed = 100; // Reset speed to initial value
    updateScore();
    drawBoard();
    hideGameOverModal();
    hideHighScoreModal();
}

function endGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    if (score > highScore) {
        highScore = score;
        showHighScoreModal();
    } else {
        showGameOverModal();
    }
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
    highScoreElement.innerHTML = `<img title="High Score" class="trophy" src="./assets/trophy.png" /> ${highScore} | ${highScoreName}`;
}

function showGameOverModal() {
    finalScoreElement.innerHTML = `<div>Your final score is: <br> <span class="finalNum">${score}</span></div>`;
    gameOverModal.style.display = "flex";
}

function hideGameOverModal() {
    gameOverModal.style.display = "none";
    resetGame();
}

function showHighScoreModal() {
    highScoreMessage.innerHTML = `<div class="highNum">${score}</div>`;
    highScoreModal.style.display = "flex";
}

function hideHighScoreModal() {
    highScoreModal.style.display = "none";
}

function showStartModal() {
    startModal.style.display = "flex";
}

function hideStartModal() {
    startModal.style.display = "none";
}

function startCountdown() {
    let countdown = 5;
    hideStartModal();
    countdownElement.textContent = countdown;
    countdownElement.style.display = "block";

    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = "none";
            startGame();
        }
    }, 1000);
}

submitNameButton.addEventListener("click", async () => {
    highScoreName = playerNameInput.value.trim();

    if (highScoreName.length > 8) {
        alert("Name must be 8 characters or less.");
        return;
    }

    await saveHighScore(highScoreName, highScore);
    updateScore();
    hideHighScoreModal();
    showGameOverModal();
});

startButton.addEventListener("click", startCountdown);
resetButton.addEventListener("click", resetGame);
closeModalButton.addEventListener("click", hideGameOverModal);
startGameButton.addEventListener("click", startCountdown);
removeGrid.addEventListener("click", () => {
    isGridVisible = !isGridVisible;
    removeGrid.classList.toggle("active");
    drawBoard();
});

fetchHighScore();
resetGame(); // Initial reset to draw the initial state
showStartModal(); // Show the start modal when the page loads
