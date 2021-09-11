import { io} from 'socket.io-client'

const socket = io("http://localhost:3000")

socket.on("connect", () => {
  JOIN_ROOM_SCREEN.style.display = "flex"
})

socket.on("move", (tileID) => {
  const tile = document.getElementById(tileID)
  placeBlock(tile, false)
  if (notEnd){
    unblockTiles()
  }
})

socket.on("newGame-recieve", () => {
  newGame()
  blockTiles() 
})

socket.on("waitForOtherPlayer", () => {
  ROOM_JOIN_BUTTON.remove()
  ROOM_INPUT.remove()
  ROOM_FORM.querySelector("label").innerText = "Wait for other player to join this room."
})

socket.on("roomFull", () => {
  alert("Room full!")
})

socket.on("startGame", (blue) => {
  JOIN_ROOM_SCREEN.style.display = "none"
  if (blue){
    blockTiles()
  }
})

socket.on("otherDisconnected", () => {
  alert("The other player disconnected.")
  location.reload()
})

const ANIMATION_TIME = 1000
const SIZE = 8;

const GRID = document.querySelector(".container")
const ENDSCREEN = document.querySelector(".endscreen")
const newGameButton = document.querySelector(".btn-new-game")
const JOIN_ROOM_SCREEN = document.querySelector(".room-select")
const ROOM_FORM = JOIN_ROOM_SCREEN.querySelector("#form")
const ROOM_INPUT = JOIN_ROOM_SCREEN.querySelector("#room")
const ROOM_JOIN_BUTTON = JOIN_ROOM_SCREEN.querySelector(".btn-join-room")

const tiles = []
let redsTurn = true
let notEnd = true

newGameButton.addEventListener("click", () => {
  newGame()
  socket.emit("newGame")
})

ROOM_FORM.addEventListener("submit", (e) => {
  e.preventDefault()

  const room = ROOM_INPUT.value

  if (room === ""){
    alert("Please fill the name of the room you want to join.")
  } else{
    socket.emit("roomJoin", room)
  }
})

function newGame(){
  tiles.forEach((item) => {
    item.className = ""
  });
  GRID.classList.remove("blues-turn")
  redsTurn = true
  notEnd = true
  ENDSCREEN.style.display = "none"
}

function prepareGrid(){
  for (var i = 0; i < SIZE*SIZE; i++) {
    const tile = document.createElement("div")
    tile.id = i
    GRID.appendChild(tile)
    tile.addEventListener("click", (e) => placeBlock(e.target, true))
    tiles[i] = tile
  }
}

function placeBlock(clickedTile, emit){
  if (!clickedTile.classList.contains("taken")){
    const targetTile = findTargetTile(clickedTile)
    if (redsTurn){
      targetTile.classList.add("red", "taken")
    }else{
      targetTile.classList.add("blue", "taken")
    }
    checkForWins()
    if (notEnd) checkForTie()
    redsTurn = !redsTurn
    GRID.classList.toggle("blues-turn")
    if (emit){
      socket.emit("move", targetTile.id)
      blockTiles()
    }
  }
}

function findTargetTile(tile){
  let index = 0
  for (var i = 0; i < tiles.length; i++) {
    if (tiles[i] === tile){
      index = i
      break
    }
  }
  while ((index + SIZE < SIZE * SIZE) && !tiles[index + SIZE].classList.contains('taken')) {
    index += SIZE
  }
  return tiles[index]
}

function checkForTie(){
  const check = tiles.every((tile) => tile.classList.contains("taken"))
  if (!check) return
  showEndScreen("It's a tie!")
}

function checkForWins(){
  let color = redsTurn ? "red" : "blue"
  for (var i = 0; i < tiles.length; i++) {
    if (tiles[i].classList.contains(color)){
      checkRight(color, i)
      checkUp(color, i)
      checkDownRight(color, i)
      checkDownLeft(color, i)
    }
    if (!notEnd){
      break
    }
  }
}

function checkUp(player, pos){
    let next = 0
    let winning = []
    winning[0] = tiles[pos]
    for (var i = 1; i < 4; i++) {
        next = pos - i*SIZE
        winning[i] = tiles[next]
      if (next < 0){
        return
      } else if (!tiles[next].classList.contains(player)){
        return
      }
    }
    winning.forEach((item) => {
      item.classList.add("winning")
    });

    showEndScreen(`Player ${player} wins!`)
  }

  function checkRight(player, pos){
    let next = 0
    let winning = []
    winning[0] = tiles[pos]
    for (var i = 1; i < 4; i++) {
        next = pos + i
        winning[i] = tiles[next]
      if (next % SIZE === 0){
        return
      } else if (!tiles[next].classList.contains(player)){
        return
      }
    }
    winning.forEach((item) => {
      item.classList.add("winning")
    });

    showEndScreen(`Player ${player} wins!`)
  }

  function checkDownLeft(player, pos){
    let next = 0
    let winning = []
    winning[0] = tiles[pos]
    for (var i = 1; i < 4; i++) {
      next = pos + i*SIZE - i
      winning[i] = tiles[next]
      if ((next % SIZE === SIZE - 1) || (next >= SIZE * SIZE)){
        return
      }else if (!tiles[next].classList.contains(player)){
        return
      }
    }
    winning.forEach((item) => {
      item.classList.add("winning")
    });

    showEndScreen(`Player ${player} wins!`)
  }

  function checkDownRight(player, pos){
    let next = 0
    let winning = []
    winning[0] = tiles[pos]
    for (var i = 1; i < 4; i++) {
      next = pos + i*SIZE + i
      winning[i] = tiles[next]
      if ((next % SIZE === 0) || (next >= SIZE * SIZE)){
        return
      }else if (!tiles[next].classList.contains(player)){
        return
      }
    }
    winning.forEach((item) => {
      item.classList.add("winning")
    });

    showEndScreen(`Player ${player} wins!`)
  }

  function showEndScreen(message){
    notEnd = false
    blockTiles()
    setTimeout(() => {
    ENDSCREEN.style.display = "flex"
    ENDSCREEN.querySelector("p").innerText = message
    }, ANIMATION_TIME)
  }

  function blockTiles(){
    tiles.forEach((tile) => {
      tile.classList.add("disabled")
    })
  }

  function unblockTiles(){
    tiles.forEach((tile) => {
      tile.classList.remove("disabled")
    })
  }

prepareGrid()
