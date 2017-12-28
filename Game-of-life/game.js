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
let patterns = [
  {
    name: 'Weekender',
    x: 16,
    y: 11,
    enc:
      'bo12bob$bo12bob$obo10bobo$bo12bob$bo12bob$2bo3b4o3bo2b$6b4o6b$2b4o4b4o2b2$4bo6bo4b$5b2o2b2o!'
  },
  {
    name: 'Pulsar',
    x: 13,
    y: 13,
    enc:
      '2b3o3b3o2b2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b2$2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo2$2b3o3b3o!'
  },
  {
    name: 'Gosper Glider Gun',
    x: 36,
    y: 9,
    enc:
      '24bo11b$22bobo11b$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o14b$2o8bo3bob2o4bobo11b$10bo5bo7bo11b$11bo3bo20b$12b2o!'
  },
  {
    name: 'P44 pi-heptomino hassler',
    x: 31,
    y: 44,
    enc:
      '9b2o4b2o4b2o8b$8bo2bobo4bobo2bo7b$8b3o10b3o7b$11b2o6b2o10b$10bo2b6o2bo9b$10b2o8b2o9b12$2o12b3o12b2o$2o11bo3bo11b2o$13b2ob2o13b5$13b2ob2o13b$2o11bo3bo11b2o$2o12b3o12b2o12$10b2o8b2o9b$10bo2b6o2bo9b$11b2o6b2o10b$8b3o10b3o7b$8bo2bobo4bobo2bo7b$9b2o4b2o4b2o!'
  },
  {
    name: 'P200 Traffic Jam',
    x: 77,
    y: 77,
    enc:
      '26b2o4b2o$26bobo2bobo$28b4o$26bo2b2o2bo$26bo2b2o2bo$28bo2bo18b2o4b2o$50bobo2bobo$35b3o14b4o$35b3obo10bo2b2o2bo$36bobobo9bo2b2o2bo$30b3o4bo' +
      '2bo11bo2bo$38b2o20bobo$14b2o12bo5bo24bo$13bo2bo11bo5bo25bo2bo$12bobobo11bo5bo20bo4bobobo$12bo2bo39bo5bo2bo$11bo18b3o22bo6b2o$12bobo3bo$18bo32b3o3b3o$5b2ob2o8bo$5bo49bo$6b2o2bo3b3o3b3o7bo24bo$7b3o20bo8bo15bo$7b3o8bo11bo8bo14bo$6b2o2bo7bo20bo14bo$5bo12bo7b3o3b3o19bo$5b2ob2o25b3o3b' +
      '3o28b2ob2o$30bo19b3o3b3o17bo$30bo8bo22b3o6bo2b2o$30bo8bo14bo17b3o$39bo14bo5bo5bo5b3o$25b3o26bo5bo5bo4bo2b2o$60bo5bo9bo$23bo5bo42b2ob2o$23bo5bo32b3o$23bo5bo$9b2o57b3o$8bo2bo13b3o38bob3o$7bobobo53bobobo$6b3obo38b3o13bo2bo$6b3o57b2o$47bo5bo$12b3o10bo21bo5bo$2ob2o20bo21bo5bo$o9bo' +
      '5bo8bo$b2o2bo4bo5bo32b3o$2b3o5bo5bo4b3o3b3o$2b3o28b3o10bo$b2o2bo6b3o10bo20bo$o24bo5bo5bo8bo$2ob2o20bo5bo5bo29b2ob2o$31bo5bo4b3o3b3o7bo12bo$58bo7bo2b2o$33b3o10bo11bo8b3o$21bo24bo20b3o$21bo24bo7b3o3b3o3bo2b2o$21bo49bo$58bo8b2ob2o$17b3o3b3o32bo$58bo3bobo$13b2o6bo43bo$12bo2bo5bo' +
      '39bo2bo$12bobobo4bo23bo14bobobo$13bo2bo28bo14bo2bo$17bo26bobo14b2o$14bobo20b2o$21bo2bo11bo2bo$19bo2b2o2bo9bobobo$19bo2b2o2bo10bob3o$21b4o14b3o$19bobo2bobo$19b2o4b2o18bo2bo$43bo2b2o2bo$43bo2b2o2bo$45b4o$43bobo2bobo$43b2o4b2o!'
  },
  {
    name: 'P48 Toad Hassler',
    x: 36,
    y: 54,
    enc:
      '3b2o9b2o2b2o9b2o5b$4bo9bo4bo9bo6b$3bo11bo2bo11bo5b$3b2o9b2o2b2o9b2o5b$4bo4bo4bo4bo4bo4bo6b$b3ob9ob4ob9ob3o3b$o2bo3bobobo3bo2bo3bobobo3bo2bo2b$2o30b2o2b$6b2o3b2o8b2o3b2o8b2$4b2ob2ob2ob2o4b2ob2ob2ob2o6b$3bo5bo5bo2bo5bo5bo5b$3b2obo5bob2o2b2obo5bob2o5b2$9bo14bo11b2$16b2o18b$10bo4bo2bo4bo12b$10bo5b2o5bo12b$9bobo10bobo11b$10bo12bo12b$10bo12bo12b$27b2o' +
      '7b$4b3o19bobo7b$4b3o19b2o8b$4b3o11bo13b3ob$b3o12bo2bo12b3ob$b3o12bo2bo12b3ob$b3o13bo11b3o4b$8b2o19b3o4b$7bobo19b3o4b$7b2o27b$12bo12bo10b$12bo12bo10b$11bobo10bobo9b$12bo5b2o5bo10b$12bo4bo2bo4bo10b$18b2o16b2$11bo14bo9b2$5b2obo5bob2o2b2obo5bob2o3b$5bo5bo5bo2bo5bo5bo3b$6b2ob2ob2ob2o4b2ob2ob2ob2o4b2$8b2o3b2o8b2o3b2o6b$2b2o30b2o$2bo2bo3bobobo3bo2bo3bobobo3bo2bo$3b3ob9ob4ob9ob3ob$6bo4bo4bo4bo4bo4bo4b$5b2o9b2o2b2o9b2o3b$5bo11bo2bo11bo3b$6bo9bo4bo9bo4b$5b2o9b2o2b2o9b2o!'
  }
];

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
  initPatternButtons();
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
}
function initPatternButtons() {
  let playBody = document.getElementById('playBody');
  for (let i = 0; i < patterns.length; i++) {
    let col = document.createElement('div');
    col.className = 'col l6';

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
    },
    {
      alive: color(240, 129, 15),
      death: color(6, 56, 82),
      stroke: color(1, 26, 39)
    },
    {
      alive: color(251, 101, 66),
      death: color(255, 187, 0),
      stroke: color(55, 94, 151)
    },
    {
      alive: color(25, 149, 173),
      death: color(241, 241, 242),
      stroke: color(161, 214, 226)
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
  // colorContainer.childNodes[colorId].classList.add('z-depth-1');
  colorId = id;
  // colorContainer.childNodes[colorId].classList.remove('z-depth-1');
  colorContainer.childNodes[colorId].classList.add('z-depth-3');
}
