const verbos = true;
const canvasWidth = 1024;
const canvasHeight = 256;
let resolution = 16;
let resolution2D, resolution3D;
let width, height, numCells;
const maxCells = 5000;
const minCells = 64;
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
  setResolution();
  resolution = resolution3D;
  setSize3D();
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
    if (numCells > maxCells) {
      document.getElementById('higherResolution').classList.add('disabled');
      document.getElementById('lowerResolution').classList.remove('disabled');
    } else if (numCells < minCells) {
      document.getElementById('higherResolution').classList.remove('disabled');
      document.getElementById('lowerResolution').classList.add('disabled');
    } else {
      document.getElementById('higherResolution').classList.remove('disabled');
      document.getElementById('lowerResolution').classList.remove('disabled');
    }
  };

  document.getElementById('higherResolution').onclick = function() {
    document.getElementById('lowerResolution').classList.remove('disabled');
    if (is3D) {
      resolution3D /= 2;
      set3D();
    } else {
      resolution2D /= 2;
      set2D();
    }

    if (numCells > maxCells) {
      this.classList.add('disabled');
    }
  };
  document.getElementById('lowerResolution').onclick = function() {
    document.getElementById('higherResolution').classList.remove('disabled');
    if (is3D) {
      resolution3D *= 2;
      set3D();
    } else {
      resolution2D *= 2;
      set2D();
    }

    if (numCells < minCells) {
      this.classList.add('disabled');
    }
  };

  document.getElementById('randomize').onclick = function() {
    resetStats();
    randomizeGrid();
  };
}
function setResolution() {
  resolution3D = resolution;
  resolution2D = resolution;

  let min = 500;
  let max = 2000;
  setSize2D();

  while (numCells < min) {
    resolution2D *= 2;
    setSize2D();
  }

  while (numCells > max) {
    resolution2D /= 2;
    setSize2D();
  }
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
  if (is3D) {
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
  resolution = resolution3D;
  setSize3D();
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
  resolution = resolution2D;
  setSize2D();
  resizeCanvas(width * resolution, height * resolution);
  canvas.style.display = 'block';
  renderer.domElement.style.display = 'none';

  generation = createGrid(width, height);
  randomizeGrid();
  renderCanvas();

  loop();
}
function setSize2D() {
  width = floor(window.innerWidth / 2 / resolution);
  height = floor(window.innerHeight / resolution);
  numCells = width * height;
  if (verbos) {
    console.log(
      `2D-sizes:\n  canvasWidth: ${window.innerWidth /
        2}\n  canvasHeight: ${window.innerHeight}\n  width: ${width}\n  height: ${height}\n  area: ${window.innerWidth /
        2 *
        window.innerHeight}\n  Cells: ${width *
        height}\n  Resolution: ${resolution}`
    );
  }
}
function setSize3D() {
  width = floor(canvasWidth / resolution);
  height = floor(canvasHeight / resolution);
  numCells = width * height;

  if (verbos) {
    console.log(
      `3D-sizes:\n  canvasWidth: ${canvasWidth}\n  canvasHeight: ${canvasHeight}\n  width: ${width}\n  height: ${height}\n  area: ${canvasWidth *
        canvasHeight}\n  Cells: ${width * height}\n  Resolution: ${resolution}`
    );
  }
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
