/*
This shows an implementation of calculating the average color of a video frame.


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

let numSampledPix;

let backGroundColor;

let avgHue;
let avgBrightness;
let avgSat;

function setup() {
  createCanvas(400, 400);

  video = createCapture(VIDEO);
  video.size(VID_WIDTH,VID_HEIGHT);
  // createCapture actually makes a separate video element
  // on the page. uncomment line below to hide it.
  // video.hide();

  //we don't sample all the pixels in our incoming video
  numSampledPix = (VID_WIDTH/PIXEL_JUMP) * (VID_HEIGHT/PIXEL_JUMP);

  backGroundColor = color(220);

  

}

function draw() {
  background(backGroundColor);
  fill(0);
 

  video.loadPixels();

  avgHue = 0;
  avgBrightness = 0;
  avgSat = 0;

  noStroke();

  //jump through pixels of video 
  for(let x = 0; x < VID_WIDTH; x+=PIXEL_JUMP){
    for(let y = 0; y < VID_HEIGHT; y+=PIXEL_JUMP){
    
      let pixIndex = ((y*VID_WIDTH)+x)*4;//formula to get pixel index

      //first three channels are for rgb
      let r = video.pixels[pixIndex];
      let g = video.pixels[pixIndex+1];
      let b = video.pixels[pixIndex+2];

      //we switch between color modes to work with HSB versus RGB
      colorMode(RGB,255);
      let c = color(r,g,b);
      fill(c);
   
      //change color mode to use built in HSB
      colorMode(HSB,100);
      let pixHue = hue(c);
      let pixBrightness = brightness(c);
      let pixSaturation = saturation(c)

      avgHue += pixHue;
      avgBrightness += pixBrightness;
      avgSat += pixSaturation;

      let centerPoint = PIXEL_JUMP/2;
      ellipse(x+centerPoint,y+centerPoint,PIXEL_JUMP,PIXEL_JUMP);
      //look at effect with a line, try different  
      // stroke(c);
      // line(x,y,x+PIXEL_JUMP,y+PIXEL_JUMP);

      //CHALLENGE: use the saturation, hue or brightness to affect  
      // the size, shape of the graphics

    }
  }

  //average of pixels sampled in nested for loop
  avgHue /= numSampledPix; 
  avgBrightness /= numSampledPix; 
  avgSat /= numSampledPix;

  //get complimentary color
  let colorAngle = map(avgHue,0,100,0,360);
  let complimentaryAngle = (colorAngle + 180.0)%360;//opposite angle on the color wheel
  let compHue = map(complimentaryAngle,0,360,0,100);
  backGroundColor = color(compHue,avgSat,avgBrightness);

  //average color and complimentary color swatches
  noStroke();
  fill(avgHue,avgSat,avgBrightness);
  rect(VID_WIDTH*0.5-50,50,50,50);
  fill(compHue,avgSat,avgBrightness);
  rect(VID_WIDTH*0.5,50,50,50);

  // console.log(complimentaryAngle,round(avgHue),round(compHue));

  fill(0);
  text(round(frameRate(),2),20,20);

}

