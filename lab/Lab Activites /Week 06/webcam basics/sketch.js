let cam;
const CAMHEIGHT = 240;
const CAMWIDTH = 320;
const PIXELJUMP = 40;
let xPos; 
let yPos;

function setup() {
  createCanvas(windowWidth, windowHeight);

  cam = createCapture(VIDEO);
  cam.size(CAMWIDTH, CAMHEIGHT);
  cam.hide();
  
}

function draw() {
  background(0);

  cam.loadPixels();

  push();
  translate(width * 0.5 - CAMWIDTH * 0.5, height * 0.5 - CAMHEIGHT * 0.5);

 

  for (let y = 0; y < CAMHEIGHT; y += PIXELJUMP) {
    for (let x = 0; x < CAMWIDTH; x += PIXELJUMP) {

      let i = (y * CAMWIDTH + x) * 4;

      let r = cam.pixels[i + 0];
      let g = cam.pixels[i + 1];
      let b = cam.pixels[i + 2];

      //let brightness = (r + g + b) / 3;
      //let circleSize = map(brightness, 0, 255, 1, 80);

      fill(r, g, b);
      if (r > 200 && g < 70 && b < 150) {
        //rect(x,y,200,200);
        textSize(48);
        text('YES', width/2, height/2)
      } else {
        text('no', width/2, height/2);
      }
      noStroke();
      rect(x, y, PIXELJUMP, PIXELJUMP);
      //circle(x + PIXELJUMP / 2,  y + PIXELJUMP / 2, circleSize);
    
      
    }
  }

   for (let x= 0; x < CAMWIDTH; x+= PIXELJUMP){
    for (let y= 0; y < CAMHEIGHT; y+= PIXELJUMP){
      noFill();
      stroke(255);
      rect(x,y,PIXELJUMP,PIXELJUMP);
      
    }
  }
  //let randomxPos = random(0,CAMWIDTH);
  //let randomyPos = random(0,CAMHEIGHT);

  //fill(0,255,0);
  //rect(randomxPos, randomyPos, PIXELJUMP, PIXELJUMP);
  
  pop();
  cam.updatePixels();
  


}
