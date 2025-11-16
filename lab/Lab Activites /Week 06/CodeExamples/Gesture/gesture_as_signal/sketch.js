
let averagingAmt = 0.1;//change this to 1 or 0.9 to see it keep up with the mouse
let curx = 0.0;
let cury = 0.0;

let timer;
let timerStart;
let duration = 12000;


function setup() {
  createCanvas(600, 600);
  
  background(0);

  timerStart = millis();

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

  if(mouseIsPressed && (cury > height*0.3)){
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
  

  //visualise changes in speed as 1 dimensional line in time
  timer = millis() - timerStart;

  let ex = map(timer,0,duration,0,width);
  let ey = map(magnitude,0,100,height*0.25,height*0.03,true);

  fill(255);
  noStroke();
  ellipse(ex, ey, 4, 4);

  if(timer >= duration){
    fill(0);
    rect(0,0,width,height*0.3);
    timerStart = millis();
  }


}