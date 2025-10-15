// --- background + block colours ---
let bgColor;
let blockColor; // single colour for all blocks

// --- shared opacity settings ---
const OPACITY_BASE = 0.0;
const OPACITY_MAX  = 0.70;

// --- hour history caps (to keep full-day history visible) ---
const HISTORY_MIN  = 0.00;
const HISTORY_MAX  = 0.70;

// --- hour row config ---
const HOUR_COUNT   = 24;
const HOUR_OVERLAP = 0;

// --- minute row config ---
const MINUTE_COUNT       = 60;
const MINUTE_OVERLAP     = 0;
const MINUTE_TRAIL_UNITS = 10; // minutes

// --- second row config ---
const SECOND_COUNT       = 60;
const SECOND_OVERLAP     = 0;
const SECOND_TRAIL_UNITS = 10; // seconds

// --- millisecond row config (sweeps once per second) ---
const MILLISECOND_COUNT       = 1000; // number of blocks across the width per second
const MILLISECOND_OVERLAP     = 0;
const MILLISECOND_TRAIL_UNITS = 360;  // trailing duration in blocks

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CORNER);
  noStroke();

  // colours
  bgColor    = color(240, 240, 240);
  blockColor = color(226, 229, 0, 255);

  // Example alt palette:
  // bgColor    = color(24, 65, 77);
  // blockColor = color(49, 130, 153);
}

function draw() {
  background(bgColor);

  const now = new Date();
  const w = width;
  const h = height;

  // base three rows
  drawHourRow(now, 0, w, h);
  drawMinuteRow(now, 0, w, h);
  drawSecondRow(now, 0, w, h);

  // millisecond sweep on top
  drawMillisecondRow(now, 0, w, h);
}

// ---------- easing ----------
function easeOutSine(x){ return sin((x * PI) / 2); }

// ---------- HOURS (full height) ----------
function drawHourRow(now, x, w, h) {
  const H = hour();
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curHours = H + M / 60 + S / 3600 + ms / 3600000;

  const colW = (w + HOUR_OVERLAP * (HOUR_COUNT - 1)) / HOUR_COUNT;
  const step = colW - HOUR_OVERLAP;

  const baseA = alpha(blockColor);

  for (let i = 0; i < HOUR_COUNT; i++) {
    let op = 0;

    if (i === H) {
      const tRel = constrain(curHours - i, 0, 1);
      op = lerp(OPACITY_BASE, OPACITY_MAX, tRel);
    } else if (i < H) {
      const hoursAgo = H - i;
      const span = max(1, H);
      const wgt = constrain(1 - (hoursAgo - 1) / span, 0, 1);
      op = lerp(HISTORY_MIN, HISTORY_MAX, wgt);
    }

    if (op > 0) {
      fill(red(blockColor), green(blockColor), blue(blockColor), baseA * op);
      rect(x + i * step, 0, colW, h);
    }
  }
}

// ---------- MINUTES (full height) ----------
function drawMinuteRow(now, x, w, h) {
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curMinutes = M + S / 60 + ms / 60000;

  const colW = (w + MINUTE_OVERLAP * (MINUTE_COUNT - 1)) / MINUTE_COUNT;
  const step = colW - MINUTE_OVERLAP;

  const baseA = alpha(blockColor);

  for (let i = 0; i < MINUTE_COUNT; i++) {
    let op = 0;

    if (i === M) {
      const tRel = constrain(curMinutes - i, 0, 1);
      op = lerp(OPACITY_BASE, OPACITY_MAX, tRel);
    } else if (i < M) {
      const age = max(0, (curMinutes - i) - 1);
      if (age <= MINUTE_TRAIL_UNITS) {
        const k = constrain(age / MINUTE_TRAIL_UNITS, 0, 1);
        op = OPACITY_MAX * easeOutSine(1 - k);
      }
    }

    if (op > 0) {
      fill(red(blockColor), green(blockColor), blue(blockColor), baseA * op);
      rect(x + i * step, 0, colW, h);
    }
  }
}

// ---------- SECONDS (full height, mirrors minutes) ----------
function drawSecondRow(now, x, w, h) {
  const S  = second();
  const ms = now.getMilliseconds();
  const curSec = S + ms / 1000;

  const colW = (w + SECOND_OVERLAP * (SECOND_COUNT - 1)) / SECOND_COUNT;
  const step = colW - SECOND_OVERLAP;

  const baseA = alpha(blockColor);

  for (let i = 0; i < SECOND_COUNT; i++) {
    let op = 0;

    if (i === S) {
      const tRel = constrain(curSec - i, 0, 1);
      op = lerp(OPACITY_BASE, OPACITY_MAX, tRel);
    } else if (i < S) {
      const age = max(0, (curSec - i) - 1);
      if (age <= SECOND_TRAIL_UNITS) {
        const k = constrain(age / SECOND_TRAIL_UNITS, 0, 1);
        op = OPACITY_MAX * easeOutSine(1 - k);
      }
    }

    if (op > 0) {
      fill(red(blockColor), green(blockColor), blue(blockColor), baseA * op);
      rect(x + i * step, 0, colW, h);
    }
  }
}

// ---------- MILLISECONDS (sweep every second, continuous trail across wrap) ----------
function drawMillisecondRow(now, x, w, h) {
  const ms = now.getMilliseconds(); // 0..999
  const curIdxFloat = (ms / 1000) * MILLISECOND_COUNT; // 0..MILLISECOND_COUNT
  const activeIdx = floor(curIdxFloat);

  const colW = (w + MILLISECOND_OVERLAP * (MILLISECOND_COUNT - 1)) / MILLISECOND_COUNT;
  const step = colW - MILLISECOND_OVERLAP;

  const baseA = alpha(blockColor);

  for (let i = 0; i < MILLISECOND_COUNT; i++) {
    let op = 0;

    if (i === activeIdx) {
      // active block fades up over its interval
      const tRel = constrain(curIdxFloat - i, 0, 1);
      op = lerp(OPACITY_BASE, OPACITY_MAX, tRel);
    } else {
      // modular distance so the trail continues across the 999→0 wrap
      const cycDist = (curIdxFloat - i + MILLISECOND_COUNT) % MILLISECOND_COUNT; // (0, COUNT)
      const age = max(0, cycDist - 1); // age since this block finished
      if (age > 0 && age <= MILLISECOND_TRAIL_UNITS) {
        const k = constrain(age / MILLISECOND_TRAIL_UNITS, 0, 1);
        op = OPACITY_MAX * easeOutSine(1 - k);
      }
    }

    if (op > 0) {
      fill(red(blockColor), green(blockColor), blue(blockColor), baseA * op);
      rect(x + i * step, 0, colW, h);
    }
  }
}

// ---------- RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}