function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100);
  fill(0);
}

function draw() {
  background(0,0,0);

  let gridSize = height * 0.7;
  let rows = 240;
  let cols = 360;
  let pixelSize = round(gridSize / rows); // rounded to make sure each block is sharp
  let padding = 1;
  let spacing = pixelSize+padding;

  // Centering 
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;
      
      // Colour with hue noise
      let t = frameCount * 0.05;
      let h = noise(i * 0.05, j * 0.05, t) * 360;
      let s = 100;
      let b = 100;

      fill(h, s, b);

      rect(bx, by, pixelSize, pixelSize);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
