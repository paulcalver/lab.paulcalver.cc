let objects = [];
let lastSpawnTime = 0;
let interval = 1000; // 1 second
let lifespan = 5000; // 5 seconds
let flip = false; // toggles each spawn
let secBlockH;
let secBlockW;

// --- hour row config ---
const HOUR_COUNT = 24;
const HOUR_MAX_OPACITY = 0.70; // 70%
const HOUR_FADE_OUT_HOURS = 10;
const HOUR_OVERLAP = 2; // px overlap between columns
const HOUR_MARGIN_X = 80; // left/right margin
const HOUR_MARGIN_Y = 40; // bottom margin

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  
}

function draw() {
  background(242, 240, 220);

  // Create a new object every second
  if (millis() - lastSpawnTime > interval) {
    flip = !flip; // toggle between true/false
    objects.push(new Block(width * 0.5, height * 0.5, flip));
    lastSpawnTime = millis();
  }

  // Update and display all objects
  for (let i = objects.length - 1; i >= 0; i--) {
    let b = objects[i];
    b.update();
    b.display();

    if (b.isDead()) objects.splice(i, 1);
  }

  drawHourRow(); // bottom row of hour columns
}

class Block {
  constructor(x, y, rotate90) {
    this.x = x + random(-(width*0.1), width*0.1);
    this.y = y + random(-(height*0.1), height*0.1);
    this.rotate90 = rotate90;
    this.rotationOffset = radians(random(-0.2, 0.2)); // ±0.2 degrees
    this.col = color(226, 229, 0);
    this.birth = millis();
  }

  update() {}

  display() {
    let age = millis() - this.birth;
    let alpha = map(age, 0, lifespan, 130, 0);
    fill(red(this.col), green(this.col), blue(this.col), alpha);
    noStroke();

    secBlockH = height*0.5;
    secBlockW = secBlockH/2.5;

    push();
    translate(this.x, this.y);
    if (this.rotate90) rotate(HALF_PI + this.rotationOffset);
    else rotate(this.rotationOffset);
    rect(0, 0, secBlockW, secBlockH);
    pop();
  }

  isDead() {
    return millis() - this.birth > lifespan;
  }
}

// ---- bottom hour row ----
function drawHourRow() {
  const now = new Date();
  const H = hour();
  const M = minute();
  const S = second();
  const ms = now.getMilliseconds();
  const curHours = H + (M / 60) + (S / 3600) + (ms / 3600000);

  const rowLeft = HOUR_MARGIN_X;
  const rowRight = width - HOUR_MARGIN_X;
  const rowWidth = max(100, rowRight - rowLeft);

  // compute per-column width (with overlap)
  const colW = (rowWidth + HOUR_OVERLAP * (HOUR_COUNT - 1)) / HOUR_COUNT;
  const colH = colW * 1.5; // height = 1.5 × width
  const step = colW - HOUR_OVERLAP;

  const yTop = height - HOUR_MARGIN_Y - colH;
  const baseCol = color(226, 229, 0);

  push();
  rectMode(CORNER);
  noStroke();

  for (let h = 0; h < HOUR_COUNT; h++) {
    let tRel = (curHours - h + 24) % 24;

    // fade logic
    let a = 0;
    if (tRel >= 23 && tRel < 24) {
      // fade-in during previous hour
      a = (tRel - 23) * HOUR_MAX_OPACITY;
    } else if (tRel >= 0 && tRel <= HOUR_FADE_OUT_HOURS) {
      // fade-out after hour start
      a = HOUR_MAX_OPACITY * (1 - (tRel / HOUR_FADE_OUT_HOURS));
    }

    const x = rowLeft + h * step;
    fill(red(baseCol), green(baseCol), blue(baseCol), a * 255);
    rect(x, yTop, colW, colH);
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}