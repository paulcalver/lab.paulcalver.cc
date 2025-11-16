/*
  This is a simple sketch you can use to compare each oscillator wave type
  Simply change the wave type to test out one wave at a time
  The hue of the pixel in the image underneath the mouse drive frequency
  The brightness drives amplitude
*/

let audioContextOn = false;

let oscillate, fft;

let img;

let mouseColor;

function preload(){
  //"Gradient_color_wheel.png"
  //"hsb_Color_gradient.jpeg"
  img = loadImage("hsb_Color_gradient.jpeg");
}

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER);

  img.resize(width,height);
  mouseColor = color(255);//initialize to white

  //user must start audio context
  getAudioContext().suspend();

  //////////////////CHANGE HERE///////////////////

  //Wave types: "sine", "triangle", "sawtooth", "square"
  oscillate = new p5.Oscillator("sine");
  // Change the wave type of the osc to test  e.g.  oscilate = new p5.Oscillator("triangle");

  ///////////////////////////////////////////////


  fft = new p5.FFT();

}

function draw() {
  background(255);
  fill(0);
  strokeWeight(2);

  if(audioContextOn){

    image(img, 0, 0, img.width, img.height);

    if(mouseX <= width && mouseX >=0 && mouseY <= height && mouseY >=0){
      mouseColor = img.get(mouseX,mouseY);
    }else{
      mouseColor = color(0);
    }
    
    fill(mouseColor);
    rect(mouseX,mouseY-30,30,30);

    let h = hue(mouseColor);
    let b = brightness(mouseColor);
    console.log(h,b);
  
    // change oscillator frequency based on hue
    let frequency = map(h, 0, 360, 40, 440,true);
    oscillate.freq(frequency,0.1);//smooth the transitions by 0.1 seconds

    // change oscillator amplitude based on brightness
    let amplitude = map(b, 0, 100, 0, 1,true);
    oscillate.amp(amplitude, 0.1);//smooth the transitions by 0.1 seconds

    let waveform = fft.waveform(); // analyze the waveform
  
    //x and y position to translate to, and third param is the waveform array
    drawWaveForm(width*0.25,height/2,waveform);

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
  
  fill(0,255,0);
  circle(0,0,10);//origin after translate at 0,0
  fill(0);
  text("0,0",-20,-5);
  
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