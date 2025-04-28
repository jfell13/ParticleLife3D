# ParticleLife3D

A simple 3D particle life simulator using JavaScript and Three.js. 

Currently particles interact with randomized forces, bounce off walls, and are rendered in a dynamic 3D space with camera controls.

## Current Version
**v1.0.0** — [View all releases](https://github.com/jfell13/ParticleLife3D/releases)

### Live Demo:
[Click here to run the simulator](https://jfell13.github.io/ParticleLife3D/)

> NOTE: Use mouse to orbit, pan, and zoom. Watch the particles move and interact inside a 3D bounding box.


---

### Features

- 3D particle simulation with physics-based motion
- Adjustable bounding box size and interaction range
- Interactive camera with OrbitControls
- Color-coded particle types and dynamic rendering
- ES Module-based, clean and scalable

---

### Run Locally

You can also clone this repo and run it locally with a web server:

```bash
git clone [https://github.com/jfell13/ParticleLife3D/](https://github.com/jfell13/ParticleLife3D.git)
cd ParticleLife3D
python3 -m http.server
