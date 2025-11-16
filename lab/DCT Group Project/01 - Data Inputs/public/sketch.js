let heartRate = 0;
let motionMagnitude = 0;

let device, server, hrCharacteristic;

// --------- poll motion from server ----------
async function pollMotion() {
  try {
    const res = await fetch('/motion');
    const data = await res.json();
    const x = data.x || 0;
    const y = data.y || 0;
    const z = data.z || 0;
    motionMagnitude = Math.sqrt(x * x + y * y + z * z);
    // console.log('[VIEWER] motionMagnitude', motionMagnitude.toFixed(2));
  } catch (err) {
    console.error('[VIEWER] motion poll error', err);
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

    console.log('Connected to HR, waiting for data...');
  } catch (err) {
    console.error('Bluetooth error:', err);
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
  createCanvas(800, 600);
  textFont('monospace');
  textSize(18);

  const hrBtn = createButton('Connect Garmin HR');
  hrBtn.mousePressed(connectHeartRate);

  // poll motion 10x per second
  setInterval(pollMotion, 100);
}

function draw() {
  background(15);

  fill(255);
  text(`HR: ${heartRate || '--'} bpm`, 20, 40);
  text(`Motion: ${motionMagnitude.toFixed(2)}`, 20, 70);

  const baseR = map(heartRate || 80, 40, 100, 30, 300, true);
  const jitter = map(motionMagnitude, 0, 30, 0, 100, true);

  const cx = width / 2 + random(-jitter, jitter);
  const cy = height / 2 + random(-jitter, jitter);

  noStroke();
  circle(cx, cy, baseR * 2);
}