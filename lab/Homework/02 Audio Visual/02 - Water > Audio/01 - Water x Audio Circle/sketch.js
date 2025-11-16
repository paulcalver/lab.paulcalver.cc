let video;
let videoSmall; // Small off-screen version for analysis
let tones = [];
let threshold = 140; // Lower threshold to catch more activity
let prevBright = 0;
let sparkleCooldown = 0;
let frameCounter = 0;

// UI variables for interactive sampling
let circleX = 0.5; // Position of the circle (0-1, left to right across canvas)
let circleY = 0.5; // Position of the circle (0-1, top to bottom across canvas)
let isDragging = false;
let isDraggingThreshold = false;
let circleSize = 200; // Diameter of the sampling circle in pixels
let numNotes = 5; // Number of note zones

// Threshold UI variables
let buttonSize = 30; // Size of + and - buttons
let buttonOffset = 80; // Distance from circle center
let buttonPressed = null; // Track which button is pressed: 'plus', 'minus', or null

// Visual feedback variables
let triggerFlashes = []; // Array to store multiple trigger flashes at different Y positions
let triggerHistory = []; // Store recent triggers for visual effect

const vidW = 810;
const vidH = 1080;
const padding = 80;
// Small version for analysis (much faster pixel processing)
const smallW = 81; // 1/10th width
const smallH = 108; // 1/10th height

function preload() {
  // Comment out audio loading for now
  // tones = [
  //   loadSound('assets/sparkle_C4.mp3'),
  //   loadSound('assets/sparkle_E4.mp3'),
  //   loadSound('assets/sparkle_G4.mp3')
  // ];
}

function setup() {
  // Full-window canvas to allow padding + centering
  createCanvas(windowWidth, windowHeight);
  // Remove pixelDensity(1) for smooth rendering

  console.log("Attempting to load video...");
  
  // Main video for display
  video = createVideo('assets/water_02.mp4', vidLoaded);
  video.size(vidW, vidH);
  video.hide();
  video.attribute('muted', '');
  video.attribute('playsinline', '');
  
  // Small off-screen video for fast pixel analysis
  videoSmall = createVideo('assets/water_02.mp4');
  videoSmall.size(smallW, smallH);
  videoSmall.hide();
  videoSmall.attribute('muted', '');
  videoSmall.attribute('playsinline', '');
  
  // Add error handling
  video.elt.onerror = function() {
    console.error("Error loading main video!");
  };
  videoSmall.elt.onerror = function() {
    console.error("Error loading small video!");
  };

  noStroke();
}

function vidLoaded() {
  console.log("Video loaded successfully!");
  video.volume(0);
  video.loop();
  
  // Also start the small video
  videoSmall.volume(0);
  videoSmall.loop();
}

function draw() {
  background(0);

  // Check if video is loaded and ready
  if (!video || video.elt.readyState < 2) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Loading video...", width/2, height/2);
    return;
  }

  // Center video with 80px padding on all sides
  const totalW = vidW + padding * 2;
  const totalH = vidH + padding * 2;
  const x = (width - vidW) / 2;
  const y = (height - vidH) / 2;

  // Draw "frame" padding
  fill(0);
  rect(0, 0, width, height);
  image(video, x, y, vidW, vidH);

  frameCounter++;
  
  // Only analyze brightness every 3rd frame to improve performance
  if (frameCounter % 3 === 0) {
    analyzeBrightness(x, y);
  }
  
  // Draw interactive sampling line UI
  drawSamplingUI(x, y);
  
  // Update cursor based on circle hover
  updateCursor();
  
  noStroke();
}

