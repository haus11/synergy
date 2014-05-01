/* globals requestAnimationFrame, THREE */

// Require all needed modules here
var LeapConnector = require('./leapConnector.js');
//var Renderer      = require('./renderer.js');
var CesiumWorld      = require('./cesium_world.js');
var SpeechRecognition = require('./speechRecognition.js');


// Create a basic leap connection
var leapConnection = new LeapConnector();

//	leapConnection.on('swipeStart', function() {
//		console.log('Swipe detected');
//	});

// Create a renderer
//var renderer = new Renderer();

var speechRecognition = new SpeechRecognition();

var cesiumWorld = new CesiumWorld(speechRecognition);


var cameraControls = new THREE.LeapCameraControls(cesiumWorld.widget.scene.camera);


(function update() {

	requestAnimationFrame(update);



	leapConnection.update();
	//renderer.update();
    cesiumWorld.update();

    cameraControls.update(leapConnection.currentFrame);

}());