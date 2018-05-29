var scene = null;
var renderer = null;
var frontCam = null;
var rearCam = null;
var mapCam = null;
var cursor = null;
var mesh = null;
var clock;
var height = 1.8;

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
  renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.7);
  renderer.autoClear = false;

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  // front view camera
  frontCam = new THREE.PerspectiveCamera(
      45.0, window.innerWidth / window.innerHeight, 0.1, 500.0);
  frontCam.position.x = 20;
  frontCam.position.y = height;
  frontCam.position.z = 0;

  // rear view camera
  rearCam = new THREE.PerspectiveCamera(45.0, 1, 0.1, 500.0);
  frontCam.add(rearCam);
  rearCam.rotation.y = Math.PI;

  // configure fps controls
  fpsControls = new THREE.FirstPersonControls(frontCam, renderer.domElement);
  fpsControls.movementSpeed = 5;
  fpsControls.lookSpeed = 0.1;
  fpsControls.target.set(20, height, -1);

  // minimap camera
  mapCam = new THREE.OrthographicCamera(-15, 15, 15, -15, 0, 100);
  mapCam.position.x = 0;
  mapCam.position.y = 100;
  mapCam.position.z = 0;
  mapCam.up = new THREE.Vector3(1, 0, 0);

  // add minimap cursor
  var geometry = new THREE.CircleGeometry(0.5, 8);
  var material =
      new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.FrontSide});
  cursor = new THREE.Mesh(geometry, material);
  cursor.rotateX(-Math.PI / 2);
  scene.add(cursor);

  // Load city mesh
  var loader = new THREE.OBJLoader();
  loader.load('../../Assets/Models/city.obj', loadMesh);

  render();
};

function loadMesh(loadedMesh) {
  loadedMesh.name = "city";
  var material = new THREE.MeshPhongMaterial();
  material.bothsides = false;
  material.depthTest = true;
  material.side = THREE.FrontSide;

  loadedMesh.children.forEach(function(child) { child.material = material; });

  mesh = loadedMesh;
  scene.add(loadedMesh);

  box = new THREE.Box3();
  box.setFromObject(mesh);

  // adjust cursor height to ensure visibility
  cursor.position.y = box.max.y + 1;

  // add point light source
  var pointLight1 = new THREE.PointLight(new THREE.Color(1.0, 1.0, 1.0));
  pointLight1.distance = 0.0;
  pointLight1.position.set(box.max.x * 1.2, box.max.y * 1.2, box.max.z * 1.2);
  scene.add(pointLight1);

  // global axis
  var globalAxis = new THREE.AxesHelper(
      Math.max(
          (box.max.x - box.min.x), (box.max.y - box.min.y),
          (box.max.z - box.min.z)));
  scene.add(globalAxis);
};


function render() {
  // update front cam via fps controls
  // restricting height to human walk
  var delta = clock.getDelta();
  fpsControls.update(delta);
  frontCam.position.y = height;

  // render front cam
  renderer.setViewport(0, 0, window.innerWidth * 0.7, window.innerHeight * 0.7);
  renderer.setScissor(0, 0, window.innerWidth * 0.7, window.innerHeight * 0.7);
  renderer.setScissorTest(true);
  renderer.clear();
  renderer.render(scene, frontCam);

  // render rear cam
  renderer.setViewport(
      window.innerHeight * 0.01, window.innerHeight * 0.01,
      window.innerHeight * 0.35, window.innerHeight * 0.35);
  renderer.setScissor(
      window.innerHeight * 0.01, window.innerHeight * 0.01,
      window.innerHeight * 0.35, window.innerHeight * 0.35);
  renderer.setScissorTest(true);
  renderer.clear();
  renderer.render(scene, rearCam);

  // make mini map centered on camera
  let direction = new THREE.Vector3();
  frontCam.getWorldDirection(direction);
  mapCam.up = direction.clone();
  mapCam.lookAt(frontCam.position);
  mapCam.position.x = frontCam.position.x;
  mapCam.position.z = frontCam.position.z;

  // update cursor position
  cursor.position.x = frontCam.position.x;
  cursor.position.z = frontCam.position.z;

  // render map cam
  renderer.setViewport(
      window.innerWidth * 0.7 - window.innerHeight * 0.36,
      window.innerHeight * 0.01, window.innerHeight * 0.35,
      window.innerHeight * 0.35);
  renderer.setScissor(
      window.innerWidth * 0.7 - window.innerHeight * 0.36,
      window.innerHeight * 0.01, window.innerHeight * 0.35,
      window.innerHeight * 0.35);
  renderer.setScissorTest(true);
  renderer.clear();
  renderer.render(scene, mapCam);

  requestAnimationFrame(render);
}
