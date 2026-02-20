import * as THREE from 'three';

export function createIntersection() {
    const group = new THREE.Group();

    // Road Dimensions
    const roadLength = 100;
    const roadWidth = 20; // 2 lanes (10 each way? or 2 lanes total per road?)
    // User said "4 routes dont chacunes 2 bandes". So 2 lanes per road.
    // Let's say Total Width = 20. Lane width = 10.

    // Material
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // 1. Horizontal Road (East-West) covers A, B & E, F?
    // Let's adopt a standard CROSS shape.

    // Horizontal Road
    const hRoadGeo = new THREE.PlaneGeometry(roadLength * 2, roadWidth);
    const hRoad = new THREE.Mesh(hRoadGeo, asphaltMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.receiveShadow = true;
    group.add(hRoad);

    // Vertical Road
    const vRoadGeo = new THREE.PlaneGeometry(roadWidth, roadLength * 2);
    const vRoad = new THREE.Mesh(vRoadGeo, asphaltMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.y = 0.01; // Avoid Z-fighting
    vRoad.receiveShadow = true;
    group.add(vRoad);

    // Markings (Dashed lines in center)
    // Horizontal Line
    const hLineGeo = new THREE.PlaneGeometry(roadLength * 2, 0.5);
    const hLine = new THREE.Mesh(hLineGeo, lineMat);
    hLine.rotation.x = -Math.PI / 2;
    hLine.position.y = 0.02;
    group.add(hLine);

    // Vertical Line
    const vLineGeo = new THREE.PlaneGeometry(0.5, roadLength * 2);
    const vLine = new THREE.Mesh(vLineGeo, lineMat);
    vLine.rotation.x = -Math.PI / 2;
    vLine.position.y = 0.02;
    group.add(vLine);

    // Stop Lines at intersection
    // Intersection box is [-10, 10] x [-10, 10]
    // Draw lines at +/- 10
    const stopLineGeo = new THREE.PlaneGeometry(roadWidth, 1);

    // North Stop Line
    const nStop = new THREE.Mesh(stopLineGeo, lineMat);
    nStop.rotation.x = -Math.PI / 2;
    nStop.position.set(0, 0.02, -12); // Slightly back from center
    group.add(nStop);

    // South
    const sStop = new THREE.Mesh(stopLineGeo, lineMat);
    sStop.rotation.x = -Math.PI / 2;
    sStop.position.set(0, 0.02, 12);
    group.add(sStop);

    // East
    const eStop = new THREE.Mesh(new THREE.PlaneGeometry(1, roadWidth), lineMat);
    eStop.rotation.x = -Math.PI / 2;
    eStop.position.set(12, 0.02, 0);
    group.add(eStop);

    // West
    const wStop = new THREE.Mesh(new THREE.PlaneGeometry(1, roadWidth), lineMat);
    wStop.rotation.x = -Math.PI / 2;
    wStop.position.set(-12, 0.02, 0);
    group.add(wStop);

    return group;
}
