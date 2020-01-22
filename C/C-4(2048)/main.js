/* *********************************************
   * Project Name : 2048                       *
   * Date : 22 jan 2020                        *
   * Author : Aditya Naidu (@icecreamcake101)  *
   ********************************************* */
   








//FIrst TIme initializatin

function setupGame() {
    document.addEventListener('keydown', handleKey);
    startGame();
}

var ti = [];
var tili = [];
var gsiz = 4;
var tcont = document.getElementById('tile-container');
var scocont = document.getElementById('score-counter');
var score = 0;

//game start, ARRAY add , Tile add

function startGame() {
    ti = [];
    tili = [];
    score = 0;

    for (var row = 0; row < gsiz; row += 1) {
        ti.push([]);

        for (var col = 0; col < gsiz; col += 1) {
            ti[row][col] = null;
        }
    }

    addTileRandom();
    addTileRandom();

    renderGame();
}



//tile occupied or not
function tileActive(row, col) {
    try {
        return !!ti[row][col];
    } catch (e) {
        throw new Error('Could not find tile at ' + row + ', ' + col);
    }
}

// new tile
function addTile(row, col, value) {
    if (!value) {
        value = Math.random() < 0.25 ? 4 : 2;
    }

    var tile = {
        value: value,
        row: row,
        col: col
    };

    ti[row][col] = tile;

    tili.push(tile);
}

//add random tile
function addTileRandom() {
    var col, row;
    do {
        col = Math.floor(Math.random() * gsiz);
        row = Math.floor(Math.random() * gsiz);
    } while (tileActive(row, col));

    addTile(row, col);
}

//move tile
function moveTile(row, col, newRow, newCol) {
    var tile = ti[row][col];
    ti[row][col] = null;
    tile.row = newRow;
    tile.col = newCol;

    ti[newRow][newCol] = tile;
}

//combine two tile
function combineTile(row, col, intoRow, intoCol) {
    var oldTile = ti[row][col];
    var newTile = ti[intoRow][intoCol];

    newTile.value += oldTile.value;
    newTile.hasMerged = true;
    oldTile.dead = true;
    oldTile.row = intoRow;
    oldTile.col = intoCol;

    score += newTile.value;

    removeTile(row, col);
}

//remove tile
function removeTile(row, col) {
    var tile = ti[row][col];

    tile.dead = true;
    ti[row][col] = null;
}

//game 
function renderGame() {
    var remove = [];
    var tile;
    var i;

    for (i = 0; i < tili.length; i += 1) {
        updateTile(i);

        tile = tili[i];

        if (tile.dead) {
            remove.push(tile);
        }
    }

    scocont.innerHTML = score;

    for (i = 0; i < remove.length; i += 1) {
        tile = remove[i];

        tili.splice(tili.indexOf(tile), 1);
    }

    setTimeout(function() {
        for (var i = 0; i < remove.length; i += 1) {
            var tile = remove[i];

            if (tile.element) {
                tcont.removeChild(tile.element);
            }
        }
    }, 200);
}

//file update
function updateTile(index) {
    var tile = tili[index];

    if (!tile.element) {
        tile.element = document.createElement('div');

        tile.text = document.createElement('span');
        tile.text.className = 'tile-text';
        tile.element.appendChild(tile.text);

        tcont.appendChild(tile.element);
    }

    tile.text.innerHTML = tile.value;
    tile.element.className = 'tile pos-' + tile.row + '-' + tile.col + ' tile-' + tile.value;
    tile.hasMerged = false;

    if (tile.dead) {
        tile.element.className += ' dead';
    }
}

//only single tile
function push(row, col, axis, dir) {
    // If we're moving along a column, we're changing the row
    // If we're moving across a row, we're changing the column
    var throughAxis = axis === 'row' ? 'col' : 'row';
    var newPos = { row: row, col: col };
    var startPos = newPos[throughAxis];
    var currentTile = ti[row][col];

    for (var testPos = startPos + dir; (testPos >= 0) && (testPos < gsiz); testPos += dir) {
        newPos[throughAxis] = testPos;

        if (tileActive(newPos.row, newPos.col)) {
            var checkTile = ti[newPos.row][newPos.col];

            if ((checkTile.value === currentTile.value) && (!checkTile.hasMerged)) {
                combineTile(row, col, checkTile.row, checkTile.col);

                // End the function here
                return true;
            }

            // Backtrack to the previous tile
            newPos[throughAxis] = testPos - dir;

            break;
        }
    }

    moveTile(row, col, newPos.row, newPos.col);

    // Return whether the tile has moved or not
    return (startPos !== newPos);
}

//full set move
function pushAll(axis, dir) {
    var start = 0;
    var moved = false;

    if (dir === 1) {
        start = gsiz - 1;
    }

    for (var row = start; (row >= 0) && (row < gsiz); row -= dir) {
        for (var col = start; (col >= 0) && (col < gsiz); col -= dir) {
            if (tileActive(row, col)) {
                if (push(row, col, axis, dir)) {
                    moved = true;
                }
            }
        }
    }

    return moved;
}

//player move
function canMove() {
    for (var row = 0; row < gsiz; row += 1) {
        for (var col = 0; col < gsiz; col += 1) {
            if (!tileActive(row, col)) {
                return true;
            }
        }
    }

    return false;
}

//keystroke
function handleKey(event) {
    var moved = false;

    switch (event.keyCode) {
        case 37: // Left
        case 38: // Up
        case 39: // Right
        case 40: // Down
            event.preventDefault();
            break;
    }

    switch (event.keyCode) {
        case 37: // Left
            moved = pushAll('row', -1);
            break;
        case 38: // Up
            moved = pushAll('col', -1);
            break;
        case 39: // Right
            moved = pushAll('row', 1);
            break;
        case 40: // Down
            moved = pushAll('col', 1);
            break;
    }

    if (moved) {
        addTileRandom();
        renderGame();
        if (!canMove()) {
            lose();
        }
    }
}

//game over
function lose() {
    for (var i = 0; i < tili.length; i += 1) {
        if (tili[i].element) {
            tcont.removeChild(tili[i].element);
        }
    }

    startGame();
}

// Run the game
setupGame();
