var scene = null;
var renderer = null;
var camera = null;
var orbitControls = null;
var day = 0.0;
var year = 0.0;
var month = 0.0;
var clock;

function init() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();

  loadMesh();

  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
  renderer.setSize(window.innerHeight * 0.7, window.innerHeight * 0.7);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60.0, 1.0, 0.1, 30.0);

  // Controle de Camera Orbital
  orbitControls = new THREE.OrbitControls(camera);
  orbitControls.autoRotate = false;

  renderer.clear();
}

function loadMesh() {
  // Load Mesh
  var loader = new THREE.OBJLoader();
  loader.load('Pikachu.obj', buildScene);
}

function render() {
  var delta = clock.getDelta();
  orbitControls.update(delta);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function buildScene(loadedMesh) {
  var material = new THREE.MeshStandardMaterial();
  material.color = new THREE.Color(1.0, 1.0, 0.0);

  loadedMesh.children.forEach(function(child) { child.material = material; });

  scene.add(loadedMesh);

  // Bounding Box
  var BBox = new THREE.Box3().setFromObject(loadedMesh);

  // Adjust Camera Position and LookAt
  var maxCoord = Math.max(BBox.max.x, BBox.max.y, BBox.max.z);
  var minCoord = Math.min(BBox.min.x, BBox.min.y, BBox.min.z);

  camera.position.x = camera.position.y = camera.position.z = maxCoord * 1.5;
  camera.far = new THREE.Vector3(maxCoord * 2.5, maxCoord * 2.5, maxCoord * 2.5)
                   .length();

  // add light source
  var light = new THREE.PointLight(0xFF0000);
  var light2 = new THREE.PointLight(0x0000FF);
  light.position.set(maxCoord, maxCoord, maxCoord);
  light2.position.set(minCoord, minCoord, minCoord);
  scene.add(light);
  scene.add(light2);

  camera.lookAt(
      new THREE.Vector3(
          (BBox.max.x + BBox.min.x) / 2.0, (BBox.max.y + BBox.min.y) / 2.0,
          (BBox.max.z + BBox.min.z) / 2.0));
  camera.updateProjectionMatrix();

  // Global Axis
  var globalAxis = new THREE.AxisHelper(maxCoord * 1.3);
  scene.add(globalAxis);

  // Ground
  var groundGeom =
      new THREE.PlaneBufferGeometry(maxCoord * 20.5, maxCoord * 20.5, 50, 50);

  var groundMesh = new THREE.Mesh(
      groundGeom, new THREE.MeshBasicMaterial({color: 0x555555}));
  groundMesh.material.side = THREE.DoubleSide;
  groundMesh.material.shading = THREE.SmoothShading;
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.1;
  scene.add(groundMesh);

  render();
}
