import * as THREE from "three";
import Stats from 'stats.js';
import { Mustang } from "./Mustang.js";
import { CarControls } from "./CarControls.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import mustang from "../static/models/Mustang.fbx"
import roadTexture from "../static/textures/road.jpg"
import fiat from "../static/models/Fiat500.fbx"

//LOADERS
const fbxLoader = new FBXLoader();
const textureLoader = new THREE.TextureLoader()
// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, -8);
camera.lookAt(0, 0, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true
document.getElementById("canvas-container").appendChild(renderer.domElement);
let requestId


// STATS
const stats = new Stats();
stats.dom.style.left = ""
stats.dom.style.right = 0
// stats.dom.style.
document.getElementById("canvas-container").appendChild(stats.dom);


// LIGHTS
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(1, 10, 15);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6, 0.5, 1);
spotLight.position.set(0, 10, -15);
scene.add(spotLight);

//car
let car
const clock = new THREE.Clock()
const carControls = new CarControls()
let loaded = {
    'car': false,
    'obstacle': false,
}

const roadSegmentLength = 100;
const roadSegmentWidth = 25;
let roadSegments = [];
let obstacles = [];
let moveable = []
let collidableMeshList = []
const noObstacles = 10
const roadLine = roadSegmentWidth / 8 * 1 - 0.3
const xPos = [-roadLine * 3, -roadLine, roadLine, roadLine * 3]
const obstaclesModels = []
let gameStartTime
// UI
const mainMenu = document.getElementById('main-menu-container')
const gameOverMenu = document.getElementById('menu-container')
const scoreElement = document.getElementById('score')
const closeCallElement = document.getElementById('close-call-bonus')
const oppositeBonusElement = document.getElementById('opposite-bonus')
const loadingContainer = document.getElementById('loading-container')
const loadingText = document.getElementById('loading-text')
const menuTitle = document.querySelector('.game-over')
const maxSpeedBonusElement = document.getElementById('max-speed-bonus')
// GAME SCORE
let prevZPosition = 0
const scoreMultiplier = 0.2
let score = 0
let closeBonus = 0
let gameMode = ''
let timeFromLastCloseCall = Date.now() + 1000
let closeCallDelay = 1000
let closeBonusDuration = 5000
let highScore = {
  "OneWay":0,
  "TwoWay":0
}

function loadCarFBX(){
  fbxLoader.load(fiat, (object) => {
    const carFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.7, 2,1,1), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true , visible:false}))
    carFrame.position.set(0, 0, 0.35)
    carFrame.name = "hitbox"
    object.add(carFrame)
    object.position.y = 0.15
    obstaclesModels.push(object)
    loaded.obstacle = true
    loadedAll()
  })
}



function loadMustang() {
  fbxLoader.load(mustang, (object) => {
    object.scale.set(1.6, 1.6, 1.6)
    car = new Mustang(object, carControls, moveable)
    scene.add(object)
    loaded.car = true
    loadedAll()
  })
}

function loadedAll() {
  if (loaded.car && loaded.obstacle) {
    loadingContainer.style.display = 'none'
    mainMenu.style.display = 'flex'
    loadingText.style.display = 'none'
  }
}

function initRoad() {
  const roadSegmentGeometry = new THREE.PlaneGeometry(roadSegmentWidth, roadSegmentLength);;
  const roadSegmentMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load(roadTexture) })
  for (let i = 0; i < 5; i++) {
    const roadSegment = new THREE.Mesh(roadSegmentGeometry, roadSegmentMaterial);
    roadSegment.position.set(0, 0, i * roadSegmentLength);
    roadSegment.rotateX(-Math.PI / 2)
    const roadBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.5, roadSegmentLength, 1, 1, roadSegmentLength, 1), new THREE.MeshPhongMaterial({ color: "grey", wireframe: true }))
    roadBarrier.position.set(-roadSegmentWidth / 2 + .5, 0, 0)
    const roadBarrier2 = roadBarrier.clone()
    roadBarrier2.position.set(roadSegmentWidth / 2 - .5, 0, 0)
    roadSegment.add(roadBarrier)
    roadSegment.add(roadBarrier2)
    roadSegments.push(roadSegment);
    moveable.push(roadSegment)
    scene.add(roadSegment);
  }
}
function initObstacles() {
  for (let i = 0; i < noObstacles; i++) {
    const obstacle = obstaclesModels[Math.floor(Math.random()*obstaclesModels.length)].clone()
    const x = Math.floor(Math.random() * 4)
    obstacle.position.x = xPos[x]
    obstacle.position.z = i / (noObstacles / 5) * roadSegmentLength + roadSegmentLength / 2
    obstacle.userData['xIndex'] = x
    if(gameMode == 'TwoWay' && (x == 2 || x == 3)){
      obstacle.rotateZ(Math.PI)
    }
    obstacles.push(obstacle);
    moveable.push(obstacle)
    collidableMeshList.push(obstacle.getObjectByName("hitbox"))
    scene.add(obstacle);
  }
}

