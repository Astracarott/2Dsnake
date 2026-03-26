const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameStatus = document.getElementById('gameStatus');
const timerDisplay = document.getElementById('timer');

// Settings Modal Elements
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeModal = document.querySelector('.close');
const defaultControlsBtn = document.getElementById('defaultControlsBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const upDisplay = document.getElementById('upDisplay');
const downDisplay = document.getElementById('downDisplay');
const leftDisplay = document.getElementById('leftDisplay');
const rightDisplay = document.getElementById('rightDisplay');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let gameLoop;
let gameTime = 0;
let timerInterval;
let godMode = false;
let easterEggSequence = '';

// Default controls
const defaultControls = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight'
};

// Current controls
let controls = loadControls();
let listeningForKey = null;

// Initialize high score display
highScoreDisplay.textContent = highScore;
updateControlDisplay();

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
closeModal.addEventListener('click', closeSettings);
defaultControlsBtn.addEventListener('click', resetToDefaults);
upBtn.addEventListener('click', () => startListeningForKey('up'));
downBtn.addEventListener('click', () => startListeningForKey('down'));
leftBtn.addEventListener('click', () => startListeningForKey('left'));
rightBtn.addEventListener('click', () => startListeningForKey('right'));
document.addEventListener('keydown', handleKeyPress);

// Settings functions
function loadControls() {
    const saved = localStorage.getItem('snakeControls');
    return saved ? JSON.parse(saved) : {...defaultControls};
}

function saveControls() {
    localStorage.setItem('snakeControls', JSON.stringify(controls));
    updateControlDisplay();
}

function updateControlDisplay() {
    upDisplay.textContent = getKeyDisplay(controls.up);
    downDisplay.textContent = getKeyDisplay(controls.down);
    leftDisplay.textContent = getKeyDisplay(controls.left);
    rightDisplay.textContent = getKeyDisplay(controls.right);
}

function getKeyDisplay(key) {
    const keyMap = {
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        ' ': 'Space',
        'Enter': 'Enter',
        'Shift': 'Shift',
        'Control': 'Ctrl',
        'Alt': 'Alt'
    };
    return keyMap[key] || key.toUpperCase();
}

function startListeningForKey(direction) {
    listeningForKey = direction;
    const btn = document.getElementById(direction + 'Btn');
    btn.classList.add('listening');
    btn.textContent = 'Listening...';
}

function stopListeningForKey() {
    if (listeningForKey) {
        const btn = document.getElementById(listeningForKey + 'Btn');
        btn.classList.remove('listening');
        btn.textContent = 'Press a key...';
    }
    listeningForKey = null;
}

function openSettings() {
    if (!gameRunning) {
        settingsModal.classList.add('show');
    }
}

function closeSettings() {
    settingsModal.classList.remove('show');
    stopListeningForKey();
}

function resetToDefaults() {
    controls = {...defaultControls};
    saveControls();
    updateControlDisplay();
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Game functions
function startGame() {
    if (!gameRunning) {
        resetGame();
        stopListeningForKey();
        gameRunning = true;
        startBtn.disabled = true;
        settingsBtn.disabled = true;
        gameStatus.textContent = 'Game in progress...';
        gameLoop = setInterval(update, gameSpeed);
        timerInterval = setInterval(() => {
            gameTime++;
            timerDisplay.textContent = formatTime(gameTime);
        }, 1000);
    }
}



function resetGame() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    clearInterval(timerInterval);
    
    snake = [{x: 10, y: 10}];
    food = generateFood();
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    gameSpeed = 100;
    gameTime = 0;
    easterEggSequence = '';
    
    scoreDisplay.textContent = score;
    timerDisplay.textContent = formatTime(gameTime);
    startBtn.disabled = false;
    settingsBtn.disabled = false;
    if (godMode) {
        gameStatus.textContent = '🚀 GOD MODE ACTIVE 🚀';
    } else {
        gameStatus.textContent = 'Use arrow keys to move';
    }
    
    draw();
}

function handleKeyPress(event) {
    // Check for easter egg
    easterEggSequence += event.key.toLowerCase();
    if (easterEggSequence.includes('astracarott')) {
        godMode = !godMode;
        easterEggSequence = '';
        if (godMode) {
            gameStatus.textContent = '🚀 GOD MODE ACTIVATED! 🚀';
        } else {
            gameStatus.textContent = 'God mode deactivated';
        }
        return;
    }
    // Keep sequence to a reasonable length to avoid memory issues
    if (easterEggSequence.length > 20) {
        easterEggSequence = easterEggSequence.slice(-15);
    }
    
    if (listeningForKey) {
        event.preventDefault();
        controls[listeningForKey] = event.key;
        saveControls();
        stopListeningForKey();
        return;
    }
    
    if (!gameRunning) return;
    
    if (event.key === controls.up) {
        if (direction.y === 0) nextDirection = {x: 0, y: -1};
        event.preventDefault();
    } else if (event.key === controls.down) {
        if (direction.y === 0) nextDirection = {x: 0, y: 1};
        event.preventDefault();
    } else if (event.key === controls.left) {
        if (direction.x === 0) nextDirection = {x: -1, y: 0};
        event.preventDefault();
    } else if (event.key === controls.right) {
        if (direction.x === 0) nextDirection = {x: 1, y: 0};
        event.preventDefault();
    }
}

function update() {
    direction = nextDirection;
    
    // Create new head
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        food = generateFood();
        
        // Increase game speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 1;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        snake.pop();
    }
    
    draw();
}

function generateFood() {
    let newFood;
    let isOnSnake;
    
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isOnSnake);
    
    return newFood;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            if (godMode) {
                ctx.fillStyle = '#FFD700';  // Gold color for god mode
                ctx.shadowColor = '#FFD700';
            } else {
                ctx.fillStyle = '#00FF00';
                ctx.shadowColor = '#00FF00';
            }
            ctx.shadowBlur = 10;
        } else {
            // Body
            if (godMode) {
                ctx.fillStyle = '#FFA500';  // Orange for god mode
            } else {
                ctx.fillStyle = '#00CC00';
            }
            ctx.shadowColor = 'transparent';
        }
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
    
    ctx.shadowColor = 'transparent';
    
    // Draw food
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearInterval(timerInterval);
    startBtn.disabled = false;
    settingsBtn.disabled = false;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        gameStatus.textContent = `Game Over! New High Score: ${score}`;
    } else {
        gameStatus.textContent = `Game Over! Final Score: ${score}`;
    }
}

// Initial draw
draw();

function update() {
    direction = nextDirection;
    
    // Create new head
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        if (godMode) {
            // Phase through wall - wrap to opposite side
            if (head.x < 0) head.x = tileCount - 1;
            if (head.x >= tileCount) head.x = 0;
            if (head.y < 0) head.y = tileCount - 1;
            if (head.y >= tileCount) head.y = 0;
        } else {
            endGame();
            return;
        }
    }
    
    // Check self collision
    if (!godMode && snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        food = generateFood();
        
        // Increase game speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 1;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        snake.pop();
    }
    
    draw();
}

function generateFood() {
    let newFood;
    let isOnSnake;
    
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isOnSnake);
    
    return newFood;
}

