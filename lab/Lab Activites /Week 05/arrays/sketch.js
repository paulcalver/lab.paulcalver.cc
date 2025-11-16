// colourArray = [230, 50, 100, 150, 200, 250];


// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   noStroke();
//   noLoop();
// }

// function draw() {
//   randomColour = int(random(0, colourArray.length));
//   background(0);
//   fill(colourArray[randomColour]);
//   circle(width/2, height/2, height*0.8);

  
// }

// function mousePressed() {
  

// }

/*
  We are going to re-factor this code to use arrays and loops to have many circles moving across or down the page
*/

let y = -50;//global
let circleSize = 100;

let positionsX = [];
let positionsY = [];


function setup() {
  createCanvas(windowWidth, windowHeight);

  for(let i = 0; i < 5; i++){
    positionsX.push(random(0,width));
    positionsY.push(random(0,height));
  }
  
  console.log(positionsX);
}

function draw() {
  background(220);

  

  if(y >= (height+circleSize/2)){
     y = 0-circleSize/2;
  }

  //add more circles
  for(let i = 0; i < positionsX.length; i++){
    // temporay veriable
    // let x = positionsX[ i ]; // index to get the value
    
    circle(positionsX[ i ],positionsY[ i ],circleSize);//using value
    
    positionsX[ i ] += 1;//changing value
    
    if(positionsX[ i ] >= (width+circleSize/2)){//using value
     positionsX[ i ] = 0-circleSize/2;//changing value
    }
  }
  
}

function mousePressed(){
  // function push belongs to positionsX array
  positionsX.push(mouseX);
  positionsY.push(mouseY);
  
  // length data/variable belongs to the array
  console.log(positionsX.length);
}

function keyPressed(){
  positionsX.pop();
  positionsY.pop();
  console.log(positionsX.length);
}
