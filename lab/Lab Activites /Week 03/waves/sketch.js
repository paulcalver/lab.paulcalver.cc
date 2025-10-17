let t = 0;
let pendulumLength = 600;
let maxAngle = 40; // Maximum swing angle in degrees

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  angleMode(DEGREES);
  fill(0,0,0,255);
}

function draw() {
  background(220);
  
  // Pendulum pivot point at top center
  let pivotX = width/2;
  let pivotY = 100;
  
  // Calculate pendulum angle using sine wave for smooth oscillation
  let angle = sin(t) * maxAngle;
  
  // Convert angle to x,y position
  let x = pivotX + sin(angle) * pendulumLength;
  let y = pivotY + cos(angle) * pendulumLength;
  
  // Draw pendulum string
  stroke(0);
  strokeWeight(2);
  //line(pivotX, pivotY, x, y);
  
  // Draw pendulum bob (circle)
  noStroke();
  fill(0, 0, 0, 255);
  ellipse(x, y, 50, 50);
  
  // Draw pivot point
  fill(255, 0, 0);
  //ellipse(pivotX, pivotY, 10, 10);
  
  t += 1; // Control speed of pendulum
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);  
}