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
  Raycaster,
  BufferAttribute,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
const raycaster = new Raycaster(); // tells use where our mouse is, relative to the scene. like a laser pointer
const scene = new Scene();
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;
// be able to move around with mouse
new OrbitControls(camera, renderer.domElement);
// =====================================================
// Create our Plane
// =====================================================
const planeGeometry = new PlaneGeometry(10, 10, 10, 10);
const planeMaterial = new MeshPhongMaterial({
  side: DoubleSide,
  flatShading: FlatShading,
  vertexColors: true,
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

const colors = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  colors.push(0, 0.19, 0.4);
}

planeMesh.geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));

const light = new DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);
const backlight = new DirectionalLight(0xffffff, 1);
backlight.position.set(0, 0, -1);
scene.add(backlight);

const mouse = {
  x: undefined,
  y: undefined,
};

// animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // detect that we are moused over our plane
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    // change the color
    const { color } = intersects[0].object.geometry.attributes;
    // vertice 1
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);
    // vertice 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);
    // vertice 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;
  }
}

animate();

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1; // we need to normalize the coordinates (in center, not top left)
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
