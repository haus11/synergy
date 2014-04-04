/* globals Leap */

// Basic leap connection
var leapController = new Leap.Controller({enableGestures: true});


leapController.on('connect', function() {
  console.log("Successfully connected.");
});


leapController.on('gesture', function (gesture){
    if(gesture.type === 'swipe'){
        switch(gesture.state) {
			case 'start':
				console.log('Swipe start');
				break;

			case 'update':
				//console.log('Swipe update');
				break;
				
			case 'stop': 
				console.log('Swpie end');
				break;
		}
	}
});


leapController.connect();