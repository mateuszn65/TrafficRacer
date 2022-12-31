import {Car} from "./Car.js"

export class Mustang extends Car{
    constructor(object, controls, roadRoot){
        super(object, controls, roadRoot)
        this.setMeshes(this.extractMeshes())

    }
    extractMeshes(){
        const params = {}
        params.bodyMesh = this.root.children.find(mesh=> mesh.name == "FordMustangGT_LOD0")
        params.wheels = this.root.children.filter(mesh=> mesh.name.startsWith("Wheel"))
        params.frontLeftWheelMesh = this.root.children.find(mesh=> mesh.name == "Wheel_FL")
        params.frontRightWheelMesh = this.root.children.find(mesh=> mesh.name == "Wheel_FR")
        return params
    }
}