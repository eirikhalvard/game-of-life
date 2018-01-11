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
let fps, timeInterval, updateTime;
let canvas, scene, camera, renderer, texture, geometry, material, torus;
let genCount, deathCount, genCountDom, deathCountDom, deathPerGenDom;
let deathColor, aliveColor, strokeColor;
let generation;
let changeList;
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
  },
  {
    name: 'Big Glider',
    x: 18,
    y: 18,
    enc:
      '3b3o12b$3bo2b3o9b$4bobo11b$2o7bo8b$obo4bo2bo7b$o8b2o7b$b2o15b$bo2bo5bob2o4b$bo9b2obo3b$3bobo6b2o2bob$4b2obo4b2o3bo$8bo7bob$7b4o3bobob$7bob2o3b4o$8bo3b2obo2b$13b2o3b$9bob3o4b$10bo2bo!'
  },
  {
    name: '8-engine Cordership',
    x: 83,
    y: 83,
    enc:
      '46bo$41bo2bobo2bo3bo$41bo4b2ob5o$41bo3bo4bobo2$43b3o$44bo18b2o$63b2o6$51bo$50bobo18b2o$31bo18bo2bo17b2o$31bo19b2o$31bo$35bo11b2o$31b3o2bo10b2o$30bo4bo$30bo3bo$31b3o$40b2o$37b2ob2o$30bobo$30bobo30bobo6bobo$30bobo29bo9bobo$30bobo30bo2bo6bo$31b2o32b3o$20b2o3b4o$15b3obo2bo6bo$19bo2bo' +
      '2b5o$19bo2bo$21bo$18bobo33bo$19bo33bobo$24bo$24bo28bo2bo$55b2o$23b2o31bo$b3o19b2o2$5bo75bo$bo3b2o74b2o$3bobo47b2o27bo$3o52bo25bo$2bo15b2o33b2o$18b2o$b2o$2b2o10b2o$2bo10bo2bo$2b2o10bobo$b2o12bo20bobo6bobo$35bo9bobo22b2obo$36bo2bo6bo24b2o$38b3o6$27bo$6b2o18bobo$6b2o$26bo2bo$28b2o$29bo3$54bo$14b2o38b2o$14b2o10b2o27bo$28bo25bo$26b2o7$43b2obo$44b2o!'
  },
  {
    name: '92P33.1',
    x: 34,
    y: 30,
    enc:
      '21bo12b$4bo2bo3b5o2b3obo11b$4bo2bo7bo2bo2bo12b$bob2o2b5o3bo2bo15b$obo31b$bo32b7$6bobo3b4o18b$6bo2bo2bo2bo18b$6bo5b3o10b2o7b$7b2o10b3o5bo6b$18bo2bo2bo2bo6b$18b4o3bobo6b7$32bob$31bobo$15bo2bo3b5o2b2obob$12bo2bo2bo7bo2bo4b$11bob3o2b5o3bo2bo4b$12bo!'
  },
  {
    name: 'Light speed oscillator 3',
    x: 73,
    y: 73,
    enc:
      '61bo11b$59b3o11b$56bobo3b2o9b$54b3ob4o2bob2o5b$53bo7bob2obo6b$52bob5obo2bo2bo2bo3b$14b2o36b2o3bob2o2bobob3o3b$14b2o34b2o3bo8bobo6b$49bobob2obo8bo2b2o3b$14b4o3b2o26bo2bobobo5bo3b3obo2b$14bo3bo2bo28bobo2b2o4bobo6bo2b$17bobobo29bo2b2o6bo5b2ob2o$17b3obobo22b2o6b3o9b2obobob$19bob2obo' +
      '21bobo5b2o10bo2bobob$6b2ob2o7bo5bo23bo2b2o14bob2o2b$6b2obo7b2ob5ob2o17bo2b5o13b2o5b$9bo16b2o17b3o4bo7bob3o2bob2o2b$9bob2o2bo4bob3o5bo2bo2bo2bo2bo5bo2bo7b4o2bobobo3b$10bobob2o3bo5b23obo9b3ob2o2bobo3b$11b3o4bo6bo25bo12bobobo4b$15bobo4bo3bo2b3o2b3o2b3o2b5o2b2o3b3o3b2o2b2o5b$9b5ob' +
      'o6bo3b2o3b2o3b2o3b2o4bo4b2obob2o2bo2b2o7b$9bo3bobobo2b2o2b3o2b3o2b3o2b3o2b5o8bo4bo2bo7b$12bo2bobo6bo29bo2bo5b2o8b$13b3obo4b2ob23o2bobo2bob3o13b$18b2o2bobo2bo2bo2bo2bo2bo2bo2bo2bob3obobo3bo12b$15b2obob3obo23bobobobobo2b2o12b$15b2obo2bo2b2o21b2obobobob2o15b$18bo5bo23bobobobo18b$18bobobobo23bo5bo18b$17b2obobob2o21b2o2bo2b2o17b$18bob3obo23bob3obo18b$18bo2bo2bo23bobobobo18b$17b2o5b2o21b2obobob2o17b$18bobobobo23bo5bo18b$18bobobobo23bo2bo2bo18b$17b2ob3ob2o21b2ob3ob2o17b$18bo2bo2bo23bobobobo' +
      '18b$18bo5bo23bobobobo18b$17b2obobob2o21b2o5b2o17b$18bobobobo23bo2bo2bo18b$18bob3obo23bob3obo18b$17b2o2bo2b2o21b2obobob2o17b$18bo5bo23bobobobo18b$18bobobobo23bo5bo18b$15b2obobobob2o21b2o2bo2bob2o15b$12b2o2bobobobobo23bob3obob2o15b$12bo3bobob3obo2bo2bo2bo2bo2bo2bo2bo2bobo2b2o18b$13b3obo2bobo2b23ob2o4bob3o13b$8b2o5bo2bo29bo6bobo2bo12b$7bo2bo4bo8b5o2b3o2b3o2b3o2b3o2b2o2bobobo3bo9b$7b2o2bo2b2obob2o4bo4b2o3b2o3b2o3b2o3bo6bob5o9b$5b2o2b2o3b3o3b2o2b5o2b3o2b3o2b3o2bo3bo4bobo15b$4bobobo12bo' +
      '25bo6bo4b3o11b$3bobo2b2ob3o9bob23o5bo3b2obobo10b$3bobobo2b4o7bo2bo5bo2bo2bo2bo2bo5b3obo4bo2b2obo9b$2b2obo2b3obo7bo4b3o17b2o16bo9b$5b2o13b5o2bo17b2ob5ob2o7bob2o6b$2b2obo14b2o2bo23bo5bo7b2ob2o6b$bobo2bo10b2o5bobo21bob2obo19b$bobob2o9b3o6b2o22bobob3o17b$2ob2o5bo6b2o2bo29bobobo17b$2bo6bobo4b2o2bobo28bo2bo3bo14b$2bob3o3bo5bobobo2bo26b2o3b4o14b$3b2o2bo8bob2obobo49b$6bobo8bo3b2o34b2o14b$3b3obobo2b2obo3b2o36b2o14b$3bo2bo2bo2bob5obo52b$6bob2obo7bo53b$5b2obo2b4ob3o54b$9b2o3bobo56b$11b3o59b$11bo!'
  },
  {
    name: 'P124 lumps of muck hassler',
    x: 39,
    y: 38,
    enc:
      '20bo$14b2o3bobo3b2o$13bobo4bo4bobo$13bo13bo$10b2obo13bob2o$10b2obobob7obobob2o$13bobo9bobo$13bobo9bobo$14bo3bobobo3bo$32bo$32bobo$31bobo$33bo$3bo$3b3o$6bo30b2o$5b2o30b2o3$13b3o$11b2o2bo$2o9bo2b2o16b2o$2o9b3o18bo$17bo15b3o$16bobo16bo$5bo12b2o$5bobo$4bobo$6bo$12bo11bo$11bobo3b3o3bobo$11bob4o3b4obo$8b2obo13bob2o$8b2ob2o2b2o3b2o2b2ob2o$11bo13bo$11bobo4bo4bobo$12b2o3bobo3b2o$18bo!'
  },
  {
    name: '400P49',
    x: 65,
    y: 65,
    enc:
      '21b2o42b$20bo2bo41b$17bo3bobo41b$15b6obo42b$14bo5bo44b$14bob2obo2bo42b$15bo3bob2o42b$17bobo45b$16b2o3b2o42b$15bo2b2obo43b$13bo2bo3bo2bo9bo31b$13b2obo3bob2o7b3o31b$14bobob2obo8bo34b$14bob3o2bo8b2o33b$15bo3bob2o42b$16b4o2bo5bo36b$20bo6bobo35b$16b4o2bo5b2o2b2o31b$16bo2bob2o9b2o' +
      '31b$21bo43b$19bobo31b2o10b$19b2o6bo23b3o5b2o4b$25b2o23bo4bo2bo2bo3b$26b2o18b2obob4obo2bobo3b$10b2o5b2o28bobobo4b2obob2o2b$11bo5b2o28bobob2o2bo5bo3b$11bobo29b2ob2ob2obo2bob3obo3b$12b2o29bo4bo4b2o5b2obob$16b2o26b3o3b3o2b2obo3bobo$15bobo20b2o6b2ob2o2bo2bob2obo2bo$16bo20b2o14b2o7b2ob$39bo25b2$25bo39b$b2o7b2o14b2o20bo16b$o2bob2obo2bo2b2ob2o6b2o20bobo15b$obo3bob2o2b3o3b3o26b2o16b$bob2o5b2o4bo4bo29b2o12b$3bob3obo2bob2ob' +
      '2ob2o29bobo11b$3bo5bo2b2obobo28b2o5bo11b$2b2obob2o4bobobo28b2o5b2o10b$3bobo2bob4obob2o18b2o26b$3bo2bo2bo4bo23b2o25b$4b2o5b3o23bo6b2o19b$10b2o31bobo19b$43bo21b$31b2o9b2obo2bo16b$31b2o2b2o5bo2b4o16b$35bobo6bo20b$36bo5bo2b4o16b$42b2obo3bo15b$33b2o8bo2b3obo14b$34bo8bob2obobo14b$31b3o7b2obo3bob2o13b$31bo9bo2bo3bo2bo13b$43bob2o2bo15b$42b2o3b2o16b$45bobo17b$42b2obo3bo15b$42bo2bob2obo14b$44bo5bo14b$42bob6o15b$41bobo3bo17b$41bo2bo20b$42b2o!'
  },
  {
    name: 'slightly smaller pop-201 sawtooth',
    x: 55,
    y: 79,
    enc:
      '49b2o$49b2o2$23b2o5b2o$23b2o5b2o5$43bo5bo$42b3o3b3o$41b2obo3bob2o3$23bo7bo12bo3bo$22bo2bo3bo2bo11bo3bo$26bobo$26bobo$26bobo$22bo2bo3bo2bo$23b3o3b3o7$43bo$43bobo$43b2o$30b2o$30b2o2$10b2o$8b2ob2o8bobo$8bo2bo10b' +
      'o$8bo2bo$9b2o33b2obo3bob2o$32bo11bo2bo3bo2bo$9b2o20bo13b3o3b3o$8bo2bo19b3o$2o6bo2bo$2o6b2ob2o$10b2o9bobo$21b2o$22bo2$45b2o$45b2o2$20bo$20bobo$20b2o2$25b2o$25b2o$6b4o15b2o$4b2o4b2o13bo$4b2o5bo12bobo$6b2obobo12bob2o$11bo$7bo3bo$7bo4bo12b2o$9b3o3bo9b2o$9b2o4bo$15b2o$17bo$17b3o3$20bo$19bob5o$18b2o5bo$18b2o3bo2bo$26bo$20b2obo2bo$23bo2bo$24b2o$24b2o!'
  },
  {
    name: 'Pi portraitor',
    x: 24,
    y: 24,
    enc:
      '11b2o11b$6b2obo4bob2o6b$6bo10bo6b$7b2o6b2o7b$4b3o2b6o2b3o4b$4bo2bo8bo2bo4b$b2obobo10bobob2ob$bobobo12bobobob$3bo16bo3b$bo2bo14bo2bob$4bo7b3o4bo4b$o3bo7bobo4bo3bo$o3bo7bobo4bo3bo$4bo14bo4b$bo2bo14bo2bob$3bo16bo3b$bobobo12bobobob$b2obobo10bobob2ob$4bo2bo8bo2bo4b$4b3o2b6o2b3o4b$7b2o6b2o7b$6bo10bo6b$6b2obo4bob2o6b$11b2o!'
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
      advanceGeneration();
      updateStats();
      updateTime = millis();
    }
    id = requestAnimationFrame(animate);
    texture.needsUpdate = true;
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
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
function fillGrid(locations, start) {
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      generation[i][j].value = false;
    }
  }

  for (let i = 0; i < locations.length; i++) {
    if (verbos) {
      console.log(
        `-------\n  x: ${start.x + locations[i][0]}\n  y: ${start.y +
          locations[i][1]}`
      );
    }

    generation[start.x + locations[i][0]][start.y + locations[i][1]].value = 1;
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
    fill( changeList[i].value ? colors[colorId].alive : colors[colorId].death );
    rect(changeList[i].x * resolution, changeList[i].y * resolution, resolution, resolution);
  }
}
function renderCanvas() {
  stroke(colors[colorId].stroke);
  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[0].length; j++) {
      fill( generation[i][j].value ? colors[colorId].alive : colors[colorId].death );
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
function initColors() {
  colors = [
    {
      alive: color(244, 234, 222),
      death: color(41, 136, 188),
      stroke: color(47, 73, 110)
    },
    {
      alive: color(41, 136, 188),
      death: color(244, 234, 222),
      stroke: color(47, 73, 110)
    },
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
