// --- background colour ---
let bgColor;
let demoMode = false; // Toggle between real time and demo mode

// --- block colours ---
let blockColorB; // Main block color for all time displays

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_OVERLAP = 0;
const HOUR_HISTORY_MIN_OPACITY = 0.00;
const HOUR_HISTORY_MAX_OPACITY = 0.7;
const HOUR_BASE_OPACITY = 0.0;
const HOUR_MAX_OPACITY  = 0.70;

// --- minute row config ---
const MINUTE_COUNT = 60;
const MINUTE_OVERLAP = 0;
const MINUTE_BASE_OPACITY = 0.0;  // fades up during the active minute
const MINUTE_MAX_OPACITY  = 0.70;
const MINUTE_TRAIL_UNITS  = 15;   // trailing duration in minutes

// --- second row config (now behaves like minutes) ---
const SECOND_COUNT = 60;
const SECOND_OVERLAP = 0;
const SECOND_BASE_OPACITY = 0.0;  // same idea as minutes
const SECOND_MAX_OPACITY = 0.70;
const SECOND_TRAIL_UNITS = 15;    // trailing duration in seconds

// --- millisecond row config ---
const MILLI_COUNT        = 1000;
const MILLI_OVERLAP      = 0;
const MILLI_MAX_OPACITY  = 0.70;
const MILLI_TRAIL_UNITS  = 180;   // trailing duration in blocks

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(RGB, 255, 255, 255, 1);
  noStroke();
}

function draw() {
  // Time-based color system
  let timeOfDay;
  
  if (demoMode) {
    // Demo mode: map mouseX to 24-hour cycle (left = midnight, right = next midnight)
    timeOfDay = map(mouseX, 0, width, 0, 24);
  } else {
    // Real time mode: use actual time
    const now = new Date();
    timeOfDay = hour() + minute() / 60 + second() / 3600;
  }
  
  // Get colors based on time of day
  let colors = getTimeOfDayColors(timeOfDay);
  bgColor = colors.bg;
  blockColorB = colors.block;

  background(bgColor);


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
  drawSecondRow(now, 0, availW, bandH, yTopSeconds);   // now matches minutes logic
  drawMillisecondRow(now, 0, availW, bandH, yTopMillis);
}

