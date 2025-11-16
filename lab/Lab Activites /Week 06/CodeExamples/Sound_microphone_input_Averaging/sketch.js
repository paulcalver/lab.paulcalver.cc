let mic;
let curVol;

let threshold = 0.1;

let averagingAmount = 0.1;//how much of the new volume we will use

let audioContextOn = false;

let timer;
let timerStart;
let duration = 12000;

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER);

  getAudioContext().suspend();

  curVol = 0;

  mic = new p5.AudioIn();
  mic.start();

}

function draw() {

  if(audioContextOn){

    // getLevel() gives volume (between 0 and 1.0)
    let newVol = mic.getLevel() * averagingAmount;
    
    // 1 - averaging amount is a way to take the opposite percentage 
    // e.g. when averagingAmount is 0.1 take 0.9 of the previous curVol value
    curVol = (curVol * (1-averagingAmount)) + newVol;
    
    // curVol = mic.getLevel(); // sets curVol to exactly what the mic level is now
    console.log(curVol);

    timer = millis() - timerStart;

    //x plot values moves across axis with time
    let ex = map(timer,0,duration,0,width);
  
    //visualise raw value from the microphone
    let rawVolY = map(mic.getLevel(),0,1,height*0.3,height*0.03,true);

    fill(255,0,0);//red
    ellipse(ex, rawVolY, 3, 3);

    //visualise percentage of newVolume
    let newVolY = map(newVol,0,1,height*0.3,height*0.03,true);

    fill(0,255,100);//green
    ellipse(ex, newVolY, 3, 3);

    //visualise final calculated smooth value
    let ey = map(curVol,0,1,height*0.3,height*0.03,true);

    fill(0,0,255);// blue
    ellipse(ex, ey, 3, 3);

    if(timer >= duration){
      fill(255);
      rect(0,0,width,height*0.33);
      timerStart = millis();
    }

    //fade effect 
    fill(0,10);
    rect(0,height*0.33,width,height*0.66);

    // Draw an ellipse with diameter based on curVolume
    let diameter = map(curVol, 0, 1, 10, height*0.66,true);

    if(curVol > threshold){
      push();
      fill(255,0,0);
      noStroke();
      rectMode(CENTER);//only want this applied to this rect
      rect(width*0.5, height*0.66, diameter, diameter);
      pop();
    }else{
      fill(255);
      noStroke();
      ellipse(width*0.5, height*0.66, diameter, diameter);
    }


  }else{
    background(255);
    fill(0);
    text("Click and Sing", width/2,height/2);
  }


}

function mousePressed(){
  if(!audioContextOn){
    audioContextOn = true;
    userStartAudio();

    timerStart = millis();
  }
}