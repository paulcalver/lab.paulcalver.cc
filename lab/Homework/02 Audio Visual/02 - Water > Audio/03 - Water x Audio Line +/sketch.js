let video;
let tones = [];
let threshold = 160; // Lower threshold to catch more activity
let prevBright = 0;
let frameCounter = 0;

// UI variables for interactive sampling
let barX = 0.5; // Position of the bar (0-1, left to right across canvas)
let isDragging = false;
let barWidth = 8; // Thinner width for more precise sparkle detection
let numNotes = 8; // Number of note zones - now matches detection sections
let noteGlows = []; // Array to track glow intensity for each note section
let sparkleDetections = []; // Array to track individual sparkle hits with positions
let detectionSections = 8; // Reduced to 8 for cleaner look with reactive line segments

// Threshold UI variables
let buttonSize = 30; // Size of + and - buttons
let buttonOffset = 80; // Distance from bar center
let buttonPressed = null; // Track which button is pressed: 'plus', 'minus', or null

// Visual feedback variables
let triggerFlashes = []; // Array to store multiple trigger flashes at different Y positions

// Sound debounce - prevent rapid repeated triggers
let soundCooldown = 400; // milliseconds between triggers per section
let lastTriggerTimes = []; // Track when each section last triggered a sound

// Audio control variables
let isMuted = false; // Global mute state
let audioStarted = false; // Track if audio context has been started
let audioPaused = false; // Track if audio detection is paused
let volumeLevel = 0.1; // Volume limit (0.0 to 1.0) - set to 30% to prevent clipping
let muteButtonSize = 25; // Size of mute buttonno
let muteButtonX = 50; // Position from left edge
let muteButtonY = 50; // Position from top edge

const vidW = 810;
const vidH = 1080;

function preload() {
   //Load 8 unique sounds - one for each detection line segment
   tones = [
    loadSound('assets/pluck_new_reverb_01.mp3'),
    loadSound('assets/pluck_new_reverb_02.mp3'),
    loadSound('assets/pluck_new_reverb_03.mp3'),
    loadSound('assets/pluck_new_reverb_04.mp3'),
    loadSound('assets/pluck_new_reverb_05.mp3'),
    loadSound('assets/pluck_new_reverb_06.mp3'),
    loadSound('assets/pluck_new_reverb_07.mp3'),
    loadSound('assets/pluck_new_reverb_08.mp3')
    ];
}

function setup() {
  // Full-window canvas to allow padding + centering
  createCanvas(windowWidth, windowHeight);
  // Remove pixelDensity(1) for smooth rendering

  console.log("Attempting to load video...");

  // Initialize note glow array and sparkle detection array
  noteGlows = new Array(numNotes).fill(0);
  sparkleDetections = new Array(detectionSections).fill(0);
  lastTriggerTimes = new Array(detectionSections).fill(0); // Initialize trigger time tracking

  // Main video for display
  video = createVideo('assets/water_02.mp4', vidLoaded);
  video.size(vidW, vidH);
  video.hide();
  video.attribute('muted', '');
  video.attribute('playsinline', '');

  // Add error handling
  video.elt.onerror = function () {
    console.error("Error loading main video!");
  };

  noStroke();
}

function vidLoaded() {
  console.log("Video loaded successfully!");
  video.volume(0);
  video.loop();
}

