
// let vertNum = 80;
// let radius = 100;
// let noiseAmplitude =1;

// function setup() {
//   createCanvas(windowWidth, windowHeight);

// }

// function draw() {
//   background(0,5);


//   // angle between each point that makes up our circle
//   let angleStep = 360.0/vertNum;

//   push();
  
//   translate(width/2,height/2);
  
//   stroke(255);
//   noFill();
//   beginShape();
//   for (let vn = 0; vn <= vertNum; vn++) {
    
//     //get points along a circle
//     let radian = radians(angleStep*vn);//working with radians
//     let vX = sin(radian) * radius;
//     let vY = cos(radian) * radius;

//     let noiseStep = frameCount*0.01+vn;

//     // add after noiseStep before declaring noiseValue
//     if(vn == vertNum){
//        noiseStep=frameCount*0.01;// don't want to add vn at 360 degrees
//     }

//     //noiseAmplitude = (frameCount % 100) / 100;
//     noiseAmplitude = sin(frameCount * 0.01);

//     let noiseValue = noise(noiseStep);


//     vX += (noiseValue*vX)*noiseAmplitude;
//     vY += (noiseValue*vY)*noiseAmplitude;

//     //vertex in shape
//     //vertex(vX,vY);
//     circle(vX,vY,3);
    

   
//   }
//   endShape();

  
  
//   pop();


// }

/*
 A noisy circle using curve vertices that need two extra control points, that match points at the beginning and end of the circle.

*/


let vertNum = 12;
let radius;


function setup() {
  createCanvas(windowWidth, windowHeight);

}

function draw() {
  background(0,15);

  radius = min(width,height)/8;

  let noiseAmplitude = sin(frameCount*0.01);//make it breathe on its own
  //let noiseAmplitude = (frameCount % 100) / 50;

  // angle between each point that makes up our circle
  let angleStep = 360.0/vertNum;

  push();
  
  translate(width/2,height/2);
  
  stroke(255);
  strokeWeight(4);
  noFill();
  beginShape();
  for (let vn = 0; vn <= vertNum; vn++) {
    
    //get pooints along a circle
    let radian = radians(angleStep*vn);
    let vX = cos(radian) * radius;
    let vY = sin(radian) * radius;

    //calculate position along noise wave
    let noiseStep = frameCount*0.01+vn;
    //if we are at 360 degrees we want to be at the same noise as 0 degrees
    if(vn == vertNum){
       noiseStep=frameCount*0.01;// like adding 0 (not vert num)
    }
    
    //calculate noise
    let noiseValue = noise(noiseStep);

    //by multiplying noiseAmplitude by vX and vY we capture the direction vX and vY are from origin
    vX += (noiseValue*vX)*noiseAmplitude;
    vY += (noiseValue*vY)*noiseAmplitude;

    //when at 0 degrees add a control point that is one angle step behind 360 degrees
    if(vn == 0){
      let control1Radian = radians(angleStep*(vertNum-1));
      let control1X = cos(control1Radian) * radius;
      let control1Y = sin(control1Radian) * radius;
      let conrol1Noise = noise(frameCount*0.01+(vertNum-1));
      control1X += (conrol1Noise*control1X)*noiseAmplitude;
      control1Y += (conrol1Noise*control1Y)*noiseAmplitude;
      curveVertex(control1X,control1Y);
      // circle(control1X,control1Y,10);
    }
    
    //vertex in shape
    curveVertex(vX,vY);//need the extra control points
    // circle(vX,vY,3);//visualise the vertex points

    //when at 3600 degrees add a control point that is one angle step before 0 degrees
    if(vn == vertNum){
      let control1Radian = radians(angleStep);
      let control2X = cos(control1Radian) * radius;
      let control2Y = sin(control1Radian) * radius;
      let conrol2Noise = noise(frameCount*0.01+1);
      control2X += (conrol2Noise*control2X)*noiseAmplitude;
      control2Y += (conrol2Noise*control2Y)*noiseAmplitude;
      curveVertex(control2X,control2Y);
      // circle(control2X,control2Y,10);
    }
 
  }
  endShape();
  
  pop();


}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



