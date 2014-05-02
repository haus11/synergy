/* globals requestAnimationFrame, THREE */

// Require all needed modules here
var LeapConnector     = require('./leapConnector.js');
var CesiumWorld       = require('./cesium_world.js');
var speechList        = require('./speech.json');
var SpeechRecognition = require('./speechRecognition.js');
var SpeechSynthesis   = require('./speechSynthesis.js');
var Ui                = require('./Ui.js');

console.log(Ui);

// Create a basic leap connection
var leapConnection    = new LeapConnector();
var speechRecognition = new SpeechRecognition(speechList);
var speechSynthesis   = new SpeechSynthesis(speechList);
var cesiumWorld       = new CesiumWorld(speechRecognition, speechSynthesis);
var cameraControls    = new THREE.LeapCameraControls(cesiumWorld.widget.scene.camera, cesiumWorld.ellipsoid);

speechRecognition.on('thanks', function(){
    speechSynthesis.answer('thanks', true);
});

speechRecognition.on('flightMode', function() {

	cameraControls.mode = 'flight';

	speechSynthesis.answer('flightMode', true);
});

speechRecognition.on('standartMode', function() {

	cameraControls.mode = 'standard';

	speechSynthesis.answer('standartMode', true);
});

(function update() {
	requestAnimationFrame(update);

	leapConnection.update();
    cesiumWorld.update();
    cameraControls.update(leapConnection.currentFrame);
}());
