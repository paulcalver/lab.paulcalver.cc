/*
Loading in a video file
https://p5js.org/reference/p5/createVideo/ 

For all video functionality:
https://p5js.org/reference/p5/p5.MediaElement/ 

Film Clip:
Dziga Vertov, one of the early pioneers with film and the use of montage
https://en.wikipedia.org/wiki/Man_with_a_Movie_Camera
*/

let isLoaded = false;
let isLooping = false;
let isPlaying = false;

let videoClip;

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER);

  // videoLoaded is a function that gets called when the video is loaded
  videoClip = createVideo('DzigaVertov_ManWithAMovieCamera.mp4',videoLoaded);
  
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
  
    let playBackSpeed = map(mouseX,0,width,0.1,2,true);
  
    videoClip.speed(playBackSpeed);
  
  
    let clipW = videoClip.width;
    let clipH = videoClip.height;
    let pixelJump = 5;
  
    videoClip.loadPixels();
  
    push();
    translate(0,100);
  
    noStroke();
    //jump through pixels of video 
    for(let x = 0; x < clipW; x+=pixelJump){
      for(let y = 0; y < clipH; y+=pixelJump){
      
        let pixIndex = ((y*clipW)+x)*4;//formula to get pixel index
  
        //first three channels are for rgb
        let r = videoClip.pixels[pixIndex];
        let g = videoClip.pixels[pixIndex+1];
        let b = videoClip.pixels[pixIndex+1];
  
        fill(r,g,b);
        rect(x,y,pixelJump,pixelJump);
  
      }
    }
  
    pop();
  
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

    if(key == 'r'){
      let randomplace = random(videoClip.duration());
      videoClip.time(randomplace);
    }

    if(key == 'q'){
      videoClip.size(width,(width/videoClip.width)*videoClip.height);
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
    // videoClip.stop();
  }
}

function videoLoaded(){
  isLoaded = true;
  videoClip.size(width,(width/videoClip.width)*videoClip.height);
  // videoClip.hide();//uncomment to hide video element below
}