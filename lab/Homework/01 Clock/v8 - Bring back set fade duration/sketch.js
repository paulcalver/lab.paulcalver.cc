// --- background colour ---
let bgColor;

// --- block colours ---
let blockColorA, blockColorB; // A for current second flash, B for steady states

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_OVERLAP = 2;
const HOUR_MARGIN_X = 0;
const HOUR_MARGIN_Y = 0;
const HOUR_HISTORY_MIN_OPACITY = 0.00;
const HOUR_HISTORY_MAX_OPACITY = 0.7;
const HOUR_BASE_OPACITY = 0.0;
const HOUR_MAX_OPACITY  = 0.70;

// --- minute row config ---
const MINUTE_COUNT = 60;
const MINUTE_OVERLAP = 0;
const MINUTE_BASE_OPACITY = 0.0;  // fades up during the active minute
const MINUTE_MAX_OPACITY  = 0.70;
const MINUTE_TRAIL_UNITS  = 10;   // trailing duration in minutes

// --- second row config ---
const SECOND_COUNT = 60;
const SECOND_OVERLAP = 0;
const SECOND_MAX_OPACITY = 0.70;
const SECOND_TRAIL_UNITS = 10;    // trailing duration in seconds

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  // --- SINGLE BACKGROUND COLOUR ---
  bgColor = color(240, 240, 240);

  // --- BLOCK COLOURS ---
  blockColorA = color(0, 0, 0, 255);   // second flash
  blockColorB = color(226, 229, 0, 255);   // steady tone

  // Example alternative palette:
  // bgColor = color(24, 65, 77);
  // blockColorA = color(224, 94, 40);
  // blockColorB = color(49, 130, 153);
}

function draw() {
  background(bgColor);
  noStroke();

  // layout thirds
  const availW = width - 2 * HOUR_MARGIN_X;
  const availH = height - 2 * HOUR_MARGIN_Y;
  const bandH  = availH / 3;

  const yTopHours   = HOUR_MARGIN_Y;
  const yTopMinutes = HOUR_MARGIN_Y + bandH;
  const yTopSeconds = HOUR_MARGIN_Y + bandH * 2;

  const now = new Date();
  drawMinuteRow(now, HOUR_MARGIN_X, availW, bandH, yTopMinutes);
  drawHourRow(now,   HOUR_MARGIN_X, availW, bandH, yTopHours);
  drawSecondRow(now, HOUR_MARGIN_X, availW, bandH, yTopSeconds);
}

// ---------- easing ----------
function easeInSine(x){ return 1 - cos((x * PI) / 2); }
function easeOutSine(x){ return sin((x * PI) / 2); }
function easeInOutSine(x){ return -(cos(PI * x) - 1) / 2; }

// ---------- HOURS (top third) ----------
function drawHourRow(now, rowLeft, rowWidth, bandH, yTop) {
  const H = hour();
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curHours = H + (M / 60) + (S / 3600) + (ms / 3600000);

  const colW = (rowWidth + HOUR_OVERLAP * (HOUR_COUNT - 1)) / HOUR_COUNT;
  const step = colW - HOUR_OVERLAP;
  const colH = bandH;

  const currentHourIdx = H;
  const baseA = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let h = 0; h < HOUR_COUNT; h++) {
    const tRelToday = curHours - h; // negative for future hours
    let op = 0;

    if (h === currentHourIdx && tRelToday >= 0 && tRelToday < 1) {
      op = lerp(HOUR_BASE_OPACITY, HOUR_MAX_OPACITY, tRelToday);
    } else if (h < currentHourIdx) {
      const hoursAgo = currentHourIdx - h;
      const span = max(1, currentHourIdx);
      const w = constrain(1 - (hoursAgo - 1) / span, 0, 1);
      op = lerp(HOUR_HISTORY_MIN_OPACITY, HOUR_HISTORY_MAX_OPACITY, w);
    } else {
      op = 0;
    }

    fill(red(blockColorB), green(blockColorB), blue(blockColorB), baseA * op);
    rect(rowLeft + h * step, yTop, colW, colH);
  }

  pop();
}

// ---------- MINUTES (middle third) ----------
function drawMinuteRow(now, rowLeft, rowWidth, bandH, yTop) {
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curMinutes = M + (S / 60) + (ms / 60000);

  const colW = (rowWidth + MINUTE_OVERLAP * (MINUTE_COUNT - 1)) / MINUTE_COUNT;
  const step = colW - MINUTE_OVERLAP;
  const colH = bandH;
  const baseA = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let m = 0; m < MINUTE_COUNT; m++) {
    let op = 0;

    if (m === M) {
      const tRel = constrain(curMinutes - m, 0, 1);
      op = lerp(MINUTE_BASE_OPACITY, MINUTE_MAX_OPACITY, tRel);
    } else if (m < M) {
      const tRel = curMinutes - m;
      const ageAfterFinish = max(0, tRel - 1);
      if (ageAfterFinish <= MINUTE_TRAIL_UNITS) {
        const k = constrain(ageAfterFinish / MINUTE_TRAIL_UNITS, 0, 1);
        const w = easeOutSine(1 - k);
        op = MINUTE_MAX_OPACITY * w;
      }
    }

    fill(red(blockColorB), green(blockColorB), blue(blockColorB), baseA * op);
    rect(rowLeft + m * step, yTop, colW, colH);
  }

  pop();
}

// ---------- SECONDS (bottom third) ----------
function drawSecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  const S = second();
  const ms = now.getMilliseconds();
  const curSec = S + ms / 1000;

  const colW = (rowWidth + SECOND_OVERLAP * (SECOND_COUNT - 1)) / SECOND_COUNT;
  const step = colW - SECOND_OVERLAP;
  const colH = bandH;
  const baseA = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let s = 0; s < SECOND_COUNT; s++) {
    let op = 0;
    let col = blockColorB;

    if (s === S) {
      const eased = easeInOutSine(curSec - s);
      col = lerpColor(blockColorA, blockColorB, eased);
      op = SECOND_MAX_OPACITY;
    } else if (s < S) {
      const tRel = curSec - s;
      const ageAfterFinish = max(0, tRel - 1);
      if (ageAfterFinish <= SECOND_TRAIL_UNITS) {
        const k = constrain(ageAfterFinish / SECOND_TRAIL_UNITS, 0, 1);
        const w = easeOutSine(1 - k);
        op = SECOND_MAX_OPACITY * w;
      }
    }

    fill(red(col), green(col), blue(col), baseA * op);
    rect(rowLeft + s * step, yTop, colW, colH);
  }

  pop();
}

// ---------- RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------- FULLSCREEN TOGGLE ----------
// function mousePressed() {
//   let fs = fullscreen();
//   fullscreen(!fs);
// }