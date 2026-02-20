import * as THREE from 'three';
import { createTextSprite } from './TextLabel.js';

export class Pylon {
    constructor(x, z, rotationY, managedLane, number) {
        this.group = new THREE.Group();
        this.managedLane = managedLane; // e.g., 'AB'

        // Pylon Number Label
        if (number) {
            const label = createTextSprite(number.toString(), '#ffffff', 100);
            label.position.set(0, 14, 0); // Above the pylon
            label.scale.set(8, 8, 1);
            this.group.add(label);
        }

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 5;
        this.group.add(pole);

        // Arm
        const armGeo = new THREE.BoxGeometry(1, 0.5, 8);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(0, 9, 4);
        this.group.add(arm);

        // Light Box
        const boxGeo = new THREE.BoxGeometry(1, 3, 1);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const lightBox = new THREE.Mesh(boxGeo, boxMat);
        lightBox.position.set(0, 8.5, 7.5);
        this.group.add(lightBox);

        // Lights (Green, Yellow, Red)
        this.redLight = this.createLightMesh(0xff0000, 9.5);
        this.yellowLight = this.createLightMesh(0xffff00, 8.5);
        this.greenLight = this.createLightMesh(0x00ff00, 7.5);

        this.group.add(this.redLight);
        this.group.add(this.yellowLight);
        this.group.add(this.greenLight);

        // Camera/Sensor Visuals (Main Arm)
        const sensorGeo = new THREE.BoxGeometry(1, 1, 1);
        const sensorMat = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue "Eye"
        const sensor = new THREE.Mesh(sensorGeo, sensorMat);
        sensor.position.set(0, 10.5, 0);
        this.group.add(sensor);

        // Second Arm (Side: Just Camera) - Rotated 90 degrees around Y looking "outward"
        // User requested 180 degree rotation "towards the sky" (around vertical axis)
        // Now pointing Left (relative to main arm) instead of Right
        const arm2 = new THREE.Mesh(armGeo, poleMat);
        arm2.rotation.y = Math.PI / 2; // Point Left (was -Math.PI/2)
        arm2.position.set(-4, 9, 0); // Offset along -X
        this.group.add(arm2);

        // Second Camera
        const sensor2 = new THREE.Mesh(sensorGeo, sensorMat);
        sensor2.position.set(-7.5, 9.5, 0); // Tip of second arm (negative X)
        this.group.add(sensor2);

        // Position Pylon
        this.group.position.set(x, 0, z);
        this.group.rotation.y = rotationY;

        // Initialize state
        this.setState('RED');
    }

    createLightMesh(color, y) {
        const geo = new THREE.SphereGeometry(0.4, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0x222222 }); // Off state
        const mesh = new THREE.Mesh(geo, mat);
        // Position on +X face of the light box (which is at 0, 8.5, 7.5)
        // x = 0.55, z = 7.5
        mesh.position.set(0.55, y, 7.5);
        return mesh;
    }

    setState(state) {
        // Reset all to dim
        this.redLight.material.color.setHex(0x220000);
        this.yellowLight.material.color.setHex(0x222200);
        this.greenLight.material.color.setHex(0x002200);

        if (state === 'RED') {
            this.redLight.material.color.setHex(0xff0000);
        } else if (state === 'YELLOW') {
            this.yellowLight.material.color.setHex(0xffff00);
        } else if (state === 'GREEN') {
            this.greenLight.material.color.setHex(0x00ff00);
        }
    }
}
