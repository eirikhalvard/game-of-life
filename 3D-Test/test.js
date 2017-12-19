let grid;

function setup() {
  createCanvas(500, 500, WEBGL);
  grid = createGrid(10, 10);
  randomizeGrid(grid);
}

function draw() {
  background(100);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  torus(100, 30, 20, 20);
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

class Square {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.nextValue = value;
  }
}
