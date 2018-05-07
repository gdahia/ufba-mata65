function init() {
  var scene = new THREE.Scene();

  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0, 0, 0));
  renderer.setSize(500, 500);
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  scene.add(camera);

  // get droplet geometry
  var dropletGeometry = getDropletVertices(50);
  dropletGeometry = getDropletFaces(dropletGeometry, 50);
  dropletGeometry =
      colorDropletFaces(dropletGeometry, 'sphericalBased', [77, 77, 204], 50);

  // droplet material
  var dropletMaterial = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
    wireframe: true,
    side: THREE.DoubleSide
  });

  // create mesh
  var dropletMesh = new THREE.Mesh(dropletGeometry, dropletMaterial);
  scene.add(dropletMesh);

  // add dat.gui slider
  var Controls = function() {
    // resolution attributes
    this.vertices = 50;

    // coloring attributes
    this.colorMode = 'sphericalBased';
    this.fixedColor = [77, 77, 204];

    // stop rotation attribute
    this.freezeRotation = false;

    // transformation properties
    this.transf = 'taper';
    this.transfVal = 0;
    this.transfDirection = 'y';
  };
  var controls = new Controls();
  var gui = new dat.GUI();

  var updateFunction = function() {
    // get new droplet geometry
    dropletGeometry = getDropletVertices(parseInt(controls.vertices));
    dropletGeometry =
        getDropletFaces(dropletGeometry, parseInt(controls.vertices));
    dropletGeometry = colorDropletFaces(
        dropletGeometry, controls.colorMode, controls.fixedColor,
        parseInt(controls.vertices));

    if (controls.transf == 'taper')
      applyTaper(
          dropletGeometry.vertices, controls.transfDirection,
          controls.transfVal);
    else if (controls.transf == 'twist')
      applyTwist(
          dropletGeometry.vertices, controls.transfDirection,
          controls.transfVal);
    else
      applyShear(
          dropletGeometry.vertices, controls.transfDirection,
          controls.transfVal);
    dropletMesh.geometry = dropletGeometry;
  };

  // add color mode selector
  gui.add(controls, 'colorMode', ['fixed', 'cartesianBased', 'sphericalBased'])
      .onFinishChange(updateFunction);

  // add color mode selector
  gui.addColor(controls, 'fixedColor').onFinishChange(updateFunction);

  // add vertices resolution sliders
  gui.add(controls, 'vertices', 5, 100).onFinishChange(updateFunction);

  // add freeze rotation checkbox
  gui.add(controls, 'freezeRotation');

  // add transformation controls
  gui.add(controls, 'transf', ['taper', 'twist', 'shear'])
      .onFinishChange(updateFunction);
  gui.add(controls, 'transfVal', 0, 1, 0.1).onFinishChange(updateFunction);
  gui.add(controls, 'transfDirection', ['x', 'y', 'z'])
      .onFinishChange(updateFunction);

  // animation
  var animate = function() {
    requestAnimationFrame(animate);

    if (!controls.freezeRotation) dropletMesh.rotation.y += 0.01;

    renderer.render(scene, camera);
  };
  animate();
}

function getDropletVertices(vertices) {
  var dropletGeometry = new THREE.Geometry();

  for (i = 0; i <= vertices; i++) {
    var theta = i * Math.PI / vertices;
    for (j = 0; j < vertices; j++) {
      var omega = j * 2 * Math.PI / vertices;
      dropletGeometry.vertices.push(
          new THREE.Vector3(
              0.5 * (1 - Math.cos(theta)) * Math.sin(theta) * Math.cos(omega),
              0.5 * (1 - Math.cos(theta)) * Math.sin(theta) * Math.sin(omega),
              Math.cos(theta)));
    }
  }

  return dropletGeometry;
}

