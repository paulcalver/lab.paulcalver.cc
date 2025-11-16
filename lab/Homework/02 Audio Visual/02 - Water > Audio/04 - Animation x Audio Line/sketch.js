// Simplified bouncing circles with fixed detection line
let circles = [];
let animationArea = {};
let tones = [];

// Fixed line position - no dragging
let barX = 0.5; // Fixed position (center of screen)
let numNotes = 8;
let noteGlows = [];
let sparkleDetections = [];
let detectionSections = 8;

// Simple animation controls
let circleSpeed = 5.0;
let maxCircles = 80;
let minCircles = 1;

// Sound debounce - prevent rapid repeated triggers
let soundCooldown = 800; // milliseconds between triggers per circle

// UI variables
let buttonSize = 30;
let buttonPressed = null;

// Audio control
let isMuted = false;
let audioStarted = false;
let audioPaused = false;
let volumeLevel = 0.1; // Volume limiter (0.0 to 1.0) - set to 30% to prevent clipping
let muteButtonSize = 25;
let muteButtonX = 50;
let muteButtonY = 50;

// Animation dimensions
const animW = 810;
const animH = 1080;

function preload() {
  // Load 8 sounds for the detection line
  tones = [
    loadSound('assets/pluck_new_01.mp3'),
    loadSound('assets/pluck_new_02.mp3'),
    loadSound('assets/pluck_new_03.mp3'),
    loadSound('assets/pluck_new_04.mp3'),
    loadSound('assets/pluck_new_05.mp3'),
    loadSound('assets/pluck_new_06.mp3'),
    loadSound('assets/pluck_new_07.mp3'),
    loadSound('assets/pluck_new_08.mp3')
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize arrays
  noteGlows = new Array(numNotes).fill(0);
  sparkleDetections = new Array(detectionSections).fill(0);
  
  // Set volume for all sounds (Safari compatibility)
  for (let tone of tones) {
    tone.setVolume(volumeLevel);
  }
  
  // Create initial circles
  createCircles(8);
  
  noStroke();
}

function createCircles(count) {
  circles = [];
  for (let i = 0; i < count; i++) {
    let vx = random(-2, -0.5);
    if (random() > 0.5) vx = random(0.5, 2);
    
    let vy = random(-2, -0.5);
    if (random() > 0.5) vy = random(0.5, 2);
    
    circles.push({
      x: random(50, animW - 50),
      y: random(50, animH - 50),
      vx: vx,
      vy: vy,
      radius: 15,
      id: i,
      lastTriggerTime: 0 // Track when this circle last triggered a sound
    });
  }
}

function draw() {
  background(0);

  // Calculate animation area
  const targetAnimHeight = height * 0.7;
  const animAspectRatio = 810 / 1080;
  const displayAnimH = targetAnimHeight;
  const displayAnimW = displayAnimH * animAspectRatio;
  const x = (width - displayAnimW) / 2;
  const y = (height - displayAnimH) / 2;

  animationArea = { x: x, y: y, w: displayAnimW, h: displayAnimH };

  // Draw animation background
  fill(20);
  rect(x, y, displayAnimW, displayAnimH);

  // Update and draw circles
  updateCircles();
  drawCircles();

  // Check line intersections
  checkLineIntersections();

  // Audio instructions / button
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);

  if (!isMobile) {
    // Desktop instructions - simple text
    fill(255);
    textAlign(LEFT);
    textSize(14);
    if (!audioStarted) {
      text("Press spacebar to start audio", 20, 30);
    } else if (audioPaused) {
      text("Press spacebar to resume audio", 20, 30);
    } else {
      text("Audio active - circles trigger sounds when crossing line", 20, 30);
    }
  } else {
    // Mobile - prominent button when not playing
    if (!audioStarted || audioPaused) {
      // Draw centered button with rounded rectangle
      const buttonW = 180;
      const buttonH = 50;
      const buttonX = width / 2;
      const buttonY = y + displayAnimH / 2;
      
      // White rounded rectangle
      fill(255, 255, 255, 200);
      noStroke();
      rectMode(CENTER);
      rect(buttonX, buttonY, buttonW, buttonH, 25);
      
      // Black text
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(18);
      if (audioPaused) {
        text("TAP TO RESUME", buttonX, buttonY);
      } else {
        text("TAP TO PLAY", buttonX, buttonY);
      }
      rectMode(CORNER);
    } else {
      // When playing, show small text in corner
      fill(255);
      textAlign(LEFT);
      textSize(12);
      text("Tap center to pause", 20, 30);
    }
  }

  // Draw the detection line
  drawDetectionLine(x, y, displayAnimW, displayAnimH);

    // Draw control buttons
  const controlsY = y + displayAnimH + 60;
  drawControlButtons(x + displayAnimW / 2, controlsY);

  noStroke();
}

