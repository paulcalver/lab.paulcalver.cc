





let rows = 100;
let cols = 100;

// Ripple variables
let rippleStartTime = -1; // -1 means no active ripple
let rippleDuration = 3000; // 3 seconds

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
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
  
  
  // Grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;
      
      // Calculate distance from center of grid
      let centerX = width * 0.5;
      let centerY = height * 0.5;
      let distance = dist(bx, by, centerX, centerY);
      
      // Create ripple effect based on time and distance
      let time = millis() * 0.003; // Speed of ripple
      let wave = sin(time - distance * 0.04); // Ripple wave
      
      // Move the cross based on the wave (displacement from center)
      let displacement = wave * 10; // Maximum displacement in pixels
      let angle = atan2(by - centerY, bx - centerX); // Angle from center to cross
      
      // Apply displacement in direction away from center
      let offsetX = cos(angle) * displacement;
      let offsetY = sin(angle) * displacement;
      
      let animatedX = bx + offsetX;
      let animatedY = by + offsetY;
      
      // Scale the cross based on the wave (convert wave from -1,1 to 0,1)
      let scaleWave = wave * 0.5 + 0.5;
      let scale = 0.3 + scaleWave * 0.7; // Scale between 0.3 and 1.0
      let animatedBlockSize = blockSize * scale;
      
      // Opacity based on wave for extra effect
      let alpha = 100 + abs(wave) * 155; // Alpha between 100 and 255
      
      fill(0, alpha);
      
      rect(animatedX, animatedY, animatedBlockSize, animatedBlockSize/6);
      rect(animatedX, animatedY, animatedBlockSize/6, animatedBlockSize);
    }
  }
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

