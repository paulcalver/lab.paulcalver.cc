let fontFun;
let instructions;
let inputField;
let resultText = "";


let randomClasses = ["regular","red","monospace","ouvrieres","mourier","cursive"];

function setup() {
  noCanvas();
  
  instructions = createP("Type to visualise a word");
  instructions.addClass("instruction-text");

  inputField = createInput("");
  inputField.addClass("input-field");

  //Create our DOM elements
  fontFun = createP(" ");
  fontFun.id("fun-font");

  // Call checkWord() when input is detected.
  inputField.input(checkWord);

}

// Check and clean up user input
function checkWord() {
  let msg = inputField.value();

  console.log(inputField.value());

  // msg = msg.toLowerCase();
  // msg = msg.trim();
  // // msg = msg.replace("s","&");

  // msg = msg.replace(/[^a-zA-Z- ']/g,"");
  
  // fontFun.elt.innerHTML = msg;

  fontFun.elt.innerHTML = "";

  for(let i = 0; i < msg.length; i++){
    let span = createSpan( msg[i] );

    let randomClassIndex = floor(random(randomClasses.length));
    span.addClass(randomClasses[randomClassIndex]);
    // span.style('color', 'deeppink');
    //add the span to the crazy font visualisation
    fontFun.child(span);
  }

}

