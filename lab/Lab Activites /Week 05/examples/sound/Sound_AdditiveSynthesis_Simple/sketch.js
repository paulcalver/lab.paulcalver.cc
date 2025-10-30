/*
 Simple additive synthesis to show that it works by adding multiple oscillator objects.

 Best to use the approach to use the examples that create an array of oscillator objects 
 for more complex sound scapes.
*/

let audioContextOn = false;

let sineOsc1, sineOsc2, triOsc, fft;


function setup() {
  createCanvas(800, 800);
  textAlign(CENTER);

  //user must start audio context
  getAudioContext().suspend();

  //Wave types: "sine", "triangle", "sawtooth", "square"
  sineOsc1 = new p5.Oscillator('sine');
  sineOsc2 = new p5.Oscillator('sine');
  triOsc = new p5.Oscillator('triangle');


  fft = new p5.FFT();

}

function draw() {
  background(255);
  fill(0);
  strokeWeight(2);

  if(audioContextOn){
  
    // change oscillator frequency based on mouseX
    let frequency1 = map(mouseX, 0, width, 40, 880,true);
    let frequency2 = map(mouseX, 0, width, 30, 200,true);
    sineOsc1.freq(frequency1,0.1);//smooth the transitions by 0.1 seconds
    sineOsc2.freq(frequency2, 0.1);
    triOsc.freq(frequency2*0.5,0.1);

    
    let amplitude = map(mouseY, 0, height, 1, 0.01,true);
    sineOsc1.amp(amplitude*0.3, 0.1);//smooth the transitions by 0.1 seconds 
    sineOsc2.amp(amplitude*0.3, 0.1);//smooth the transitions by 0.1 seconds
    triOsc.amp(amplitude*0.3, 0.1);//smooth the transitions by 0.1 seconds


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
    sineOsc1.start();
    sineOsc2.start();
    triOsc.start();
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