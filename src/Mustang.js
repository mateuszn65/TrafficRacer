import {Car} from "./Car.js"
import * as THREE from "three"
export class Mustang extends Car{
    constructor(object, controls, roadRoot){
        super(object, controls, roadRoot)
        this.setMeshes(this.extractMeshes())
        this.setFrames(this.createFrames())
    }
    extractMeshes(){
        const params = {}
        params.bodyMesh = this.root.children.find(mesh=> mesh.name == "FordMustangGT_LOD0")
        params.wheels = this.root.children.filter(mesh=> mesh.name.startsWith("Wheel"))
        params.frontLeftWheelMesh = this.root.children.find(mesh=> mesh.name == "Wheel_FL")
        params.frontRightWheelMesh = this.root.children.find(mesh=> mesh.name == "Wheel_FR")
        return params
    }
    createFrames(){
        const params = {}
        const carInnerFrame = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4.4,1,1,2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true , visible:false}))
        carInnerFrame.position.set(0, .5, 0)
        const carOuterFrame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1, 6.4, 1, 1, 3), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false }))
        carOuterFrame.position.set(0, .5, 0)
        params.carInnerFrame = carInnerFrame
        params.carOuterFrame = carOuterFrame
        return params
    }
}