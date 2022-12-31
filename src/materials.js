const mlib = {

    body: [],
  
    "Chrome": new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: cubeTarget }),
    "ChromeN": new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: cubeTarget, combine: THREE.MixOperation, reflectivity: 0.75 }),
    "Dark chrome": new THREE.MeshLambertMaterial({ color: 0x444444, envMap: cubeTarget }),
  
    "Black rough": new THREE.MeshLambertMaterial({ color: 0x050505 }),
  
    "Dark glass": new THREE.MeshLambertMaterial({ color: 0x101020, envMap: cubeTarget, opacity: 0.5, transparent: true }),
    "Orange glass": new THREE.MeshLambertMaterial({ color: 0xffbb00, opacity: 0.5, transparent: true }),
    "Red glass": new THREE.MeshLambertMaterial({ color: 0xff0000, opacity: 0.5, transparent: true }),
  
    "Black metal": new THREE.MeshLambertMaterial({ color: 0x222222, envMap: cubeTarget, combine: THREE.MultiplyOperation }),
    "Orange metal": new THREE.MeshLambertMaterial({ color: 0xff6600, envMap: cubeTarget, combine: THREE.MultiplyOperation })
  
  }
  
  mlib.body.push(["Orange", new THREE.MeshLambertMaterial({ color: 0x883300, envMap: cubeTarget, combine: THREE.MixOperation, reflectivity: 0.1 })]);
  mlib.body.push(["Blue", new THREE.MeshLambertMaterial({ color: 0x113355, envMap: cubeTarget, combine: THREE.MixOperation, reflectivity: 0.1 })]);
  mlib.body.push(["Red", new THREE.MeshLambertMaterial({ color: 0x660000, envMap: cubeTarget, combine: THREE.MixOperation, reflectivity: 0.1 })]);
  mlib.body.push(["Black", new THREE.MeshLambertMaterial({ color: 0x000000, envMap: cubeTarget, combine: THREE.MixOperation, reflectivity: 0.2 })]);
  mlib.body.push(["White", new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: cubeTarget, combine: THREE.MixOperation, reflectivity: 0.2 })]);
  
  mlib.body.push(["Carmine", new THREE.MeshPhongMaterial({ color: 0x770000, specular: 0xffaaaa, envMap: cubeTarget, combine: THREE.MultiplyOperation })]);
  mlib.body.push(["Gold", new THREE.MeshPhongMaterial({ color: 0xaa9944, specular: 0xbbaa99, shininess: 50, envMap: cubeTarget, combine: THREE.MultiplyOperation })]);
  mlib.body.push(["Bronze", new THREE.MeshPhongMaterial({ color: 0x150505, specular: 0xee6600, shininess: 10, envMap: cubeTarget, combine: THREE.MixOperation, reflectivity: 0.2 })]);
  mlib.body.push(["Chrome", new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, envMap: cubeTarget, combine: THREE.MultiplyOperation })]);
  