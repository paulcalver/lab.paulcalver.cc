let rows;
let cols;
let padding = 30;

let flow = 2.5;
let maxFlap = -180;

let windArrowCount = 100;
let arrowX = [];
let arrowY = [];
let arrowSpeedoffset = [];
let maxArrowSpeed = 80; // Maximum speed for arrows based on audio input

// Smoothing variables for both flaps and arrows
let smoothedLevel = 0;
let smoothingFactor = 0.5; // Audio level smoothing (0.05 = very smooth, 1.0 = no smoothing)
let movementSmoothingFactor = 0.5; // Movement smoothing (0.05 = very smooth, 1.0 = no smoothing)
let targetFlapMovement = 0;
let currentFlapMovement = 0;
let targetArrowSpeed = 0;
let currentArrowSpeed = 0;

let sound;
let amplitude;

function preload() {

  soundFormats('mp3');
  //sound = loadSound('assets/audio/03_Anasickmodular_01.mp3');
  sound = loadSound('assets/audio/bbc_wind_01.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CORNER);
  angleMode(DEGREES)

  sound.setLoop(true);
  amplitude = new p5.Amplitude();
  amplitude.setInput(sound);

  for (let i = 0; i < windArrowCount; i++) {
    arrowX[i] = random(-width, width - 40); // Spread arrows across horizontal range initially
    arrowY[i] = random(40, height - 40);
    arrowSpeedoffset[i] = random(0, 3); // Random speed offset for each arrow
  }


}

function draw() {
  background(220);

  fill(0);
  text("Click to Play & Pause", 20, 20);
  let level = amplitude.getLevel();
  //console.log(level);


  rows = Math.floor(height / 160); // Adjust rows based on window height
  cols = rows * 1.3;


  let gridSize = height * 0.7;
  let blockSize = (gridSize - ((rows - 1) * padding)) / rows;
  let roundedBlockSize = Math.floor(blockSize);
  let spacing = gridSize / rows; // Divide total grid size by rows for even distribution

  // Centering - use the intended gridSize for positioning
  let totalGridWidth = (cols - 1) * spacing + roundedBlockSize;
  let totalGridHeight = gridSize; // Use the intended gridSize (0.8 of height)
  let startX = (width - totalGridWidth) / 2;
  let startY = (height - totalGridHeight) / 2 + blockSize / 4;

  // Arrow speed with shared smoothing (calculated once per frame)
  targetArrowSpeed = map(smoothedLevel, 0, 0.3, 0.5, maxArrowSpeed);
  currentArrowSpeed = lerp(currentArrowSpeed, targetArrowSpeed, movementSmoothingFactor);
  let lineSize = map(height, 400, 1200, 3, 8); // Map from typical screen heights to line weight

  for (let i = 0; i < windArrowCount; i++) {
    // Update arrow position along X axis using smoothed audio-reactive speed
    arrowX[i] += currentArrowSpeed + arrowSpeedoffset[i];

    // Reset arrow to left side with new random position when it goes off screen
    if (arrowX[i] > width + 50) {
      arrowX[i] = -50; // Start to the left of the screen
      arrowY[i] = random(40, height - 40); // New random Y position
    }

    // Calculate alpha based on arrow position (fade as they travel)
    let fadeProgress = map(arrowX[i], -50, width, 1, 0.2); // 1 (opaque) at start, 0 (transparent) at end
    fadeProgress = constrain(fadeProgress, 0, 1); // Keep within 0-1 range
    let alpha = fadeProgress * 255; // Convert to 0-255 alpha range

    // Draw arrow as single line
    push();
    translate(arrowX[i], arrowY[i]);

    // Simple horizontal line arrow
    stroke(255, 0, 0, alpha);
    strokeWeight(lineSize * 0.5);
    strokeCap(SQUARE);
    line(0, 0, lineSize * 5, 0);

    pop();
  }

  noStroke(); // Reset stroke for other elements

  // Wind Flaps with adjustable smoothing

  // Smooth the audio level to reduce jittery movement
  smoothedLevel = lerp(smoothedLevel, level, smoothingFactor);

  // Calculate target flap movement from smoothed level
  targetFlapMovement = map(smoothedLevel, 0, 0.25, 0, maxFlap);

  // Smooth the flap movement itself for even more fluid motion
  currentFlapMovement = lerp(currentFlapMovement, targetFlapMovement, movementSmoothingFactor);

  let flapMovement = currentFlapMovement; // Use the smoothed movement

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Calculate position of each grid cell
      let cellLeft = startX + j * spacing;
      let cellTop = startY + i * spacing;

      fill(0);
      push();
      translate(cellLeft, cellTop);

      if (j === 0) {
        // First column gets full direct flapMovement, constrained to -90
        let constrainedRotation = constrain(flapMovement, -90, 0);
        rotate(constrainedRotation);
      } else {
        // Other columns get reduced movement, decreasing with distance
        let reductionFactor = 1 - (j * (1 / (cols * flow))); // Reduces by per column
        let constrainedRotation = constrain(flapMovement * reductionFactor, -90, 0);
        rotate(constrainedRotation);
      }

      rect(0, 0, lineSize, roundedBlockSize);
      pop();


    }
  }





}

function mousePressed() {
  //as there is user interaction to play this works
  if (!sound.isPlaying()) {
    sound.play();
  } else {
    sound.pause();
    // sound.stop();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
