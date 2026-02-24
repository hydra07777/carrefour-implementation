import * as THREE from 'three';

// Tree trunk colors
const TRUNK_COLORS = [
    0x4a3728, // Dark brown
    0x5c4033, // Coffee brown
    0x654321, // Dark wood
    0x3d2817, // Dark chocolate
];

// Tree foliage colors
const FOLIAGE_COLORS = [
    0x228b22, // Forest green
    0x2e8b57, // Sea green
    0x006400, // Dark green
    0x32cd32, // Lime green
    0x3cb371, // Medium sea green
];

export function createTree(x, z, scale = 1) {
    const treeGroup = new THREE.Group();
    
    // Random colors for this tree
    const trunkColor = TRUNK_COLORS[Math.floor(Math.random() * TRUNK_COLORS.length)];
    const foliageColor = FOLIAGE_COLORS[Math.floor(Math.random() * FOLIAGE_COLORS.length)];
    
    // Trunk material
    const trunkMat = new THREE.MeshStandardMaterial({
        color: trunkColor,
        roughness: 0.9,
        metalness: 0.1,
    });
    
    // Foliage material
    const foliageMat = new THREE.MeshStandardMaterial({
        color: foliageColor,
        roughness: 0.8,
        metalness: 0.1,
    });
    
    // Trunk (cylinder)
    const trunkHeight = 3 * scale;
    const trunkRadius = 0.4 * scale;
    const trunkGeo = new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // Create foliage layers (3 cone layers for a pine tree look)
    const foliageHeight = 6 * scale;
    const foliageRadius = 3 * scale;
    
    // Bottom layer
    const foliage1Geo = new THREE.ConeGeometry(foliageRadius, foliageHeight * 0.5, 8);
    const foliage1 = new THREE.Mesh(foliage1Geo, foliageMat);
    foliage1.position.y = trunkHeight + foliageHeight * 0.2;
    foliage1.castShadow = true;
    foliage1.receiveShadow = true;
    treeGroup.add(foliage1);
    
    // Middle layer
    const foliage2Geo = new THREE.ConeGeometry(foliageRadius * 0.75, foliageHeight * 0.4, 8);
    const foliage2 = new THREE.Mesh(foliage2Geo, foliageMat);
    foliage2.position.y = trunkHeight + foliageHeight * 0.5;
    foliage2.castShadow = true;
    foliage2.receiveShadow = true;
    treeGroup.add(foliage2);
    
    // Top layer
    const foliage3Geo = new THREE.ConeGeometry(foliageRadius * 0.5, foliageHeight * 0.3, 8);
    const foliage3 = new THREE.Mesh(foliage3Geo, foliageMat);
    foliage3.position.y = trunkHeight + foliageHeight * 0.75;
    foliage3.castShadow = true;
    foliage3.receiveShadow = true;
    treeGroup.add(foliage3);
    
    // Position the tree
    treeGroup.position.set(x, 0, z);
    
    return treeGroup;
}

export function createTrees() {
    const treesGroup = new THREE.Group();
    
    // Place trees around the intersection
    // Trees along the roads and around houses
    const treeConfigs = [
        // Along west road (left side)
        { x: -25, z: 18, scale: 1.2 },
        { x: -40, z: 20, scale: 1.0 },
        { x: -55, z: 17, scale: 1.3 },
        { x: -70, z: 22, scale: 1.1 },
        
        // Along west road (right side)
        { x: -25, z: -18, scale: 1.1 },
        { x: -45, z: -20, scale: 1.4 },
        { x: -60, z: -16, scale: 1.0 },
        { x: -75, z: -22, scale: 1.2 },
        
        // Along east road (left side)
        { x: 25, z: 18, scale: 1.0 },
        { x: 45, z: 20, scale: 1.3 },
        { x: 65, z: 16, scale: 1.1 },
        { x: 80, z: 22, scale: 1.4 },
        
        // Along east road (right side)
        { x: 25, z: -18, scale: 1.2 },
        { x: 50, z: -20, scale: 1.0 },
        { x: 70, z: -17, scale: 1.3 },
        
        // Along north road (left side)
        { x: 18, z: -25, scale: 1.1 },
        { x: 20, z: -45, scale: 1.3 },
        { x: 16, z: -65, scale: 1.0 },
        { x: 22, z: -80, scale: 1.2 },
        
        // Along north road (right side)
        { x: -18, z: -25, scale: 1.0 },
        { x: -20, z: -50, scale: 1.4 },
        { x: -16, z: -70, scale: 1.1 },
        
        // Along south road (left side)
        { x: 18, z: 25, scale: 1.3 },
        { x: 20, z: 45, scale: 1.0 },
        { x: 16, z: 70, scale: 1.2 },
        
        // Along south road (right side)
        { x: -18, z: 25, scale: 1.1 },
        { x: -20, z: 50, scale: 1.3 },
        { x: -16, z: 75, scale: 1.0 },
        
        // Near houses - NW quadrant
        { x: -30, z: -45, scale: 1.2 },
        { x: -45, z: -30, scale: 1.0 },
        
        // Near houses - NE quadrant
        { x: 30, z: -45, scale: 1.1 },
        { x: 45, z: -30, scale: 1.3 },
        
        // Near houses - SW quadrant
        { x: -30, z: 45, scale: 1.0 },
        { x: -45, z: 30, scale: 1.2 },
        
        // Near houses - SE quadrant
        { x: 30, z: 45, scale: 1.4 },
        { x: 45, z: 30, scale: 1.1 },
    ];
    
    treeConfigs.forEach(config => {
        const tree = createTree(config.x, config.z, config.scale);
        treesGroup.add(tree);
    });
    
    return treesGroup;
}
