let heartRate = 0;

let motionMagnitude = 0;
let motionX = 0;
let motionY = 0;
let motionZ = 0;

let device, server, hrCharacteristic;

// particle system
let particles = [];
const MAX_PARTICLES = 800;

// --------- poll motion from server ----------
async function pollMotion() {
  try {
    const res = await fetch('/motion');
    const data = await res.json();

    motionX = data.x || 0;
    motionY = data.y || 0;
    motionZ = data.z || 0;

    motionMagnitude = Math.sqrt(
      motionX * motionX +
      motionY * motionY +
      motionZ * motionZ
    );

    // console.log('[VIEWER] motion data', data);
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

// --------- Particle class ----------
class Particle {
  constructor(x, y, size, hue) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.1, 0.5));
    this.acc = createVector(0, 0);
    this.size = size;
    this.life = 255;
    this.hue = hue;
  }

  applyForce(fx, fy) {
    this.acc.x += fx;
    this.acc.y += fy;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // slight drag for fluid feeling
    this.vel.mult(0.97);

    this.life -= 2;
  }

  isDead() {
    return this.life <= 0;
  }

  show() {
    const alpha = this.life;
    // colour fades with life
    fill(this.hue, 80, 100, alpha);
    noStroke();
    circle(this.pos.x, this.pos.y, this.size);
  }
}


// --------- p5 ----------
function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 255);
  textFont('monospace');
  textSize(16);

  const hrBtn = createButton('Connect Garmin HR');
  hrBtn.mousePressed(connectHeartRate);

  // poll motion 10x per second
  setInterval(pollMotion, 100);
}

function draw() {
  // slight trail for fluid feel
  background(0, 0, 0, 30);

  // normalise heart rate roughly
  const hr = heartRate || 80;
  const hrNorm = constrain(map(hr, 40, 160, 0, 1), 0, 1);

  // emission rate based on HR (higher HR = more particles)
  const emission = floor(map(hrNorm, 0, 1, 2, 15));

  // motion force from phone axes (scale down)
  const fx = motionX * 0.5;
  const fy = motionY * -0.5; // invert so up feels up

  // use Z as turbulence / swirl
  const turbulence = motionZ * 0.2;

  // spawn new particles around centre
  for (let i = 0; i < emission; i++) {
    const angle = random(TWO_PI);
    const radius = random(0, 40);

    const px = width / 2 + cos(angle) * radius;
    const py = height / 2 + sin(angle) * radius;

    const size = map(hrNorm, 0, 1, 4, 18);
    const hue = map(hrNorm, 0, 1, 180, 0); // calm = blue/green, high HR = red

    particles.push(new Particle(px, py, size, hue));
  }

  // safety cap
  if (particles.length > MAX_PARTICLES) {
    particles.splice(0, particles.length - MAX_PARTICLES);
  }

  // apply forces & update
  for (const p of particles) {
    // base flow from x/y
    p.applyForce(fx * 0.02, fy * 0.02);

    // turbulance from Z: small perpendicular nudge
    const perp = createVector(-p.vel.y, p.vel.x).setMag(turbulence * 0.01);
    p.applyForce(perp.x, perp.y);

    p.update();
    p.show();
  }

  // remove dead particles
  particles = particles.filter(p => !p.isDead());

  // HUD text
  noStroke();
  fill(0, 0, 100);
  rect(0, 0, 260, 90);
  fill(0);
  text(`HR: ${hr.toFixed(0)} bpm`, 10, 25);
  text(`motionX: ${motionX.toFixed(2)}`, 10, 45);
  text(`motionY: ${motionY.toFixed(2)}`, 10, 65);
  text(`motionZ: ${motionZ.toFixed(2)}`, 10, 85);
}