let canvasWidth = 600;
let canvasHeight = 600;
let resolution = 30;
let grid;

function setup() {
  canvasWidth -= canvasWidth % resolution;
  canvasHeight -= canvasHeight % resolution;
  createCanvas(canvasWidth, canvasHeight);
  width = canvasWidth / resolution;
  height = canvasHeight / resolution;
  grid = createGrid(width, height);
  randomizeGrid(grid);
}

function draw() {
  background(200);

  // draw grid
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      fill(grid[i][j].value * 255);
      rect(i * resolution, j * resolution, resolution, resolution);
    }
  }
}

class Square {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
  }
}

function createGrid(width, height) {
  arr = new Array(width);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(height);
  }
  return arr;
}

function randomizeGrid(arr) {
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      arr[i][j] = new Square(i, j, floor(random(2)));
    }
  }
}
