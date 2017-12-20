let canvasWidth = 512;
let canvasHeight = 128;
let resolution = 4;
let generation;
let fps = 30;
let canvas;
let scene, camera, renderer, texture, geometry, material, torus;

function setup() {
  frameRate(fps);
  noLoop();
  canvasWidth -= canvasWidth % resolution;
  canvasHeight -= canvasHeight % resolution;
  createCanvas(canvasWidth, canvasHeight);

  canvas = document.getElementById('defaultCanvas0');
  canvas.style.display = 'none';
  let width = canvasWidth / resolution;
  let height = canvasHeight / resolution;
  generation = createGrid(width, height);
  randomizeGrid(generation);

  renderCanvas();
  init();
  animate();
}

function mouseClicked() {
  randomizeGrid(generation);
}

function createGrid(width, height) {
  let arr = new Array(width);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(height);
  }
  return arr;
}

function randomizeGrid(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = new Square(i, j, floor(random(2)));
    }
  }
}

function createNextGeneration(gen) {
  // Create next generation by filling nextValue
  for (let i = 0; i < gen.length; i++) {
    for (let j = 0; j < gen[i].length; j++) {
      let neighbours = countNeighbours(gen, i, j);
      if (gen[i][j].value == 1 && (neighbours < 2 || neighbours > 3)) {
        gen[i][j].nextValue = 0;
      } else if (gen[i][j].value == 0 && neighbours == 3) {
        gen[i][j].nextValue = 1;
      }
    }
  }

  // set value to nextValue and advance one generation
  for (let i = 0; i < gen.length; i++) {
    for (let j = 0; j < gen[i].length; j++) {
      gen[i][j].value = gen[i][j].nextValue;
    }
  }
}

function countNeighbours(arr, x, y) {
  let count = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let xValue = (x + i + arr.length) % arr.length;
      let yValue = (y + j + arr[0].length) % arr[0].length;
      count += arr[xValue][yValue].value;
    }
  }
  count -= arr[x][y].value;
  return count;
}

function advanceGeneration() {
  createNextGeneration(generation);
  renderCanvas();
}

class Square {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.nextValue = value;
  }
}

function renderCanvas() {
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      if (generation[i][j].value) {
        fill(204, 24, 24);
      } else {
        fill(21, 135, 10);
      }
      rect(i * resolution, j * resolution, resolution, resolution);
    }
  }
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // adding torus
  texture = new THREE.Texture(canvas);
  geometry = new THREE.TorusGeometry(25, 10, 30, 30);
  material = new THREE.MeshBasicMaterial({ map: texture });
  torus = new THREE.Mesh(geometry, material);
  scene.add(torus);
  camera.position.z = 75;

  let controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  advanceGeneration();

  texture.needsUpdate = true;
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  renderer.render(scene, camera);
}
