var mesh;
var renderer;
var scene;
var camera;
var BBox;
var maxDim;

function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

  renderer.setSize(750, 750);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  camera =
      new THREE.OrthographicCamera(-250.0, 250.0, 250.0, -250.0, -250.0, 250.0);

  scene.add(camera);

  // Load Mesh
  var loader = new THREE.OBJLoader();
  loader.load('../../Assets/Models/bunnyExp.obj', loadMesh);

  renderer.clear();
  // Global Axis
  var globalAxis = new THREE.AxesHelper(250.0);
  scene.add(globalAxis);
  render();
}

function render() {
  if (mesh)
    renderer.render(scene, camera);
  else
    requestAnimationFrame(render);
}

function loadMesh(loadedMesh) {
  var geometry =
      new THREE.Geometry().fromBufferGeometry(loadedMesh.children[0].geometry);

  // compute range for each axis
  var maxX = -1000;
  var minX = 1000;
  var maxY = -1000;
  var minY = 1000;
  var maxZ = -1000;
  var minZ = 1000;
  geometry.vertices.forEach(function(vertex) {
    maxX = Math.max(maxX, vertex.x);
    maxY = Math.max(maxY, vertex.y);
    maxZ = Math.max(maxZ, vertex.z);
    minX = Math.min(minX, vertex.x);
    minY = Math.min(minY, vertex.y);
    minZ = Math.min(minZ, vertex.z);
  });

  // color vertices accordingly
  geometry.faces.forEach(function(face) {
    var vs = [
      geometry.vertices[face.a],
      geometry.vertices[face.b],
      geometry.vertices[face.c],
    ];
    for (i = 0; i < 3; i++)
      face.vertexColors[i] = new THREE.Color(
          (vs[i].x - minX) / (maxX - minX), (vs[i].y - minY) / (maxY - minY),
          (vs[i].z - minZ) / (maxZ - minZ));
  });
  var material = new THREE.MeshBasicMaterial(
      {color: 0x2194ce, vertexColors: THREE.VertexColors, wireframe: true});

  mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
};
