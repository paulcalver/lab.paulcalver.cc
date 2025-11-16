/*
Loading in a video file
https://p5js.org/reference/p5/createVideo/ 

For all video functionality:
https://p5js.org/reference/p5/p5.MediaElement/ 

Clip:
first known film with live-recorded sound 1890s
Dickson Experimental Film School + Thomas Edison
https://en.wikipedia.org/wiki/The_Dickson_Experimental_Sound_Film 
*/

let audioContextOn = false;

let isLoaded = false;
let isLooping = false;
let isPlaying = false;

let fft;

let videoClip;

function setup() {
  createCanvas(400, 300);
  textAlign(CENTER);

  getAudioContext().suspend();

  fft = new p5.FFT(0.8,256); //0.8 smoothing, diving frequency into 256 bins 

  // videoLoaded is a function that gets called when the video is loaded
  videoClip = createVideo("DicksonFilmClip_Sound.mp4", videoLoaded);

}

function draw() {
  if(isLooping){
    background(150);
  }else{
    background(250);
  }
  fill(0);

  if(isLoaded){

    text("Click to Play & Pause",width/2,20);

    let timePosition = map(videoClip.time(),0,videoClip.duration(),0,width);
    circle(timePosition,60,30);


    //fft analysis, spectrum is an array frequency bins
    let spectrum = fft.analyze();
    drawSpectrum(spectrum);

    //central frequency of all frequency bins 
    //must do spectrum analysis (above) first
    let spectralCentroid = fft.getCentroid();
    plotCentroid(spectralCentroid,spectrum.length);

    //waveform from fft analysis, amplitude values along the time domain
    let wave = fft.waveform(); 

    //x and y position to translate to, and third param is numVertices
    drawWaveForm(width*0.25,height*0.5,wave);

  }else{
    text("Loading...",width/2,20);
  }

}

function keyPressed(){
  if(isPlaying){

    if(key == 'l'){
      isLooping = !isLooping;
      videoClip.loop(isLooping);
    }

  }
}

function mousePressed(){
  if(!isPlaying){
    videoClip.play();
    isPlaying = true;
  }else{
    isPlaying = false;
    videoClip.pause();
  }

  if(!audioContextOn){
    audioContextOn = true;
    userStartAudio();
  }
}

function videoLoaded(){
  isLoaded = true;
  videoClip.size(width,(width/videoClip.width)*videoClip.height);
  // videoClip.hide();//uncomment to hide video element below

  //start fft once the video is loaded
  fft.setInput(videoClip);
}

//pass in spectrum centroid and the length of spectrum array
function plotCentroid(centroid,spectrumLength){
  push();

  //https://en.wikipedia.org/wiki/Nyquist_frequency
  let nyquist = 22050;

  // the mean_freq_index calculation is for the display.
  let mean_freq_index = centroid/(nyquist/spectrumLength);

  let centroidplot = map(mean_freq_index, 0, spectrumLength, 0, width);

  noStroke();
  fill(255,0,0); // the line showing where the centroid is will be red
  rect(centroidplot, 0, width / spectrumLength, height);

  pop();
}

//pass in spectrum array
function drawSpectrum(spectrum){
  push();

  noStroke();
  fill(255, 0, 255);
  for (let i = 0; i< spectrum.length; i++){
    let x = map(i, 0, spectrum.length, 0, width);
    let h = height - map(spectrum[i], 0, 255, height, 0);
    rect(x, height-h, width / spectrum.length, h );
  }

  pop();
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