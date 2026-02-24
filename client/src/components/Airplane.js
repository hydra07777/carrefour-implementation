import * as THREE from 'three';

export class Airplane {
    constructor(scene) {
        this.scene = scene;
        this.mesh = this.createMesh();
        
        // Initial position - flying from one side to another
        this.startX = -100;
        this.startY = 60;
        this.startZ = -30;
        
        this.mesh.position.set(this.startX, this.startY, this.startZ);
        this.speed = 25;
        this.flyRange = 200;
        
        // Rotation to face direction of travel
        this.mesh.rotation.y = 0; // Flying along X axis
        
        scene.add(this.mesh);
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Materials
        const fuselageMat = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.4,
            metalness: 0.6,
        });
        
        const wingMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.5,
        });
        
        const cockpitMat = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.7,
        });
        
        const engineMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.6,
            metalness: 0.4,
        });
        
        const tailFinMat = new THREE.MeshStandardMaterial({
            color: 0xe74c3c, // Red tail
            roughness: 0.5,
            metalness: 0.4,
        });
        
        // Fuselage (main body)
        const fuselageGeo = new THREE.CylinderGeometry(0.4, 0.3, 6, 16);
        const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
        fuselage.rotation.z = Math.PI / 2;
        fuselage.castShadow = true;
        group.add(fuselage);
        
        // Nose cone
        const noseGeo = new THREE.ConeGeometry(0.4, 1, 16);
        const nose = new THREE.Mesh(noseGeo, fuselageMat);
        nose.rotation.z = -Math.PI / 2;
        nose.position.x = 3.5;
        nose.castShadow = true;
        group.add(nose);
        
        // Cockpit
        const cockpitGeo = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.rotation.z = -Math.PI / 2;
        cockpit.position.set(2.5, 0.2, 0);
        group.add(cockpit);
        
        // Main wings
        const wingGeo = new THREE.BoxGeometry(1.5, 0.1, 8);
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 0, 0);
        wings.castShadow = true;
        group.add(wings);
        
        // Wing tips (colored)
        const wingTipGeo = new THREE.BoxGeometry(0.5, 0.12, 0.5);
        const wingTipMat = new THREE.MeshStandardMaterial({
            color: 0xe74c3c, // Red tips
            roughness: 0.5,
            metalness: 0.4,
        });
        
        const leftWingTip = new THREE.Mesh(wingTipGeo, wingTipMat);
        leftWingTip.position.set(0, 0, 4);
        group.add(leftWingTip);
        
        const rightWingTip = new THREE.Mesh(wingTipGeo, wingTipMat);
        rightWingTip.position.set(0, 0, -4);
        group.add(rightWingTip);
        
        // Tail fin (vertical stabilizer)
        const tailFinGeo = new THREE.BoxGeometry(1, 1.2, 0.1);
        const tailFin = new THREE.Mesh(tailFinGeo, tailFinMat);
        tailFin.position.set(-2.8, 0.6, 0);
        tailFin.castShadow = true;
        group.add(tailFin);
        
        // Horizontal stabilizers
        const hStabGeo = new THREE.BoxGeometry(0.8, 0.08, 2);
        const hStab = new THREE.Mesh(hStabGeo, wingMat);
        hStab.position.set(-2.8, 0.2, 0);
        hStab.castShadow = true;
        group.add(hStab);
        
        // Engines (under wings)
        const engineGeo = new THREE.CylinderGeometry(0.2, 0.25, 1, 12);
        
        const leftEngine = new THREE.Mesh(engineGeo, engineMat);
        leftEngine.rotation.z = Math.PI / 2;
        leftEngine.position.set(0.3, -0.3, 2);
        leftEngine.castShadow = true;
        group.add(leftEngine);
        
        const rightEngine = new THREE.Mesh(engineGeo, engineMat);
        rightEngine.rotation.z = Math.PI / 2;
        rightEngine.position.set(0.3, -0.3, -2);
        rightEngine.castShadow = true;
        group.add(rightEngine);
        
        // Scale the entire airplane
        group.scale.setScalar(0.8);
        
        return group;
    }
    
    update(delta) {
        // Move airplane along X axis
        this.mesh.position.x += this.speed * delta;
        
        // Add slight vertical oscillation
        this.mesh.position.y = this.startY + Math.sin(this.mesh.position.x * 0.05) * 2;
        
        // Add slight banking
        this.mesh.rotation.z = Math.sin(this.mesh.position.x * 0.03) * 0.1;
        
        // Reset when it goes out of view
        if (this.mesh.position.x > this.flyRange) {
            this.mesh.position.x = -this.flyRange;
        }
    }
    
    dispose() {
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
        this.scene.remove(this.mesh);
    }
}

export function createAirplane(scene) {
    return new Airplane(scene);
}
