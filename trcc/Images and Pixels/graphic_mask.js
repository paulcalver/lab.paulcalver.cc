let img; 
let pg;


function preload(){
   img = loadImage('assets/Blood_Sweat_Tears_Adam_B0004364_WEB.jpg')
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pg = createGraphics(width, height);
  pg.noStroke();


}

function draw() {
  background(255);
  pg.clear();
  pg.fill(0, 255);   // needs to be  filled with transparent color
  pg.push();
  pg.translate(width / 2, height / 2);
  pg.rectMode(CENTER);
  pg.rotate(radians(frameCount));
  pg.rect(0, 0, width-20, 100);
  pg.pop();

  // create a buffer object to store all the pixels of the image
  let buffer = img.get();

  // in order to mask it with the pg object
  buffer.mask(pg);

  // then display everything
  image(buffer, 0, 0, width, height);
}


// function draw() {
//   imageMode(CENTER);
//   push();
//   translate(width/2,height/2);
//   scale(0.2);
//   image(img,0,0);
//   pop();
//   background(f3f3f3);
// }

