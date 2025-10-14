function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  noStroke();
}

function draw() {
 background(255);

 text(nf(hour(), 2) + ':' + nf(minute(), 2) + ':' + nf(second(), 2), 10, 20);

 // Changing seconds into values betwwen 0 and the width of the screen
 let mapSecond = map(mouseX,0,width,width,100);

 // Changing seconds into values betwwen 0 and 360
 let mapColour = map(mouseX,width,59,0,100);

 
 fill(50,mapColour,50);
 //rect(0,height/2,mapSecond,100);

 circle(width/2, height/2,mapSecond);

}






