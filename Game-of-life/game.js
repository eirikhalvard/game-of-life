let canvasWidth = 512;
let canvasHeight = 128;
let windowWidth = window.innerWidth / 2;
let windowHeight = window.innerHeight;
let resolution = 4;
let generation;
let fps = 30;
let canvas, scene, camera, renderer, texture, geometry, material, torus;

let genCount = 0;
let genCountDom;
let deathCount = 0;
let deathCountDom;
let deathPerGenDom;

let deathColor;
let aliveColor;

let id;

function set3D() {
  noLoop();
  canvasWidth -= canvasWidth % resolution;
  canvasHeight -= canvasHeight % resolution;
  let width = canvasWidth / resolution;
  let height = canvasHeight / resolution;

  createCanvas(canvasWidth, canvasHeight);
  canvas.style.display = 'none';

  generation = createGrid(width, height);
  randomizeGrid(generation);
  renderCanvas();
  init();
  animate();
}

function set2D() {
  cancelAnimationFrame(id);
  createCanvas(windowWidth, windowWidth);
  canvas.style.display = 'block';
  renderer.domElement.style.display = 'none';
  // canvasWidth -= canvasWidth % resolution;
  // canvasHeight -= canvasHeight % resolution;
  let width = floor(canvasWidth / resolution);
  let height = floor(canvasHeight / resolution);
  generation = createGrid(width, height);
  randomizeGrid(generation);
  renderCanvas();
  loop();
}

function draw() {
  frameRate(fps);
  advanceGeneration();
  updateStats();
}

function setup() {
  setColorScheme(0);
  genCountDom = document.getElementById('genCount');
  deathCountDom = document.getElementById('deathCount');
  deathPerGenDom = document.getElementById('deathPerGen');
  canvas = document.getElementById('defaultCanvas0');
  set3D();
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
        deathCount++;
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
        fill(aliveColor);
      } else {
        fill(deathColor);
      }
      rect(i * resolution, j * resolution, resolution, resolution);
    }
  }
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    windowWidth / windowHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(windowWidth, windowHeight);
  document.getElementById('canvasPlacement').appendChild(renderer.domElement);

  // adding torus
  texture = new THREE.Texture(canvas);
  geometry = new THREE.TorusGeometry(25, 10, 30, 30);
  material = new THREE.MeshBasicMaterial({ map: texture });
  torus = new THREE.Mesh(geometry, material);
  scene.add(torus);
  camera.position.z = 75;

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();
}

function animate() {
  setTimeout(function() {
    advanceGeneration();
    updateStats();
  }, 1000 / fps);
  id = requestAnimationFrame(animate);
  texture.needsUpdate = true;
  // torus.rotation.x += 0.01;
  // torus.rotation.y += 0.01;
  renderer.render(scene, camera);

  // genCount++;
}

function updateStats() {
  genCountDom.innerText = genCount++;
  deathCountDom.innerText = deathCount;
  deathPerGenDom.innerText = round(deathCount / genCount);
}

document.getElementById('fps-range').oninput = function() {
  fps = this.value;
};

document.getElementById('colorButton1').onchange = function() {
  setColorScheme(0);
};

document.getElementById('colorButton2').onchange = function() {
  setColorScheme(1);
};

document.getElementById('colorButton3').onchange = function() {
  setColorScheme(2);
};
document.getElementById('dimensionInput').onchange = function() {
  if (this.checked) {
    set3D();
  } else {
    set2D();
  }
};

function setColorScheme(schemeId) {
  switch (schemeId) {
    case 0:
      aliveColor = color(204, 24, 24);
      deathColor = color(21, 135, 10);
      break;
    case 1:
      aliveColor = color(71, 105, 209);
      deathColor = color(229, 143, 45);
      break;
    case 2: {
      aliveColor = color(40, 183, 104);
      deathColor = color(58, 93, 175);
      break;
    }
  }
}
