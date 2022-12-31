import * as THREE from "three";

export class Car {
    constructor(object, controls, moveable) {
		this.moveable = moveable
        this.modelScale = object.scale
        // this.camera = camera
        this.controls = controls

        // car rigging
        this.root = object

        // car "feel" parameters
        this.MAX_SPEED = 1600;
        this.MAX_REVERSE_SPEED = -1000;

        this.MAX_WHEEL_ROTATION = 0.6;

        this.FRONT_ACCELERATION = 700;
        this.BACK_ACCELERATION = 1000;

        this.WHEEL_ANGULAR_ACCELERATION = 1.5;

        this.FRONT_DECCELERATION = 750;
        this.WHEEL_ANGULAR_DECCELERATION = 1.0;

        this.STEERING_RADIUS_RATIO = 0.02;

        this.MAX_TILT_SIDES = 0.03;
        this.MAX_TILT_FRONTBACK = 0.015;

        // internal control variables
        this.speed = 0;
        this.acceleration = 0;

        this.wheelOrientation = 0;
        this.carOrientation = 0;
    }
    setMeshes(params){
        this.bodyMesh = params.bodyMesh
        this.wheels = params.wheels
        this.frontLeftWheelMesh = params.frontLeftWheelMesh
        this.frontRightWheelMesh = params.frontRightWheelMesh
        this.frontLeftWheelRoot = new THREE.Object3D();
        this.frontRightWheelRoot = new THREE.Object3D();
        this.frontLeftWheelRoot.position.copy(this.frontLeftWheelMesh.position)
        this.frontRightWheelRoot.position.copy(this.frontRightWheelMesh.position)
        this.frontLeftWheelMesh.position.set(0,0,0)
        this.frontRightWheelMesh.position.set(0,0,0)
        this.frontLeftWheelRoot.add(this.frontLeftWheelMesh)
        this.frontRightWheelRoot.add(this.frontRightWheelMesh)
        this.root.add(this.frontLeftWheelRoot)
        this.root.add(this.frontRightWheelRoot)
    }
    setFrames(params){
        this.carInnerFrame = params.carInnerFrame
        this.carOuterFrame = params.carOuterFrame
        this.root.add(this.carInnerFrame)
        this.root.add(this.carOuterFrame)
    }
    clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
    exponentialEaseOut(k) { return k == 1 ? 1 : -Math.pow(2, -10 * k) + 1; }
    speedDecay(delta){
        if (this.speed > 0) {

            var k = this.exponentialEaseOut(this.speed / this.MAX_SPEED);

            this.speed = this.clamp(this.speed - k * delta * this.FRONT_DECCELERATION, 0, this.MAX_SPEED);
            this.acceleration = this.clamp(this.acceleration - k * delta, 0, 1);

        } else {

            var k = this.exponentialEaseOut(this.speed / this.MAX_REVERSE_SPEED);

            this.speed = this.clamp(this.speed + k * delta * this.BACK_ACCELERATION, this.MAX_REVERSE_SPEED, 0);
            this.acceleration = this.clamp(this.acceleration + k * delta, -1, 0);

        }
    }
    readControls(delta) {
        if (this.controls.directionMap.get('moveForward')) {
            this.speed = this.clamp(this.speed + delta * this.FRONT_ACCELERATION, this.MAX_REVERSE_SPEED, this.MAX_SPEED);
            this.acceleration = this.clamp(this.acceleration + delta, -1, 1);
        }

        if (this.controls.directionMap.get('moveBackward')) {
            this.speed = this.clamp(this.speed - delta * this.BACK_ACCELERATION, this.MAX_REVERSE_SPEED, this.MAX_SPEED);
            this.acceleration = this.clamp(this.acceleration - delta, -1, 1);
        }

        if (this.controls.directionMap.get('moveLeft')) {
            this.wheelOrientation = this.clamp(this.wheelOrientation + delta * this.WHEEL_ANGULAR_ACCELERATION, -this.MAX_WHEEL_ROTATION, this.MAX_WHEEL_ROTATION);
        }

        if (this.controls.directionMap.get('moveRight')) {
            this.wheelOrientation = this.clamp(this.wheelOrientation - delta * this.WHEEL_ANGULAR_ACCELERATION, -this.MAX_WHEEL_ROTATION, this.MAX_WHEEL_ROTATION);
        }

        // speed decay
        if (!(this.controls.directionMap.get('moveForward') || this.controls.directionMap.get('moveBackward'))) {
            this.speedDecay(delta)
        }

        // steering decay
        if (!(this.controls.directionMap.get('moveLeft') || this.controls.directionMap.get('moveRight'))) {

            if (this.wheelOrientation > 0) {

                this.wheelOrientation = this.clamp(this.wheelOrientation - delta * this.WHEEL_ANGULAR_DECCELERATION, 0, this.MAX_WHEEL_ROTATION);

            } else {

                this.wheelOrientation = this.clamp(this.wheelOrientation + delta * this.WHEEL_ANGULAR_DECCELERATION, -this.MAX_WHEEL_ROTATION, 0);

            }

        }
    }
    updateModel(delta) {

        //car update
        let velocity = this.speed * delta * 0.06
        this.carOrientation += (velocity * this.STEERING_RADIUS_RATIO) * this.wheelOrientation

		this.moveable.forEach(element=>{
            const xMove = Math.sin(this.carOrientation) * velocity
            if( !(xMove < 0 && this.controls.outRight) && !(xMove > 0 && this.controls.outLeft)){
                element.position.x -= xMove
            }else if((this.controls.outRight && this.wheelOrientation <= 0 ) || (this.controls.outLeft && this.wheelOrientation >= 0)){
                this.speedDecay(delta*0.3)
            }

			element.position.z -= Math.cos(this.carOrientation) * velocity
		})

        //steering
        this.root.rotation.y = this.carOrientation

        // //tilt
        this.bodyMesh.rotation.z = this.MAX_TILT_SIDES * this.wheelOrientation * (this.speed / this.MAX_SPEED)
        this.bodyMesh.rotation.y = -this.MAX_TILT_FRONTBACK * this.acceleration

        // //wheels rolling
        // let angularSpeedRatio = 1 / (this.modelScale * (this.wheelDiameter / 2));
        let wheelRotationSpeed = velocity * 10

        this.wheels.forEach(wheel => {
            wheel.rotation.x += wheelRotationSpeed
        })

        //front wheels steering
        this.frontLeftWheelRoot.rotation.y = this.wheelOrientation
        this.frontRightWheelRoot.rotation.y = this.wheelOrientation


        
    }
    update(delta) {
        this.readControls(delta)
        this.updateModel(delta)
    }

    reset(){
        // this.moveable = moveable
        this.speed = 0;
        this.acceleration = 0;
        this.wheelOrientation = 0;
        this.carOrientation = 0;
        this.root.rotation.y = 0
    }
}