
animationLoop = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  angleMode(DEGREES);
  fill(0,0,0,255);
  
}

function draw() {
  background(220);
  
  push();
  translate(width/2, height/2);
  for (let i = 0; i < 360; i+=10) {
    let length = width*1.2;
    rotate(12);
    length *= noise(i*0.1, frameCount*0.02);
    rect(0,0,length,10);
  }
  pop();  
}

function mousePressed() {
  if (animationLoop) {
    noLoop();
    animationLoop = false;
  } else {
    loop();
    animationLoop = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