function changeLineValue(oldObstacle) {
  if (oldObstacle.userData.xIndex == 0) {
    if (Math.floor(Math.random() * 2)){
      oldObstacle.userData.xIndex = 1
      oldObstacle.position.x += 2 * roadLine
    }
    return true
  }
  if (oldObstacle.userData.xIndex == 3) {
    if (Math.floor(Math.random() * 2)){
      oldObstacle.userData.xIndex = 2
      oldObstacle.position.x -= 2 * roadLine
    }
    return true
  }
  const changeLine = Math.floor(Math.random() * 3)
  if (oldObstacle.userData.xIndex == 2){
    if (changeLine == 2){
      oldObstacle.userData.xIndex = 3
      oldObstacle.position.x += 2 * roadLine
      return true
    }
    if (changeLine == 1){
      oldObstacle.userData.xIndex  = 1
      oldObstacle.position.x -= 2 * roadLine
      if (gameMode == 'TwoWay'){
        oldObstacle.rotateZ(Math.PI)
        return false
      }
    }
    return true
  }
  if (oldObstacle.userData.xIndex == 1){
    if (changeLine == 2){
      oldObstacle.userData.xIndex = 2
      oldObstacle.position.x += 2 * roadLine
      if (gameMode == 'TwoWay'){
        oldObstacle.rotateZ(Math.PI)
        return false
      }
      return true
    }
    if (changeLine == 1){
      oldObstacle.userData.xIndex  = 0
      oldObstacle.position.x -= 2 * roadLine
    }
  }
  return true
}

function updateObstacles() {
  obstacles.sort((a, b) => a.position.z - b.position.z)

  if (obstacles[0].position.z < -roadSegmentLength) {
    const oldObstacle = obstacles.shift()
    if(changeLineValue(oldObstacle)){
      oldObstacle.position.z = obstacles[obstacles.length - 1].position.z + (5 / noObstacles) * roadSegmentLength;
      if (oldObstacle.position.z > roadSegmentLength * 4)
        oldObstacle.position.z = roadSegmentLength * 4
    }
    obstacles.push(oldObstacle);
    return
  }

  if (obstacles[noObstacles-1].position.z > roadSegmentLength * 4) {
    const oldObstacle = obstacles.pop()
    if(changeLineValue(oldObstacle)){
      oldObstacle.position.z = obstacles[0].position.z - (5 / noObstacles) * roadSegmentLength;
    if (oldObstacle.position.z < -roadSegmentLength)
      oldObstacle.position.z = -roadSegmentLength
    }
    obstacles.unshift(oldObstacle)
  }
}

function updateRoad() {
  if (roadSegments[0].position.z < -roadSegmentLength) {
    const oldRoadSegment = roadSegments.shift()
    oldRoadSegment.position.z = roadSegments[roadSegments.length - 1].position.z + roadSegmentLength;
    roadSegments.push(oldRoadSegment);
    return
  }

  if (roadSegments[0].position.z > roadSegmentLength / 4) {
    const oldRoadSegment = roadSegments.pop()
    oldRoadSegment.position.z = roadSegments[0].position.z - roadSegmentLength;
    roadSegments.unshift(oldRoadSegment)
  }


}

function checkForCloseCalles() {
  if (Date.now() - timeFromLastCloseCall < closeCallDelay)
    return
  if (checkForCollisions(car.carOuterFrame.position.clone(), car.carOuterFrame.geometry.attributes.position.array) && car && car.speed) {
    closeBonus += 10
    timeFromLastCloseCall = Date.now()
    closeCallElement.parentElement.style.display = "block"
    closeCallElement.textContent = closeBonus
  }
  if (Date.now() - timeFromLastCloseCall > closeBonusDuration) {
    closeCallElement.parentElement.style.display = "none"
    closeBonus = 0
  }
}

function checkForCrash() {
  if (!carControls.playing || Date.now() - gameStartTime < 1000)
    return
  if (checkForCollisions(car.carInnerFrame.position.clone(), car.carInnerFrame.geometry.attributes.position.array)) {
    cancelAnimationFrame(requestId);
    closeCallElement.parentElement.style.display = 'none'
    maxSpeedBonusElement.parentElement.style.display = 'none'
    oppositeBonusElement.parentElement.style.display = 'none'
    updateHighScore()
    gameOverMenu.style.display = 'flex' 
  }
}

function updateHighScore(){
  score = Math.floor(score)
  if(score > highScore[gameMode]){
    highScore[gameMode] = score
    menuTitle.textContent = `Game Over \n New High Score: ${score}!`
  }else{
    menuTitle.textContent = `Game Over \n Score: ${score}`
  }
}

