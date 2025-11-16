let rows = 10;
let cols = 12;
let maxFlap = 90;
let flapOffset = maxFlap / cols;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CORNER);
  angleMode(DEGREES)
}

function draw() {
  background(220);

  let gridSize = height * 0.7;
  let padding = 30;
  let blockSize = (gridSize - ((rows-1)*padding)) / rows;
  let roundedBlockSize = Math.floor(blockSize);
  let spacing = roundedBlockSize + padding;
  

  // Centering - calculate total grid dimensions and center it
  let totalGridWidth = (cols - 1) * spacing + roundedBlockSize;
  let totalGridHeight = (rows - 1) * spacing + roundedBlockSize;
  let startX = (width - totalGridWidth) / 2;
  let startY = (height - totalGridHeight) / 2;


  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Calculate position of each grid cell
      let cellLeft = startX + j * spacing;
      let cellTop = startY + i * spacing;
  

      fill(0);
      push();
      translate(cellLeft, cellTop);
      rotate(-maxFlap + (j)*flapOffset);
      rect(0, 0, roundedBlockSize/8, roundedBlockSize);
      pop();


    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
