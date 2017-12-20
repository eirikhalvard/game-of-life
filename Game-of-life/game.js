const canvasWidth = 512;
const canvasHeight = 128;
let resolution = 4;
let fps = 30;
let canvas, scene, camera, renderer, texture, geometry, material, torus;
let genCount, deathCount, genCountDom, deathCountDom, deathPerGenDom;
let deathColor, aliveColor;
let generation;
let id;
let is3D;

// SETUP
function setup() {
  addEventHandlers();
  setColorScheme(0);
  resetStats();
  noLoop();
  is3D = true;

  let width = floor(canvasWidth / resolution);
  let height = floor(canvasHeight / resolution);
  createCanvas(width * resolution, height * resolution);

  canvas = document.getElementById('defaultCanvas0');
  canvas.style.display = 'none';
  document.getElementById('canvasPlacement').appendChild(canvas);

  generation = createGrid(width, height);
  randomizeGrid();
  renderCanvas();

  init();
  animate();
}
function addEventHandlers() {
  genCountDom = document.getElementById('genCount');
  deathCountDom = document.getElementById('deathCount');
  deathPerGenDom = document.getElementById('deathPerGen');
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
  document.getElementById('higherResolution').onclick = function() {
    if (
      document.getElementById('lowerResolution').classList.contains('disabled')
    ) {
      document.getElementById('lowerResolution').classList.remove('disabled');
    }
    resolution /= 2;
    if (is3D) {
      set3D();
    } else {
      set2D();
    }

    if (resolution == 2) {
      this.classList.add('disabled');
    }
  };
  document.getElementById('lowerResolution').onclick = function() {
    if (
      document.getElementById('higherResolution').classList.contains('disabled')
    ) {
      document.getElementById('higherResolution').classList.remove('disabled');
    }
    resolution *= 2;
    if (is3D) {
      set3D();
    } else {
      set2D();
    }

    if (resolution > 100) {
      this.classList.add('disabled');
    }
  };

  document.getElementById('randomize').onclick = function() {
    resetStats();
    randomizeGrid();
  };
}
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / 2 / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth / 2, window.innerHeight);
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

// LOOPS
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
}
function draw() {
  frameRate(fps);
  advanceGeneration();
  updateStats();
}

// SWITCHING BETWEEN 2D AND 3D
function set3D() {
  noLoop();
  resetStats();
  is3D = true;

  let width = floor(canvasWidth / resolution);
  let height = floor(canvasHeight / resolution);
  resizeCanvas(width * resolution, height * resolution);
  canvas.style.display = 'none';
  renderer.domElement.style.display = 'block';

  generation = createGrid(width, height);
  randomizeGrid();
  renderCanvas();

  animate();
}
function set2D() {
  cancelAnimationFrame(id);
  resetStats();
  is3D = false;

  let width = floor(window.innerWidth / 2 / resolution);
  let height = floor(window.innerHeight / resolution);

  resizeCanvas(width * resolution, height * resolution);
  canvas.style.display = 'block';
  renderer.domElement.style.display = 'none';

  generation = createGrid(width, height);
  randomizeGrid();
  renderCanvas();

  loop();
}

// CREATING A NEW GAME
class Square {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.nextValue = value;
  }
}
function createGrid(width, height) {
  let arr = new Array(width);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(height);
  }
  return arr;
}
function randomizeGrid() {
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      generation[i][j] = new Square(i, j, floor(random(2)));
    }
  }
}

// ADVANCE TO NEXT GENERATION
function advanceGeneration() {
  createNextGeneration(generation);
  renderCanvas();
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
function renderCanvas() {
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      fill(generation[i][j].value ? aliveColor : deathColor);
      rect(i * resolution, j * resolution, resolution, resolution);
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

// MANAGING STATS
function updateStats() {
  genCountDom.innerText = genCount++;
  deathCountDom.innerText = deathCount;
  deathPerGenDom.innerText = round(deathCount / genCount);
}
function resetStats() {
  genCount = 0;
  deathCount = 0;
}

// UPDATING COLOR
function setColorScheme(schemeId) {
  switch (schemeId) {
    case 0:
      aliveColor = color(204, 24, 24);
      deathColor = color(21, 135, 10);
      break;
    case 1:
      aliveColor = color(229, 143, 45);
      deathColor = color(71, 105, 209);
      break;
    case 2: {
      aliveColor = color(40, 183, 104);
      deathColor = color(58, 93, 175);
      break;
    }
  }
}
