/*
Loading in a sound file
https://p5js.org/reference/#/p5.SoundFile

FFT analysis 
https://p5js.org/reference/#/p5.FFT

Sound File:
First sound every recorded in 1860. Recorded on a Phonautograph.
https://en.wikipedia.org/wiki/Phonautograph
https://www.youtube.com/playlist?list=PLy5nynGqE9jNdrKswEjr81obPhGAHgMFm
*/

let audioContextOn = false;

let fft;

let firstSound;

function preload() {
  soundFormats('mp3', 'ogg');
  firstSound = loadSound('Edouard-Leon-Scott-de-Martinville.ogg');
}

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER);

  fft = new p5.FFT(0.8,256); //0.8 smoothing, dividing frequency into 256 bins 
  fft.setInput(firstSound);
}

function draw() {

  if(firstSound.isLooping()){
    background(0,255,0);
  }else{
    background(255);
  }

  fill(0);
  text("Click to Play & Pause",width/2,20);

  // move a sphere across as the sound plays
  let timePosition = map(firstSound.currentTime(),0,firstSound.duration(),0,width);
  circle(timePosition,60,30);
  // console.log(firstSound.currentTime());//actual time in seconds, minutes etc.

  //fft analysis, spectrum is an array of frequency bins
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


  

}

function keyPressed(){
  if(firstSound.isPlaying()){

    if(key == 'l'){
      let toggle = !firstSound.isLooping();
      firstSound.setLoop(toggle);
    }

    if(key == 'r'){
      let randomplace = random(firstSound.duration());
      firstSound.jump(randomplace);
    }

  }
}

function mousePressed(){
  if(!firstSound.isPlaying()){
    firstSound.play();
  }else{
    firstSound.pause();
    // firstSound.stop();
  }
}

//pass in spectrum centroid and the length of spectrum array
function plotCentroid(centroid,spectrumLength){
  push();

  //https://en.wikipedia.org/wiki/Nyquist_frequency
  let nyquist = 22050;

  // the mean_freq_index calculation is for the display.
  let mean_freq_index = centroid/(nyquist/spectrumLength);

  centroidplot = map(mean_freq_index, 0, spectrumLength, 0, width);

  noStroke();
  fill(255,0,0); // the line showing where the centroid is will be red
  rect(centroidplot, 0, width / spectrumLength, height)

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