function getDropletFaces(dropletGeometry, vertices) {
  for (i = 0; i < dropletGeometry.vertices.length - vertices; i++) {
    // retrieve row and column of index
    row = parseInt(i / vertices);
    col = parseInt(i % vertices);

    // compute neighbors' index
    right_neighbor_index = row * vertices + ((col + 1) % vertices);
    down_neighbor_index = (row + 1) * vertices + col;
    down_left_neighbor_index =
        (row + 1) * vertices + (col + vertices - 1) % vertices;

    // draw faces
    dropletGeometry.faces.push(
        new THREE.Face3(i, right_neighbor_index, down_neighbor_index));
    dropletGeometry.faces.push(
        new THREE.Face3(i, down_left_neighbor_index, down_neighbor_index));
  }

  return dropletGeometry;
}

function colorDropletFaces(dropletGeometry, colorMode, fixedColor, vertices) {
  if (colorMode == 'fixed')
    dropletGeometry.faces.forEach(function(face) {
      face.color.setRGB(
          fixedColor[0] / 255, fixedColor[1] / 255, fixedColor[2] / 255);
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
  } else {
    // compute appropiate spherical based colors
    // for vertices omitting dependency on angles
    for (i = 0; i <= vertices; i++)
      for (j = 0; j < vertices; j++)
        dropletGeometry.colors.push(
            new THREE.Color().setHSL(j / vertices, 1, i / vertices));

    // color based on spherical coordinates
    dropletGeometry.faces.forEach(function(face) {
      var vs = [face.a, face.b, face.c];
      for (i = 0; i < 3; i++) {
        face.vertexColors[i] = dropletGeometry.colors[vs[i]];
      }
    });
  }


  return dropletGeometry;
}

function applyTaper(vertices, direction, val) {
  const maxX = 0.6492353213974356;
  const minX = -0.6492353213974356;
  const maxY = 0.64795420379436;
  const minY = -0.64795420379436;
  const maxZ = 1;
  const minZ = -1;
  if (direction == 'z') {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      mat.set(
          1 + val * (v.z - minZ) / (maxZ - minZ), 0, 0, 0, 0,
          1 + val * (v.z - minZ) / (maxZ - minZ), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  } else if (direction == 'y') {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      mat.set(
          1 + val * (v.y - minY) / (maxY - minY), 0, 0, 0, 0, 1, 0, 0, 0, 0,
          1 + val * (v.y - minY) / (maxY - minY), 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  } else {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      mat.set(
          1, 0, 0, 0, 0, 1 + val * (v.x - minX) / (maxX - minX), 0, 0, 0, 0,
          1 + val * (v.x - minX) / (maxX - minX), 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  }
}

function applyTwist(vertices, direction, val) {
  const maxX = 0.6492353213974356;
  const minX = -0.6492353213974356;
  const maxY = 0.64795420379436;
  const minY = -0.64795420379436;
  const maxZ = 1;
  const minZ = -1;
  if (direction == 'z') {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      const angle = 2 * Math.PI * val * (v.z - minZ) / (maxZ - minZ);
      mat.set(
          Math.cos(angle), -Math.sin(angle), 0, 0, Math.sin(angle),
          Math.cos(angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  } else if (direction == 'y') {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      const angle = 2 * Math.PI * val * (v.y - minY) / (maxY - minY);
      mat.set(
          Math.cos(angle), 0, -Math.sin(angle), 0, 0, 1, 0, 0, Math.sin(angle),
          0, Math.cos(angle), 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  } else {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      const angle = 2 * Math.PI * val * (v.x - minX) / (maxX - minX);
      mat.set(
          1, 0, 0, 0, 0, Math.cos(angle), -Math.sin(angle), 0, 0,
          Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  }
}

function applyShear(vertices, direction, val) {
  if (direction == 'z') {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      mat.set(1, 0, val, 0, 0, 1, val, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  } else if (direction == 'y') {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      mat.set(1, val, 0, 0, 0, 1, 0, 0, 0, val, 1, 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  } else {
    vertices.forEach(function(v) {
      let mat = new THREE.Matrix4();
      mat.set(1, 0, 0, 0, val, 1, 0, 0, val, 0, 1, 0, 0, 0, 0, 1);
      v.applyMatrix4(mat);
    });
  }
}
