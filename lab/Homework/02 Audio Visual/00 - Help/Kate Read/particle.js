//particle class created with assigned properties 
class Particle {
  constructor() {
    this.position = createVector(random(0, width), random(0, height));
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector();
    this.maxSpeed = 50; // Much higher to respond faster
    this.maxForce = 1.5; // Much stronger force
  }

  // keeps within canvas 
  edges() {
    if (this.position.x > width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = width;

    if (this.position.y > height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = height;
  }

  //x and y now represent particles position in wave pattern, control vibration, show where particle should go next 
  seek() {
    let x = map(this.position.x, 0, width, -1, 1);
    let y = map(this.position.y, 0, height, -1, 1);
    let val = chladni(x, y);
    let target = this.position.copy();

    // soundLevel HIGH (loud) -> ORDER, soundLevel LOW (quiet) -> CHAOS
    let currentSoundLevel = window.soundLevel || 0;
    
    // Debug - log first particle only
    if (this === particles[0] && frameCount % 30 === 0) {
      console.log("SoundLevel:", currentSoundLevel, "Val:", val.toFixed(3), "Threshold:", threshold);
    }
    
    if (currentSoundLevel < 0.4) {
      // Silence/quiet: pure random chaos (CHAOS)
      target.x += random(-5, 5);
      target.y += random(-5, 5);
    } else {
      // Sound present: seek patterns (ORDER)
      if (abs(val) < threshold) {
        // At node: stay and form pattern
        target.x += random(-0.2, 0.2);
        target.y += random(-0.2, 0.2);
      } else {
        // Not at node: seek the pattern STRONGLY
        let gradient = createVector(
          chladni(x + 0.01, y) - val,
          chladni(x, y + 0.01) - val
        );
        gradient.mult(-500); // MUCH stronger pull toward pattern
        target.add(gradient);
      }
    }
// create a vector from current position of particle to target - can be done at up to max speed, different between desired velocity and current velocity found, moves closer to desired position
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    let steering = p5.Vector.sub(desired, this.velocity);
    steering.limit(this.maxForce);
    return steering;
  }
//update given these various property changes
  update() {
    this.edges();
    this.acceleration.add(this.seek());
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  //particle visual properties 
  display() {
    let x = map(this.position.x, 0, width, -1, 1);
    let y = map(this.position.y, 0, height, -1, 1);
    let val = abs(chladni(x, y));
    
    let currentSoundLevel = window.soundLevel || 0;
    
    // Debug: show different colors based on soundLevel
    if (currentSoundLevel > 0.4) {
      stroke(255, 0, 0); // RED when soundLevel is high
    } else {
      stroke(0); // BLACK when soundLevel is low
    }
    noFill();
    
    if (val < threshold) {
      strokeWeight(2.5);
    } else {
      strokeWeight(1);
    }
    point(this.position.x, this.position.y);
  }
}
