const verbos = false;
const canvasWidth = 1024;
const canvasHeight = 256;
const smallScreen = 600;
const cameraZoom = 80;
let resolution = 8;
let winWidth, winHeight, width, height, numCells;
let resolution2D, resolution3D;
const maxCells = 100000;
const minCells = 64;
const resolutionMultiplier2D = 1.3;
let fps, timeInterval, updateTime, rotationSpeed;
let canvas, scene, camera, renderer, texture, geometry, material, torus;
let genCount, deathCount, genCountDom, deathCountDom, deathPerGenDom;
let deathColor, aliveColor, strokeColor;
let generation;
let changeList;
let id;
let is3D;
let calculationsPerFrame;

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

  $('.scrollable').css('height', winHeight - 20);
  addEventHandlers();
  initColors();
  makeColorSection();
  initPatternButtons();
  colorId = 0;
  setColor(0);
  resetStats();
  noLoop();
  is3D = true;
  fps = document.getElementById('fps-range').value;
  calculationsPerFrame = document.getElementById('calc-range').value;
  rotationSpeed = document.getElementById('rotation-input').value;
  timeInterval = 1000 / fps;
  updateTime = 0;

  setResolution();
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

  document.getElementById('calc-range').oninput = function() {
    calculationsPerFrame = this.value;
  };

  document.getElementById('rotation-input').oninput = function() {
    rotationSpeed = this.value * 1.3;
  };

  document.getElementById('dimensionInput').onchange = function() {
    if (this.checked) {
      set3D();
      animate();
    } else {
      set2D();
    }
    if (numCells > maxCells || resolution == 2) {
      console.log(resolution);
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

    if (numCells > maxCells || resolution == 2) {
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
  setSize2D();
}
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    cameraZoom,
    winWidth / winHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(winWidth, winHeight);
  document.getElementById('canvasPlacement').appendChild(renderer.domElement);

  // adding torus
  texture = new THREE.Texture(canvas);
  geometry = new THREE.TorusGeometry(25, 10, 30, 30);
  material = new THREE.MeshBasicMaterial({ map: texture });
  torus = new THREE.Mesh(geometry, material);
  scene.add(torus);
  camera.position.z = cameraZoom * 500 / winWidth;

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();
}

// LOOPS
function animate() {
  if (is3D) {
    if (updateTime + timeInterval < millis()) {
      for (let i = 0; i < calculationsPerFrame; i++) {
        advanceGeneration();
        updateStats();
      }
      updateTime = millis();
    }
    id = requestAnimationFrame(animate);
    texture.needsUpdate = true;
    torus.rotation.x += 0.0002 * rotationSpeed;
    torus.rotation.y += 0.0002 * rotationSpeed;
    renderer.render(scene, camera);
  }
}
function draw() {
  if (updateTime + timeInterval < millis()) {
    for (let i = 0; i < calculationsPerFrame; i++) {
      advanceGeneration();
      updateStats();
    }
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
  setDisabledButtons();
}
function setSize3D() {
  width = floor(canvasWidth / resolution);
  height = floor(canvasHeight / resolution);
  numCells = width * height;
  setDisabledButtons();
}

// CREATING A NEW GAME
class Square {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
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
      generation[i][j] = new Square(i, j, Math.random() >= 0.5);
    }
  }
}
function findStartLocation(patternWidth, patternHeight) {
  let startX = floor((width - patternWidth) / 2);
  let startY = floor((height - patternHeight) / 2);
  return { x: startX, y: startY };
}
function resetGrid() {
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      generation[i][j].value = false;
    }
  }
}
function fillGrid(locations, start) {
  resetGrid();

  for (let i = 0; i < locations.length; i++) {
    let x = start.x + locations[i][0];
    let y = start.y + locations[i][1];
    generation[x][y].value = 1;
  }
}
function runLengthDecoder(rle) {
  let x = 0;
  let y = 0;
  let locations = [];
  let s = 0;
  for (let i = 0; i < rle.length - 1; i++) {
    let char = rle[i];

    if (char == '$') {
      y++;
      x = 0;
    } else if (char == 'b') {
      x++;
    } else if (char == 'o') {
      locations.push([x, y]);
      x++;
    } else {
      s = i;
      i++;
      while (rle[i] != 'b' && rle[i] != 'o' && rle[i] != '$') {
        i++;
      }
      let num = parseInt(rle.substring(s, i));

      if (rle[i] == 'b') {
        x += num;
      } else if (rle[i] == 'o') {
        for (let j = 0; j < num; j++) {
          locations.push([x, y]);
          x++;
        }
      } else {
        y += num;
        x = 0;
      }
    }
  }
  return locations;
}
function makePattern(pattern) {
  let start = findStartLocation(pattern.x, pattern.y);
  let locations = runLengthDecoder(pattern.enc);
  fillGrid(locations, start);
  renderCanvas();
}
function initPatternButtons() {
  let playBody = document.getElementById('playBody');
  for (let i = 0; i < patterns.length; i++) {
    let col = document.createElement('div');
    col.className = 'col s12 m12 l6';

    let button = document.createElement('a');
    button.className = 'waves-effect waves-light btn truncate btn-wrap';
    button.innerText = patterns[i].name;
    button.title = patterns[i].name;
    button.onclick = function() {
      makePattern(patterns[i]);
    };

    playBody.appendChild(col);
    col.appendChild(button);
  }
}
function setDisabledButtons() {
  let colList = document.getElementById('playBody').childNodes;
  for (let i = 0; i < colList.length; i++) {
    let btn = colList[i].firstChild;
    if (patterns[i].x + 1 > width || patterns[i].y + 1 > height) {
      if (!btn.classList.contains('disabled')) {
        btn.classList.add('disabled');
      }
    } else {
      if (btn.classList.contains('disabled')) {
        btn.classList.remove('disabled');
      }
    }
  }
}

