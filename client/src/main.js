import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { io } from "socket.io-client";
import { createIntersection } from './components/Intersection.js';
import { Pylon } from './components/Pylon.js';
import { Car } from './components/Car.js';
import { createTextSprite } from './components/TextLabel.js';
import { createClouds } from './components/Cloud.js';
import { createHouses } from './components/House.js';
import { createMen } from './components/Man.js';
import { createAirplane } from './components/Airplane.js';
import { createTrees } from './components/Tree.js';

// Connect to server
const socket = io('http://localhost:3000');

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
scene.fog = new THREE.FogExp2(0x202020, 0.005);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(60, 60, 60);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 30;
controls.maxDistance = 200;
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = 0;
controls.rotateSpeed = 0.8;
controls.zoomSpeed = 1.0;
controls.panSpeed = 0.8;

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

// 2. Pylons & Labels
const pylons = {};
pylons['AB'] = new Pylon(-12, 12, Math.PI, 'AB', 1);
scene.add(pylons['AB'].group);
pylons['CD'] = new Pylon(12, 12, -Math.PI / 2, 'CD', 2);
scene.add(pylons['CD'].group);
pylons['EF'] = new Pylon(12, -12, 0, 'EF', 3);
scene.add(pylons['EF'].group);
pylons['GH'] = new Pylon(-12, -12, Math.PI / 2, 'GH', 4);
scene.add(pylons['GH'].group);

// Lane Labels
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
  sprite.position.set(info.x, 2, info.z);
  scene.add(sprite);
});

// 3. Clouds
const clouds = createClouds();
scene.add(clouds);

// 4. Houses
const houses = createHouses();
scene.add(houses);

// 5. Men
const men = createMen(scene);

// 6. Airplane
const airplane = createAirplane(scene);

// 7. Trees
const trees = createTrees();
scene.add(trees);

// Cars
const cars = [];
let nextCarId = 1;
let currentLights = { AB: 'RED', CD: 'RED', EF: 'RED', GH: 'RED' };

// Spawner
setInterval(() => {
  const lanes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  if (Math.random() > 0.6) {
    const car = new Car(nextCarId++, lane, scene);
    cars.push(car);
  }
}, 1000);

// Sensor Logic
setInterval(() => {
  const queues = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 };
  cars.forEach(car => {
    let dist = 999;
    if (car.sign === 1) dist = car.stopLine - car.mesh.position[car.axis];
    else dist = car.mesh.position[car.axis] - car.stopLine;
    if (dist > 0 && dist < 60) {
      queues[car.lane]++;
    }
  });
  Object.keys(queues).forEach(lane => {
    if (queues[lane] > 0 || Math.random() > 0.9) {
      socket.emit('sensorData', { lane: lane, count: queues[lane], distance: 0 });
    }
  });
}, 500);

// Update Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update();

  for (let i = cars.length - 1; i >= 0; i--) {
    const keep = cars[i].update(delta, currentLights, cars);
    if (!keep) {
      cars[i].dispose();
      scene.remove(cars[i].mesh);
      cars.splice(i, 1);
    }
  }

  men.forEach(man => { man.update(delta); });
  airplane.update(delta);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

socket.on('lightUpdate', (lights) => {
  currentLights = lights;
  if (pylons['AB']) pylons['AB'].setState(lights['AB']);
  if (pylons['CD']) pylons['CD'].setState(lights['CD']);
  if (pylons['EF']) pylons['EF'].setState(lights['EF']);
  if (pylons['GH']) pylons['GH'].setState(lights['GH']);
});

animate();
