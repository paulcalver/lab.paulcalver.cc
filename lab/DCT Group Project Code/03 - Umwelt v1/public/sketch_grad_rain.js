
let heartRate = 0;
let motionMagnitude = 0;
let smoothedMidShift = 0; // For smoothing gradient shift
let smoothedMotionAlpha = 0; // Smoothed alpha that fades gradually

let textAlpha = 0.0;
let cursorVisible = true; // Toggle cursor visibility

let hrConnected = false;
const HR_BTN_X = 150;
const HR_BTN_Y = 45;
const HR_BTN_W = 180;
const HR_BTN_H = 24;

let motionX = 0;
let motionY = 0;
let motionZ = 0;

let device, server, hrCharacteristic;

// -------- weather +24h state --------
let temp24 = null;
let cloud24 = null;
let rainProb24 = null;
let rain24 = null;
let wind24 = null;
let humidity24 = null;
let pressure24 = null;
let alpha24 = null;
let targetTime24 = '';
let shortwave24 = null;
let visibility24 = null;
let dewpoint24 = null;
let windDir24 = null;
let windGust24 = null;

// --------- Rain Variables ----------
let cols = 100;
let rows = cols * 0.6;

// Animation variables
let animatingNumbers = []; // Array to store numbers that are animating
let animationDuration = 2000; // 2 seconds in milliseconds
let baseRippleRadius = 15; // Base ripple radius (will be scaled by volume)
let rippleStrength = 1; // Strength of ripple effect (0-1)

// Audio variables
let rainSound;
let fft;
let audioThreshold = 0.005; // Lower threshold for better responsiveness
let lastTriggerTime = 0;
let minTimeBetweenDrops = 20; // Very fast drops for multiple simultaneous drops

// -------- poll +24h weather from server --------
async function pollWeather24() {
    try {
        const res = await fetch('/weather24');
        const data = await res.json();

        temp24 = data.temperature_24h;
        cloud24 = data.cloudcover_24h;
        rainProb24 = data.precip_prob_24h;
        rain24 = data.rain_24h;
        wind24 = data.windspeed_24h;
        humidity24 = data.humidity_24h;
        pressure24 = data.pressure_24h;

        shortwave24 = data.shortwave_24h;
        visibility24 = data.visibility_24h;
        dewpoint24 = data.dewpoint_24h;
        windDir24 = data.winddir_24h;
        windGust24 = data.windgusts_24h;

        alpha24 = data.alpha;
        targetTime24 = data.target_time;

        //console.log('[WEATHER24]', data);
    } catch (err) {
        //console.error('[WEATHER24] poll error', err);
    }
}

// --------- poll motion from server ----------
async function pollMotion() {
    try {
        const res = await fetch('/motion');
        const data = await res.json();

        motionX = data.x || 0;
        motionY = data.y || 0;
        motionZ = data.z || 0;

        // Remove gravity from Z axis (phone at rest shows -9.8 due to gravity)
        let adjustedZ = motionZ + 9.8;
        
        // Three-axis magnitude
        let rawMagnitude = Math.sqrt(
            motionX * motionX +
            motionY * motionY +
            adjustedZ * adjustedZ
        );
        
        // Dead zone: ignore small values (sensor noise when still)
        let deadZone = 0.5; // Smaller threshold now that gravity is removed
        motionMagnitude = rawMagnitude > deadZone ? rawMagnitude - deadZone : 0;

        //console.log('[VIEWER] motion data', data);

    } catch (err) {
        //console.error('[VIEWER] motion poll error', err);
    }
}

// --------- Web Bluetooth for Garmin HR ----------
async function connectHeartRate() {
    try {
        const serviceUuid = 'heart_rate';
        const characteristicUuid = 'heart_rate_measurement';

        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [serviceUuid] }]
        });

        server = await device.gatt.connect();
        const service = await server.getPrimaryService(serviceUuid);
        hrCharacteristic = await service.getCharacteristic(characteristicUuid);

        await hrCharacteristic.startNotifications();
        hrCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRate);

        hrConnected = true;
        console.log('Connected to HR, waiting for data...');
    } catch (err) {
        console.error('Bluetooth error:', err);
        hrConnected = false;
    }
}

