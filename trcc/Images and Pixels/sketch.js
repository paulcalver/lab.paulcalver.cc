let src;

function preload() {
  src = loadImage('assets/Blood_Sweat_Tears_Adam_B0004364_WEB.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  src.resize(200, 0);
}

function draw() {
  background(0);

  // Position where the image is drawn (centre of canvas)
  let imgX = width / 2;
  let imgY = height / 2;

  // Translate mouse position into the image’s pixel space
  let mx = mouseX - (imgX - src.width / 2);
  let my = mouseY - (imgY - src.height / 2);

  // Size of the area to copy from the source
  let sw = 100;
  let sh = 100;

  // Centre the mouse in that source window
  let sx = mx - sw / 2;
  let sy = my - sh / 2;

  // Constrain to valid region inside the image
  sx = constrain(sx, 0, src.width - sw);
  sy = constrain(sy, 0, src.height - sh);

  // Destination for the magnified area
  let dw = height; // size of zoomed region
  let dh = height;
  let dx = (width - dw) / 2; // centre on canvas
  let dy = (height - dh) / 2;

  // Draw magnified portion first
  copy(src, sx, sy, sw, sh, dx, dy, dw, dh);

  // Draw the original image centred
  image(src, imgX, imgY);

  // Optional: draw a small marker where the zoom is sampling
  noFill();
  stroke(255, 0, 0);
  rectMode(CENTER);
  rect(mouseX, mouseY, sw, sh);
}