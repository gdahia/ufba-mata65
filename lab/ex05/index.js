var renderer;
var camera;
var scene;
var cube;

function init() {
  // create renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0, 0, 0));
  renderer.setSize(500, 500);
  renderer.autoClear = false;
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  // create scene
  scene = new THREE.Scene();

  // create camera
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 50);
  camera.position.z = 30;
  scene.add(camera);

  // get video
  let video = document.getElementById("video");
  let videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;

  // load maps
  let textureLoader = new THREE.TextureLoader();
  let normalMap = textureLoader.load("normalmap.png");
  let dispMap = textureLoader.load("dispmap.png");
  let paths = [
    "envmap/px.jpg", "envmap/nx.jpg", "envmap/py.jpg", "envmap/ny.jpg",
    "envmap/pz.jpg", "envmap/nz.jpg"
  ];

  // load env map
  let reflectionCube = new THREE.CubeTextureLoader().load(paths);

  // create material for each face
  let normalMaterial =
      new THREE.MeshStandardMaterial({map: videoTexture, normalMap: normalMap});
  let dispMaterial = new THREE.MeshStandardMaterial(
      {map: videoTexture, displacementMap: dispMap, displacementBias: -0.5});
  let alphaMaterial = new THREE.MeshPhongMaterial(
      {map: videoTexture, transparent: true, alphaMap: videoTexture});
  let bumpMaterial = new THREE.MeshStandardMaterial(
      {map: videoTexture, bumpMap: videoTexture});
  let specMaterial =
      new THREE.MeshPhongMaterial({color: "blue", specularMap: videoTexture});
  let envMaterial = new THREE.MeshStandardMaterial(
      {envMap: reflectionCube, metalness: 0.95, roughness: 0.05});

  // create cube
  let geometry = new THREE.BoxGeometry(20, 20, 20, 40, 40, 40);
  cube = new THREE.Mesh(geometry, [
    normalMaterial, dispMaterial, alphaMaterial, bumpMaterial, specMaterial,
    envMaterial
  ]);
  scene.add(cube);

  // add lights
  let pointLight = new THREE.PointLight(0xffffff, 0.7);
  camera.add(pointLight);
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  // add controls
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;

  // get video stream
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var constraints = {video: {width: 720, height: 720, facingMode: 'user'}};

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) { video.srcObject = stream; })
        .catch(function(error) {
          console.error('Unable to access the camera/webcam.', error);
        });
  } else {
    console.error('MediaDevices interface not available.');
  }

  // animate
  requestAnimationFrame(render);
}

function render() {
  // render scene
  renderer.render(scene, camera);

  // rotate cube
  cube.rotation.y += 0.005;

  requestAnimationFrame(render);
}
