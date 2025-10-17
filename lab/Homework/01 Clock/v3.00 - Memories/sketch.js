// MEMORIES CLOCK - Random Image Display
// 
// SETUP INSTRUCTIONS:
// 1. To use your own images: Add image files to the 'images/' folder
// 2. Uncomment the LOCAL IMAGES section below and comment out the ONLINE IMAGES section
// 3. Update the imageFilenames array with your actual image filenames

// Array to store loaded images
let imagePool = [];
let unusedImages = []; // Track which images haven't been used yet
let usedImages = []; // Track which images have been used

// ONLINE IMAGES (Comment out when using local images)
/*
let imageURLs = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5'
];
*/

// LOCAL IMAGES CONFIGURATION
// *** JUST CHANGE THIS NUMBER WHEN YOU ADD MORE IMAGES ***
let totalImages = 77; // Change this to match the number of images in your folder

// Image filename settings
let imageFolder = 'images/';
let imagePrefix = 'image_';
let imageExtension = '.jpg';
let paddingZeros = 5; // Number of digits (00001, 00002, etc.)

// Auto-generated filenames array
let imageFilenames = [];


// Array to store active memory objects
let memories = [];

// Image display settings
let minSize = 150;
let maxSize = 500;
let minFadeDuration = 3000; // 3 seconds
let maxFadeDuration = 80000; // 8 seconds
let minSpawnInterval = 3000; // Minimum 3 seconds between spawns
let maxSpawnInterval = 10000; // Maximum 10 seconds between spawns
let nextSpawnTime = 0; // Time when next spawn should occur
let maxActiveMemories = 20; // Maximum number of images on screen at once

// Overlap prevention settings
let useOverlapPrevention = true; // Set to false to disable overlap prevention
let minSpaceBetweenImages = 30; // Minimum space between image edges

// Memory class to handle individual image instances
class Memory {
  constructor(img) {
    this.img = img;
    this.size = random(minSize, maxSize);
    this.zIndex = random(0, 100); // Random layering depth
    
    // Calculate actual display dimensions based on aspect ratio
    this.calculateDisplayDimensions();
    
    // Try to find a position with minimal overlap
    this.findGoodPosition();
    
    this.opacity = 0;
    this.maxOpacity = 100; // Always fade to 100% opacity
    
    // Determine total duration and fade behavior based on probability
    let fadeRandom = random(100);
    
    if (fadeRandom < 35) {
      // 35% fade away quickly (10-20 seconds total)
      this.totalDuration = random(10000, 20000);
      this.isPermanent = false;
    } else if (fadeRandom < 85) {
      // 50% fade away slowly (2-20 minutes total)
      this.totalDuration = random(120000, 1200000); // 2-20 minutes
      this.isPermanent = false;
    } else {
      // 15% stay forever
      this.totalDuration = Infinity;
      this.isPermanent = true;
    }
    
    this.startTime = millis();
    this.finished = false; // Track completion status (renamed to avoid conflict)
  }
  
  calculateDisplayDimensions() {
    if (this.img && this.img.width && this.img.height) {
      let aspectRatio = this.img.width / this.img.height;
      
      if (aspectRatio > 1) {
        // Landscape: width is constrained by size
        this.displayWidth = this.size;
        this.displayHeight = this.size / aspectRatio;
      } else {
        // Portrait: height is constrained by size
        this.displayWidth = this.size * aspectRatio;
        this.displayHeight = this.size;
      }
    } else {
      // Fallback if image not loaded yet - assume square
      this.displayWidth = this.size;
      this.displayHeight = this.size;
    }
    
    // Ensure we never have invalid dimensions
    if (this.displayWidth <= 0) this.displayWidth = this.size;
    if (this.displayHeight <= 0) this.displayHeight = this.size;
  }
  
