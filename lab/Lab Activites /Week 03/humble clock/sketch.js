//declare our global variables
let centerX;
let centerY;
let radius;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //make sure you do this to work with degrees!
  angleMode(DEGREES);

  //assign our variables values
  centerX = width / 2;
  centerY = height / 2;
  radius = width / 3;
}

function draw() {
  background(220);

  //clock face
  noStroke();
  fill(255);
  //diameter is radius multiplied by 2
  circle(centerX, centerY, radius * 2);
  strokeCap(SQUARE);

  //secondAngle in degrees
  let secondAngle = map(second(), 0, 60, -90, 270);
  let minuteAngle = map(minute(), 0, 60, -90, 270);
  let hourAngle = map(hour() % 12, 0, 12, -90, 270);

  let hourColour = 'blue';
  let minuteColour = 'green';
  let secondColour = 'red';

  //minute hand
  clockHand(secondAngle, 0.9, 2, secondColour);
  clockHand(minuteAngle, 0.75, 4, minuteColour);
  clockHand(hourAngle, 0.5, 8, hourColour);

  //arcs for seconds, minutes, hours
  noFill();
  //seconds arc
  stroke(secondColour);
  strokeWeight(2);
  arc(centerX, centerY, radius*1.92,radius*1.92, -90, secondAngle);
  // minutes arc
  stroke(minuteColour);
  strokeWeight(4);
  arc(centerX, centerY, radius*1.65, radius*1.65, -90, minuteAngle);
  // hours arc
  stroke(hourColour);
  strokeWeight(8);
  arc(centerX, centerY, radius*1.2, radius*1.2, -90, hourAngle);


}

function clockHand(angle, lengthFactor, weight, col) {
  let cosAngle = cos(angle);
  let sinAngle = sin(angle);
  let handX = centerX + (radius * lengthFactor * cosAngle);
  let handY = centerY + (radius * lengthFactor * sinAngle);
  strokeWeight(weight);
  stroke(col);
  line(centerX, centerY, handX, handY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}