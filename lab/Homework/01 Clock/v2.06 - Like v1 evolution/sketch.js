
let bgColor;
let blockColor; 
let hueMin;
let hueMax;
let mainSat;
let mainBright;
let altSat;
let altBright;

// phase drives the beat; mouseY controls speed
let phase = 0;          // 0..1 within a beat
let beatIndex = 0;      // 0..59, increments each wrapped beat
let saveRequested = false; // Flag to save on next animation peak

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100, 1);
  hueMin = random(0, 100);
  hueMax = random(200, 360);
  mainSat = random(40, 60);
  mainBright = random(80, 100);
  altSat = random(40, 60);
  altBright = random(80, 100);
  noStroke();
}

function draw() {
  // --- Colour ---

  let mainHue = map(mouseX, 0, width,hueMin, hueMax);
  let oppositeHue = map(mainHue,hueMin, hueMax, hueMax, hueMin); 
  bgColor = color(oppositeHue, altSat, altBright, 1);
  blockColor = color(mainHue, mainSat, mainBright, 0.4);

  background(bgColor);

  // --- MouseY -> speed (higher = faster) ---
  let speed = map(mouseY, height * 0.85, height * 0.15, 0.005, 0.03);
  speed = constrain(speed, 0.005, 0.03);

  // --- Advance phase; count beats on wrap ---
  phase += speed;
  const wraps = floor(phase);           // how many times we crossed 1 this frame
  if (wraps >= 1) {
    beatIndex = (beatIndex + wraps) % 60; // step once per beat, reset after 60
    phase -= wraps;                       // keep phase in [0,1)
  }

  // circleSize circle: grows within the current beat, then snaps back
  const circleSize = map(phase, 0, 1, 0, height * 0.7);


  fill(blockColor);
  circle(width * 0.33, height * 0.5, circleSize);
  circle(width * 0.66, height * 0.5, circleSize);
  
  // Check if we should save at later phase (phase ~0.8)
  if (saveRequested && phase >= 0.85 && phase <= 0.95) {
    saveCurrentFrame();
    saveRequested = false; // Reset flag
  }
}

function saveCurrentFrame() {
  // Calculate current BPM from speed
  let currentSpeed = map(mouseY, height * 0.85, height * 0.15, 0.005, 0.03);
  currentSpeed = constrain(currentSpeed, 0.005, 0.03);
  let bpm = Math.round((currentSpeed * 60) * 60); // Convert speed to beats per minute
  
  // Get current background color values
  let bgHue = Math.round(hue(bgColor));
  let bgSat = Math.round(saturation(bgColor));
  let bgBright = Math.round(brightness(bgColor));
  
  // Get current circle color values
  let circleHue = Math.round(hue(blockColor));
  let circleSat = Math.round(saturation(blockColor));
  let circleBright = Math.round(brightness(blockColor));
  
  // Add text overlay with color and BPM info (no background box)
  push();
  fill(255, 255, 255, 1); // White text
  textSize(16);
  textAlign(LEFT);
  text(`BPM: ${bpm}`, 30, 45);
  text(`Background: HSB(${bgHue}, ${bgSat}, ${bgBright})`, 30, 65);
  text(`Circles: HSB(${circleHue}, ${circleSat}, ${circleBright})`, 30, 85);
  pop();
  
  // Save the frame as PNG (with text overlay but no box)
  let timestamp = nf(year(), 4) + nf(month(), 2) + nf(day(), 2) + "_" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  let filename = `circles_bpm${bpm}_${timestamp}`;
  
  // Try to save to exports folder (works in Node.js/desktop p5.js)
  // In browser, this will still go to Downloads folder
  saveCanvas(`exports/${filename}`, 'png');
  
  console.log(`Saved at peak: exports/${filename}.png - BPM ${bpm}, Phase ${phase.toFixed(2)}, Background HSB(${bgHue}, ${bgSat}, ${bgBright})`);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  // Reshuffle all random values when spacebar is pressed
  if (key === ' ') {
    hueMin = random(0, 100);
    hueMax = random(200, 360);
    mainSat = random(40, 60);
    mainBright = random(80, 100);
    altSat = random(40, 60);
    altBright = random(80, 100);
    console.log("Random values reshuffled!");
    console.log(`New ranges - Hue: ${hueMin.toFixed(0)}-${hueMax.toFixed(0)}, Sat: ${mainSat.toFixed(0)}, Bright: ${mainBright.toFixed(0)}`);
  }
  
  // Save image when 's' key is pressed
  if (key === 's' || key === 'S') {
    saveRequested = true;
    console.log("Save requested - waiting for animation peak...");
  }
}