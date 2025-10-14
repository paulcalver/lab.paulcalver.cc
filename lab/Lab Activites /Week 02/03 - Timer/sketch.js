// Step 1: Globals
let startTime = 0;      // when the current run started
let elapsedTime = 0;    // total time accumulated (ms)
let timerIsRunning = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(20);
  textAlign(CENTER, CENTER);
  startTime = millis();
}

function draw() {
  
  if (timerIsRunning) {
    // while running, keep updating elapsed time
    elapsedTime = millis() - startTime;
    background(0, 200, 0); // green
  } else {
    // while paused, elapsedTime stays fixed
    background(200, 0, 0); // red
  }

  fill(255);
  noStroke();
  text(`Time Passed = ${(elapsedTime / 1000).toFixed(3)} sec`, width / 2, height / 2);
}

function mouseClicked() {

  timerIsRunning = !timerIsRunning;

  if (timerIsRunning) {
    startTime = millis() - elapsedTime;
  } 
}