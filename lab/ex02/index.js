function init() {
  var scene = new THREE.Scene();

  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0, 0, 0));
  renderer.setSize(500, 500);
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  var camera = new THREE.OrthographicCamera(-2, 2, 2, -2, -2, 2);
  scene.add(camera);

  // preload bunny and bulbasour meshes
  var loader = new THREE.OBJLoader();
  var bunnyGeometry;
  var bulbasourGeometry;
  loader.load('bunny.obj', function(loadedMesh) {
    bunnyGeometry = new THREE.Geometry().fromBufferGeometry(
        loadedMesh.children[0].geometry);
    bunnyGeometry = normalizeGeometry(bunnyGeometry);
  });
  loader.load('bulbasour.obj', function(loadedMesh) {
    bulbasourGeometry = new THREE.Geometry().fromBufferGeometry(
        loadedMesh.children[1].geometry);
    bulbasourGeometry = normalizeGeometry(bulbasourGeometry);
  });

  // get droplet geometry
  var geometry = getDropletVertices(50);
  geometry = getDropletFaces(geometry, 50);
  geometry = colorDropletFaces(geometry, 'sphericalBased', [77, 77, 204], 50);

  // droplet material
  var material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
    wireframe: true,
    side: THREE.DoubleSide
  });

  // create mesh
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // add dat.gui slider
  var Controls = function() {
    // select obj to load
    this.source = 'droplet';

    // resolution attributes
    this.vertices = 50;

    // coloring attributes
    this.dropletColorMode = 'sphericalBased';
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
    // control source
    if (controls.source == 'droplet') {
      // get new droplet geometry
      geometry = getDropletVertices(parseInt(controls.vertices));
      geometry = getDropletFaces(geometry, parseInt(controls.vertices));
      geometry = colorDropletFaces(
          geometry, controls.dropletColorMode, controls.fixedColor,
          parseInt(controls.vertices));
    } else if (controls.source == 'bunny') {
      geometry = bunnyGeometry.clone();
      geometry.faces.forEach(function(face) {
        face.color.setRGB(
            controls.fixedColor[0] / 255, controls.fixedColor[1] / 255,
            controls.fixedColor[2] / 255);
      });
    } else {
      geometry = bulbasourGeometry.clone();
      geometry.faces.forEach(function(face) {
        face.color.setRGB(
            controls.fixedColor[0] / 255, controls.fixedColor[1] / 255,
            controls.fixedColor[2] / 255);
      });
    }

    // control transformation
    if (controls.transf == 'taper')
      applyTaper(
          geometry.vertices, controls.transfDirection, controls.transfVal);
    else if (controls.transf == 'twist')
      applyTwist(
          geometry.vertices, controls.transfDirection, controls.transfVal);
    else
      applyShear(
          geometry.vertices, controls.transfDirection, controls.transfVal);

    mesh.geometry = geometry;
  };

  // add mesh selection
  gui.add(controls, 'source', ['droplet', 'bunny', 'bulbasour'])
      .onFinishChange(updateFunction);

  // add color mode selector
  gui.add(
         controls, 'dropletColorMode',
         ['fixed', 'cartesianBased', 'sphericalBased'])
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

    if (!controls.freezeRotation) mesh.rotation.y += 0.01;

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
  const maxX = 1;
  const minX = -1;
  const maxY = 1;
  const minY = -1;
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
  const maxX = 1;
  const minX = -1;
  const maxY = 1;
  const minY = -1;
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

function normalizeGeometry(geometry) {
  // compute maximums and minimums
  let maxX = geometry.vertices[0].x;
  let maxY = geometry.vertices[0].y;
  let maxZ = geometry.vertices[0].z;
  let minX = geometry.vertices[0].x;
  let minY = geometry.vertices[0].y;
  let minZ = geometry.vertices[0].z;
  geometry.vertices.forEach(function(v) {
    maxX = Math.max(maxX, v.x);
    maxY = Math.max(maxY, v.y);
    maxZ = Math.max(maxZ, v.z);
    minX = Math.min(minX, v.x);
    minY = Math.min(minY, v.y);
    minZ = Math.min(minZ, v.z);
  });

  geometry.vertices.forEach(function(v) {
    v.x = 2 * (v.x - minX) / (maxX - minX) + -1;
    v.y = 2 * (v.y - minY) / (maxY - minY) + -1;
    v.z = 2 * (v.z - minZ) / (maxZ - minZ) + -1;
  });

  return geometry;
}
