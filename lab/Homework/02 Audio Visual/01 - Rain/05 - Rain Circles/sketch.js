
let cols = 100;
let rows = cols*0.75;

// Animation variables
let animatingSquares = []; // Array to store squares that are animating
let animationDuration = 1000; // 1 second in milliseconds

// Audio variables
let rainSound;
let fft;
let audioThreshold = 0.005; // Lower threshold for better responsiveness
let lastTriggerTime = 0;
let minTimeBetweenDrops = 10; // Very fast drops for multiple simultaneous drops

function preload() {
  // Load the rain sound file
  rainSound = loadSound('assets/rain.mp3');
}

// Simple circle function - always draws a standard size circle at 0,0
function drawCircle(alpha = 200) {
  push();
  fill(0, alpha);
  noStroke();
  rectMode(CENTER);
  circle(0, 0, 20);  // 20px circle centered at origin
  pop();
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Set up audio analysis
  fft = new p5.FFT();
  fft.setInput(rainSound); // Make sure FFT is connected to the sound
  rainSound.amp(0.7); // Set volume to 70%
}

function mousePressed() {
  // Start/stop the rain sound when clicked
  if (rainSound.isPlaying()) {
    rainSound.stop();
  } else {
    rainSound.loop(); // Loop the rain sound
  }
}

function draw() {
  background(230, 50);

  let gridSize = height * 0.8;
  let padding = 4; // Your desired padding
  let spacing = gridSize / rows; // Total space per grid cell
  let blockSize = spacing - padding; // Shape size after accounting for padding
  
  // Centering 
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;
  
  
  // Audio-triggered raindrops
  if (rainSound.isPlaying()) {
    // Get spectrum analysis first
    let spectrum = fft.analyze();
    
    // Try multiple frequency ranges for rain sounds
    let lowFreq = fft.getEnergy(20, 200);    // Low frequencies
    let midFreq = fft.getEnergy(200, 2000);  // Mid frequencies  
    let highFreq = fft.getEnergy(2000, 8000); // High frequencies (rain hits)
    
    // Use the highest energy from any frequency range
    let audioLevel = max(lowFreq, midFreq, highFreq);
    let normalizedLevel = audioLevel / 255; // Normalize to 0-1
    
    // Calculate overall audio intensity for visual scaling
    let overallIntensity = (lowFreq + midFreq + highFreq) / (3 * 255);
    
    // Multiple drops based on audio intensity
    if (normalizedLevel > audioThreshold && millis() - lastTriggerTime > minTimeBetweenDrops) {
      // Number of drops based on audio intensity (1-10 drops)
      let numDrops = Math.floor(map(overallIntensity, 0, 1, 1, 10));
      
      // Create multiple raindrops
      for (let drop = 0; drop < numDrops; drop++) {
        let randomI = floor(random(rows));
        let randomJ = floor(random(cols));
        let crossId = randomI + "_" + randomJ + "_" + millis() + "_" + drop; // Unique ID
        
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
  } else {
    // Show instruction when not playing
    fill(0);
    text("Click to start rain", 10, 30);
  }
  
  // Grid - only draw circles where there are impacts
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Check if this position has a direct impact
      let directImpact = animatingSquares.find(drop => 
        drop.i === i && drop.j === j
      );
      
      // Only draw if there's a direct impact
      if (directImpact) {
        let bx = startX + j * spacing;
        let by = startY + i * spacing;
        
        let alpha = 255;
        let sizeScale = 1;

        let elapsed = millis() - directImpact.startTime;
        if (elapsed < animationDuration) {
          let progress = elapsed / animationDuration; // 0 to 1 over full animation
          
          // Scale initial drop size based on audio intensity
          let intensityScale = map(directImpact.intensity || 0.5, 0.3, 0.45, 0.5, 6);
          
          // Ease-out sine animation: starts big, shrinks to nothing
          let easeOutSine = sin(progress * PI * 0.5); // Sine curve from 0 to PI/2
          let shrinkScale = 1 - easeOutSine; // Invert so it shrinks (1 → 0)
          
          // Prevent scale from getting too small (causes rendering issues)
          shrinkScale = max(shrinkScale, 0.3);
          
          // Map shrinkScale from (0.3 to 1.0) to (0 to 255)
          alpha = map(shrinkScale, 0.3, 1.0, 0, 255);
          alpha = constrain(alpha, 0, 255); // Ensure alpha stays in valid range
          sizeScale = intensityScale * shrinkScale; // Start at intensityScale, shrink to minimum
          
          // Draw circle using transform
          push();
          translate(bx, by);
          
          // Ensure scale is always positive and reasonable
          let finalScale = abs(blockSize / 20 * sizeScale);
          finalScale = constrain(finalScale, 0.1, 10); // Limit scale range
          scale(finalScale);
          
          // Draw circle
          drawCircle(alpha);
          
          pop();
          
        } else {
          // Animation complete, remove from array
          animatingSquares = animatingSquares.filter(drop => drop.id !== directImpact.id);
        }
      }
    }
  }
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}