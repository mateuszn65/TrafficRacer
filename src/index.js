import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js';
import { Mustang } from "./Mustang.js";
import { CarControls } from "./CarControls.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


//TEXTURES
import placeholder from './textures/placeholder/placeholder.png'
import lensflare2 from "./textures/lensflare2.jpg"
import lensflare0 from "./textures/lensflare0.png"
import mercedes from "../static/models/mercedes.fbx"
import mustang from "../static/models/Mustang.fbx"
import { Car } from "./Car.js";



//LOADERS
const fbxLoader = new FBXLoader();
const textureLoader = new THREE.TextureLoader()
// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);
// const roadRoot = new THREE.Object3D()
// scene.add(roadRoot)
// CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, -5);
// const thirdPersonCamera = new THREE.Object3D()
// thirdPersonCamera.add(camera)
// scene.add(thirdPersonCamera)

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true
document.getElementById("canvas-container").appendChild(renderer.domElement);
let requestId

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
// orbitControls.enableDamping = true
// orbitControls.minDistance = 5
// orbitControls.maxDistance = 15
// orbitControls.enablePan = false
// orbitControls.maxPolarAngle = Math.PI / 2 - 0.05


// STATS
const stats = new Stats();
stats.dom.style.left = ""
stats.dom.style.right = 0
// stats.dom.style.
document.getElementById("canvas-container").appendChild(stats.dom);


// LIGHTS
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 10, -15);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
scene.add(pointLightHelper);

scene.add(pointLight);


//car
let car
const clock = new THREE.Clock()
const carControls = new CarControls()

const roadSegmentLength = 100;
const roadSegmentWidth = 25;
const obstacleSize = 4.4
let roadSegments = [];
let obstacles = [];
let moveable = []
let collidableMeshList = []
const noObstacles = 10
const roadLine = roadSegmentWidth / 8 * 1 - 0.3
const xPos = [-roadLine * 3, -roadLine, roadLine, roadLine * 3]
const carInnerFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 4.4), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true , visible:false}))
carInnerFrame.position.set(0, .5, 0)
const carOuterFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1, 6.4, 1, 1, 3), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false }))
carOuterFrame.position.set(0, .5, 0)

const mainMenu = document.getElementById('main-menu-container')
const gameOverMenu = document.getElementById('menu-container')
const scoreElement = document.getElementById('score')
const closeCallElement = document.getElementById('close-call-bonus')
const oppositeBonusElement = document.getElementById('opposite-bonus')
let prevZPosition = 0
const scoreMultiplier = 0.2
let score = 0
let closeBonus = 0
let gameMode = ''
// MATERIALS



// FLARES
// const flareA = new THREE.TextureLoader().load(lensflare2);
// const flareB = new THREE.TextureLoader().load(lensflare0);



function loadMercedes() {
  fbxLoader.load(mercedes, (object) => {
    // object.children[1].material[11].map = textureLoader.load(licence_plate)
    // object.children[1].material[11].normalMap = textureLoader.load(licence_plate_normal)
    object.scale.set(0.001, 0.001, 0.001)




    // camera.position.set(0,10,20)

    // car = new Car(object, carControls, thirdPersonCamera)
    scene.add(object)
    console.log(object)
  })
}
function loadMustang() {
  fbxLoader.load(mustang, (object) => {
    car = new Mustang(object, carControls, moveable)
    object.add(carInnerFrame)
    object.add(carOuterFrame)
    scene.add(object)
    console.log(object)
  })
}



function createBox() {
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);;
  const box = new THREE.Mesh(boxGeometry, material);
  box.position.set(0, 0, 0);
  return box
}

