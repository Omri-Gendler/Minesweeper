'use strict'
var gBoard

const MINE = '💣'
const LIVES = '🛟'

var gEmptyCells
var gLeftLives
var gfindSafeClickCells
var gCellRecursion = []

var gStartTime
var gTimerInterval

// hints
var gHints
var hintIsOn = false
var gExterminator
//hints: mega hint
var gMegaHintLocations = []
var gMaxMegaHint
var megaHintIsOn = false
//undo
var isUndoOn = false
var gUndoLocations
var gMaxUndo

var gSafeLocations
var gMaxSafeLocations

var gLevel = {
  SIZE: 4,
  MINES: 2,
  LIVES: 3,
}

var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }

function onInit() {
  gBoard = buildBoard()
  renderBoard(gBoard, '.board-container')
  gGame.isOn = false
  gGame.shownCount = 0
  gGame.markedCount = 0
  gHints = 3
  gMaxSafeLocations = 3
  gExterminator = 1
  gMaxMegaHint = 1
  gUndoLocations = []
  gMaxUndo = 3
  shownCount()
  markedCount()
  minesOnStart()
  gLeftLives = gLevel.LIVES
}

function buildBoard() {
  const board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: '',
        isShow: false,
        isMine: false,
        isMarked: false,
      }
    }
  }
  return board
}

function onCellClicked(elCell, i, j) {
  gUndoLocations = []
  if (megaHintIsOn) return
  if (hintIsOn) return
  if (gBoard[i][j].isMarked) return
  if (gBoard[i][j].isShow) return
  if (gLeftLives <= 0) return

  // what happend on the first press
  if (!gGame.isOn) {
    startStopwatch()
    putMinesOnRandEmptyLocations(gBoard)
    updateMinesNegCount(gBoard)
    // if at the 1st press it mine, find another empty place for the min
    if (gBoard[i][j].isMine) {
      gBoard[i][j].isMine = false
      // console.log(`it was a bomb! at first click ${i},${j}`)
      // change mine location
      var newMineIdx = getRandomIntInclusive(0, gEmptyCells.length - 1)
      var newMineLocation = gEmptyCells[newMineIdx]
      // console.log(`the bomb move to ${newMineLocation.i},${newMineLocation.j}`)
      gBoard[newMineLocation.i][newMineLocation.j].isMine = true
      renderCell(newMineLocation, gBoard[i][j].minesAroundCount)
      updateMinesNegCount(gBoard)
    }
    renderCell({ i, j }, gBoard[i][j].minesAroundCount)
    updateMinesNegCount(gBoard)
    gGame.isOn = true
    //added undo
    saveUndoLocations(i, j)
  }

  if (gGame.isOn & !gBoard[i][j].isMine) {
    if (gBoard[i][j].minesAroundCount === '') {
      // console.log(`Cell (${i},${j}) is 0, expanding...`)

      expandUncover(gBoard, elCell, i, j)
    }
    // elCell.innerHTML = gBoard[i][j].minesAroundCount
    // elCell.style.color = 'black'
    elCell.classList.add('clicked')
    gBoard[i][j].isShow = true

    renderCell({ i, j }, gBoard[i][j].minesAroundCount)
    // added undo
    saveUndoLocations(i, j)
  }

  if (gGame.isOn & gBoard[i][j].isMine) {
    saveUndoLocations(i, j)
    console.log('press on mine!')
    elCell.classList.add('clicked')
    elCell.classList.add('mine')
    gBoard[i][j].isShow = true
    renderCell({ i, j }, MINE)
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = '🤯'
    lives(-1)
    if (gLeftLives === 0) {
      gBoard[i][j].isShow = false
      return
    }
    setTimeout(() => {
      var elSmiley = document.querySelector('.smiley')
      elSmiley.innerHTML = '😀'
      elCell.classList.remove('clicked')
      elCell.classList.remove('mine')
      gBoard[i][j].isShow = false
      renderCell({ i, j }, '')
    }, 1000)

    // gameOver()
  }

  countMines()
  shownCount()
  //check if victory after the press
  isVictory()
}

