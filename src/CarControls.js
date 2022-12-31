export class CarControls{
    constructor(){
        this.playing = false
        this.directionMap = new Map()
        this.directionMap.set('moveForward', false)
        this.directionMap.set('moveBackward', false)
        this.directionMap.set('moveLeft', false)
        this.directionMap.set('moveRight', false)

        this.inputsMap = new Map()
        this.inputsMap.set('w', 'moveForward')
        this.inputsMap.set('s', 'moveBackward')
        this.inputsMap.set('a', 'moveLeft')
        this.inputsMap.set('d', 'moveRight')
        this.outRight = false
        this.outLeft = false
    }

    keyDown(e){
        if(this.inputsMap.has(e.key.toLowerCase())){
            this.playing = true
            this.directionMap.set(this.inputsMap.get(e.key.toLowerCase()), true)
        }
    }
    keyUp(e){
        if(this.inputsMap.has(e.key.toLowerCase())){
            this.directionMap.set(this.inputsMap.get(e.key.toLowerCase()), false)
        }
    }
    reset(){
        this.directionMap.set('moveForward', false)
        this.directionMap.set('moveBackward', false)
        this.directionMap.set('moveLeft', false)
        this.directionMap.set('moveRight', false)
        this.outRight = false
        this.outLeft = false
        this.playing = false
    }
}