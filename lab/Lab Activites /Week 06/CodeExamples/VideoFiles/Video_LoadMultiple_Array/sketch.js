/*
Loading in a video file
https://p5js.org/reference/p5/createVideo/

For all video functionality:
https://p5js.org/reference/p5/p5.MediaElement/ 

Film Clips:
Dziga Vertov, one of the early pioneers with film and the use of montage
https://en.wikipedia.org/wiki/Man_with_a_Movie_Camera

Muybridge Racing horse:
Animated film shot from still images 1878
https://en.wikipedia.org/wiki/The_Horse_in_Motion

Clip:
first known film with live-recorded sound 1890s
Dickson Experimental Film School + Thomas Edison
https://en.wikipedia.org/wiki/The_Dickson_Experimental_Sound_Film 
*/

let isLoaded = false;
let isLooping = false;
let isPlaying = false;

let numClipsLoaded = 0;
let clip1,clip2,clip3;
let clipArray;

let clipIndex = 0;//used to keep track of current clip playing

function setup() {
  createCanvas(400, 100);
  textAlign(CENTER);

  clip1 = createVideo('DzigaVertov_ManWithAMovieCamera.mp4',videoLoaded);
  clip2 = createVideo('Muybridge_race_horse.mp4',videoLoaded);
  clip3 = createVideo('DicksonFilmClip_Sound.mp4',videoLoaded);

  clipArray = [clip1,clip2,clip3];

}

function draw() {

  background(250);
  fill(0);

  if(isLoaded){
    text("Click to Play & Pause",width/2,20);

    let clip = clipArray[clipIndex];
    let timePosition = map(clip.time(),0,clip.duration(),0,width);
    circle(timePosition,60,30);
  }else{
    text("Loading...",width/2,20);
  }


}

//This function gets called whenever a clip finishes playing
function playNewClip(){
  //hide current video
  clipArray[clipIndex].hide();

  //randomly select a new clip to play
  clipIndex = int(random(0,clipArray.length));

  // play and show new video
  clipArray[clipIndex].play();
  clipArray[clipIndex].show();

  isPlaying = true;
}

function mousePressed(){
  if(!isPlaying){
    playNewClip();//always get a new random clip
  }else{
    isPlaying = false;
    clipArray[clipIndex].pause();
  }
}

function allVideosLoaded(){
  for(let i = 0; i < clipArray.length; i++){
    //each time a video finishes it will call the function playNewClip
    clipArray[i].onended(playNewClip);
    clipArray[i].size(width,(width/clipArray[clipIndex].width)*clipArray[clipIndex].height);
    clipArray[i].hide();
  }

  isLoaded = true;
}

//function called after each video is loaded
function videoLoaded(){

  numClipsLoaded++;
  console.log(numClipsLoaded);

  if(numClipsLoaded == clipArray.length){
    allVideosLoaded();
  }
}