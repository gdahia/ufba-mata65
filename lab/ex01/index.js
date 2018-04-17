function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0, 0, 0));

  renderer.setSize(750, 750);

  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, -1, 1);

  scene.add(camera);

  var verticesPerRow = 100;
  var verticesPerCol = 100;
  var dropletGeometry = getDropletVertices(verticesPerRow, verticesPerCol);
  dropletGeometry =
      getDropletFaces(dropletGeometry, verticesPerRow, verticesPerCol);

  var dropletMaterial = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
    wireframe: true,
    side: THREE.DoubleSide
  });

  var dropletMesh = new THREE.Mesh(dropletGeometry, dropletMaterial);

  scene.add(dropletMesh);

  renderer.clear();
  renderer.render(scene, camera);
}

function getDropletVertices(verticesPerRow, verticesPerColumn) {
  var dropletGeometry = new THREE.Geometry();

  for (theta = 0; theta <= Math.PI; theta += Math.PI / verticesPerColumn)
    for (omega = 0; omega <= 2 * Math.PI; omega += 2 * Math.PI / verticesPerRow)
      dropletGeometry.vertices.push(
          new THREE.Vector3(
              0.5 * (1 - Math.cos(theta)) * Math.sin(theta) * Math.cos(omega),
              0.5 * (1 - Math.cos(theta)) * Math.sin(theta) * Math.sin(omega),
              Math.cos(theta)));

  return dropletGeometry;
}

function getDropletFaces(dropletGeometry, verticesPerRow, verticesPerColumn) {
  for (i = 0; i < dropletGeometry.vertices.length; i++) {
    row = parseInt(i / verticesPerRow);
    col = i % verticesPerRow;
    right_neighbor_index =
        (row * verticesPerRow + ((col + 1) % verticesPerRow)) %
        dropletGeometry.vertices.length;
    down_neighbor_index =
        ((row + 1) * verticesPerRow + col) % dropletGeometry.vertices.length;
    dropletGeometry.faces.push(
        new THREE.Face3(i, right_neighbor_index, down_neighbor_index));
  }

  return dropletGeometry;
}