function updateCircles() {
  for (let circle of circles) {
    circle.x += circle.vx * circleSpeed;
    circle.y += circle.vy * circleSpeed;

    // Bounce off walls
    if (circle.x - circle.radius <= 0 || circle.x + circle.radius >= animW) {
      circle.vx *= -1;
      circle.x = constrain(circle.x, circle.radius, animW - circle.radius);
    }
    if (circle.y - circle.radius <= 0 || circle.y + circle.radius >= animH) {
      circle.vy *= -1;
      circle.y = constrain(circle.y, circle.radius, animH - circle.radius);
    }
  }
}

function drawCircles() {
  fill(255);
  noStroke();
  
  for (let circle of circles) {
    const screenX = animationArea.x + (circle.x / animW) * animationArea.w;
    const screenY = animationArea.y + (circle.y / animH) * animationArea.h;
    const screenRadius = (circle.radius / animW) * animationArea.w;
    
    ellipse(screenX, screenY, screenRadius * 2, screenRadius * 2);
  }
}

function checkLineIntersections() {
  const canvasBarX = barX * width;
  
  if (canvasBarX < animationArea.x || canvasBarX > animationArea.x + animationArea.w) {
    return;
  }
  
  const lineXInAnim = ((canvasBarX - animationArea.x) / animationArea.w) * animW;
  const lineHeight = animH * 0.7;
  const lineTop = (animH - lineHeight) / 2;
  const lineBottom = lineTop + lineHeight;
  
  for (let circle of circles) {
    if (abs(circle.x - lineXInAnim) < circle.radius) {
      if (circle.y + circle.radius > lineTop && circle.y - circle.radius < lineBottom) {
        const relativeY = circle.y - lineTop;
        const sectionHeight = lineHeight / detectionSections;
        const sectionIndex = Math.floor(relativeY / sectionHeight);
        
        if (sectionIndex >= 0 && sectionIndex < detectionSections) {
          // Check if enough time has passed since this circle's last trigger
          const currentTime = millis();
          if (currentTime - circle.lastTriggerTime > soundCooldown) {
            sparkleDetections[sectionIndex] = Math.max(sparkleDetections[sectionIndex], 200);
            noteGlows[sectionIndex] = Math.max(noteGlows[sectionIndex], 200);
            
            if (audioStarted && !audioPaused && !isMuted && tones[sectionIndex] && tones[sectionIndex].isLoaded()) {
              // Safari fix: ensure sound is ready and play with proper error handling
              try {
                if (tones[sectionIndex].isPlaying()) {
                  tones[sectionIndex].stop();
                }
                tones[sectionIndex].play();
              } catch(e) {
                console.log('Audio play error:', e);
              }
              circle.lastTriggerTime = currentTime; // Update trigger time for this circle
            }
          }
        }
      }
    }
  }
  
  // Fade detection values
  for (let i = 0; i < sparkleDetections.length; i++) {
    sparkleDetections[i] *= 0.9;
    noteGlows[i] *= 0.9;
  }
}

