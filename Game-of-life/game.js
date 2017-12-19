let canvasWidth = 600;
let canvasHeight = 600;
let resolution = 6;
let generation;

function setup() {
  canvasWidth -= canvasWidth % resolution;
  canvasHeight -= canvasHeight % resolution;
  createCanvas(canvasWidth, canvasHeight);
  let width = canvasWidth / resolution;
  let height = canvasHeight / resolution;
  generation = createGrid(width, height);
  randomizeGrid(generation);

  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      fill(generation[i][j].value * 255);
      rect(i * resolution, j * resolution, resolution, resolution);
    }
  }
}

function draw() {
  advanceGeneration();
}

function mouseClicked() {
  randomizeGrid(generation);
}

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

  for (let i = 0; i < generation.length; i++) {
    for (let j = 0; j < generation[i].length; j++) {
      fill(generation[i][j].value * 255);
      rect(i * resolution, j * resolution, resolution, resolution);
    }
  }
}
