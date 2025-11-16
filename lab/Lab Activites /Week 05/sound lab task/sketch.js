/*
Loading in a sound file
https://p5js.org/reference/p5.sound/p5.SoundFile/

Sound File:
First sound every recorded in 1860. Recorded on a Phonautograph.
https://en.wikipedia.org/wiki/Phonautograph
https://www.youtube.com/playlist?list=PLy5nynGqE9jNdrKswEjr81obPhGAHgMFm
*/

let sound;
let amplitude;

//new function 
//this runs first, it runs once
function preload() {
  soundFormats('mp3', 'ogg');
  sound = loadSound('Edouard-Leon-Scott-de-Martinville.ogg');
}

//setup wait for preloading to be done
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER);

  sound.setLoop(true);
  amplitude = new p5.Amplitude();
  amplitude.setInput(sound);
}

function draw() {
  background(0);

  fill(255);
  text("Click to Play & Pause",width/2,20);
  let level = amplitude.getLevel();
  console.log(level);

  let circleSize = map(level,0,1,20,height);
  let circleColour = map(level,0,1,0,255);

  //visulise the current time 
  let timePosition = map(sound.currentTime(),0,sound.duration(),0,width);
  
  fill(circleColour,100,200);
  circle(width/2,height/2,circleSize);
  
}

function mousePressed(){
  //as there is user interaction to play this works
  if(!sound.isPlaying()){
    sound.play();
  }else{
    sound.pause();
    // sound.stop();
  }
}
