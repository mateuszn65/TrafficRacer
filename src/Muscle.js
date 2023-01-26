import {Car} from "./Car.js"
import * as THREE from "three"
export class Muscle extends Car{
    constructor(object, controls, roadRoot){
        super(object, controls, roadRoot)
        this.modelScale = 2.5
        object.scale.set(this.modelScale, this.modelScale, this.modelScale)
        this.offSet = {x:0, y:2.4, z:0}
        object.position.set(this.offSet.x, this.offSet.y, this.offSet.z)
        this.setMeshes(this.extractMeshes())
        this.setFrames(this.createFrames())
    }
    extractMeshes(){
        const params = {}
        params.bodyMesh = this.root.children.find(mesh=> mesh.name == "Body")
        params.wheels = this.root.children.filter(mesh=> mesh.name.startsWith("W"))
        params.frontLeftWheelMesh = this.root.children.find(mesh=> mesh.name == "W1")
        params.frontRightWheelMesh = this.root.children.find(mesh=> mesh.name == "W2")
        return params
    }
    createFrames(){
        const params = {}
        const innerWidth = 3 / this.modelScale
        const innerHeight = 1 / this.modelScale
        const innerDepth = 8 / this.modelScale
        const carInnerFrame = new THREE.Mesh(new THREE.BoxGeometry(innerWidth, innerHeight, innerDepth ), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true , visible:false}))
        carInnerFrame.position.set(0, -this.offSet.y / this.modelScale + innerHeight, 0)
        carInnerFrame.name = "carInnerFrame"

        const outerWidth = 6 / this.modelScale
        const outerHeight = 1 / this.modelScale
        const outerDepth = 11 / this.modelScale
        const carOuterFrame = new THREE.Mesh(new THREE.BoxGeometry(outerWidth, outerHeight, outerDepth), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false }))
        carOuterFrame.position.set(0, -this.offSet.y / this.modelScale + innerHeight, 0)
        carOuterFrame.name = "carOuterFrame"
        params.carInnerFrame = carInnerFrame
        params.carOuterFrame = carOuterFrame
        return params
    }
}