import * as THREE from 'three'; //'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui' //'three/addons/controls/GUI' //"https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm";

// === Scene Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 2.5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// GUI controls
const gui = new GUI();

const simulationControls = {
  'Start': () => { isRunning = true; },
  'Stop': () => { isRunning = false; },
  'Camera Reset': () => {controls.reset()},
  'Reset': () => { resetSimulation(); }
};

// Initial simulation parameters
const simParams = {
  "Particle Population": 2000,
  "Particle Types": 6,
  "Max Distance": 0.1,
  "Force Factor": 10,
  "Friction Half Life" : 0.04,
  "Box Size": 2
};

const guiParams = {
  "Particle Population": simParams['Particle Population'],
  "Particle Types": simParams['Particle Types'],
  "Max Distance": simParams['Max Distance'],
  "Force Factor": simParams['Force Factor'],
  "Friction Half Life" : simParams['Friction Half Life'],
  "Box Size": simParams['Box Size']
};

// GUI set params and controls
gui.add(guiParams, 'Max Distance', 0.01, 1, 0.01);
gui.add(guiParams, 'Force Factor', 0.1, 20, 0.1);
gui.add(guiParams, 'Friction Half Life', 0.01, 1, 0.01);
gui.add(guiParams, 'Particle Population', 100, 5000, 100);
gui.add(guiParams, 'Particle Types', 2, 20, 1);
gui.add(guiParams, 'Box Size', 1, 10, 0.1);

gui.add(simulationControls, 'Start');
gui.add(simulationControls, 'Stop');
gui.add(simulationControls, 'Reset');
gui.add(simulationControls, 'Camera Reset')

// Global running flag; initially is stopped.
let isRunning = false;

// === Simulation Data ===
let n = simParams['Particle Population']; //2000;
let dt = 0.02;
let frictionHalfLife = simParams['Friction Half Life']; //0.04;
let m = simParams['Particle Types']; //6;
let matrix = makeRandomMatrix();
let frictionFactor = Math.pow(0.5, dt / frictionHalfLife);
let forceFactor = simParams['Force Factor']; //10;
let boxSize = simParams['Box Size']; //2; // Size of Box for particles to live in
let halfBox = boxSize / 2; // Half box size
let rMax = boxSize * simParams['Max Distance'];

// Particle data arrays
let posX = new Float32Array(n);
let posY = new Float32Array(n);
let posZ = new Float32Array(n);
let velX = new Float32Array(n);
let velY = new Float32Array(n);
let velZ = new Float32Array(n);
let colors = new Int32Array(n);

for (let i = 0; i < n; i++) {
  posX[i] = Math.random() * boxSize - halfBox;
  posY[i] = Math.random() * boxSize - halfBox;
  posZ[i] = Math.random() * boxSize - halfBox;
  velX[i] = velY[i] = velZ[i] = 0;
  colors[i] = Math.floor(Math.random() * m);
}

function makeRandomMatrix() {
  const matrix = [];
  for (let i = 0; i < m; i++) {
    const row = [];
    for (let j = 0; j < m; j++) {
      row.push(Math.random() * 2 - 1);
    }
    matrix.push(row);
  }
  return matrix;
}

function force(r, a) {
  const beta = 0.3;
  if (r < beta) return r / beta - 1;
  else if (r < 1) return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
  else return 0;
}

// === Three.js Meshes ===
const geometry = new THREE.SphereGeometry(0.01, 8, 8);
let materials = Array.from({ length: m }, (_, i) =>
  new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(i / m, 1.0, 0.5)
  })
);
let meshes = [];
let boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
let boxEdges = new THREE.EdgesGeometry(boxGeometry);
let boxLines = new THREE.LineSegments(
  boxEdges,
  new THREE.LineBasicMaterial({ color: 0xffffff })
);
scene.add(boxLines);

for (let i = 0; i < n; i++) {
  const mesh = new THREE.Mesh(geometry, materials[colors[i]]);
  scene.add(mesh);
  meshes.push(mesh);
}

