
let secCircleSize;
let minCircleSize;
let hrCircleSize;
let maxCircleSize;
let padding = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
}

function draw() {
  background(255);
  noStroke();
  fill(0);
  maxCircleSize = (height-(padding*2))/3;

  let hr = hour();
  let min = minute();
  let sec = second();

  text(nf(hr, 2) + ':' + nf(min, 2) + ':' + nf(sec, 2), 10, 20);

  secCircleSize = map(sec, 0, 60, 0, maxCircleSize);
  minCircleSize = map(min, 0, 60, 0, maxCircleSize);
  hrCircleSize = map(hr, 0, 24, 0, maxCircleSize);

  // Draw hour circle
  circle(width / 2, maxCircleSize/2+padding, hrCircleSize);
  
  // Draw minute circle
  circle(width / 2, maxCircleSize*1.5+padding, minCircleSize);
  
  // Draw second circle
  circle(width / 2, maxCircleSize*2.5+padding, secCircleSize);
  

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
