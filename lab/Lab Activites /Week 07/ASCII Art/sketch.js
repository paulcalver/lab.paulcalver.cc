function preload() {
  img = loadImage("flower.avif");
}

function setup() {

  noCanvas();
  img.resize(200, 0);
  img.filter(THRESHOLD);

  background(220);
  createP("<pre>" + convertToASCII() + "</pre>");
}



function convertToASCII() {
  let chars = ".:.+*#%&^€"; // characters from light to dark
  let result = "";           // string to accumulate ASCII art
  img.loadPixels();          // load pixel data so we can read RGB

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let index = (x + y * img.width) * 4; // 4 values per pixel (R,G,B,A)
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];

      let brightness = (r + g + b) / 3; // average
      let charIndex = floor(map(brightness, 0, 255, chars.length - 1, 0));
      result += chars[charIndex]; // add character to string
      //result += " ";

    }
    result += "\n"; // after each row

  }
  return result;
}