function handleHeartRate(event) {
    const data = event.target.value;
    const flags = data.getUint8(0);
    const hr16bit = flags & 0x01;

    if (hr16bit) {
        heartRate = data.getUint16(1, true);
    } else {
        heartRate = data.getUint8(1);
    }
}

function preload() {
    // Load the rain sound file
    rainSound = loadSound('rain.mp3');
}

// Simple circle function - always draws a standard size circle at 0,0
function drawCircle(alpha = 1.0) {
    push();
    fill(0, alpha * 0.5); // alpha: 0-1 range
    noStroke();
    rectMode(CENTER);
    circle(0, 0, 20);  // 20px circle centered at origin
    pop();
}

// Function to draw intensity number - displays the audio intensity value
function drawIntensityNumber(alpha = 1, intensity = 1) {
    push();
    fill(0, alpha * 0.2); // Black text, alpha: 0-1 range
    textAlign(LEFT, CENTER); // Left align, vertically centered
    textSize(12); // Small text size

    // Display intensity as decimal with 4 decimal places
    let displayNumber = intensity.toFixed(4);
    // Position text to the right of the circle (circle radius is 10, so start at x=12)
    text(displayNumber, 12, 0);
    pop();
}

// --------- p5 ----------
function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('monospace');
    textSize(12);
    colorMode(HSB, 360, 100, 100, 1); // Alpha range: 0-1

    // Rain sound setup
    fft = new p5.FFT();
    fft.setInput(rainSound); // Make sure FFT is connected to the sound
    rainSound.amp(0.7); // Set volume to 70%

    // poll motion 10x per second
    setInterval(pollMotion, 100);

    // poll +24h weather every 30 seconds
    pollWeather24(); // initial call
    setInterval(pollWeather24, 30 * 1000);

}

function startAudio() {
  // Ensure audio context is resumed (required for mobile)
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  
  if (rainSound.isPlaying()) {
    rainSound.stop();
    console.log("Rain sound stopped");
  } else {
    rainSound.loop(); // Loop the rain sound
    console.log("Rain sound started");
  }

  // Also trigger a test raindrop on click/touch
  let randomI = floor(random(rows));
  let randomJ = floor(random(cols));
  let crossId = randomI + "_" + randomJ;

  animatingNumbers.push({
    id: crossId,
    i: randomI,
    j: randomJ,
    startTime: millis()
  });
  console.log("Test raindrop triggered at:", randomI, randomJ);
}

