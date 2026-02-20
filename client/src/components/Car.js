import * as THREE from 'three';

export class Car {
    constructor(id, lane, scene) {
        this.id = id;
        this.lane = lane;
        this.scene = scene;
        this.mesh = this.createMesh();

        // Define lane start positions and directions
        // West: A(z=-2.5), B(z=-7.5) -> Move +X
        // East: E(z=2.5), F(z=7.5) -> Move -X
        // North: G(x=-2.5), H(x=-7.5) -> Move +Z
        // South: C(x=2.5), D(x=7.5) -> Move -Z
        // Note: These coords assume standard road width 20, center 0.
        // Lane A is closer to center? User said "2 bandes".
        // Let's place them reasonably.

        this.direction = new THREE.Vector3();
        this.stopLine = 0;
        this.axis = 'x'; // 'x' or 'z'
        this.sign = 1; // 1 or -1

        this.initPosition();
        this.speed = 0;
        this.maxSpeed = 15; // units per sec
        this.acceleration = 10;
        this.deceleration = 20;
    }

    createMesh() {
        const color = Math.random() * 0xffffff;
        const geometry = new THREE.BoxGeometry(4, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    initPosition() {
        switch (this.lane) {
            case 'A': // West -> East (Inner)
                // Right-hand traffic: Drive on South side (Z > 0)
                this.mesh.position.set(-100, 1, 2.5);
                this.mesh.rotation.y = 0;
                this.direction.set(1, 0, 0);
                this.stopLine = -12;
                this.axis = 'x';
                this.sign = 1;
                break;
            case 'B': // West -> East (Outer)
                this.mesh.position.set(-100, 1, 7.5);
                this.mesh.rotation.y = 0;
                this.direction.set(1, 0, 0);
                this.stopLine = -12;
                this.axis = 'x';
                this.sign = 1;
                break;
            case 'E': // East -> West (Inner)
                // Right-hand traffic: Drive on North side (Z < 0)
                this.mesh.position.set(100, 1, -2.5);
                this.mesh.rotation.y = Math.PI;
                this.direction.set(-1, 0, 0);
                this.stopLine = 12;
                this.axis = 'x';
                this.sign = -1;
                break;
            case 'F': // East -> West (Outer)
                this.mesh.position.set(100, 1, -7.5);
                this.mesh.rotation.y = Math.PI;
                this.direction.set(-1, 0, 0);
                this.stopLine = 12;
                this.axis = 'x';
                this.sign = -1;
                break;
            case 'G': // North -> South (Inner)
                // Drive on West side (X < 0) -> Correct
                this.mesh.position.set(-2.5, 1, -100);
                this.mesh.rotation.y = -Math.PI / 2;
                this.direction.set(0, 0, 1);
                this.stopLine = -12;
                this.axis = 'z';
                this.sign = 1;
                break;
            case 'H': // North -> South (Outer)
                this.mesh.position.set(-7.5, 1, -100);
                this.mesh.rotation.y = -Math.PI / 2;
                this.direction.set(0, 0, 1);
                this.stopLine = -12;
                this.axis = 'z';
                this.sign = 1;
                break;
            case 'C': // South -> North (Inner)
                // Drive on East side (X > 0) -> Correct
                this.mesh.position.set(2.5, 1, 100);
                this.mesh.rotation.y = Math.PI / 2;
                this.direction.set(0, 0, -1);
                this.stopLine = 12;
                this.axis = 'z';
                this.sign = -1;
                break;
            case 'D': // South -> North (Outer)
                this.mesh.position.set(7.5, 1, 100);
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

        // If light is RED/YELLOW and we are approaching logic
        if (lightState !== 'GREEN') {
            // Check if we passed the stop line?
            // If distToStop < 0, we already passed, keep going!
            if (distToStop > 0 && distToStop < 20) {
                targetSpeed = 0;
            }
        }

        // 2. Determine target speed based on Car Ahead
        // Simple collision avoidance
        let minDist = 1000;
        for (const other of cars) {
            if (other.id !== this.id && other.lane === this.lane) {
                // Check if other is ahead
                let distToCar = 0;
                if (this.sign === 1) distToCar = other.mesh.position[this.axis] - this.mesh.position[this.axis];
                else distToCar = this.mesh.position[this.axis] - other.mesh.position[this.axis];

                if (distToCar > 0 && distToCar < minDist) {
                    minDist = distToCar;
                }
            }
        }

        if (minDist < 6) { // 4 (car length) + gap
            targetSpeed = 0;
        } else if (minDist < 15) {
            targetSpeed = Math.min(targetSpeed, 5); // Slow down
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
            return false; // Should remove
        }
        return true; // Keep
    }
    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
