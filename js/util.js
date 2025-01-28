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

function firstClick() {
    createMat()
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

function openModal() {
    document.querySelector('.modal').style.display = 'block'
}

function isWin() {
    if (gGame.isShown === true && gGame.isMine === false)
        console.log('win')
    return
    }