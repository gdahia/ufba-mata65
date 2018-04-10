function init() {
  var scene = new THREE.Scene();
  var renderer = new THREE.WebGLRenderer();
  var camera = new THREE.Camera();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
  renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);

  var geometry = new THREE.Geometry();
  geometry.vertices.push(
      new THREE.Vector3(-1.0, 0.5, 0), new THREE.Vector3(-0.5, -0.5, 0),
      new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0.5, -0.5, 0),
      new THREE.Vector3(1.0, 0.5, 0));

  var material = new THREE.LineBasicMaterial({color: 0xff0000});
  var line = new THREE.Line(geometry, material);
  scene.add(line);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  renderer.clear();
  renderer.render(scene, camera);
}