function draw() {
    // Gradient background using lerpColor
    //colorMode(HSB);
    let topHue = map(shortwave24, 0, 60, 200, 20);
    topHue = constrain(topHue, 20, 250);
    let bottomHue = map(temp24, -10, 40, 20, 200);
    bottomHue = constrain(bottomHue, 0, 200);
    let topColor = color(topHue, 100, 60);
    let bottomColor = color(bottomHue, 100, 40);

    // Smooth the gradient shift using lerp
    let targetMidShift = map(motionMagnitude, 0, 30, 0, 0);
    smoothedMidShift = lerp(smoothedMidShift, targetMidShift, 1); // 0.1 = smoothing factor

    // Draw vertical gradient with smoothing
    noStroke();
    let bandHeight = 8 // Increase for more smoothing, decrease for more bands
    for (let y = 0; y < height; y += bandHeight) {
        let n = map(y, 0, height, 0, 0.3) + smoothedMidShift;
        n = constrain(n, 0, 1);
        let gradColor = lerpColor(topColor, bottomColor, n);
        gradColor.setAlpha(1); // Alpha: 0-1 range, adjust for more/less blending
        fill(gradColor);
        rect(0, y, width, bandHeight);
    }


let gridSize = height * 1;
  let padding = 4; // Your desired padding
  let spacing = gridSize / rows; // Total space per grid cell
  let blockSize = spacing - padding; // Shape size after accounting for padding

  // Centering 
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;


  // Audio-triggered raindrops
  if (rainSound.isPlaying()) {
    // Get spectrum analysis first
    let spectrum = fft.analyze();

    // Try multiple frequency ranges for rain sounds
    let lowFreq = fft.getEnergy(20, 200);    // Low frequencies
    let midFreq = fft.getEnergy(200, 2000);  // Mid frequencies  
    let highFreq = fft.getEnergy(2000, 8000); // High frequencies (rain hits)

    // Use the highest energy from any frequency range
    let audioLevel = max(lowFreq, midFreq, highFreq);
    let normalizedLevel = audioLevel / 255; // Normalize to 0-1

    // Calculate overall audio intensity for visual scaling
    let overallIntensity = (lowFreq + midFreq + highFreq) / (3 * 255);

    // Debug: show audio level - More detailed
    fill(0);
    textSize(14);
    // text("Audio Level: " + normalizedLevel.toFixed(3), 10, 20);
    // text("Overall Intensity: " + overallIntensity.toFixed(3), 10, 40);
    // text("Active crosses: " + animatingNumbers.length, 10, 60);

    // Multiple drops based on audio intensity
    if (normalizedLevel > audioThreshold && millis() - lastTriggerTime > minTimeBetweenDrops) {
      // Number of drops based on audio intensity (1-5 drops)
      let numDrops = Math.floor(map(overallIntensity, 0, 1, 1, 20));

      // Create multiple raindrops
      for (let drop = 0; drop < numDrops; drop++) {
        let randomI = floor(random(rows));
        let randomJ = floor(random(cols));
        let crossId = randomI + "_" + randomJ + "_" + millis() + "_" + drop; // Unique ID

        // Calculate ripple size based on audio intensity
        let rippleRadius = map(overallIntensity, 0, 1, baseRippleRadius * 0.5, baseRippleRadius * 2);

        animatingNumbers.push({
          id: crossId,
          i: randomI,
          j: randomJ,
          startTime: millis(),
          intensity: overallIntensity,
          rippleRadius: rippleRadius
        });
      }

      lastTriggerTime = millis();
      console.log(`Created ${numDrops} raindrops with intensity: ${overallIntensity.toFixed(3)}`);
    }
  } else {
    // Show instruction when not playing
    fill(0);
    //text("Click to start rain", 10, 30);
  }

  // Calculate motion-based alpha multiplier
  // motionMagnitude ranges from 0 (no movement) to ~30+ (active movement)
  // Map it to alpha range: 0 motion = 0 alpha, higher motion = 1 alpha
  let targetMotionAlpha = map(motionMagnitude, 0, 15, 0, 1, true); // Clamp to 0-1
  
  // Smoothly lerp towards target with slow fade-out
  // When motion increases, respond quickly (0.3)
  // When motion decreases, fade slowly (0.02) for lingering effect
  let lerpSpeed = targetMotionAlpha > smoothedMotionAlpha ? 0.3 : 0.02;
  smoothedMotionAlpha = lerp(smoothedMotionAlpha, targetMotionAlpha, lerpSpeed);
  
  let motionAlpha = smoothedMotionAlpha;
  
  // Grid - only draw numbers where there are impacts
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Check if this position has a direct impact
      let directImpact = animatingNumbers.find(drop =>
        drop.i === i && drop.j === j
      );

      // Only draw if there's a direct impact
      if (directImpact) {
        let bx = startX + j * spacing;
        let by = startY + i * spacing;

        let alpha = 1.0;
        let sizeScale = 1;

        let elapsed = millis() - directImpact.startTime;
        if (elapsed < animationDuration) {
          let progress = elapsed / animationDuration; // 0 to 1 over full animation

          // Scale initial drop size based on audio intensity
          let intensityScale = map(directImpact.intensity || 0.5, 0.35, 0.42, 0.1, 8);

          // Ease-out sine animation: starts big, shrinks to nothing
          let easeOutSine = sin(progress * PI * 0.5); // Sine curve from 0 to PI/2
          let shrinkScale = 1 - easeOutSine; // Invert so it shrinks (1 → 0)
          
          // Prevent scale from getting too small (causes rendering issues)
          shrinkScale = max(shrinkScale, 0.3);
          
          // Sync fade with scale - when scale hits minimum, fade should be 0
          // Map shrinkScale from (0.3 to 1.0) to (0 to 255)
          alpha = map(shrinkScale, 0.3, 1.0, 0, 1);
          alpha = constrain(alpha, 0, 1); // Ensure alpha stays in valid range
          
          // Apply motion magnitude to alpha - no motion = invisible, more motion = more visible
          alpha = alpha * motionAlpha;
          
          sizeScale = intensityScale * shrinkScale; // Start at intensityScale, shrink to minimum

          // Draw circle with scaling transform
          push();
          translate(bx, by);
          
          // Ensure scale is always positive and reasonable
          let finalScale = abs(blockSize / 20 * sizeScale);
          finalScale = constrain(finalScale, 0.1, 10); // Limit scale range
          scale(finalScale);

          // Draw circle (background layer)
          drawCircle(alpha);
          
          pop();
          
          // Draw text at constant size (no scaling transform)
          push();
          translate(bx, by);
          
          // Draw number at constant size - only fades, doesn't scale
          //drawIntensityNumber(alpha, directImpact.intensity || 0.5);

          pop();

        } else {
          // Animation complete, remove from array
          animatingNumbers = animatingNumbers.filter(drop => drop.id !== directImpact.id);
        }
      }
    }
  }
  
  // Draw connections between drops with matching intensities
  //drawIntensityConnections();




















    // Define sw for text calls
    const sw = shortwave24 != null ? shortwave24.toFixed(0) : '--';

    // --- HR connect button ---
    const hovering =
        mouseX >= HR_BTN_X &&
        mouseX <= HR_BTN_X + HR_BTN_W &&
        mouseY >= HR_BTN_Y &&
        mouseY <= HR_BTN_Y + HR_BTN_H;

    if (hrConnected) {
        fill(0, 0, 20, textAlpha);
    } else if (hovering) {
        fill(0, 0, 20, textAlpha * 2);
    } else {
        fill(0, 0, 20, textAlpha);
    }
    noStroke();
    rect(HR_BTN_X, HR_BTN_Y, HR_BTN_W, HR_BTN_H, 4);

    fill(0, 0, 100, textAlpha);
    textAlign(LEFT, CENTER);
    text(
        hrConnected ? 'Garmin HR: Connected' : '< Connect Garmin HR',
        HR_BTN_X + 8,
        HR_BTN_Y + HR_BTN_H / 2
    );

    // Reset text align for the rest of the HUD
    textAlign(LEFT, BASELINE);

    // Motion + HR text

    fill(0, 0, 100, textAlpha);
    text('Human Stats:', 20, 40);
    text(`– HR: ${heartRate || '--'} bpm`, 20, 60);
    text(`– motionX: ${motionX.toFixed(2)}`, 20, 80);
    text(`– motionY: ${motionY.toFixed(2)}`, 20, 100);
    text(`– motionZ: ${motionZ.toFixed(2)}`, 20, 120);
    // Motion visualization
    // Use axes in visuals
    const cx = width / 2 + motionX * 20;
    const cy = height / 2 + motionY * 20;

    const depthPulse = map(motionZ, -20, 20, 10, 200, true);

    noStroke();
    //circle(cx, cy, depthPulse);

    // weather numbers (+24h forecast)

    const py = rainProb24 != null ? rainProb24.toFixed(0) : '--';
    const vis = visibility24 != null ? (visibility24 / 1000).toFixed(1) : '--'; // km
    const ty = temp24 != null ? temp24.toFixed(1) : '--';
    const hy = humidity24 != null ? humidity24.toFixed(0) : '--';
    const dew = dewpoint24 != null ? dewpoint24.toFixed(1) : '--';
    const wy = wind24 != null ? wind24.toFixed(1) : '--';
    const wdir = windDir24 != null ? windDir24.toFixed(0) : '--';
    const wgust = windGust24 != null ? windGust24.toFixed(1) : '--';
    const cly = cloud24 != null ? cloud24.toFixed(0) : '--';
    const pr = pressure24 != null ? pressure24.toFixed(1) : '--';

    text('Weather Stats (All +24h):', 20, 170);

    text('Brightness, colour, warmth influenced by:', 20, 210);
    text(`– Shortwave rad: ${sw} W/m²`, 20, 230);

    text('Audio (rain volume) influenced by:', 20, 270);
    text(`– Rain prob: ${py} %`, 20, 290);

    text('Motion, direction, and intensity influenced by:', 20, 330);
    text(`– Wind Speed: ${wy} km/h`, 20, 350);
    text(`– Wind dir: ${wdir} °`, 20, 370);
    text(`– Wind gusts: ${wgust} km/h`, 20, 390);

    text('Softness / Blur / Diffusion influenced by:', 20, 430);
    text(`– Visibility: ${vis} km`, 20, 450);
    text(`– Dew point: ${dew} °C`, 20, 470);

    text('Other weather stats (not currently used):', 20, 510);
    text(`– Temp: ${ty} °C`, 20, 530);
    text(`– Pressure: ${pr} hPa`, 20, 550);
    text(`– Humidity: ${hy} %`, 20, 570);
    text(`– Cloud: ${cly} %`, 20, 590);

    const alphaText = alpha24 != null ? alpha24.toFixed(4) : '--';
    text(`Alpha: ${alphaText}`, 20, 630);

    // if you want to see which exact time this is for:
    if (targetTime24) {

        text(`Target time: ${targetTime24}`, 20, 650);

    }


}

