
let averagingAmt = 0.1;//change this to 1 or 0.9 to see it keep up with the mouse
let curx = 0.0;
let cury = 0.0;


function setup() {
  createCanvas(600, 600);
  
  background(0);

}

function draw() {
  // horizontal and vertical displacement
  let dx = (mouseX - curx) * averagingAmt; 
  let dy = (mouseY - cury) * averagingAmt;

  //distance between curx and cury and new position
  let magnitude = dist(curx, cury, curx + dx, cury + dy);

  // update position we are using to draw
  curx = curx + dx;
  cury = cury + dy;

  // atan2 returns the angle in the plane (in radians) 
  //between the positive x-axis and the ray from (0, 0) to the point (x, y)
  //for atan2(y, x) 
  let angle = atan2(dy, dx);

  let drawScale = map(magnitude, 1, 50, 1.0, 4.0, true);

  if(mouseIsPressed){
    push();

    //translate all drawing
    translate(curx, cury);
  
    stroke(255,0,0);
    line(0, 0, dx, dy);//draw from origin to 
  
    //rotate by angle
    rotate(angle);

    scale(drawScale);
  
    noFill();
    stroke(255);
    triangle(0, -5, 10, 0, 0, 5);
  
    pop();
  }
  
}