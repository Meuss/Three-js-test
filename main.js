import dat from 'dat.gui';
import gsap from 'gsap';
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
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
};
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane);
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane);
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane);
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments,
  );
  // vertice position randomization
  const { array } = planeMesh.geometry.attributes.position;
  const randomValues = [];
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 3;
    }

    randomValues.push(Math.random() * Math.PI * 2);
  }

  planeMesh.geometry.attributes.position.randomValues = randomValues;
  planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;

  // color attribute addition
  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }

  planeMesh.geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
}

// =====================================================
// Basic Three.js Setup
// =====================================================
// tells use where our mouse is, relative to the scene. like a laser pointer
const raycaster = new Raycaster();
// basics
const scene = new Scene();
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// be able to move around with mouse
new OrbitControls(camera, renderer.domElement);
camera.position.z = 50;
// =====================================================
// Create our Plane
// =====================================================
const planeGeometry = new PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments,
);
const planeMaterial = new MeshPhongMaterial({
  side: DoubleSide,
  flatShading: FlatShading,
  vertexColors: true,
});
const planeMesh = new Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
generatePlane();

// create lights
const light = new DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);
const backlight = new DirectionalLight(0xffffff, 1);
backlight.position.set(0, 0, -1);
scene.add(backlight);

const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0;
// animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;

  // movement effect
  const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;
    // y
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001;
  }
  planeMesh.geometry.attributes.position.needsUpdate = true;

  // detect that we are moused over our plane
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

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };
    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // vertice 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);
        // vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);
        // vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
        color.needsUpdate = true;
      },
    });
  }
}

animate();

addEventListener('mousemove', (event) => {
  // we need to normalize the coordinates (in center, not top left)
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
