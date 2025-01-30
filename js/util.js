'use strict'

function createMat(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i].push([])
        }
    }
    return board

}

function minesCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) currCell.minesAroundCount++
        }
    }
}

function showNumbers() {
    document.querySelector('.cell').display = 'none'
}

function emptyCell() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j] === '0') {
                emptyCells.push({ i, j })
            }
        }
    }
    return emptyCells
}

function setRandomMines(amount, board) {
    var placeMines = 0

    while (placeMines < amount) {

        var idxI = getRandomIntInclusive(0, board.length - 1)
        var idxj = getRandomIntInclusive(0, board.length - 1)

        if (!board[idxI][idxj].isMine) {
            board[idxI][idxj].isMine = true
            placeMines++
        }
    }
}

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function beginner() {
    gLevel.SIZE = 4
    gLevel.MINES = 4
    onInit()
}

function intermediate() {
    gLevel.SIZE = 5
    gLevel.MINES = 6
    onInit()
}

function hard() {
    gLevel.SIZE = 6
    gLevel.MINES = 8
    onInit()
}

function firstClick(board) {
    board.isMine = false
}

function hideContentMenu() {
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });
}

function backGround() {
    const img = document.querySelector('board-container')
    img.style.backgroundImage = "url('img/minesweeper.jpg')"
}

function timer() {
    var time = 0
    const elTimer = document.querySelector('.timer-display')

    if (gGame.isOn) {
        gTimerInterval = setInterval(() => {
            time++
            elTimer.innerText = time
        }, 1000);

    }
}

function timerOff() {
    clearInterval(gTimerInterval)
}

function openAllCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            currCell.isShown = true
        }
    }
}

function uncoverNegs(rowIdx, colIdx, board) {
    var clickedCell = board[rowIdx][colIdx]

    if (clickedCell.minesAroundCount !== 0) return

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.minesAroundCount === 0 && currCell.isMine === false) {
                currCell.isShown = true
            }
        }
    }
}

function removeLives() {
    if (gCountLives > 0) {
        LIFE.pop()
        gCountLives--
        document.querySelector('.lives').innerText = LIFE.join('')
    }
}

function addLife() {
    if (gCountLives < 3) {
        LIFE.push('🧡')
        gCountLives++
        document.querySelector('.lives').innerText = LIFE.join('')
    }
}


function resetLives() {
    LIFE = ['🧡', '🧡', '🧡']
    gCountLives = 3
    document.querySelector('.lives').style.display = 'block'
    document.querySelector('.lives').innerText = LIFE.join('')
}

function resetGame() {
    gGame.flags = 0
    gCountMines = 0
    gGame.isOn = true
    resetLives()
    document.querySelector('.restart-btn').innerHTML = '🤪'

}

function markCell(i, j) {
    var currCell = gBoard[i][j]

    if (currCell.isMarked) {
        currCell.isMarked = false
        document.querySelector(`.cell-${i}-${j}`).innerHTML = ''
    } else {
        currCell.isMarked = true
        document.querySelector(`.cell-${i}-${j}`).innerHTML = FLAG
    }
}

function isWin() {
    alert('Win')
    onInit()
}
