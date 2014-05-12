/* globals requestAnimationFrame, document, $ */

var LeapConnector        = require('./leapConnector.js');
var LeapCameraController = require('./leapCameraController.js');
var CesiumWorld          = require('./cesiumWorld.js');
var speechList           = require('./speech.json');
var SpeechRecognition    = require('./speechRecognition.js');
var SpeechSynthesis      = require('./speechSynthesis.js');
var Ui                   = require('./Ui.js');
var GestureIntro         = require('./gestureIntro.js');


/// -----------------------------------------------------------------------------
/// Initialize and connect the modules
/// -----------------------------------------------------------------------------
var leapConnection       = new LeapConnector();
var speechRecognition    = new SpeechRecognition(speechList);
var speechSynthesis      = new SpeechSynthesis(speechList);
var cesiumWorld          = new CesiumWorld(speechRecognition, speechSynthesis);
var leapCameraController = new LeapCameraController(cesiumWorld.widget.scene.camera, cesiumWorld.ellipsoid);
var ui                   = new Ui(cesiumWorld);
var gestureIntro         = new GestureIntro();


/// -----------------------------------------------------------------------------
/// Setup some event listeners to change the leap control mode
/// -----------------------------------------------------------------------------
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

/// -----------------------------------------------------------------------------
/// Initialize the UI related stuff after the document is fully loaded
/// -----------------------------------------------------------------------------
$(document).ready(function() {
	'use strict';

	ui.init();
	gestureIntro.init();
});

/// -----------------------------------------------------------------------------
/// Start the our custom animation / update loop
/// -----------------------------------------------------------------------------
(function update() {
	'use strict';

	requestAnimationFrame(update);

	leapConnection.update();
    cesiumWorld.update();
    leapCameraController.update(leapConnection.currentFrame);
}());

