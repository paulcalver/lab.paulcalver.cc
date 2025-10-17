let img;
let rows = 60;
let cols = 60;
let off;

let imageFront = false;

function preload() {
  img = loadImage('assets/atacama.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  img.resize(cols, rows);
  noStroke();
  //pixelDensity(1);
  rectMode(CENTER);
  off = createGraphics(cols, rows);
  //off.pixelDensity(1);
  off.noSmooth();

}

function draw() {

  // Alpha pulse every second
  let t = millis() / 1000;                
  let s = (sin(TWO_PI * t) + 1) * 0.5;     
  let alpha = lerp(150, 255, s);

  background(0);

  let gridSize = height * 0.8;
  let blockSize = round(gridSize / rows); // rounded to make sure each block is sharp
  let padding = 0;
  let spacing = blockSize + padding;

  // Centering 
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;

  off.clear();
  off.image(img, 0, 0, cols, rows);

  // Image
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;

      // Image Fill
      const c = off.get(j, i);
      const b = brightness(c);
      //fill(constrain(b * 2.5, 0, 255)); // grayscale + brightness boost
      fill(c); // original colour

      rect(bx, by, blockSize, blockSize);
    }
  }

  // Noise
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;

      // Colour with hue noise
      let t = frameCount * 0.01;
      let r = noise(i * 0.05, j * 0.05, t) * 255;
      let g = noise(i * 0.05 + 100, j * 0.05 + 100, t) * 255;
      let b = noise(i * 0.05 + 200, j * 0.05 + 200, t) * 255;
      fill(r, g, b, alpha);

      rect(bx, by, blockSize, blockSize);
    }
  }

}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
