# ParticleLife3D

A simple 3D particle life simulator using JavaScript and Three.js. 

Particles interact with randomized forces, bounce off walls, and are rendered in a dynamic 3D space with full camera and GUI controls.

## Current Version
**v1.1.0** — [View all releases](https://github.com/jfell13/ParticleLife3D/releases)

### Live Demo:
[Click here to run the simulator](https://jfell13.github.io/ParticleLife3D/)

> NOTE: Use mouse to orbit, pan, and zoom. Use the GUI to adjust simulation parameters in real-time.

---

### Features

- 3D particle simulation with physics-based motion
- Adjustable bounding box size and interaction range
- Color-coded particle types and dynamic rendering
- Interactive camera with OrbitControls
- **New:** Real-time GUI controls for:
  - Starting and stopping the simulation
  - Resetting simulation parameters
  - Adjusting particle population, interaction strength, types, friction, and box size
  - Resetting the camera view
- ES Module-based, clean and scalable

---

### Run Locally

You can also clone this repo and run it locally with a web server:

```bash
git clone https://github.com/jfell13/ParticleLife3D.git
cd ParticleLife3D
python3 -m http.server
