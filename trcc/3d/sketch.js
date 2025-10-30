function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(0);
  push();
  rotateY(radians(frameCount / 2));
  //rotateX(radians(frameCount / 2));
  //noFill();
  //stroke(240, 240, 240, 100);
  strokeWeight(1);
  sphere(200);
  pop();

  push();
  rotateY(radians(-frameCount / 2));
  translate(-250, 0, 0);
  //rotateX(radians(-frameCount / 2));
  //noFill();
  noStroke();
  box(300, 100, 100);
  pop();
}