let displayText = "Loading...";
let emotionWord = "";
let animalWord = "";
let countryWord = "";
let emojiWord = "";

let emotionPosition = -1;
let animalPosition = -1;
let countryPosition = -1;
let emojiPosition = -1;

let data;
let emotions = [];
let animals = [];
let countries = [];
let emojis = [];


function setup() {
  createCanvas(windowWidth, windowHeight);

  // jsonLoaded is a calllback function which runs when json is loaded successfully
  data = loadJSON("social_data.json", jsonLoaded);
}

function draw() {
  background(220);
}


function updateEmotionDisplay() {
  // Capitalize first letter of emotion word
  let capitalizedEmotion = emotionWord.charAt(0).toUpperCase() + emotionWord.slice(1);
  
  // Update individual word elements
  document.getElementById('emotion-word').textContent = capitalizedEmotion;
  document.getElementById('animal-word').textContent = animalWord;
  document.getElementById('country-word').textContent = countryWord;
  document.getElementById('emoji-word').textContent = emojiWord;
  
  // Calculate individual font sizes based on ranking
  let maxSize = 108;
  let minSize = 18;
  
  // Emotion word size
  let emotionSize = minSize;
  if (emotionPosition >= 0 && emotions.length > 0) {
    emotionSize = map(emotionPosition, 0, emotions.length - 1, maxSize, minSize);
    emotionSize = constrain(emotionSize, minSize, maxSize);
  }
  document.getElementById('emotion-word').style.setProperty('--emotion-size', emotionSize + 'px');
  
  // Animal word size
  let animalSize = minSize;
  if (animalPosition >= 0 && animals.length > 0) {
    animalSize = map(animalPosition, 0, animals.length - 1, maxSize, minSize);
    animalSize = constrain(animalSize, minSize, maxSize);
  }
  document.getElementById('animal-word').style.setProperty('--animal-size', animalSize + 'px');
  
  // Country word size
  let countrySize = minSize;
  if (countryPosition >= 0 && countries.length > 0) {
    countrySize = map(countryPosition, 0, countries.length - 1, maxSize, minSize);
    countrySize = constrain(countrySize, minSize, maxSize);
  }
  document.getElementById('country-word').style.setProperty('--country-size', countrySize + 'px');
  
  // Emoji size
  let emojiSize = minSize;
  if (emojiPosition >= 0 && emojis.length > 0) {
    emojiSize = map(emojiPosition, 0, emojis.length - 1, maxSize, minSize);
    emojiSize = constrain(emojiSize, minSize, maxSize);
  }
  document.getElementById('emoji-word').style.setProperty('--emoji-size', emojiSize + 'px');
}

function jsonLoaded() {
  console.log("JSON loaded", data);
  
  emotions = data.emotions_ranked;
  animals = data.animals_ranked;
  countries = data.countries_ranked;
  emojis = data.emojis_ranked;
  
  // Pick random word from each list
  emotionPosition = floor(random(emotions.length));
  animalPosition = floor(random(animals.length));
  countryPosition = floor(random(countries.length));
  emojiPosition = floor(random(emojis.length));
  
  emotionWord = emotions[emotionPosition];
  animalWord = animals[animalPosition];
  countryWord = countries[countryPosition];
  emojiWord = emojis[emojiPosition];
  
  updateEmotionDisplay();
  
  // Display note in HTML element
  if (data.note) {
    document.getElementById('note').textContent = data.note;
  }
}


// Click or tap to load a new random sentence
function mousePressed() {
  if (emotions.length > 0 && animals.length > 0 && countries.length > 0 && emojis.length > 0) {
    emotionPosition = floor(random(emotions.length));
    animalPosition = floor(random(animals.length));
    countryPosition = floor(random(countries.length));
    emojiPosition = floor(random(emojis.length));
    
    emotionWord = emotions[emotionPosition];
    animalWord = animals[animalPosition];
    countryWord = countries[countryPosition];
    emojiWord = emojis[emojiPosition];
    
    updateEmotionDisplay();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
