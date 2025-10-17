
let bgColor;
let blockColor; 


// phase drives the beat; mouseY controls speed
let phase = 0;          // 0..1 within a beat
let beatIndex = 0;      // 0..59, increments each wrapped beat

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();
}

function draw() {
  // --- Colour ---
  let hueMin = 20;
  let hueMax = 300;
  let mainHue = map(mouseX, 0, width,hueMin, hueMax);
  let oppositeHue = map(mainHue,hueMin, hueMax, hueMax, hueMin); 
  bgColor = color(mainHue, 30, 100, 1);
  blockColor = color(oppositeHue, 40, 100, 0.7);
  background(bgColor);

  // --- MouseY -> speed (higher = faster) ---
  let speed = map(mouseY, height * 0.85, height * 0.15, 0.003, 0.05);
  speed = constrain(speed, 0.005, 0.2);

  // --- Advance phase; count beats on wrap ---
  phase += speed;
  const wraps = floor(phase);           // how many times we crossed 1 this frame
  if (wraps >= 1) {
    beatIndex = (beatIndex + wraps) % 60; // step once per beat, reset after 60
    phase -= wraps;                       // keep phase in [0,1)
  }

  // circleSize circle: grows within the current beat, then snaps back
  const circleSize = map(phase, 0, 1, 0, 200);

  // Create blurry edge effect with multiple layered circles
  const layers = 20; // Number of circles for blur effect
  const maxAlpha = 0.6; // Maximum opacity for the center
  
  for (let i = layers; i >= 0; i--) {
    // Calculate size and alpha for each layer
    const layerSize = circleSize + (i * 4); // Each layer slightly bigger
    const alpha = map(i, layers, 0, 0, maxAlpha); // Fade from transparent to opaque
    
    // Set color with calculated alpha
    fill(hue(blockColor), saturation(blockColor), brightness(blockColor), alpha);
    circle(width * 0.5, height * 0.5, layerSize);

  
  }
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}