function expandUncover(board, elCell, i, j) {
  var neighs = []
  var neighsrecursion = []
  var pos = { i, j }

  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i > board.length - 1) continue
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j > board[0].length - 1) continue
      if ((pos.i === i) & (pos.j === j)) continue
      neighs.push({ i, j })
    }
  }
  for (var i = 0; i < neighs.length; i++) {
    var currNeigh = neighs[i]
    // recursion
    if (board[currNeigh.i][currNeigh.j].isShow) continue
    // to prevent the situation of: if the cell marked, it sholud not show by the neighs open
    if (board[currNeigh.i][currNeigh.j].isMarked) continue
    board[currNeigh.i][currNeigh.j].isShow = true
    var className = '.' + getClassName(currNeigh)
    // console.log('className:', className)
    elCell = document.querySelector(className)
    // console.log('elCell:', elCell)
    renderCell(currNeigh, board[currNeigh.i][currNeigh.j].minesAroundCount)
    elCell.classList.add('clicked')

    if (!gUndoLocations.includes({ i: currNeigh.i }, { j: currNeigh.j })) {
      gUndoLocations.push(currNeigh)
    }

    if (board[currNeigh.i][currNeigh.j].minesAroundCount === '') {
      neighsrecursion.push(currNeigh)
    }

    for (let k = 0; k < neighsrecursion.length; k++) {
      var currCell = neighsrecursion[k]
      expandUncover(board, elCell, currCell.i, currCell.j)
    }
  }
}

//random algorithem to find empty cell for mine

function findEmptyCell(board) {
  gEmptyCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var currCell = board[i][j]
      if (!currCell.isMine) {
        gEmptyCells.push({ i, j })
      }
    }
  }
  var randIdx = getRandomIntInclusive(0, gEmptyCells.length - 1)
  var emptyCellLocation = gEmptyCells[randIdx]

  return emptyCellLocation
}

function putMinesOnRandEmptyLocations(board) {
  for (var i = 0; i < gLevel.MINES; i++) {
    var location = findEmptyCell(board)
    board[location.i][location.j].isMine = true
    gEmptyCells.splice(gEmptyCells.indexOf(location), 1)
  }
  // console.log('emptyCells:', gEmptyCells)
}
// ==================================================== //

// count the neighs
function setMinesNegsCount(pos, board) {
  var neighs = ''
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i > board.length - 1) continue
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j > board[0].length - 1) continue
      var currCell = board[i][j]
      if ((pos.i === i) & (pos.j === j)) continue
      // console.log(currCell)
      if (currCell.isMine) {
        neighs++
      }

      // console.log(`i:${i},j:${j},${currCell}`)
    }
  }
  // console.log('==============================')
  return neighs
}

// update the num of mines on the board
function updateMinesNegCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var currCell = board[i][j]
      currCell.minesAroundCount = setMinesNegsCount({ i, j }, board)
    }
  }
}

function lives(num) {
  console.log('gLeftLives:', gLeftLives)
  gLeftLives += num

  var elLives = document.querySelector('.lives span')
  switch (gLeftLives) {
    case 3:
      elLives.innerHTML = '🛟🛟🛟'
      break
    case 2:
      elLives.innerHTML = '🛟🛟'
      break
    case 1:
      elLives.innerHTML = '🛟'
      break
    case 0:
      elLives.innerHTML = '☠️'
      markAllmines()
      break
    default:
      break
  }
}

function updateLivesUndo(gLeftLives) {
  var elLives = document.querySelector('.lives span')
  switch (gLeftLives) {
    case 3:
      elLives.innerHTML = '🛟🛟🛟'
      break
    case 2:
      elLives.innerHTML = '🛟🛟'
      break
    case 1:
      elLives.innerHTML = '🛟'
      break
    case 0:
      elLives.innerHTML = '☠️'
      markAllmines()
      break
    default:
      break
  }
}

function onRestart() {
  var elSafeClickText = document.querySelector('.safeclick-container .clicks')
  elSafeClickText.innerHTML = 3
  gLevel.LIVES = 3
  var elLives = document.querySelector('.lives span')
  elLives.innerHTML = '🛟🛟🛟'
  var elSmiley = document.querySelector('.smiley')
  elSmiley.innerHTML = '😀'
  gMaxMegaHint = 1
  var elMegaHintCounr = document.querySelector('.hint-container span')
  elMegaHintCounr.innerHTML = gMaxMegaHint
  gExterminator = 1
  var elMinexterminator = document.querySelector('.mineexterminator-container span')
  elMinexterminator.innerHTML = gExterminator
  gMegaHintLocations = []
  megaHintIsOn = false
  gMaxUndo = 3
  var elMaxUndo = document.querySelector('.undo-container .clicks')
  elMaxUndo.innerHTML = gMaxUndo
  resetHints()
  resetStopwatch()
  onInit()
}

