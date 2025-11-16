

let cols = 100;
let rows = cols

// Animation variables
let animatingCrosses = []; // Array to store crosses that are animating
let animationFrequency = 200; // How often new animations start (0.01 = 1% chance per frame)
let animationDuration = 1000; // 1 second in milliseconds
let rippleRadius = 14; // How far the ripple extends (in grid cells)
let rippleStrength = 0.5; // Strength of ripple effect (0-1)

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
}

function draw() {

  
  background(230);
  
  let gridSize = height * 0.8;
  let padding = 4; // Your desired padding
  let spacing = gridSize / rows; // Total space per grid cell
  let blockSize = spacing - padding; // Shape size after accounting for padding
  
  // Centering 
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;
  
  
  // Randomly start new animations
  if (random() < animationFrequency) {
    let randomI = floor(random(rows));
    let randomJ = floor(random(cols));
    let crossId = randomI + "_" + randomJ;
    
    // Check if this cross is not already animating
    let alreadyAnimating = animatingCrosses.some(cross => cross.id === crossId);
    if (!alreadyAnimating) {
      animatingCrosses.push({
        id: crossId,
        i: randomI,
        j: randomJ,
        startTime: millis()
      });
    }
  }
  
  // Grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;
      
      // Check if this cross is animating (direct impact)
      let crossId = i + "_" + j;
      let animatingCross = animatingCrosses.find(cross => cross.id === crossId);
      let alpha = 255; // Default full opacity
      let sizeScale = 1; // Default normal size
      
      // Check for ripple effects from nearby impacts
      let rippleEffect = 0;
      for (let drop of animatingCrosses) {
        let distance = dist(i, j, drop.i, drop.j);
        if (distance > 0 && distance <= rippleRadius) {
          let elapsed = millis() - drop.startTime;
          let progress = elapsed / animationDuration;
          
          // Ripple only active during first 40% of animation
          if (progress < 0.4) {
            let rippleIntensity = (1 - distance / rippleRadius) * rippleStrength;
            let timeDecay = 1 - (progress / 0.4);
            rippleEffect += rippleIntensity * timeDecay;
          }
        }
      }
      
      // Apply ripple effect to size
      sizeScale += rippleEffect;
      
      if (animatingCross) {
        let elapsed = millis() - animatingCross.startTime;
        if (elapsed < animationDuration) {
          let progress = elapsed / animationDuration;
          
          // Fast shrink phase (first 20% of animation)
          if (progress < 0.2) {
            let shrinkProgress = progress / 0.2; // 0 to 1 over first 20%
            alpha = 255 * (1 - shrinkProgress); // Fade out quickly
            sizeScale = 1 - shrinkProgress; // Shrink to 0 (overrides ripple effect for direct impact)
          } 
          // Slow grow back phase (remaining 80% of animation)
          else {
            let growProgress = (progress - 0.2) / 0.8; // 0 to 1 over remaining 80%
            alpha = 255 * growProgress; // Fade in slowly
            sizeScale = growProgress; // Grow back to normal (overrides ripple effect for direct impact)
          }
        } else {
          // Animation complete, remove from array
          animatingCrosses = animatingCrosses.filter(cross => cross.id !== crossId);
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


