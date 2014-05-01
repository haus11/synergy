/* globals Leap, LeapConnector, document */

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


    this.fingers = {};
	this.spheres = {};
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


LeapConnector.prototype.update = function() {
	this.currentFrame = this.controller.frame();

	this.visualize();
};



function moveFinger(Finger, posX, posY, posZ, dirX, dirY, dirZ) {
    Finger.style.webkitTransform = Finger.style.mozTransform = 
    Finger.style.transform = "translateX("+posX+"px) translateY("+posY+"px) translateZ("+posZ+"px) rotateX("+dirX+"deg) rotateY(0deg) rotateZ("+dirZ+"deg)";
}

function moveSphere(Sphere, posX, posY, posZ, rotX) {
  Sphere.style.webkitTransform = Sphere.style.mozTransform = 
  Sphere.style.transform = "translateX("+posX+"px) translateY("+posY+"px) translateZ("+posZ+"px) rotateX("+rotX+"deg) rotateY(0deg) rotateZ(0deg)";
}



LeapConnector.prototype.visualize = function () {
	var fingerIds   = {};
    var handIds     = {};
    var handsLength = 0;
    var sphereDiv   = null;
    var fingerDiv   = null;

    var posX = 0;
    var posY = 0;
    var posZ = 0;

    if (this.currentFrame.hands === undefined ) { 
      handsLength = 0;
    } else {
      handsLength = this.currentFrame.hands.length;
    }

    for (var handId = 0, handCount = handsLength; handId !== handCount; handId++) {
      var hand = this.currentFrame.hands[handId];

      posX = (hand.palmPosition[0]*3);
      posY = (hand.palmPosition[2]*3)-200;
      posZ = (hand.palmPosition[1]*3)-400;

      var rotX = (hand._rotation[2]*90);
      var rotY = (hand._rotation[1]*90);
      var rotZ = (hand._rotation[0]*90);
      var sphere = this.spheres[hand.id];
      if (!sphere) {
			sphereDiv = document.getElementById("sphere").cloneNode(true);
            sphereDiv.setAttribute('id',hand.id);
            sphereDiv.style.backgroundColor='#A3A3A3';  //'#'+Math.floor(Math.random()*16777215).toString(16);
            document.getElementById('scene').appendChild(sphereDiv);
            this.spheres[hand.id] = hand.id;
      } else {
        sphereDiv =  document.getElementById(hand.id);
        if (typeof(sphereDiv) !== 'undefined' && sphereDiv !== null) {
          moveSphere(sphereDiv, posX, posY, posZ, rotX, rotY, rotZ);
        }
      }
      handIds[hand.id] = true;
    }
    for (handId in this.spheres) {
      if (!handIds[handId]) {
        sphereDiv =  document.getElementById(this.spheres[handId]);
        sphereDiv.parentNode.removeChild(sphereDiv);
        delete this.spheres[handId];
      }
    }

    for (var pointableId = 0, pointableCount = this.currentFrame.pointables.length; pointableId !== pointableCount; pointableId++) {
      var pointable = this.currentFrame.pointables[pointableId];

      posX = (pointable.tipPosition[0]*3);
      posY = (pointable.tipPosition[2]*3)-200;
      posZ = (pointable.tipPosition[1]*3)-400;

      var dirX = -(pointable.direction[1]*90);
      var dirY = -(pointable.direction[2]*90);
      var dirZ = (pointable.direction[0]*90);
      var finger = this.fingers[pointable.id];
      if (!finger) {
			fingerDiv = document.getElementById("finger").cloneNode(true);
            fingerDiv.setAttribute('id',pointable.id);
            fingerDiv.style.backgroundColor='#A3A3A3';  //'#'+Math.floor(Math.random()*16777215).toString(16);
            document.getElementById('scene').appendChild(fingerDiv);
            this.fingers[pointable.id] = pointable.id;
      } else {
        fingerDiv =  document.getElementById(pointable.id);
        if (typeof(fingerDiv) !== 'undefined' && fingerDiv != null) {
          moveFinger(fingerDiv, posX, posY, posZ, dirX, dirY, dirZ);
        }
      }
      fingerIds[pointable.id] = true;
    }

    var fingerId;
    for (fingerId in this.fingers) {
      if (!fingerIds[fingerId]) {
        fingerDiv =  document.getElementById(this.fingers[fingerId]);
        fingerDiv.parentNode.removeChild(fingerDiv);
        delete this.fingers[fingerId];
      }
    }
    document.getElementById('showHands').addEventListener('mousedown', function() {
      document.getElementById('app').setAttribute('class','show-hands');
    }, false);
    document.getElementById('hideHands').addEventListener('mousedown', function() {
      document.getElementById('app').setAttribute('class','');
    }, false);
};