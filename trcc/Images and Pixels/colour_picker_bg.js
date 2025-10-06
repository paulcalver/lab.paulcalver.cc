let img, imgX, imgY;
let c;

function preload() {
  img = loadImage('assets/Blood_Sweat_Tears_Adam_B0004364_WEB.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  img.resize(width * 0.5, 0); // img.width and img.height now reflect the drawn size
  imageMode(CENTER);
  imgX = width * 0.5;
  imgY = height * 0.5;
}

function draw() {
  
  // Convert mouse from canvas to image-local space (accounting for CENTER mode)
  const ix = mouseX - (imgX - img.width / 2);
  const iy = mouseY - (imgY - img.height / 2);
  
  let c = color(0, 0, 0, 0); // fallback
  if (ix >= 0 && iy >= 0 && ix < img.width && iy < img.height) {
    c = img.get(ix, iy);
  }
  background(c);
  image(img, imgX, imgY);
  
  noStroke();
  fill(c);
  //ellipse(mouseX, mouseY, 150, 150);
}