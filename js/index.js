'use strict'
const MINE = '💣'
const FLAG = '⛳'
const WON = '🤩'
var LIFE

var gBoard
var gCountMines
var gClicked
var gTimerInterval
var gCountLives

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
const gLevel = {
    SIZE: 4,
    MINES: 4,
}

function onInit() {

    resetGame()
    timerOff()
    timer()

    gBoard = buildBoard()
    setRandomMines(gLevel.MINES, gBoard)
    setMinesNegsCounts(gBoard)
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

            strHTML += `<td class="${className}" class="covered" oncontextmenu="onCellMarked(this, ${i},${j})" onclick="onCellClicked(this, ${i}, ${j})">`
            if (currCell.isShown) {
                strHTML += currCell.isMine ? MINE : currCell.minesAroundCount || ''
            }
            strHTML += `</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function onCellClicked(elCell, i, j, event) {
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]

    if (currCell.isMarked) return
    if (currCell.isShown) return

    elCell.style.opacity = 1

    if (!currCell.isMine) {
        uncoverNegs(i, j, gBoard)
        currCell.isShown = true
        renderBoard(gBoard, '.board-container')
    }

    if (currCell.isMine) {
        gCountMines++
        currCell.isShown = true
        removeLives()
        renderBoard(gBoard, '.board-container')

        if (gCountLives === 0) {
            document.querySelector('.lives').style.display = 'none'
            document.querySelector('.restart-btn').innerHTML = ' 🤯 '
        }
        if (gCountLives === 0) {
            openAllCells()
            checkGameOver()
            renderBoard(gBoard, '.board-container')
        }
    }
}

function onCellMarked(elCell, i, j) {
    hideContentMenu()
    elCell.innerHTML = FLAG
    gBoard[i][j].isMarked = true

}

function checkGameOver() {
    gGame.isOn = false

    isWin()
    timerOff()
    document.querySelector('.lives').style.display = 'none'

}

function expandShown(board, currCell) {
    if (currCell.minesAroundCount === 1) {
        countMinesNegs()
    }
}

