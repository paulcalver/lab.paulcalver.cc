let rows = 12;
let cols = 12;
let padding = 20;

let flow = 1.5;

let sound;
let amplitude;

function preload() {
  
  soundFormats('mp3');
  sound = loadSound('assets/audio/03_Anasickmodular_01.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CORNER);
  angleMode(DEGREES)

  sound.setLoop(true);
  amplitude = new p5.Amplitude();
  amplitude.setInput(sound);


}

function draw() {
  background(220);

  fill(0);
  text("Click to Play & Pause", 20, 20);
  let level = amplitude.getLevel();
  console.log(level);

  let flapMovement = map(level, 0, 0.3, 0, -90);

  let gridSize = height * 0.7;
  let blockSize = (gridSize - ((rows - 1) * padding)) / rows;
  let roundedBlockSize = Math.floor(blockSize);
  let spacing = gridSize / rows; // Divide total grid size by rows for even distribution


  // Centering - use the intended gridSize for positioning
  let totalGridWidth = (cols - 1) * spacing + roundedBlockSize;
  let totalGridHeight = gridSize; // Use the intended gridSize (0.8 of height)
  let startX = (width - totalGridWidth) / 2;
  let startY = (height - totalGridHeight) / 2;


  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Calculate position of each grid cell
      let cellLeft = startX + j * spacing;
      let cellTop = startY + i * spacing;

      fill(0);
      push();
      translate(cellLeft, cellTop);

      if (j === 0) {
        // First column gets full flapMovement
        rotate(flapMovement);
      } else {
        // Other columns get reduced movement, decreasing with distance
        let reductionFactor = 1 - (j * (1 / (cols * flow))); // Reduces by per column
        rotate(flapMovement * reductionFactor);
      }

      rect(0, 0, roundedBlockSize / 8, roundedBlockSize);
      pop();


    }
  }


}

function mousePressed() {
  //as there is user interaction to play this works
  if (!sound.isPlaying()) {
    sound.play();
  } else {
    sound.pause();
    // sound.stop();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
