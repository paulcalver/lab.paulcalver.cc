// --- background colour ---
let bgColor;
// --- block colour ---
let blockColor;

// --- phase-driven sweep (mouseY controls speed) ---
let phase = 0; // 0..1 looping

// --- millisecond row config (repurposed) ---
const MILLI_COUNT       = 1000;   // number of columns
const MILLI_OVERLAP     = 0;      // set >0 to overlap columns
const MILLI_MAX_OPACITY = 0.70;   // peak opacity of active column
const MILLI_TRAIL_UNITS = 360;    // how many columns fade behind the active one

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();
}

function draw() {
  // Colour:
  // Sat + Brightness fixed, Hue variable and opposite
  let mainHue = map(mouseX, 0, width, 0, 300);
  let oppositeHue = map(mainHue, 0, 300, 300, 0);

  bgColor = color(mainHue, 30, 100, 1);
  blockColor = color(oppositeHue, 40, 100, 1); // slight sat diff so it never disappears

  background(bgColor);

  // Map mouseY to speed (higher = faster)
  // Tweak these min/max speeds to taste
  let speed = map(mouseY, height * 0.85, height * 0.15, 0.003, 0.05);
  speed = constrain(speed, 0.002, 0.2);

  // Advance the phase (0..1), wrap smoothly
  phase += speed;
  if (phase > 1) phase -= 1;

  // Drive the row using phase instead of real milliseconds
  const curFloat = phase * MILLI_COUNT; // 0..MILLI_COUNT
  drawMillisecondRowPhase(curFloat, 0, width, height, 0);
}

// ---------- easing ----------
function easeOutSine(x) { return sin((x * PI) / 2); }

// ---------- PHASE-DRIVEN "MILLISECOND" ROW ----------
function drawMillisecondRowPhase(curFloat, rowLeft, rowWidth, bandH, yTop) {
  const activeIdx = floor(curFloat);

  const colW = (rowWidth + MILLI_OVERLAP * (MILLI_COUNT - 1)) / MILLI_COUNT;
  const step = colW - MILLI_OVERLAP;
  const colH = bandH;

  push();
  rectMode(CORNER);

  const h = hue(blockColor);
  const s = saturation(blockColor);
  const b = brightness(blockColor);

  for (let i = 0; i < MILLI_COUNT; i++) {
    let op = 0;

    if (i === activeIdx) {
      // fade in across the active column as phase progresses through it
      const tRel = constrain(curFloat - i, 0, 1);
      op = lerp(0, MILLI_MAX_OPACITY, tRel);
    } else {
      // trail behind the active column with a smooth fade
      const cycDist = (curFloat - i + MILLI_COUNT) % MILLI_COUNT; // distance forward from i to current
      const ageAfterFinish = max(0, cycDist - 1); // >0 once we moved past that column
      if (ageAfterFinish > 0 && ageAfterFinish <= MILLI_TRAIL_UNITS) {
        const k = constrain(ageAfterFinish / MILLI_TRAIL_UNITS, 0, 1);
        const w = easeOutSine(1 - k);
        op = MILLI_MAX_OPACITY * w;
      }
    }

    if (op > 0) {
      fill(h, s, b, op);
      rect(rowLeft + i * step, yTop, colW, colH);
    }
  }

  pop();
}

// ---------- RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}