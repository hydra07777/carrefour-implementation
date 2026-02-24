import * as THREE from 'three';

// Man colors
const SKIN_COLOR = 0xffdbac;
const SHIRT_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c];
const PANTS_COLOR = 0x2c3e50;
const SHOES_COLOR = 0x1a1a1a;

export class Man {
    constructor(scene, startX, startZ, direction = 'x', speed = 3) {
        this.scene = scene;
        this.startX = startX;
        this.startZ = startZ;
        this.direction = direction; // 'x' or 'z'
        this.speed = speed;
        this.walkSpeed = 5;
        this.walkRange = 60; // How far the man walks before turning back
        
        this.mesh = this.createMesh();
        this.mesh.position.set(startX, 0, startZ);
        this.isWalking = true;
        this.walkTime = 0;
        
        scene.add(this.mesh);
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Random shirt color
        const shirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
        
        // Materials
        const skinMat = new THREE.MeshStandardMaterial({
            color: SKIN_COLOR,
            roughness: 0.8,
            metalness: 0.1,
        });
        
        const shirtMat = new THREE.MeshStandardMaterial({
            color: shirtColor,
            roughness: 0.7,
            metalness: 0.1,
        });
        
        const pantsMat = new THREE.MeshStandardMaterial({
            color: PANTS_COLOR,
            roughness: 0.8,
            metalness: 0.1,
        });
        
        const shoesMat = new THREE.MeshStandardMaterial({
            color: SHOES_COLOR,
            roughness: 0.6,
            metalness: 0.2,
        });
        
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x2c2c2c,
            roughness: 0.9,
            metalness: 0.1,
        });
        
        // Body (torso)
        const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
        const body = new THREE.Mesh(bodyGeo, shirtMat);
        body.position.y = 1.6;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 2.5;
        head.castShadow = true;
        group.add(head);
        
        // Hair (simple cap-like shape)
        const hairGeo = new THREE.SphereGeometry(0.32, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 2.6;
        group.add(hair);
        
        // Arms
        const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8);
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeo, skinMat);
        leftArm.position.set(-0.55, 1.5, 0);
        leftArm.castShadow = true;
        group.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeo, skinMat);
        rightArm.position.set(0.55, 1.5, 0);
        rightArm.castShadow = true;
        group.add(rightArm);
        
        // Store arm references for animation
        group.userData.leftArm = leftArm;
        group.userData.rightArm = rightArm;
        
        // Legs
        const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 8);
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.2, 0.5, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.2, 0.5, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        
        // Store leg references for animation
        group.userData.leftLeg = leftLeg;
        group.userData.rightLeg = rightLeg;
        
        // Feet/Shoes
        const shoeGeo = new THREE.BoxGeometry(0.2, 0.15, 0.35);
        
        const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
        leftShoe.position.set(-0.2, 0.075, 0.05);
        leftShoe.castShadow = true;
        group.add(leftShoe);
        
        const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
        rightShoe.position.set(0.2, 0.075, 0.05);
        rightShoe.castShadow = true;
        group.add(rightShoe);
        
        // Store shoe references
        group.userData.leftShoe = leftShoe;
        group.userData.rightShoe = rightShoe;
        
        return group;
    }
    
    update(delta) {
        if (!this.isWalking) return;
        
        this.walkTime += delta * this.walkSpeed;
        
        // Move the man
        const moveAmount = this.speed * delta;
        
        if (this.direction === 'x') {
            this.mesh.position.x += moveAmount;
            
            // Turn around at boundaries
            if (this.mesh.position.x > this.startX + this.walkRange) {
                this.direction = 'x';
                this.mesh.rotation.y = Math.PI; // Face opposite direction
            } else if (this.mesh.position.x < this.startX - this.walkRange) {
                this.direction = 'x';
                this.mesh.rotation.y = 0;
            }
        } else {
            this.mesh.position.z += moveAmount;
            
            // Turn around at boundaries
            if (this.mesh.position.z > this.startZ + this.walkRange) {
                this.direction = 'z';
                this.mesh.rotation.y = -Math.PI / 2;
            } else if (this.mesh.position.z < this.startZ - this.walkRange) {
                this.direction = 'z';
                this.mesh.rotation.y = Math.PI / 2;
            }
        }
        
        // Animate walking - arm and leg swing
        const swingAmount = Math.sin(this.walkTime) * 0.5;
        
        // Legs
        if (this.mesh.userData.leftLeg) {
            this.mesh.userData.leftLeg.rotation.x = swingAmount;
        }
        if (this.mesh.userData.rightLeg) {
            this.mesh.userData.rightLeg.rotation.x = -swingAmount;
        }
        
        // Shoes
        if (this.mesh.userData.leftShoe) {
            this.mesh.userData.leftShoe.position.z = 0.05 + Math.sin(this.walkTime) * 0.1;
        }
        if (this.mesh.userData.rightShoe) {
            this.mesh.userData.rightShoe.position.z = 0.05 - Math.sin(this.walkTime) * 0.1;
        }
        
        // Arms (opposite to legs)
        if (this.mesh.userData.leftArm) {
            this.mesh.userData.leftArm.rotation.x = -swingAmount * 0.7;
        }
        if (this.mesh.userData.rightArm) {
            this.mesh.userData.rightArm.rotation.x = swingAmount * 0.7;
        }
        
        // Slight body bob
        this.mesh.position.y = Math.abs(Math.sin(this.walkTime * 2)) * 0.05;
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

export function createMen(scene) {
    const men = [];
    
    // Create multiple men walking on sidewalks
    // Man 1: Walking along X direction on north sidewalk
    const man1 = new Man(scene, -25, 14, 'x', 2.5);
    man1.mesh.rotation.y = 0;
    men.push(man1);
    
    // Man 2: Walking along Z direction on west sidewalk
    const man2 = new Man(scene, -14, -30, 'z', 3);
    man2.mesh.rotation.y = Math.PI / 2;
    men.push(man2);
    
    // Man 3: Walking along X direction on south sidewalk
    const man3 = new Man(scene, 30, -14, 'x', 2);
    man3.mesh.rotation.y = Math.PI;
    men.push(man3);
    
    return men;
}
