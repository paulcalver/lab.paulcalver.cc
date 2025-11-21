/*
Presse q w or e to see different emoji groups

Download and read the emojis.json file to understand what the groups are
And what values are stored for each emoji

*/

let displayText = "Loading...";

//emoji data
let data;
let emojis = [];


function setup() {
  createCanvas(400, 400);


  // jsonLoaded is a calllback function which runs when json is loaded successfully
  data = loadJSON("emojis.json", jsonLoaded);


}

function draw() {
  background(200);

  let fontSize = map(displayText.length, 0, 900, 30, 12, true);
  textSize(fontSize);
  textWrap(WORD);
  textAlign(CENTER);
  text(displayText, width * 0.05, width * 0.05, width * 0.9);

}


function jsonLoaded() {
  console.log("JSON loaded", data);
  emojis = data.emojis;
  //TRY:
  //Animals-Nature
  //Food-Drink
  //Symbols
  //Smileys-Emotion
  displayText = displayEmojiCategory("Animals-Nature");
}


function keyPressed() {
  if (key == 'q') {

    //search for a key value pair in all Groups
    let filteredArray = filterEmojis("Name", "tree")
    displayText = createEmojiString(filteredArray);//returns a string of emojis

  }
  if (key == 'w') {

    //"Animals-Nature", "Subgroup", "animal-mammal"
    // "Smileys-Emotion","Name","heart"
    //search a key value pair within in an emoji Group
    let filteredGroupArray = filterEmojisInCategory("Animals-Nature", "Subgroup", "animal-mammal");
    displayText = createEmojiString(filteredGroupArray);//returns a string of emojis

  }
  if (key == 'e') {

    //display whole emoji group
    displayText = displayEmojiCategory("Food-Drink");//returns a string of emojis

  }

  if (key == 's') {

    //display whole emoji group
    let filteredArray = filterEmojis("Status", "unqualified")
    displayText = createEmojiString(filteredArray);//returns a string of emojis

  }

  /////////////CHALLENGE/////////////////
  //if a different key is pressed show a different set of emojis
  //HINT: read the enojis.json file


}

//example showing search through whole array using for loop
// and if statements to check if Group matches category parameter
function displayEmojiCategory(emojiCategory) {

  let emojiString = "";

  for (let i = 0; i < emojis.length; i++) {
    if (emojis[i].Group == emojiCategory) {
      emojiString += emojis[i].Representation + " ";
    }
  }

  return emojiString;
}


//create string from array of emoji objects
function createEmojiString(emojiArray) {

  let emojiString = "";

  //using an array to loop and add to string (you could also use the p5 join() functionality instead)
  for (let i = 0; i < emojiArray.length; i++) {
    emojiString += emojiArray[i].Representation + " ";//add white space between each emoji
  }

  return emojiString;
}

//example of array filtering with an array of objects
//check in all emojis for a key value pair
function filterEmojis(key, value) {

  let array = emojis.filter(function (item) {
    return item[key].includes(value);
  });

  return array;
}

//example of array filtering with an array of objects
//check in Group of emojis for a key value pair
function filterEmojisInCategory(category, key, value) {

  let array = emojis.filter(function (item) {
    return item.Group === category && item[key].includes(value);
  });

  return array;
}