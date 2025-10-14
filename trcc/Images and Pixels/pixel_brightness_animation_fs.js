// Full Screen, image can be cropped

let bg = 0;

let img;
let tilesX = 1, tilesY = 1;

let off; // offscreen buffer (max grid)

const FPS = 12;
const CYCLE_FRAMES = 50;
const EASE_POW = 1.2;
const MIN_TILES = 1;
const MAX_TILES = 250;

let phase = 0;

function preload() {
  img = loadImage('assets/image.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(FPS);
  pixelDensity(1);
  noStroke();

  off = createGraphics(MAX_TILES, MAX_TILES);
  off.pixelDensity(1);
  off.noSmooth();
}

function draw() {
  background(bg);

  // animate tile count
  phase += 1 / CYCLE_FRAMES;
  if (phase >= 1) phase -= 1;
  const eased = Math.pow(phase, EASE_POW);
  tilesX = Math.min(MAX_TILES, Math.max(MIN_TILES, Math.ceil(MIN_TILES + eased * (MAX_TILES - MIN_TILES))));
  tilesY = tilesX;

  // --- COVER FIT (fill canvas, crop overflow) ---
  const imgAspect = img.width / img.height;
  const canvasAspect = width / height;

  // scale so image covers the canvas
  let drawW, drawH;
  if (canvasAspect > imgAspect) {
    // canvas is wider -> match width, crop top/bottom
    drawW = width;
    drawH = width / imgAspect;
  } else {
    // canvas is taller -> match height, crop left/right
    drawH = height;
    drawW = height * imgAspect;
  }

  // centre the drawn area (can be larger than canvas)
  const offsetX = (width - drawW) / 2;
  const offsetY = (height - drawH) / 2;

  // tile sizes in the drawn area
  const tileW = drawW / tilesX;
  const tileH = drawH / tilesY;

  // downscale source into tilesX × tilesY to sample average colours
  off.clear();
  off.image(img, 0, 0, tilesX, tilesY);

  for (let x = 0; x < tilesX; x++) {
    for (let y = 0; y < tilesY; y++) {
      const c = off.get(x, y);
      const b = brightness(c);
      
      //fill(constrain(b * 2.5, 0, 255)); // grayscale + brightness boost
      fill(c); // original colour
      rect(offsetX + x * tileW, offsetY + y * tileH, tileW, tileH);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}