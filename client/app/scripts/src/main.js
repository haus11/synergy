// Require all needed modules here
var LeapConnector = require('./leapConnector.js');
var THREE         = require('../../bower_components/threejs/build/three.js');


// Create a basic leap connection
var leapConnection = new LeapConnector();

leapConnection.on('swipeStart', function() {
	console.log('Swipe detected');
});


console.log(THREE);