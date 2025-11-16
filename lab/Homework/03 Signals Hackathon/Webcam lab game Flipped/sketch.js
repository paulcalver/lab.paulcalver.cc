let cols = 20;
let rows = 12;
let squareSize = 20;
let redSquares = []; // Array to store 5 red square positions
let capture;
let showHit = false;
let hitTimer = 0;
let players = 5;
let showThreshold = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Pick 5 random unique squares to be red
  redSquares = [];
  while (redSquares.length < players) {
    let col = floor(random(cols));
    let row = floor(random(rows));
    
    // Check if this position is already in the array
    let isDuplicate = false;
    for (let sq of redSquares) {
      if (sq.col === col && sq.row === row) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      redSquares.push({ col: col, row: row });
    }
  }
  
  // Initialize webcam
  capture = createCapture(VIDEO);
  capture.size(cols * squareSize, rows * squareSize);
  capture.hide();
  
  noStroke();
}

function draw() {
  background(0);
  
  // Fixed video size - 1400px wide, maintain aspect ratio
  let drawWidth = 1400;
  let videoAspect = capture.width / capture.height;
  let drawHeight = drawWidth / videoAspect;
  let offsetX = (width - drawWidth) / 2;
  let offsetY = (height - drawHeight) / 2;
  let videoScale = drawWidth / capture.width;
  
  if (capture) {
    let displayImg;
    if (showThreshold) {
      capture.loadPixels();
      let thresholdImg = createImage(capture.width, capture.height);
      thresholdImg.loadPixels();
      let thresholdValue = 240;
      for (let i = 0; i < capture.pixels.length; i += 4) {
        let r = capture.pixels[i];
        let g = capture.pixels[i + 1];
        let b = capture.pixels[i + 2];
        let brightness = (r + g + b) / 3;
        if (brightness > thresholdValue) {
          thresholdImg.pixels[i] = 255;
          thresholdImg.pixels[i + 1] = 255;
          thresholdImg.pixels[i + 2] = 255;
          thresholdImg.pixels[i + 3] = 255;
        } else {
          thresholdImg.pixels[i] = 0;
          thresholdImg.pixels[i + 1] = 0;
          thresholdImg.pixels[i + 2] = 0;
          thresholdImg.pixels[i + 3] = 255;
        }
      }
      thresholdImg.updatePixels();
      displayImg = thresholdImg;
    } else {
      displayImg = capture;
    }
    // Flip vertically: translate and scale
    push();
    translate(offsetX, offsetY + drawHeight);
    scale(1, -1);
    image(displayImg, 0, 0, drawWidth, drawHeight);
    pop();
    
    // All detection and grid logic below works for both modes
    displayImg.loadPixels();
    let allSquaresBright = true;
    
    // Check each red square
    for (let sq of redSquares) {
      // Flip Y for detection
      let redX = sq.col * squareSize;
      let redY = (capture.height - (sq.row + 1) * squareSize);
      
      // Check only the center area of the square (middle 50%)
      let centerSize = squareSize * 0.5;
      let centerStartX = redX + (squareSize - centerSize) / 2;
      let centerStartY = redY + (squareSize - centerSize) / 2;
      
      let maxBrightness = 0;
      
      // Look for bright spot in the center of the square
      for (let x = centerStartX; x < centerStartX + centerSize; x++) {
        for (let y = centerStartY; y < centerStartY + centerSize; y++) {
          let index = (Math.floor(x) + Math.floor(y) * capture.width) * 4;
          let r = displayImg.pixels[index];
          let g = displayImg.pixels[index + 1];
          let b = displayImg.pixels[index + 2];
          
          // Check if pixel is bright (close to white/100% brightness)
          let brightness = (r + g + b) / 3;
          maxBrightness = Math.max(maxBrightness, brightness);
        }
      }
      
      // Check if any pixel in this square is bright enough
      if (maxBrightness < 240) { // Threshold for bright pixels (out of 255)
        allSquaresBright = false; // If any square fails, set to false
      }
    }
    
    // Only trigger HIT if all squares are bright
    if (allSquaresBright) {
      console.log("All " + players + " squares bright!");
      showHit = true;
      hitTimer = millis();
    }
  }
  
  // Hide HIT after 0.5 seconds
  if (showHit && millis() - hitTimer > 500) {
    showHit = false;
  }
  
  // Draw grid of squares
  // Use the same scale factor as the video display
  let scaledSquareSize = squareSize * videoScale;
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = offsetX + i * scaledSquareSize;
      let y = offsetY + j * scaledSquareSize;
      
      // Check if this is one of the red squares
      let isRedSquare = false;
      let squareNumber = -1;
      for (let idx = 0; idx < redSquares.length; idx++) {
        if (i === redSquares[idx].col && j === redSquares[idx].row) {
          isRedSquare = true;
          squareNumber = idx + 1; // 1-5 instead of 0-4
          break;
        }
      }
      
      if (isRedSquare) {
        fill(255, 0, 0, 100); // Red
        //rect(x, y, scaledSquareSize, scaledSquareSize);
        circle(x + scaledSquareSize / 2, y + scaledSquareSize / 2, scaledSquareSize, scaledSquareSize);
        
        // Draw number on the square
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(scaledSquareSize * 0.6);
        text(squareNumber, x + scaledSquareSize / 2, y + scaledSquareSize / 2);
      } else {
        fill(255, 255, 255, 0); // White with alpha 0 (transparent)
        rect(x, y, scaledSquareSize, scaledSquareSize);
      }
    }
  }
  
  // Display HIT text
  if (showHit) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    let hitText = "Hooray!!";
    let maxWidth = width * 0.95;
    let fontSize = 10;
    textSize(fontSize);
    while (textWidth(hitText) < maxWidth && fontSize < height) {
      fontSize += 2;
      textSize(fontSize);
    }
    textSize(fontSize - 2);
    text(hitText, width / 2, height / 2);
  }
  
  // Draw player count UI
  fill(255);
  textAlign(LEFT, TOP);
  textSize(24);
  text("Players: " + players, 20, 20);
  textSize(16);
  text("Press UP/DOWN to change players", 20, 50);
  text("Press T to toggle threshold", 20, 70);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    players = min(players + 1, 8);
    resetGame();
  } else if (keyCode === DOWN_ARROW) {
    players = max(players - 1, 1);
    resetGame();
  } else if (key === 't' || key === 'T') {
    showThreshold = !showThreshold;
  }
}

function resetGame() {
  // Regenerate red squares with new player count
  redSquares = [];
  while (redSquares.length < players) {
    let col = floor(random(cols));
    let row = floor(random(rows));
    
    // Check if this position is already in the array
    let isDuplicate = false;
    for (let sq of redSquares) {
      if (sq.col === col && sq.row === row) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      redSquares.push({ col: col, row: row });
    }
  }
  showHit = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
