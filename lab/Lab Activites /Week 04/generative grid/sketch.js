/*
This sketch shows two implementations of a simple grey scale bitmap 10 by 10 image:

- an implementation of a 2D array to represent a 2D image / a grid of pixel values.
- an implementation of a 1D array to represent a 2D image / a grid of pixel values.

We will be aiming to use the 1D array method as it's how pixels are stored when 
working with images and video.

*/


// size definitions
let rectSz = 20; // blow up our pixel art when drawing
let pixelArtWidth = 10; // to produce 10*10 images
let pixelArtHeight = 10;

//two dimensional array  
//1 array with 10 arrays, each with 10 elements
let array2D = [
  [1,1,1,0,0,0,0,1,1,1], //see the square brackets at the start & end of each line
  [1,1,0,1,1,1,1,0,1,1],
  [1,0,1,1,1,1,1,1,0,1],
  [0,1,1,0,1,1,0,1,1,0],
  [0,1,1,0,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,0,1,1,0,1,1,0],
  [1,0,1,1,0,0,1,1,0,1],
  [1,1,0,1,1,1,1,0,1,1],
  [1,1,1,0,0,0,0,1,1,1]
];

// test / break your image, change pixelArtHeight to equal 11
// then put this line in the middle of your array
// watch out for square brackets and commas when manually adding to the array 
// [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],


//1 dimensional array
// 1 array with 10 by 10 elements = 100 values
let array = [
  1,1,1,0,0,0,0,1,1,1, // see NO square brackets at the end & start of each line
  1,1,0,1,1,1,1,0,1,1,
  1,0,1,1,1,1,1,1,0,1,
  0,1,1,0,1,1,0,1,1,0,
  0,1,1,0,1,1,0,1,1,0,
  0,1,1,1,1,1,1,1,1,0,
  0,1,1,0,1,1,0,1,1,0,
  1,0,1,1,0,0,1,1,0,1,
  1,1,0,1,1,1,1,0,1,1,
  1,1,1,0,0,0,0,1,1,1
];

// test / break your image, change pixelArtHeight to equal 11
// then put this line in the middle of your array
// watch out for square brackets and commas when manually adding to the array 
// 0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,

function setup() {
  createCanvas(400, 400);

}

function draw() {
  background(220);
  // noStroke();

  for(let xi = 0; xi < pixelArtWidth; xi++){
    for(let yi = 0; yi < pixelArtHeight; yi++){
      //accessing value out of 2D array using array2D[index][index]
      let percentage = array2D[yi][xi];
      fill(255*percentage);
      rect(xi * rectSz, yi * rectSz, rectSz,rectSz);
    }
  }

  push();
  translate(width/2,height/2);

  //strategy used when working with pixel data
  for(let xi = 0; xi < pixelArtWidth; xi++){
    for(let yi = 0; yi < pixelArtHeight; yi++){
      
      //we need to calculate the index position using some math
      let index = (yi * pixelArtWidth) + xi;
      let percentage = array[index];

      fill(255*percentage);
      rect(xi * rectSz, yi * rectSz, rectSz,rectSz);
    }
  }

  pop();

}