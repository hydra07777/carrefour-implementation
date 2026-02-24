import * as THREE from 'three';

// Realistic car colors palette
const CAR_COLORS = [
    0x1a1a1a, // Black
    0xffffff, // White
    0xcc0000, // Red
    0x0033cc, // Blue
    0x006600, // Green
    0xffcc00, // Yellow
    0xcc6600, // Orange
    0x666666, // Gray
    0x800080, // Purple
    0x008080, // Teal
];

export class Car {
    constructor(id, lane, scene) {
        this.id = id;
        this.lane = lane;
        this.scene = scene;
        this.mesh = this.createMesh();

        // Direction and movement parameters
        this.direction = new THREE.Vector3();
        this.stopLine = 0;
        this.axis = 'x';
        this.sign = 1;

        this.initPosition();
        this.speed = 0;
        this.maxSpeed = 15;
        this.acceleration = 10;
        this.deceleration = 20;
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Pick a random car color
        const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
        
        // Car body material
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.3,
            metalness: 0.6
        });
        
        // Glass material
        const glassMat = new THREE.MeshStandardMaterial({ 
            color: 0x88ccff,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.7
        });
        
        // Wheel material
        const wheelMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.8
        });
        
        // Headlight material
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        
        // Taillight material
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Main body (lower part)
        const bodyGeo = new THREE.BoxGeometry(4, 1.2, 2);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.8;
        body.castShadow = true;
        group.add(body);

        // Cabin (upper part)
        const cabinGeo = new THREE.BoxGeometry(2.2, 1, 1.8);
        const cabin = new THREE.Mesh(cabinGeo, bodyMat);
        cabin.position.set(-0.3, 1.9, 0);
        cabin.castShadow = true;
        group.add(cabin);

        // Windshield (front)
        const windshieldGeo = new THREE.BoxGeometry(0.1, 0.8, 1.6);
        const windshield = new THREE.Mesh(windshieldGeo, glassMat);
        windshield.position.set(0.75, 1.9, 0);
        windshield.rotation.z = -0.3;
        group.add(windshield);

        // Rear window
        const rearWindowGeo = new THREE.BoxGeometry(0.1, 0.7, 1.6);
        const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
        rearWindow.position.set(-1.3, 1.85, 0);
        rearWindow.rotation.z = 0.3;
        group.add(rearWindow);

        // Side windows
        const sideWindowGeo = new THREE.BoxGeometry(1.5, 0.6, 0.1);
        const sideWindowL = new THREE.Mesh(sideWindowGeo, glassMat);
        sideWindowL.position.set(-0.3, 2, 0.95);
        group.add(sideWindowL);
        
        const sideWindowR = new THREE.Mesh(sideWindowGeo, glassMat);
        sideWindowR.position.set(-0.3, 2, -0.95);
        group.add(sideWindowR);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelPositions = [
            { x: 1.2, z: 1.1 },   // Front left
            { x: 1.2, z: -1.1 },  // Front right
            { x: -1.2, z: 1.1 },  // Rear left
            { x: -1.2, z: -1.1 },  // Rear right
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(pos.x, 0.4, pos.z);
            wheel.castShadow = true;
            group.add(wheel);
            
            // Wheel hub
            const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.31, 8);
            const hubMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
            const hub = new THREE.Mesh(hubGeo, hubMat);
            hub.rotation.x = Math.PI / 2;
            hub.position.set(pos.x, 0.4, pos.z);
            group.add(hub);
        });

        // Headlights
        const headlightGeo = new THREE.BoxGeometry(0.1, 0.3, 0.5);
        const headlightL = new THREE.Mesh(headlightGeo, headlightMat);
        headlightL.position.set(2.05, 0.9, 0.6);
        group.add(headlightL);
        
        const headlightR = new THREE.Mesh(headlightGeo, headlightMat);
        headlightR.position.set(2.05, 0.9, -0.6);
        group.add(headlightR);

        // Taillights
        const taillightGeo = new THREE.BoxGeometry(0.1, 0.3, 0.5);
        const taillightL = new THREE.Mesh(taillightGeo, taillightMat);
        taillightL.position.set(-2.05, 0.9, 0.6);
        group.add(taillightL);
        
        const taillightR = new THREE.Mesh(taillightGeo, taillightMat);
        taillightR.position.set(-2.05, 0.9, -0.6);
        group.add(taillightR);

        // Add to scene
        this.scene.add(group);
        return group;
    }

    initPosition() {
        switch (this.lane) {
            case 'A': // West -> East (Inner)
                this.mesh.position.set(-100, 0, 2.5);
                this.mesh.rotation.y = 0;
                this.direction.set(1, 0, 0);
                this.stopLine = -12;
                this.axis = 'x';
                this.sign = 1;
                break;
            case 'B': // West -> East (Outer)
                this.mesh.position.set(-100, 0, 7.5);
                this.mesh.rotation.y = 0;
                this.direction.set(1, 0, 0);
                this.stopLine = -12;
                this.axis = 'x';
                this.sign = 1;
                break;
            case 'E': // East -> West (Inner)
                this.mesh.position.set(100, 0, -2.5);
                this.mesh.rotation.y = Math.PI;
                this.direction.set(-1, 0, 0);
                this.stopLine = 12;
                this.axis = 'x';
                this.sign = -1;
                break;
            case 'F': // East -> West (Outer)
                this.mesh.position.set(100, 0, -7.5);
                this.mesh.rotation.y = Math.PI;
                this.direction.set(-1, 0, 0);
                this.stopLine = 12;
                this.axis = 'x';
                this.sign = -1;
                break;
            case 'G': // North -> South (Inner)
                this.mesh.position.set(-2.5, 0, -100);
                this.mesh.rotation.y = -Math.PI / 2;
                this.direction.set(0, 0, 1);
                this.stopLine = -12;
                this.axis = 'z';
                this.sign = 1;
                break;
            case 'H': // North -> South (Outer)
                this.mesh.position.set(-7.5, 0, -100);
                this.mesh.rotation.y = -Math.PI / 2;
                this.direction.set(0, 0, 1);
                this.stopLine = -12;
                this.axis = 'z';
                this.sign = 1;
                break;
            case 'C': // South -> North (Inner)
                this.mesh.position.set(2.5, 0, 100);
                this.mesh.rotation.y = Math.PI / 2;
                this.direction.set(0, 0, -1);
                this.stopLine = 12;
                this.axis = 'z';
                this.sign = -1;
                break;
            case 'D': // South -> North (Outer)
                this.mesh.position.set(7.5, 0, 100);
                this.mesh.rotation.y = Math.PI / 2;
                this.direction.set(0, 0, -1);
                this.stopLine = 12;
                this.axis = 'z';
                this.sign = -1;
                break;
        }
    }

    update(delta, lights, cars) {
        // 1. Determine target speed based on Light
        let targetSpeed = this.maxSpeed;

        // Map lane to light group
        let group = '';
        if (['A', 'B'].includes(this.lane)) group = 'AB';
        if (['C', 'D'].includes(this.lane)) group = 'CD';
        if (['E', 'F'].includes(this.lane)) group = 'EF';
        if (['G', 'H'].includes(this.lane)) group = 'GH';

        const lightState = lights[group];

        // Distance to stop line
        let distToStop = 0;
        if (this.sign === 1) distToStop = this.stopLine - this.mesh.position[this.axis];
        else distToStop = this.mesh.position[this.axis] - this.stopLine;

        // If light is RED/YELLOW and we are approaching
        if (lightState !== 'GREEN') {
            if (distToStop > 0 && distToStop < 20) {
                targetSpeed = 0;
            }
        }

        // 2. Determine target speed based on Car Ahead
        let minDist = 1000;
        for (const other of cars) {
            if (other.id !== this.id && other.lane === this.lane) {
                let distToCar = 0;
                if (this.sign === 1) distToCar = other.mesh.position[this.axis] - this.mesh.position[this.axis];
                else distToCar = this.mesh.position[this.axis] - other.mesh.position[this.axis];

                if (distToCar > 0 && distToCar < minDist) {
                    minDist = distToCar;
                }
            }
        }

        if (minDist < 7) { // Car length + gap
            targetSpeed = 0;
        } else if (minDist < 15) {
            targetSpeed = Math.min(targetSpeed, 5);
        }

        // 3. Apply physics
        if (this.speed < targetSpeed) {
            this.speed += this.acceleration * delta;
            if (this.speed > targetSpeed) this.speed = targetSpeed;
        } else if (this.speed > targetSpeed) {
            this.speed -= this.deceleration * delta;
            if (this.speed < targetSpeed) this.speed = targetSpeed;
        }

        // 4. Move
        const moveStep = this.speed * delta;
        this.mesh.position.addScaledVector(this.direction, moveStep);

        // 5. Cleanup if far away
        if (Math.abs(this.mesh.position.x) > 150 || Math.abs(this.mesh.position.z) > 150) {
            return false;
        }
        return true;
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
