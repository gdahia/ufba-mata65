var renderer;
var scene;
var camera;
var texture1;
var texture2;

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
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  scene.add(camera);

  // load texture
  let loader = new THREE.TextureLoader();
  texture1 = loader.load("../../Assets/Images/lena.png");
  texture2 = loader.load("../../Assets/Images/barbara.png");

  renderer.clear();
  requestAnimationFrame(render);
}

function render() {
  if (!texture1.image || !texture2.image)
    requestAnimationFrame(render);
  else {
    // create shader material
    let uniforms = {
      texture1: {type: "t", value: texture1},
      texture2: {type: "t", value: texture2}
    };
    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById("base-vs").textContent,
      fragmentShader: document.getElementById("blending-fs").textContent
    });

    // make plane to map image
    let geometry = new THREE.PlaneGeometry(2, 2);
    let plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // render scene
    renderer.render(scene, camera);
  }
}
