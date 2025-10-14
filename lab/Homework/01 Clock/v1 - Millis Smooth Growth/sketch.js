
// let secCircleSize;
// let maxCircleSize;
// let padding = 50;

// function setup() {
//   createCanvas(windowWidth, windowHeight);
  
// }

// function draw() {
//   background(255);
//   noStroke();
//   fill(0);
//   maxCircleSize = width*0.6-(padding*2);

//   let now = new Date();
  
//   let hr = hour();
//   let min = minute();
//   let sec = second();
//   let mil = now.getSeconds() + now.getMilliseconds() / 1000;
  
//   text(nf(hr, 2) + ':' + nf(min, 2) + ':' + nf(sec, 2), 10, 20);
  
//   milCircleSize = map(mil, 0, 60, 0, maxCircleSize);
//   secCircleSize = map(sec, 0, 60, 0, maxCircleSize);
  
//   // Draw second circle
//   circle(width / 2, height*0.25, milCircleSize);
//   circle(width / 2, height*0.75, secCircleSize);
  
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }

let secCircleSize;
let maxCircleSize;
let padding = 50;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
}

function draw() {
  background(255);
  noStroke();
  
  maxCircleSize = width*0.6-(padding*2);

  let now = new Date();
  let hr = hour();
  let min = minute();
  let sec = second();
  let mil = now.getMilliseconds() / 1000;
  
  //text(nf(hr, 2) + ':' + nf(min, 2) + ':' + nf(sec, 2), 10, 20);
  
  milCircleSize = map(mil, 0, 1, 0, 50);
  secCircleSize = map(sec, 0, 60, 60, maxCircleSize);
  
  // Draw second circle
  fill(0);
  circle(width / 2, height*0.5, secCircleSize);
  fill(255,0,0);
  circle(width / 2, height*0.5, milCircleSize);
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
