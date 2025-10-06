let colOffset;
const num = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Space Mono');
  colOffset = random(50,100);  
  
}

function draw() {
  
  background(255);
  noStroke();
  noFill();
  let sw = 12.5;

  let alpha = map(mouseX, 0, height, 255, 255);
  let colR = map(mouseX, 0, width, 150, 255);
  let colG = map(mouseY, 0, height, 150, 255);
  let colB = map(mouseY, 0, width, 255, 225);
  //let colB = 255;


  if (mouseIsPressed) {
    
  str = 'YAY!'; 
  // Left + Right Triangles
  fill(colR, colG+colOffset, colB);
  triangle(0,0,mouseX,mouseY,0,height);
  triangle(width,0,width,height,mouseX,mouseY);
  
  // Top + Bottom Triangles
  fill(colR+colOffset, colG, colB);
  triangle(0,0,width,0,mouseX,mouseY);
  triangle(0,height,width,height,mouseX,mouseY);

  // Circles
  noFill();
  for (let i=0; i<num; i++) {
    stroke(colR+colOffset, colG, colB);
    strokeWeight(sw);
    let cw = 50 + i * 50;
    circle(width/2, height/2, cw);
    circle(mouseX, mouseY, cw);

  }
  
}else{

  str = 'CLICK\nTO\nFLIP';

// Left + Right Triangles
  fill(colR, colG+colOffset, colB);
  triangle(0,0,mouseX,mouseY,0,height);
  triangle(width,0,width,height,mouseX,mouseY);
  
  // Top + Bottom  Triangles
  fill(colR+colOffset, colG, colB);
  triangle(0,0,width,0,mouseX,mouseY);
  triangle(0,height,width,height,mouseX,mouseY);

  // Circles
  noFill();
  for (let i=0; i<num; i++) {
    //stroke(colG, colR, colB,alpha);
    stroke(colR, colG+colOffset, colB);
    strokeWeight(sw);
    let cw = 50 + i * 50;
    circle(width/2, height/2, cw);
    circle(mouseX, mouseY, cw);

  }
}

// Text Follows Mouse
  strokeWeight(5);
  stroke(255);
  fill(0,0,0);
  textSize(22);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(str, mouseX, mouseY);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}