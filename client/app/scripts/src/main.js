/* globals requestAnimationFrame*/

// Require all needed modules here
var LeapConnector = require('./leapConnector.js');
//var Renderer      = require('./renderer.js');
var CesiumWorld      = require('./cesium_world.js');
var speechList = require('./speech.json');
var SpeechRecognition = require('./speechRecognition.js');
var SpeechSynthesis = require('./speechSynthesis.js');

// Create a basic leap connection
var leapConnection = new LeapConnector();

//	leapConnection.on('swipeStart', function() {
//		console.log('Swipe detected');
//	});

// Create a renderer
//var renderer = new Renderer();


var speechRecognition = new SpeechRecognition(speechList);
var speechSynthesis = new SpeechSynthesis(speechList);
var cesiumWorld = new CesiumWorld(speechRecognition, speechSynthesis);

console.log(speechSynthesis);

(function update() {

///test
	requestAnimationFrame(update);

	leapConnection.update();
	//renderer.update();
        cesiumWorld.update();

}());

//new