function draw() {
  background(0);

  // Check if video is loaded and ready
  if (!video || video.elt.readyState < 2) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(24);
    //text("Loading video...", width/2, height/2);
    return;
  }

  // Calculate video size - 70% of window height, maintain aspect ratio
  const targetVideoHeight = height * 0.7;
  const videoAspectRatio = 810 / 1080; // Original aspect ratio
  const displayVidH = targetVideoHeight;
  const displayVidW = displayVidH * videoAspectRatio;

  // Center video on screen
  const x = (width - displayVidW) / 2;
  const y = (height - displayVidH) / 2;

  // Draw "frame" padding
  fill(0);
  rect(0, 0, width, height);
  image(video, x, y, displayVidW, displayVidH);

  // Audio start instructions
  fill(255);
  textAlign(LEFT);
  textSize(14);
  if (!audioStarted) {
    text("Press spacebar to start audio", 20, 30);
  } else if (audioPaused) {
    text("Press spacebar to resume audio", 20, 30);
  } else {
    text("Audio active and detecting sparkles...\n\nMove line and play with sensitivity", 20, 30);
  }

  frameCounter++;

  // Only analyze brightness every 3rd frame to improve performance
  if (frameCounter % 3 === 0) {
    analyzeBrightness(x, y, displayVidW, displayVidH);
  }

  // Draw interactive sampling line UI
  drawSamplingUI(x, y, displayVidW, displayVidH);

  // Update cursor based on line segment hover
  updateCursor();

  noStroke();
}

function analyzeBrightness(videoX, videoY, displayW, displayH) {
  // Use the main video for high-detail analysis
  if (!video || video.elt.readyState < 2) {
    return; // Skip if video not ready
  }

  video.loadPixels();

  // Calculate bar position in canvas coordinates
  const canvasBarX = barX * width;

  // Convert to video coordinates
  // Check if bar intersects with video area
  if (canvasBarX < videoX || canvasBarX > videoX + displayW) {
    return; // Bar is outside video area
  }

  // Calculate bar center in video coordinates (relative to video)
  const barXInVideo = (canvasBarX - videoX) / displayW; // 0-1 within video

  // Convert to main video coordinates for sampling
  const barXMain = barXInVideo * vidW;
  const lineHeight = vidH * 0.7; // 70% of video height
  const lineStartY = (vidH - lineHeight) / 2; // Center vertically in video
  const barWidthMain = barWidth;

  let maxBrightness = 0;
  let totalBrightness = 0;
  let sampleCount = 0;

  // Create many detection sections for individual sparkle detection within the 70% height
  const detectionSectionHeight = lineHeight / detectionSections;
  let detectionBrightness = new Array(detectionSections).fill(0);
  let detectionCounts = new Array(detectionSections).fill(0);

  // Sample each micro-section for individual sparkle detection
  for (let sectionIndex = 0; sectionIndex < detectionSections; sectionIndex++) {
    // Calculate Y range for this detection section within the 70% line area
    const sectionYStart = lineStartY + (sectionIndex * detectionSectionHeight);
    const sectionYEnd = sectionYStart + detectionSectionHeight;

    // Sample within this detection section with high precision
    for (let yOffset = sectionYStart; yOffset < sectionYEnd; yOffset += 1) { // Sample every pixel
      const yPix = Math.round(yOffset);
      if (yPix < 0 || yPix >= vidH) continue;

      for (let xOffset = -barWidthMain / 2; xOffset <= barWidthMain / 2; xOffset += 1) { // Sample every pixel
        const xPix = Math.round(barXMain + xOffset);
        if (xPix < 0 || xPix >= vidW) continue;

        const idx = (xPix + yPix * vidW) * 4;
        const r = video.pixels[idx];
        const g = video.pixels[idx + 1];
        const b = video.pixels[idx + 2];
        const bright = (r + g + b) / 3;

        detectionBrightness[sectionIndex] += bright;
        detectionCounts[sectionIndex]++;
        totalBrightness += bright;
        sampleCount++;
        maxBrightness = Math.max(maxBrightness, bright);
      }
    }

    // Check if this detection section has a sparkle
    if (detectionCounts[sectionIndex] > 0) {
      const avgSectionBrightness = detectionBrightness[sectionIndex] / detectionCounts[sectionIndex];

      // More sensitive threshold for individual sparkles
      const sparkleThreshold = threshold * 0.8; // 80% of main threshold for sparkles

      if (avgSectionBrightness > sparkleThreshold) {
        // Map this detection section directly to its corresponding note (1:1 mapping)
        const noteIndex = sectionIndex; // Direct mapping - each line segment has its own note

        // Calculate precise Y position for visual feedback
        const yPosition = sectionIndex / detectionSections; // 0-1 from top to bottom

        // Trigger note and visual feedback
        noteGlows[noteIndex] = Math.max(noteGlows[noteIndex], 255); // Keep max glow
        sparkleDetections[sectionIndex] = Math.max(sparkleDetections[sectionIndex], 255); // Ensure full intensity

        triggerSparkleHit(noteIndex, yPosition, avgSectionBrightness);
      }
    }
  }

  // Fade sparkle detections quickly for rapid response
  for (let i = 0; i < sparkleDetections.length; i++) {
    sparkleDetections[i] *= 0.7; // Fast fade for sparkle markers
  }

  // Fade note glows more slowly for sustained visual feedback
  for (let i = 0; i < noteGlows.length; i++) {
    noteGlows[i] *= 0.9; // Slower fade for note sections
  }

  // Store average brightness for display
  if (sampleCount > 0) {
    prevBright = totalBrightness / sampleCount;
  }

  // Debug info every 60 frames (1 second)
  if (frameCounter % 60 === 0) {
    console.log(`SPARKLE Detection - Avg: ${nf(prevBright, 1, 1)}, Max: ${nf(maxBrightness, 1, 1)}, Threshold: ${threshold}`);
    console.log(`${detectionSections} detection sections → ${numNotes} notes, ${barWidth}px wide bar`);
  }
}

