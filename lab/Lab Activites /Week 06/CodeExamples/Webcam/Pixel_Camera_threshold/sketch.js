/*
Threshold example setting pixel to black or white if 
brightness is above a threshold level. 

Camera: https://p5js.org/reference/p5/createCapture/ 
Makes a DOM element (more on this later): 
https://p5js.org/reference/p5/p5.MediaElement/ 

We get each frame from the video as an image 
and that is how we get the pixel information:
https://p5js.org/reference/p5/p5.Image/ 
https://p5js.org/reference/p5.Image/pixels/ 


*/

//const means a contstant value, you cannot reset the value later in the sketch
const VID_WIDTH = 320;
const VID_HEIGHT = 240;
const PIXEL_JUMP = 10;

let video;
let threshold = 50;//brightness threshold

function setup() {
  createCanvas(400, 400);

  video = createCapture(VIDEO);
  video.size(VID_WIDTH,VID_HEIGHT);
  // createCapture actually makes a separate video element
  // on the page. uncomment line below to hide it.
  // video.hide();

}

function draw() {
  background(220);
  fill(0);
 
  video.loadPixels();

  threshold = map(mouseX, 0, width,0,100);

  push();
  noStroke();
  //jump through pixels of video 
  for(let x = 0; x < VID_WIDTH; x+=PIXEL_JUMP){
    for(let y = 0; y < VID_HEIGHT; y+=PIXEL_JUMP){
    
      let pixIndex = ((y*VID_WIDTH)+x)*4;//formula to get pixel index

      //first three channels are for rgb
      let r = video.pixels[pixIndex];
      let g = video.pixels[pixIndex+1];
      let b = video.pixels[pixIndex+2];

      colorMode(RGB,255);
      let c = color(r,g,b);

      //change color mode to use built in HSB
      colorMode(HSB,100);

      //get brightness
      let pixBrightness = brightness(c);

      //if brigthness is brighter than threshold
      if(pixBrightness > threshold){
        fill(100);//set to white
      }else{
        fill(0);//otherwise set to black
      }

      let centerPoint = PIXEL_JUMP/2;
      ellipse(x+centerPoint,y+centerPoint,PIXEL_JUMP,PIXEL_JUMP);

    }
  }
  pop();

  fill(0);
  text(round(frameRate(),2),20,20);

}

