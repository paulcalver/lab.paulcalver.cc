let displayText = "Loading...";
let emotionWord = "";
let animalWord = "";
let countryWord = "";

let emotionPosition = -1;
let animalPosition = -1;
let countryPosition = -1;

let data;
let emotions = [];
let animals = [];
let countries = [];


function setup() {
  createCanvas(windowWidth, windowHeight);

  // jsonLoaded is a calllback function which runs when json is loaded successfully
  data = loadJSON("emotions.json", jsonLoaded);
}

function draw() {
  background(220);
}


function updateEmotionDisplay() {
  let emotionEl = document.getElementById('emotion');
  
  // Capitalize first letter of emotion word
  let capitalizedEmotion = emotionWord.charAt(0).toUpperCase() + emotionWord.slice(1);
  
  // Build sentence: "[Emotion] [animal] in [country]"
  let sentence = `${capitalizedEmotion} ${animalWord} in ${countryWord}`;
  emotionEl.textContent = sentence;
  
  // Calculate average position for overall font sizing
  let avgPosition = (emotionPosition + animalPosition + countryPosition) / 3;
  let maxSize = windowWidth * 0.8 / sentence.length * 1.5;
  let minSize = 24;
  
  let fontSize = minSize;
  if (avgPosition >= 0) {
    let maxListLength = Math.max(emotions.length, animals.length, countries.length);
    fontSize = map(avgPosition, 0, maxListLength - 1, maxSize, minSize);
    fontSize = constrain(fontSize, minSize, maxSize);
  }
  emotionEl.style.setProperty('--emotion-size', fontSize + 'px');
}

function jsonLoaded() {
  console.log("JSON loaded", data);
  
  emotions = data.emotions_ranked;
  animals = data.animals_ranked;
  countries = data.countries_ranked;
  
  // Pick random word from each list
  emotionPosition = floor(random(emotions.length));
  animalPosition = floor(random(animals.length));
  countryPosition = floor(random(countries.length));
  
  emotionWord = emotions[emotionPosition];
  animalWord = animals[animalPosition];
  countryWord = countries[countryPosition];
  
  updateEmotionDisplay();
  
  // Display note in HTML element
  if (data.note) {
    document.getElementById('note').textContent = data.note;
  }
}

function getASCIIValues(str) {
  let asciiArray = [];
  for (let i = 0; i < str.length; i++) {
    asciiArray.push(str.charCodeAt(i));
  }
  return asciiArray;

}

// Click or tap to load a new random sentence
function mousePressed() {
  if (emotions.length > 0 && animals.length > 0 && countries.length > 0) {
    emotionPosition = floor(random(emotions.length));
    animalPosition = floor(random(animals.length));
    countryPosition = floor(random(countries.length));
    
    emotionWord = emotions[emotionPosition];
    animalWord = animals[animalPosition];
    countryWord = countries[countryPosition];
    
    updateEmotionDisplay();
  }
}

// Also support touch on mobile
function touchStarted() {
  mousePressed();
  // prevent default to avoid double events on some devices
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
