let heartRate = 0;
let motionMagnitude = 0;

let textAlpha = 0.3;

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

        // Three-axis magnitude
        motionMagnitude = Math.sqrt(
            motionX * motionX +
            motionY * motionY +
            motionZ * motionZ
        );

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

// --------- p5 ----------
function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('monospace');
    textSize(12);
    colorMode(HSB);

    // poll motion 10x per second
    setInterval(pollMotion, 100);

    // poll +24h weather every 30 seconds
    pollWeather24(); // initial call
    setInterval(pollWeather24, 30 * 1000);

}

function draw() {

    const sw = shortwave24 != null ? shortwave24.toFixed(0) : '--';
    let swColour = map(shortwave24, 0, 60, 250, 20);
    swColour = constrain(swColour, 20, 250);
    let swBrightness = map(motionMagnitude, 0, 30, 40, 60);
    swBrightness = constrain(swBrightness, 40, 60);
    let swShift = map(motionX, -20, 20, -80, 80);
    swShift = constrain(swShift, -80, 80);
    

    console.log(swColour);
    background(swColour + swShift, 100, swBrightness);

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
    const insideButton =
        mouseX >= HR_BTN_X &&
        mouseX <= HR_BTN_X + HR_BTN_W &&
        mouseY >= HR_BTN_Y &&
        mouseY <= HR_BTN_Y + HR_BTN_H;

    if (insideButton && !hrConnected) {
        connectHeartRate();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}