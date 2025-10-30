

let cols = 100;
let rows = cols*0.75;

// Animation variables
let animatingSquares = []; // Array to store squares that are animating
let animationDuration = 1000; // 1 second in milliseconds
let baseRippleRadius = 15; // Base ripple radius (will be scaled by volume)
let rippleStrength = 1; // Strength of ripple effect (0-1)

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

// Function to draw intensity number - displays the audio intensity value
function drawIntensityNumber(alpha = 200, intensity = 0.5) {
  push();
  fill(230, alpha); // White text for contrast against dark circles
  textAlign(CENTER, CENTER);
  textSize(18);
  
  // Display intensity as decimal with 2 decimal places (like version 06)
  let displayNumber = intensity.toFixed(2);
  text(displayNumber, 0, 0);
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
    console.log("Rain sound stopped");
  } else {
    rainSound.loop(); // Loop the rain sound
    console.log("Rain sound started");
  }
  
  // Also trigger a test raindrop on click
  let randomI = floor(random(rows));
  let randomJ = floor(random(cols));
  let crossId = randomI + "_" + randomJ;
  
  animatingSquares.push({
    id: crossId,
    i: randomI,
    j: randomJ,
    startTime: millis()
  });
  console.log("Test raindrop triggered at:", randomI, randomJ);
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
    
    // Debug: show audio level - More detailed
    fill(255, 0, 0);
    textSize(14);
   // text("Audio Level: " + normalizedLevel.toFixed(3), 10, 20);
    //text("Overall Intensity: " + overallIntensity.toFixed(3), 10, 40);
    //text("Active crosses: " + animatingSquares.length, 10, 60);
    
    // Multiple drops based on audio intensity
    if (normalizedLevel > audioThreshold && millis() - lastTriggerTime > minTimeBetweenDrops) {
      // Number of drops based on audio intensity (1-5 drops)
      let numDrops = Math.floor(map(overallIntensity, 0, 1, 1, 20));
      
      // Create multiple raindrops
      for (let drop = 0; drop < numDrops; drop++) {
        let randomI = floor(random(rows));
        let randomJ = floor(random(cols));
        let crossId = randomI + "_" + randomJ + "_" + millis() + "_" + drop; // Unique ID
        
        // Calculate ripple size based on audio intensity
        let rippleRadius = map(overallIntensity, 0, 1, baseRippleRadius * 0.5, baseRippleRadius * 2);
        
        animatingSquares.push({
          id: crossId,
          i: randomI,
          j: randomJ,
          startTime: millis(),
          intensity: overallIntensity,
          rippleRadius: rippleRadius
        });
      }
      
      lastTriggerTime = millis();
      console.log(`Created ${numDrops} raindrops with intensity: ${overallIntensity.toFixed(3)}`);
    }
  } else {
    // Show instruction when not playing
    fill(0);
    text("Click to start rain", 10, 30);
  }
  
  // Grid - only draw numbers where there are impacts
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
          
          // Ease-out sine animation: starts big, shrinks to nothing (like version 06)
          let easeOutSine = sin(progress * PI * 0.5); // Sine curve from 0 to PI/2
          let shrinkScale = 1 - easeOutSine; // Invert so it shrinks (1 → 0)
          
          // Prevent scale from getting too small (causes rendering issues)
          shrinkScale = max(shrinkScale, 0.3);
          
          // Sync fade with scale - when scale hits minimum, fade should be 0 (like version 06)
          // Map shrinkScale from (0.3 to 1.0) to (0 to 255)
          alpha = map(shrinkScale, 0.3, 1.0, 0, 255);
          alpha = constrain(alpha, 0, 255); // Ensure alpha stays in valid range
          sizeScale = intensityScale * shrinkScale; // Start at intensityScale, shrink to minimum
          
          // Draw circle and number using transform
          push();
          translate(bx, by);
          
          // Ensure scale is always positive and reasonable (like version 06)
          let finalScale = abs(blockSize / 20 * sizeScale);
          finalScale = constrain(finalScale, 0.1, 10); // Limit scale range
          scale(finalScale);
          
          // Draw circle first (background layer)
          drawCircle(alpha);
          
          // Draw number on top (foreground layer)
          //drawIntensityNumber(alpha, directImpact.intensity || 0.5);
          
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


