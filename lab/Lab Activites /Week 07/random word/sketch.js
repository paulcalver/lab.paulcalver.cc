let word = "press keys";  //start text can say "press keys"
let lowerCase = word.toLowerCase(); //a variable we can use to turn our words to lowercase if we want.

let words = [];  //empty array to store our words once generated


function setup() {
  createCanvas(400, 400);

}

function draw() {
  background(220)

  textAlign(CENTER);
  textSize(50);
  text(word, width / 2, height / 2) //text will display the "word" variable

  textSize(20);
  let asciiValues = getASCIIValues(word); 

  text(asciiValues.join(""), width / 2, height / 2 + 50);

}

function keyPressed() {

  word = ""
  let wordLength = floor(random(4, 10));

  for (let i = 0; i < wordLength; i++) {
    let ascii = floor(random(97, 120));
    let c = char(ascii)
    word += c

  }

  words.push(word)
  if (key === "s") {

    saveStrings(words, "wordString.txt");
  }

}

function getASCIIValues(str) {
  let asciiArray = [];
  for (let i = 0; i < str.length; i++) {
    asciiArray.push(str.charCodeAt(i));
  }
  return asciiArray;

}