function checkForBarrierCollision() {
  if (roadSegments[0].position.x > 10) {
    carControls.outRight = true
  } else {
    carControls.outRight = false
  }
  if (roadSegments[0].position.x < -10) {
    carControls.outLeft = true
  } else {
    carControls.outLeft = false
  }
}
function checkForCollisions(originPoint, positions, collidableList = collidableMeshList) {
  for (var i = 0; i < positions.length; i += 3) {
    const localVertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
    const globalVertex = localVertex.applyMatrix4(car.carInnerFrame.matrix);
    const directionVector = globalVertex.sub(car.carInnerFrame.position);

    const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    const collisionResults = ray.intersectObjects(collidableList);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())
      return true
  }

  return false
}

const obstaclesSpeed = 30
function updateObstaclesPosition(delta) {
  obstacles.forEach(obstacle => {

    if(gameMode == 'TwoWay' && (obstacle.userData.xIndex == 2 || obstacle.userData.xIndex == 3)){
      obstacle.position.z -= obstaclesSpeed * delta
    }
    else{
      obstacle.position.z += obstaclesSpeed * delta
    }
  })
}


let oppositeDirectionBonus = 0
function calculateOppositeDirectionBonus(delta){
  if(roadSegments[0].position.x < 0){
    oppositeDirectionBonus += delta
    oppositeBonusElement.textContent = Math.floor(oppositeDirectionBonus)
    oppositeBonusElement.parentElement.style.display = 'block'
  }else{
    oppositeDirectionBonus = 0
    oppositeBonusElement.parentElement.style.display = 'none'
  }
}
let maxSpeedBonus = 0
function calculateMaxSpeedBonus(delta){
  if(car.speed == car.MAX_SPEED){
    maxSpeedBonus += delta
    maxSpeedBonusElement.textContent = Math.floor(maxSpeedBonus)
    maxSpeedBonusElement.parentElement.style.display = 'block'
  }else{
    maxSpeedBonus = 0
    maxSpeedBonusElement.parentElement.style.display = 'none'
  }
}

function updateScore(delta) {
  const currZPosition = roadSegments[0].position.z
  let diff = prevZPosition - currZPosition

  if (currZPosition > prevZPosition)
    diff = 0

  prevZPosition = currZPosition

  if(gameMode == 'TwoWay'){
    calculateOppositeDirectionBonus(delta)
  }
  calculateMaxSpeedBonus(delta)
  score += (diff + closeBonus / 10 + oppositeDirectionBonus + maxSpeedBonus / 10) * scoreMultiplier
  scoreElement.textContent = Math.floor(score)

}

function render() {
  requestId = requestAnimationFrame(render);
  const delta = clock.getDelta()
  // orbitControls.update();
  stats.update()

  if (car) {
    car.update(delta)

    
    updateRoad()
    updateObstacles()
    checkForBarrierCollision()
    
    updateObstaclesPosition(delta)
    updateScore(delta)
    checkForCloseCalles()
    checkForCrash()
  }



  renderer.render(scene, camera);

}











// RESIZE HANDLER
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // keyDisplayQueue.updatePosition()
}

function resetGame(e) {
  document.getElementById("menu-container").style.display = 'none'
  score = 0
  closeBonus = 0

  timeFromLastCloseCall = Date.now() + 1000
  moveable.forEach(element => {
    scene.remove(element)
  })

  roadSegments = []
  obstacles = [];
  moveable.splice(0,moveable.length)
  collidableMeshList = []
  carControls.reset()
  car.reset()
  if(e.target.id == "play-again-button")
  startGame()
}
function startOneWayGame(e) {
  gameMode = 'OneWay'
  startGame()
}

function startTwoWayGame(e) {
  gameMode = 'TwoWay'
  startGame()
}
function startGame(){
  gameStartTime = Date.now()
  mainMenu.style.display = 'none'
  scoreElement.parentElement.style.display = 'inline'
  initRoad()
  initObstacles()
  render();
}

function returnToMenu(e){
  gameOverMenu.style.display = 'none'
  mainMenu.style.display = 'flex'
  resetGame(e)
}

window.addEventListener('keydown', carControls.keyDown.bind(carControls))

window.addEventListener('keyup', carControls.keyUp.bind(carControls))
window.addEventListener('resize', onWindowResize);
document.getElementById("play-again-button").addEventListener("click", resetGame);
document.getElementById("play-one-button").addEventListener("click", startOneWayGame);
document.getElementById("play-two-button").addEventListener("click", startTwoWayGame);
document.getElementById("menu-return-button").addEventListener("click", returnToMenu);


loadCarFBX()
loadMustang()
