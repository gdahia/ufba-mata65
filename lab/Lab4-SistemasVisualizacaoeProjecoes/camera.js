var scene = null;
var renderer = null;
var camera = null;
var angleX = 0.007;
var angleY = 0.0;
var angleZ = 0.0;

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
  renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.7);
  aspectRatio = window.innerWidth / window.innerHeight;

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  height = 300;
  camera = new THREE.PerspectiveCamera(100.0, aspectRatio, 10, height + 100);
  camera.position.set(100, height, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  var globalAxis = new THREE.AxisHelper(2.0);
  scene.add(globalAxis);

  var loader = new THREE.OBJLoader();
  loader.load('../../Assets/Models/city.obj', function(loadedMesh) {
    loadedMesh.name = "myObj";
    var material = new THREE.MeshPhongMaterial();
    material.bothsides = false;
    material.side = THREE.FrontSide;
    loadedMesh.children.forEach(function(child) { child.material = material; });
    scene.add(loadedMesh);
  });

  // Add point light Source
  var pointLight1 = new THREE.PointLight(new THREE.Color(1.0, 1.0, 1.0));
  pointLight1.distance = 0.0;
  pointLight1.position.set(0, 1.2 * height, 0);
  scene.add(pointLight1);

  controls = new THREE.FlyControls(camera, renderer.domElement);
  controls.update(0.5);

  renderer.clear();
  render();
};


function render() {
  controls.update(0.5);
  // var obj = scene.getObjectByName("myObj");
  // obj.rotateX(angleX);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
