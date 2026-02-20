import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { io } from "socket.io-client";
import { createIntersection } from './components/Intersection.js';
import { Pylon } from './components/Pylon.js';
import { Car } from './components/Car.js';

// Connect to server
const socket = io('http://localhost:3000');

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
scene.fog = new THREE.FogExp2(0x202020, 0.005);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(40, 50, 40);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 80, 30);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
scene.add(dirLight);

// Build World
// 1. Intersection
const intersectionForScene = createIntersection();
scene.add(intersectionForScene);

import { createTextSprite } from './components/TextLabel.js';

// ... (previous imports)

// ...

// 2. Pylons & Labels
// Pylons (1, 2, 3, 4)
const pylons = {};
// West Pylon (Control A, B) -> 1
pylons['AB'] = new Pylon(-12, 12, Math.PI, 'AB', 1);
scene.add(pylons['AB'].group);

// South Pylon (Control C, D) -> 2
pylons['CD'] = new Pylon(12, 12, -Math.PI / 2, 'CD', 2);
scene.add(pylons['CD'].group);

// East Pylon (Control E, F) -> 3
pylons['EF'] = new Pylon(12, -12, 0, 'EF', 3);
scene.add(pylons['EF'].group);

// North Pylon (Control G, H) -> 4
pylons['GH'] = new Pylon(-12, -12, Math.PI / 2, 'GH', 4);
scene.add(pylons['GH'].group);

// Lane Labels (A, B, C, D, E, F, G, H)
const laneLabels = [
  { text: 'A', x: -30, z: 2.5 },
  { text: 'B', x: -30, z: 7.5 },
  { text: 'E', x: 30, z: -2.5 },
  { text: 'F', x: 30, z: -7.5 },
  { text: 'G', x: -2.5, z: -30 },
  { text: 'H', x: -7.5, z: -30 },
  { text: 'C', x: 2.5, z: 30 },
  { text: 'D', x: 7.5, z: 30 },
];

laneLabels.forEach(info => {
  const sprite = createTextSprite(info.text, 'yellow');
  sprite.position.set(info.x, 2, info.z); // Slightly above cars
  scene.add(sprite);
});


// Cars
const cars = [];
let nextCarId = 1;
let currentLights = { AB: 'RED', CD: 'RED', EF: 'RED', GH: 'RED' };

// Spawner
setInterval(() => {
  // Randomly spawn cars on random lanes
  const lanes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];

  // Check if spawn point is clear
  let clear = true;
  // Simple check: iterate cars, if simple distance to spawn < 15, don't spawn
  // (Optimization: can be improved)

  if (Math.random() > 0.6) { // 40% chance per tick? No, interval.
    const car = new Car(nextCarId++, lane, scene);
    cars.push(car);
  }
}, 1000); // Every 1 second try to spawn

// Sensor Logic
setInterval(() => {
  // Count cars waiting at lights
  const queues = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 };

  cars.forEach(car => {
    // Assume car is in queue if speed is low and near stop line?
    // Or just count all incoming cars in "sensor range" (e.g. dist < 50)
    let dist = 999;
    if (car.sign === 1) dist = car.stopLine - car.mesh.position[car.axis];
    else dist = car.mesh.position[car.axis] - car.stopLine;

    if (dist > 0 && dist < 60) {
      queues[car.lane]++;
    }
  });

  // Send data for each lane
  Object.keys(queues).forEach(lane => {
    if (queues[lane] > 0 || Math.random() > 0.9) { // Optimization: send often or on change
      socket.emit('sensorData', {
        lane: lane,
        count: queues[lane],
        distance: 0 // Placeholder
      });
    }
  });

  // Also send 0 if empty? Yes, logic needs to know.
  // For demo, just sending all.
}, 500);


// Update Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  controls.update();

  // Update Cars
  for (let i = cars.length - 1; i >= 0; i--) {
    const keep = cars[i].update(delta, currentLights, cars);
    if (!keep) {
      cars[i].dispose();
      scene.remove(cars[i].mesh);
      cars.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// Window events
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Socket
socket.on('lightUpdate', (lights) => {
  // console.log('Light Update:', lights);
  currentLights = lights;

  // Update Pylons
  if (pylons['AB']) pylons['AB'].setState(lights['AB']);
  if (pylons['CD']) pylons['CD'].setState(lights['CD']);
  if (pylons['EF']) pylons['EF'].setState(lights['EF']);
  if (pylons['GH']) pylons['GH'].setState(lights['GH']);
});

animate();
