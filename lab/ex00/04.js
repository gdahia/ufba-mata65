function init() {
  var scene = new THREE.Scene();

  var renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

  renderer.setSize(500, 500);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  var camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, -1.0, 1.0);
  scene.add(camera);

  // add circle center
  var triangleGeometry = new THREE.Geometry();
  triangleGeometry.vertices.push(new THREE.Vector3(0.0, 0.0, 0.0));

  // add circunference approximation vertices
  var circleSampling = 60;
  var radius = 0.8;
  for (i = Math.PI / 6; i < 2 * Math.PI - Math.PI / 6;
       i += (2 * Math.PI) / circleSampling) {
    var x = radius * Math.cos(i);
    var y = radius * Math.sin(i);

    triangleGeometry.vertices.push(new THREE.Vector3(x, y, 0.0));
  }

  // draw circle through triangles
  for (i = 0; i < triangleGeometry.vertices.length - 1; i++) {
    triangleGeometry.faces.push(new THREE.Face3(0, i, i + 1));
    triangleGeometry.faces[i].vertexColors[0] = new THREE.Color(0xffee00);
    triangleGeometry.faces[i].vertexColors[1] = new THREE.Color(0xffee00);
    triangleGeometry.faces[i].vertexColors[2] = new THREE.Color(0xffee00);
  }

  var triangleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    wireframe: false
  });

  var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

  scene.add(triangleMesh);

  renderer.clear();
  renderer.render(scene, camera);
};
