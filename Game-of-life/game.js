const verbos = true;
const canvasWidth = 1024;
const canvasHeight = 256;
const smallScreen = 600;
let resolution = 16;
let winWidth, winHeight, width, height, numCells;
let resolution2D, resolution3D;
const maxCells = 5000;
const minCells = 64;
const resolutionMultiplier2D = 1.4;
let fps, timeInterval, updateTime;
let canvas, scene, camera, renderer, texture, geometry, material, torus;
let genCount, deathCount, genCountDom, deathCountDom, deathPerGenDom;
let deathColor, aliveColor, strokeColor;
let generation;
let id;
let is3D;

let colorContainer;
let colors;
let colorId;

// SETUP
function setup() {
  winWidth =
    window.innerWidth > smallScreen ? window.innerWidth / 2 : window.innerWidth;
  winHeight =
    window.innerWidth > smallScreen
      ? window.innerHeight
      : window.innerHeight / 2;

  addEventHandlers();
  initColors();
  makeColorSection();
  colorId = 0;
  setColor(0);
  resetStats();
  noLoop();
  is3D = true;
  fps = document.getElementById('fps-range').value;
  timeInterval = 1000 / fps;
  updateTime = 0;

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
  colorContainer = document.getElementById('colorContainer');

  window.onresize = function() {
    setNewSize();
  };

  document.getElementById('fps-range').oninput = function() {
    fps = this.value;
    timeInterval = 1000 / fps;
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
      resolution2D = round(resolution2D / resolutionMultiplier2D);
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
      resolution2D = round(resolution2D * resolutionMultiplier2D);
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
  camera = new THREE.PerspectiveCamera(75, winWidth / winHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(winWidth, winHeight);
  document.getElementById('canvasPlacement').appendChild(renderer.domElement);

  // adding torus
  texture = new THREE.Texture(canvas);
  geometry = new THREE.TorusGeometry(25, 10, 30, 30);
  material = new THREE.MeshBasicMaterial({ map: texture });
  torus = new THREE.Mesh(geometry, material);
  scene.add(torus);
  camera.position.z = 75 * 500 / winWidth;

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();
}

// LOOPS
function animate() {
  if (is3D) {
    if (updateTime + timeInterval < millis()) {
      advanceGeneration();
      updateStats();
      updateTime = millis();
    }
    id = requestAnimationFrame(animate);
    texture.needsUpdate = true;
    // torus.rotation.x += 0.01;
    // torus.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
}
function draw() {
  if (updateTime + timeInterval < millis()) {
    advanceGeneration();
    updateStats();
    updateTime = millis();
  }
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
  width = floor(winWidth / resolution);
  height = floor(winHeight / resolution);
  numCells = width * height;
  if (verbos) {
    console.log(
      `2D-sizes:\n  canvasWidth: ${winWidth}\n  canvasHeight: ${winHeight}\n  width: ${width}\n  height: ${height}\n  area: ${winWidth *
        winHeight}\n  Cells: ${width * height}\n  Resolution: ${resolution}`
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
function gospelGliderGun() {}
function pulsar() {
  const patternWidth = 15;
  const patternHeight = 15;
  let start = findStartLocation(patternWidth, patternHeight);
  const locations = [
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 9],
    [1, 10],
    [1, 11],
    [3, 1],
    [3, 6],
    [3, 8],
    [3, 13],
    [4, 1],
    [4, 6],
    [4, 8],
    [4, 13],
    [5, 1],
    [5, 6],
    [5, 8],
    [5, 13],
    [6, 3],
    [6, 4],
    [6, 5],
    [6, 9],
    [6, 10],
    [6, 11],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 9],
    [8, 10],
    [8, 11],
    [9, 1],
    [9, 6],
    [9, 8],
    [9, 13],
    [10, 1],
    [10, 6],
    [10, 8],
    [10, 13],
    [11, 1],
    [11, 6],
    [11, 8],
    [11, 13],
    [13, 3],
    [13, 4],
    [13, 5],
    [13, 9],
    [13, 10],
    [13, 11]
  ];
  fillGrid(locations, start);
}
function findStartLocation(patternWidth, patternHeight) {
  let startX = floor((width - patternWidth) / 2);
  let startY = floor((height - patternHeight) / 2);
  return { x: startX, y: startY };
}
function fillGrid(locations, start) {
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      generation[i][j].value = 0;
      generation[i][j].nextValue = 0;
    }
  }

  for (let i = 0; i < locations.length; i++) {
    console.log(
      `-------\n  x: ${start.x + locations[i][0]}\n  y: ${start.y +
        locations[i][1]}`
    );

    generation[start.x + locations[i][0]][start.y + locations[i][1]].value = 1;
    generation[start.x + locations[i][0]][
      start.y + locations[i][1]
    ].nextValue = 1;
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
  stroke(colors[colorId].stroke);
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      fill(
        generation[i][j].value ? colors[colorId].alive : colors[colorId].death
      );
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

function setNewSize() {
  winWidth =
    window.innerWidth > smallScreen ? window.innerWidth / 2 : window.innerWidth;
  winHeight =
    window.innerWidth > smallScreen
      ? window.innerHeight
      : window.innerHeight / 2;

  if (is3D) {
    camera = new THREE.PerspectiveCamera(75, winWidth / winHeight, 0.1, 1000);
    renderer.setSize(winWidth, winHeight);
    camera.position.z = 75 * 500 / winWidth;
    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();
  } else {
    setSize2D();
    resizeCanvas(width * resolution, height * resolution);
    generation = createGrid(width, height);
    randomizeGrid();
    renderCanvas();
  }
}
function initColors() {
  colors = [
    {
      alive: color(21, 135, 10),
      death: color(204, 24, 24),
      stroke: color(50, 50, 50)
    },
    {
      alive: color(229, 143, 45),
      death: color(71, 105, 209),
      stroke: color(0, 0, 150)
    },
    {
      alive: color(40, 183, 104),
      death: color(58, 93, 175),
      stroke: color(0, 0, 150)
    }
  ];
}
function makeColorSection() {
  for (let i = 0; i < colors.length; i++) {
    let box = document.createElement('div');
    box.classList.add('color-box');
    box.classList.add('z-depth-1');
    box.onclick = function() {
      setColor(i);
    };
    box.style.border = `2px solid rgb(${colors[i].stroke.levels[0]}, ${colors[i]
      .stroke.levels[1]}, ${colors[i].stroke.levels[2]})`;

    let alive = document.createElement('div');
    alive.classList.add('color-part');
    alive.style.backgroundColor = `rgb(${colors[i].alive.levels[0]}, ${colors[i]
      .alive.levels[1]}, ${colors[i].alive.levels[2]})`;
    box.appendChild(alive);

    let death = document.createElement('div');
    death.classList.add('color-part');
    death.style.backgroundColor = `rgb(${colors[i].death.levels[0]}, ${colors[i]
      .death.levels[1]}, ${colors[i].death.levels[2]})`;
    box.appendChild(death);

    colorContainer.appendChild(box);
  }
}
function setColor(id) {
  colorContainer.childNodes[colorId].classList.remove('z-depth-3');
  colorContainer.childNodes[colorId].classList.add('z-depth-1');
  colorId = id;
  colorContainer.childNodes[colorId].classList.remove('z-depth-1');
  colorContainer.childNodes[colorId].classList.add('z-depth-3');
}
