//setting up global variables
let particles = [];
let num = 5000;
let n = 2;
let m = 3;
let threshold = 0.08;
let minNM = 1;
let maxNM = 20;
let mic, fft;
let audioStarted = false;
let soundLevel = 0; // 0 = silence, 1 = loud sound


function setup() {
  //turn on mic and set imput mode 
  createCanvas(800, 800);
  
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 512); // Smoothing and bins for better response
  fft.setInput(mic);

// for loop created pushing new particles (created seperatly) into canvas
  for (let i = 0; i < num; i++) {
    particles.push(new Particle());
  }
}

function mousePressed() {
  // Start audio on user interaction
  if (!audioStarted) {
    userStartAudio();
    mic.start();
    audioStarted = true;
  }
}

function draw() {
  background(220); // Light gray background

  // Show instruction if audio not started
  if (!audioStarted) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Click to start microphone", width / 2, height / 2);
    return;
  }

  // Analyse the mic input and get dominant frequencies
  let spectrum = fft.analyze();
  let freq = fft.getCentroid();
  let micLevel = mic.getLevel() * 10; // Amplify the display value
  let energy = fft.getEnergy("bass", "treble"); // Get overall energy

  // Map sound level: 0-255 energy scale. Use this directly to control behavior
  // High energy = seek patterns, low energy = chaos
  soundLevel = map(energy, 0, 255, 0, 1, true); // Normalized 0-1 (global variable)
  window.soundLevel = soundLevel; // Explicitly set as window property

  // Map the frequency to Chladni pattern modes
  updateNM(freq);

  // Update and draw particles (update and display writen in particle.js file)
  for (let p of particles) {
    p.update();
    p.display();
  }

  // Display frequency and mode info on screen
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  text(`Frequency: ${freq.toFixed(0)} Hz`, 10, 10);
  text(`Mode: n=${n}, m=${m}`, 10, 30);
  text(`Mic Level: ${(micLevel * 100).toFixed(1)}%`, 10, 50);
  text(`Energy: ${energy.toFixed(0)}`, 10, 70);
  text(`Sound Level: ${soundLevel.toFixed(2)}`, 10, 90);
}

// function for Chladni equation set - this is taken from web reference
function chladni(x, y) {
  let L = 1;
  return (
    cos((n * PI * x) / L) * cos((m * PI * y) / L) -
    cos((m * PI * x) / L) * cos((n * PI * y) / L)
  );
}

// Map microphone frequency (Hz) to Chladni mode (n, m)
function updateNM(freq) {
  // Frequency ranges Chladni diagrams
  if (freq < 592) { n = 1; m = 2; }         
  else if (freq < 701) { n = 2; m = 2; }   
  else if (freq < 776) { n = 2; m = 3; }      
  else if (freq < 1257) { n = 3; m = 3; }     
  else if (freq < 1378) { n = 2; m = 4; }     
  else if (freq < 1553) { n = 3; m = 4; }     
  else if (freq < 1959) { n = 4; m = 4; }     
  else if (freq < 1960) { n = 4; m = 5; }     
  else { n = 5; m = 5; }                      
}
