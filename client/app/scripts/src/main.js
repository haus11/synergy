/* globals requestAnimationFrame*/

// Require all needed modules here
var LeapConnector = require('./leapConnector.js');
//var Renderer      = require('./renderer.js');
var CesiumWorld      = require('./cesium_world.js');


// Create a basic leap connection
var leapConnection = new LeapConnector();

//	leapConnection.on('swipeStart', function() {
//		console.log('Swipe detected');
//	});

// Create a renderer
//var renderer = new Renderer();

var cesiumWorld = new CesiumWorld();


(function update() {

	requestAnimationFrame(update);

	leapConnection.update();
	//renderer.update();
        cesiumWorld.update();

}());