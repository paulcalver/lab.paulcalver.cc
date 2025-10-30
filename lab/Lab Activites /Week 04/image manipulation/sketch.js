/*

You can also use a asynchronous callback instead of using preload:
https://p5js.org/reference/p5/loadImage/

*/

function preload() {
  //load in an image
  img = loadImage('assets/image.jpg');
}



//setup runs once preload has finished loading items
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);
  
  img.loadPixels();
  
  //looping through the pixels in the pixel array.
  for(let y= 0; y < img.height; y++){
    for(let x= 0; x < img.width; x++){

      //our line to help us find the individual pixel index value, but this time we multiply it by 4 because there are 4 RGB values (RGBA)
      let i = (y * img.width + x) * 4;
      
//now using that [i], we can get the values out of the pixel array and change them! 
      
      img.pixels[i] = 150;   //R
      //img.pixels[i+1] = 0; //G
      //img.pixels[i+2] = 0;  //B
      img.pixels[i+3] = 150; //A (opacity)
      
    }
  }
  
  //this line will change what we see, and actually show the pixels in their new colours. 
  
 img.updatePixels();

  //this line below actually draws the image 
  
image(img,0,height*0.5-((width*0.75)/2),width,width*0.75);//draw image
  
 //image(img,mouseX,mouseY,100,75);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}