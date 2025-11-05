import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

const canvas = document.querySelector('#threeCanvas');

// Create renderer using that canvas
const renderer = new Three.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// document.body.appendChild(renderer.domElement);

const scene = new Three.Scene();
// scene.background = new Three.Color(0xffffff);
// scene.background=new Three.TextureLoader().load(nebula);
// scene.background=new Three.ImageLoader('img/nebula.jpg');

const loader = new Three.TextureLoader();
loader.load(
  'https://images.unsplash.com/photo-1520034475321-cbe63696469a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070', // Space/nebula image
  (texture) => {
    scene.background = texture;
    console.log('✅ Background loaded successfully');
  },
  (progress) => {
    console.log('Loading...', (progress.loaded / progress.total * 100).toFixed(2) + '%');
  },
  (err) => {
    console.error('❌ Failed to load texture:', err);
    // Fallback to solid color
    scene.background = new Three.Color(0x000011);
  }
);

const camera = new Three.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
 camera.position.set(0, 20, 50);

const orbit=new OrbitControls(camera, renderer.domElement);
orbit.update();

 const axesHelper = new Three.AxesHelper(5);
 scene.add(axesHelper);


const geometry = new Three.BoxGeometry();
const material = new Three.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new Three.Mesh(geometry, material);
scene.add(cube);

const box2Geometry = new Three.BoxGeometry(4, 4, 4);
const box2Material = new Three.MeshBasicMaterial({
  map: loader.load('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1511'),
});
const box2 = new Three.Mesh(box2Geometry, box2Material);
scene.add(box2);
box2.position.set(0, 15, 10);

const planeGeometry = new Three.PlaneGeometry(30, 30);
const planeMaterial = new Three.MeshStandardMaterial({ color: 0xffffff,side: Three.DoubleSide,
});
const plane = new Three.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
// plane.rotation.x = -0.5*Math.PI;
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
plane.receiveShadow = true;

const gridHelper = new Three.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new Three.SphereGeometry(4, 50, 50);
const sphereMaterial = new Three.MeshStandardMaterial({
  color: 0x0000ff,
  wireframe: false,
});
const sphere = new Three.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;

const ambientLight = new Three.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new Three.DirectionalLight(0xffffff, 1.2);
scene.add(directionalLight);
directionalLight.intensity = 2;
directionalLight.position.set(-30, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;

const dLightHelper = new Three.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

const dLightShadowHelper = new Three.CameraHelper(
  directionalLight.shadow.camera
);
scene.add(dLightShadowHelper);

// const spotlight = new Three.SpotLight(0xffffff, 50);
// spotlight.position.set(-80, 80, 0);
// spotlight.angle = 0.2;     // wider cone
// spotlight.penumbra = 0.5;
// spotlight.decay = 1;
// spotlight.distance = 200;
// spotlight.castShadow = true;

// // Focus the light on the sphere
// spotlight.target.position.set(0, 0, 0);
// scene.add(spotlight.target);
// scene.add(spotlight);

// // Helpers
// const spotlightHelper = new Three.SpotLightHelper(spotlight);
// scene.add(spotlightHelper);

// scene.fog = new Three.FogExp2(0xffffff, 0.01);

// renderer.setClearColor(0xffea00, 1);

const gui = new dat.GUI();
const options={
    sphereColor: "#ffea00",
    wireframe: false,
    speed: 0.01,
    // angle: 0.2,
    // penumbra: 0.5,
    // intensity: 1,
};
gui.addColor(options,'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
});
gui.add(options,'wireframe').onChange(function(e){
    sphere.material.wireframe=e;
});
gui.add(options,'speed',0,0.1);

// gui.add(options,'intensity',0,100).onChange(function(e){
//     spotlight.intensity=e;
// });
// gui.add(options,'penumbra',0,1).onChange(function(e){
//     spotlight.penumbra=e;
// });
// gui.add(options,'angle',0,90).onChange(function(e){
//     spotlight.angle=e;
// });

let step=0;

const mousePosition=new Three.Vector2();
window.addEventListener('mousemove',function(e){
    mousePosition.x=(e.clientX/window.innerWidth)*2-1;
    mousePosition.y=-(e.clientY/window.innerHeight)*2+1;
    // console.log(mousePosition);
});

const rayCaster=new Three.Raycaster();

const sphereId=sphere.id;

function animate(time) {
//   requestAnimationFrame(animate);

  cube.rotation.x = time/1000;
  cube.rotation.y = time/1000;

 step+=options.speed;
 sphere.position.y=10*Math.abs(Math.sin(step));

//   spotlightHelper.update();
rayCaster.setFromCamera(mousePosition,camera);
const intersects=rayCaster.intersectObjects(scene.children);
console.log(intersects);

for (let i=0;i<intersects.length;i++){
    if (intersects[i].object.id===sphereId){
        intersects[i].object.material.color.set(0xff0000);
    }
}

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
