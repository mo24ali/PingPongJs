const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PADDLE_MARGIN = 10;
const PLAYER_COLOR = "#4caf50";
const AI_COLOR = "#f44336";
const BALL_COLOR = "#ffd600";
const NET_COLOR = "#888";
const FPS = 60;

// Player paddle
const player = {
    x: PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PLAYER_COLOR,
    score: 0
};

// AI paddle
const ai = {
    x: canvas.width - PADDLE_WIDTH - PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: AI_COLOR,
    score: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    speed: 6,
    velX: 6,
    velY: 4
};

// Draw net
function drawNet() {
    const segmentLength = 30;
    for (let y = 0; y < canvas.height; y += segmentLength * 2) {
        ctx.fillStyle = NET_COLOR;
        ctx.fillRect(canvas.width / 2 - 2, y, 4, segmentLength);
    }
}

// Draw paddle
function drawPaddle(paddle) {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
    ctx.fillStyle = BALL_COLOR;
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

// Draw scores
function drawScores() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(player.score, canvas.width / 4, 40);
    ctx.fillText(ai.score, 3 * canvas.width / 4, 40);
}

// Reset ball to center
function resetBall(direction = 1) {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.velX = direction * ball.speed;
    ball.velY = (Math.random() * 2 - 1) * ball.speed * 0.7;
}

// Collision detection
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.size > b.x &&
        a.y < b.y + b.height &&
        a.y + a.size > b.y
    );
}

// Main game loop
function update() {
    // Move ball
    ball.x += ball.velX;
    ball.y += ball.velY;

    // Wall collision (top & bottom)
    if (ball.y <= 0) {
        ball.y = 0;
        ball.velY *= -1;
    }
    if (ball.y + ball.size >= canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.velY *= -1;
    }

    // Paddle collision (player)
    if (isColliding(ball, player)) {
        ball.x = player.x + player.width;
        ball.velX *= -1;
        // Add a bit of "spin" based on where it hit the paddle
        let collidePoint = (ball.y + ball.size / 2) - (player.y + player.height / 2);
        collidePoint /= player.height / 2;
        ball.velY = collidePoint * ball.speed;
    }

    // Paddle collision (AI)
    if (isColliding(ball, ai)) {
        ball.x = ai.x - ball.size;
        ball.velX *= -1;
        let collidePoint = (ball.y + ball.size / 2) - (ai.y + ai.height / 2);
        collidePoint /= ai.height / 2;
        ball.velY = collidePoint * ball.speed;
    }

    // Score update
    if (ball.x < 0) {
        ai.score++;
        resetBall(-1);
    }
    if (ball.x + ball.size > canvas.width) {
        player.score++;
        resetBall(1);
    }

    // AI movement (simple)
    let aiCenter = ai.y + ai.height / 2;
    if (aiCenter < ball.y + ball.size / 2 - 10) {
        ai.y += ai.speed;
    } else if (aiCenter > ball.y + ball.size / 2 + 10) {
        ai.y -= ai.speed;
    }
    // Clamp AI paddle
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Draw everything
function render() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw
    drawNet();
    drawPaddle(player);
    drawPaddle(ai);
    drawBall();
    drawScores();
}

// Mouse move controls player paddle
canvas.addEventListener('mousemove', function (evt) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp paddle within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Main game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();