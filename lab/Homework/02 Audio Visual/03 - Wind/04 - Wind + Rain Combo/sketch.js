let rows;
let cols;
let padding = 30;

let flow = 2.5;
let maxFlap = -280;

let windArrowCount = 100;
let arrowX = [];
let arrowY = [];
let arrowSpeedoffset = [];
let maxArrowSpeed = 80; // Maximum speed for arrows based on audio input

// Rain variables
let rainCols = 50;
let rainRows = rainCols;
let animatingSquares = []; // Array to store squares that are animating
let animationDuration = 1000; // 1 second in milliseconds
let audioThreshold = 0.005; // Lower threshold for better responsiveness
let lastTriggerTime = 0;
let minTimeBetweenDrops = 10; // Very fast drops for multiple simultaneous drops

// Smoothing variables for both flaps and arrows
let smoothedLevel = 0;
let smoothingFactor = 0.5; // Audio level smoothing (0.05 = very smooth, 1.0 = no smoothing)
let movementSmoothingFactor = 0.5; // Movement smoothing (0.05 = very smooth, 1.0 = no smoothing)
let targetFlapMovement = 0;
let currentFlapMovement = 0;
let targetArrowSpeed = 0;
let currentArrowSpeed = 0;

let windSound;
let rainSound;
let windAmplitude;
let rainAmplitude;
let windFft;
let rainFft;

