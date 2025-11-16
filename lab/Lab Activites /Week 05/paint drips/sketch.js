
let numRaindrops = 20; // total number of raindrops

let x = [];
let y = [];
let size = [];
let speed = [];
let r = [];
let g = [];
let b = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  for (let i = 0; i < numRaindrops; i++) {
    x[i] = random(width);
    y[i] = random(-500, -50);
    size[i] = random(10, 50);
    speed[i] = random(2, 10);
    r[i] = random(0, 255);
    g[i] = random(0, 255);
    b[i] = random(0, 255);

  }

}

function draw() {
  background(0);
  for (let i = 0; i < numRaindrops; i++) {
    fill(r[i], g[i], b[i],255);
    myShape(x[i], y[i], size[i]);
    y[i] += speed[i];
    if (y[i] > height) {
      x[i] = random(width);
      y[i] = random(-200, -50);
      size[i] = random(10, 50);
      speed[i] = random(2, 10);
      r[i] = random(0, 255);
      g[i] = random(0, 255);
      b[i] = random(0, 255);
    }
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function myShape(x, y, size) {

  let tWidth = map(y,0,height,size/2,0);
  let circleSize = map(y,0,height,size,0);
  circle(x, y, circleSize);
  triangle(x - tWidth, 0, x + tWidth, 0, x, y);

}

function keyPressed() {


}
