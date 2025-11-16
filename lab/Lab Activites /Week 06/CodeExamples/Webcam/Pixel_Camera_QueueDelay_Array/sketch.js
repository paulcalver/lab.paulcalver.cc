/*
storing frames of video in an array to create a 
adding to the front and removing from the back for a delay effect

Camera: https://p5js.org/reference/p5/createCapture/ 
Makes a DOM element (more on this later): 
https://p5js.org/reference/p5/p5.MediaElement/ 

We get each frame from the video as an image 
and that is how we get the pixel information:
https://p5js.org/reference/p5/p5.Image/ 
https://p5js.org/reference/p5.Image/pixels/ 

*/

let video;

//const means a contstant value, you cannot reset the value later in the sketch
const VID_WIDTH = 320;
const VID_HEIGHT = 240;

let frameQueue = [];
let maxQueueSize;
let numFrames = 5;//number for each side of our grid

function setup() {
  createCanvas(VID_WIDTH*2, VID_HEIGHT*2);

  video = createCapture(VIDEO);
  video.size(VID_WIDTH,VID_HEIGHT);
  // createCapture actually makes a separate video element
  // on the page. uncomment line below to hide it.
  // video.hide();

  maxQueueSize = numFrames * numFrames;

}

function draw() {
  background(255);
  fill(0);
 
  //get current frame as image
  let img = video.get();
  //unshift allows us to push to the front of the array
  frameQueue.unshift(img);

  //if we have too many images we pop one off the back
  if (frameQueue.length > maxQueueSize){
    frameQueue.pop();
  }

  noStroke();

  let imgIndex = 0;
  let imgWidth = width/numFrames;
  let imgHeight = height/numFrames;

  if(frameQueue.length >= maxQueueSize){

    //jump through pixels of video 
    for(let x = 0; x < width; x+=imgWidth){
      for(let y = 0; y < height; y+=imgHeight){
        
        //draw our frame that was stored in our frame buffer
        image(frameQueue[imgIndex],x,y,imgWidth,imgHeight);
        imgIndex++;

      }
    }

  }

  fill(0);
  text(round(frameRate(),2),20,20);

}