function preload() {
  soundFormats('mp3');
  windSound = loadSound('assets/audio/bbc_wind_01.mp3');
  rainSound = loadSound('assets/audio/rain.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CORNER);
  angleMode(DEGREES)

  windSound.setLoop(true);
  rainSound.setLoop(true);

  // Set volume levels to balance the sounds
  windSound.amp(0.5); // Wind at 50%
  rainSound.amp(0.8); // Rain at 80% (louder to balance)

  windAmplitude = new p5.Amplitude();
  windAmplitude.setInput(windSound);

  rainAmplitude = new p5.Amplitude();
  rainAmplitude.setInput(rainSound);

  // Set up FFT for rain analysis
  windFft = new p5.FFT();
  windFft.setInput(windSound);

  rainFft = new p5.FFT();
  rainFft.setInput(rainSound);

  for (let i = 0; i < windArrowCount; i++) {
    arrowX[i] = random(-width / 2, width / 2 - 40); // Limit arrows to left half
    // Initial Y will be properly set when arrows reset within wind square bounds
    arrowY[i] = random(height * 0.2, height * 0.8); // Rough middle area
    arrowSpeedoffset[i] = random(0, 3); // Random speed offset for each arrow
  }
}

// Simple circle function for rain - always draws a standard size circle at 0,0
function drawCircle(alpha = 200) {
  push();
  fill(0, alpha);
  noStroke();
  rectMode(CENTER);
  circle(0, 0, 20);  // 20px circle centered at origin
  pop();
}

function draw() {
  background(0); // Black background

  // Calculate smaller square dimensions for split screen
  let squareSize = min(width, height) * 0.6; // Smaller squares (60% instead of 80%)
  let gap = 40; // Gap between squares
  let totalWidth = (squareSize * 2) + gap;
  let leftSquareX = (width - totalWidth) / 2;
  let rightSquareX = leftSquareX + squareSize + gap;
  let squareY = (height - squareSize) / 2;

  // Fill squares with light background (no stroke)
  fill(220);
  noStroke();
  rect(leftSquareX, squareY, squareSize, squareSize); // Wind square
  rect(rightSquareX, squareY, squareSize, squareSize); // Rain square

  fill(255);
  textAlign(LEFT);
  text("W - Wind | R - Rain | Space - Both", 20, 20);
  fill(0);
  text("Wind", leftSquareX + 10, squareY - 10);
  text("Rain", rightSquareX + 10, squareY - 10);

  let windLevel = windAmplitude.getLevel();
  let rainLevel = rainAmplitude.getLevel();

  // ===== WIND SECTION (LEFT SQUARE) =====

  // Wind grid setup
  rows = Math.floor(squareSize / 120);
  cols = rows;

  let windGridSize = squareSize * 0.8;
  let windBlockSize = (windGridSize - ((rows - 1) * padding)) / rows;
  let windRoundedBlockSize = Math.floor(windBlockSize);
  let windSpacing = windGridSize / rows;

  // Wind centering within left square
  let windTotalGridWidth = (cols - 1) * windSpacing + windRoundedBlockSize;
  let windTotalGridHeight = (rows - 1) * windSpacing + windRoundedBlockSize;
  let windStartX = leftSquareX + (squareSize - windTotalGridWidth) / 2;
  let windStartY = squareY + (squareSize - windTotalGridHeight) / 2;

  // Wind smoothing - handle both playing and paused states
  if (windSound && windSound.isPlaying()) {
    // When playing, respond to audio level
    smoothedLevel = lerp(smoothedLevel, windLevel, smoothingFactor);
    targetFlapMovement = map(smoothedLevel, 0, 0.25, 0, maxFlap);
  } else {
    // When paused, gradually return to starting position (0 rotation)
    targetFlapMovement = 0;
  }
  currentFlapMovement = lerp(currentFlapMovement, targetFlapMovement, movementSmoothingFactor);
  let flapMovement = currentFlapMovement;

  // Wind arrows (only show when wind sound is playing)
  if (windSound && windSound.isPlaying()) {
    // Fix any arrows that are outside the 10% margin zones on first frame
    for (let i = 0; i < windArrowCount; i++) {
      let topMargin = squareY + (squareSize * 0.1);
      let bottomMargin = squareY + squareSize - (squareSize * 0.1);
      if (arrowY[i] < topMargin || arrowY[i] > bottomMargin) {
        arrowY[i] = random(topMargin, bottomMargin);
      }
    }

    targetArrowSpeed = map(smoothedLevel, 0, 0.3, 0.5, maxArrowSpeed);
    currentArrowSpeed = lerp(currentArrowSpeed, targetArrowSpeed, movementSmoothingFactor);
    let lineSize = map(height, 400, 1200, 2, 4);

    // Create clipping mask for wind square
    push();
    clip(() => {
      rect(leftSquareX, squareY, squareSize, squareSize);
    });

    for (let i = 0; i < windArrowCount; i++) {
      arrowX[i] += currentArrowSpeed + arrowSpeedoffset[i];

      // Reset within left square bounds
      if (arrowX[i] > leftSquareX + squareSize + 50) {
        arrowX[i] = leftSquareX - 50;
        // Constrain arrows to middle 80% of wind square (avoid top/bottom 10%)
        let topMargin = squareY + (squareSize * 0.1);
        let bottomMargin = squareY + squareSize - (squareSize * 0.1);
        arrowY[i] = random(topMargin, bottomMargin);
      }

      // Only draw if within left square area
      if (arrowX[i] > leftSquareX - 50 && arrowX[i] < leftSquareX + squareSize + 50) {
        let fadeProgress = map(arrowX[i], leftSquareX - 50, leftSquareX + squareSize, 1, 0);
        fadeProgress = constrain(fadeProgress, 0, 1);
        let alpha = fadeProgress * 255;

        push();
        translate(arrowX[i], arrowY[i]);
        stroke(0, 0, 0, alpha);
        strokeWeight(lineSize);
        strokeCap(SQUARE);
        line(0, 0, lineSize * 5, 0);
        pop();
      }
    }

    pop(); // End clipping
  }

  // Wind flaps
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let cellLeft = windStartX + j * windSpacing;
      let cellTop = windStartY + i * windSpacing;

      fill(0);
      push();
      translate(cellLeft, cellTop);

      if (j === 0) {
        let constrainedRotation = constrain(flapMovement, -90, 0);
        rotate(constrainedRotation);
      } else {
        let reductionFactor = 1 - (j * (1 / (cols * flow)));
        let constrainedRotation = constrain(flapMovement * reductionFactor, -90, 0);
        rotate(constrainedRotation);
      }

      rect(0, 0, windRoundedBlockSize / 8, windRoundedBlockSize);
      pop();
    }
  }

  // ===== RAIN SECTION (RIGHT SQUARE) =====

  // Rain grid setup
  let rainGridSize = squareSize * 0.8;
  let rainPadding = 4;
  let rainSpacing = rainGridSize / rainRows;
  let rainBlockSize = rainSpacing - rainPadding;

  // Rain centering within right square
  let rainStartX = rightSquareX + (squareSize - (rainCols * rainSpacing)) / 2 + rainSpacing / 2;
  let rainStartY = squareY + (squareSize - (rainRows * rainSpacing)) / 2 + rainSpacing / 2;

  // Audio-triggered raindrops
  if (rainSound.isPlaying()) {
    let spectrum = rainFft.analyze();

    let lowFreq = rainFft.getEnergy(20, 200);
    let midFreq = rainFft.getEnergy(200, 2000);
    let highFreq = rainFft.getEnergy(2000, 8000);

    let audioLevel = max(lowFreq, midFreq, highFreq);
    let normalizedLevel = audioLevel / 255;
    let overallIntensity = (lowFreq + midFreq + highFreq) / (3 * 255);

    if (normalizedLevel > audioThreshold && millis() - lastTriggerTime > minTimeBetweenDrops) {
      let numDrops = Math.floor(map(overallIntensity, 0, 1, 1, 8));

      for (let drop = 0; drop < numDrops; drop++) {
        let randomI = floor(random(rainRows));
        let randomJ = floor(random(rainCols));
        let crossId = randomI + "_" + randomJ + "_" + millis() + "_" + drop;

        animatingSquares.push({
          id: crossId,
          i: randomI,
          j: randomJ,
          startTime: millis(),
          intensity: overallIntensity
        });
      }

      lastTriggerTime = millis();
    }
  }

  // Draw rain circles (with clipping and reduced scale)
  push();
  clip(() => {
    rect(rightSquareX, squareY, squareSize, squareSize);
  });

  for (let i = 0; i < rainRows; i++) {
    for (let j = 0; j < rainCols; j++) {
      let directImpact = animatingSquares.find(drop =>
        drop.i === i && drop.j === j
      );

      if (directImpact) {
        let bx = rainStartX + j * rainSpacing;
        let by = rainStartY + i * rainSpacing;

        let elapsed = millis() - directImpact.startTime;
        if (elapsed < animationDuration) {
          let progress = elapsed / animationDuration;

          // Scale initial drop size based on audio intensity (same as Rain 05)
          let intensityScale = map(directImpact.intensity || 0.5, 0.3, 0.45, 0.8, 6);

          // Fixed shrinking animation - proper ease out
          let shrinkScale = 1 - progress; // Linear shrink from 1 to 0
          shrinkScale = max(shrinkScale, 0.3); // Prevent getting too small

          // Map shrinkScale from (0.3 to 1.0) to (0 to 255)
          let alpha = map(shrinkScale, 0.3, 1.0, 0, 255);
          alpha = constrain(alpha, 0, 255);
          let sizeScale = intensityScale * shrinkScale;

          push();
          translate(bx, by);

          // Ensure scale is always positive and reasonable (same as Rain 05)
          let finalScale = abs(rainBlockSize / 20 * sizeScale);
          finalScale = constrain(finalScale, 0.1, 10);
          scale(finalScale);
          drawCircle(alpha);
          pop();
        } else {
          animatingSquares = animatingSquares.filter(drop => drop.id !== directImpact.id);
        }
      }
    }
  }

  pop(); // End clipping
}

function keyPressed() {
  if (key === 'w' || key === 'W') {
    // Toggle wind sound
    if (windSound.isPlaying()) {
      windSound.pause();
    } else {
      windSound.play();
    }
  } else if (key === 'r' || key === 'R') {
    // Toggle rain sound
    if (rainSound.isPlaying()) {
      rainSound.pause();
    } else {
      rainSound.play();
    }
  } else if (key === ' ') {
    // Toggle both sounds
    if (windSound.isPlaying() || rainSound.isPlaying()) {
      windSound.pause();
      rainSound.pause();
    } else {
      windSound.play();
      rainSound.play();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
