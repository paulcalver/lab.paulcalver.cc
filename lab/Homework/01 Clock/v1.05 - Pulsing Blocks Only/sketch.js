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
let blockColorCurrent; // only for hour-row "current hour" pulsing column (computed each frame)

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_BASE_OPACITY = 0.25; // 0..1 floor when a new hour starts
const HOUR_MAX_OPACITY = 0.90; // 70%
const HOUR_FADE_OUT_HOURS = 10;
const HOUR_OVERLAP = 2; // px overlap
const HOUR_MARGIN_X = 80;
const HOUR_MARGIN_Y = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  // --- PALETTE (edit these) ---
  bgSyncCol  = color(225, 225, 225, 255); // on the beat
  bgColMain  = color(225, 225, 225, 255); // end of pulse over the second

  // Blocks
  blockColorA = color(224, 94, 40, 255); // birth colour (0s)
  blockColorB = color(49, 130, 153, 255); // colour after 1s and for the rest of life
}

function draw() {
  // time within the second + easing
  const ms = new Date().getMilliseconds();
  const t = ms / 1000;
  const eased = easeInOutSine(t);

  // ===== BACKGROUND =====
  const bgCol = lerpColor(bgSyncCol, bgColMain, eased);
  background(255); // opaque base
  noStroke();
  fill(red(bgCol), green(bgCol), blue(bgCol), alpha(bgCol));
  rectMode(CORNER);
  rect(0, 0, width, height);

  // ===== HOUR-ROW PULSING COLOUR (for current-hour column only) =====
  blockColorCurrent = lerpColor(blockColorA, blockColorB, eased);

  // spawn exactly on second tick
  const curSecond = second();
  if (curSecond !== lastSecond) {
    flip = !flip;
    //objects.push(new Block(width * 0.5, height * 0.5, flip));
    objects.push(new Block(width * 0.5, height * 0.5));
    lastSecond = curSecond;
  }

  // draw seconds blocks
  for (let i = objects.length - 1; i >= 0; i--) {
    const b = objects[i];
    b.update();
    b.display();
    if (b.isDead()) objects.splice(i, 1);
  }

  drawHourRow(eased);
}

// EASING
function easeOutSine(x) { return sin((x * PI) / 2); }
function easeInSine(x)  { return 1 - cos((x * PI) / 2); }
function easeInOutSine(x){ return -(cos(PI * x) - 1) / 2; }
function linear(x)      { return x; }
function easeOutQuad(x) { return 1 - (1 - x) * (1 - x); }

class Block {
  constructor(x, y, rotate90) {
    this.x = x + random(-(width * 0.1), width * 0.1);
    this.y = y + random(-(height * 0.1), height * 0);
    this.rotate90 = rotate90;
    this.rotationOffset = radians(random(-0.2, 0.2)); // ±0.2°
    this.birth = millis();
  }
  update() {}
  display() {
    const ageMs = millis() - this.birth;
    const ageSec = ageMs / 1000;

    // ---- COLOUR TIMELINE FOR SECOND BLOCKS ----
    // 0..1s: A -> B (eased), after 1s: stay B
    const u = constrain(ageSec, 0, 1);
    const c = lerpColor(blockColorA, blockColorB, easeInOutSine(u));

    // ---- ALPHA LIFESPAN FADE ----
    // Keep B's alpha as the base for the whole life (per your spec)
    const baseA = alpha(blockColorB);
    const a = map(ageMs, 0, lifespan, baseA, 0);

    fill(red(c), green(c), blue(c), a);
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
  isDead() { return millis() - this.birth > lifespan; }
}

function drawHourRow(eased) {
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

  const currentHourIdx = H; // pulse at the active hour

  const blockBaseAlpha = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let h = 0; h < HOUR_COUNT; h++) {
    const tRel = (curHours - h + 24) % 24;

    // Opacity schedule
    let opacityFactor = 0;
    if (tRel >= 0 && tRel < 1) {
      // fade up first hour
      opacityFactor = lerp(HOUR_BASE_OPACITY, HOUR_MAX_OPACITY, tRel);
    } else if (tRel >= 1 && tRel <= 1 + HOUR_FADE_OUT_HOURS) {
      const k = (tRel - 1) / HOUR_FADE_OUT_HOURS;
      opacityFactor = HOUR_MAX_OPACITY * (1 - k);
    } else {
      opacityFactor = 0;
    }

    // --- COLOUR LOGIC ---
    let col;
    if (h === currentHourIdx) {
      // current hour column pulses A→B each second
      col = blockColorCurrent;
    } else {
      // all other hour blocks stay static at blockColorB
      col = blockColorB;
    }

    const hourAlpha = blockBaseAlpha * opacityFactor;
    fill(red(col), green(col), blue(col), hourAlpha);

    const x = rowLeft + h * step;
    rect(x, yTop, colW, colH);
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}