function analyzeBrightness(x, y) {
  // Use the small video for much faster pixel analysis
  if (!videoSmall || videoSmall.elt.readyState < 2) {
    return; // Skip if small video not ready
  }
  
  videoSmall.loadPixels();
  
  // Calculate circle position in canvas coordinates
  const canvasCircleX = circleX * width;
  const canvasCircleY = circleY * height;
  
  // Convert to video coordinates
  const videoX = (width - vidW) / 2;
  const videoY = (height - vidH) / 2;
  
  // Check if circle intersects with video area
  if (canvasCircleX + circleSize/2 < videoX || canvasCircleX - circleSize/2 > videoX + vidW ||
      canvasCircleY + circleSize/2 < videoY || canvasCircleY - circleSize/2 > videoY + vidH) {
    return; // Circle is outside video area
  }
  
  // Calculate circle center in video coordinates (relative to video)
  const circleXInVideo = (canvasCircleX - videoX) / vidW; // 0-1 within video
  const circleYInVideo = (canvasCircleY - videoY) / vidH; // 0-1 within video
  
  // Convert to main video coordinates for high-detail sampling
  const circleXMain = circleXInVideo * vidW;
  const circleYMain = circleYInVideo * vidH;
  const circleSizeMain = circleSize; // Use full resolution circle size
  
  let maxBrightness = 0;
  let totalBrightness = 0;
  let sampleCount = 0;
  
  // Create 5 sampling circles within the main circle for each note
  const radius = circleSizeMain / 2;
  const noteCircleRadius = radius / 4; // Each note circle is 1/4 the main radius
  const noteCircleDiameter = noteCircleRadius * 2;
  
  // Load main video pixels for high-detail analysis
  video.loadPixels();
  
  // Clear previous note brightness values
  let noteBrightness = new Array(numNotes).fill(0);
  let noteSampleCounts = new Array(numNotes).fill(0);
  
  // Position 5 circles vertically within the main circle
  for (let noteIndex = 0; noteIndex < numNotes; noteIndex++) {
    // Calculate Y position for this note circle (evenly spaced vertically)
    const noteYOffset = map(noteIndex, 0, numNotes - 1, -radius * 0.7, radius * 0.7);
    const noteYMain = circleYMain + noteYOffset;
    
    // Sample within this note circle
    for (let yOffset = -noteCircleRadius; yOffset <= noteCircleRadius; yOffset += 3) {
      const yPix = Math.round(noteYMain + yOffset);
      if (yPix < 0 || yPix >= vidH) continue;
      
      for (let xOffset = -noteCircleRadius; xOffset <= noteCircleRadius; xOffset += 3) {
        const xPix = Math.round(circleXMain + xOffset);
        if (xPix < 0 || xPix >= vidW) continue;
        
        // Check if pixel is within the note circle
        const distFromCenter = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
        if (distFromCenter > noteCircleRadius) continue;
        
        const idx = (xPix + yPix * vidW) * 4;
        const r = video.pixels[idx];
        const g = video.pixels[idx + 1];
        const b = video.pixels[idx + 2];
        const bright = (r + g + b) / 3;
        
        noteBrightness[noteIndex] += bright;
        noteSampleCounts[noteIndex]++;
        totalBrightness += bright;
        sampleCount++;
        maxBrightness = Math.max(maxBrightness, bright);
      }
    }
    
    // Check if this note circle should trigger
    if (noteSampleCounts[noteIndex] > 0) {
      const avgNoteBrightness = noteBrightness[noteIndex] / noteSampleCounts[noteIndex];
      
      if (avgNoteBrightness > threshold) {
        // Trigger this specific note
        const yPositionInCircle = (noteYOffset + radius) / (radius * 2);
        triggerCircleHit(yPositionInCircle, avgNoteBrightness, noteIndex);
      }
    }
  }
  
  // Store average brightness for display
  if (sampleCount > 0) {
    prevBright = totalBrightness / sampleCount;
  }
  
  // Debug info every 60 frames (1 second)
  if (frameCounter % 60 === 0) {
    console.log(`5-NOTE Circle analysis - Avg: ${nf(prevBright, 1, 1)}, Max: ${nf(maxBrightness, 1, 1)}, Threshold: ${threshold}`);
    console.log(`Sampling: 5 circles of ${noteCircleDiameter} pixels diameter within main ${circleSize}px circle`);
  }
  
  // Fade existing trigger flashes
  triggerFlashes = triggerFlashes.filter(flash => {
    flash.intensity *= 0.9;
    return flash.intensity > 10;
  });
}

