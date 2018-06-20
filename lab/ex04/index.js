function init() {
  // create renderer
  let renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0, 0, 0));
  renderer.setSize(500, 500);
  renderer.autoClear = false;
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  // create scene
  let scene = new THREE.Scene();

  // create camera
  let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  scene.add(camera);

  // make planes to map images
  let geometry = new THREE.PlaneGeometry(1, 1);
  let material =
      new THREE.MeshBasicMaterial({color: "blue", side: THREE.DoubleSide});
  let plane1 = new THREE.Mesh(geometry, material);
  let plane2 = new THREE.Mesh(geometry, material);
  plane1.position.set(-0.5, 0.5, 0);
  plane2.position.set(0.5, 0.5, 0);
  scene.add(plane1);
  scene.add(plane2);

  // create gui controller
  let Controls = function() { this.mode = "gray"; };
  let controls = new Controls();
  const modes = ["red", "green", "blue", "gray"];

  // load texture
  let loader = new THREE.TextureLoader();
  let updateFunction = function() {
    // get image name according to mode
    let imageName = (controls.mode == "gray" ? "gray.jpg" : "color.jpg");

    // remove possible previous plots
    for (let i = scene.children.length - 1; i >= 0; i--)
      if (scene.children[i].type == "Group") scene.remove(scene.children[i]);

    // load texture
    loader.load(imageName, function(texture) {
      // extract image data
      let imageData = getImageData(texture.image);

      let hist = [];
      let eqHist = [];
      if (controls.mode != "gray") {
        // compute histograms
        let hists = computeHistograms(imageData);

        // find conversion map
        let lumHist = computeLightnessHistogram(imageData);
        let convMap = getConversionMap(lumHist);

        // equalize image
        equalizeRGBImage(imageData, convMap);

        // compute equalized histograms
        let eqHists = computeHistograms(imageData);

        // choose histograms based on mode
        let histIndex = 0;
        for (let i = 0; i < 3; i++)
          if (controls.mode == modes[i]) histIndex = i;
        eqHist = eqHists[histIndex];
        hist = hists[histIndex];
      } else {
        // compute histogram
        hist = computeHistogram(imageData);

        // find conversion map
        let convMap = getConversionMap(hist);

        // equalize image
        equalizeGrayImage(imageData, convMap);

        // compute equalized histogram
        eqHist = computeHistogram(imageData);
      }

      // create new texture for equalized image
      let eqTexture = new THREE.DataTexture(
          new Uint8Array(imageData.data), imageData.width, imageData.height,
          THREE.RGBAFormat);
      eqTexture.needsUpdate = true;
      eqTexture.flipY = true;

      // get plot of both histograms
      let histPlot = getHistogramPlot(hist, 1, 1, controls.mode);
      let eqHistPlot = getHistogramPlot(eqHist, 1, 1, controls.mode);

      // adjust histogram positions in window
      histPlot.position.set(-1, -1, 0);
      eqHistPlot.position.set(0, -1, 0);

      // add plots to scene
      scene.add(histPlot);
      scene.add(eqHistPlot);

      // add original image to scene
      let material1 = new THREE.MeshBasicMaterial({map: texture});
      plane1.material = material1;

      // add new image to scene
      let material2 = new THREE.MeshBasicMaterial({map: eqTexture});
      plane2.material = material2;

      // render scene
      renderer.render(scene, camera);
    });
  };

  // preload image
  updateFunction();

  // add gui
  let gui = new dat.GUI();
  gui.add(controls, "mode", modes).onFinishChange(updateFunction);
}

function computeHistograms(imageData) {
  // 0 initialize histograms
  let rHist = new Array(256).fill(0);
  let gHist = new Array(256).fill(0);
  let bHist = new Array(256).fill(0);

  // iterate over pixels and compute histograms
  for (let i = 0; i < imageData.height; i++)
    for (let j = 0; j < imageData.width; j++) {
      let pixel = getPixel(imageData, j, i);
      rHist[pixel[0]]++;
      gHist[pixel[1]]++;
      bHist[pixel[2]]++;
    }

  // normalize histograms to [0, 1]
  const numPixels = imageData.width * imageData.height;
  for (let i = 0; i < 256; i++) {
    rHist[i] /= numPixels;
    gHist[i] /= numPixels;
    bHist[i] /= numPixels;
  }

  return [rHist, gHist, bHist];
}