// we press on the last mine, all mines shows
function markAllmines() {
  var minesLocation = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j]
      if (currCell.isMine) {
        minesLocation.push({ i, j })
      }
    }
  }
  for (var i = 0; i < minesLocation.length; i++) {
    var currMine = minesLocation[i]
    gBoard[currMine.i][currMine.j].isMine = true
    renderCell(currMine, MINE)
    var elClassName = '.' + getClassName(currMine)
    var elCell = document.querySelector(elClassName)
    elCell.classList.add('clicked')
  }
  var elSmiley = document.querySelector('.smiley')
  elSmiley.innerHTML = '🤯'
  gGame.isOn = false
  stopStopwatch()
}

function onCellMarked(ev) {
  console.log('ev.detail:', ev.detail)
  if (isVictory() || !gGame.isOn) return
  console.log('hi:')
  if (ev.button === 2) {
    ev.preventDefault() //

    var classNameCell = '.' + ev.srcElement.classList[1]
    var elCell = document.querySelector(classNameCell)

    // console.log(classNameCell.indexOf('-') + 1)
    // console.log(classNameCell.indexOf('-', classNameCell.indexOf('-') + 1) + 1)

    // find the indexes of {i,j} of the cell
    var cellIdx = {
      i: +classNameCell[classNameCell.indexOf('-') + 1],
      j: +classNameCell[classNameCell.indexOf('-', classNameCell.indexOf('-') + 1) + 1],
    }
    // you cant mark a cell if it show!
    if (gBoard[cellIdx.i][cellIdx.j].isShow) return

    if (!gBoard[cellIdx.i][cellIdx.j].isMarked) {
      //Model Update:
      gBoard[cellIdx.i][cellIdx.j].isMarked = true

      //Dom Update:
      elCell.innerHTML = '🚩'
      if (isVictory()) {
      }
    } else if (gBoard[cellIdx.i][cellIdx.j].isMarked) {
      //Model Update:
      gBoard[cellIdx.i][cellIdx.j].isMarked = false
      //Dom Update:
      elCell.innerHTML = ''
    }

    // console.log('cellIdx.i:', cellIdx.i)
    // console.log('cellIdx.j:', cellIdx.j)
    markedCount()
    countMines()
  }
  isVictory()
}

function onDiffchose(elBtn) {
  console.log('elBtn.innerHTML:', elBtn.innerHTML)
  if (elBtn.innerHTML === 'Beginner') {
    gLevel.SIZE = 4
    gLevel.MINES = 2
  } else if (elBtn.innerHTML === 'Medium') {
    gLevel.SIZE = 8
    gLevel.MINES = 14
  } else if (elBtn.innerHTML === 'Expert') {
    gLevel.SIZE = 12
    gLevel.MINES = 32
  }

  onRestart()
}

function isVictory() {
  var ifEmpty = []
  for (var i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j]
      if (
        (currCell.isMine === true && currCell.isMarked === false) ||
        (currCell.isMine === false && currCell.isShow === false)
      ) {
        // console.log(`push the idx:${i},${j}`)
        ifEmpty.push(currCell)
      }
    }
  }
  // console.log('ifEmpty:', ifEmpty)
  if (ifEmpty.length === 0) {
    console.log('win')
    gGame.isOn = false
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = '😎'
    stopStopwatch()
    return true
  }
  return false
}

function shownCount() {
  gGame.shownCount = 0
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j]
      if (currCell.isShow & !currCell.isMine) {
        gGame.shownCount++
      }
    }
  }
  var elCell = document.querySelector('.numsgame .showcount')
  elCell.innerHTML = gGame.shownCount
}

function markedCount() {
  gGame.markedCount = 0
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j]
      if (currCell.isMarked) {
        gGame.markedCount++
      }
    }
  }
  var elCell = document.querySelector('.numsgame .markedcount')
  elCell.innerHTML = gGame.markedCount
}

//Bonuses!

//bonus:Hints

function onHintClick(el) {
  if (!gGame.isOn) return
  el.innerHTML = '💡'
  hintIsOn = true
  // expandUncover(gBoard, el, i, j)
  // if ((el.innerHTML = '💡')) return
}
function onCellClickedHint(i, j) {
  if (!hintIsOn || gHints === 0 || gBoard[i][j].isShow) return
  if (hintIsOn) {
    // console.log('i:', i)
    // console.log('j:', j)
    expandUncoverHint(gBoard, i, j)
    gHints += -1
  }
  hintIsOn = false
}

