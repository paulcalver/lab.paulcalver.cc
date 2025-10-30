/*

We load in some sound file clips. Then make a copy of the sound buffer to create an
array of sounds to drive some generative graphics. 

We splice/remove elements from any position in our array when the sound file has finished playing.
So it's important to loop backwards through our array to do that!

Inspired by https://patatap.com/

Loading in a sound file
https://p5js.org/reference/#/p5.SoundFile

FFT analysis 
https://p5js.org/reference/#/p5.FFT

*/

let audioContextOn = false;

let fft;

let clip1, clip2, clip3;
let sounds = [];

function preload() {
  soundFormats('mp3', 'ogg');
  clip1 = loadSound('dog.mp3');
  clip2 = loadSound('jdee_beat.mp3');
  clip3 = loadSound('rooster.mp3');
}

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER);

  fft = new p5.FFT(0.8,256); //0.8 smoothing, diving frequency into 256 bins 
  fft.setInput();//if no input is set, it will analyze all sound in the sketch
}

function draw() {

  background(255);

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


  //Challenge: don't draw the debug version of the fft + waveform
  //try and use them to make your custom sound shapes look more interesting


  //note we are looping backwards through our array so we can splice element out of it
  for (let i = sounds.length - 1; i >= 0; i--) {
    let sound = sounds[i];
    // let volume  
    //if the sound clip has reached the end
    if (sound.currentTime() >= (sound.duration()- 0.5) ){
      sound.stop();
      sounds.splice(i, 1);//remove / splice it from the array
    }else{
      drawSoundShape(sound.file,sound.currentTime(),sound.duration());
    }
  }


  //Frame Rate slowing down??
  //make sure you haven't accidentally changed something so your sounds
  //array keeps getting bigger and bigger and bigger
  console.log("How Many Sound do I have ?" + sounds.length);

  fill(0);
  text("Press q w or e to play",width/2,20);
  text(round(frameRate(),2),width/2,40);

  

}

function keyPressed(){

  let clip = false;

  if(key == 'q'){
    clip = clip1;
  }

  if(key == 'w'){
    clip = clip2;
  }
  
  if(key == 'e'){
    clip = clip3;
  }

  //the joys of javascript, you can change type of a variable as you go!!
  if(clip != false){
    //copy over the buffer of our sound file to a new soundFile object
    let audioCopy = new p5.SoundFile();
    let buffCopy = new Float32Array(clip.buffer.length); 
    clip.buffer.copyFromChannel(buffCopy, 0);
    audioCopy.setBuffer([buffCopy]);

    //slow down and speed up our playback rate, note if you do negative it reverses 
    //but code in draw will not work as currentTime goes backward, you'd need to re-factor the code
    //https://p5js.org/reference/#/p5.SoundFile/rate
    audioCopy.rate(random(0.1,1.5));

    //play our file
    audioCopy.play();

    //little hack to copy over the file name to use to customise shapes
    audioCopy.file = clip.file;
    // console.log(clip.file,audioCopy.file);

    //push our copied sound into array
    sounds.push(audioCopy);

  }

}

// use the current time and duration to affect our shape
// CHALLENGE: 
// - introduce some noise so each shape looks slightly different 
// - use the fft off all the sounds to change the shape
// - try use a custom shape (e.g. noisy circles activity week 4)
function drawSoundShape(soundFileName,currentTime,duration){
  push();

  let size = map(currentTime,0,duration,0,width);
  let color = map(currentTime,0,duration,100,255);

  noFill();

  //do different drawing for different sound files
  if(soundFileName == "dog.mp3"){
    strokeWeight(2);
    stroke(color,0,0);

    circle(width/2,height/2,size);
  }else if(soundFileName == "jdee_beat.mp3"){
    strokeWeight(4);
    stroke(color,color,0);

    rectMode(CENTER);
    rect(width/2,height/2,size,size);
  }else{
    //default styling for all other sounds
    strokeWeight(3);
    stroke(100,0,color);

    circle(width/2,height/2,size);
  }
 

  pop();
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