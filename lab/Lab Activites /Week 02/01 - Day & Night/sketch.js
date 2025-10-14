let day = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {

  if(day) {
  background('blue');
  fill('yellow')
  circle(200,200,200);
  fill('green')
  rect(0,height-80,width);
  }else{
  background(25,25,112);
  fill(240);
  circle(200,200,200);
  fill(41,64,12)
  rect(0,height-80,width);

  }

}

function mousePressed() {
  day = !day;
}





