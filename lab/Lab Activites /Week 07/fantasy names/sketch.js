

//Fantasy Name Generator: generates names by combining syllables

let nameList = []; //empty array we can push names into usign generateName custom function
let currentName = "";
let maxNames = 100; //change for more names 

// some syllables to make more “fantasy”-vibe names
let syllables = [
  "an", "el", "or", "ra", "th", "il", "da", "mar", "ven", "sol",
  "ka", "ly", "fi", "na", "ri", "za", "lo", "qui", "ta", "se"
];

function setup() {
  createCanvas(500, 400);
  textAlign(CENTER, CENTER);
  textSize(36);
  background(240);
  fill(0);
  text("Click to generate a new name", width/2, height/2);
}

function draw() {
  // nothing here; we generate names only on click. Can delete the draw function
}

function mousePressed() {
  generateName(); //custom function (below) which generates the names
}

function generateName() {
  currentName = "";
  let numSyllables = floor(random(2, 4)); // 2 or 3 syllables
  
  for (let i = 0; i < numSyllables; i++) {
    currentName += random(syllables);
  }

  // capitalize first letter
  currentName = currentName.charAt(0).toUpperCase() + currentName.slice(1);

  // display the name
  background(240);
  fill(random(50, 255), random(50, 255), random(50, 255));
  text(currentName, width / 2, height / 2);

  // store name in the nameList array
  if (nameList.length >= maxNames) {
    nameList.pop(); // remove oldest
  }
  nameList.push(currentName);
}

function keyPressed() {
  if (key == 's' || key == 'S') {
    saveStrings(nameList, "fantasy_names.txt");
  }
}
