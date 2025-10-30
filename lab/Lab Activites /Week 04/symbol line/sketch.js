numCols = 10;
numRows = 10; // Add number of rows for the grid
randomNumbers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(3);
  rectMode(CENTER);

   // Generate random numbers for each grid position
   for (let row = 0; row < numRows; row++) {
     for (let col = 0; col < numCols; col++) {
       randomNumbers.push(random(0,1));// a random value between 0 - 1
     }
   }
}

function draw() {
  background(230);

  let symbolWidth = width / numCols;
  let symbolHeight = height / numRows;

  // Nested loops to create a grid
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      
      // Calculate array index for this grid position
      let index = row * numCols + col;
      let probability = randomNumbers[index]; // get our random number out of the array
      
      // Calculate x and y position for this grid cell
      let x = col * symbolWidth + symbolWidth / 2;
      let y = row * symbolHeight + symbolHeight / 2;
      
      //approximately 40% chance it's a circle
      if(probability < 0.2){
        drawShape(x, y, symbolWidth, symbolHeight);
      }else{
         // draw rectangle
        drawOtherShape(x, y, symbolWidth, symbolHeight);
      }
    }
  }
}

function drawShape(x,y,w,h){
  
  // Draw the line first (so it appears behind the circle)
  line(x + w, y - h, x - w, y + h);
  
  // Then draw the circle on top
  fill(random(255),random(255),random(255));
  noLoop();
  ellipse(x,y,w-(w/2),w-(w/2));

}

function drawOtherShape(x,y,w,h){

  line(x - w, y - h, x + w, y + h);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}