function expandUncoverHint(board, i, j) {
  var neighs = []
  var pos = { i, j }
  var originalContent = {}
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i > board.length - 1) continue
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j > board[0].length - 1) continue
      if (board[i][j].isShow) continue
      // if ((pos.i === i) & (pos.j === j)) continue

      neighs.push({ i, j })
    }
  }
  // console.log('neighs:', neighs)
  for (var i = 0; i < neighs.length; i++) {
    var currNeigh = neighs[i]
    board[currNeigh.i][currNeigh.j].isShow = true
    var className = '.' + getClassName(currNeigh)
    // console.log('className:', className)
    var elCell = document.querySelector(className)
    // console.log('elCell:', elCell)
    console.log('className:', className)
    originalContent[className] = elCell.innerHTML
    console.log('originalContent[className]:', originalContent[className])
    if (board[currNeigh.i][currNeigh.j].isMine) {
      renderCell(currNeigh, MINE)
    } else {
      renderCell(currNeigh, board[currNeigh.i][currNeigh.j].minesAroundCount)
    }
    elCell.classList.add('clickedonhint')
  }
  setTimeout(() => {
    for (var i = 0; i < neighs.length; i++) {
      var currNeigh = neighs[i]
      board[currNeigh.i][currNeigh.j].isShow = false
      var className = '.' + getClassName(currNeigh)
      // console.log('className:', className)
      var elCell = document.querySelector(className)
      // console.log('elCell:', elCell)

      elCell.innerHTML = originalContent[className]
      renderCell(currNeigh, originalContent[className])
      elCell.classList.remove('clickedonhint')
    }
  }, 1000)
}

function resetHints() {
  var elHints = document.querySelectorAll('.hints')
  for (var i = 0; i < elHints.length; i++) {
    var currHint = elHints[i]
    currHint.innerHTML = '🔦'
  }
}

//bonus: safeClick

function safeClick() {
  gSafeLocations = []
  if (!gGame.isOn) return
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j]
      if (currCell.isMine || currCell.isShow || currCell.isMarked) continue
      gSafeLocations.push({ i, j })
    }
  }
  if (gSafeLocations.length === 0) return
  console.log(gSafeLocations)
  var randIdx = getRandomIntInclusive(0, gSafeLocations.length - 1)
  var randCell = gSafeLocations[randIdx]
  console.log('randCell:', randCell)
  gBoard[randCell.i][randCell.j].isShow = true
  renderCell(randCell, gBoard[randCell.i][randCell.j].minesAroundCount)
  var className = '.' + getClassName(randCell)
  var elCell = document.querySelector(className)
  elCell.classList.add('clickedonsafeclick')
  setTimeout(() => {
    gBoard[randCell.i][randCell.j].isShow = false
    renderCell(randCell, gBoard[randCell.i][randCell.j].minesAroundCount)
    var className = '.' + getClassName(randCell)
    var elCell = document.querySelector(className)
    elCell.classList.remove('clickedonsafeclick')
  }, 1500)
  // delete the {i,j} you chose before
  gSafeLocations.splice(randIdx, 1)
  gMaxSafeLocations--
  var elClicksAvailable = document.querySelector('.safeclick-container .clicks')
  // console.log(elClicksAvailable)
  elClicksAvailable.innerHTML = gMaxSafeLocations
}

function onSafeClick() {
  if (gMaxSafeLocations === 0) return
  safeClick()
}

// bonus:light mode

function onLightMode() {
  var elBody = document.body
  var elBtn = document.querySelector('.lightmode')

  // console.log(elBtn)

  elBody.classList.toggle('lightmodebackground')

  if (elBody.classList.contains('lightmodebackground')) {
    elBtn.innerText = '🌙 Dark Mode'
  } else {
    elBtn.innerText = '☀️ Light Mode'
  }
}

//bonus:mine exterminator

function minesOnStart() {
  var elMine = document.querySelector('.minescount')
  elMine.innerHTML = gLevel.MINES
}

function countMines() {
  var countMines = 0
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine & !gBoard[i][j].isMarked) {
        countMines++
      }
    }
  }
  var elMine = document.querySelector('.minescount')
  elMine.innerHTML = countMines
}

// check from here on MineExterminator