function triggerCircleHit(yPositionInCircle, brightness, noteIndex = null) {
  // Use provided noteIndex or calculate from Y position
  let clampedIndex;
  if (noteIndex !== null) {
    clampedIndex = noteIndex;
  } else {
    clampedIndex = Math.floor(yPositionInCircle * numNotes);
    clampedIndex = Math.max(0, Math.min(numNotes - 1, clampedIndex));
  }
  
  // Add visual trigger effect at this Y position
  triggerFlashes.push({
    yPosition: yPositionInCircle,
    intensity: 255,
    noteIndex: clampedIndex,
    time: millis()
  });
  
  // Add to trigger history
  triggerHistory.push({
    yPosition: yPositionInCircle,
    noteIndex: clampedIndex,
    time: millis(),
    brightness: brightness
  });
  
  // Keep only recent triggers (last 2 seconds)
  triggerHistory = triggerHistory.filter(t => millis() - t.time < 2000);
  
  console.log(`Circle hit! Y: ${nf(yPositionInCircle, 1, 2)}, Note: ${clampedIndex + 1}, Brightness: ${nf(brightness, 1, 1)}`);
}

function drawSamplingUI(videoX, videoY) {
  // Calculate circle position on canvas
  const canvasCircleX = circleX * width;
  const canvasCircleY = circleY * height;
  
  // Draw the main sampling circle - black with 70% alpha, no stroke
  fill(0, 0, 0, 178); // 70% alpha = 178 (out of 255)
  noStroke();
  ellipse(canvasCircleX, canvasCircleY, circleSize, circleSize);
  
  // Draw the 5 note circles within the main circle
  const radius = circleSize / 2;
  const noteCircleSize = radius / 2; // Each note circle diameter is 1/4 of main radius
  
  for (let noteIndex = 0; noteIndex < numNotes; noteIndex++) {
    // Calculate Y position for this note circle (evenly spaced vertically)
    const noteYOffset = map(noteIndex, 0, numNotes - 1, -radius * 0.7, radius * 0.7);
    const noteY = canvasCircleY + noteYOffset;
    
    // Draw note circle - lighter black with 50% alpha
    fill(0, 0, 0, 127); // 50% alpha
    noStroke();
    ellipse(canvasCircleX, noteY, noteCircleSize, noteCircleSize);
    
    // Draw note number in white
    fill(255, 255, 255, 200);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(noteIndex + 1, canvasCircleX, noteY);
  }
  
  // Draw threshold control buttons
  drawThresholdButtons(canvasCircleX, canvasCircleY);
  
  // Draw trigger flashes within the circle - white with 70% alpha
  for (let flash of triggerFlashes) {
    const flashY = canvasCircleY - circleSize/2 + flash.yPosition * circleSize;
    const flashSize = map(flash.intensity, 0, 255, 10, 40);
    
    // White flashes with 70% alpha
    fill(255, 255, 255, 178);
    noStroke();
    ellipse(canvasCircleX, flashY, flashSize, flashSize);
  }
  
  // Draw trigger history as fading white particles
  for (let trigger of triggerHistory) {
    const age = millis() - trigger.time;
    const alpha = map(age, 0, 2000, 178, 0); // Start at 70% alpha and fade
    const triggerY = canvasCircleY - circleSize/2 + trigger.yPosition * circleSize;
    
    fill(255, 255, 255, alpha);
    noStroke();
    ellipse(canvasCircleX + random(-10, 10), triggerY + random(-5, 5), 6, 6);
  }
}

