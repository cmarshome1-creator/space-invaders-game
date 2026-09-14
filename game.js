// Space Invaders Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let gameWon = false;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 5,
    dx: 0
};

// Bullets
const bullets = [];
const bulletSpeed = 7;
const bulletWidth = 5;
const bulletHeight = 15;

// Enemies
const enemies = [];
const enemyBullets = [];
let enemySpeed = 2;
let enemySpawnRate = 0.02;
let enemyBulletSpeed = 3;

// Keyboard controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        shootBullet();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Player class
class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 5;
        this.dx = 0;
    }

    draw() {
        ctx.fillStyle = '#00ff00';
        // Draw player ship (triangle)
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    update() {
        if (keys['ArrowLeft'] || keys['a']) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.x += this.speed;
        }

        // Boundary check
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.speed = enemySpeed;
        this.shootChance = 0.002;
    }

    draw() {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        if (Math.random() < this.shootChance) {
            this.shoot();
        }
    }

    shoot() {
        enemyBullets.push({
            x: this.x + this.width / 2 - bulletWidth / 2,
            y: this.y + this.height,
            width: bulletWidth,
            height: bulletHeight,
            speed: enemyBulletSpeed
        });
    }
}

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = bulletWidth;
        this.height = bulletHeight;
        this.speed = bulletSpeed;
    }

    draw() {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

function shootBullet() {
    if (!gameRunning) return;
    bullets.push(new Bullet(
        player.x + player.width / 2 - bulletWidth / 2,
        player.y
    ));
}

function spawnEnemies() {
    if (Math.random() < enemySpawnRate && enemies.length < 20) {
        const x = Math.random() * (canvas.width - 40);
        enemies.push(new Enemy(x, -30));
    }
}

function checkCollisions() {
    // Player bullet vs enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (isColliding(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                break;
            }
        }
    }

    // Enemy bullets vs player
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (isColliding(enemyBullets[i], player)) {
            enemyBullets.splice(i, 1);
            lives--;
            if (lives <= 0) {
                gameRunning = false;
            }
        }
    }

    // Enemies vs player
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (isColliding(enemies[i], player)) {
            enemies.splice(i, 1);
            lives--;
            if (lives <= 0) {
                gameRunning = false;
            }
        }
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function update() {
    if (!gameRunning) return;

    player.update();

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
            if (lives <= 0) {
                gameRunning = false;
            }
        }
    }

    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBullets[i].speed;
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }

    spawnEnemies();
    checkCollisions();

    // Level progression
    if (score > 0 && score % 100 === 0) {
        level = Math.floor(score / 100) + 1;
        enemySpeed = 2 + (level - 1) * 0.5;
        enemySpawnRate = Math.min(0.02 + (level - 1) * 0.005, 0.08);
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    player.draw();

    // Draw bullets
    for (let bullet of bullets) {
        bullet.draw();
    }

    // Draw enemies
    for (let enemy of enemies) {
        enemy.draw();
    }

    // Draw enemy bullets
    ctx.fillStyle = '#ff00ff';
    for (let bullet of enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function gameLoop() {
    update();
    draw();

    if (!gameRunning) {
        showGameOver();
    }

    requestAnimationFrame(gameLoop);
}

function showGameOver() {
    const gameOverDiv = document.getElementById('gameOver');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const finalScore = document.getElementById('finalScore');
    const gameOverText = document.getElementById('gameOverText');

    if (gameWon) {
        gameOverTitle.textContent = 'You Win!';
        gameOverTitle.style.color = '#00ff00';
    } else {
        gameOverTitle.textContent = 'Game Over';
        gameOverTitle.style.color = '#ff0000';
    }

    finalScore.textContent = score;
    gameOverDiv.classList.remove('hidden');
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    gameRunning = true;
    gameWon = false;
    player.x = canvas.width / 2 - 25;
    bullets.length = 0;
    enemies.length = 0;
    enemyBullets.length = 0;
    enemySpeed = 2;
    enemySpawnRate = 0.02;
    document.getElementById('gameOver').classList.add('hidden');
}

// Restart button
document.getElementById('restartBtn').addEventListener('click', resetGame);

// Start the game
const playerShip = new Player(player.x, player.y, player.width, player.height);
gameLoop();