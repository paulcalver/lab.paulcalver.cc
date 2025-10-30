
let numRaindrops = 500; // total number of raindrops
let x = [];
let y = [];
let size = [];
let speed = [];
let h = [];
let s = [];
let b = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  colorMode(HSB);
  for (let i = 0; i < numRaindrops; i++) {
    x[i] = random(width);
    y[i] = random(-500, -50);
    size[i] = random(5, 15);
    speed[i] = random(2, 5);
    h[i] = random(200, 205);
    s[i] = random(70, 90);
    b[i] = random(70, 100);
  }
  
}

function draw() {
  background(200,20,100);
  for (let i = 0; i < numRaindrops; i++) {
    fill(h[i], [i], b[i]);
    ellipse(x[i], y[i], size[i], size[i] * 2);
    y[i] += speed[i];
    if (y[i] > height) {
      y[i] = random(-200, -50);
      x[i] = random(width);
      size[i] = random(5, 15);
      speed[i] = random(2, 5);
      h[i] = random(200, 205);
      s[i] = random(70, 90);
      b[i] = random(70, 100);
    }
  }
 
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
