

let cols = 120;
let rows = cols*0.75;

// Animation variables
let animatingCrosses = []; // Array to store crosses that are animating
let animationDuration = 1000; // 1 second in milliseconds
let baseRippleRadius = 14; // Base ripple radius (will be scaled by volume)
let rippleStrength = 0.5; // Strength of ripple effect (0-1)

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

// Simple cross function - always draws a standard size X at 0,0
function drawCross(alpha = 255) {
  push();
  rotate(PI/4); // Rotate 45 degrees to make X shape
  stroke(55,125,170, alpha);
  strokeWeight(4);
  strokeCap(SQUARE);
  line(-10, 0, 10, 0);  // horizontal line (now diagonal)
  line(0, -10, 0, 10);  // vertical line (now diagonal)
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
  
  animatingCrosses.push({
    id: crossId,
    i: randomI,
    j: randomJ,
    startTime: millis()
  });
  console.log("Test raindrop triggered at:", randomI, randomJ);
}

function draw() {

  
  background(230);
  
  let gridSize = height * 0.8;
  let padding = 2; // Your desired padding
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
    //text("Active crosses: " + animatingCrosses.length, 10, 60);
    
    // Multiple drops based on audio intensity
    if (normalizedLevel > audioThreshold && millis() - lastTriggerTime > minTimeBetweenDrops) {
      // Number of drops based on audio intensity (1-5 drops)
      let numDrops = Math.floor(map(overallIntensity, 0, 1, 1, 5));
      
      // Create multiple raindrops
      for (let drop = 0; drop < numDrops; drop++) {
        let randomI = floor(random(rows));
        let randomJ = floor(random(cols));
        let crossId = randomI + "_" + randomJ + "_" + millis() + "_" + drop; // Unique ID
        
        // Calculate ripple size based on audio intensity
        let rippleRadius = map(overallIntensity, 0, 1, baseRippleRadius * 0.5, baseRippleRadius * 2);
        
        animatingCrosses.push({
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
    fill(255, 0, 0);
    text("Click to start rain sound", 10, 30);
  }
  
  // Grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;
      
      // Check if this cross is directly animating
      let directImpact = animatingCrosses.find(cross => 
        cross.i === i && cross.j === j
      );
      let alpha = 255; // Default full opacity
      let sizeScale = 1; // Default normal size
      
      // Check for ripple effects from nearby impacts
      let rippleEffect = 0;
      for (let drop of animatingCrosses) {
        let distance = dist(i, j, drop.i, drop.j);
        // Use the drop's individual ripple radius
        let dropRippleRadius = drop.rippleRadius || baseRippleRadius;
        
        if (distance > 0 && distance <= dropRippleRadius) {
          let elapsed = millis() - drop.startTime;
          let progress = elapsed / animationDuration;
          
          // Ripple only active during first 40% of animation
          if (progress < 0.4) {
            let rippleIntensity = (1 - distance / dropRippleRadius) * rippleStrength;
            let timeDecay = 1 - (progress / 0.4);
            // Scale ripple effect by the drop's intensity
            let intensityScale = drop.intensity || 0.5;
            rippleEffect += rippleIntensity * timeDecay * intensityScale;
          }
        }
      }
      
      // Apply ripple effect to size
      sizeScale += rippleEffect;
      
      if (directImpact) {
        let elapsed = millis() - directImpact.startTime;
        if (elapsed < animationDuration) {
          let progress = elapsed / animationDuration;
          
          // Scale initial drop size based on audio intensity
          let intensityScale = map(directImpact.intensity || 0.5, 0, 1, 1, 3); // 1x to 3x size based on volume
          
          // Fast shrink phase (first 20% of animation)
          if (progress < 0.2) {
            let shrinkProgress = progress / 0.2; // 0 to 1 over first 20%
            alpha = 255 * (1 - shrinkProgress); // Fade out quickly
            sizeScale = intensityScale * (1 - shrinkProgress); // Start big, shrink to 0
          } 
          // Slow grow back phase (remaining 80% of animation)
          else {
            let growProgress = (progress - 0.2) / 0.8; // 0 to 1 over remaining 80%
            alpha = 255 * growProgress; // Fade in slowly
            sizeScale = growProgress; // Grow back to normal size (1x)
          }
        } else {
          // Animation complete, remove from array
          animatingCrosses = animatingCrosses.filter(cross => cross.id !== directImpact.id);
        }
      }
      
      // Draw cross using transform
      push();
      translate(bx, by);
      scale(blockSize / 20 * sizeScale); // Apply both grid scale and animation scale
      drawCross(alpha);
      pop();
    }
  }
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


