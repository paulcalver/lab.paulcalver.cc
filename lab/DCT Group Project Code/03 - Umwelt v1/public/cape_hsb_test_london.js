// --- London CAPE data (9 rows x 13 columns) ---
const capeGrid = [
  [1.375, 0.25, 1.25, 1.25, 1.25, 1.25, 3.25, 3.625, 4.625, 2.25, 1.375, 1.375, 0.0],
  [5.25, 2.125, 5.0, 5.375, 1.625, 1.375, 2.375, 2.0, 2.75, 6.125, 7.625, 7.375, 3.25],
  [7.875, 8.875, 6.0, 4.0, 3.875, 2.75, 1.0, 0.875, 2.0, 5.5, 9.5, 13.375, 5.375],
  [4.25, 3.625, 3.75, 3.0, 2.5, 1.375, 0.125, 0.125, 0.125, 0.25, 3.125, 5.75, 3.0],
  [3.125, 3.0, 2.5, 1.75, 0.75, 0.125, 0.625, 0.375, 0.375, 1.125, 8.5, 15.875, 7.75],
  [1.875, 2.25, 2.375, 1.5, 0.75, 0.375, 0.625, 0.75, 1.25, 1.875, 9.0, 16.875, 18.75],
  [1.75, 2.0, 1.625, 1.375, 0.5, 1.125, 1.25, 1.75, 1.875, 2.375, 7.0, 7.5, 8.625],
  [1.5, 2.125, 1.875, 1.25, 0.25, 1.0, 2.125, 2.125, 2.125, 2.75, 2.375, 0.625, 0.375],
  [1.25, 2.375, 2.75, 1.5, 0.375, 0.625, 1.875, 1.75, 2.125, 2.75, 2.375, 0.625, 0.375]
];

let ROWS, COLS;
const CAPE_MIN = 0;
const CAPE_MAX = 20; // your data goes up to ~18.75

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  ROWS = capeGrid.length;        // 9
  COLS = capeGrid[0].length;     // 13
}

function draw() {
  background(0);
  drawCapeFullScreen();
}

function drawCapeFullScreen() {
  const cellW = width / COLS;
  const cellH = height / ROWS;

  for (let y = 0; y < ROWS; y++) {
    const row = capeGrid[y];

    for (let x = 0; x < COLS; x++) {
      let v = row[x];

      if (v == null || isNaN(v)) v = 0;
      v = constrain(v, CAPE_MIN, CAPE_MAX);

      // Map CAPE to hue: low = blue, high = red
      const h = map(v, CAPE_MIN, CAPE_MAX, 220, 0);
      const c = color(h, 80, 100, 100);

      fill(c);
      rect(x * cellW, y * cellH, cellW + 1, cellH + 1); // +1 to avoid gaps
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}