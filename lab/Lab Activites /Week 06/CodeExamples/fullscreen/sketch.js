
let diameter;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //if you set variables in setup, you need to update in windowResized
  diameter = width / 6;
}

function draw() {
  background(255, 0, 0);

  //using width or height in draw will update graphics nicely
  circle(width / 2, height / 2, diameter);

}

//event listener function runs every time browser window resized
function windowResized() {
  //resize our canvas to the width and height of our browser window
  resizeCanvas(windowWidth, windowHeight);

  //update our variables
  diameter = width / 6;
}

function keyPressed() {
  //toggle fullscreen on or off
  if (key == 'f') {

    //get current full screen state https://p5js.org/reference/#/p5/fullscreen
    let fs = fullscreen();//true or false

    //switch it to the opposite of current value
    console.log("Full screen getting set to: " + !fs);
    fullscreen(!fs);
  }

}