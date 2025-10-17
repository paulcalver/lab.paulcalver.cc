function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  angleMode(DEGREES);
  fill(0,0,0,255);
}

function draw() {
  background(220);

  let x = noise (frameCount * 0.01) * width;
  let y = noise (frameCount * 0.01 +1000) * height;
  
  
  ellipse(x, y, 100,100);


}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
