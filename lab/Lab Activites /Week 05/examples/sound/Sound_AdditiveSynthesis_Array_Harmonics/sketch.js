/*
  Additive Synthesis using an array of oscillators. Using harmonic sounds.

  We splice/remove elements from any position in our array when the oscillator has finished
  its 5 second cycle. So it's important to loop backwards through our array to do that!

*/

let audioContextOn = false;

let oscillators = [];
let fft;

let harmonicLevel = 1;

//we multiply the base frequency by a value to get a scale of harmonic sounds
let harmonics = 10; // we will use this number to get up to 9 harmonic sounds
const BASE_FREQ = 110;

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER);

  //user must start audio context
  getAudioContext().suspend();

  fft = new p5.FFT();

}

function draw() {
  background(255);
  fill(0);
  strokeWeight(2);

  if(audioContextOn){
  
    //note we are looping backwards through our array so we can splice element out of it
    for (let i = oscillators.length - 1; i >= 0; i--) {
      let o = oscillators[i];
      let volume = o.amp().value;//get amplitude/volume 
      //if the osc has reached the top of its volume
      if (volume >= 1){
        o.amp(0, 5);//return amp to 0 over 5 secs
      } else if (volume <= 0) {
        //if its reached 0, stop it and get rid of it.
        o.stop();
        oscillators.splice(i, 1);//remove / splice it from the array
      }
    }


    let wave = fft.waveform(); // analyze the waveform

    //x and y position to translate to, and third param is numVertices
    drawWaveForm(width*0.25,height/2,wave);

  }else{
    text("Click to Start, Press r for a randomised sound", width/2,height/2);
  }


}

//change this think about ways to make more complex
function keyPressed(){

  if(key == 'r'){
    //get a randomised harmonic sound, higher numbers will result in higher frequency
    let f = BASE_FREQ * int(random(1,harmonics));
    let o = new p5.Oscillator("sine");
    o.freq(f);
    o.amp(0);
    o.amp(1, 5);//get the amplitude to reach 1 over 5 secs
    o.start();
    oscillators.push(o);//add our oscilattor to our array of oscillators
    // console.log(oscillators.length, f);
  }

  // a more controlled way to go through the harmonics
  if(keyCode == UP_ARROW && harmonicLevel < 9){
    harmonicLevel++;
    console.log(harmonicLevel);
  }

  if(keyCode == DOWN_ARROW && harmonicLevel > 1){
    harmonicLevel--;
    console.log(harmonicLevel);

  }

  if(keyCode == SHIFT){
    let f = BASE_FREQ * harmonicLevel;
    let o = new p5.Oscillator("sine");
    o.freq(f);
    o.amp(0);
    o.amp(1, 5);//get the amplitude to reach 1 over 5 secs
    o.start();
    oscillators.push(o);//add our oscilattor to our array of oscillators
    // console.log(oscillators.length, f); 
  }

}

function mousePressed(){
  //start audio context on mouse press
  if(!audioContextOn){
    audioContextOn = true;
    userStartAudio();

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