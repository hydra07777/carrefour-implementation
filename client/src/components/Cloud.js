import * as THREE from 'three';

export function createCloud(x, y, z, scale = 1) {
    const cloudGroup = new THREE.Group();
    
    // Cloud material - white and fluffy
    const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1,
        metalness: 0,
    });
    
    // Create cloud using multiple spheres
    const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
    
    // Main body spheres
    const spheres = [
        { x: 0, y: 0, z: 0, r: 1.2 },
        { x: 1.2, y: 0.2, z: 0, r: 1 },
        { x: -1.2, y: 0.1, z: 0, r: 1 },
        { x: 0.6, y: 0.5, z: 0.3, r: 0.8 },
        { x: -0.6, y: 0.4, z: -0.2, r: 0.9 },
        { x: 0, y: 0.6, z: 0, r: 0.7 },
        { x: 1.8, y: -0.1, z: 0, r: 0.6 },
        { x: -1.8, y: -0.1, z: 0, r: 0.5 },
    ];
    
    spheres.forEach(s => {
        const sphere = new THREE.Mesh(sphereGeo, cloudMat);
        sphere.position.set(s.x, s.y, s.z);
        sphere.scale.setScalar(s.r);
        sphere.castShadow = true;
        cloudGroup.add(sphere);
    });
    
    cloudGroup.position.set(x, y, z);
    cloudGroup.scale.setScalar(scale);
    
    return cloudGroup;
}

export function createClouds() {
    const cloudsGroup = new THREE.Group();
    
    // Create multiple clouds at different positions
    const cloudConfigs = [
        { x: -60, y: 45, z: -40, scale: 2.5 },
        { x: 30, y: 50, z: -60, scale: 2 },
        { x: 70, y: 42, z: 20, scale: 1.8 },
        { x: -40, y: 55, z: 50, scale: 2.2 },
        { x: 50, y: 48, z: -30, scale: 1.5 },
        { x: -80, y: 40, z: -20, scale: 1.7 },
        { x: 10, y: 52, z: 60, scale: 2 },
        { x: -30, y: 38, z: -70, scale: 1.6 },
    ];
    
    cloudConfigs.forEach(config => {
        const cloud = createCloud(config.x, config.y, config.z, config.scale);
        cloudsGroup.add(cloud);
    });
    
    return cloudsGroup;
}