function triggerSparkleHit(noteIndex, yPosition, brightness) {
  console.log(`Sparkle hit! Note: ${noteIndex + 1}, Y: ${nf(yPosition, 1, 3)}, Brightness: ${nf(brightness, 1, 1)}`);

  // Add individual sparkle flash at precise position
  triggerFlashes.push({
    yPosition: yPosition,
    intensity: 255,
    noteIndex: noteIndex,
    time: millis(),
    type: 'sparkle' // Mark as sparkle for different visual treatment
  });

  // Audio trigger (only if audio started, not paused, and not muted)
  if (audioStarted && !audioPaused && !isMuted && tones[noteIndex]) {
    // Check debounce timing to prevent rapid repeated triggers
    const currentTime = millis();
    if (currentTime - lastTriggerTimes[noteIndex] > soundCooldown) {
      tones[noteIndex].setVolume(volumeLevel); // Apply volume limit
      tones[noteIndex].play();
      lastTriggerTimes[noteIndex] = currentTime; // Update last trigger time
    }
  }
}

function drawSamplingUI(videoX, videoY, displayW, displayH) {
  // Calculate bar position on canvas
  const canvasBarX = barX * width;
  const barHeight = displayH; // Use display height
  const barTop = videoY;
  const barBottom = videoY + barHeight;

  // Draw the thin red line - 70% height of video, centered vertically
  const lineHeight = barHeight * 0.7; // 70% of video height
  const lineTop = barTop + (barHeight - lineHeight) / 2; // Center vertically
  const lineBottom = lineTop + lineHeight;

  // Draw one continuous white line with alpha 100 as the base
  stroke(255, 255, 255, 100); // White line with alpha 100
  strokeWeight(12); // Consistent width for all segments
  line(canvasBarX, lineTop, canvasBarX, lineBottom); // Full continuous line
  
  // Draw triggered segments at full alpha 255 over the base line
  const detectionSectionHeight = lineHeight / detectionSections;
  for (let i = 0; i < sparkleDetections.length; i++) {
    const sparkleIntensity = sparkleDetections[i];
    
    // Calculate this segment's Y position and bounds
    const segmentTop = lineTop + (i * detectionSectionHeight);
    const segmentBottom = segmentTop + detectionSectionHeight;
    
    if (sparkleIntensity > 5) { // Show triggered segments with growth
      // Calculate segment width based on intensity
      const baseWidth = 12; // Same as base line
      const maxWidth = 60; // Maximum width when fully triggered
      const segmentWidth = baseWidth + ((sparkleIntensity / 255) * (maxWidth - baseWidth));

      // White segment at full alpha 255, with intensity-based width
      stroke(255, 255, 255, 255); // Full white alpha when triggered
      strokeWeight(segmentWidth); // Variable width based on intensity
      line(canvasBarX, segmentTop, canvasBarX, segmentBottom); // Exact segment bounds
    }
  }
  noStroke();

  // Draw individual sparkle flashes as bright red bursts
  for (let flash of triggerFlashes) {
    if (flash.type === 'sparkle') {
      const flashY = lineTop + flash.yPosition * lineHeight;
      const flashSize = map(flash.intensity, 0, 255, 4, 12); // Larger flash size

      // Bright red flash with white center
      //fill(255, 255, 255, flash.intensity * 1); // White center
      //noStroke();
      //ellipse(canvasBarX, flashY, flashSize * 0.4, flashSize * 0.4);

      // Fade flash intensity
      flash.intensity *= 0.85;
    }
  }

  // Remove faded flashes
  triggerFlashes = triggerFlashes.filter(flash => flash.intensity > 10);

  // Draw threshold control buttons
  drawThresholdButtons(canvasBarX, videoY + barHeight / 2);
  
 
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

function drawMuteButton() {
  // Draw mute button background
  if (isMuted) {
    fill(255, 100, 100, 200); // Red background when muted
  } else {
    fill(255, 255, 255, 150); // White background when unmuted
  }
  noStroke();
  ellipse(muteButtonX, muteButtonY, muteButtonSize, muteButtonSize);
  
  // Draw speaker icon
  if (isMuted) {
    // Draw muted speaker (X over speaker)
    fill(255); // White icon
    strokeWeight(2);
    stroke(255);
    // Speaker shape (simplified)
    rect(muteButtonX - 4, muteButtonY - 3, 3, 6);
    triangle(muteButtonX - 1, muteButtonY - 3, muteButtonX + 2, muteButtonY - 5, muteButtonX + 2, muteButtonY + 5);
    triangle(muteButtonX + 2, muteButtonY + 5, muteButtonX - 1, muteButtonY + 3, muteButtonX + 2, muteButtonY + 5);
    // X mark
    line(muteButtonX + 3, muteButtonY - 4, muteButtonX + 7, muteButtonY + 4);
    line(muteButtonX + 7, muteButtonY - 4, muteButtonX + 3, muteButtonY + 4);
  } else {
    // Draw unmuted speaker
    fill(0); // Black icon
    strokeWeight(2);
    stroke(0);
    // Speaker shape
    rect(muteButtonX - 4, muteButtonY - 3, 3, 6);
    triangle(muteButtonX - 1, muteButtonY - 3, muteButtonX + 2, muteButtonY - 5, muteButtonX + 2, muteButtonY + 5);
    triangle(muteButtonX + 2, muteButtonY + 5, muteButtonX - 1, muteButtonY + 3, muteButtonX + 2, muteButtonY + 5);
    // Sound waves
    noFill();
    arc(muteButtonX + 3, muteButtonY, 4, 4, -PI/4, PI/4);
    arc(muteButtonX + 4, muteButtonY, 6, 6, -PI/4, PI/4);
  }
  
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Check if mouse is over mute button first
  const muteDistance = dist(mouseX, mouseY, muteButtonX, muteButtonY);
  if (muteDistance <= muteButtonSize / 2) {
    isMuted = !isMuted; // Toggle mute state
    return;
  }

  // Calculate current video display dimensions
  const targetVideoHeight = height * 0.7;
  const videoAspectRatio = 810 / 1080;
  const displayVidH = targetVideoHeight;
  const displayVidW = displayVidH * videoAspectRatio;
  const videoX = (width - displayVidW) / 2;
  const videoY = (height - displayVidH) / 2;

  const canvasBarX = barX * width;
  const barCenterY = videoY + displayVidH / 2;

  // Calculate button positions
  const minusX = canvasBarX - buttonOffset;
  const plusX = canvasBarX + buttonOffset;

  // Check if mouse is over minus button (decrease sensitivity = increase threshold)
  const minusDistance = dist(mouseX, mouseY, minusX, barCenterY);
  if (minusDistance <= buttonSize / 2) {
    buttonPressed = 'minus'; // Set visual feedback
    threshold = Math.min(255, threshold + 5); // Decrease sensitivity, maximum 255
    console.log(`Sensitivity decreased (threshold: ${threshold})`);
    return;
  }

  // Check if mouse is over plus button (increase sensitivity = decrease threshold)
  const plusDistance = dist(mouseX, mouseY, plusX, barCenterY);
  if (plusDistance <= buttonSize / 2) {
    buttonPressed = 'plus'; // Set visual feedback
    threshold = Math.max(50, threshold - 5); // Increase sensitivity, minimum 50
    console.log(`Sensitivity increased (threshold: ${threshold})`);
    return;
  }

  // Check if mouse is over the bar (wider hit area for easier interaction)
  const hitAreaWidth = 40; // Much wider hit area than the visual barWidth (8px)
  if (mouseX >= canvasBarX - hitAreaWidth / 2 && mouseX <= canvasBarX + hitAreaWidth / 2 &&
    mouseY >= videoY && mouseY <= videoY + displayVidH) {
    isDragging = true;
  }
}

function mouseDragged() {
  if (isDragging) {
    updateBarPosition();
  }
}

function mouseReleased() {
  isDragging = false;
  buttonPressed = null; // Reset button press state for visual feedback
}

function updateBarPosition() {
  // Calculate current video display dimensions
  const targetVideoHeight = height * 0.7;
  const videoAspectRatio = 810 / 1080;
  const displayVidH = targetVideoHeight;
  const displayVidW = displayVidH * videoAspectRatio;
  const videoX = (width - displayVidW) / 2;

  // Convert mouse position to video-relative coordinates
  const mouseXInVideo = mouseX - videoX;

  // Constrain to video boundaries
  const constrainedX = constrain(mouseXInVideo, 0, displayVidW);

  // Convert back to canvas coordinates and then to 0-1 range
  const canvasX = videoX + constrainedX;
  barX = canvasX / width;
}

function updateCursor() {
  // Check if mouse is over mute button first
  const muteDistance = dist(mouseX, mouseY, muteButtonX, muteButtonY);
  if (muteDistance <= muteButtonSize / 2) {
    cursor('pointer');
    return;
  }

  // Calculate current video display dimensions
  const targetVideoHeight = height * 0.7;
  const videoAspectRatio = 810 / 1080;
  const displayVidH = targetVideoHeight;
  const displayVidW = displayVidH * videoAspectRatio;
  const videoX = (width - displayVidW) / 2;
  const videoY = (height - displayVidH) / 2;

  const canvasBarX = barX * width;
  const barCenterY = videoY + displayVidH / 2;

  // Calculate button positions
  const minusX = canvasBarX - buttonOffset;
  const plusX = canvasBarX + buttonOffset;

  // Check if mouse is over threshold buttons
  const minusDistance = dist(mouseX, mouseY, minusX, barCenterY);
  const plusDistance = dist(mouseX, mouseY, plusX, barCenterY);

  if (minusDistance <= buttonSize / 2 || plusDistance <= buttonSize / 2) {
    cursor('pointer'); // Pointer cursor for buttons
  } else if (isDragging) {
    cursor('grabbing'); // Closed hand when dragging
  } else {
    // Check if mouse is over the bar (wider hit area for easier hovering)
    const hitAreaWidth = 40; // Much wider hit area than the visual barWidth (8px)
    if (mouseX >= canvasBarX - hitAreaWidth / 2 && mouseX <= canvasBarX + hitAreaWidth / 2 &&
      mouseY >= videoY && mouseY <= videoY + displayVidH) {
      cursor('grab'); // Open hand when hovering over bar
    } else {
      cursor(ARROW); // Default cursor when not over anything interactive
    }
  }
}

function keyPressed() {
  // Toggle audio state when SPACE is pressed
  if (key === ' ') {
    if (!audioStarted) {
      userStartAudio();
      audioStarted = true;
      audioPaused = false;
      console.log("Audio context started!");
    } else {
      audioPaused = !audioPaused;
      console.log(audioPaused ? "Audio paused!" : "Audio resumed!");
    }
  }
}