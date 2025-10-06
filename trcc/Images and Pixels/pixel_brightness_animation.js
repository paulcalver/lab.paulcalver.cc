// No Cropping, full image always visible with border and padding

let bg = 0;
let borderCol = 0;    // Border colour (black)
let padding = 200;     // Padding around image in pixels (adjust as needed)

let img;
let tilesX = 1, tilesY = 1;
let off; // offscreen buffer (max grid)

const FPS = 12;
const CYCLE_FRAMES = 50;  // 12s per cycle
const EASE_POW = 1.2;     // cubic ease-in
const MIN_TILES = 1;
const MAX_TILES = 90;

let phase = 0;            // 0..1 progress through the cycle

function preload() {
  img = loadImage('assets/Blood_Sweat_Tears_Adam_B0004364_WEB.jpg');
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
  background(borderCol); // Draw border first

  // available draw area (minus padding on all sides)
  const drawAreaW = width - padding * 2;
  const drawAreaH = height - padding * 2;

  // advance phase smoothly; wrap to 0 when reaching 1
  phase += 1 / CYCLE_FRAMES;
  if (phase >= 1) phase -= 1;

  // ease-in curve (accelerates toward the end)
  const eased = Math.pow(phase, EASE_POW);

  // map to tile count
  tilesX = Math.min(MAX_TILES, Math.max(MIN_TILES, Math.ceil(MIN_TILES + eased * (MAX_TILES - MIN_TILES))));
  tilesY = tilesX;

  // maintain aspect ratio
  const imgAspect = img.width / img.height;
  const areaAspect = drawAreaW / drawAreaH;

  let drawW, drawH;
  if (areaAspect > imgAspect) {
    // fit by height
    drawH = drawAreaH;
    drawW = drawAreaH * imgAspect;
  } else {
    // fit by width
    drawW = drawAreaW;
    drawH = drawAreaW / imgAspect;
  }

  // position image centred within padded area
  const offsetX = (width - drawW) / 2;
  const offsetY = (height - drawH) / 2;

  const tileW = drawW / tilesX;
  const tileH = drawH / tilesY;

  // downscale source into tilesX × tilesY (each pixel = averaged tile colour)
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