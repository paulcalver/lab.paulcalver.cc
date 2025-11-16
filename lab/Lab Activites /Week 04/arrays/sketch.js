let circleSize = [];
let positionX = [];
let positionY = [];
let velocityX = [];
let velocityY = [];
let numCircles;
let fillColor = [];
let maxSpeed = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  numCircles = int(random(1, 1000));
  for (let i = 0; i < numCircles; i++) {
    let size = random(10, 100);
    circleSize.push(size);
    positionX.push(random(size/2, width - size/2));
    positionY.push(random(size/2, height - size/2));
    velocityX.push(random(-maxSpeed, maxSpeed)); // Random horizontal speed
    velocityY.push(random(-maxSpeed, maxSpeed)); // Random vertical speed
    //fillColor.push(color(random(150,255), random(255), random(255), 100));
    fillColor.push(color(random(150,255), 100));
  }
}

function draw() {
  background(0);
  //fill(255,100);
  
  for (let i = 0; i < positionX.length; i++) {
    // Update positions
    positionX[i] += velocityX[i];
    positionY[i] += velocityY[i];
    
    let radius = circleSize[i] / 2;
    
    // Bounce off edges using circle radius
    if (positionX[i] - radius < 0 || positionX[i] + radius > width) {
      velocityX[i] *= -1;
    }
    if (positionY[i] - radius < 0 || positionY[i] + radius > height) {
      velocityY[i] *= -1;
    }
    
    // Keep circles within bounds using radius
    positionX[i] = constrain(positionX[i], radius, width - radius);
    positionY[i] = constrain(positionY[i], radius, height - radius);

    fill(fillColor[i]);
    
    circle(positionX[i], positionY[i], circleSize[i]);
  }
}

function mousePressed() {
  numCircles = int(random(1, 5000));
  
  // Clear all arrays
  positionX = [];
  positionY = [];
  velocityX = [];
  velocityY = [];
  circleSize = [];
  fillColor = [];
  
  // Repopulate arrays with new number of circles
  for (let i = 0; i < numCircles; i++) {
    let size = random(10, 100);
    circleSize.push(size);
    positionX.push(random(size/2, width - size/2));
    positionY.push(random(size/2, height - size/2));
    velocityX.push(random(-maxSpeed, maxSpeed));
    velocityY.push(random(-maxSpeed, maxSpeed));
    //fillColor.push(color(random(255), random(255), random(255), 100));
    fillColor.push(color(random(150,255), 100));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
