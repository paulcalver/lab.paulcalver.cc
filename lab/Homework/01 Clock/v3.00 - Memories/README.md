# Memories Clock - Random Image Display

This p5.js sketch displays random images one at a time in random positions and sizes, with fade-in and fade-out effects.

## Features

- **Random Image Selection**: Chooses from a pool of images randomly
- **Random Positioning**: Images appear at random locations on screen (with safe margins)
- **Random Sizing**: Each image gets a random size between set limits (80px - 250px)
- **Random Rotation**: Images appear with slight random rotation (-15° to +15°)
- **Fade Animation**: Images fade in, display, then fade out over random durations
- **Configurable Limits**: Maximum number of simultaneous images and spawn timing

## Controls

- **R**: Restart (clear all current images)
- **S**: Spawn a new memory immediately
- **+**: Increase spawn rate (spawn images more frequently)
- **-**: Decrease spawn rate (spawn images less frequently)

## Using Your Own Images

### Option 1: Local Images (Recommended)
1. Add your image files to the `images/` folder
2. Update the `imageURLs` array in `sketch.js` to reference your local images:

```javascript
let imageURLs = [
  'images/image_00001.jpg',
  'images/image_00002.jpg',
  'images/image_00003.jpg',
  'images/image_00004.jpg',
  'images/image_00005.jpg',
  'images/image_00006.jpg',
  'images/image_00007.jpg',
  'images/image_00008.jpg',
  'images/image_00009.jpg',
  'images/image_00010.jpg',
  'images/image_00011.jpg',
  'images/image_00012.jpg',
  'images/image_00013.jpg',
  'images/image_00014.jpg',
  'images/image_00015.jpg',
  'images/image_00016.jpg',
  'images/image_00017.jpg',
  'images/image_00018.jpg',
  'images/image_00019.jpg',
  'images/image_00020.jpg',
  // Add more image paths...
];
```

### Option 2: Online Images
The current setup uses Lorem Picsum for random placeholder images. You can replace these URLs with your own online images.

## Customization Options

You can modify these variables in `sketch.js` to customize the behavior:

```javascript
let minSize = 80;           // Minimum image size in pixels
let maxSize = 250;          // Maximum image size in pixels
let minFadeDuration = 3000; // Minimum display time (milliseconds)
let maxFadeDuration = 8000; // Maximum display time (milliseconds)
let spawnInterval = 2000;   // Time between new images (milliseconds)
let maxActiveMemories = 5;  // Maximum images on screen at once
```

## Image Requirements

- Supported formats: JPG, PNG, GIF
- Recommended size: 400x300px or larger for best quality
- Images will be automatically scaled to maintain aspect ratio

## Running the Sketch

1. Open `index.html` in a web browser
2. Images will start appearing automatically
3. Use the keyboard controls to interact with the display