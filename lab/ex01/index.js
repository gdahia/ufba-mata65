function init() {
  var scene = new THREE.Scene();

  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0, 0, 0));
  renderer.setSize(500, 500);
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  scene.add(camera);

  // add dat.gui slider
  var Controls = function() {
    // resolution attributes
    this.verticesPerRow = 50;
    this.verticesPerCol = 50;

    // coloring attribute
    this.colorMode = 'fixed';
  };
  var controls = new Controls();
  var gui = new dat.GUI();

  // add color mode selector
  gui.add(controls, 'colorMode', ['fixed', 'cartesianBased', 'sphericBased']);

  // add resolution sliders
  var resControls = gui.addFolder('Resolution');
  resControls.add(controls, 'verticesPerRow', 20, 100);
  resControls.add(controls, 'verticesPerCol', 20, 100);
  resControls.open();

  // get droplet geometry
  var dropletGeometry =
      getDropletVertices(controls.verticesPerRow, controls.verticesPerCol);
  dropletGeometry = getDropletFaces(
      dropletGeometry, controls.verticesPerRow, controls.verticesPerCol);
  dropletGeometry = colorDropletFaces(dropletGeometry, controls.colorMode);

  // droplet material
  var dropletMaterial = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
    wireframe: true,
    side: THREE.DoubleSide
  });

  var dropletMesh = new THREE.Mesh(dropletGeometry, dropletMaterial);
  scene.add(dropletMesh);

  // animation
  var animate = function() {
    requestAnimationFrame(animate);

    dropletMesh.rotation.x += 0.01;
    dropletMesh.rotation.y += 0.01;

    renderer.render(scene, camera);
  };

  animate();
  // dropletMesh.rotation.set(-Math.PI * 0.5, 0, 0);
  // renderer.render(scene, camera);
}

function getDropletVertices(verticesPerRow, verticesPerColumn) {
  var dropletGeometry = new THREE.Geometry();

  for (theta = 0; theta <= Math.PI; theta += Math.PI / verticesPerColumn)
    for (omega = 0; omega < 2 * Math.PI; omega += 2 * Math.PI / verticesPerRow)
      dropletGeometry.vertices.push(
          new THREE.Vector3(
              0.5 * (1 - Math.cos(theta)) * Math.sin(theta) * Math.cos(omega),
              0.5 * (1 - Math.cos(theta)) * Math.sin(theta) * Math.sin(omega),
              Math.cos(theta)));

  return dropletGeometry;
}

function getDropletFaces(dropletGeometry, verticesPerRow, verticesPerColumn) {
  for (i = 0; i < dropletGeometry.vertices.length - verticesPerRow; i++) {
    row = parseInt(i / verticesPerRow);
    col = parseInt(i % verticesPerRow);
    right_neighbor_index = row * verticesPerRow + ((col + 1) % verticesPerRow);
    down_neighbor_index = (row + 1) * verticesPerRow + col;
    down_left_neighbor_index = (row + 1) * verticesPerRow +
        (col + verticesPerRow - 1) % verticesPerRow;
    dropletGeometry.faces.push(
        new THREE.Face3(i, right_neighbor_index, down_neighbor_index));
    dropletGeometry.faces.push(
        new THREE.Face3(i, down_left_neighbor_index, down_neighbor_index));
  }

  return dropletGeometry;
}

function colorDropletFaces(dropletGeometry, colorMode) {
  if (colorMode == 'fixed')
    dropletGeometry.faces.forEach(function(face) {
      face.color.setRGB(0.3, 0.3, 0.8);
    });
  else if (colorMode == 'cartesianBased') {
    // euclidean coordinates ranges
    var maxX = 0.6492353213974356;
    var minX = -0.6492353213974356;
    var maxY = 0.64795420379436;
    var minY = -0.64795420379436;
    var maxZ = 1;
    var minZ = -1;

    // color based on ranges
    dropletGeometry.faces.forEach(function(face) {
      var vs = [
        dropletGeometry.vertices[face.a],
        dropletGeometry.vertices[face.b],
        dropletGeometry.vertices[face.c],
      ];
      for (i = 0; i < 3; i++)
        face.vertexColors[i] = new THREE.Color(
            (vs[i].x - minX) / (maxX - minX), (vs[i].y - minY) / (maxY - minY),
            (vs[i].z - minZ) / maxZ);
    });
  }


  return dropletGeometry;
}
