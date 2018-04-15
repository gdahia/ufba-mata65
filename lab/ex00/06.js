function init() {
  var renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

  renderer.setSize(500, 500);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  var camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, -1.0, 1.0);
  scene.add(camera);

  var triangleGeometry = new THREE.Geometry();

  var numVertices = 80;

  // outer circumference vertices
  for (theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / numVertices)
    triangleGeometry.vertices.push(
        new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0.0));

  // inner circumference vertices
  var radius = 0.8;
  for (theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / numVertices)
    triangleGeometry.vertices.push(
        new THREE.Vector3(
            radius * Math.cos(theta), radius * Math.sin(theta), 0.0));

  // build outer circle
  var countFaces = 0;
  for (i = 0; i < numVertices; i += 2) {
    triangleGeometry.faces.push(
        new THREE.Face3(i, (i + 2) % numVertices, i + numVertices + 1));
    countFaces++;
  }

  // build inner circle
  for (i = 1; i < numVertices; i += 2) {
    triangleGeometry.faces.push(
        new THREE.Face3(
            i + numVertices, numVertices + (i + 2) % numVertices, i + 1));
    countFaces++;
  }

  var triangleMaterial = new THREE.MeshBasicMaterial(
      {vertexColors: THREE.VertexColors, wireframe: true});

  var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

  scene.add(triangleMesh);

  renderer.clear();
  renderer.render(scene, camera);
};
