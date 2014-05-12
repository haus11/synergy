/* globals requestAnimationFrame */

var LeapConnector        = require('./leapConnector.js');
var LeapCameraController = require('./leapCameraController.js');
var CesiumWorld          = require('./cesiumWorld.js');
var speechList           = require('./speech.json');
var SpeechRecognition    = require('./speechRecognition.js');
var SpeechSynthesis      = require('./speechSynthesis.js');
var Ui                   = require('./Ui.js');



var leapConnection       = new LeapConnector();
var speechRecognition    = new SpeechRecognition(speechList);
var speechSynthesis      = new SpeechSynthesis(speechList);
var cesiumWorld          = new CesiumWorld(speechRecognition, speechSynthesis);
var leapCameraController = new LeapCameraController(cesiumWorld.widget.scene.camera, cesiumWorld.ellipsoid);
var ui                   = new Ui(cesiumWorld);

ui.init();

speechRecognition.on('thanks', function(){
	'use strict';
    speechSynthesis.answer('thanks', {'state': true});
});

speechRecognition.on('test', function(){
	'use strict';
    speechSynthesis.answer('test', {'state': true});
});

speechRecognition.on('flightMode', function() {
	'use strict';
	leapCameraController.controlMode = 'flight';

	speechSynthesis.answer('flightMode', {'state': true});
});

speechRecognition.on('standardMode', function() {
	'use strict';
	leapCameraController.controlMode = 'standard';

	speechSynthesis.answer('standardMode', {'state': true});
});



(function update() {
	'use strict';

	requestAnimationFrame(update);

	leapConnection.update();
    cesiumWorld.update();
    leapCameraController.update(leapConnection.currentFrame);
}());