function getMineLocation() {
  if (gLevel.SIZE >= 12) {
  }
  var minesLocations = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine & !gBoard[i][j].isMarked) {
        minesLocations.push({ i, j })
      }
    }
  }
  return minesLocations
}
function onMineExterminator() {
  if (!gGame.isOn || gExterminator === 0) return
  var minesLocations = getMineLocation()
  var randIdx = getRandomIntInclusive(0, minesLocations.length)

  for (var i = 0; i < 3; i++) {
    var randIdx = getRandomIntInclusive(0, minesLocations.length - 1)
    var currMine = minesLocations[randIdx]
    console.log(currMine)
    //update the model
    gBoard[currMine.i][currMine.j].isMine = false
    //update the dom
    renderCell(currMine, '')
    minesLocations.splice(randIdx, 1)
  }

  gExterminator--
  countMines()
  updateMinesNegCount(gBoard)
  updateBoardNumsAfterExterminator(gBoard)
  var elMinexterminator = document.querySelector('.mineexterminator-container span')
  elMinexterminator.innerHTML = gExterminator
}

function updateBoardNumsAfterExterminator(gBoard) {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isShow) renderCell({ i, j }, gBoard[i][j].minesAroundCount)
    }
  }
}
//MegaHint

function megaHint(elCell, i, j) {
  if (!megaHintIsOn) return

  var cellsToExpose = []

  if (gMegaHintLocations.length < 2) {
    gMegaHintLocations.push({ i, j })
  }

  if (gMegaHintLocations.length === 2) {
    var startLoc = gMegaHintLocations[0]
    var endLoc = gMegaHintLocations[1]
    console.log('startLoc:', startLoc)
    console.log('endLoc:', endLoc)
    if (startLoc.i > endLoc.i) {
      console.log('hi')
      gMegaHintLocations = []
      return
    }

    for (var i = startLoc.i; i < endLoc.i + 1; i++) {
      for (var j = startLoc.j; j < endLoc.j + 1; j++) {
        cellsToExpose.push({ i, j })
      }
    }
    expandUncoverMegaHint(cellsToExpose)
  }
}

function expandUncoverMegaHint(cellsToExpose) {
  var originalContent = {}
  for (var i = 0; i < cellsToExpose.length; i++) {
    var currCell = cellsToExpose[i]
    gBoard[currCell.i][currCell.j].isShow = true
    var className = '.' + getClassName(currCell)
    // console.log('className:', className)
    var elCell = document.querySelector(className)
    // console.log('elCell:', elCell)
    console.log('className:', className)
    originalContent[className] = elCell.innerHTML
    console.log('originalContent[className]:', originalContent[className])
    if (gBoard[currCell.i][currCell.j].isMine) {
      renderCell(currCell, MINE)
    } else {
      renderCell(currCell, gBoard[currCell.i][currCell.j].minesAroundCount)
    }
    elCell.classList.add('clickedonhint')
  }

  setTimeout(() => {
    for (var i = 0; i < cellsToExpose.length; i++) {
      var currCell = cellsToExpose[i]
      gBoard[currCell.i][currCell.j].isShow = false
      var className = '.' + getClassName(currCell)
      // console.log('className:', className)
      var elCell = document.querySelector(className)
      // console.log('elCell:', elCell)

      elCell.innerHTML = originalContent[className]
      renderCell(currCell, originalContent[className])
      elCell.classList.remove('clickedonhint')
    }
  }, 2000)
  gMaxMegaHint--
  megaHintIsOn = false
  var elMegaHintCounr = document.querySelector('.hint-container span')
  elMegaHintCounr.innerHTML = gMaxMegaHint
}

function onMegaHintBtn() {
  if (!gGame.isOn || gMaxMegaHint === 0) return
  megaHintIsOn = true
}

//undo
// save the last click lcation / locations if it recursion
function saveUndoLocations(i, j) {
  var location = { i, j }
  gUndoLocations.push(location)

  // console.log('im the undo button')
  // console.log(gUndoLocations)
}

function onUndoClick() {
  if (!gGame.isOn || gMaxUndo === 0 || gUndoLocations.length === 0) return
  isUndoOn = true
  for (var i = 0; i < gUndoLocations.length; i++) {
    var currLocation = gUndoLocations[i]
    //model
    gBoard[currLocation.i][currLocation.j].isShow = false
    //render
    if (gBoard[currLocation.i][currLocation.j].isMine) {
      gLeftLives++
      updateLivesUndo(gLeftLives)
      console.log('gLeftLives:', gLeftLives)
    }
    var elCell = document.querySelector('.' + getClassName(currLocation))
    elCell.classList.remove('clicked')
  }
  gMaxUndo--
  var elMaxUndo = document.querySelector('.undo-container .clicks')
  elMaxUndo.innerHTML = gMaxUndo
  gUndoLocations = []

  shownCount()
}

function onCellTouch(el) {
  console.log(el)
}
