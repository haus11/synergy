/* globals Leap, LeapConnector */

var events = require('events');
var util   = require('util');


/**
* Everything which is defined with module.exports will be available through the require command
*/ 
module.exports = LeapConnector;


/**
* Constructor
*/
function LeapConnector() {
    this.Leap = Leap;
    events.EventEmitter.call(this);

    // Create a new controller
    this.controller = new this.Leap.Controller({enableGestures: true});

    // Setup the listeners
    this.setupGestureRecognizer();

    // Setup the connect event listener
	this.controller.on('connect', function() {
		console.log("Successfully connected.");
	});

    // Connect to the newly created controller
    this.controller.connect();

}

/**
* Inherit the event emitter functionality
*/
util.inherits(LeapConnector, events.EventEmitter);


/**
* Implements predefined and custom gestures
*/
LeapConnector.prototype.setupGestureRecognizer = function() {
	// We need leapConnector as an alias
	var leapConnector = this;

	leapConnector.controller.on('gesture', function (gesture){
		if(gesture.type === 'swipe'){
			switch(gesture.state) {
				case 'start':
					leapConnector.emit('swipeStart');
					break;

				case 'update':
					leapConnector.emit('swipeUpdate');
					break;
					
				case 'stop': 
					leapConnector.emit('swipeEnd');
					break;
			}
		}
	});
};