function computeHistogram(imageData) {
  // 0 initialize histogram
  let hist = new Array(256).fill(0);

  // iterate over pixels and compute histogram
  for (let i = 0; i < imageData.height; i++)
    for (let j = 0; j < imageData.width; j++) {
      let pixel = getPixel(imageData, j, i);
      hist[pixel[0]]++;
    }

  // normalize histogram to [0, 1]
  const numPixels = imageData.width * imageData.height;
  for (let i = 0; i < 256; i++) hist[i] /= numPixels;

  return hist;
}

function computeLightnessHistogram(imageData) {
  // 0 initialize histogram
  let hist = new Array(256).fill(0);

  // iterate over pixels and compute histogram
  for (let i = 0; i < imageData.height; i++)
    for (let j = 0; j < imageData.width; j++) {
      let pixel = getPixel(imageData, j, i);
      let hsl = {};
      let color =
          new THREE.Color(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255)
              .getHSL(hsl);
      hist[Math.round(255 * hsl.l)]++;
    }

  // normalize histogram to [0, 1]
  const numPixels = imageData.width * imageData.height;
  for (let i = 0; i < 256; i++) hist[i] /= numPixels;

  return hist;
}

function getConversionMap(hist) {
  let convMap = [hist[0]];
  for (let i = 1; i < 256; i++) convMap.push(convMap[i - 1] + hist[i]);
  return convMap;
}

function equalizeGrayImage(imageData, convMap) {
  for (let i = 0; i < imageData.height; i++)
    for (let j = 0; j < imageData.width; j++) {
      // retrieve original pixel value
      let pixel = getPixel(imageData, j, i);

      // replace pixel values with equalized
      for (let c = 0; c < 3; c++)
        pixel[c] = Math.round(255 * convMap[pixel[c]]);

      // replace original pixel in image
      setPixel(imageData, j, i, pixel);
    }
}

function equalizeRGBImage(imageData, convMap) {
  for (let i = 0; i < imageData.height; i++)
    for (let j = 0; j < imageData.width; j++) {
      // retrieve original pixel value
      let pixel = getPixel(imageData, j, i);

      // convert to hsl
      let hsl = {};
      let color =
          new THREE.Color(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255)
              .getHSL(hsl);

      // replace lightness value with equalized
      hsl.l = convMap[Math.round(255 * hsl.l)];

      // convert back to rgb
      color = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
      pixel = color.toArray();
      for (let c = 0; c < 3; c++) pixel[c] = Math.round(pixel[c] * 255);

      // replace original pixel in image
      setPixel(imageData, j, i, pixel);
    }
}

function getHistogramPlot(hist, width, height, color) {
  // init histogram group and material
  let histPlot = new THREE.Group();
  let material =
      new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});

  // normalize heights with max height
  var maxHeight = 0;
  for (let i = 0; i < hist.length; i++)
    maxHeight = Math.max(maxHeight, hist[i]);

  // make each bar
  const barWidth = width / hist.length;
  for (let i = 0; i < hist.length; i++) {
    // compute bar height
    const barHeight = hist[i] * height / maxHeight;

    // only add bar if height is not null
    if (barHeight != 0) {
      // create current bar
      let barGeo = new THREE.PlaneGeometry(barWidth, barHeight);
      let bar = new THREE.Mesh(barGeo, material);

      // put relative offset in graph
      bar.position.set(barWidth * (i + 0.5), barHeight / 2, 0);

      // add to histogram plot group
      histPlot.add(bar);
    }
  }

  return histPlot;
}

/* image manipulation based on https://github.com/mrdoob/three.js/issues/758 */

function getImageData(image) {
  let canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  let context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

function getPixel(imageData, x, y) {
  let position = (x + imageData.width * y) * 4;
  let data = imageData.data;
  return [data[position], data[position + 1], data[position + 2]];
}

function setPixel(imageData, x, y, val) {
  let position = (x + imageData.width * y) * 4;
  for (let i = 0; i < 3; i++) imageData.data[position + i] = val[i];
}
