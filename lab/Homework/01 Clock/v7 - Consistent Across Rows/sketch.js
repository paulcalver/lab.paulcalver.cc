let lifespan = 10000; // 5 seconds

// --- background colours ---
let bgSyncCol, bgColMain;

// --- block colours ---
let blockColorA, blockColorB, blockColorCurrent; // current used for pulsing hour/minute

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_OVERLAP = 0;
const HOUR_MARGIN_X = 0;   // horizontal margin kept
const HOUR_MARGIN_Y = 0;   // top/bottom outer margin kept
const HOUR_HISTORY_MIN_OPACITY = 0.00; // floor for earliest hours today
const HOUR_HISTORY_MAX_OPACITY = 0.7; // cap for recent past hours
const HOUR_BASE_OPACITY = 0.0;  // appears at H:00 with this opacity
const HOUR_MAX_OPACITY  = 0.70;  // peak opacity
//const HOUR_FADE_OUT_HOURS = 10;  // decay after first hour

// --- minute row config (same logic shape as hours) ---
const MINUTE_COUNT = 60;
const MINUTE_OVERLAP = 0;
const MINUTE_HISTORY_MIN_OPACITY = 0.00;
const MINUTE_HISTORY_MAX_OPACITY = 0.9;
const MINUTE_BASE_OPACITY = 0.0;     // fade up during the current minute
const MINUTE_MAX_OPACITY  = 0.9;

// --- second row config (same logic shape as hours) ---
const SECOND_COUNT = 60;
const SECOND_OVERLAP = 0;
const SECOND_HISTORY_MIN_OPACITY = 0.00;
const SECOND_HISTORY_MAX_OPACITY = 0.7;
const SECOND_BASE_OPACITY = 0.0;     // fade up during the current second
const SECOND_MAX_OPACITY  = 0.70;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  // --- PALETTE (edit these) ---
  bgSyncCol  = color(24, 65, 77, 255); // on the beat
  bgColMain  = color(24, 65, 77, 255); // end of pulse over the second

  // Blocks
  //blockColorA = color(49, 130, 153, 255); // birth colour (0s)
  blockColorA = color(224, 94, 40, 255); // birth colour (0s)
  blockColorB = color(49, 130, 153, 255); // colour after 1s and for the rest of life
}

function draw() {
  // time within the second + easing
  const now = new Date();
  const ms = now.getMilliseconds();
  const t = ms / 1000;
  const eased = easeInSine(t);

  // ===== BACKGROUND =====
  const bgCol = lerpColor(bgSyncCol, bgColMain, eased);
  background(255); // opaque base
  noStroke();
  fill(red(bgCol), green(bgCol), blue(bgCol), alpha(bgCol));
  rectMode(CORNER);
  rect(0, 0, width, height);

  // ===== Colour pulse for “current” columns (hours/minutes) =====
  blockColorCurrent = lerpColor(blockColorA, blockColorB, eased);

  // ===== Layout: split canvas height into thirds =====
  const availW = width - 2 * HOUR_MARGIN_X;
  const availH = height - 2 * HOUR_MARGIN_Y;
  const bandH  = availH / 3;

  // y positions (top of each band)
  const yTopHours   = HOUR_MARGIN_Y;
  const yTopMinutes = HOUR_MARGIN_Y + bandH;
  const yTopSeconds = HOUR_MARGIN_Y + bandH * 2;

  // draw rows
  drawMinuteRow(now, eased, HOUR_MARGIN_X, availW, bandH, yTopMinutes);
  drawHourRow(now,  eased, HOUR_MARGIN_X, availW, bandH, yTopHours);
  drawSecondRow(now,        HOUR_MARGIN_X, availW, bandH, yTopSeconds);
}

// ---------- EASING ----------
function easeOutSine(x){ return sin((x * PI) / 2); }
function easeInSine(x){ return 1 - cos((x * PI) / 2); }
function easeInOutSine(x){ return -(cos(PI * x) - 1) / 2; }
function linear(x){ return x; }
function easeOutQuad(x){ return 1 - (1 - x) * (1 - x); }

