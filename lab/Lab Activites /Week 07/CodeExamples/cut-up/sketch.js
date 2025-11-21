/*
Class demo of selecting random lines, like the cut up technique

*/


let displayText = "Don't show this boring sentence, click to generate some text instead!";

//data structure
let lines = []; // for cut up generator


function preload() {
  //load strings breaks your text on new line character
  lines = loadStrings("taleOfTwoCities.txt");
  
}

function setup() {
  createCanvas(500, 500);

  console.log(lines);
}

function draw() {
  background(200);

  let fontSize = map(displayText.length,0,200,30,20,true);
  textSize(fontSize);
  textWrap(WORD);
  textAlign(CENTER);
  text(displayText,50, 50, 400);

}

function mousePressed(){

  //generate cut up lines
  let randomNumLines = int(random(3,6));
  displayText = generateCutUpLines(randomNumLines);

}

function cleanLine(line){
  // console.log("With punctuation: " + line);

 // line = line.replace(/[\.,?!]/g,""); //or a regex to replace only certain punctuation
  line = line.replace(/[^a-zA-Z ']/g,"");//everything except letters, whitespace & '

  line = line.toLowerCase();// make all lower case
  line = line.trim(); // remove white space at front and end of sentence

  return line;

}

// Select random lines from our text 
function generateCutUpLines(numLines){
  let output = "";

  //implement your code to generate the output
  for(let i = 0; i < numLines; i++){

    let randomIndex = int(random(0,lines.length));
    let randomLines = cleanLine(lines[randomIndex]);

    //if our line is an empty string
    if(randomLines.length == 0){
      console.log("Empty line: ", randomLines.length);
      i--; // subtract one from i so we can try get another line
    }else{
      output += randomLines + ". ";// Add some punctionation and a white space 
    }
  }

  return output;
}