function drawDetectionLine(videoX, videoY, displayW, displayH) {
  const canvasBarX = barX * width;
  const barHeight = displayH;
  const barTop = videoY;

  // Draw line at 70% height, centered
  const lineHeight = barHeight * 0.7;
  const lineTop = barTop + (barHeight - lineHeight) / 2;
  const lineBottom = lineTop + lineHeight;

  // Base line
  stroke(255, 255, 255, 100);
  strokeWeight(12);
  line(canvasBarX, lineTop, canvasBarX, lineBottom);
  
  // Triggered segments
  const detectionSectionHeight = lineHeight / detectionSections;
  for (let i = 0; i < sparkleDetections.length; i++) {
    const sparkleIntensity = sparkleDetections[i];
    
    if (sparkleIntensity > 5) {
      const segmentTop = lineTop + (i * detectionSectionHeight);
      const segmentBottom = segmentTop + detectionSectionHeight;
      
      const baseWidth = 12;
      const maxWidth = 60;
      const segmentWidth = baseWidth + ((sparkleIntensity / 255) * (maxWidth - baseWidth));

      stroke(255, 255, 255, 255);
      strokeWeight(segmentWidth);
      line(canvasBarX, segmentTop, canvasBarX, segmentBottom);
    }
  }
  noStroke();
}

function drawControlButtons(centerX, centerY) {
  const controlSpacing = 120;
  const speedCenterX = centerX - controlSpacing;
  const countCenterX = centerX + controlSpacing;

  // Labels
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("SPEED", speedCenterX, centerY - 25);
  text("BALLS", countCenterX, centerY - 25);
  textSize(12);
  text(`${circleSpeed.toFixed(1)}x`, speedCenterX, centerY - 10);
  text(`${circles.length}`, countCenterX, centerY - 10);

  // Speed buttons
  drawButton(speedCenterX - 30, centerY + 15, 'speed-minus', '-');
  drawButton(speedCenterX + 30, centerY + 15, 'speed-plus', '+');

  // Count buttons  
  drawButton(countCenterX - 30, centerY + 15, 'count-minus', '-');
  drawButton(countCenterX + 30, centerY + 15, 'count-plus', '+');
}

function drawButton(x, y, type, symbol) {
  if (buttonPressed === type) {
    fill(100, 100, 100, 200);
  } else {
    fill(255, 255, 255, 150);
  }
  noStroke();
  ellipse(x, y, buttonSize, buttonSize);
  
  fill(buttonPressed === type ? 255 : 0);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(symbol, x, y);
}

function mousePressed() {
  // Handle audio start/pause for mobile compatibility only
  // Only trigger if not clicking on buttons AND on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);
  
  const targetAnimHeight = height * 0.7;
  const animAspectRatio = 810 / 1080;
  const displayAnimH = targetAnimHeight;
  const displayAnimW = displayAnimH * animAspectRatio;
  const animX = (width - displayAnimW) / 2;
  const animY = (height - displayAnimH) / 2;
  const controlCenterX = animX + displayAnimW / 2;
  const controlCenterY = animY + displayAnimH + 60;
  const controlSpacing = 120;
  
  // Check if clicking on any button
  let clickingButton = false;
  const buttonPositions = [
    {x: controlCenterX - controlSpacing - 30, y: controlCenterY + 15},
    {x: controlCenterX - controlSpacing + 30, y: controlCenterY + 15},
    {x: controlCenterX + controlSpacing - 30, y: controlCenterY + 15},
    {x: controlCenterX + controlSpacing + 30, y: controlCenterY + 15}
  ];
  
  for (let pos of buttonPositions) {
    if (dist(mouseX, mouseY, pos.x, pos.y) <= buttonSize / 2) {
      clickingButton = true;
      break;
    }
  }
  
  // If not clicking on a button AND on mobile device, handle audio start/pause
  if (!clickingButton && isMobile) {
    if (!audioStarted) {
      // Safari requires explicit user interaction to start audio
      getAudioContext().resume().then(() => {
        userStartAudio();
        audioStarted = true;
        audioPaused = false;
      }).catch(err => {
        console.log('Audio context error:', err);
        // Fallback: try anyway
        userStartAudio();
        audioStarted = true;
        audioPaused = false;
      });
    } else {
      audioPaused = !audioPaused;
    }
    return; // Exit early to avoid button checks
  }

  // Calculate button positions
  // Check buttons
  checkButton(controlCenterX - controlSpacing - 30, controlCenterY + 15, 'speed-minus');
  checkButton(controlCenterX - controlSpacing + 30, controlCenterY + 15, 'speed-plus');
  checkButton(controlCenterX + controlSpacing - 30, controlCenterY + 15, 'count-minus');
  checkButton(controlCenterX + controlSpacing + 30, controlCenterY + 15, 'count-plus');
}

