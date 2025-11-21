/*
  Gibber
  Generate random words, export to text file
*/

let word = "";
let numWords = 50;
let lang = [];

function setup(){
  createCanvas(800,600);

}

function draw(){
  background(255);
  textAlign(CENTER);
  textSize(48);

  //generate new word
  updateWord();

  fill(0);
  text(word, width/2, height/2);
}

function updateWord(){
  word = "";
  let len = floor(random(1, 15));
  for(let i  = 0 ; i < len; i++){
      let c = char(floor(random(97,122))); // the ascii range for normal characters
      word += c;
  }

  if(lang.length >= numWords){
    lang.pop();
  }

  lang.push(word);
}

function mousePressed(){

}

function keyPressed(){
  if(key == 's'){
    // save strings to text file
    saveStrings(lang, "words.txt");
  }
}