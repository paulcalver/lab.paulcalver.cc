// Setup Variables
let rows = 60;
let cols = 60;
let pause = false;
let pausedTime = 0;
let timeOffset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(400);
  textFont('Space Mono');
  cursor(HAND);

}

function draw() {

  background(0);

  // Alpha pulse every second
  let currentTime = pause ? pausedTime : millis() - timeOffset;
  let tPulse = currentTime / 1000;
  let s = (sin(TWO_PI * tPulse) + 1) * 0.5;
  s = pow(s, 20)
  let alpha = lerp(255, 50, s);

  // One minute cycle time
  let cycleTime = currentTime % 60000;
  let phase = cycleTime / 60000; // 0 to 1 over the minute

  // Noise increasing over each minute
  let easedPhase = easeInExpo(phase);     
  let shaped = pow(easedPhase, 4.0);
  let noiseScale = lerp(0.1, 20, shaped);

  // Scale
  let scaleEased = easeInSine(phase);
  let scale = lerp(10, 0.00001, scaleEased);

  // Grid Math + SetUp
  let gridSize = height * 0.7;
  let blockSize = gridSize / rows * scale;
  let padding = 1;
  let spacing = blockSize + padding;

  // Grid Centering 
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;


  // Grid Loop
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;

      // Colour noise
      let t = (cycleTime / 1000) * noiseScale;
      let r = noise(i * 0.05, j * 0.05, t) * 255;
      let g = noise(i * 0.05 + 100, j * 0.05 + 100, t) * 255;
      let b = noise(i * 0.05 + 200, j * 0.05 + 200, t) * 255;
      fill(r, g, b, alpha);

      rect(bx, by, blockSize, blockSize);
    }
  }

  if (pause) {
    fill(255, 255, 255, 200);

    // Pause Text
    let message = "TIME IS ON HOLD\nCLICK TO RESUME";
    let targetWidth = width * 0.9; // Use 90% of canvas width
    let size = 200; // Start with a large size
    textSize(size);

    // Text Scaling
    while (textWidth(message) > targetWidth && size > 10) {
      size -= 5;
      textSize(size);
    }
    text(message, width / 2, height / 2);
  }

}

// Mouse and Touch Interaction
function mousePressed() {
  togglePause();
  return false;
}
function touchStarted() {
  togglePause();
  return false;
}
function togglePause() {
  pause = !pause;
  if (pause) {
    // When pausing, store the current time
    pausedTime = millis() - timeOffset;
  } else {
    // When resuming, calculate the offset to continue from paused time
    timeOffset = millis() - pausedTime;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
// Easing Functions
function easeInSine(x) {
  return 1 - cos((x * PI) / 2);
}
function easeInExpo(x) {
  return x === 0 ? 0 : pow(2, 10 * (x - 1));
}