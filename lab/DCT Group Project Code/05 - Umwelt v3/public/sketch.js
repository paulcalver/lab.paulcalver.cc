
let heartRate = 0;
let smoothedHeartRate = 0; // Smoothed HR for stable visuals
let smoothedPulseBrightness = 40; // Smoothed brightness for pulse effect
let lastBeatTime = 0; // Track last heartbeat for flash timing
let beatInterval = 1000; // Time between beats in ms
let smoothedAudioLevel = 0; // Smoothed overall audio level for background color
let motionMagnitude = 0;
let smoothedMidShift = 0; // For smoothing gradient shift

let textAlpha = 0.5;
let cursorVisible = true; // Toggle cursor visibility
let qrCodeImg; // QR code image
let audioStarted = false; // Track if audio has been started

let hrConnected = false;
// Bottom bar configuration
const BOTTOM_BAR_HEIGHT = 40;
// Location coordinates
const LAT = 51.5074;
const LON = -0.1278;

let motionX = 0;
let motionY = 0;
let motionZ = 0;
let motionConnected = false;
let lastMotionUpdate = 0;
const MOTION_TIMEOUT = 3000; // Consider disconnected if no update for 3 seconds

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
let soundsPlaying = false; // Track if sounds should be playing
let soundLayers = {}; // Object to store all sound layers
let soundFilters = {}; // Object to store EQ filters for each sound
let fft;
let audioThreshold = 0.005; // Lower threshold for better responsiveness
let lastTriggerTime = 0;
let minTimeBetweenDrops = 20; // Minimum 100ms between drop creation (10 times per second max)

// Sound file mappings to weather variables and motion control
const soundMappings = {
    'ES_Gentle_In_Water_On Wood_Drip_Quiet.mp3': { weather: 'dewpoint24', min: -10, max: 20, motionAxis: 'magnitude' },
    'ES_Heavy Rain_Rainfall 02.mp3': { weather: 'rainProb24', min: 60, max: 100, motionAxis: 'magnitude' },
    'ES_Heavy Rain_Rainfall 03.mp3': { weather: 'rain24', min: 5, max: 20, motionAxis: 'magnitude' },
    'ES_Light Rain_Forest Brazil_Increasing Intensity_04.mp3': { weather: 'humidity24', min: 60, max: 100, motionAxis: 'magnitude' },
    'ES_Light Rain_OnCement_Light Wind.mp3': { weather: 'wind24', min: 10, max: 40, motionAxis: 'magnitude' },
    'ES_Light Rain_Rainfall_01.mp3': { weather: 'rainProb24', min: 20, max: 60, motionAxis: 'magnitude' },
    'ES_Light_Rain_Rainfall 02.mp3': { weather: 'cloud24', min: 50, max: 100, motionAxis: 'magnitude' }
};

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

        // Update connection status if we have recent data
        if (data.t && Date.now() - data.t < MOTION_TIMEOUT) {
            motionConnected = true;
            lastMotionUpdate = Date.now();
        }

        // Remove gravity from Z axis (phone at rest shows -9.8 due to gravity)
        let adjustedZ = motionZ + 9.8;

        // Three-axis magnitude
        let rawMagnitude = Math.sqrt(
            motionX * motionX +
            motionY * motionY +
            adjustedZ * adjustedZ
        );

        // Dead zone: ignore small values (sensor noise when still)
        let deadZone = 0.0; // Smaller threshold now that gravity is removed
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
    // Load QR code image
    qrCodeImg = loadImage('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://paulcalver.studio/umwelt/phone.html');

    // Load all sound files from assets folder
    const soundFiles = [
        'ES_Gentle_In_Water_On Wood_Drip_Quiet.mp3',
        'ES_Heavy Rain_Rainfall 02.mp3',
        'ES_Heavy Rain_Rainfall 03.mp3',
        'ES_Light Rain_Forest Brazil_Increasing Intensity_04.mp3',
        'ES_Light Rain_OnCement_Light Wind.mp3',
        'ES_Light Rain_Rainfall_01.mp3',
        'ES_Light_Rain_Rainfall 02.mp3'
    ];

    soundFiles.forEach(filename => {
        soundLayers[filename] = loadSound('assets/' + filename);
    });
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
    fill(0, alpha * 1); // Black text, alpha: 0-1 range
    textAlign(CENTER, CENTER); // Left align, vertically centered
    textSize(12); // Small text size

    // Display intensity as decimal with 4 decimal places
    let displayNumber = intensity.toFixed(4);
    // Position text to the right of the circle (circle radius is 10, so start at x=12)
    text(displayNumber, 0, 0);
    pop();
}