// ADVANCE TO NEXT GENERATION
function advanceGeneration() {
  createNextGeneration(generation);
  renderNextGen();
}
function createNextGeneration(gen) {
  // check changes and fill changeList with squares.
  changeList = [];
  for (let i = 0; i < gen.length; i++) {
    for (let j = 0; j < gen[i].length; j++) {
      let neighbours = countNeighbours(gen, i, j);
      if (gen[i][j].value && (neighbours < 2 || neighbours > 3)) {
        changeList.push(gen[i][j]);
        deathCount++;
      } else if (!gen[i][j].value && neighbours == 3) {
        changeList.push(gen[i][j]);
      }
    }
  }

  // toggle the value of the changeList squares
  for (let i = 0; i < changeList.length; i++) {
    changeList[i].value = !changeList[i].value;
  }
}
function renderNextGen() {
  stroke(colors[colorId].stroke);
  for (let i = 0; i < changeList.length; i++) {
    fill(changeList[i].value ? colors[colorId].alive : colors[colorId].death);
    rect(
      changeList[i].x * resolution,
      changeList[i].y * resolution,
      resolution,
      resolution
    );
  }
}
function renderCanvas() {
  stroke(colors[colorId].stroke);
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[0].length; j++) {
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
      if (arr[xValue][yValue].value) count++;
    }
  }
  if (arr[x][y].value) count--;
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

  $('.scrollable').css('height', winHeight - 20);

  camera = new THREE.PerspectiveCamera(
    cameraZoom,
    winWidth / winHeight,
    0.1,
    1000
  );
  renderer.setSize(winWidth, winHeight);
  camera.position.z = cameraZoom * 500 / winWidth;
  let controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();
  if (!is3D) {
    setSize2D();
    resizeCanvas(width * resolution, height * resolution);
    generation = createGrid(width, height);
    randomizeGrid();
    renderCanvas();
  }
}

function makeColorSection() {
  for (let i = 0; i < colors.length; i++) {
    let box = document.createElement('div');
    box.classList.add('color-box');
    box.classList.add('z-depth-1');
    box.onclick = function() {
      setColor(i);
      renderCanvas();
    };
    box.style.border = `2px solid rgb(${colors[i].stroke.levels[0]}, ${
      colors[i].stroke.levels[1]
    }, ${colors[i].stroke.levels[2]})`;

    let alive = document.createElement('div');
    alive.classList.add('color-part');
    alive.style.backgroundColor = `rgb(${colors[i].alive.levels[0]}, ${
      colors[i].alive.levels[1]
    }, ${colors[i].alive.levels[2]})`;
    box.appendChild(alive);

    let death = document.createElement('div');
    death.classList.add('color-part');
    death.style.backgroundColor = `rgb(${colors[i].death.levels[0]}, ${
      colors[i].death.levels[1]
    }, ${colors[i].death.levels[2]})`;
    box.appendChild(death);

    colorContainer.appendChild(box);
  }
}
function setColor(id) {
  colorContainer.childNodes[colorId].classList.remove('z-depth-3');
  // colorContainer.childNodes[colorId].classList.add('z-depth-1');
  colorId = id;
  // colorContainer.childNodes[colorId].classList.remove('z-depth-1');
  colorContainer.childNodes[colorId].classList.add('z-depth-3');
}

function keyPressed() {
  if (key === 'R') {
    resetStats();
    randomizeGrid();
  } else {
    console.log(key);
  }
}