function drawThresholdButtons(centerX, centerY) {
  // Calculate button positions
  const minusX = centerX - buttonOffset;
  const plusX = centerX + buttonOffset;
  
  // Draw minus button with press feedback
  if (buttonPressed === 'minus') {
    fill(100, 100, 100, 200); // Darker when pressed
  } else {
    fill(255, 255, 255, 150); // Normal state
  }
  noStroke();
  ellipse(minusX, centerY, buttonSize, buttonSize);
  
  // Draw minus symbol
  fill(buttonPressed === 'minus' ? 255 : 0); // White symbol when pressed
  strokeWeight(3);
  stroke(buttonPressed === 'minus' ? 255 : 0);
  line(minusX - 8, centerY, minusX + 8, centerY);
  
  // Draw plus button with press feedback
  if (buttonPressed === 'plus') {
    fill(100, 100, 100, 200); // Darker when pressed
  } else {
    fill(255, 255, 255, 150); // Normal state
  }
  noStroke();
  ellipse(plusX, centerY, buttonSize, buttonSize);
  
  // Draw plus symbol
  fill(buttonPressed === 'plus' ? 255 : 0); // White symbol when pressed
  strokeWeight(3);
  stroke(buttonPressed === 'plus' ? 255 : 0);
  line(plusX - 8, centerY, plusX + 8, centerY);
  line(plusX, centerY - 8, plusX, centerY + 8);
  
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  const canvasCircleX = circleX * width;
  const canvasCircleY = circleY * height;
  
  // Calculate button positions
  const minusX = canvasCircleX - buttonOffset;
  const plusX = canvasCircleX + buttonOffset;
  
  // Check if mouse is over minus button (decrease sensitivity = increase threshold)
  const minusDistance = dist(mouseX, mouseY, minusX, canvasCircleY);
  if (minusDistance <= buttonSize / 2) {
    buttonPressed = 'minus'; // Set visual feedback
    threshold = Math.min(255, threshold + 5); // Decrease sensitivity, maximum 255
    console.log(`Sensitivity decreased (threshold: ${threshold})`);
    return;
  }
  
  // Check if mouse is over plus button (increase sensitivity = decrease threshold)
  const plusDistance = dist(mouseX, mouseY, plusX, canvasCircleY);
  if (plusDistance <= buttonSize / 2) {
    buttonPressed = 'plus'; // Set visual feedback
    threshold = Math.max(50, threshold - 5); // Increase sensitivity, minimum 50
    console.log(`Sensitivity increased (threshold: ${threshold})`);
    return;
  }
  
  // Check if mouse is over the circle
  const circleDistance = dist(mouseX, mouseY, canvasCircleX, canvasCircleY);
  if (circleDistance <= circleSize / 2) {
    isDragging = true;
  }
}

function mouseDragged() {
  if (isDragging) {
    updateCirclePosition();
  }
}

function mouseReleased() {
  isDragging = false;
  buttonPressed = null; // Reset button press state for visual feedback
}

function updateCirclePosition() {
  // Calculate video boundaries
  const videoX = (width - vidW) / 2;
  const videoY = (height - vidH) / 2;
  
  // Convert mouse position to video-relative coordinates
  const mouseXInVideo = mouseX - videoX;
  const mouseYInVideo = mouseY - videoY;
  
  // Constrain to video boundaries
  const constrainedX = constrain(mouseXInVideo, 0, vidW);
  const constrainedY = constrain(mouseYInVideo, 0, vidH);
  
  // Convert back to canvas-relative coordinates (0-1)
  circleX = (videoX + constrainedX) / width;
  circleY = (videoY + constrainedY) / height;
}

function updateCursor() {
  const canvasCircleX = circleX * width;
  const canvasCircleY = circleY * height;
  
  // Calculate button positions
  const minusX = canvasCircleX - buttonOffset;
  const plusX = canvasCircleX + buttonOffset;
  
  // Check if mouse is over threshold buttons
  const minusDistance = dist(mouseX, mouseY, minusX, canvasCircleY);
  const plusDistance = dist(mouseX, mouseY, plusX, canvasCircleY);
  
  if (minusDistance <= buttonSize / 2 || plusDistance <= buttonSize / 2) {
    cursor('pointer'); // Pointer cursor for buttons
  } else if (isDragging) {
    cursor('grabbing'); // Closed hand when dragging
  } else {
    // Check if mouse is over the circle
    const circleDistance = dist(mouseX, mouseY, canvasCircleX, canvasCircleY);
    if (circleDistance <= circleSize / 2) {
      cursor('grab'); // Open hand when hovering over circle
    } else {
      cursor(ARROW); // Default cursor when not over anything interactive
    }
  }
}