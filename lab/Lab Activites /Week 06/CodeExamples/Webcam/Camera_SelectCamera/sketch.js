/*
This is using some syntax that might look a bit odd (.then), we will talk about it later. For now, if you'd like to use another webcam simply use this code by changing the 
variables at the top of the page. And then use the same strategies in the other camera sketches.
*/

//const means a constant value, you cannot reset the value later in the sketch
const VID_WIDTH = 320;
const VID_HEIGHT = 240;

let video;

// your webcams will be loaded into this aray
const DEVICES = [];

//ACTION: 
//Run the sketch and look at your console
//You should see a print out of all the camera devices plugged in
//The first one at index 0 should be your built in camera
//The second webcam would be at index 1 and so on and so forth
//change the variable value below to the index for your web cam of choice

const DEVICE_INDEX = 0;//the index used to select your web cam

function setup() {
  createCanvas(400, 400);

  //this checks what webcam devices we have
  // then gotDevices function runs once we have the devices
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
}

function draw() {
  background(220);
  fill(0);

  //have to check the video has been created before doing stuff
  if(video){
    image(video,0,0,width, width * video.height / video.width);
    // console.log(video.width, video.height);
  
    //Or do what you like using the other examples
  }

 

}

//a function to select a specifc video input device
function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == 'videoinput') {
      DEVICES.push({
        label: deviceInfo.label,
        id: deviceInfo.deviceId
      });
    }
  }
  console.log("My Devices: ", DEVICES);

  //Video Constraints Documentation:
  //https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#instance_properties
  // let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  // console.log(supportedConstraints);

  let constraints = {
    video: {
      width: VID_WIDTH,//you can comment this out to see native width
      height: VID_HEIGHT,//you can comment this out to see native height
      deviceId: {
        exact: DEVICES[DEVICE_INDEX].id
      },
    },
    audio: false
  };

  //create video capture using the settings above in constraints
  video = createCapture(constraints);

  // show or hide video once it's created
  video.hide();
}