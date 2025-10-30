/*
  A grid of Mohr patterns
  More advanced as it uses noise, which we will look at next week
*/

let f = 0.0;
let spc;
let numIters;

function setup()
{
  createCanvas(800, 800);
  
  // our grid spacing
  numIters = 10; 
  spc = width / numIters;
}


function draw()
{
  background(255);
  
  for (let i = 0; i < numIters; i++) {
    for (let j = 0; j < numIters; j++) {
      // push and pop matrix so that we dont cumulatively translate 
      push();
      
      // move to the current location in the grid
      translate(spc/2 + i * spc, spc/2 +  j * spc);
      
      // call a function which draws something at (0, 0)
      drawAMohr( i + 1, j + 1);
      
      pop();
    }
  }
  
  // itterate f so we have an animation
  f+= 0.01;
}


/*
  This function uses perlin noise aka noise();
  Unlike random(), noise() will return consistent results for the same parameters
  This means it's good for animation:
  https://p5js.org/reference/#/p5/noise
*/
function drawAMohr(i, j)
{
  beginShape();
  for (let k = 0; k < 15; k++) {
    vertex(noise( k * j, i + f) * spc  - spc/2, noise( i, j *k + f ) * spc - spc/2);
  }
  endShape();
}