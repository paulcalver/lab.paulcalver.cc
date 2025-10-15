
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
  const mainHue = map(mouseX, 0, width, 0, 300);
  const oppositeHue = map(mainHue, 0, 300, 300, 0);

  bgColor    = color(mainHue, 30, 100, 1);
  blockColor = color(oppositeHue, 40, 100, 0.7);
  background(bgColor);

  // --- MouseY -> speed (higher = faster) ---
  let speed = map(mouseY, height * 0.85, height * 0.15, 0.003, 0.05);
  speed = constrain(speed, 0.002, 0.2);

  // --- Advance phase; count beats on wrap ---
  phase += speed;
  const wraps = floor(phase);           // how many times we crossed 1 this frame
  if (wraps >= 1) {
    beatIndex = (beatIndex + wraps) % 60; // step once per beat, reset after 60
    phase -= wraps;                       // keep phase in [0,1)
  }

  // Inner circle: grows within the current beat, then snaps back
  const inner = map(phase, 0, 1, 0, 200);


  fill(blockColor);
  circle(width * 0.5, height * 0.45, inner);
  circle(width * 0.5, height * 0.55, inner)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}