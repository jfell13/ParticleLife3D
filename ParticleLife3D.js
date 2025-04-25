import * as THREE from 'three'; //'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

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

// === Simulation Data ===
const n = 2000;
const dt = 0.02;
const frictionHalfLife = 0.04;

const m = 6;
const matrix = makeRandomMatrix();
const frictionFactor = Math.pow(0.5, dt / frictionHalfLife);
const forceFactor = 10;
const boxSize = 2; // Size of Box for particles to live in
const halfBox = boxSize / 2; // Half box size
const rMax = boxSize * 0.1;

// Particle data arrays
const posX = new Float32Array(n);
const posY = new Float32Array(n);
const posZ = new Float32Array(n);
const velX = new Float32Array(n);
const velY = new Float32Array(n);
const velZ = new Float32Array(n);
const colors = new Int32Array(n);

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
const materials = Array.from({ length: m }, (_, i) =>
  new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(i / m, 1.0, 0.5)
  })
);
const meshes = [];
const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const boxEdges = new THREE.EdgesGeometry(boxGeometry);
const boxLines = new THREE.LineSegments(
  boxEdges,
  new THREE.LineBasicMaterial({ color: 0xffffff })
);
scene.add(boxLines);

for (let i = 0; i < n; i++) {
  const mesh = new THREE.Mesh(geometry, materials[colors[i]]);
  scene.add(mesh);
  meshes.push(mesh);
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
  updateParticles();

  for (let i = 0; i < n; i++) {
    meshes[i].position.set(posX[i], posY[i], posZ[i]);;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