// --------- p5 ----------
function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('monospace');
    textSize(12);
    colorMode(HSB, 360, 100, 100, 1); // Alpha range: 0-1

    // Setup FFT for the first sound layer (for visualization)
    fft = new p5.FFT();
    let firstSound = Object.values(soundLayers)[0];
    if (firstSound) {
        fft.setInput(firstSound);
    }

    // poll motion 10x per second
    setInterval(pollMotion, 100);

    // poll +24h weather every 30 seconds
    pollWeather24(); // initial call
    setInterval(pollWeather24, 30 * 1000);

    // Update sound volumes every second based on weather
    setInterval(updateSoundVolumes, 1000);
}

// Update all sound layer volumes based on weather data and motion
function updateSoundVolumes() {
    Object.keys(soundMappings).forEach(filename => {
        const mapping = soundMappings[filename];
        const sound = soundLayers[filename];

        if (sound) {
            // Get the weather value
            let weatherValue = eval(mapping.weather); // e.g., rainProb24, wind24, etc.

            let baseVolume = 0;
            if (weatherValue !== null && weatherValue !== undefined) {
                // Map weather value to volume (0 to 1)
                baseVolume = map(weatherValue, mapping.min, mapping.max, 0, 1, true);
            }

            // Get motion multiplier based on assigned axis
            let motionMultiplier = 1;
            if (mapping.motionAxis === 'x') {
                motionMultiplier = map(abs(motionX), 0, 15, 0.2, 1.5, true); // X motion boosts/cuts volume
            } else if (mapping.motionAxis === 'y') {
                motionMultiplier = map(abs(motionY), 0, 15, 0.2, 1.5, true); // Y motion boosts/cuts volume
            } else if (mapping.motionAxis === 'z') {
                motionMultiplier = map(abs(motionZ + 9.8), 0, 15, 0.2, 1.5, true); // Z motion boosts/cuts volume
            } else if (mapping.motionAxis === 'magnitude') {
                motionMultiplier = map(motionMagnitude, 0, 15, 0.2, 1.5, true); // Overall motion boosts/cuts volume
            }

            // Combine weather base volume with motion multiplier
            let finalVolume = baseVolume * motionMultiplier;
            // Apply master volume boost (2x)
            finalVolume = finalVolume * 2.0;
            finalVolume = constrain(finalVolume, 0, 1);

            sound.setVolume(finalVolume);

            // Start looping only if sounds should be playing
            if (soundsPlaying && !sound.isPlaying()) {
                sound.loop();
            }
        }
    });
}

function startAudio() {
    // Ensure audio context is resumed (required for mobile)
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }

    // Toggle all sound layers
    if (soundsPlaying) {
        // Stop all sounds
        soundsPlaying = false;
        Object.values(soundLayers).forEach(sound => sound.stop());
        console.log("All sounds stopped");
    } else {
        // Start all sounds and immediately update volumes based on weather
        soundsPlaying = true;
        updateSoundVolumes();
        console.log("All sounds started");
    }

    // Also trigger a test raindrop on click/touch
    let randomI = floor(random(rows));
    let randomJ = floor(random(cols));
    let crossId = randomI + "_" + randomJ;

    animatingNumbers.push({
        id: crossId,
        i: randomI,
        j: randomJ,
        initialI: randomI,
        initialJ: randomJ,
        startTime: millis()
    });
    console.log("Test raindrop triggered at:", randomI, randomJ);
}