// ---------- HOURS (top third) ----------
function drawHourRow(now, eased, rowLeft, rowWidth, bandH, yTop) {
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
    const tRelToday = curHours - h; // how far into the current hour (0..1)
    let op = 0;

    if (h === currentHourIdx && tRelToday >= 0 && tRelToday < 1) {
      // pulse opacity only for the current hour
      const pulse = easeInOutSine((now.getSeconds() + now.getMilliseconds() / 1000) / 60);
      op = lerp(HOUR_BASE_OPACITY, HOUR_MAX_OPACITY, pulse);
    } else if (h < currentHourIdx) {
      const hoursAgo = currentHourIdx - h;
      const span = max(1, currentHourIdx);
      const w = constrain(1 - (hoursAgo - 1) / span, 0, 1);
      op = lerp(HOUR_HISTORY_MIN_OPACITY, HOUR_HISTORY_MAX_OPACITY, w);
    } else {
      op = 0;
    }

    fill(red(blockColorB), green(blockColorB), blue(blockColorB), baseA * op);
    const x = rowLeft + h * step;
    rect(x, yTop, colW, colH);
  }

  pop();
}
// ---------- MINUTES (middle third) ----------
function drawMinuteRow(now, eased, rowLeft, rowWidth, bandH, yTop) {
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curMinutes = M + (S / 60) + (ms / 60000);

  const colW = (rowWidth + MINUTE_OVERLAP * (MINUTE_COUNT - 1)) / MINUTE_COUNT;
  const step = colW - MINUTE_OVERLAP;
  const colH = bandH;

  const currentMinuteIdx = M;
  const baseA = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let m = 0; m < MINUTE_COUNT; m++) {
    const tRel = curMinutes - m; // minutes since start of this minute
    let op = 0;

    if (m === currentMinuteIdx && tRel >= 0 && tRel < 1) {
      // pulse opacity only for the current minute
      const pulse = easeInOutSine((now.getSeconds() + now.getMilliseconds() / 1000) / 60);
      op = lerp(MINUTE_BASE_OPACITY, MINUTE_MAX_OPACITY, pulse);
    } else if (m < currentMinuteIdx) {
      const minutesAgo = currentMinuteIdx - m;
      const span = max(1, currentMinuteIdx);
      const w = constrain(1 - (minutesAgo - 1) / span, 0, 1);
      op = lerp(MINUTE_HISTORY_MIN_OPACITY, MINUTE_HISTORY_MAX_OPACITY, w);
    } else {
      op = 0;
    }

    fill(red(blockColorB), green(blockColorB), blue(blockColorB), baseA * op);
    const x = rowLeft + m * step;
    rect(x, yTop, colW, colH);
  }

  pop();
}

// ---------- SECONDS (bottom third) ----------
function drawSecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  const S = second();
  const ms = now.getMilliseconds();
  const curSeconds = S + ms / 1000; // fractional seconds within current minute
  const t = ms / 1000; // 0–1 within the second
  const eased = easeInOutSine(t);

  const colW = (rowWidth + SECOND_OVERLAP * (SECOND_COUNT - 1)) / SECOND_COUNT;
  const step = colW - SECOND_OVERLAP;
  const colH = bandH;

  const currentSecondIdx = S;
  const baseA = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let s = 0; s < SECOND_COUNT; s++) {
    const tRel = curSeconds - s; // time since this second started (0..1 for active)
    let op = 0;
    let col = blockColorB;

    if (s === currentSecondIdx) {
      // current second pulses from blockColorA → blockColorB
      col = lerpColor(blockColorA, blockColorB, eased);
      op = map(eased, 0, 1, 1.0, SECOND_MAX_OPACITY); // full flash at start
    } else if (s < currentSecondIdx) {
      // past seconds within current minute
      const secondsAgo = currentSecondIdx - s;
      const span = max(1, currentSecondIdx);
      const w = constrain(1 - (secondsAgo - 1) / span, 0, 1);
      op = lerp(SECOND_HISTORY_MIN_OPACITY, SECOND_HISTORY_MAX_OPACITY, w);
    } else {
      op = 0;
    }

    fill(red(col), green(col), blue(col), baseA * op);
    const x = rowLeft + s * step;
    rect(x, yTop, colW, colH);
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}