// ---------- TIME-BASED COLOR SYSTEM ----------
// ---------- TIME-BASED COLOR SYSTEM ----------
function getTimeOfDayColors(timeOfDay) {
  // Normalize time to 0-24 range
  timeOfDay = timeOfDay % 24;
  
  let bgR, bgG, bgB;
  let blockR, blockG, blockB;
  
  // Define natural sky color periods based on real atmospheric lighting
  if (timeOfDay >= 0 && timeOfDay < 5) {
    // Deep night (midnight to 5am) - match the late evening dark blue
    let t = timeOfDay / 5;
    bgR = lerp(8, 8, t);       // Hold the deep night blue from 11pm
    bgG = lerp(15, 15, t);
    bgB = lerp(35, 35, t);
    blockR = lerp(25, 25, t);  // Hold the deep night block blue 
    blockG = lerp(35, 35, t);
    blockB = lerp(65, 65, t);
    
  } else if (timeOfDay >= 5 && timeOfDay < 6) {
    // Pre-dawn (5am to 6am) - transition from dark blue to dawn
    let t = (timeOfDay - 5);
    bgR = lerp(8, 180, easeOutSine(t));       // Dark blue to red dawn
    bgG = lerp(15, 60, easeOutSine(t));
    bgB = lerp(35, 80, easeOutSine(t));
    blockR = lerp(25, 200, easeOutSine(t));   // Dark blue blocks to dawn
    blockG = lerp(35, 50, easeOutSine(t));
    blockB = lerp(65, 60, easeOutSine(t));
    
  } else if (timeOfDay >= 6 && timeOfDay < 7) {
    // Dawn (6am to 7am) - mirror sunset (18:00-19:00) in reverse
    let t = (timeOfDay - 6);
    bgR = lerp(180, 240, easeInOutSine(t));   // Reverse sunset: red to golden
    bgG = lerp(60, 140, easeInOutSine(t));
    bgB = lerp(80, 100, easeInOutSine(t));
    blockR = lerp(200, 255, easeInOutSine(t)); 
    blockG = lerp(50, 120, easeInOutSine(t));
    blockB = lerp(60, 80, easeInOutSine(t));
    
  } else if (timeOfDay >= 7 && timeOfDay < 8) {
    // Sunrise (7am to 8am) - mirror golden hour (17:00-18:00) in reverse
    let t = (timeOfDay - 7);
    bgR = lerp(240, 200, easeInOutSine(t));   // Reverse golden hour: golden to warm day
    bgG = lerp(140, 160, easeInOutSine(t));
    bgB = lerp(100, 180, easeInOutSine(t));
    blockR = lerp(255, 200, easeInOutSine(t)); 
    blockG = lerp(120, 140, easeInOutSine(t));
    blockB = lerp(80, 160, easeInOutSine(t));
    
  } else if (timeOfDay >= 8 && timeOfDay < 10) {
    // Morning transition (8am to 10am) - sunrise to clear sky
    let t = (timeOfDay - 8) / 2;
    bgR = lerp(200, 180, t);  // Transition from sunrise to clear sky
    bgG = lerp(160, 200, t);
    bgB = lerp(180, 240, t);
    blockR = lerp(200, 160, t);  
    blockG = lerp(140, 180, t);
    blockB = lerp(160, 220, t);
    
  } else if (timeOfDay >= 10 && timeOfDay < 16) {
    // Clear sky period (10am to 4pm) - consistent bright blue sky
    let t = (timeOfDay - 10) / 6;  // Very subtle variation over 6 hours
    bgR = lerp(180, 180, t * 0.1);  // Almost no change - hold that beautiful blue
    bgG = lerp(200, 200, t * 0.1);
    bgB = lerp(240, 240, t * 0.1);
    blockR = lerp(160, 160, t * 0.1);  
    blockG = lerp(180, 180, t * 0.1);
    blockB = lerp(220, 220, t * 0.1);
    
  } else if (timeOfDay >= 16 && timeOfDay < 17) {
    // Late afternoon (4pm to 5pm) - warmer light
    let t = (timeOfDay - 16);
    bgR = lerp(180, 200, t);  // Warming up
    bgG = lerp(200, 160, t);
    bgB = lerp(240, 180, t);
    blockR = lerp(160, 200, t);
    blockG = lerp(180, 140, t);
    blockB = lerp(220, 160, t);
    
  } else if (timeOfDay >= 17 && timeOfDay < 18) {
    // Golden hour (5pm to 6pm) - warm golden light
    let t = (timeOfDay - 17);
    bgR = lerp(200, 240, easeInOutSine(t));  // Golden hour
    bgG = lerp(160, 140, easeInOutSine(t));
    bgB = lerp(180, 100, easeInOutSine(t));
    blockR = lerp(200, 255, easeInOutSine(t));  // Warm orange/red
    blockG = lerp(140, 120, easeInOutSine(t));
    blockB = lerp(160, 80, easeInOutSine(t));
    
  } else if (timeOfDay >= 18 && timeOfDay < 19) {
    // Sunset (6pm to 7pm) - orange to red
    let t = (timeOfDay - 18);
    bgR = lerp(240, 180, easeInOutSine(t));  // Deep sunset
    bgG = lerp(140, 60, easeInOutSine(t));
    bgB = lerp(100, 80, easeInOutSine(t));
    blockR = lerp(255, 200, easeInOutSine(t));  // Deep orange/red
    blockG = lerp(120, 50, easeInOutSine(t));
    blockB = lerp(80, 60, easeInOutSine(t));
    
  } else if (timeOfDay >= 19 && timeOfDay < 20) {
    // Dusk (7pm to 8pm) - red to purple
    let t = (timeOfDay - 19);
    bgR = lerp(180, 80, easeOutSine(t));  // Purple dusk
    bgG = lerp(60, 40, easeOutSine(t));
    bgB = lerp(80, 100, easeOutSine(t));
    blockR = lerp(200, 120, easeOutSine(t));  // Deep purple
    blockG = lerp(50, 60, easeOutSine(t));
    blockB = lerp(60, 120, easeOutSine(t));
    
  } else {
    // Evening to night (8pm to midnight) - purple to deep blue
    let t = (timeOfDay - 20) / 4;
    bgR = lerp(80, 8, easeOutSine(t));  // Back to night
    bgG = lerp(40, 15, easeOutSine(t));
    bgB = lerp(100, 35, easeOutSine(t));
    blockR = lerp(120, 25, easeOutSine(t));
    blockG = lerp(60, 35, easeOutSine(t));
    blockB = lerp(120, 65, easeOutSine(t));
  }
  
  return {
    bg: color(bgR, bgG, bgB, 1),
    block: color(blockR, blockG, blockB, 1)
  };
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

    fill(red(blockColorB), green(blockColorB), blue(blockColorB), op);
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

    fill(red(blockColorB), green(blockColorB), blue(blockColorB), op);
    rect(rowLeft + m * step, yTop, colW, colH);
  }

  pop();
}

// ---------- SECONDS (now same behaviour as minutes) ----------
function drawSecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  const S = second();
  const ms = now.getMilliseconds();
  const curSeconds = S + ms / 1000;

  const colW = (rowWidth + SECOND_OVERLAP * (SECOND_COUNT - 1)) / SECOND_COUNT;
  const step = colW - SECOND_OVERLAP;
  const colH = bandH;

  push();
  rectMode(CORNER);

  for (let s = 0; s < SECOND_COUNT; s++) {
    let op = 0;

    if (s === S) {
      const tRel = constrain(curSeconds - s, 0, 1);
      op = lerp(SECOND_BASE_OPACITY, SECOND_MAX_OPACITY, tRel);
    } else if (s < S) {
      const tRel = curSeconds - s;
      const ageAfterFinish = max(0, tRel - 1);
      if (ageAfterFinish <= SECOND_TRAIL_UNITS) {
        const k = constrain(ageAfterFinish / SECOND_TRAIL_UNITS, 0, 1);
        const w = easeOutSine(1 - k);
        op = SECOND_MAX_OPACITY * w;
      }
    }

    if (op > 0) {
      fill(red(blockColorB), green(blockColorB), blue(blockColorB), op);
      rect(rowLeft + s * step, yTop, colW, colH);
    }
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
      fill(red(blockColorB), green(blockColorB), blue(blockColorB), op);
      rect(rowLeft + i * step, yTop, colW, colH);
    }
  }

  pop();
}

function mousePressed() {
  demoMode = !demoMode;
  console.log(demoMode ? "Demo mode: Move mouse to control time colors" : "Real-time mode: Colors follow actual time");
}

// ---------- RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}