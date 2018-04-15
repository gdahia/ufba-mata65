function init() {
  var scene = new THREE.Scene();

  var renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0, 0, 0));
  renderer.setSize(500, 500);
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  var camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, -1.0, 1.0);
  scene.add(camera);

  // cylinder properties
  var radius = 0.5;
  var height = 1.0;
  var numVertices = 80;
  var cylinderGeometry = new THREE.Geometry();

  // base 1 vertices [0, numVertices]
  cylinderGeometry.vertices.push(new THREE.Vector3(0, -0.5, 0));
  for (theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / numVertices)
    cylinderGeometry.vertices.push(
        new THREE.Vector3(
            radius * Math.cos(theta), -0.5, radius * Math.sin(theta)));

  // base 1 faces
  for (i = 1; i <= numVertices; i++)
    cylinderGeometry.faces.push(new THREE.Face3(0, i, i % numVertices + 1));

  // base 2 vertices [numVertices + 1, 2 * numVertices + 2]
  cylinderGeometry.vertices.push(new THREE.Vector3(0, 0.5, 0));
  for (theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / numVertices)
    cylinderGeometry.vertices.push(
        new THREE.Vector3(
            radius * Math.cos(theta), 0.5, radius * Math.sin(theta)));

  // base 2 faces
  for (i = 1; i <= numVertices; i++) {
    cylinderGeometry.faces.push(
        new THREE.Face3(
            numVertices + 1, i + numVertices + 1,
            i % numVertices + numVertices + 2));
    // cylinderGeometry.faces[numVertices + i - 1].vertexColors[0] =
    // new THREE.Color(1.0, 0, 0);
    // cylinderGeometry.faces[numVertices + i - 1].vertexColors[1] =
    // new THREE.Color(1.0, 0, 0);
    // cylinderGeometry.faces[numVertices + i - 1].vertexColors[2] =
    // new THREE.Color(1.0, 0, 0);
  }

  // lateral faces
  for (i = 1; i <= numVertices; i++) {
    cylinderGeometry.faces.push(
        new THREE.Face3(i, i % numVertices + 1, i + numVertices + 1));
    // var len = cylinderGeometry.faces.length;
    // cylinderGeometry.faces[len - 1].vertexColors[0] =
    // new THREE.Color(0, 0, 1.0);
    // cylinderGeometry.faces[len - 1].vertexColors[1] =
    // new THREE.Color(0, 0, 1.0);
    // cylinderGeometry.faces[len - 1].vertexColors[2] =
    // new THREE.Color(0, 0, 1.0);
  }
  for (i = 1; i < numVertices; i++) {
    cylinderGeometry.faces.push(
        new THREE.Face3(
            i + numVertices + 1, i % numVertices + numVertices + 2, i + 1));
    // var len = cylinderGeometry.faces.length;
    // cylinderGeometry.faces[len - 1].vertexColors[0] =
    // new THREE.Color(0, 0, 1.0);
    // cylinderGeometry.faces[len - 1].vertexColors[1] =
    // new THREE.Color(0, 0, 1.0);
    // cylinderGeometry.faces[len - 1].vertexColors[2] =
    // new THREE.Color(0, 0, 1.0);
  }

  var cylinderMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    wireframe: true
  });

  var cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinderMesh.rotation.set(0.25 * Math.PI, 0, 0);
  scene.add(cylinderMesh);

  renderer.clear();
  renderer.render(scene, camera);
}
