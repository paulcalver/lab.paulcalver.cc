
// Settings

let bgColor;
let blockColor;

let demoMode = false;

let BASE_OPACITY = 0.0;
let MAX_OPACITY = 0.70;
let HOUR_COUNT = 24;
let HOUR_HISTORY_MIN_OPACITY = 0.00;
let HOUR_HISTORY_MAX_OPACITY = 0.7;
let MINUTE_COUNT = 60;
let MINUTE_TRAIL_UNITS = 15;
let SECOND_COUNT = 60;
let SECOND_TRAIL_UNITS = 15;
let MILLI_COUNT = 1000;
let MILLI_TRAIL_UNITS = 180;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(RGB, 255, 255, 255, 1);
  noStroke();
  cursor(HAND);
  textFont('Space Mono');
  textAlign(CENTER, CENTER);
}

function draw() {
  // Time-based color system
  let timeOfDay;

  if (demoMode) {
    // Demo mode: map mouseX to 24-hour cycle (left = midnight, right = next midnight)
    timeOfDay = map(mouseX, 0, width, 0, 24);
  } else {
    // Real time mode: use actual time
    let now = new Date();
    timeOfDay = hour() + minute() / 60 + second() / 3600;
  }

  // Get colors based on time of day
  let colors = getTimeOfDayColors(timeOfDay);
  bgColor = colors.bg;
  blockColor = colors.block;

  background(bgColor);

  // Layout
  let availW = width;
  let availH = height;
  let bandH = availH / 4;

  let yTopHours = 0;
  let yTopMinutes = bandH;
  let yTopSeconds = bandH * 2;
  let yTopMillis = bandH * 3;

  let now = new Date();
  drawHourRow(now, 0, availW, bandH, yTopHours);
  drawMinuteRow(now, 0, availW, bandH, yTopMinutes);
  drawSecondRow(now, 0, availW, bandH, yTopSeconds);
  drawMillisecondRow(now, 0, availW, bandH, yTopMillis);
  
  // Display demo mode text
  if (demoMode) {
    push();
    
    // Calculate contrasting text color based on background
    let brightness = (red(bgColor) * 0.299 + green(bgColor) * 0.587 + blue(bgColor) * 0.114);
    let textColor = brightness > 128 ? color(0, 0, 0, 0.8) : color(255, 255, 255, 0.8);
    fill(textColor);
    
    // Scale text size to fit width
    let message = "DEMO MODE, MOUSE X IS NOW LINKED TO TIME OF DAY COLOURS";
    let targetWidth = width * 0.9;
    let size = 200;
    textSize(size);
    
    while (textWidth(message) > targetWidth && size > 10) {
      size -= 5;
      textSize(size);
    }
    
    text("DEMO MODE, MOUSE X IS NOW LINKED TO TIME OF DAY COLOURS\nCLICK AGAIN TO RETURN TO REAL TIME COLOURS", width / 2, height / 2);
    
    pop();
  }
}

// TIME-BASED COLOR SYSTEM 
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

// HOURS
function drawHourRow(now, rowLeft, rowWidth, bandH, yTop) {
  let H = hour();
  let M = minute();
  let S = second();
  let ms = now.getMilliseconds();
  let curHours = H + (M / 60) + (S / 3600) + (ms / 3600000);

  let colW = rowWidth / HOUR_COUNT;
  let step = colW;
  let colH = bandH;

  push();
  rectMode(CORNER);

  for (let h = 0; h < HOUR_COUNT; h++) {
    let tRelToday = curHours - h;
    let op = 0;

    if (h === H && tRelToday >= 0 && tRelToday < 1) {
      op = lerp(BASE_OPACITY, MAX_OPACITY, tRelToday);
    } else if (h < H) {
      let hoursAgo = H - h;
      let span = max(1, H);
      let w = constrain(1 - (hoursAgo - 1) / span, 0, 1);
      op = lerp(HOUR_HISTORY_MIN_OPACITY, HOUR_HISTORY_MAX_OPACITY, w);
    }

    fill(red(blockColor), green(blockColor), blue(blockColor), op);
    rect(rowLeft + h * step, yTop, colW, colH);
  }

  pop();
}

