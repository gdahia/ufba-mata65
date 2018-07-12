function init() {
  // create renderer
  let renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0, 0, 0));

  // create scene
  let scene = new THREE.Scene();

  // create camera
  let camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -0.5, 0.5);
  scene.add(camera);

  // load texture
  let loader = new THREE.TextureLoader();
  loader.load("../../Assets/Images/lena.png", function(texture) {
    // make renderer size be the image size
    renderer.setSize(texture.image.width, texture.image.height);
    renderer.autoClear = false;
    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    // addj plane to map image
    let geometry = new THREE.PlaneGeometry(1, 1);
    let material = new THREE.MeshBasicMaterial({map: texture});
    let plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // create grayscale shader
    let uniforms = {tDiffuse: {type: "t", value: null}};
    let gsShader = {
      uniforms: uniforms,
      vertexShader: document.getElementById("base-vs").textContent,
      fragmentShader: document.getElementById("grayscale-fs").textContent
    };

    // create binarization shader
    let bShader = {
      uniforms: uniforms,
      vertexShader: document.getElementById("base-vs").textContent,
      fragmentShader: document.getElementById("binary-fs").textContent
    };

    // create composer
    let composer = new THREE.EffectComposer(renderer);

    // create render pass
    let renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // create grayscale render pass
    let gsShaderPass = new THREE.ShaderPass(gsShader);
    composer.addPass(gsShaderPass);

    // create binary render pass
    let bShaderPass = new THREE.ShaderPass(bShader);
    bShaderPass.renderToScreen = true;
    composer.addPass(bShaderPass);

    // render
    composer.render();
  });
}