function draw() {
    const sw = shortwave24 != null ? shortwave24.toFixed(0) : '--';

    // Default color when no audio
    let swColour = 200; // Blue by default

    // Smooth heart rate changes to prevent jumps
    if (hrConnected && heartRate > 0) {
        smoothedHeartRate = lerp(smoothedHeartRate, heartRate, 0.1); // Smooth HR changes
    } else {
        smoothedHeartRate = lerp(smoothedHeartRate, 0, 0.05); // Fade out when disconnected
    }

    // Heart rate pulse effect on brightness when connected
    let baseBrightness = 40;
    let swShift = map(motionX, -20, 20, -40, 40);
    swShift = constrain(swShift, -40, 40);

    let finalBrightness = baseBrightness + swShift;

    if (hrConnected && smoothedHeartRate > 0) {
        // Update beat interval based on heart rate
        beatInterval = (60 / smoothedHeartRate) * 1000; // Convert BPM to ms between beats

        // Calculate time since last beat
        let timeSinceLastBeat = millis() - lastBeatTime;

        // Trigger new beat when interval has passed
        if (timeSinceLastBeat >= beatInterval) {
            lastBeatTime = millis();
            timeSinceLastBeat = 0;
        }

        // Calculate fade progress (0 to 1)
        let fadeProgress = timeSinceLastBeat / beatInterval;
        fadeProgress = constrain(fadeProgress, 0, 1);

        // Ease-out fade: starts slow, speeds up (cubic easing)
        let easedProgress = 1 - Math.pow(1 - fadeProgress, 3);

        // Flash from 80 (peak) to 40 (rest)
        let targetPulseBrightness = map(easedProgress, 0, 1, 80, 40);

        // Apply brightness
        finalBrightness = targetPulseBrightness;
    } else {
        // Reset beat timing when disconnected
        lastBeatTime = millis();
        // Fade back to motion-based brightness when disconnected
        smoothedPulseBrightness = lerp(smoothedPulseBrightness, finalBrightness, 0.1);
        finalBrightness = smoothedPulseBrightness;
    }


    let gridSize = height * 1;
    let padding = 4; // Your desired padding
    let spacing = gridSize / rows; // Total space per grid cell
    let blockSize = spacing - padding; // Shape size after accounting for padding

    // Centering 
    let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
    let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;


    // Audio-triggered raindrops
    let anySoundPlaying = Object.values(soundLayers).some(sound => sound.isPlaying());

    if (anySoundPlaying) {
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

        // Smooth audio level for background color
        smoothedAudioLevel = lerp(smoothedAudioLevel, overallIntensity, 0.15);

        // Map audio level to background hue: quiet = blue (200), loud = red (0)
        swColour = map(smoothedAudioLevel, 0.2, 0.4, 200, 0, true); // 0.5 = max expected audio level
        swColour = constrain(swColour, 0, 200);
    } else {
        // When no audio, fade back to blue
        smoothedAudioLevel = lerp(smoothedAudioLevel, 0, 0.05);
        swColour = 200; // Blue
    }

    // Draw background with audio-reactive color
    console.log('Audio level:', smoothedAudioLevel.toFixed(3), 'Color:', swColour.toFixed(0));
    background(swColour, 100, finalBrightness);

    if (anySoundPlaying) {
        // Continue with audio analysis already done above
        let spectrum = fft.analyze();
        let lowFreq = fft.getEnergy(20, 200);
        let midFreq = fft.getEnergy(200, 2000);
        let highFreq = fft.getEnergy(2000, 8000);
        let audioLevel = max(lowFreq, midFreq, highFreq);
        let normalizedLevel = audioLevel / 255;
        let overallIntensity = (lowFreq + midFreq + highFreq) / (3 * 255);

        // Debug: show audio level - More detailed
        push();
        fill(0);
        textSize(14);
        // text("Audio Level: " + normalizedLevel.toFixed(3), 10, 20);
        // text("Overall Intensity: " + overallIntensity.toFixed(3), 10, 40);
        // text("Active crosses: " + animatingNumbers.length, 10, 60);
        pop();

        // Multiple drops based on audio intensity
        if (normalizedLevel > audioThreshold && millis() - lastTriggerTime > minTimeBetweenDrops) {
            // Base number of drops based on audio intensity (1-5 drops)
            let baseNumDrops = map(overallIntensity, 0, 1, 1, 5);

            // Map phone motion magnitude to drop multiplier (1x to 2x more drops)
            let motionDropMultiplier = map(motionMagnitude, 0, 10, 1.0, 2.0, true);

            // Calculate final number of drops with motion boost
            let numDrops = Math.floor(baseNumDrops * motionDropMultiplier);
            numDrops = constrain(numDrops, 1, 20); // Cap at 20 drops max

            // Create multiple raindrops
            for (let drop = 0; drop < numDrops; drop++) {
                let randomI = floor(random(rows));
                let randomJ = floor(random(cols));
                let crossId = randomI + "_" + randomJ + "_" + millis() + "_" + drop; // Unique ID

                // Calculate ripple size based on audio intensity
                let rippleRadius = map(overallIntensity, 0, 1, baseRippleRadius * 0.1, baseRippleRadius * 1);

                animatingNumbers.push({
                    id: crossId,
                    i: randomI,
                    j: randomJ,
                    initialI: randomI,
                    initialJ: randomJ,
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
    let motionAlpha = map(motionMagnitude, 0, 15, 1, 1, true); // Clamp to 0-1

    // Grid - iterate through all active raindrops
    animatingNumbers.forEach(drop => {
        let elapsed = millis() - drop.startTime;

        if (elapsed < animationDuration) {
            let progress = elapsed / animationDuration; // 0 to 1 over full animation

            // Calculate wind drift based on wind speed and direction
            let windDriftX = 0;
            let windDriftY = 0;

            if (wind24 !== null && windDir24 !== null && windGust24 !== null) {
                // Convert wind direction (meteorological: direction FROM) to radians
                // Add 180° to get direction TO, then convert to radians
                let windAngle = (windDir24 + 180) * (PI / 180);

                // Base wind speed mapped to drift
                let baseWindSpeed = wind24;

                // Map wind gust speed (typically 0-60 km/h) to a MUCH larger multiplier range
                let gustMultiplier = map(windGust24, 0, 60, 1.0, 8.0, true);

                // Map phone motion magnitude to gust influence with higher sensitivity
                // Use lower threshold (0-10 instead of 0-15) and square the value for exponential response
                let motionGustInfluence = map(motionMagnitude, 0, 10, 0, 1, true);
                motionGustInfluence = motionGustInfluence * motionGustInfluence; // Square for exponential response

                // Blend between base wind and gusted wind based on phone motion
                let effectiveWindSpeed = baseWindSpeed + (baseWindSpeed * (gustMultiplier - 1) * motionGustInfluence);

                // Map effective wind speed to much larger drift distance in grid cells
                let driftDistance = map(effectiveWindSpeed, 0, 200, 0, 20, true) * progress;

                // Calculate drift components
                windDriftX = cos(windAngle) * driftDistance;
                windDriftY = sin(windAngle) * driftDistance;
            }

            // Apply drift to position
            let currentJ = drop.initialJ + windDriftX;
            let currentI = drop.initialI + windDriftY;

            let bx = startX + currentJ * spacing;
            let by = startY + currentI * spacing;

            let alpha = 1.0;
            let sizeScale = 1;

            // Scale initial drop size based on audio intensity
            let intensityScale = map(drop.intensity || 0.5, 0.05, 0.35, 0.5, 5.0, true);

            // Ease-out sine animation: starts big, shrinks to nothing
            let easeOutSine = sin(progress * PI * 0.5); // Sine curve from 0 to PI/2
            let shrinkScale = 1 - easeOutSine; // Invert so it shrinks (1 → 0)

            // Prevent scale from getting too small (causes rendering issues)
            shrinkScale = max(shrinkScale, 0.3);

            // Sync fade with scale - when scale hits minimum, fade should be 0
            // Map shrinkScale from (0.3 to 1.0) to (0 to 1)
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
            drawIntensityNumber(alpha, drop.intensity || 0.5);

            pop();
        }
    });

    // Clean up completed animations
    animatingNumbers = animatingNumbers.filter(drop => {
        let elapsed = millis() - drop.startTime;
        return elapsed < animationDuration;
    });

    // Draw connections between drops with matching intensities
    drawIntensityConnections();




    // Draw bottom black bar
    fill(0, 0, 0, 0); // Black
    noStroke();
    rect(0, height - BOTTOM_BAR_HEIGHT, width, BOTTOM_BAR_HEIGHT);

    // Prepare weather data
    const py = rainProb24 != null ? rainProb24.toFixed(0) : '--';
    const vis = visibility24 != null ? (visibility24 / 1000).toFixed(1) : '--';
    const dew = dewpoint24 != null ? dewpoint24.toFixed(1) : '--';
    const wy = wind24 != null ? wind24.toFixed(1) : '--';
    const wdir = windDir24 != null ? windDir24.toFixed(0) : '--';
    const wgust = windGust24 != null ? windGust24.toFixed(1) : '--';
    const hy = humidity24 != null ? humidity24.toFixed(0) : '--';

    // Draw text in bottom bar as one string
    textAlign(LEFT, CENTER);
    textSize(14);

    const barY = height - BOTTOM_BAR_HEIGHT / 2;

    // Get current time (hours:minutes:seconds)
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Main info text (white)
    fill(0, 0, 0, textAlpha);
    const infoText = `${LAT.toFixed(4)}°N, ${Math.abs(LON).toFixed(4)}°W | SW: ${sw} W/m² | Wind: ${wy} km/h @ ${wdir}° | Gusts: ${wgust} km/h | Vis: ${vis} km | Dew: ${dew}°C | Humid: ${hy}% | Updated: ${timeStr} | `;
    text(infoText, 20, barY);

    // Check if motion data is stale
    if (Date.now() - lastMotionUpdate > MOTION_TIMEOUT) {
        motionConnected = false;
    }

    // Motion status text - dark red if connected, white if not
    const hrmTextWidth = textWidth(infoText);
    let statusX = 20 + hrmTextWidth;

    if (motionConnected) {
        fill(0, 80, 50, textAlpha); // Dark red
    } else {
        fill(0, 0, 0, textAlpha); // White
    }
    text('Motion', statusX, barY);
    statusX += textWidth('Motion') + 5;

    // HRM text - dark red if connected, white if not
    fill(0, 0, 0, textAlpha); // White separator
    text('|', statusX, barY);
    statusX += textWidth('| ');

    if (hrConnected) {
        fill(0, 80, 50, textAlpha); // Dark red
    } else {
        fill(0, 0, 0, textAlpha); // White
    }
    text('HRM', statusX, barY);

    // Check if cursor is hovering over HRM text
    const hrmWidth = textWidth('HRM');
    const hrmHovering = mouseX >= statusX && mouseX <= statusX + hrmWidth &&
        mouseY >= barY - 10 && mouseY <= barY + 10;

    if (!cursorVisible) {
        noCursor();
    } else if (hrmHovering && !hrConnected) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    // Draw QR code and start button if not connected or audio not started
    if (!motionConnected || !audioStarted) {
        // Semi-transparent overlay
        fill(0, 0, 0, 0.7);
        rect(0, 0, width, height);

        // QR code (only if motion not connected)
        if (!motionConnected && qrCodeImg) {
            imageMode(CENTER);
            let qrSize = 300;
            image(qrCodeImg, width / 2, height / 2 - 100, qrSize, qrSize);

            // Text above QR
            fill(0, 0, 100, 1);
            textAlign(CENTER, CENTER);
            textSize(24);
            text('Scan to connect phone', width / 2, height / 2 - 100 - qrSize / 2 - 40);
        }

        // Start audio text (only if audio not started)
        if (!audioStarted) {
            let btnY = motionConnected ? height / 2 : height / 2 + 220;
            let btnW = 300;
            let btnH = 50;
            let btnX = width / 2 - btnW / 2;

            // Check if hovering over text area
            let btnHovering = mouseX >= btnX && mouseX <= btnX + btnW &&
                mouseY >= btnY && mouseY <= btnY + btnH;

            // Text only - brighter when hovering
            if (btnHovering) {
                fill(0, 0, 100, 1); // Bright white
                cursor(HAND);
            } else {
                fill(0, 0, 80, 1); // Slightly dimmer
            }
            textAlign(CENTER, CENTER);
            textSize(24);
            text('Click to Start Audio', width / 2, btnY + btnH / 2);
        }

        imageMode(CORNER);
    }

}

function mousePressed() {

    // Check if start audio button was clicked
    if (!audioStarted) {
        let btnY = motionConnected ? height / 2 : height / 2 + 220;
        let btnW = 300;
        let btnH = 50;
        let btnX = width / 2 - btnW / 2;

        if (mouseX >= btnX && mouseX <= btnX + btnW &&
            mouseY >= btnY && mouseY <= btnY + btnH) {
            audioStarted = true;
            startAudio();
            return;
        }
    }

    // // Toggle audio on/off if already started
    // if (audioStarted) {
    //     startAudio();
    // }

    // Check if HRM text was clicked
    const barY = height - BOTTOM_BAR_HEIGHT / 2;
    textAlign(LEFT, CENTER);
    textSize(14);
    const infoText = `${LAT.toFixed(4)}\u00b0N, ${Math.abs(LON).toFixed(4)}\u00b0W | SW: ${shortwave24 != null ? shortwave24.toFixed(0) : '--'} W/m\u00b2 | Wind: ${wind24 != null ? wind24.toFixed(1) : '--'} km/h @ ${windDir24 != null ? windDir24.toFixed(0) : '--'}\u00b0 | Gusts: ${windGust24 != null ? windGust24.toFixed(1) : '--'} km/h | Vis: ${visibility24 != null ? (visibility24 / 1000).toFixed(1) : '--'} km | Dew: ${dewpoint24 != null ? dewpoint24.toFixed(1) : '--'}\u00b0C | Humid: ${humidity24 != null ? humidity24.toFixed(0) : '--'}% | Updated: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} | `;

    let statusX = 20 + textWidth(infoText);
    statusX += textWidth('Motion') + 5;
    statusX += textWidth('| ');

    const hrmWidth = textWidth('HRM');

    const hrmClicked = mouseX >= statusX && mouseX <= statusX + hrmWidth &&
        mouseY >= barY - 10 && mouseY <= barY + 10;

    if (hrmClicked && !hrConnected) {
        connectHeartRate();
        return;
    }

    // Toggle audio on/off if already started and not clicking on HRM
    if (audioStarted) {
        startAudio();
    }
}

function drawIntensityConnections() {
    // Grid positioning (same as main draw function)
    let gridSize = height;
    let padding = 4;
    let spacing = gridSize / rows;
    let startX = width * 0.5 - (cols * spacing) * 0.5 + spacing * 0.5;
    let startY = height * 0.5 - (rows * spacing) * 0.5 + spacing * 0.5;

    // Find all currently active drops with their drifted positions
    let activeDrops = [];

    animatingNumbers.forEach(drop => {
        let elapsed = millis() - drop.startTime;

        if (elapsed < animationDuration) {
            let progress = elapsed / animationDuration;

            // Calculate wind drift (same as in main draw)
            let windDriftX = 0;
            let windDriftY = 0;

            if (wind24 !== null && windDir24 !== null && windGust24 !== null) {
                let windAngle = (windDir24 + 180) * (PI / 180);

                // Base wind speed
                let baseWindSpeed = wind24;

                // Map wind gust speed to MUCH larger multiplier
                let gustMultiplier = map(windGust24, 0, 60, 1.0, 8.0, true);

                // Map phone motion magnitude to gust influence with higher sensitivity
                let motionGustInfluence = map(motionMagnitude, 0, 10, 0, 1, true);
                motionGustInfluence = motionGustInfluence * motionGustInfluence; // Square for exponential response

                // Blend between base wind and gusted wind based on phone motion
                let effectiveWindSpeed = baseWindSpeed + (baseWindSpeed * (gustMultiplier - 1) * motionGustInfluence);

                // Map effective wind speed to much larger drift distance
                let driftDistance = map(effectiveWindSpeed, 0, 200, 0, 20, true) * progress;

                windDriftX = cos(windAngle) * driftDistance;
                windDriftY = sin(windAngle) * driftDistance;
            }

            // Apply drift to position
            let currentJ = drop.initialJ + windDriftX;
            let currentI = drop.initialI + windDriftY;

            let x = startX + currentJ * spacing;
            let y = startY + currentI * spacing;

            // Calculate the same fade logic as the drops
            let easeOutSine = sin(progress * PI * 0.5);
            let shrinkScale = 1 - easeOutSine;
            shrinkScale = max(shrinkScale, 0.3);
            let calculatedAlpha = map(shrinkScale, 0.3, 1.0, 0, 1);
            calculatedAlpha = constrain(calculatedAlpha, 0, 1);

            // Store drop info with drifted screen coordinates and calculated alpha
            activeDrops.push({
                intensity: drop.intensity,
                x: x,
                y: y,
                alpha: calculatedAlpha,
                elapsed: elapsed
            });
        }
    });

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
                // Alpha is already in 0-1 range from the new calculation
                let lineAlpha = min(drop1.alpha, drop2.alpha) * 0.5; // 0.5 = initial alpha multiplier (adjust this)

                // Draw dashed connection line
                push();
                stroke(0, 0, 0, lineAlpha); // HSB: hue, sat, brightness, alpha (0-1)
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
                //text(drop1.intensity.toFixed(4), midX, midY);
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