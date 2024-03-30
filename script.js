const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const blockSize = 30; // Size of each block in pixels

// Calculate canvas dimensions based on block size
const columns = 20; // Number of columns
const rows = 40;    // Number of rows
canvas.width = columns * blockSize;
canvas.height = rows * blockSize;

let x = 3;
let y = 0;

// Define the shapes of Tetris pieces
const shapes = [
    // Square (2x2)
    [[1, 1],
        [1, 1]],

    // L-shape
    [[0, 1],
        [0, 1],
        [0, 1],
        [1, 1]],

    // T-shape
    [[0, 1, 0],
        [1, 1, 1]],

    // Z-shape
    [[1, 1, 0],
        [0, 1, 1]],

    // Line (4x1)
    [[1],
        [1],
        [1],
        [1]],

    // Reverse L-shape
    [[1, 0],
        [1, 0],
        [1, 0],
        [1, 1]],

    // Reverse Z-shape
    [[0, 1, 1],
        [1, 1, 0]]
];

let currentPieceIndex = 0; // Index of the current active piece
let landedPieces = []; // Array to store landed pieces
let lastTime = 0;
let dropInterval = 0.00000000000001; // Adjust as needed

function drawPiece(x, y, shape) {
    if ((y + shape.length > rows || x + shape[0].length > columns || x < 0)) {
        return;
    }

    context.fillStyle = 'green'; // Change color as needed
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                let blockX = (x + col) * blockSize;
                let blockY = (y + row) * blockSize;
                context.fillRect(blockX, blockY, blockSize, blockSize);
                context.strokeRect(blockX, blockY, blockSize, blockSize);
            }
        }
    }
}

function movePiece(dx, dy) {
    x += dx;
    y += dy;
}

function placePieceOnGrid() {
    const shape = shapes[currentPieceIndex];
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                landedPieces.push({ x: x + col, y: y + row });
            }
        }
    }
}

function isCollision(x, y, shape) {
    // Check if there is a collision with the landed pieces
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                let newX = x + col;
                let newY = y + row;
                if (newY >= rows || newX < 0 || newX >= columns || landedPieces.some(piece => piece.x === newX && piece.y === newY)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function rotatePiece() {
    // Rotate the current piece clockwise
    const oldShape = shapes[currentPieceIndex];
    const newShape = [];
    for (let col = 0; col < oldShape[0].length; col++) {
        const newRow = [];
        for (let row = oldShape.length - 1; row >= 0; row--) {
            newRow.push(oldShape[row][col]);
        }
        newShape.push(newRow);
    }
    // Check if the rotated piece would collide with other blocks
    if (!isCollision(x, y, newShape)) {
        shapes[currentPieceIndex] = newShape;
    }
}

function dropPiece() {
    // Move the piece down until it hits the bottom or another block
    while (!isCollision(x, y + 1, shapes[currentPieceIndex])) {
        y++;
    }
}

document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            if (isCollision(x, y, shapes[currentPieceIndex])) {
                movePiece(1, 0); // Move back if collision
            }
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            if (isCollision(x, y, shapes[currentPieceIndex])) {
                movePiece(-1, 0); // Move back if collision
            }
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            if (isCollision(x, y, shapes[currentPieceIndex])) {
                movePiece(0, -1); // Move back if collision
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ': // Spacebar to drop the piece
            dropPiece();
            break;
    }
});

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    // Move the current piece down
    movePiece(0, 1);

    // Check if the current piece has hit the bottom or collided with other blocks
    if (isCollision(x, y, shapes[currentPieceIndex])) {
        // Place the piece on the Tetris grid
        placePieceOnGrid();

        // Generate a new random shape for the next piece
        currentPieceIndex = Math.floor(Math.random() * shapes.length);

        // Reset the position of the new piece to the top of the grid
        x = Math.floor(columns / 2) - Math.floor(shapes[currentPieceIndex][0].length / 2);
        y = 0;

        // Check if the new piece collides immediately after placement
        if (isCollision(x, y, shapes[currentPieceIndex])) {
            // Game over logic here
            alert("Game over!");
            return;
        }
    }

    // Redraw the game with the updated position of the current piece and Tetris grid
    drawGame();

    // Request next frame
    requestAnimationFrame(update);
}

function drawGame() {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landed pieces
    context.fillStyle = 'gray'; // Change color as needed
    landedPieces.forEach(piece => {
        context.fillRect(piece.x * blockSize, piece.y * blockSize, blockSize, blockSize);
        context.strokeRect(piece.x * blockSize, piece.y * blockSize, blockSize, blockSize);
    });

    // Draw current piece
    drawPiece(x, y, shapes[currentPieceIndex]);
}

// Start the game
update();
