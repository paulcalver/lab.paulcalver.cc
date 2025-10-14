let objects = [];
let lifespan = 5000; // 5 seconds
let flip = false;
let secBlockH, secBlockW;
let lastSecond = -1; // sync to second tick

// --- background colours (declare only; assign in setup) ---
let bgSyncCol;   // BG colour on the beat (new second)
let bgColMain;   // BG colour to ease toward over the second

// --- block colours (declare only; assign in setup) ---
let blockColorA;       // start colour of the block pulse
let blockColorB;       // end colour of the block pulse
let blockColorCurrent; // computed each frame via lerp

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_MAX_OPACITY = 0.70; // 70%
const HOUR_FADE_OUT_HOURS = 10;
const HOUR_OVERLAP = 2; // px overlap
const HOUR_MARGIN_X = 80;
const HOUR_MARGIN_Y = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  // --- PALETTE (edit these) ---
  // Background pulse
  bgSyncCol  = color(225, 225,  225, 255); // on the beat
  bgColMain  = color(68, 124, 121, 255); // fades toward this over the second

  // Blocks pulse (seconds + hour columns)
  blockColorA = color(217, 187, 143, 255); // start of block pulse
  blockColorB = color(141, 128, 88, 255); // end of block pulse
}

function draw() {
  // time within the second + easing
  const ms = new Date().getMilliseconds();
  const t = ms / 1000;
  const eased = easeInOutSine(t); // swap to easeOutSine / easeInOutSine as you like

  // ===== BACKGROUND =====
  // Lerp from on-beat colour -> main colour (includes alpha)
  const bgCol = lerpColor(bgSyncCol, bgColMain, eased);

  // OPAQUE base, then semi-transparent overlay so alpha is respected
  background(255); // solid base
  noStroke();
  fill(red(bgCol), green(bgCol), blue(bgCol), alpha(bgCol));
  rectMode(CORNER);
  rect(0, 0, width, height);

  // ===== BLOCK COLOUR (PULSE) =====
  // Lerp blocks between A -> B using same eased t
  blockColorCurrent = lerpColor(blockColorA, blockColorB, eased);
  // If you want the opposite direction, swap args:
  // blockColorCurrent = lerpColor(blockColorB, blockColorA, eased);

  // spawn exactly on second tick
  const curSecond = second();
  if (curSecond !== lastSecond) {
    flip = !flip;
    objects.push(new Block(width * 0.5, height * 0.5, flip));
    lastSecond = curSecond;
  }

  // draw blocks
  for (let i = objects.length - 1; i >= 0; i--) {
    const b = objects[i];
    b.update();
    b.display();
    if (b.isDead()) objects.splice(i, 1);
  }

  drawHourRow();
}

// EASE OUT (fast start → slow end)
function easeOutSine(x) {
  return sin((x * PI) / 2);
}
// EASE IN (slow start → fast end)
function easeInSine(x) {
  return 1 - cos((x * PI) / 2);
}
// EASE IN + OUT (slow start and slow end)
function easeInOutSine(x) {
  return -(cos(PI * x) - 1) / 2;
}
// LINEAR (no easing — steady)
function linear(x) {
  return x;
}
// EASE OUT QUAD (sharper drop-off)
function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

class Block {
  constructor(x, y, rotate90) {
    this.x = x + random(-(width * 0.1), width * 0.1);
    this.y = y + random(-(height * 0.1), height * 0.1);
    this.rotate90 = rotate90;
    this.rotationOffset = radians(random(-0.2, 0.2)); // ±0.2°
    this.birth = millis();
  }
  update() {}
  display() {
    const age = millis() - this.birth;

    // Fade alpha from current block colour alpha -> 0 over lifespan
    const baseA = alpha(blockColorCurrent);
    const a = map(age, 0, lifespan, baseA, 0);

    fill(red(blockColorCurrent), green(blockColorCurrent), blue(blockColorCurrent), a);
    noStroke();

    secBlockH = height * 0.5;
    secBlockW = secBlockH / 2.5;

    push();
    rectMode(CENTER);
    translate(this.x, this.y);
    rotate((this.rotate90 ? HALF_PI : 0) + this.rotationOffset);
    rect(0, 0, secBlockW, secBlockH);
    pop();
  }
  isDead() {
    return millis() - this.birth > lifespan;
  }
}

function drawHourRow() {
  const now = new Date();
  const H = hour(), M = minute(), S = second(), ms = now.getMilliseconds();
  const curHours = H + (M / 60) + (S / 3600) + (ms / 3600000);

  const rowLeft = HOUR_MARGIN_X;
  const rowRight = width - HOUR_MARGIN_X;
  const rowWidth = max(100, rowRight - rowLeft);

  const colW = (rowWidth + HOUR_OVERLAP * (HOUR_COUNT - 1)) / HOUR_COUNT;
  const colH = colW * 1.5;
  const step = colW - HOUR_OVERLAP;
  const yTop = height - HOUR_MARGIN_Y - colH;

  push();
  rectMode(CORNER);
  noStroke();

  for (let h = 0; h < HOUR_COUNT; h++) {
    const tRel = (curHours - h + 24) % 24;

    let opacityFactor = 0;
    if (tRel >= 23 && tRel < 24) {
      opacityFactor = (tRel - 23) * HOUR_MAX_OPACITY; // fade-in prev hour
    } else if (tRel >= 0 && tRel <= HOUR_FADE_OUT_HOURS) {
      opacityFactor = HOUR_MAX_OPACITY * (1 - (tRel / HOUR_FADE_OUT_HOURS)); // fade-out 10h
    }

    // Use the CURRENT pulsing block colour, scale its alpha by opacityFactor
    const baseA = alpha(blockColorCurrent);
    const a = baseA * opacityFactor;

    fill(red(blockColorCurrent), green(blockColorCurrent), blue(blockColorCurrent), a);

    const x = rowLeft + h * step;
    rect(x, yTop, colW, colH);
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}