function checkButton(x, y, type) {
  const distance = dist(mouseX, mouseY, x, y);
  if (distance <= buttonSize / 2) {
    buttonPressed = type;
    
    if (type === 'speed-minus') {
      circleSpeed = Math.max(0.1, circleSpeed - 0.2);
    } else if (type === 'speed-plus') {
      circleSpeed = Math.min(12.0, circleSpeed + 0.2);
    } else if (type === 'count-minus') {
      const newCount = Math.max(minCircles, circles.length - 1);
      if (newCount !== circles.length) createCircles(newCount);
    } else if (type === 'count-plus') {
      const newCount = Math.min(maxCircles, circles.length + 1);
      if (newCount !== circles.length) createCircles(newCount);
    }
  }
}

function mouseReleased() {
  buttonPressed = null;
}

function keyPressed() {
  if (key === ' ') {
    if (!audioStarted) {
      // Safari requires explicit user interaction to start audio
      getAudioContext().resume().then(() => {
        userStartAudio();
        audioStarted = true;
        audioPaused = false;
      }).catch(err => {
        console.log('Audio context error:', err);
        // Fallback: try anyway
        userStartAudio();
        audioStarted = true;
        audioPaused = false;
      });
    } else {
      audioPaused = !audioPaused;
    }
  }
}

function touchStarted() {
  // Prevent default behavior to avoid scrolling on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);
  
  // Check if touching the play button (mobile only)
  if (isMobile) {
    const targetAnimHeight = height * 0.7;
    const animAspectRatio = 810 / 1080;
    const displayAnimH = targetAnimHeight;
    const displayAnimW = displayAnimH * animAspectRatio;
    const animX = (width - displayAnimW) / 2;
    const animY = (height - displayAnimH) / 2;
    
    // Button dimensions
    const buttonW = 180;
    const buttonH = 50;
    const buttonX = width / 2;
    const buttonY = animY + displayAnimH / 2;
    
    // Check if touching the button area
    if (mouseX >= buttonX - buttonW / 2 && mouseX <= buttonX + buttonW / 2 &&
        mouseY >= buttonY - buttonH / 2 && mouseY <= buttonY + buttonH / 2) {
      if (!audioStarted) {
        // Safari requires explicit user interaction to start audio
        getAudioContext().resume().then(() => {
          userStartAudio();
          audioStarted = true;
          audioPaused = false;
        }).catch(err => {
          console.log('Audio context error:', err);
          // Fallback: try anyway
          userStartAudio();
          audioStarted = true;
          audioPaused = false;
        });
      } else {
        audioPaused = !audioPaused;
      }
      return false; // Prevent default
    }
  }
  
  // Calculate control button positions - MUST MATCH draw() function
  const targetAnimHeight = height * 0.7;
  const animAspectRatio = 810 / 1080;
  const displayAnimH = targetAnimHeight;
  const displayAnimW = displayAnimH * animAspectRatio;
  const animX = (width - displayAnimW) / 2;
  const animY = (height - displayAnimH) / 2;
  const controlCenterX = animX + displayAnimW / 2;
  const controlCenterY = animY + displayAnimH + 60;
  const controlSpacing = 120;
  
  // Check control buttons
  checkButton(controlCenterX - controlSpacing - 30, controlCenterY + 15, 'speed-minus');
  checkButton(controlCenterX - controlSpacing + 30, controlCenterY + 15, 'speed-plus');
  checkButton(controlCenterX + controlSpacing - 30, controlCenterY + 15, 'count-minus');
  checkButton(controlCenterX + controlSpacing + 30, controlCenterY + 15, 'count-plus');
  
  return false; // Prevent default
}

function touchEnded() {
  buttonPressed = null;
  return false; // Prevent default
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}