import * as THREE from 'three';

// House color palette
const HOUSE_COLORS = [
    0xd4a574, // Tan/Beige
    0xc9b896, // Sand
    0xe8d4b8, // Light cream
    0xa08060, // Brown
    0x8b7355, // Dark tan
    0xb8860b, // Dark goldenrod
    0xcd853f, // Peru
    0xdeb887, // Burlywood
];

// Roof colors
const ROOF_COLORS = [
    0x8b4513, // Saddle brown
    0xa52a2a, // Brown
    0x654321, // Dark brown
    0x4a3728, // Dark chocolate
    0x2f4f4f, // Dark slate gray
    0x696969, // Dim gray
];

export function createHouse(width, height, depth, x, z, rotationY = 0) {
    const houseGroup = new THREE.Group();
    
    // Random colors for this house
    const wallColor = HOUSE_COLORS[Math.floor(Math.random() * HOUSE_COLORS.length)];
    const roofColor = ROOF_COLORS[Math.floor(Math.random() * ROOF_COLORS.length)];
    
    // Wall material
    const wallMat = new THREE.MeshStandardMaterial({
        color: wallColor,
        roughness: 0.8,
        metalness: 0.1,
    });
    
    // Roof material
    const roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.7,
        metalness: 0.2,
    });
    
    // Window material (blue-ish glass)
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0x87ceeb,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7,
    });
    
    // Door material
    const doorMat = new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.6,
        metalness: 0.1,
    });
    
    // House base/walls
    const wallGeo = new THREE.BoxGeometry(width, height, depth);
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);
    
    // Roof - create a pyramid shape
    const roofHeight = height * 0.5;
    const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.8, roofHeight, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height + roofHeight / 2;
    roof.rotation.y = Math.PI / 4; // Rotate to align with walls
    roof.castShadow = true;
    houseGroup.add(roof);
    
    // Add windows on each side
    const windowWidth = width * 0.25;
    const windowHeight = height * 0.3;
    const windowGeo = new THREE.BoxGeometry(windowWidth, windowHeight, 0.1);
    
    // Front and back windows
    for (let side = -1; side <= 1; side += 2) {
        // Front
        const windowFront = new THREE.Mesh(windowGeo, windowMat);
        windowFront.position.set(0, height * 0.5, depth / 2 + 0.05);
        houseGroup.add(windowFront);
        
        // Back
        const windowBack = new THREE.Mesh(windowGeo, windowMat);
        windowBack.position.set(0, height * 0.5, -depth / 2 - 0.05);
        houseGroup.add(windowBack);
    }
    
    // Side windows
    const sideWindowGeo = new THREE.BoxGeometry(0.1, windowHeight, windowWidth);
    for (let side = -1; side <= 1; side += 2) {
        const windowSide = new THREE.Mesh(sideWindowGeo, windowMat);
        windowSide.position.set(width / 2 + 0.05, height * 0.5, side * (depth * 0.25));
        houseGroup.add(windowSide);
    }
    
    // Door
    const doorWidth = width * 0.3;
    const doorHeight = height * 0.5;
    const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, doorHeight / 2, depth / 2 + 0.05);
    houseGroup.add(door);
    
    // Position the house
    houseGroup.position.set(x, 0, z);
    houseGroup.rotation.y = rotationY;
    
    return houseGroup;
}

export function createHouses() {
    const housesGroup = new THREE.Group();
    
    // Place houses around the intersection
    // Format: [width, height, depth, x, z, rotationY]
    const houseConfigs = [
        // Northwest quadrant
        { w: 12, h: 10, d: 10, x: -35, z: -35, rot: 0 },
        { w: 10, h: 8, d: 10, x: -50, z: -40, rot: Math.PI / 6 },
        { w: 14, h: 12, d: 12, x: -40, z: -55, rot: 0 },
        { w: 8, h: 7, d: 8, x: -55, z: -55, rot: Math.PI / 4 },
        
        // Northeast quadrant
        { w: 11, h: 9, d: 11, x: 40, z: -40, rot: 0 },
        { w: 13, h: 11, d: 10, x: 55, z: -35, rot: -Math.PI / 5 },
        { w: 9, h: 8, d: 9, x: 45, z: -55, rot: Math.PI / 3 },
        { w: 10, h: 10, d: 12, x: 60, z: -50, rot: 0 },
        
        // Southwest quadrant
        { w: 12, h: 10, d: 11, x: -45, z: 40, rot: 0 },
        { w: 10, h: 9, d: 9, x: -55, z: 50, rot: -Math.PI / 4 },
        { w: 8, h: 7, d: 8, x: -35, z: 55, rot: Math.PI / 6 },
        { w: 14, h: 11, d: 12, x: -50, z: 35, rot: 0 },
        
        // Southeast quadrant
        { w: 11, h: 9, d: 10, x: 45, z: 40, rot: 0 },
        { w: 9, h: 8, d: 9, x: 55, z: 55, rot: Math.PI / 5 },
        { w: 13, h: 12, d: 11, x: 50, z: 35, rot: 0 },
        { w: 10, h: 8, d: 10, x: 35, z: 50, rot: -Math.PI / 3 },
    ];
    
    houseConfigs.forEach(config => {
        const house = createHouse(config.w, config.h, config.d, config.x, config.z, config.rot);
        housesGroup.add(house);
    });
    
    return housesGroup;
}
