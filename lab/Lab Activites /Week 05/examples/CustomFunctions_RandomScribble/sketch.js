//https://p5js.org/learn/curves.html

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  //x and y position to translate to, and third param is numVertices
  drawScribble(width/2,height/2-100,20);
  
   //x and y position to translate to, and third param is numVertices
  drawCurvyScribble(width/2,height/2+100,20);
  
  noLoop();
}

function mousePressed(){
  loop();
}

//vertex is not smooth
function drawScribble(ox,oy,vertNum)
{
  let spacing = 5;
  
  push();
  
  translate(ox,oy);
  
  fill(0,255,0);
  circle(0,0,10);//origin after translate at 0,0
  
  noFill();
  beginShape();
  for (let vn = 0; vn < vertNum; vn++) {
    
    let vX = vn*random(-spacing,spacing);
    let vY = vn*random(-spacing,spacing);
    
    //vertex in shape
    vertex(vX,vY);
    
    //visualise vertex point 
    //don't do this best to do another loop than draw inside the begin shape
    // circle(vX,vY,5);
  }
  endShape();
  
  pop();
}


//Using curveVertex for a smooth wave
function drawCurvyScribble(ox,oy,vertNum)
{
  let spacing = 5;
  
    
  push();
  
  translate(ox,oy);
  
  fill(0,255,0);
  circle(0,0,10);//origin after translate at 0,0
  
  
  noFill();
  beginShape();
  for (let vn = 0; vn < vertNum; vn++) {
    
    let vX = vn*random(-spacing,spacing);
    let vY = vn*random(-spacing,spacing);
    
    //the first & last curve vertex in this loop is acting at the control point for end of line
    
    //curve vertex in shape
    curveVertex(vX,vY);
     
    //visualise vertex point 
    //don't do this best to do another loop than draw inside the begin shape
    // circle(vX,vY,5);
    
  }
  endShape();
  
  pop();
}