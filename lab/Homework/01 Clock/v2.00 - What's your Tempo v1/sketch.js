// --- background colour ---
let bgColor;
// --- block colours ---
let blockColor; 

let tempoShapeSize;
let phase = 0; // progress through the pulse

function setup() {

  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();

}

function draw() {

  // Colour:
  // Sat + Brightness Fixed, Hue variable and opposite
  let mainHue = map(mouseX, 0, width,0, 300);
  let oppositeHue = map(mainHue, 0, 300, 300, 0); 

  bgColor = color(mainHue, 30, 100, 1);
  blockColor = color(oppositeHue, 40, 100, 0.7);  // < Slight Sat difference so it never dissapears

  background(bgColor);
  fill(blockColor);

  // Map mouseY to speed (higher = faster)
  // You can tweak these min/max speeds:
  let speed = map(mouseY, height*0.85, height*0.15, 0.003, 0.05); 
  speed = constrain(speed, 0.002, 0.2);
  
  // Advance the phase based on speed
  phase += speed;
  if (phase > 1) phase -= 1; // wrap around smoothly
  
  // Use phase to drive size (0..1 repeating)
  let tempoShapeSize = map(sin(phase * TWO_PI), -1, 1, height*0.3, height*0.4);
  
  circle(width * 0.5, height * 0.5, tempoShapeSize);
  
    
}

// ---------- RESIZE ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}