  findGoodPosition() {
    // Ensure display dimensions are calculated properly
    this.calculateDisplayDimensions();
    
    // Use CORNER positioning - coordinates are top-left of image
    let margin = 20;
    
    // Ensure minimum boundaries (use canvas dimensions)
    let canvasWidth = width || windowWidth;
    let canvasHeight = height || windowHeight;
    
    // For CORNER mode, x,y is top-left, so we need to ensure:
    // x >= margin (left edge)
    // x + displayWidth <= canvasWidth - margin (right edge)
    // y >= margin (top edge)  
    // y + displayHeight <= canvasHeight - margin (bottom edge)
    
    let minX = margin;
    let maxX = Math.max(canvasWidth - this.displayWidth - margin, margin);
    let minY = margin;
    let maxY = Math.max(canvasHeight - this.displayHeight - margin, margin);
    
    // Safety check - if image is too large, center it
    if (maxX < minX || maxY < minY) {
      console.log("Warning: Image too large for canvas!", {
        imageSize: this.size,
        displayWidth: this.displayWidth,
        displayHeight: this.displayHeight,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight
      });
      // Center the oversized image
      this.x = Math.max(0, (canvasWidth - this.displayWidth) / 2);
      this.y = Math.max(0, (canvasHeight - this.displayHeight) / 2);
      return;
    }
    
    if (!useOverlapPrevention) {
      // Simple random positioning if overlap prevention is disabled
      this.x = random(minX, maxX);
      this.y = random(minY, maxY);
      return;
    }
    
    let bestX = 0;
    let bestY = 0;
    let minOverlap = Infinity;
    let attempts = 50; // Try 50 different positions
    
    for (let i = 0; i < attempts; i++) {
      let testX = random(minX, maxX);
      let testY = random(minY, maxY);
      
      let totalOverlap = this.calculateOverlapAt(testX, testY);
      
      if (totalOverlap < minOverlap) {
        minOverlap = totalOverlap;
        bestX = testX;
        bestY = testY;
        
        // If we find a spot with no overlap, use it immediately
        if (totalOverlap === 0) break;
      }
    }
    
    this.x = bestX;
    this.y = bestY;
  }
  
  calculateOverlapAt(testX, testY) {
    let totalOverlap = 0;
    
    for (let memory of memories) {
      if (memory === this) continue;
      
      // Calculate actual rectangle overlap in CORNER mode
      // This memory's bounds
      let thisLeft = testX;
      let thisRight = testX + this.displayWidth;
      let thisTop = testY;
      let thisBottom = testY + this.displayHeight;
      
      // Other memory's bounds  
      let otherLeft = memory.x;
      let otherRight = memory.x + memory.displayWidth;
      let otherTop = memory.y;
      let otherBottom = memory.y + memory.displayHeight;
      
      // Check for overlap
      let horizontalOverlap = max(0, min(thisRight, otherRight) - max(thisLeft, otherLeft));
      let verticalOverlap = max(0, min(thisBottom, otherBottom) - max(thisTop, otherTop));
      
      if (horizontalOverlap > 0 && verticalOverlap > 0) {
        // Add a buffer zone around each image
        let buffer = minSpaceBetweenImages;
        let bufferedHorizontalOverlap = max(0, min(thisRight + buffer, otherRight + buffer) - max(thisLeft - buffer, otherLeft - buffer));
        let bufferedVerticalOverlap = max(0, min(thisBottom + buffer, otherBottom + buffer) - max(thisTop - buffer, otherTop - buffer));
        
        totalOverlap += bufferedHorizontalOverlap * bufferedVerticalOverlap;
      }
    }
    
    return totalOverlap;
  }
  
  update() {
    // Permanent images stay at full opacity after fading in
    if (this.isPermanent) {
      let currentTime = millis();
      let elapsedTime = currentTime - this.startTime;
      let fadeInDuration = 2000; // 2 seconds to fade in
      
      if (elapsedTime < fadeInDuration) {
        // Still fading in
        this.opacity = map(elapsedTime, 0, fadeInDuration, 0, this.maxOpacity);
      } else {
        // Fully faded in, stay at max opacity
        this.opacity = this.maxOpacity;
      }
      return;
    }
    
    let currentTime = millis();
    let elapsedTime = currentTime - this.startTime;
    let fadeInDuration = 2000; // 2 seconds to fade in
    
    if (elapsedTime >= this.totalDuration + fadeInDuration) {
      // Image has completed its total duration + fade in time
      this.opacity = 0;
      this.finished = true;
    } else if (elapsedTime < fadeInDuration) {
      // Fade in phase (0 to 2 seconds)
      this.opacity = map(elapsedTime, 0, fadeInDuration, 0, this.maxOpacity);
    } else {
      // Fade out phase (2 seconds to total duration)
      let fadeOutTime = elapsedTime - fadeInDuration;
      let fadeProgress = fadeOutTime / this.totalDuration;
      this.opacity = this.maxOpacity * (1 - fadeProgress);
    }
  }
  
