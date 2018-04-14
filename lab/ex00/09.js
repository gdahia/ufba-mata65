
function init() {
  var scene = new THREE.Scene();

  var renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

  renderer.setSize(500, 500);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  var camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, -1.0, 1.0);
  scene.add(camera);

  var triangleGeometry = new THREE.Geometry();

  // vertices
  var sqrt3 = Math.sqrt(3);
  triangleGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5 * sqrt3 / 3, 0));
  triangleGeometry.vertices.push(new THREE.Vector3(0.5, -0.5 * sqrt3 / 3, 0));
  triangleGeometry.vertices.push(
      new THREE.Vector3(0, 0.5 * sqrt3 * (1 - 1 / 3), 0));
  triangleGeometry.vertices.push(new THREE.Vector3(0, 0, 0));

  // faces
  triangleGeometry.faces.push(new THREE.Face3(1, 2, 0));
  triangleGeometry.faces.push(new THREE.Face3(1, 3, 0));
  triangleGeometry.faces.push(new THREE.Face3(2, 3, 0));
  triangleGeometry.faces.push(new THREE.Face3(2, 3, 1));
  triangleGeometry.faces[0].materialIndex = 0;
  triangleGeometry.faces[1].materialIndex = 1;
  triangleGeometry.faces[2].materialIndex = 2;
  triangleGeometry.faces[3].materialIndex = 3;

  var boxMaterials = [
    new THREE.MeshBasicMaterial({color: 0xFF0000}),
    new THREE.MeshBasicMaterial({color: 0x0000FF}),
    new THREE.MeshBasicMaterial({color: 0xFFFFFF}),
    new THREE.MeshBasicMaterial({color: 0x00FFFF})
  ];
  var triangleMaterial = new THREE.MeshFaceMaterial(boxMaterials);

  var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

  scene.add(triangleMesh);

  renderer.clear();
  renderer.render(scene, camera);
};
