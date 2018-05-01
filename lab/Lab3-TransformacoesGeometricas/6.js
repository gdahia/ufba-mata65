var scene = null;
var renderer = null;
var camera = null;
var earth = null;
var moon = null;
var sun = null;
var day = 0.0;
var year = 0.0;
var month = 0.0;

function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
  renderer.setSize(500, 500);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, -1.0, 1.0);
  scene.add(camera);

  // Eixo do Sol
  var sAxis = new THREE.AxisHelper(0.6);

  // Sol
  var sphereGeometry = new THREE.SphereGeometry(0.4, 20, 20);
  var sphereMat =
      new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true});
  sun = new THREE.Mesh(sphereGeometry, sphereMat);
  sun.add(sAxis);
  scene.add(sun);

  // Eixo da Terra
  var tAxis = new THREE.AxisHelper(0.15);

  // Eixo da Lua
  var lAxis = new THREE.AxisHelper(0.04);

  // Lua
  sphereGeometry = new THREE.SphereGeometry(0.03, 10, 10);
  sphereMat = new THREE.MeshBasicMaterial({color: 0xaaaaaa, wireframe: true});
  moon = new THREE.Mesh(sphereGeometry, sphereMat);
  moon.add(lAxis);

  // Terra
  sphereGeometry = new THREE.SphereGeometry(0.1, 20, 20);
  sphereMat = new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true});
  earth = new THREE.Mesh(sphereGeometry, sphereMat);
  earth.add(tAxis);
  earth.add(moon);
  scene.add(earth);

  renderer.clear();
  render();
};

function render() {
  var earthMat = new THREE.Matrix4();
  var moonMat = new THREE.Matrix4();

  day += 0.07;
  year += 0.01;
  month += 0.04;

  // sun does not move, so sun transfs were removed

  // earth transfs
  earth.matrix.copy(earthMat);

  // rotate on own axis
  earthMat.makeRotationY(day);
  earth.applyMatrix(earthMat);

  // distance from sun
  earthMat.makeTranslation(0.7, 0, 0);
  earth.applyMatrix(earthMat);

  // rotate around sun
  earthMat.makeRotationY(year);
  earth.applyMatrix(earthMat);

  earth.updateMatrix();

  // moon transfs
  moon.matrix.copy(moonMat);

  // moon-earth distance
  moonMat.makeTranslation(0.15, 0, 0);
  moon.applyMatrix(moonMat);

  // moon-earth rotation
  moonMat.makeRotationY(day);
  moon.applyMatrix(moonMat);

  moon.updateMatrix();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