function mousePressed() {

    // Start/stop the rain sound when clicked
    startAudio();

    const insideButton =
        mouseX >= HR_BTN_X &&
        mouseX <= HR_BTN_X + HR_BTN_W &&
        mouseY >= HR_BTN_Y &&
        mouseY <= HR_BTN_Y + HR_BTN_H;

    if (insideButton && !hrConnected) {
        connectHeartRate();
    }
}

function drawIntensityConnections() {
  // Grid positioning (same as main draw function)
  let gridSize = height * 0.8;
  let padding = 4;
  let spacing = gridSize / rows;
  let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
  let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;
  
  // Find all currently active drops
  let activeDrops = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let directImpact = animatingNumbers.find(drop => drop.i === i && drop.j === j);
      if (directImpact) {
        let elapsed = millis() - directImpact.startTime;
        if (elapsed < animationDuration) {
          
          // Calculate the same fade logic as the drops
          let progress = elapsed / animationDuration;
          let easeOutSine = sin(progress * PI * 0.5);
          let shrinkScale = 1 - easeOutSine;
          shrinkScale = max(shrinkScale, 0.3);
          let calculatedAlpha = map(shrinkScale, 0.3, 1.0, 0, 255);
          calculatedAlpha = constrain(calculatedAlpha, 0, 255);
          
          // Store drop info with screen coordinates and calculated alpha
          activeDrops.push({
            intensity: directImpact.intensity,
            x: startX + j * spacing,
            y: startY + i * spacing,
            alpha: calculatedAlpha, // Use the same fade calculation as drops
            elapsed: elapsed
          });
        }
      }
    }
  }
  
  // Draw lines between drops with matching intensities
  for (let i = 0; i < activeDrops.length; i++) {
    for (let j = i + 1; j < activeDrops.length; j++) {
      let drop1 = activeDrops[i];
      let drop2 = activeDrops[j];
      
      // Only connect if intensities match exactly when rounded to 4 decimal places
      let intensity1Rounded = Math.round(drop1.intensity * 10000) / 10000;
      let intensity2Rounded = Math.round(drop2.intensity * 10000) / 10000;
      
      if (intensity1Rounded === intensity2Rounded) {
        
        // Calculate line alpha based on both drops' visibility
        let lineAlpha = min(drop1.alpha, drop2.alpha) * 0.1; // Dimmer than the drops
        
        // Draw dashed connection line
        push();
        stroke(100, lineAlpha); // Gray color with matching alpha
        strokeWeight(1);
        
        // Set up dashed line pattern
        drawingContext.setLineDash([3, 3]); // 3 pixels on, 3 pixels off
        line(drop1.x, drop1.y, drop2.x, drop2.y);
        
        // Reset line dash for other drawing
        drawingContext.setLineDash([]);
        pop();
        
        // Optional: Draw intensity value at midpoint of line
        let midX = (drop1.x + drop2.x) / 2;
        let midY = (drop1.y + drop2.y) / 2;
        
        push();
        fill(50, lineAlpha);
        textAlign(CENTER, CENTER);
        textSize(10);
        text(drop1.intensity.toFixed(4), midX, midY);
        pop();
      }
    }
  }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
    // Press 'c' to toggle cursor visibility
    if (key === 'c' || key === 'C') {
        cursorVisible = !cursorVisible;
        if (cursorVisible) {
            cursor();
        } else {
            noCursor();
        }
    }
}