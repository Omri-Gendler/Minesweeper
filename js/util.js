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

function setRandomMines(amount, board, firstI, firstJ) {
    var placeMines = 0

    while (placeMines < amount) {

        var idxI = getRandomIntInclusive(0, board.length - 1)
        var idxj = getRandomIntInclusive(0, board.length - 1)

        if (!board[idxI][idxj].isMine && !(idxI === firstI && idxj === firstJ)) {
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
    gLevel.MINES = 3
    onInit()
}

function intermediate() {
    gLevel.SIZE = 5
    gLevel.MINES = 4
    onInit()
}

function hard() {
    gLevel.SIZE = 6
    gLevel.MINES = 6
    onInit()
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
    // document.querySelector('.lives').style.display = 'block'
    document.querySelector('.lives').innerText = LIFE.join('')
}

function resetGame() {
    document.querySelector('.timer-display').innerText = '0'
    document.querySelector('.restart-btn').innerHTML = '🤪'
    document.querySelector('.mine-tapping').innerHTML = `Mines left : ${gLevel.MINES}`

    gMinesLeftOnBoard = gLevel.MINES
    gGame.shownCount = 0
    gGame.flags = 0
    gGame.firstClick = 0
    // gCountMines = 0
    gGame.isOn = true
    gHintOn = false

    resetLives()
    // renderHints()
    timerOff()
    timer()
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

function isOver() {
    if (gCountLives <= 0) {
        openAllCells()
        renderBoard(gBoard, '.board-container')
        timerOff()
        document.querySelector('.timer-display').innerText = '0'
        document.querySelector('.lives').innerText = '😭'
        document.querySelector('.restart-btn').innerHTML = ' 🤯 '
        // alert('game over')
        document.querySelector('.mine-tapping').innerText = '0'
    }

}

function isWin() {

    var safeOpenCell = 0
    var totalSafeCells = 0
    var markedMineWithFlag = 0
    var totalMines = 0

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine) totalSafeCells++
            if (currCell.isShown && !currCell.isMine) safeOpenCell++

            if (currCell.isMine) totalMines++
            if (currCell.isMine && currCell.isMarked) markedMineWithFlag++
        }
    }
    if (
        (safeOpenCell === totalSafeCells && markedMineWithFlag === totalMines) ||
        (gCountLives > 0 && safeOpenCell === totalSafeCells)
    ) {
        openAllCells()
        renderBoard(gBoard, '.board-container')
        timerOff()
        document.querySelector('.timer-display').innerText = '0'
        document.querySelector('.lives').innerText = LIFE.join('')
        document.querySelector('.restart-btn').innerHTML = ' 🥳  '
        // alert('you win')
        document.querySelector('.mine-tapping').innerText = '0'
    }

}

function mineTap() {
    var taps = 0
    var elTaps = document.querySelector('.mine-tapping')

    elTaps.innerText = `Mines left: ${gMinesLeftOnBoard}`
    console.log(gMinesLeftOnBoard)


    // for (var i = 0; i < gBoard.length; i++) {
    //     for (var j = 0; j < gBoard[0].length; j++) {
    //         var currCell = gBoard[i][j]
    //         if (currCell.isMine) {
    //             taps++
    //         }
    //     }
    // }
}

function darkMode(i, j) {

    gGame.darkMode = true

    if (gGame.darkMode) {
        var elBtnDarkMode_Body = document.querySelector('body')
        var elCell = document.querySelectorAll('cel.shown')

        elBtnDarkMode_Body.style.backgroundColor = 'black'
        for (var i = 0; i < elCell.length; i++) {
            elCell[i].style.backgroundColor = 'red'
        }
        // gGame.darkMode = false
    }
}

function getHint(idx) {
    gHintOn = true

    var img = document.querySelector(`#hint-${idx}`)

    if (gHintOn) {
        img.src = "img/hint-on.png"

    }
}