  display() {
    if (this.opacity > 0 && this.img) {
      push();
      
      // Use alpha value for opacity in HSB mode
      tint(0, 0, 100, this.opacity); // White with opacity
      
      // Use CORNER mode - x,y is top-left of image, no rotation
      image(this.img, this.x, this.y, this.displayWidth, this.displayHeight);
      noTint(); // Clear tint for next draw calls
      pop();
    }
  }
  
  isFinished() {
    // Permanent images are never finished
    if (this.isPermanent) {
      return false;
    }
    // Use the new finished flag set by update method
    return this.finished === true;
  }
}

// Generate filenames automatically based on configuration
function generateImageFilenames() {
  imageFilenames = []; // Clear existing array
  
  for (let i = 1; i <= totalImages; i++) {
    // Pad number with zeros (e.g., 1 becomes 00001)
    let paddedNumber = i.toString().padStart(paddingZeros, '0');
    let filename = imageFolder + imagePrefix + paddedNumber + imageExtension;
    imageFilenames.push(filename);
  }
}

function preload() {
  // Generate filenames before loading
  generateImageFilenames();
  
  // Load images from URLs (online images)
  if (typeof imageURLs !== 'undefined') {
    for (let i = 0; i < imageURLs.length; i++) {
      imagePool.push(loadImage(imageURLs[i]));
    }
  }
  
  // Load images from local files
  if (imageFilenames.length > 0) {
    for (let i = 0; i < imageFilenames.length; i++) {
      imagePool.push(loadImage(imageFilenames[i]));
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);
  rectMode(CORNER); // Changed to CORNER for top-left positioning
  imageMode(CORNER); // Changed to CORNER for top-left positioning
  noStroke();
  
  // Initialize the unused images array with all images
  unusedImages = [...imagePool]; // Copy all images to unused array
  
  // Set the first spawn time with random interval
  nextSpawnTime = millis() + random(minSpawnInterval, maxSpawnInterval);
}

function draw() {
  // Pulsing background - pulse every second between white and soft off-white
  let pulseTime = millis() % 1000; // Get time within 1-second cycle
  let pulseValue = sin(map(pulseTime, 0, 1000, 0, 360)); // Sine wave for smooth pulse
  let backgroundColor = map(pulseValue, -1, 1, 92, 100); // Pulse between 90% and 100% brightness
  background(0, 0, backgroundColor);
  
  // Spawn new memory if enough time has passed and we haven't reached the limit
  if (millis() >= nextSpawnTime && memories.length < maxActiveMemories) {
    spawnNewMemory();
    // Set next spawn time with random interval
    nextSpawnTime = millis() + random(minSpawnInterval, maxSpawnInterval);
  }
  
  // Sort memories by z-index to render from back to front
  memories.sort((a, b) => a.zIndex - b.zIndex);
  
  // Update and display all active memories
  for (let i = memories.length - 1; i >= 0; i--) {
    memories[i].update();
    memories[i].display();
    
    // Remove finished memories
    if (memories[i].isFinished()) {
      memories.splice(i, 1);
    }
  }
}

function spawnNewMemory() {
  // If no unused images left, stop spawning to prevent repeats
  if (unusedImages.length === 0) {
    console.log("All images have been shown. No more spawning to prevent repeats.");
    return; // Don't spawn any more images
  }
  
  if (unusedImages.length > 0) {
    // Pick a random image from unused images
    let randomIndex = floor(random(unusedImages.length));
    let selectedImage = unusedImages[randomIndex];
    
    // Move image from unused to used
    unusedImages.splice(randomIndex, 1);
    usedImages.push(selectedImage);
    
    memories.push(new Memory(selectedImage));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Toggle fullscreen when user clicks anywhere on the screen
  let fs = fullscreen();
  fullscreen(!fs);
}
