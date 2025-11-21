let capeGrid;
let capeImage; // Graphics buffer for CAPE data
const COLS = 1440;
const ROWS = 721;

// Choose a CAPE range to map to the hue spectrum.
// You can tweak this once you see real data.
const CAPE_MIN = 0;
const CAPE_MAX = 2000; // values above this get clamped

function preload() {
  // JSON is assumed to be a 2D array: [rows][cols]
  capeGrid = loadJSON('assets/cape-global-1440x721-real.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  // Create graphics buffer at original data resolution
  capeImage = createGraphics(COLS, ROWS);
  capeImage.colorMode(HSB, 360, 100, 100, 100);
  capeImage.pixelDensity(1);
  capeImage.noStroke();

  drawCapeBackground();
  noLoop();
}

function draw() {
  // background already drawn in drawCapeBackground()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawCapeBackground();
}

function drawCapeBackground() {
  // Draw to the graphics buffer at native resolution
  capeImage.loadPixels();

  for (let y = 0; y < ROWS; y++) {
    const row = capeGrid[y]; // one row of 1440 values

    for (let x = 0; x < COLS; x++) {
      let v = row[x];

      // Handle missing / undefined values
      if (v == null || isNaN(v)) v = 0;

      // Clamp CAPE to range
      v = constrain(v, CAPE_MIN, CAPE_MAX);

      // Map CAPE to hue:
      // low CAPE → cool colours, high CAPE → warm
      // e.g. 0 J/kg = 220° (blue), 2000 J/kg = 0° (red)
      let h = map(v, CAPE_MIN, CAPE_MAX, 20, 45);

      // Fix saturation/brightness; tweak to taste
      let c = color(h, 80, 100, 100);

      // Write into pixels[] of the graphics buffer
      const idx = 4 * (y * COLS + x);
      capeImage.pixels[idx]     = red(c);
      capeImage.pixels[idx + 1] = green(c);
      capeImage.pixels[idx + 2] = blue(c);
      capeImage.pixels[idx + 3] = 255; // alpha
    }
  }

  capeImage.updatePixels();

  // Scale and draw the image to fill the canvas
  image(capeImage, 0, 0, width, height);
}