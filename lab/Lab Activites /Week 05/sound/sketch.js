/*
Whenever you use p5.sound you should always make sure that the user is starting the audio context so the code works in ALL browsers and in ALL environments (not just on the p5 editor!)

Example using the micrphone: 

https://p5js.org/reference/p5.sound/p5.AudioIn/
*/

let audioContextOn = false;
let mic;


function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER);
  noStroke();

  //suspend audio context because it won't be able to start until the user starts it in VS Code
  getAudioContext().suspend();


  mic = new p5.AudioIn();

}

function draw() {

  if (audioContextOn) {
    background(0, 15);


    //Add in code here

    let curVol = mic.getLevel();
    //console.log(curVol);

    currentVolume = mic.getLevel();
    let circleSize = map(currentVolume, 0, 1, 100, 800);
    //console.log(currentVolume);

    // let rectangleSize = map(curVol,0,1,30,100);

    if (curVol < 0.2) {
      //circle(width / 2, height / 2, circleSize);
      circle(width / 2, height / 2, circleSize);

    } else {
      fill(255, 0, 0);
      rectMode(CENTER);
      rect(width / 2, height / 2, circleSize, circleSize);
    }

    fill(255);
    text("Audio Context is Ready", width / 2, height - 20);

  } else {

    background(255);
    fill(0);
    text("Click and Sing", width / 2, height / 2);

  }


}

function mousePressed() {
  //user starts audio on mouse pressed
  if (!audioContextOn) {
    audioContextOn = true;
    userStartAudio();// start audio context

    mic.start();

  }
}