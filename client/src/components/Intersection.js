import * as THREE from 'three';

export function createIntersection() {
    const group = new THREE.Group();

    // Road Dimensions
    const roadLength = 120;
    const roadWidth = 20;
    const laneWidth = 10;
    const sidewalkWidth = 3;
    const roadThickness = 0.1;
    const sidewalkHeight = 0.3;

    // Materials
    const asphaltMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,  // Dark gray asphalt
        roughness: 0.9,
        metalness: 0.1
    });
    
    const sidewalkMat = new THREE.MeshStandardMaterial({ 
        color: 0x808080,  // Light gray sidewalk
        roughness: 0.8 
    });
    
    const lineWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineYellowMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const crosswalkMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

    // Ground (grass/terrain)
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a4a1a }); // Dark green grass
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    group.add(ground);

    // ============== HORIZONTAL ROAD (East-West) ==============
    // Main asphalt
    const hRoadGeo = new THREE.BoxGeometry(roadLength * 2, roadThickness, roadWidth);
    const hRoad = new THREE.Mesh(hRoadGeo, asphaltMat);
    hRoad.position.y = roadThickness / 2;
    hRoad.receiveShadow = true;
    group.add(hRoad);

    // Horizontal Road - Sidewalks
    // Top sidewalk (North side)
    const hSidewalkTop = new THREE.Mesh(
        new THREE.BoxGeometry(roadLength * 2, sidewalkHeight, sidewalkWidth),
        sidewalkMat
    );
    hSidewalkTop.position.set(0, sidewalkHeight/2, -roadWidth/2 - sidewalkWidth/2);
    hSidewalkTop.receiveShadow = true;
    group.add(hSidewalkTop);

    // Bottom sidewalk (South side)
    const hSidewalkBottom = new THREE.Mesh(
        new THREE.BoxGeometry(roadLength * 2, sidewalkHeight, sidewalkWidth),
        sidewalkMat
    );
    hSidewalkBottom.position.set(0, sidewalkHeight/2, roadWidth/2 + sidewalkWidth/2);
    hSidewalkBottom.receiveShadow = true;
    group.add(hSidewalkBottom);

    // ============== VERTICAL ROAD (North-South) ==============
    const vRoadGeo = new THREE.BoxGeometry(roadWidth, roadThickness, roadLength * 2);
    const vRoad = new THREE.Mesh(vRoadGeo, asphaltMat);
    vRoad.position.y = roadThickness / 2;
    vRoad.receiveShadow = true;
    group.add(vRoad);

    // Vertical Road - Sidewalks
    // Left sidewalk (West side)
    const vSidewalkLeft = new THREE.Mesh(
        new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, roadLength * 2),
        sidewalkMat
    );
    vSidewalkLeft.position.set(-roadWidth/2 - sidewalkWidth/2, sidewalkHeight/2, 0);
    vSidewalkLeft.receiveShadow = true;
    group.add(vSidewalkLeft);

    // Right sidewalk (East side)
    const vSidewalkRight = new THREE.Mesh(
        new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, roadLength * 2),
        sidewalkMat
    );
    vSidewalkRight.position.set(roadWidth/2 + sidewalkWidth/2, sidewalkHeight/2, 0);
    vSidewalkRight.receiveShadow = true;
    group.add(vSidewalkRight);

    // ============== CENTER LINES (Dashed) ==============
    // Horizontal center line (dashed)
    for (let i = -roadLength + 2; i < roadLength; i += 6) {
        const hLine = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.02, 0.3),
            lineYellowMat
        );
        hLine.position.set(i, roadThickness + 0.01, 0);
        group.add(hLine);
    }

    // Vertical center line (dashed)
    for (let i = -roadLength + 2; i < roadLength; i += 6) {
        const vLine = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.02, 3),
            lineYellowMat
        );
        vLine.position.set(0, roadThickness + 0.01, i);
        group.add(vLine);
    }

    // ============== EDGE LINES (White solid) ==============
    // Horizontal road edges
    const hEdgeNorth = new THREE.Mesh(
        new THREE.BoxGeometry(roadLength * 2, 0.02, 0.2),
        lineWhiteMat
    );
    hEdgeNorth.position.set(0, roadThickness + 0.01, -roadWidth/2 + 0.5);
    group.add(hEdgeNorth);

    const hEdgeSouth = new THREE.Mesh(
        new THREE.BoxGeometry(roadLength * 2, 0.02, 0.2),
        lineWhiteMat
    );
    hEdgeSouth.position.set(0, roadThickness + 0.01, roadWidth/2 - 0.5);
    group.add(hEdgeSouth);

    // Vertical road edges
    const vEdgeWest = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.02, roadLength * 2),
        lineWhiteMat
    );
    vEdgeWest.position.set(-roadWidth/2 + 0.5, roadThickness + 0.01, 0);
    group.add(vEdgeWest);

    const vEdgeEast = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.02, roadLength * 2),
        lineWhiteMat
    );
    vEdgeEast.position.set(roadWidth/2 - 0.5, roadThickness + 0.01, 0);
    group.add(vEdgeEast);

    // ============== STOP LINES ==============
    const stopLineGeo = new THREE.BoxGeometry(0.5, 0.02, roadWidth - 1);

    // North Stop Line (for southbound traffic)
    const nStop = new THREE.Mesh(stopLineGeo, lineWhiteMat);
    nStop.position.set(0, roadThickness + 0.01, -12);
    group.add(nStop);

    // South Stop Line (for northbound traffic)
    const sStop = new THREE.Mesh(stopLineGeo, lineWhiteMat);
    sStop.position.set(0, roadThickness + 0.01, 12);
    group.add(sStop);

    // East Stop Line (for westbound traffic)
    const eStop = new THREE.Mesh(
        new THREE.BoxGeometry(roadWidth - 1, 0.02, 0.5),
        lineWhiteMat
    );
    eStop.position.set(12, roadThickness + 0.01, 0);
    group.add(eStop);

    // West Stop Line (for eastbound traffic)
    const wStop = new THREE.Mesh(
        new THREE.BoxGeometry(roadWidth - 1, 0.02, 0.5),
        lineWhiteMat
    );
    wStop.position.set(-12, roadThickness + 0.01, 0);
    group.add(wStop);

    // ============== CROSSWALKS ==============
    const crosswalkWidth = roadWidth - 2;
    const stripeWidth = 0.8;
    const stripeGap = 0.6;
    const stripeCount = Math.floor(crosswalkWidth / (stripeWidth + stripeGap));

    // Create zebra stripes function
    function createCrosswalk(x, z, rotationY = 0) {
        const crosswalkGroup = new THREE.Group();
        
        for (let i = 0; i < stripeCount; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(stripeWidth, 0.02, 4),
                crosswalkMat
            );
            const offset = (i - stripeCount/2 + 0.5) * (stripeWidth + stripeGap);
            
            if (rotationY === 0 || rotationY === Math.PI) {
                stripe.position.z = offset;
            } else {
                stripe.position.x = offset;
            }
            crosswalkGroup.add(stripe);
        }
        
        crosswalkGroup.position.set(x, roadThickness + 0.01, z);
        crosswalkGroup.rotation.y = rotationY;
        return crosswalkGroup;
    }

    // North crosswalk (before intersection, south side)
    group.add(createCrosswalk(0, -15, 0));
    
    // South crosswalk
    group.add(createCrosswalk(0, 15, 0));
    
    // East crosswalk
    group.add(createCrosswalk(15, 0, Math.PI/2));
    
    // West crosswalk
    group.add(createCrosswalk(-15, 0, Math.PI/2));

    // ============== INTERSECTION CENTER DETAIL ==============
    // Add a subtle circle in the center
    const centerCircleGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.05, 32);
    const centerCircleMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
    const centerCircle = new THREE.Mesh(centerCircleGeo, centerCircleMat);
    centerCircle.position.set(0, roadThickness + 0.02, 0);
    group.add(centerCircle);

    return group;
}
