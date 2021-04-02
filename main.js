import './style.css';
import dat from 'dat.gui';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshPhongMaterial,
  Mesh,
  PlaneGeometry,
  DoubleSide,
  DirectionalLight,
  FlatShading,
} from 'three';

// =====================================================
// creating the gui for editing data
// =====================================================
const gui = new dat.GUI();
const world = {
  plane: {
    width: 10,
    height: 10,
    widthSegments: 10,
    heightSegments: 10,
  },
};
gui.add(world.plane, 'width', 1, 20).onChange(generatePlane);
gui.add(world.plane, 'height', 1, 20).onChange(generatePlane);
gui.add(world.plane, 'widthSegments', 1, 50).onChange(generatePlane);
gui.add(world.plane, 'heightSegments', 1, 50).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.widthSegments,
  );
  const { array } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];
    array[i + 2] = z + Math.random();
  }
}

// =====================================================
// Basic Three.js Setup
// =====================================================
const scene = new Scene();
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// =====================================================
// Create our Plane
// =====================================================
const planeGeometry = new PlaneGeometry(10, 10, 10, 10);
const planeMaterial = new MeshPhongMaterial({
  color: 0xff0000,
  side: DoubleSide,
  flatShading: FlatShading,
});
const planeMesh = new Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

// modifying our segments
const { array } = planeMesh.geometry.attributes.position;
for (let i = 0; i < array.length; i += 3) {
  const x = array[i];
  const y = array[i + 1];
  const z = array[i + 2];

  array[i + 2] = z + Math.random();
}

const light = new DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

// animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