function initRoad() {
  const roadSegmentHeight = 2;
  const roadSegmentGeometry = new THREE.PlaneGeometry(roadSegmentWidth, roadSegmentLength);;
  const roadSegmentMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load(placeholder) })
  wrapAndRepeatTexture(roadSegmentMaterial.map)
  for (let i = 0; i < 5; i++) {
    const roadSegment = new THREE.Mesh(roadSegmentGeometry, roadSegmentMaterial);
    roadSegment.position.set(0, 0, i * roadSegmentLength);
    roadSegment.rotateX(-Math.PI / 2)
    const roadBarrier = new THREE.Mesh(new THREE.BoxGeometry(1, roadSegmentLength, 1, 1, roadSegmentLength, 1), new THREE.MeshBasicMaterial({ color: "grey", wireframe: true }))
    roadBarrier.position.set(-roadSegmentWidth / 2, 0, 0)
    const roadBarrier2 = roadBarrier.clone()
    roadBarrier2.position.set(roadSegmentWidth / 2, 0, 0)
    roadSegment.add(roadBarrier)
    roadSegment.add(roadBarrier2)
    roadSegments.push(roadSegment);
    moveable.push(roadSegment)
    scene.add(roadSegment);
  }
}
function initObstacles() {

  for (let i = 0; i < noObstacles; i++) {
    const obstacleGeometry = new THREE.BoxGeometry(obstacleSize, obstacleSize, obstacleSize);
    const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    const x = Math.floor(Math.random() * 4)
    obstacle.position.set(xPos[x], 0, i / (noObstacles / 5) * roadSegmentLength + roadSegmentLength / 2);
    obstacle.userData['xIndex'] = x
    obstacles.push(obstacle);
    moveable.push(obstacle)
    collidableMeshList.push(obstacle)
    scene.add(obstacle);
  }
}

function createPlane() {
  // const material = new THREE.MeshBasicMaterial({ color: 0x333333 });
  const material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(placeholder) })
  wrapAndRepeatTexture(material.map)
  const planeGeometry = new THREE.PlaneGeometry(30, 30);
  const plane = new THREE.Mesh(planeGeometry, material);
  plane.rotateX(-Math.PI / 2)
  scene.add(plane)
}

function wrapAndRepeatTexture(map) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.x = map.repeat.y = 10
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
let timeFromLastCloseCall = Date.now() + 1000
let closeCallDelay = 1000
let closeBonusDuration = 5000
function checkForCloseCalles() {
  if (Date.now() - timeFromLastCloseCall < closeCallDelay)
    return
  if (checkForCollisions(carOuterFrame.position.clone(), carOuterFrame.geometry.attributes.position.array) && car && car.speed) {
    console.log("close")
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
  if (!carControls.playing)
    return
  if (checkForCollisions(carInnerFrame.position.clone(), carInnerFrame.geometry.attributes.position.array)) {
    cancelAnimationFrame(requestId);
    closeCallElement.parentElement.style.display = 'none'
    gameOverMenu.style.display = 'flex'
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
    const globalVertex = localVertex.applyMatrix4(carInnerFrame.matrix);
    const directionVector = globalVertex.sub(carInnerFrame.position);

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
function updateScore(delta) {
  const currZPosition = roadSegments[0].position.z
  let diff = prevZPosition - currZPosition

  if (currZPosition > prevZPosition)
    diff = 0

  prevZPosition = currZPosition

  if(gameMode == 'TwoWay'){
    calculateOppositeDirectionBonus(delta)
  }
  score += (diff + closeBonus / 100 + oppositeDirectionBonus) * scoreMultiplier
  scoreElement.textContent = Math.floor(score)

}

function render() {
  requestId = requestAnimationFrame(render);
  const delta = clock.getDelta()
  orbitControls.update();
  stats.update()

  if (car) {
    car.update(delta)

  }

  updateRoad()
  updateObstacles()
  checkForBarrierCollision()

  updateObstaclesPosition(delta)
  updateScore(delta)
  checkForCloseCalles()
  checkForCrash()



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

window.addEventListener('keydown', e => {
  carControls.keyDown(e)
})

window.addEventListener('keyup', e => {
  carControls.keyUp(e)
})
window.addEventListener('resize', onWindowResize);
document.getElementById("play-again-button").addEventListener("click", resetGame);
document.getElementById("play-one-button").addEventListener("click", startOneWayGame);
document.getElementById("play-two-button").addEventListener("click", startTwoWayGame);
document.getElementById("menu-return-button").addEventListener("click", returnToMenu);



loadMustang()

// createPlane()
