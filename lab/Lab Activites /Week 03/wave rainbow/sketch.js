
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100);
  
}

function draw() {
  background(360);
  //fill(random(360),100,100);
  let t = frameCount/0.5;
  let rectSize = 10;
  let spacing = 20;
  
  for (let x=0; x< width; x += spacing) {
    for (let y=0; y < height; y += spacing) {
      push();
      translate(x + spacing/2, y + spacing/2);
      rotate(sin(t+x+y)*5);
      let mapHue = map(x,0,width,0,360);
      fill(mapHue, 100,100);
      //fill(360);
      circle(x,y,rectSize);
      pop();
      
    }
    
  }
  //filter(BLUR,10);
  
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

