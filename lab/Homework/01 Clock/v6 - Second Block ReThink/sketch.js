let lifespan = 10000; // 5 seconds

// --- background colours ---
let bgSyncCol, bgColMain;

// --- block colours ---
let blockColorA, blockColorB, blockColorCurrent; // current used for pulsing hour/minute

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_OVERLAP = 2;
const HOUR_MARGIN_X = 0;   // horizontal margin kept
const HOUR_MARGIN_Y = 0;   // top/bottom outer margin kept
const HOUR_HISTORY_MIN_OPACITY = 0.00; // floor for earliest hours today
const HOUR_HISTORY_MAX_OPACITY = 1.0; // cap for recent past hours
const HOUR_BASE_OPACITY = 0.0;  // appears at H:00 with this opacity
const HOUR_MAX_OPACITY  = 0.70;  // peak opacity
const HOUR_FADE_OUT_HOURS = 10;  // decay after first hour

// --- minute row config (mirrors hours, in minutes) ---
const MINUTE_COUNT = 60;
const MINUTE_OVERLAP = 1;
const MINUTE_BASE_OPACITY = 0.25;
const MINUTE_MAX_OPACITY  = 1.00;
const MINUTE_FADE_OUT_MIN = 10;  // decay after first minute

// --- second row config ---
const SECOND_COUNT = 60;
const SECOND_OVERLAP = 1;

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

  const currentHourIdx = H; // active hour pulses
  const baseA = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let h = 0; h < HOUR_COUNT; h++) {
    // hours since THIS DAY'S h:00 started (no wrap)
    const tRelToday = curHours - h; // can be negative for future hours

    let op = 0;  // 0..1 opacity factor for this column

    if (h === currentHourIdx && tRelToday >= 0 && tRelToday < 1) {
      // CURRENT hour: fade up from BASE -> MAX over its first hour
      op = lerp(HOUR_BASE_OPACITY, HOUR_MAX_OPACITY, tRelToday);
    } else if (h < currentHourIdx) {
      // PAST hours today (00:00 .. H-1): keep visible on a scale
      // Most recent past hour gets HOUR_HISTORY_MAX_OPACITY,
      // earliest hour gets HOUR_HISTORY_MIN_OPACITY.
      const hoursAgo = currentHourIdx - h;              // 1 .. H
      const span = max(1, currentHourIdx);              // avoid divide by 0
      const w = constrain(1 - (hoursAgo - 1) / span, 0, 1); // recent->earliest: 1..0
      op = lerp(HOUR_HISTORY_MIN_OPACITY, HOUR_HISTORY_MAX_OPACITY, w);
    } else {
      // FUTURE hours (after H): invisible
      op = 0;
    }

    // Colour: current hour pulses colour; others static at blockColorB
    const col = (h === currentHourIdx) ? blockColorCurrent : blockColorB;

    fill(red(col), green(col), blue(col), baseA * op);
    const x = rowLeft + h * step;
    rect(x, yTop, colW, colH);
  }

  pop();
}

// ---------- MINUTES (middle third) ----------
function drawMinuteRow(now, eased, rowLeft, rowWidth, bandH, yTop) {
  const H = hour();
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curMinutes = M + (S / 60) + (ms / 60000);

  const colW = (rowWidth + MINUTE_OVERLAP * (MINUTE_COUNT - 1)) / MINUTE_COUNT;
  const step = colW - MINUTE_OVERLAP;
  const colH = bandH;

  const currentMinuteIdx = M; // active minute
  const baseA = max(alpha(blockColorA), alpha(blockColorB));

  push();
  rectMode(CORNER);
  noStroke();

  for (let m = 0; m < MINUTE_COUNT; m++) {
    const tRel = (curMinutes - m + 60) % 60; // minutes since m:00 started

    // Opacity schedule (minutes version)
    let op = 0;
    if (tRel >= 0 && tRel < 1) {
      op = lerp(MINUTE_BASE_OPACITY, MINUTE_MAX_OPACITY, tRel);
    } else if (tRel >= 1 && tRel <= 1 + MINUTE_FADE_OUT_MIN) {
      const k = (tRel - 1) / MINUTE_FADE_OUT_MIN;
      op = MINUTE_MAX_OPACITY * (1 - k);
    }

    // Colour: only current minute pulses A↔B each second; others static at B
    const col = (m === currentMinuteIdx) ? blockColorCurrent : blockColorB;

    fill(red(col), green(col), blue(col), baseA * op);
    const x = rowLeft + m * step;
    rect(x, yTop, colW, colH);
  }

  pop();
}

// ---------- SECONDS (bottom third) ----------
function drawSecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  const S = second();
  const ms = now.getMilliseconds();
  const curSecFrac = S + ms / 1000; // fractional second (0..60)
  const lifeSpanSec = lifespan / 1000;

  const colW = (rowWidth + SECOND_OVERLAP * (SECOND_COUNT - 1)) / SECOND_COUNT;
  const step = colW - SECOND_OVERLAP;
  const colH = bandH;

  const baseA = alpha(blockColorB); // seconds use B’s alpha as baseline

  push();
  rectMode(CORNER);
  noStroke();

  for (let s = 0; s < SECOND_COUNT; s++) {
    // How long ago did second s start?
    const ageSec = (curSecFrac - s + 60) % 60; // 0..60

    if (ageSec <= lifeSpanSec) {
      // Colour: 0..1s A->B (eased), then hold B
      let col;
      if (ageSec < 1) {
        const u = easeInOutSine(ageSec);
        col = lerpColor(blockColorA, blockColorB, u);
      } else {
        col = blockColorB;
      }

      // Alpha: baseA -> 0 over lifespan (5s)
      const a = map(ageSec, 0, lifeSpanSec, baseA, 0);

      fill(red(col), green(col), blue(col), a);
      const x = rowLeft + s * step;
      rect(x, yTop, colW, colH);
    }
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}