function resetSimulation() {
  // Update simulation params
  simParams['Particle Population'] = guiParams['Particle Population'];
  simParams['Particle Types'] = guiParams['Particle Types'];
  simParams['Max Distance'] = guiParams['Max Distance'];
  simParams['Force Factor'] = guiParams['Force Factor'];
  simParams['Friction Half Life'] = guiParams['Friction Half Life'];
  simParams['Box Size'] = guiParams['Box Size'];
  // Clear meshes
  for (let mesh of meshes) {
    scene.remove(mesh);
  }
  meshes.length = 0;
  // Update internal params
  matrix = makeRandomMatrix();
  n = simParams['Particle Population'];
  m = simParams['Particle Types'];
  boxSize = simParams['Box Size'];
  halfBox = boxSize / 2;
  rMax = boxSize * simParams['Max Distance'];
  forceFactor = simParams['Force Factor'];
  frictionHalfLife = simParams['Friction Half Life'];
  frictionFactor = Math.pow(0.5, dt / frictionHalfLife);
  // Reset internal arrays
  posX = new Float32Array(n);
  posY = new Float32Array(n);
  posZ = new Float32Array(n);
  velX = new Float32Array(n);
  velY = new Float32Array(n);
  velZ = new Float32Array(n);
  colors = new Int32Array(n);
  // Rebuild the system box
  scene.remove(boxLines);
  const newBoxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  const newBoxEdges = new THREE.EdgesGeometry(newBoxGeometry);
  boxLines = new THREE.LineSegments(newBoxEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
  scene.add(boxLines);
  // Rebild particles
  for (let i = 0; i < n; i++) {
    posX[i] = Math.random() * boxSize - halfBox;
    posY[i] = Math.random() * boxSize - halfBox;
    posZ[i] = Math.random() * boxSize - halfBox;
    velX[i] = velY[i] = velZ[i] = 0;
    colors[i] = Math.floor(Math.random() * m);

    const material = materials[colors[i] % materials.length];
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshes.push(mesh);
  }
}

// === Physics Update ===
function updateParticles() {
  for (let i = 0; i < n; i++) {
    let fx = 0, fy = 0, fz = 0;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const dx = posX[j] - posX[i];
      const dy = posY[j] - posY[i];
      const dz = posZ[j] - posZ[i];
      const r = Math.hypot(dx, dy, dz);

      if (r > 0 && r < rMax) {
        const f = force(r / rMax, matrix[colors[i]][colors[j]]);
        fx += (dx / r) * f;
        fy += (dy / r) * f;
        fz += (dz / r) * f;
      }
    }
    // Update forces
    fx = fx * rMax * dt * forceFactor
    fy = fy * rMax * dt * forceFactor
    fz = fz * rMax * dt * forceFactor
    // Apply force to velocity
    velX[i] = velX[i] * frictionFactor + fx;
    velY[i] = velY[i] * frictionFactor + fy;
    velZ[i] = velZ[i] * frictionFactor + fz;
    // Update positions
    posX[i] += velX[i] * dt;
    posY[i] += velY[i] * dt;
    posZ[i] += velZ[i] * dt;
    // Hard walls
    if (posX[i] < -halfBox || posX[i] > halfBox) {
        velX[i] *= -1;
        posX[i] = Math.min(Math.max(posX[i], -halfBox), halfBox);
      }
      if (posY[i] < -halfBox || posY[i] > halfBox) {
        velY[i] *= -1;
        posY[i] = Math.min(Math.max(posY[i], -halfBox), halfBox);
      }
      if (posZ[i] < -halfBox || posZ[i] > halfBox) {
        velZ[i] *= -1;
        posZ[i] = Math.min(Math.max(posZ[i], -halfBox), halfBox);
      }
  }
}

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);
  
  if (isRunning) {
    updateParticles();
  }

  for (let i = 0; i < n; i++) {
    meshes[i].position.set(posX[i], posY[i], posZ[i]);;
  }
  
  controls.update();
  renderer.render(scene, camera);
}

animate();
