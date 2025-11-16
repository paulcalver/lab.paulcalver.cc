/*
 This sketch uses the average color of the camera to create a theremin-like effect where 
 the distance of your hand from the webcam / the blocking of all light will affect sound.

 Average Brightness drives the amplitude and saturation the frequency of the oscillator. 

 For finer control, try and use a physical computing distance sensor or light sensor instead.

 Try and make this sound more interesting by using some additivie synthesis.
*/

let audioContextOn = false;

let oscillate, fft;

//const means a contstant value, you cannot reset the value later in the sketch
const VID_WIDTH = 320;
const VID_HEIGHT = 240;
const PIXEL_JUMP = 20;

let video;

let numSampledPix;

let avgHue;
let avgBrightness;
let avgSat;

function setup() {
  createCanvas(600, 600);
  textAlign(CENTER);

  video = createCapture(VIDEO);
  video.size(VID_WIDTH,VID_HEIGHT);
  // The above function actually makes a separate video
  // element on the page.  The line below would hide it 
  video.hide();

  //we don't sample all the pixels in our incoming video
  numSampledPix = (VID_WIDTH/PIXEL_JUMP) * (VID_HEIGHT/PIXEL_JUMP);

  //user must start audio context
  getAudioContext().suspend();

  //Wave types: "sine", "triangle", "sawtooth", "square"
  oscillate = new p5.Oscillator("sine");
 
  //do fft analysis on all sound in the sketch
  fft = new p5.FFT();

}

function draw() {
  background(220);
  fill(0);
  text(round(frameRate(),2),width - 20,20);

  if(audioContextOn){

    video.loadPixels();

    count = 0;
    avgHue = 0;
    avgBrightness = 0;
    avgSat = 0;

    noStroke();

    for(let x = 0; x < VID_WIDTH; x+=PIXEL_JUMP){
      for(let y = 0; y < VID_HEIGHT; y+=PIXEL_JUMP){
      
        let pixIndex = ((y*VID_WIDTH)+x)*4;

        //read the values out of the pixel array
        let r = video.pixels[pixIndex];
        let g = video.pixels[pixIndex+1];
        let b = video.pixels[pixIndex+1];

        //we switch between color modes to work with HSB versus RGB
        colorMode(RGB,255);
        let c = color(r,g,b);

        fill(r,g,b);
        rect(x,y,PIXEL_JUMP,PIXEL_JUMP);

        //Add Hue Saturation and brightness 
        colorMode(HSB,100);
        avgHue += hue(c);
        avgBrightness += brightness(c);
        avgSat += saturation(c);
        
      }
    }


    //average of pixels sampled in nested for loop
    avgHue /= numSampledPix; 
    avgBrightness /= numSampledPix; 
    avgSat /= numSampledPix;

    // console.log(avgBrightness);

    fill(avgHue,avgSat,avgBrightness);
    rect(width*0.75,100,40,40);

  
    // change oscillator frequency based on avgBrightness
    let frequency = map(avgBrightness, 0, 100, 40, 880,true);
    oscillate.freq(frequency,0.1);//smooth the transitions by 0.1 seconds

    //change oscillator amplitude based on average Saturation
    let amplitude = map(avgSat, 0, 100, 0.01, 1,true);
    oscillate.amp(amplitude, 0.1);//smooth the transitions by 0.1 seconds

    let waveform = fft.waveform(); // analyze the waveform
  
    //x and y position to translate to, and third param is the waveform array
    drawWaveForm(width*0.25,height*0.75,waveform);

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
  }
}

//Using curveVertex for a smooth wave
function drawWaveForm(ox,oy,waveform)
{
  let spacingX = (width*0.5)/waveform.length;
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
  
  for (let i = 0; i < waveform.length; i++) {
    
    let vX = spacingX*i;
    let vY = waveform[i]*waveAmplitude;//value between -1 to 1 multiplied by height 
    
    //curve vertex in shape
    curveVertex(vX,vY);
    
  }
  endShape();
  
  pop();
}