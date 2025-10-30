/*
  This example shows the modulation of the frequency of a wave using another wave. 

  The main settings to do that are all found in the setup. 

  EXAMPLE ADAPTED FROM:
  https://p5js.org/examples/sound-frequency-modulation.html
*/

let carrier; // this is the oscillator we will hear
let modulator; // this oscillator will modulate the frequency of the carrier

// the carrier frequency pre-modulation
let carrierBaseFreq = 220;

// min/max ranges for modulator
let modMaxFreq = 112;
let modMinFreq = 0;
let modMaxDepth = 150;
let modMinDepth = -150;

let audioContextOn = false;

let sineOsc1, sineOsc2, triOsc, fft;


function setup() {
  createCanvas(800, 800);
  textAlign(CENTER);

  //user must start audio context
  getAudioContext().suspend();

 
  carrier = new p5.Oscillator('sine');
  carrier.amp(1); // set amplitude
  carrier.freq(carrierBaseFreq); // set frequency

  // try changing the type to 'square', 'sine' or 'triangle'
  modulator = new p5.Oscillator('sawtooth');


  ///// DON'T MISS THIS (where the magic happens) //////

  // remove the modulators sound output
  modulator.disconnect();
  // add the modulator's output to modulate the carrier's frequency
  carrier.freq(modulator);

  //////////////////////////////////////////////////////

  fft = new p5.FFT();

}

function draw() {
  background(255);
  fill(0);
  strokeWeight(2);

  if(audioContextOn){
  
    // map mouseY to modulator freq between a maximum and minimum frequency
    let modFreq = map(mouseY, height, 0, modMinFreq, modMaxFreq);
    modulator.freq(modFreq);

    // change the amplitude of the modulator
    // negative amp reverses the sawtooth waveform, and sounds percussive
    
    let modDepth = map(mouseX, 0, width, modMinDepth, modMaxDepth);
    modulator.amp(modDepth);

    let wave = fft.waveform(); // analyze the waveform
  
    //x and y position to translate to, and third param is the waveform array
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
    modulator.start();
    carrier.start(); // start oscillating
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