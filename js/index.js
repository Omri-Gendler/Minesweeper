'use strict'
const MINE = '💣'
const FLAG = '⛳'
const WON = '🤩'

var gBoard
var gCountMines
var gMinesLeftOnBoard
var gClicked
var gTimerInterval
var gCountLives
var LIFE
var gCountHints
var HINT

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    flags: 0,
    firstClick: 0,
    darkMode: false,
}
const gLevel = {
    SIZE: 4,
    MINES: 3,
}

function onInit() {
    resetGame()

    gBoard = buildBoard()
    // setRandomMines(gLevel.MINES, gBoard)
    // setMinesNegsCounts(gBoard)
    renderBoard(gBoard, '.board-container')
    console.table(gBoard)
}

function buildBoard() {
    const board = createMat(gLevel.SIZE)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    // board[0][0].isMine = true
    // board[1][1].isMine = true
    // board[1][2].isMine = true
    return board
}

function setMinesNegsCounts(board) {
    for (var rowIdx = 0; rowIdx < board.length; rowIdx++) {
        for (var colIdx = 0; colIdx < board[rowIdx].length; colIdx++) {
            if (board[rowIdx][colIdx].isMine) continue
            board[rowIdx][colIdx].minesAroundCount = countMinesNegs(rowIdx, colIdx, board)
        }
    }
}

function countMinesNegs(rowIdx, colIdx, board) {
    var minesCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) {
                gCountMines++
                minesCount++
            }
        }
    }
    return minesCount
}

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            var currCell = mat[i][j]
            const className = `cell cell-${i}-${j} ${currCell.isShown ? 'shown' : 'hidden'}`

            strHTML += `<td class="${className}" oncontextmenu="onCellMarked(this, ${i},${j})" onclick="onCellClicked(this, ${i}, ${j})">`

            if (currCell.isMarked) {
                // strHTML += currCell.isMine ? MINE : (currCell.minesAroundCount || '')
                strHTML += FLAG
            } else if (currCell.isShown) {
                strHTML += currCell.isMine ? MINE : (currCell.minesAroundCount || '')
            }
            strHTML += `</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]

    if (gGame.firstClick === 0) {
        setRandomMines(gLevel.MINES, gBoard, i, j)
        setMinesNegsCounts(gBoard)
        renderBoard(gBoard, '.board-container')
        gGame.firstClick++

    }
    // hint(i, j, gBoard)


    if (currCell.isMarked && currCell.flags) return
    if (currCell.isShown) return
    elCell.style.opacity = 1


    if (!currCell.isMine) {
        gGame.shownCount++
        console.log(' gGame.shownCount:', gGame.shownCount)
        uncoverNegs(i, j, gBoard)
        currCell.isShown = true
    }

    if (currCell.isMine) {
        removeLives()
        console.log('gCountLives:', gCountLives)
        gMinesLeftOnBoard--
        console.log('gMinesLeftOnBoard:', gMinesLeftOnBoard)
        mineTap()
        currCell.isShown = true
    }
    renderBoard(gBoard, '.board-container')
    console.log(currCell)
    checkGameOver()
}

function onCellMarked(elCell, i, j) {
    hideContentMenu()
    var currCell = gBoard[i][j]
    elCell.innerText = FLAG
    currCell.flags = true

    if (currCell.isShown) return

    if (currCell.isMarked) {
        currCell.isMarked = false
        currCell.flags = false
        gGame.flags--
    } else {
        currCell.isMarked = true
        gGame.flags++
        elCell.innerText = FLAG
    }
    // console.log(currCell)
    renderBoard(gBoard, '.board-container')
}

function checkGameOver() {

    if (isWin()) {
        isWin
    } else {
        isOver()

    }
    //     var correctFlags = 0
    //     var shownCells = 0
    //     var totalCells = gBoard.length * gBoard[0].length
    //     var totalMines = gLevel.MINES

    //     for (var i = 0; i < gBoard.length; i++) {
    //         for (var j = 0; j < gBoard[0].length; j++) {
    //             var currCell = gBoard[i][j]

    //             if (currCell.isShown) shownCells++
    //             if (currCell.isMine && currCell.isMarked) correctFlags++
    //         }

    //     }
    //     if (correctFlags === totalMines && shownCells - correctFlags === totalCells - totalMines) {
    //         gGame.isOn = false
    //     }
    //     else if (shownCells === totalCells) {
    //         gGame.isOn = false
    //     }

}



function expandShown(board, currCell) {
    if (currCell.minesAroundCount === 1) {
        countMinesNegs()
    }
}

