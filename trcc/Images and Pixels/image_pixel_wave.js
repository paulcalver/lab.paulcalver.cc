
let img;
let tilesX = 120;
let tilesY = tilesX;

let fg, bg;

function preload() {
  img = loadImage('assets/Blood_Sweat_Tears_Adam_B0004364_WEB.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  img.resize(tilesX, tilesY);
  fg = color("#000000");
  bg = color("#f1f1f1");
}

function draw() {
  background("#000000ff");

  let tileW = width / tilesX;
  let tileH = height / tilesY;
  fill(0);
  noStroke();

  push();

  for (let x = 0; x < tilesX; x++) {
    for (let y = 0; y < tilesY; y++) {
      let waveX = map(
        sin(radians(frameCount + x * 1 + y * 3)), -1, 1, -20, 20);
      let waveY = map(
        sin(radians(frameCount + x * 2 + y * 1)), -1, 1, -20, 20);

      let c = img.get(x,y);
      let b = brightness(c);

      fill(b * 2.5);

      push();
      translate(x * tileW + waveX, y * tileH + waveY);
      rect(0, 0, tileW, tileH);
      pop();
    }
  }

  pop();
}
