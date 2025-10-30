/*
  This is a simple sketch you can use to compare each oscillator wave type
  Simply change the wave type to test out one wave at a time
  Your mouse movement will change the frequency and amplitude of the oscillator
*/

let audioContextOn = false;

let fft;// for analysing waveform

let oscillate;
let oscillate2;



function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER);

  //user must start audio context
  getAudioContext().suspend();
  fft = new p5.FFT();

  //////////////////CHANGE HERE///////////////////

  //Wave types: "sine", "triangle", "sawtooth", "square"
  oscillate = new p5.Oscillator("sine");

  oscillate.freq(100);
  oscillate.amp(1);// volume

  ///////////////////////////////////////////////
  
    //Wave types: "sine", "triangle", "sawtooth", "square"
  oscillate2 = new p5.Oscillator("sawtooth");

  oscillate2.freq(200);
  oscillate2.amp(1);// volume

}

function draw() {
  background(255);
  fill(0);
  strokeWeight(2);

  if(audioContextOn){
   
    let wave = fft.waveform(); // analyze the waveform
  
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
    oscillate.start();
    oscillate2.start();
  }
}

//Using curveVertex for a smooth wave
function drawWaveForm(ox,oy,wave)
{
  let spacingX = (width*0.5)/wave.length;
  let waveAmplitude = 100;

  push();
  
  translate(ox,oy);
  
  fill(0,255,0);
  circle(0,0,10);//origin after translate at 0,0
  fill(0);
  text("0,0",-20,-5);
  
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