// MINUTES
function drawMinuteRow(now, rowLeft, rowWidth, bandH, yTop) {
  let M = minute();
  let S = second();
  let ms = now.getMilliseconds();
  let curMinutes = M + (S / 60) + (ms / 60000);

  let colW = rowWidth / MINUTE_COUNT;
  let step = colW;
  let colH = bandH;

  push();
  rectMode(CORNER);

  for (let m = 0; m < MINUTE_COUNT; m++) {
    let op = 0;

    if (m === M) {
      let tRel = constrain(curMinutes - m, 0, 1);
      op = lerp(BASE_OPACITY, MAX_OPACITY, tRel);
    } else if (m < M) {
      let tRel = curMinutes - m;
      let ageAfterFinish = max(0, tRel - 1);
      if (ageAfterFinish <= MINUTE_TRAIL_UNITS) {
        let k = constrain(ageAfterFinish / MINUTE_TRAIL_UNITS, 0, 1);
        let w = easeOutSine(1 - k);
        op = MAX_OPACITY * w;
      }
    }

    fill(red(blockColor), green(blockColor), blue(blockColor), op);
    rect(rowLeft + m * step, yTop, colW, colH);
  }

  pop();
}

// SECONDS
function drawSecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  let S = second();
  let ms = now.getMilliseconds();
  let curSeconds = S + ms / 1000;

  let colW = rowWidth / SECOND_COUNT;
  let step = colW;
  let colH = bandH;

  push();
  rectMode(CORNER);

  for (let s = 0; s < SECOND_COUNT; s++) {
    let op = 0;

    if (s === S) {
      let tRel = constrain(curSeconds - s, 0, 1);
      op = lerp(BASE_OPACITY, MAX_OPACITY, tRel);
    } else if (s < S) {
      let tRel = curSeconds - s;
      let ageAfterFinish = max(0, tRel - 1);
      if (ageAfterFinish <= SECOND_TRAIL_UNITS) {
        let k = constrain(ageAfterFinish / SECOND_TRAIL_UNITS, 0, 1);
        let w = easeOutSine(1 - k);
        op = MAX_OPACITY * w;
      }
    }

    if (op > 0) {
      fill(red(blockColor), green(blockColor), blue(blockColor), op);
      rect(rowLeft + s * step, yTop, colW, colH);
    }
  }

  pop();
}

// MILLISECONDS
function drawMillisecondRow(now, rowLeft, rowWidth, bandH, yTop) {
  let ms = now.getMilliseconds(); 
  let curFloat = (ms / 1000) * MILLI_COUNT; 
  let activeIdx = floor(curFloat);

  let colW = rowWidth / MILLI_COUNT;
  let step = colW;
  let colH = bandH;

  push();
  rectMode(CORNER);

  for (let i = 0; i < MILLI_COUNT; i++) {
    let op = 0;

    if (i === activeIdx) {
      let tRel = constrain(curFloat - i, 0, 1);
      op = lerp(0, MAX_OPACITY, tRel);
    } else {
      let cycDist = (curFloat - i + MILLI_COUNT) % MILLI_COUNT;
      let ageAfterFinish = max(0, cycDist - 1);
      if (ageAfterFinish > 0 && ageAfterFinish <= MILLI_TRAIL_UNITS) {
        let k = constrain(ageAfterFinish / MILLI_TRAIL_UNITS, 0, 1);
        const w = easeOutSine(1 - k);
        op = MAX_OPACITY * w;
      }
    }

    if (op > 0) {
      fill(red(blockColor), green(blockColor), blue(blockColor), op);
      rect(rowLeft + i * step, yTop, colW, colH);
    }
  }

  pop();
}

function mousePressed() {
  demoMode = !demoMode;
  
}

// ---------- RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
// ---------- easing ----------
function easeOutSine(x) { return sin((x * PI) / 2); }
function easeInOutSine(x) { return -(cos(PI * x) - 1) / 2; }