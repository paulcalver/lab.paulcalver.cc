// --- background colour ---
let bgColor;

// --- block colours ---
let blockColorA, blockColorB; // A for current second flash, B for steady states

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_OVERLAP = 2;
const HOUR_HISTORY_MIN_OPACITY = 0.00;
const HOUR_HISTORY_MAX_OPACITY = 0.7;
const HOUR_BASE_OPACITY = 0.0;
const HOUR_MAX_OPACITY  = 0.70;

// --- minute row config ---
const MINUTE_COUNT = 60;
const MINUTE_OVERLAP = 1;
const MINUTE_BASE_OPACITY = 0.0;  // fades up during the active minute
const MINUTE_MAX_OPACITY  = 0.70;
const MINUTE_TRAIL_UNITS  = 15;   // trailing duration in minutes

// --- second row config ---
const SECOND_COUNT = 60;
const SECOND_OVERLAP = 1;
const SECOND_MAX_OPACITY = 0.70;
const SECOND_TRAIL_UNITS = 15;    // trailing duration in seconds

// --- millisecond row config ---
const MILLI_COUNT        = 1000;
const MILLI_OVERLAP      = 1;
const MILLI_MAX_OPACITY  = 0.70;
const MILLI_TRAIL_UNITS  = 180;   // trailing duration in blocks

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();

  // --- COLOURS (HSB mode) ---
  bgColor     = color(55, 10, 95);   // pale neutral background
  blockColorA = color(0, 0, 0);      // black (pulse)
  blockColorB = color(61, 100, 90);   // yellow-gold steady tone
}

function draw() {
  background(bgColor);
  noStroke();

  // layout quarters (no margins)
  const availW = width;
  const availH = height;
  const bandH  = availH / 4;

  const yTopHours   = 0;
  const yTopMinutes = bandH;
  const yTopSeconds = bandH * 2;
  const yTopMillis  = bandH * 3;

  const now = new Date();
  drawHourRow(now, 0, availW, bandH, yTopHours);
  drawMinuteRow(now, 0, availW, bandH, yTopMinutes);
  drawSecondRow(now, 0, availW, bandH, yTopSeconds);
  drawMillisecondRow(now, 0, availW, bandH, yTopMillis);
}

// ---------- easing ----------
function easeOutSine(x){ return sin((x * PI) / 2); }
function easeInOutSine(x){ return -(cos(PI * x) - 1) / 2; }

// ---------- HOURS ----------
function drawHourRow(now, rowLeft, rowWidth, bandH, yTop) {
  const H = hour();
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curHours = H + (M / 60) + (S / 3600) + (ms / 3600000);

  const colW = (rowWidth + HOUR_OVERLAP * (HOUR_COUNT - 1)) / HOUR_COUNT;
  const step = colW - HOUR_OVERLAP;
  const colH = bandH;

  push();
  rectMode(CORNER);

  for (let h = 0; h < HOUR_COUNT; h++) {
    const tRelToday = curHours - h;
    let op = 0;

    if (h === H && tRelToday >= 0 && tRelToday < 1) {
      op = lerp(HOUR_BASE_OPACITY, HOUR_MAX_OPACITY, tRelToday);
    } else if (h < H) {
      const hoursAgo = H - h;
      const span = max(1, H);
      const w = constrain(1 - (hoursAgo - 1) / span, 0, 1);
      op = lerp(HOUR_HISTORY_MIN_OPACITY, HOUR_HISTORY_MAX_OPACITY, w);
    }

    fill(hue(blockColorB), saturation(blockColorB), brightness(blockColorB), op);
    rect(rowLeft + h * step, yTop, colW, colH);
  }

  pop();
}

// ---------- MINUTES ----------
function drawMinuteRow(now, rowLeft, rowWidth, bandH, yTop) {
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curMinutes = M + (S / 60) + (ms / 60000);

  const colW = (rowWidth + MINUTE_OVERLAP * (MINUTE_COUNT - 1)) / MINUTE_COUNT;
  const step = colW - MINUTE_OVERLAP;
  const colH = bandH;

  push();
  rectMode(CORNER);

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

    fill(hue(blockColorB), saturation(blockColorB), brightness(blockColorB), op);
    rect(rowLeft + m * step, yTop, colW, colH);
  }

  pop();
}

// ---------- SECONDS (pulsing) ----------
function drawSecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  const S = second();
  const ms = now.getMilliseconds();
  const curSec = S + ms / 1000;

  const colW = (rowWidth + SECOND_OVERLAP * (SECOND_COUNT - 1)) / SECOND_COUNT;
  const step = colW - SECOND_OVERLAP;
  const colH = bandH;

  push();
  rectMode(CORNER);

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

    fill(col);
    drawingContext.globalAlpha = op;
    rect(rowLeft + s * step, yTop, colW, colH);
    drawingContext.globalAlpha = 1;
  }

  pop();
}

// ---------- MILLISECONDS (continuous sweep, no reset) ----------
function drawMillisecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  const ms = now.getMilliseconds(); // 0..999
  const curFloat = (ms / 1000) * MILLI_COUNT; // 0..MILLI_COUNT
  const activeIdx = floor(curFloat);

  const colW = (rowWidth + MILLI_OVERLAP * (MILLI_COUNT - 1)) / MILLI_COUNT;
  const step = colW - MILLI_OVERLAP;
  const colH = bandH;

  push();
  rectMode(CORNER);

  for (let i = 0; i < MILLI_COUNT; i++) {
    let op = 0;

    if (i === activeIdx) {
      const tRel = constrain(curFloat - i, 0, 1);
      op = lerp(0, MILLI_MAX_OPACITY, tRel);
    } else {
      const cycDist = (curFloat - i + MILLI_COUNT) % MILLI_COUNT;
      const ageAfterFinish = max(0, cycDist - 1);
      if (ageAfterFinish > 0 && ageAfterFinish <= MILLI_TRAIL_UNITS) {
        const k = constrain(ageAfterFinish / MILLI_TRAIL_UNITS, 0, 1);
        const w = easeOutSine(1 - k);
        op = MILLI_MAX_OPACITY * w;
      }
    }

    if (op > 0) {
      fill(hue(blockColorB), saturation(blockColorB), brightness(blockColorB), op);
      rect(rowLeft + i * step, yTop, colW, colH);
    }
  }

  pop();
}

// ---------- RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}