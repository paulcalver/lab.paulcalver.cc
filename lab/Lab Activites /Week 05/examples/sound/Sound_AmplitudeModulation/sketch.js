/*
  This example shows the modulation of a wave using the aplitude of another wave. 

  The main settings to do that are all found in the setup. 

  EXAMPLE ADAPTED FROM:
  https://p5js.org/examples/sound-amplitude-modulation.html
*/


let audioContextOn = false;

let carrier; // this is the oscillator we will hear
let modulator; // this oscillator will modulate the amplitude of the carrier
let fft; // we'll visualize the waveform

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER);

  //user must start audio context
  getAudioContext().suspend();

  carrier = new p5.Oscillator(); // connects to master output by default
  carrier.freq(340);
  carrier.amp(0);
  // carrier's amp is 0 by default, giving our modulator total control

  modulator = new p5.Oscillator('triangle');
  modulator.freq(5);
  modulator.amp(1);

  ///// DON'T MISS THIS (where the magic happens) //////

  //try comment out or commenting in the following 3 lines 
  // to test / break / understand how the code
  // carrier.amp(1);//would just set the amplitude to 1

  //this means we do not hear the modulator wave 
  modulator.disconnect(); // disconnect the modulator from master output

  // Modulate the carrier's amplitude with the modulator
  // Optionally, we can scale the signal.
  carrier.amp(modulator.scale(-1, 1, 1, -1));

  //////////////////////////////////////////////////////

  // create an fft to analyze the audio
  fft = new p5.FFT();

}

function draw() {
  background(255);
  fill(0);
  strokeWeight(2);

  if(audioContextOn){
  
    // // map mouseY to moodulator freq between 0 and 20hz
    let modFreq = map(mouseY, 0, height, 20, 0);
    modulator.freq(modFreq);

    let modAmp = map(mouseX, 0, width, 0, 1);
    modulator.amp(modAmp, 0.01); // fade time of 0.1 for smooth fading

    // analyze the waveform
    let wave = fft.waveform();

    //x and y position to translate to, and third param is numVertices
    drawWaveForm(width*0.25,height/2,wave);

  }else{
    text("Click to Start", width/2,height/2);
  }


}

function mousePressed(){
  //start audio context on mouse press
  if(!audioContextOn){
    audioContextOn = true;
    userStartAudio();

    //start all of your audio processes
    carrier.start();
    modulator.start();
  }
}

//Using curveVertex for a smooth wave, pass in waveform array
function drawWaveForm(ox,oy,wave)
{
  let spacingX = (width*0.5)/wave.length;
  let waveAmplitude = 100;

  push();
  
  translate(ox,oy);
  
  fill(0);
  circle(0,0,10);//origin after translate at 0,0
  fill(0);
  text("0,0",-20,-5);

  stroke(0);
  strokeWeight(2);
  
  noFill();
  beginShape();
  
  for (let i = 0; i < wave.length; i++) {
    
    let vX = spacingX*i;
    let vY = wave[i]*waveAmplitude;//value between -1 to 1 multiplied by height 
    
    //curve vertex in shape
    curveVertex(vX,vY);
    
  }
  endShape();
  
  pop();
}