let bgColor;
let blockColor;

// --- timing ---
let phase = 0;          // 0..1 within current beat
let count = 1;          // how many circles shown (1..60)

// --- grid settings ---
const MAX_BEATS = 60;   // always 60 beats
const COLS = 10;        // manual control
const ROWS = 6;         // manual control

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();
}

function draw() {
  // --- Colour ---
  const mainHue = map(mouseX, 0, width, 20, 80);
  const oppositeHue = map(mainHue, 0, 20, 80,20);
  bgColor    = color(mainHue, 30, 100, 1);
  blockColor = color(oppositeHue, 40, 100, 0.7);
  background(bgColor);

  // --- MouseY -> speed (higher = faster) ---
  let speed = map(mouseY, height, 0, 0.003, 0.05);
  speed = constrain(speed, 0.002, 0.2);

  // --- Advance phase; add one circle per beat; cycle 1..60 (no empty beat) ---
  phase += speed;
  const wraps = floor(phase);
  if (wraps >= 1) {
    // cycle count through 1..60 inclusive
    count = ((count - 1 + wraps) % MAX_BEATS) + 1;
    phase -= wraps; // keep phase in [0,1)
  }

  // --- Grid layout ---
  const cols = COLS;
  const rows = ROWS;
  const cellW = width / cols;
  const cellH = height / rows;
  const maxSize = min(cellW, cellH) * 1; // padding inside each cell

  // All visible circles pulse together each beat
  const t = phase; // ease-in cubic
  const size = lerp(10, maxSize, t);

  fill(blockColor);

  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = floor(i / cols);
    const x = (c + 0.5) * cellW;
    const y = (r + 0.5) * cellH;
    circle(x, y, size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}