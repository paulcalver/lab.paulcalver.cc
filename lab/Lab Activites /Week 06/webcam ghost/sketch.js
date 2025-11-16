let cam; 
const CAMWIDTH = 320
const CAMHEIGHT = 240
let offscreen;

function setup() {
  createCanvas(CAMWIDTH*2, CAMHEIGHT*2);
  
  cam = createCapture(VIDEO);
  cam.size(CAMWIDTH,CAMHEIGHT);
  cam.hide();
  
  offscreen = createGraphics(CAMWIDTH, CAMHEIGHT);
  
}

function draw() {
  background(220);
//   offscreen.background(200,150,100);
  
  offscreen.tint(255,10)
  offscreen.image(cam,0,0);
  
  image(offscreen, 100,100);
 // image(cam, 0, 0, CAMWIDTH/2, CAMHEIGHT/2);
}

function keyPressed(){
  if(key == 's'){
    saveGif("catGhost",6);
  }
}