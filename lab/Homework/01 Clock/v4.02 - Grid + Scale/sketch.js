
let rows = 60;
let cols = 60;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
}

function draw() {
  
  // Alpha pulse every second
  let tPulse = millis() / 1000;                
  let s = (sin(TWO_PI * tPulse) + 1) * 0.5;
  s = pow(s, 20)     
  let alpha = lerp(255, 50, s);
  
  // Noise increasing over each minute
  let cycleTime = millis() % 60000;
  let phase = cycleTime / 60000; // 0 to 1 over the minute
  let easedPhase = easeInExpo(phase);       // 0..1 eased
  let shaped = pow(easedPhase, 4.0); 
  let noiseScale = lerp(0.1, 20, shaped);
  
  // Scale
  let scaleEased = easeInSine(phase);
  let scale = lerp(10,0.001, scaleEased);
  
  background(0);
  
  let gridSize = height * 0.7;
  //let scale = map((cycleTime), 0, 60000, 4.0, 0.01);
  let blockSize = gridSize / rows * scale; // rounded to make sure each block is sharp
  let padding = 1;
  let spacing = blockSize + padding;
  
  // Centering 
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;
  
  
  // Noise
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let bx = startX + j * spacing;
      let by = startY + i * spacing;
      
      // Colour with hue noise
      let t = (cycleTime / 1000) * noiseScale;
      let r = noise(i * 0.05, j * 0.05, t) * 255;
      let g = noise(i * 0.05 + 100, j * 0.05 + 100, t) * 255;
      let b = noise(i * 0.05 + 200, j * 0.05 + 200, t) * 255;
      fill(r, g, b, alpha);
      
      rect(bx, by, blockSize, blockSize);
    }
  }
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function easeInSine(x) {
  return 1 - cos((x * PI) / 2);
}
function easeInExpo(x) {
  return x === 0 ? 0 : pow(2, 10 * (x - 1));
}