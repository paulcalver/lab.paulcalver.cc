let gridCells = 20;
let layerNum = 12;
let randomNumbers = [];


function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let gridX = 0; gridX < gridCells; gridX++) {
    for (let gridY = 0; gridY < gridCells; gridY++) {
      randomNumbers.push(random(0.15, 0.85));
    }
  }
}

function draw() {
  background(220);
  let cascadeW = width / gridCells;
  let cascadeH = cascadeW;

  for (let gridX = 0; gridX < gridCells; gridX++) {
    for (let gridY = 0; gridY < gridCells; gridY++) {
      // Calculate cellIndex inside the loops where gridX and gridY are defined
      let cellIndex = (gridY * gridCells) + gridX;

      push();
      translate(gridX * cascadeW, gridY * cascadeH);

      //random noise seed to do some randomised variation in our drawing
      let randNoiseSeed = 400 * randomNumbers[cellIndex];

      noiseSeed(randNoiseSeed);

      // get random corner positions from pre-generated array
      let randCornerX = cascadeW * randomNumbers[cellIndex];
      let randCornerY = cascadeH * randomNumbers[cellIndex];

      // loop and create our layers
      for (let i = 0; i < layerNum; i++) {
        // calculate the x and y position of the box using i
        let _x = (i * (randCornerX / layerNum));
        let _y = (i * (randCornerY / layerNum));


        // calculate the size of the box using i
        let rectW = cascadeW - (cascadeW / layerNum * i);
        let rectH = cascadeH - (cascadeH / layerNum * i);

        let noisedStroke = noise(i * 0.5) * 4;
        let noisedColor = noise(i) * 255;
        strokeWeight(noisedStroke);
        stroke(noisedColor);
        fill(255,0,0);

        // draw the box
        rect(_x, _y, rectW, rectH);
        //ellipse(_x, _y,10,10);//visualise the corner position

      }

      pop();
    }
  }

}

