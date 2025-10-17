animationLoop = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  //rectMode(CENTER);
  frameRate(15);
  //noLoop();
}

function draw() {
  background(255,0,0);
  noStroke();
 
  let num = 480;
  let y = 0;
  let w = width/(num);
  let h = height;
  let x = 0;

  for (let i = 0; i < num; i++) {
    fill(random(255), random(255), random(255));
    rect(x, y, w, h);
    x += w;
  }


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
