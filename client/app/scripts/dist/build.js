(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* globals Ui, $ */

/**
* Export for require statemant
*/
module.exports = Ui;

/**
* Constructor
*/
function Ui(cesiumWorld) {
	'use strict';

	this.stringTable = [];
	this.stringTable['en'] = [];
	this.stringTable['en']['topoDeac'] = 'Relief off';
	this.cesiumWorld = cesiumWorld;

	$('#switch-topography').text(this.stringTable['en']['topoDeac']);

}

Ui.prototype.closeWelcomeBox = function() {
	'use strict';

	$('.welcomebox-close').click(function()
	{
		$('#welcomebox, #gesture-intro').fadeOut(500);
	});
};

Ui.prototype.toggleMenu = function () {
	'use strict';

	$('#menu-toggler').click(function()
	{
		$('#menu-elements').slideToggle('slow');
	});
};

Ui.prototype.changeRelief = function() {
	'use strict';

	var _this = this;

	$('#switch-topography').click(function() {
		if($('#switch-topography').text() === 'Relief off') {
			$('#switch-topography').removeClass("topography-inactive p-btn-erro");
			$('#switch-topography').addClass("topography-active p-btn-succ");
			$('#switch-topography').text("Relief on");
			_this.cesiumWorld.setTerrain(true);
		}
		else if($('#switch-topography').text() === 'Relief on'){
			$('#switch-topography').removeClass("topography-active p-btn-succ");
			$('#switch-topography').addClass("topography-inactive p-btn-erro");
			$('#switch-topography').text("Relief off");
			_this.cesiumWorld.setTerrain(false);
		}
	});
};

Ui.prototype.init = function() {
	'use strict';

	this.closeWelcomeBox();
	this.toggleMenu();
	this.changeRelief();
};
},{}],2:[function(require,module,exports){
/* globals Cesium, CesiumWorld, window, $, navigator */

/**
* Export for require statemant
*/
module.exports = CesiumWorld;


/**
* Constructor
*/
function CesiumWorld(_speechRecognition, _speechSynthesis) {
    'use strict';

    var _this = this;

    _this.providerViewModels = [];
    _this.providerViewModels.push(new Cesium.ImageryProviderViewModel({
         name : 'OpenStreetMap',
         iconUrl : Cesium.buildModuleUrl('../../../images/openStreetMap.png'),
         tooltip : 'OpenStreetMap (OSM) is a collaborative project to create a free editable map of the world.\nhttp://www.openstreetmap.org',
         creationFunction : function() {
             return new Cesium.OpenStreetMapImageryProvider({
                 url : 'http://tile.openstreetmap.org/'
             });
         }
     }));

     _this.providerViewModels.push(new Cesium.ImageryProviderViewModel({
         name : 'black marble',
         iconUrl : Cesium.buildModuleUrl('../../../images/blackMarble.png'),
         tooltip : 'The lights of cities and villages trace the outlines of civilization in this global view of the Earth at night as seen by NASA/NOAA\'s Suomi NPP satellite.',
         creationFunction : function() {
             return new Cesium.TileMapServiceImageryProvider({
                 url : 'https://cesiumjs.org/blackmarble',
                 maximumLevel : 8,
                 credit : 'Black Marble imagery courtesy NASA Earth Observatory'
             });
         }
     }));

     _this.providerViewModels.push(new Cesium.ImageryProviderViewModel({
         name : 'Bing',
         iconUrl : Cesium.buildModuleUrl('../../../images/bingAerial.png'),
         tooltip : 'The lights of cities and villages trace the outlines of civilization in this global view of the Earth at night as seen by NASA/NOAA\'s Suomi NPP satellite.',
         creationFunction : function() {
             return new Cesium.BingMapsImageryProvider({
                url : 'https://dev.virtualearth.net',
                mapStyle : Cesium.BingMapsStyle.AERIAL
            });
         }
     }));

  
    _this.widget = new Cesium.CesiumWidget('cesiumContainer', {
        'imageryProvider': false,
        skyBox : new Cesium.SkyBox({
            sources : {
              positiveX : 'textures/SkyBox/TychoSkymapII.t3_08192x04096_80_px.jpg',
              negativeX : 'textures/SkyBox/TychoSkymapII.t3_08192x04096_80_mx.jpg',
              positiveY : 'textures/SkyBox/TychoSkymapII.t3_08192x04096_80_py.jpg',
              negativeY : 'textures/SkyBox/TychoSkymapII.t3_08192x04096_80_my.jpg',
              positiveZ : 'textures/SkyBox/TychoSkymapII.t3_08192x04096_80_pz.jpg',
              negativeZ : 'textures/SkyBox/TychoSkymapII.t3_08192x04096_80_mz.jpg'
            }
        }),
        useDefaultRenderLoop: false
    });
    _this.layers = this.widget.centralBody.imageryLayers;
    _this.baseLayerPicker = new Cesium.BaseLayerPicker('baseLayerContainer', this.layers, this.providerViewModels);
    _this.baseLayerPicker.viewModel.selectedItem = this.providerViewModels[2];
    _this.geoCoder = new Cesium.Geocoder({'container' : 'cesiumGeocoder', 'scene' : this.widget.scene});
    _this.ellipsoid = this.widget.centralBody.ellipsoid;
    _this.centralBody = this.widget.centralBody;
    _this.centralBody.depthTestAgainstTerrain = true;
  

    _this.widget.scene.camera.rotateRight (1.7453292519943295);
      
    _this.cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
        url : 'http://cesiumjs.org/stk-terrain/tilesets/world/tiles',
        credit : 'Terrain data courtesy Analytical Graphics, Inc.'
    });
    _this.defaultTerrainProvider = this.centralBody.terrainProvider;

    _this.speechRecognition = _speechRecognition;
    _this.speechSynthesis = _speechSynthesis;
    
    _this.lastLocation = '';

    _this.speechRecognition.on('navigateTo', function(event)
    {
        //console.log(event.action);
        _this.flyTo(event.action);
    });

    _this.speechRecognition.on('selectLayer', function(event)
    {
        //console.log(event.action);
        _this.changeLayer(event.action);
    });

    _this.speechRecognition.on('moveForward', function(event)
    {
        console.log(event);
        _this.move('forward', event.action);
    });

    _this.speechRecognition.on('moveBackward', function(event)
    {
        console.log(event);
        _this.move('backward');
    });

    _this.speechRecognition.on('moveUp', function(event)
    {
        console.log(event);
        _this.move('up');
    });

    _this.speechRecognition.on('moveDown', function(event)
    {
        console.log(event);
        _this.move('down');
    });

    _this.speechRecognition.on('moveLeft', function(event)
    {
        console.log(event);
        _this.move('left');
    });

    _this.speechRecognition.on('moveRight', function(event)
    {
        console.log(event);
        _this.move('right');
    });

    _this.speechRecognition.on('setTerrain', function(event)
    {
        if(event.action === 'einschalten')
        {
            _this.setTerrain(true);
        }
        else if(event.action === 'ausschalten')
        {
            _this.setTerrain(false);
        }
        
    });
    
    _this.speechRecognition.on('informationRequest', function(event)
    {
        console.log(event);
        _this.readAbstractFromWikipedia();
    });

    _this.speechRecognition.on('thanks', function(){
        _this.speechSynthesis.answer('thanks', {'state': true});
    });

    _this.init();
}


CesiumWorld.prototype.setTerrain = function(_state) {
    'use strict';

    if(_state)
    {
        this.centralBody.terrainProvider = this.cesiumTerrainProviderMeshes;
        this.speechSynthesis.answer('setTerrain', {
            'state': true, 
            'replace': 'eingeschaltet'
        });
    }
    else
    {
        this.centralBody.terrainProvider = this.defaultTerrainProvider;
        this.speechSynthesis.answer('setTerrain', {
            'state': true, 
            'replace': 'ausgeschaltet'
        });
    }  
};

CesiumWorld.prototype.move = function(_direction, _factor) {
    'use strict';
    
    _factor = 1.2;
    var moveRate = this.ellipsoid.cartesianToCartographic(this.widget.scene.camera.position).height / _factor;

    switch(_direction)
    {
        case 'forward':
        {
            this.widget.scene.camera.moveForward(moveRate);
            break;
        }
        case 'backward':
        {
            this.widget.scene.camera.moveBackward(moveRate);
            break;
        }
        case 'up':
        {
            this.widget.scene.camera.moveUp(moveRate);
            break;
        }
        case 'down':
        {
            this.widget.scene.camera.moveDown(moveRate);
            break;
        }
        case 'left':
        {
            this.widget.scene.camera.moveLeft(moveRate);
            break;
        }
        case 'right':
        {
            this.widget.scene.camera.moveRight(moveRate);
            break;
        }
    }
};


CesiumWorld.prototype.init = function() {
    'use strict';
    var _this = this;

    _this.widget.resize();

    // Setup a listener on the browser window resize event
    window.onresize = function() { 
      _this.widget.resize();
    };
};

CesiumWorld.prototype.flyToMyLocation = function() {
    'use strict';

    var _this = this;
    
    function fly(position) {
        var destination = Cesium.Cartographic.fromDegrees(position.coords.longitude, position.coords.latitude, 1000.0);
        destination = _this.ellipsoid.cartographicToCartesian(destination);

        var flight = Cesium.CameraFlightPath.createAnimation(_this.widget.scene, {
            destination : destination
        });
        _this.widget.scene.animations.add(flight);
        _this.speechSynthesis.speak('Ich habe dich gefunden.');
    }

    navigator.geolocation.getCurrentPosition(fly);
};

CesiumWorld.prototype.flyTo = function(_location) {
    'use strict';
    
    if(_location.toLowerCase() === 'mich')
    {
        this.flyToMyLocation();
        return;
    }

    this.geoCoder.viewModel.searchText = _location;
    this.geoCoder.viewModel.search();

    var _this = this;

    window.setTimeout(function(){

        var searchResult = _this.geoCoder.viewModel.searchText;

        if(searchResult.indexOf('(not found)') !== -1) {

            _this.speechSynthesis.answer('navigateTo', {
                'state' : false,
                'replace' : _location
            });
        }
        else
        {
            _this.speechSynthesis.answer('navigateTo', true, _location);

            _this.speechSynthesis.answer('navigateTo', {
                'state' : true,
                'replace' : _location
            });
            
            _this.lastLocation = _location;

        }

    }, 1000);
};

CesiumWorld.prototype.readAbstractFromWikipedia = function() {
    'use strict';

    var _this = this;
    
    $.ajax({
      dataType: "jsonp",
      url: "https://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=" + _this.lastLocation,
      success: function(data){
          
          var first;
          var splitted;
            for (var property in data.query.pages) {
                if (data.query.pages.hasOwnProperty(property)) {
                    first = data.query.pages[property];
                    
                    
                    //_this.speechSynthesis.speak(first.extract.replace(/<\/?[^>]+(>|$)/g, "").split(".")[0]);
                    
                    splitted = first.extract.replace(/<\/?[^>]+(>|$)/g, "");//.split(".");
                    console.log(splitted);
                    
                    break;
                }
            }
            
            _this.speechSynthesis.speak(splitted);
    }});
};

CesiumWorld.prototype.getInformationFromWikipedia = function(_resource) {
    'use strict';

    var resource =  _resource.charAt(0).toUpperCase() + _resource.slice(1);
    var _this = this;
    
    $.ajax({
      dataType: "json",
      crossDomain : true,
      url: "http://dbpedia.org/data/" + resource + ".json",
      success: function(data){
          
          var abstractList = data['http://dbpedia.org/resource/' + resource]['http://dbpedia.org/ontology/abstract'];
          var abstract = '';
          
          for(var i = 0; i < abstractList.length; ++i)
          {
              if(abstractList[i].lang === 'de')
              {
                  abstract = abstractList[i].value.substring(0, 100);
                  break;
              }
          }
          
          _this.speechSynthesis.speak(abstract);
    }});
};

CesiumWorld.prototype.changeLayer = function(_layer) {
    'use strict';

    for(var i = 0; i < this.providerViewModels.length; ++i)
    {
        if(this.providerViewModels[i].name === _layer)
        {
            this.baseLayerPicker.viewModel.selectedItem = this.providerViewModels[i];
            this.speechSynthesis.answer('selectLayer', {
                'state': true, 
                'replace': this.providerViewModels[i].name
            });
            return;
        }
    }

    this.speechSynthesis.answer('selectLayer', {
        'state': false, 
        'replace':_layer});
};


CesiumWorld.prototype.update = function() {
    'use strict';
    
    this.widget.render();
};
},{}],3:[function(require,module,exports){
/* globals GestureIntro, $ */

/**
* Export for require statemant
*/
module.exports = GestureIntro;

/**
* Constructor
*/
function GestureIntro() {
	'use strict';

	this.slides = [];
	this.currentSlide   = 0;
	this.numberOfSlides = 0;
}

GestureIntro.prototype.init = function() {
	'use strict';
	var _this = this;

	// Get all tutorial slides
	_this.slides = $('.intro-element');
	_this.numberOfSlides = _this.slides.length;


	$('#btn-start-tutorial').click(function() {
		$('#slide-welcome').fadeOut(500, function() {
			// Set the slide title and description
			_this.changeSlideInfo(_this.currentSlide);

			$('#slide-tutorial').fadeIn(500, function() {
				// Show the gesture box
				$('#gesture-intro').show();
			});
		});
	});

	$('#intro-next').click(function() {

		_this.currentSlide++;

		if ((_this.currentSlide + 1) === _this.numberOfSlides) {
			$('#intro-next').hide();
			$('.welcomebox-close').show();
		}

		$('#slide-info').fadeOut(500, function() {

			_this.changeSlideInfo(_this.currentSlide);

			$('#slide-info').fadeIn(500);
		});

		$(_this.slides[_this.currentSlide-1]).fadeOut(500, function() {
			$(_this.slides[_this.currentSlide]).show();
		});
	});
};

GestureIntro.prototype.changeSlideInfo = function(index) {
	'use strict';

	var title       = $(this.slides[index]).data('title');
	var description = $(this.slides[index]).data('description');

	$('#slide-title').text(title);
	$('#slide-description').text(description);
};
},{}],4:[function(require,module,exports){
/* globals LeapCameraController, Cesium */

/**
* Export for require statemant
*/
module.exports = LeapCameraController;


function LeapCameraController(camera, ellipsoid) {
  'use strict';

  this.camera    = camera;
  this.ellipsoid = ellipsoid;

  // api
  this.enabled      = true;
  this.target       = new Cesium.Cartesian3(0, 0, 0);
  this.step         = (camera.position.z === 0 ? Math.pow(10, (Math.log(camera.frustum.near) + Math.log(camera.frustum.far))/Math.log(10))/10.0 : camera.position.z);
  this.fingerFactor = 2;
  this.startZ       = this.camera.position.z;
  this.controlMode  = 'standard'; // 'standard' or 'flight'


  // `...Hands`       : integer or range given as an array of length 2
  // `...Fingers`     : integer or range given as an array of length 2
  // `...RightHanded` : boolean indicating whether to use left or right hand for controlling (if number of hands > 1)
  // `...HandPosition`: boolean indicating whether to use palm position or finger tip position (if number of fingers == 1)
  // `...Stabilized`  : boolean indicating whether to use stabilized palm/finger tip position or not

  // rotation
  this.rotateEnabled       = true;
  this.rotateSpeed         = 2.0;
  this.rotateHands         = 1;
  this.rotateFingers       = [2, 3]; 
  this.rotateRightHanded   = true;
  this.rotateHandPosition  = true;
  this.rotateStabilized    = true;
  this.rotateMin           = 0;
  this.rotateMax           = Math.PI;
  this.rotateSpeedInit     = this.rotateSpeed;
  
  // zoom
  this.zoomEnabled         = true;
  this.zoomSpeed           = 4.0;
  this.zoomHands           = 1;
  this.zoomFingers         = [4, 5];
  this.zoomRightHanded     = true;
  this.zoomHandPosition    = true;
  this.zoomStabilized      = true;
  this.zoomInMax           = 50;
  this.zoomOutMax          = 50000000;
  this.zoomMoveRateFactor  = 30;
  
  // pan
  this.panEnabled          = true;
  this.panSpeed            = 3.0;
  this.panHands            = 2;
  this.panFingers          = [6, 12];
  this.panRightHanded      = true;
  this.panHandPosition     = true;
  this.panStabilized       = true;
  this.panSpeedInit        = this.panSpeed;
  // camera height before panning
  this.cameraHeightZoom    = null;
  
  // internals
  this.rotateXLast         = null;
  this.rotateYLast         = null;
  this.zoomZLast           = null;
  this.panXLast            = null;
  this.panYLast            = null;
  this.panZLast            = null;  
}  
  
  
LeapCameraController.prototype.transformFactor = function(action) {
  'use strict';

  switch(action) {
    case 'rotate':
      return this.rotateSpeed * (this.rotateHandPosition ? 1 : this.fingerFactor);
    case 'zoom':
      return this.zoomSpeed * (this.zoomHandPosition ? 1 : this.fingerFactor);
    case 'pan':
      return this.panSpeed * (this.panHandPosition ? 1 : this.fingerFactor);
  }
};

LeapCameraController.prototype.mapLinear = function(x, a1, a2, b1, b2) {
  'use strict';
  return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
};

LeapCameraController.prototype.rotateTransform = function(delta) {
  'use strict';
  return this.transformFactor('rotate') * this.mapLinear(delta, -400, 400, -Math.PI, Math.PI);
};


LeapCameraController.prototype.zoomTransform = function(delta) {
  'use strict';
  return this.transformFactor('zoom') * this.mapLinear(delta, -400, 400, -this.step, this.step);
};


LeapCameraController.prototype.panTransform = function(delta) {
  'use strict';
  return this.transformFactor('pan') * this.mapLinear(delta, -400, 400, -this.step, this.step);
};


LeapCameraController.prototype.applyGesture = function(frame, action) {
  'use strict';

  var hl    = frame.hands.length;
  var fl    = frame.pointables.length;

  switch(action) {
    case 'rotate':
      if (this.rotateHands instanceof Array) {
        if (this.rotateFingers instanceof Array) {
          if (this.rotateHands[0] <= hl && hl <= this.rotateHands[1] && this.rotateFingers[0] <= fl && fl <= this.rotateFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.rotateHands[0] <= hl && hl <= this.rotateHands[1] && this.rotateFingers === fl) { 
            return true; 
          }
        }
      } 
      else {
        if (this.rotateFingers instanceof Array) {
          if (this.rotateHands === hl && this.rotateFingers[0] <= fl && fl <= this.rotateFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.rotateHands === hl && this.rotateFingers === fl) { 
            return true; 
          }
        }
      }
      break;
    case 'zoom':
      if (this.zoomHands instanceof Array) {
        if (this.zoomFingers instanceof Array) {
          if (this.zoomHands[0] <= hl && hl <= this.zoomHands[1] && this.zoomFingers[0] <= fl && fl <= this.zoomFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.zoomHands[0] <= hl && hl <= this.zoomHands[1] && this.zoomFingers === fl) { 
            return true; 
          }
        }
      } 
      else {
        if (this.zoomFingers instanceof Array) {
          if (this.zoomHands === hl && this.zoomFingers[0] <= fl && fl <= this.zoomFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.zoomHands === hl && this.zoomFingers === fl) { 
            return true; 
          }
        }
      }
      break;
    case 'pan':
      if (this.panHands instanceof Array) {
        if (this.panFingers instanceof Array) {
          if (this.panHands[0] <= hl && hl <= this.panHands[1] && this.panFingers[0] <= fl && fl <= this.panFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.panHands[0] <= hl && hl <= this.panHands[1] && this.panFingers === fl) { 
            return true; 
          }
        }
      } 
      else {
        if (this.panFingers instanceof Array) {
          if (this.panHands === hl && this.panFingers[0] <= fl && fl <= this.panFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.panHands === hl && this.panFingers === fl) { 
            return true; 
          }
        }
      }
      break;
  }

  return false;
};


LeapCameraController.prototype.hand = function(frame, action) {
  'use strict';

  var hds = frame.hands;
   
    if (hds.length > 0) {
      if (hds.length === 1) {
        return hds[0];
      } else if (hds.length === 2) {
        var lh, rh;
        if (hds[0].palmPosition[0] < hds[1].palmPosition[0]) {
          lh = hds[0];
          rh = hds[1];
        } else {
          lh = hds[1];
          rh = hds[0];
        }

        switch(action) {
          case 'rotate':
            if (this.rotateRightHanded) {
              return rh;
            } 
            else {
              return lh;
            }
            break;
          case 'zoom':
            if (this.zoomRightHanded) {
              return rh;
            } 
            else {
              return lh;
            }
            break;
          case 'pan':
            if (this.panRightHanded) {
              return rh;
            } 
            else {
              return lh;
            }
        }
      }
    }

    return false;
};


LeapCameraController.prototype.position = function(frame, action) {
  'use strict';
  // assertion: if `...HandPosition` is false, then `...Fingers` needs to be 1 or [1, 1]
  var h;
  switch(action) {
    case 'rotate':
      h = this.hand(frame, 'rotate');
      return (this.rotateHandPosition ? (this.rotateStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
        : (this.rotateStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
      );
    case 'zoom':
      h = this.hand(frame, 'zoom');
      return (this.zoomHandPosition ? (this.zoomStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
        : (this.zoomStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
      );
    case 'pan':
      h = this.hand(frame, 'pan');
      return (this.panHandPosition ? (this.panStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
        : (this.panStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
      );
  }
};


LeapCameraController.prototype.rotateCamera = function(frame) {
  'use strict';

  if (this.rotateEnabled && this.applyGesture(frame, 'rotate')) {
      // if fly to modus was used, change x and y and fix the inverted new x
      var y = this.position(frame, 'rotate')[0];
     
      if (!this.rotateYLast) {
        this.rotateYLast = y;
      }
      var yDelta = y - this.rotateYLast;
      
      var n = null;

      // rotate around axis in xy-plane (in target coordinate system) which is orthogonal to camera vector
      var t = new Cesium.Cartesian3.subtract(this.camera.position, this.target);
      //var t = new THREE.Vector3().subVectors(this.camera.position, this.target); // translate
      var angleDelta = this.rotateTransform(yDelta);

      var newAngle = Cesium.Cartesian3.angleBetween(t, new Cesium.Cartesian3(0, 1, 0));
      //var newAngle = t.angleTo(new THREE.Vector3(0, 1, 0)) + angleDelta;

      if (this.rotateMin < newAngle && newAngle < this.rotateMax) {
        n = Cesium.Cartesian3.normalize(new Cesium.Cartesian3(t.z, 0, -t.x));

        this.camera.rotate(n, -angleDelta);   
      }

      var x = -this.position(frame, 'rotate')[1];
      // rotate around y-axis translated by target vector
      if (!this.rotateXLast) {
        this.rotateXLast = x;
      }
      var xDelta = x - this.rotateXLast;
      
      angleDelta = this.rotateTransform(xDelta);
      n = new Cesium.Cartesian3.normalize(new Cesium.Cartesian3(0, 1, 0));


      // rotation speed adjusting
      var cameraHeight = this.ellipsoid.cartesianToCartographic(this.camera.position).height;


      if (cameraHeight < 300) {
          this.rotateSpeed = 0.00002;
      }
      else if (cameraHeight < 2000 && cameraHeight > 300) {
          this.rotateSpeed = 0.0001;
      }
      else if (cameraHeight < 12000 && cameraHeight > 2000) {
          this.rotateSpeed = 0.003;
      }
      else if (cameraHeight < 80000 && cameraHeight > 12000) {
          this.rotateSpeed = 0.008;
      }
      else if (cameraHeight < 300000 && cameraHeight > 80000) {
          this.rotateSpeed = 0.05;
      }
      else if (cameraHeight < 500000 && cameraHeight > 300000) {
          this.rotateSpeed = 0.1;
      }
      else if (cameraHeight > 500000 && cameraHeight < 1000000) {
          this.rotateSpeed = 0.25;
      }
      else if (cameraHeight > 1000000 && cameraHeight < 2000000) {
          this.rotateSpeed = 0.5;
      }
      else if (cameraHeight > 2000000 && cameraHeight < 5000000) {
          this.rotateSpeed = 1.0;
      }
      else {
          this.rotateSpeed = this.rotateSpeedInit;
      }
    
    this.camera.rotate(n, angleDelta);


    this.rotateYLast = y;
    this.rotateXLast = x;
    this.zoomZLast   = null;
    this.panXLast    = null;
    this.panYLast    = null;
    this.panZLast    = null;      
  } 
  else {
    this.rotateYLast = null;
    this.rotateXLast = null;
  }
};

LeapCameraController.prototype.zoomCamera = function(frame) { 
  'use strict';

  if (this.zoomEnabled && this.applyGesture(frame, 'zoom')) {
    var z = this.position(frame, 'zoom')[2];
    if (!this.zoomZLast) { 
      this.zoomZLast = z;
    }
    var zDelta = z - this.zoomZLast;

    var lengthDelta = this.zoomTransform(zDelta);

    var cameraHeight = this.ellipsoid.cartesianToCartographic(this.camera.position).height;
    var moveRate = cameraHeight / this.zoomMoveRateFactor;

    if (lengthDelta > 0) {
      if (cameraHeight < this.zoomInMax) {
          //dont zoom in anymore
      }
      else {
          this.camera.moveForward(moveRate);
      }
    }
    else {
      if (cameraHeight > this.zoomOutMax) {
          //dont zoom out anymore
      }
      else {
          this.camera.moveBackward(moveRate);
      }
    }
    
    this.cameraHeightZoom = cameraHeight;


    this.zoomZLast        = z; 
    this.rotateXLast      = null;
    this.rotateYLast      = null;
    this.panXLast         = null;
    this.panYLast         = null;
    this.panZLast         = null;
  } 
  else {
    this.zoomZLast = null; 
  }
};

LeapCameraController.prototype.panCamera = function(frame) {
  'use strict';

  if (this.panEnabled && this.applyGesture(frame, 'pan')) {
    var x = this.position(frame, 'pan')[0];
    var y = this.position(frame, 'pan')[1];
    var z = this.position(frame, 'pan')[2];
    if (!this.panXLast) {
      this.panXLast = x;
    }
    if (!this.panYLast) { 
      this.panYLast = y;
    }
    if (!this.panZLast) { 
      this.panZLast = z;
    }
    var xDelta = x - this.panXLast;
    var yDelta = y - this.panYLast;


    var cameraHeight = this.ellipsoid.cartesianToCartographic(this.camera.position).height;
    
    if (cameraHeight < 10000) {
        this.panSpeed = 0.001;
    }
    if (cameraHeight < 50000 && cameraHeight > 10000) {
        this.panSpeed = 0.01;
    }
    else if (cameraHeight < 500000 && cameraHeight > 50000) {
        this.panSpeed = 0.1;
    }
    else if (cameraHeight > 500001 && cameraHeight < 1500000) {
        this.panSpeed = 0.8;
    }
    else {
        this.panSpeed = this.panSpeedInit;
    }
      
    var absoluteX = Math.abs(this.panTransform(xDelta));
  
    if(xDelta > 0) {
      this.camera.moveLeft(absoluteX);
    }
    else {
      this.camera.moveRight(absoluteX);
    }


    var absoluteY = Math.abs(this.panTransform(yDelta));

    if(yDelta > 0) {
      this.camera.moveDown(absoluteY);
    }
    else {
      this.camera.moveUp(absoluteY);
    }


    this.panXLast    = x;
    this.panYLast    = y;
    this.panZLast    = z;
    this.rotateXLast = null;
    this.rotateYLast = null;
    this.zoomZLast   = null;
  } 
  else {
    this.panXLast = null;
    this.panYLast = null;
    this.panZLast = null;     
  }
};

LeapCameraController.prototype.airplaneCamera = function(frame) {
  'use strict';

  var data = frame.data;
  if (frame.valid && data.hands.length === 1) {
    var fingers = data.pointables;
    if (fingers.length > 1) {
      data = data.hands[0];
      if (data.timeVisible > 0.75) {
        var camera = this.camera,
            movement = {},
            cameraHeight = this.ellipsoid.cartesianToCartographic(camera.position).height,
            moveRate = cameraHeight / 100.0;

        // pan - x,y
        movement.x = data.palmPosition[0];
        movement.y = data.palmPosition[2];

        //zoom - z // height above leap
        movement.z = data.palmPosition[1];

        //pitch - pitch
        var normal = data.palmNormal;
        movement.pitch = -1 * normal[2]; // leap motion has it that negative is sloping upwards
        //Math.atan2(normal.z, normal.y) * 180/math.pi + 180;
        movement.rotate = data.direction[0];
        //yaw - yaw
        movement.yaw = -1 * normal[0]; // roll?
        // LeapMotion flips its roll angles as well

        // this 'mid' var seems to be a natural mid point in the 'z'
        // (or vertcal distance above device)
        // direction that is used for whether you are closer to the device
        // or away from it.
        var mid = 175;
        var normalized = (movement.z - mid) / -100;

        camera.moveForward(normalized * moveRate);
        camera.moveRight(movement.x * moveRate / 100);
        camera.moveDown(movement.y * moveRate / 100);

        camera.lookUp(movement.pitch / 100);

        camera.twistRight(movement.yaw / 100);
        camera.lookRight(movement.rotate / 100);
      }
    }
  }
};

LeapCameraController.prototype.update = function(frame) {
  'use strict';

  if (this.enabled) {
    if (this.controlMode === 'standard') {
      this.rotateCamera(frame);
      this.zoomCamera(frame);
      this.panCamera(frame);
    }
    else if (this.controlMode === 'flight') {
      this.airplaneCamera(frame);
    }
  }
};

},{}],5:[function(require,module,exports){
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
  'use strict';

  this.Leap = Leap;

  // Create a new controller
  this.controller = new this.Leap.Controller({enableGestures: true});

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


LeapConnector.prototype.update = function() {
  'use strict';

	this.currentFrame = this.controller.frame();
	this.visualize();
};


/**
* Functions for the visualization of the leap data
*/
LeapConnector.prototype.moveFinger = function(Finger, posX, posY, posZ, dirX, dirY, dirZ) {
  'use strict';
  Finger.style.webkitTransform = Finger.style.mozTransform = 
  Finger.style.transform = "translateX("+posX+"px) translateY("+posY+"px) translateZ("+posZ+"px) rotateX("+dirX+"deg) rotateY(0deg) rotateZ("+dirZ+"deg)";
};

LeapConnector.prototype.moveSphere = function(Sphere, posX, posY, posZ, rotX) {
  'use strict';
  Sphere.style.webkitTransform = Sphere.style.mozTransform = 
  Sphere.style.transform = "translateX("+posX+"px) translateY("+posY+"px) translateZ("+posZ+"px) rotateX("+rotX+"deg) rotateY(0deg) rotateZ(0deg)";
};

LeapConnector.prototype.visualize = function () {
  'use strict';

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
        this.moveSphere(sphereDiv, posX, posY, posZ, rotX, rotY, rotZ);
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
        this.moveFinger(fingerDiv, posX, posY, posZ, dirX, dirY, dirZ);
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
},{"events":10,"util":14}],6:[function(require,module,exports){
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


},{"./Ui.js":1,"./cesiumWorld.js":2,"./gestureIntro.js":3,"./leapCameraController.js":4,"./leapConnector.js":5,"./speech.json":7,"./speechRecognition.js":8,"./speechSynthesis.js":9}],7:[function(require,module,exports){
module.exports=[
  {
    "language": "German",
    "code": "de-DE",
    "items": [
      {
        "emit": "selectLayer",
        "detect": "Oberfläche",
        "answers": {
          "success": [
            "Ich habe die Oberfläche zu #REPLACE# geändert."
          ],
          "fail": [
            "Ich kann die Oberfläche #REPLACE# nicht benutzen."
          ]
        }
      },
      {
        "emit": "flightMode",
        "detect": "Flugmodus",
        "answers": {
          "success": [
            "Ich habe den Flugmodus aktiviert."
          ],
          "fail": [
            "Ich konnte den Flugmodus nicht aktivieren."
          ]
        }
      },
      {
        "emit": "informationRequest",
        "detect": "Informationen",
        "answers": {
          "success": [],
          "fail": []
        }
      },
      {
        "emit": "test",
        "detect": "test",
        "answers": {
          "success": [
            "Dein Mikrophon funktioniert super.",
            "Ich höre dich."
          ],
          "fail": [
            "Ich konnte den Flugmodus nicht aktivieren."
          ]
        }
      },
      {
        "emit": "standardMode",
        "detect": "Standard modus",
        "answers": {
          "success": [
            "Ich habe den Standardmodus aktiviert."
          ],
          "fail": [
            "Ich konnte den Standardmodus nicht aktivieren."
          ]
        }
      },
      {
        "emit": "thanks",
        "detect": "Danke",
        "answers": {
          "success": [
            "Gerne doch.",
            "Kein Problem.",
            "Ich freue mich dir geholfen zu haben.",
            "Das habe ich doch gern getan."
          ]
        }
      },
      {
        "emit": "setTerrain",
        "detect": "Relief",
        "answers": {
          "success": [
            "Ich habe das Relief #REPLACE#."
          ],
          "fail": [
            "Ich kann das Relief nicht einschalten."
          ]
        }
      },
      {
        "emit": "navigateTo",
        "detect": "suche",
        "answers": {
          "success": [
            "Ich habe #REPLACE# gefunden"
          ],
          "fail": [
            "Ich konnte #REPLACE# nicht finden.",
            "Ich habe #REPLACE# nicht gefunden.",
            "Es tut mir leid, ich habe #REPLACE# nicht gefunden."
          ]
        }
      },
      {
        "emit": "moveForward",
        "detect": "vergrößern",
        "answers": {
          "success": [
            "Du bist jetzt näher dran."
          ],
          "fail": [
            "Ich konnte nicht weiter vergrößern."
          ]
        }
      },
      {
        "emit": "moveBackward",
        "detect": "verkleinern",
        "answers": {
          "success": [
            "Du bist jetzt weiter weg."
          ],
          "fail": [
            "Ich konnte nicht weiter verkleinern."
          ]
        }
      },
      {
        "emit": "moveUp",
        "detect": "hoch",
        "answers": {
          "success": [
            "Du bist jetzt weiter oben."
          ],
          "fail": [
            "Ich konnte nicht weiter hoch."
          ]
        }
      },
      {
        "emit": "moveDown",
        "detect": "runter",
        "answers": {
          "success": [
            "Du bist jetzt weiter unten."
          ],
          "fail": [
            "Ich konnte nicht weiter runter."
          ]
        }
      },
      {
        "emit": "moveLeft",
        "detect": "links",
        "answers": {
          "success": [
            "Du bist jetzt weiter links."
          ],
          "fail": [
            "Ich konnte nicht weiter links."
          ]
        }
      },
      {
        "emit": "moveRight",
        "detect": "rechts",
        "answers": {
          "success": [
            "Du bist jetzt weiter rechts."
          ],
          "fail": [
            "Ich konnte nicht weiter rechts."
          ]
        }
      }
    ]
  }
]
},{}],8:[function(require,module,exports){
/* globals SpeechRecognition, window, webkitSpeechRecognition*/


var events = require('events');
var util   = require('util');

/**
 * Export for require statemant
 */
module.exports = SpeechRecognition;


/**
 * Constructor
 */
function SpeechRecognition(_speechList) {
    'use strict';

    this.browserRecognition = null;
    this.isRecognizing = false;
    this.language = 'de-DE';
    this.speechList = _speechList;
    this.speechError = false;

    this.init();
}


util.inherits(SpeechRecognition, events.EventEmitter);


SpeechRecognition.prototype.init = function() {
    'use strict';
    
    if (!('webkitSpeechRecognition' in window)) {
        console.log('Speech recognition is not available.');
    } else {

        this.browserRecognition = new webkitSpeechRecognition();
        this.browserRecognition.continuous = true;
        this.browserRecognition.interimResults = true;
        this.browserRecognition.lang = this.language;
        
        var _this = this;
        
        this.browserRecognition.onstart = function(){_this.onStart();};
        this.browserRecognition.onresult = function(event){_this.onResult(event);};
        this.browserRecognition.onend = function(){_this.onEnd();};
        this.browserRecognition.onerror = function(event){_this.onError(event);};
        
        this.start();
    }
};

SpeechRecognition.prototype.start = function() {
    'use strict';
    this.browserRecognition.start();
};

SpeechRecognition.prototype.stop = function() {
    'use strict';
    this.browserRecognition.stop();
};

SpeechRecognition.prototype.onStart = function() {
    'use strict';
    this.isRecognizing = true;
};

SpeechRecognition.prototype.onResult = function(event) {
    'use strict';
    
    var interimTranscript = '';
    var finalMatch = false;

    for (var i = event.resultIndex; i < event.results.length; ++i) {
        console.log(event.results[i]);
        if (event.results[i].isFinal) {
            finalMatch = true;
            interimTranscript += event.results[i][0].transcript;
        }
    }

    if(finalMatch)
    {
        interimTranscript = this.trimSpaces(interimTranscript);
        
        for(var j = 0; j < this.speechList.length; ++j)
        {
            if(this.speechList[j].code === this.language)
            {
                for(var k = 0; k < this.speechList[j].items.length; ++k)
                {
                    var currentDetectionItem = this.speechList[j].items[k];

                    if(interimTranscript.toLowerCase().indexOf(currentDetectionItem.detect.toLowerCase()) !== -1)
                    {
                        var eventData = {
                            'action' : this.trimSpaces(interimTranscript.replace(currentDetectionItem.detect, '')),
                            'detected' : currentDetectionItem.detect,
                            'emit' : currentDetectionItem.emit,
                            'language' : this.language
                        };

                        this.emit(currentDetectionItem.emit, eventData);
                        return;
                    }
                }
            }
        }
        
        console.log('nichts brauchbares');
    }
    else
    {
        // no final match
    }
};

SpeechRecognition.prototype.trimSpaces = function(_string) {
    'use strict';
    return _string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

SpeechRecognition.prototype.onEnd = function() {
    'use strict';
    this.isRecognizing = false;
    
    if(!this.speechError)
    {
        this.start();
    }
    
    console.log("speech recognition ended");
};

SpeechRecognition.prototype.onError = function(event) {
    'use strict';
    
    if (event.error === 'no-speech') {
        console.log('Error: no speech');
    }
    if (event.error === 'audio-capture') {
        console.log('Error: no microphone');
        this.speechError = true;
    }
    if (event.error === 'not-allowed') {
        console.log('Error: not allowed');
        this.speechError = true;
    }
};
},{"events":10,"util":14}],9:[function(require,module,exports){
/* globals SpeechSynthesis, SpeechSynthesisUtterance, window*/


var events = require('events');
var util   = require('util');

/**
 * Export for require statemant
 */
module.exports = SpeechSynthesis;


/**
 * Constructor
 */
function SpeechSynthesis(_speechList) {
    'use strict';

    this.message = null;
    this.voices  = [];
    this.language = 'de-DE';
    this.speechList = _speechList;
    
    this.init();
}


util.inherits(SpeechSynthesis, events.EventEmitter);


SpeechSynthesis.prototype.init = function() {
    'use strict';
    
    // Checking for speech recognition here because speechSynthesis is a little buggy in firefox
    if (!('webkitSpeechRecognition' in window)) {
        console.log('SpeechSynthesis is not available.');
    } 
    else 
    {

        this.message = new SpeechSynthesisUtterance();
        this.voices = window.speechSynthesis.getVoices();
        
        this.message.voice = this.voices[0]; // Note: some voices don't support altering params
        this.message.voiceURI = 'native';
        this.message.volume = 1; // 0 to 1
        this.message.rate = 1; // 0.1 to 10
        this.message.pitch = 2; //0 to 2
        this.message.text = '';
        this.message.lang = this.language;
        
        this.overlengthArray = [];
        this.overlengthCount = 0;
    }
};

SpeechSynthesis.prototype.strSplitOnLength = function(str, maxWidth) {
    'use strict';

    var resultArr = [];
    var parts = str.split(/([\s\n\r]+)/);
    var count = parts.length;
    var width = 0;
    var start = 0;
    for (var i=0; i<count; ++i) {
        width += parts[i].length;
        if (width > maxWidth) {
            resultArr.push( parts.slice(start, i).join('') );
            start = i;
            width = 0;
        }
    }
    return resultArr;
};


SpeechSynthesis.prototype.onEnd = function() {
    'use strict';
    console.log(this);
    
    if((this.overlengthArray.length) === this.overlengthCount)
    {
        this.message.onend = undefined;
        this.overlengthCount = 0;
        this.overlengthArray = [];
        
        return;
    }
    else
    {
        console.log(this.overlengthCount);
        ++this.overlengthCount;
        this.message.text = this.overlengthArray[this.overlengthCount];
        window.speechSynthesis.speak(this.message);
    }
};

SpeechSynthesis.prototype.speak = function(_text, _options) {
    'use strict';
    
    window.speechSynthesis.cancel();
    
    if(_text.length > 200)
    {
        this.overlengthArray = this.strSplitOnLength(_text, 200);
        console.log(this.overlengthArray);
        
        this.message.text = this.overlengthArray[0];
        
        var _this = this;
        
        this.message.onend = function(event){_this.onEnd(event);};
        
        window.speechSynthesis.speak(this.message);
        
        return;
    }
    
    this.message.text = _text;
    
    this.message.onend = undefined;
    this.message.onstart = undefined;
    this.message.onpause = undefined;
    this.message.onresume = undefined;
    this.message.onerror = undefined;
    
    if(typeof _options !== 'undefined')
    {
        if(typeof _options.onEnd === "function")
        {
            this.message.onend = _options.onEnd;
        }

        if(typeof _options.onStart === "function")
        {
            this.message.onstart = _options.onStart;
        }

        if(typeof _options.onPause === "function")
        {
            this.message.onpause = _options.onPause;
        }

        if(typeof _options.onResume === "function")
        {
            this.message.onresume = _options.onResume;
        }

        if(typeof _options.onError === "function")
        {
            this.message.onerror = _options.onerror;
        }
    }

    window.speechSynthesis.speak(this.message);
};

SpeechSynthesis.prototype.answer = function(_emit, _options) {
    'use strict';
    
    for (var j = 0; j < this.speechList.length; ++j)
    {
        if (this.speechList[j].code === this.language)
        {
            for (var k = 0; k < this.speechList[j].items.length; ++k)
            {
                var currentDetectionItem = this.speechList[j].items[k];

                if (currentDetectionItem.emit === _emit)
                {
                    var options = {
                        'onEnd': _options.onEnd,
                        'onError': _options.onError,
                        'onStart': _options.onStart,
                        'onPause': _options.onPause,
                        'onResume': _options.onResume
                    };
                    
                    if(_options.state)
                    {
                         this.speak(currentDetectionItem.answers.success[Math.floor((Math.random() * currentDetectionItem.answers.success.length) + 0)].replace('#REPLACE#', _options.replace), options);
                    }
                    else
                    {
                        this.speak(currentDetectionItem.answers.fail[Math.floor((Math.random() * currentDetectionItem.answers.fail.length) + 0)].replace('#REPLACE#', _options.replace), options);
                    }
                }
            }
        }
    }
};
},{"events":10,"util":14}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],13:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],14:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("Zbi7gb"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":13,"Zbi7gb":12,"inherits":11}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXHRob21pXFxTa3lEcml2ZVxcV29ya3NwYWNlXFxzeW5lcmd5XFxjbGllbnRcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L2FwcC9zY3JpcHRzL3NyYy9VaS5qcyIsIkM6L1VzZXJzL3Rob21pL1NreURyaXZlL1dvcmtzcGFjZS9zeW5lcmd5L2NsaWVudC9hcHAvc2NyaXB0cy9zcmMvY2VzaXVtV29ybGQuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL2dlc3R1cmVJbnRyby5qcyIsIkM6L1VzZXJzL3Rob21pL1NreURyaXZlL1dvcmtzcGFjZS9zeW5lcmd5L2NsaWVudC9hcHAvc2NyaXB0cy9zcmMvbGVhcENhbWVyYUNvbnRyb2xsZXIuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL2xlYXBDb25uZWN0b3IuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL21haW4uanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL3NwZWVjaC5qc29uIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L2FwcC9zY3JpcHRzL3NyYy9zcGVlY2hSZWNvZ25pdGlvbi5qcyIsIkM6L1VzZXJzL3Rob21pL1NreURyaXZlL1dvcmtzcGFjZS9zeW5lcmd5L2NsaWVudC9hcHAvc2NyaXB0cy9zcmMvc3BlZWNoU3ludGhlc2lzLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbHMgVWksICQgKi9cclxuXHJcbi8qKlxyXG4qIEV4cG9ydCBmb3IgcmVxdWlyZSBzdGF0ZW1hbnRcclxuKi9cclxubW9kdWxlLmV4cG9ydHMgPSBVaTtcclxuXHJcbi8qKlxyXG4qIENvbnN0cnVjdG9yXHJcbiovXHJcbmZ1bmN0aW9uIFVpKGNlc2l1bVdvcmxkKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR0aGlzLnN0cmluZ1RhYmxlID0gW107XHJcblx0dGhpcy5zdHJpbmdUYWJsZVsnZW4nXSA9IFtdO1xyXG5cdHRoaXMuc3RyaW5nVGFibGVbJ2VuJ11bJ3RvcG9EZWFjJ10gPSAnUmVsaWVmIG9mZic7XHJcblx0dGhpcy5jZXNpdW1Xb3JsZCA9IGNlc2l1bVdvcmxkO1xyXG5cclxuXHQkKCcjc3dpdGNoLXRvcG9ncmFwaHknKS50ZXh0KHRoaXMuc3RyaW5nVGFibGVbJ2VuJ11bJ3RvcG9EZWFjJ10pO1xyXG5cclxufVxyXG5cclxuVWkucHJvdG90eXBlLmNsb3NlV2VsY29tZUJveCA9IGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0JCgnLndlbGNvbWVib3gtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0JCgnI3dlbGNvbWVib3gsICNnZXN0dXJlLWludHJvJykuZmFkZU91dCg1MDApO1xyXG5cdH0pO1xyXG59O1xyXG5cclxuVWkucHJvdG90eXBlLnRvZ2dsZU1lbnUgPSBmdW5jdGlvbiAoKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHQkKCcjbWVudS10b2dnbGVyJykuY2xpY2soZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdCQoJyNtZW51LWVsZW1lbnRzJykuc2xpZGVUb2dnbGUoJ3Nsb3cnKTtcclxuXHR9KTtcclxufTtcclxuXHJcblVpLnByb3RvdHlwZS5jaGFuZ2VSZWxpZWYgPSBmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG5cdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYoJCgnI3N3aXRjaC10b3BvZ3JhcGh5JykudGV4dCgpID09PSAnUmVsaWVmIG9mZicpIHtcclxuXHRcdFx0JCgnI3N3aXRjaC10b3BvZ3JhcGh5JykucmVtb3ZlQ2xhc3MoXCJ0b3BvZ3JhcGh5LWluYWN0aXZlIHAtYnRuLWVycm9cIik7XHJcblx0XHRcdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLmFkZENsYXNzKFwidG9wb2dyYXBoeS1hY3RpdmUgcC1idG4tc3VjY1wiKTtcclxuXHRcdFx0JCgnI3N3aXRjaC10b3BvZ3JhcGh5JykudGV4dChcIlJlbGllZiBvblwiKTtcclxuXHRcdFx0X3RoaXMuY2VzaXVtV29ybGQuc2V0VGVycmFpbih0cnVlKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYoJCgnI3N3aXRjaC10b3BvZ3JhcGh5JykudGV4dCgpID09PSAnUmVsaWVmIG9uJyl7XHJcblx0XHRcdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLnJlbW92ZUNsYXNzKFwidG9wb2dyYXBoeS1hY3RpdmUgcC1idG4tc3VjY1wiKTtcclxuXHRcdFx0JCgnI3N3aXRjaC10b3BvZ3JhcGh5JykuYWRkQ2xhc3MoXCJ0b3BvZ3JhcGh5LWluYWN0aXZlIHAtYnRuLWVycm9cIik7XHJcblx0XHRcdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLnRleHQoXCJSZWxpZWYgb2ZmXCIpO1xyXG5cdFx0XHRfdGhpcy5jZXNpdW1Xb3JsZC5zZXRUZXJyYWluKGZhbHNlKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuXHJcblVpLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR0aGlzLmNsb3NlV2VsY29tZUJveCgpO1xyXG5cdHRoaXMudG9nZ2xlTWVudSgpO1xyXG5cdHRoaXMuY2hhbmdlUmVsaWVmKCk7XHJcbn07IiwiLyogZ2xvYmFscyBDZXNpdW0sIENlc2l1bVdvcmxkLCB3aW5kb3csICQsIG5hdmlnYXRvciAqL1xyXG5cclxuLyoqXHJcbiogRXhwb3J0IGZvciByZXF1aXJlIHN0YXRlbWFudFxyXG4qL1xyXG5tb2R1bGUuZXhwb3J0cyA9IENlc2l1bVdvcmxkO1xyXG5cclxuXHJcbi8qKlxyXG4qIENvbnN0cnVjdG9yXHJcbiovXHJcbmZ1bmN0aW9uIENlc2l1bVdvcmxkKF9zcGVlY2hSZWNvZ25pdGlvbiwgX3NwZWVjaFN5bnRoZXNpcykge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgX3RoaXMucHJvdmlkZXJWaWV3TW9kZWxzID0gW107XHJcbiAgICBfdGhpcy5wcm92aWRlclZpZXdNb2RlbHMucHVzaChuZXcgQ2VzaXVtLkltYWdlcnlQcm92aWRlclZpZXdNb2RlbCh7XHJcbiAgICAgICAgIG5hbWUgOiAnT3BlblN0cmVldE1hcCcsXHJcbiAgICAgICAgIGljb25VcmwgOiBDZXNpdW0uYnVpbGRNb2R1bGVVcmwoJy4uLy4uLy4uL2ltYWdlcy9vcGVuU3RyZWV0TWFwLnBuZycpLFxyXG4gICAgICAgICB0b29sdGlwIDogJ09wZW5TdHJlZXRNYXAgKE9TTSkgaXMgYSBjb2xsYWJvcmF0aXZlIHByb2plY3QgdG8gY3JlYXRlIGEgZnJlZSBlZGl0YWJsZSBtYXAgb2YgdGhlIHdvcmxkLlxcbmh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcnLFxyXG4gICAgICAgICBjcmVhdGlvbkZ1bmN0aW9uIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gbmV3IENlc2l1bS5PcGVuU3RyZWV0TWFwSW1hZ2VyeVByb3ZpZGVyKHtcclxuICAgICAgICAgICAgICAgICB1cmwgOiAnaHR0cDovL3RpbGUub3BlbnN0cmVldG1hcC5vcmcvJ1xyXG4gICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICB9KSk7XHJcblxyXG4gICAgIF90aGlzLnByb3ZpZGVyVmlld01vZGVscy5wdXNoKG5ldyBDZXNpdW0uSW1hZ2VyeVByb3ZpZGVyVmlld01vZGVsKHtcclxuICAgICAgICAgbmFtZSA6ICdibGFjayBtYXJibGUnLFxyXG4gICAgICAgICBpY29uVXJsIDogQ2VzaXVtLmJ1aWxkTW9kdWxlVXJsKCcuLi8uLi8uLi9pbWFnZXMvYmxhY2tNYXJibGUucG5nJyksXHJcbiAgICAgICAgIHRvb2x0aXAgOiAnVGhlIGxpZ2h0cyBvZiBjaXRpZXMgYW5kIHZpbGxhZ2VzIHRyYWNlIHRoZSBvdXRsaW5lcyBvZiBjaXZpbGl6YXRpb24gaW4gdGhpcyBnbG9iYWwgdmlldyBvZiB0aGUgRWFydGggYXQgbmlnaHQgYXMgc2VlbiBieSBOQVNBL05PQUFcXCdzIFN1b21pIE5QUCBzYXRlbGxpdGUuJyxcclxuICAgICAgICAgY3JlYXRpb25GdW5jdGlvbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uVGlsZU1hcFNlcnZpY2VJbWFnZXJ5UHJvdmlkZXIoe1xyXG4gICAgICAgICAgICAgICAgIHVybCA6ICdodHRwczovL2Nlc2l1bWpzLm9yZy9ibGFja21hcmJsZScsXHJcbiAgICAgICAgICAgICAgICAgbWF4aW11bUxldmVsIDogOCxcclxuICAgICAgICAgICAgICAgICBjcmVkaXQgOiAnQmxhY2sgTWFyYmxlIGltYWdlcnkgY291cnRlc3kgTkFTQSBFYXJ0aCBPYnNlcnZhdG9yeSdcclxuICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgfSkpO1xyXG5cclxuICAgICBfdGhpcy5wcm92aWRlclZpZXdNb2RlbHMucHVzaChuZXcgQ2VzaXVtLkltYWdlcnlQcm92aWRlclZpZXdNb2RlbCh7XHJcbiAgICAgICAgIG5hbWUgOiAnQmluZycsXHJcbiAgICAgICAgIGljb25VcmwgOiBDZXNpdW0uYnVpbGRNb2R1bGVVcmwoJy4uLy4uLy4uL2ltYWdlcy9iaW5nQWVyaWFsLnBuZycpLFxyXG4gICAgICAgICB0b29sdGlwIDogJ1RoZSBsaWdodHMgb2YgY2l0aWVzIGFuZCB2aWxsYWdlcyB0cmFjZSB0aGUgb3V0bGluZXMgb2YgY2l2aWxpemF0aW9uIGluIHRoaXMgZ2xvYmFsIHZpZXcgb2YgdGhlIEVhcnRoIGF0IG5pZ2h0IGFzIHNlZW4gYnkgTkFTQS9OT0FBXFwncyBTdW9taSBOUFAgc2F0ZWxsaXRlLicsXHJcbiAgICAgICAgIGNyZWF0aW9uRnVuY3Rpb24gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgIHJldHVybiBuZXcgQ2VzaXVtLkJpbmdNYXBzSW1hZ2VyeVByb3ZpZGVyKHtcclxuICAgICAgICAgICAgICAgIHVybCA6ICdodHRwczovL2Rldi52aXJ0dWFsZWFydGgubmV0JyxcclxuICAgICAgICAgICAgICAgIG1hcFN0eWxlIDogQ2VzaXVtLkJpbmdNYXBzU3R5bGUuQUVSSUFMXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgfSkpO1xyXG5cclxuICBcclxuICAgIF90aGlzLndpZGdldCA9IG5ldyBDZXNpdW0uQ2VzaXVtV2lkZ2V0KCdjZXNpdW1Db250YWluZXInLCB7XHJcbiAgICAgICAgJ2ltYWdlcnlQcm92aWRlcic6IGZhbHNlLFxyXG4gICAgICAgIHNreUJveCA6IG5ldyBDZXNpdW0uU2t5Qm94KHtcclxuICAgICAgICAgICAgc291cmNlcyA6IHtcclxuICAgICAgICAgICAgICBwb3NpdGl2ZVggOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfcHguanBnJyxcclxuICAgICAgICAgICAgICBuZWdhdGl2ZVggOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfbXguanBnJyxcclxuICAgICAgICAgICAgICBwb3NpdGl2ZVkgOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfcHkuanBnJyxcclxuICAgICAgICAgICAgICBuZWdhdGl2ZVkgOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfbXkuanBnJyxcclxuICAgICAgICAgICAgICBwb3NpdGl2ZVogOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfcHouanBnJyxcclxuICAgICAgICAgICAgICBuZWdhdGl2ZVogOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfbXouanBnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgdXNlRGVmYXVsdFJlbmRlckxvb3A6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIF90aGlzLmxheWVycyA9IHRoaXMud2lkZ2V0LmNlbnRyYWxCb2R5LmltYWdlcnlMYXllcnM7XHJcbiAgICBfdGhpcy5iYXNlTGF5ZXJQaWNrZXIgPSBuZXcgQ2VzaXVtLkJhc2VMYXllclBpY2tlcignYmFzZUxheWVyQ29udGFpbmVyJywgdGhpcy5sYXllcnMsIHRoaXMucHJvdmlkZXJWaWV3TW9kZWxzKTtcclxuICAgIF90aGlzLmJhc2VMYXllclBpY2tlci52aWV3TW9kZWwuc2VsZWN0ZWRJdGVtID0gdGhpcy5wcm92aWRlclZpZXdNb2RlbHNbMl07XHJcbiAgICBfdGhpcy5nZW9Db2RlciA9IG5ldyBDZXNpdW0uR2VvY29kZXIoeydjb250YWluZXInIDogJ2Nlc2l1bUdlb2NvZGVyJywgJ3NjZW5lJyA6IHRoaXMud2lkZ2V0LnNjZW5lfSk7XHJcbiAgICBfdGhpcy5lbGxpcHNvaWQgPSB0aGlzLndpZGdldC5jZW50cmFsQm9keS5lbGxpcHNvaWQ7XHJcbiAgICBfdGhpcy5jZW50cmFsQm9keSA9IHRoaXMud2lkZ2V0LmNlbnRyYWxCb2R5O1xyXG4gICAgX3RoaXMuY2VudHJhbEJvZHkuZGVwdGhUZXN0QWdhaW5zdFRlcnJhaW4gPSB0cnVlO1xyXG4gIFxyXG5cclxuICAgIF90aGlzLndpZGdldC5zY2VuZS5jYW1lcmEucm90YXRlUmlnaHQgKDEuNzQ1MzI5MjUxOTk0MzI5NSk7XHJcbiAgICAgIFxyXG4gICAgX3RoaXMuY2VzaXVtVGVycmFpblByb3ZpZGVyTWVzaGVzID0gbmV3IENlc2l1bS5DZXNpdW1UZXJyYWluUHJvdmlkZXIoe1xyXG4gICAgICAgIHVybCA6ICdodHRwOi8vY2VzaXVtanMub3JnL3N0ay10ZXJyYWluL3RpbGVzZXRzL3dvcmxkL3RpbGVzJyxcclxuICAgICAgICBjcmVkaXQgOiAnVGVycmFpbiBkYXRhIGNvdXJ0ZXN5IEFuYWx5dGljYWwgR3JhcGhpY3MsIEluYy4nXHJcbiAgICB9KTtcclxuICAgIF90aGlzLmRlZmF1bHRUZXJyYWluUHJvdmlkZXIgPSB0aGlzLmNlbnRyYWxCb2R5LnRlcnJhaW5Qcm92aWRlcjtcclxuXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbiA9IF9zcGVlY2hSZWNvZ25pdGlvbjtcclxuICAgIF90aGlzLnNwZWVjaFN5bnRoZXNpcyA9IF9zcGVlY2hTeW50aGVzaXM7XHJcbiAgICBcclxuICAgIF90aGlzLmxhc3RMb2NhdGlvbiA9ICcnO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCduYXZpZ2F0ZVRvJywgZnVuY3Rpb24oZXZlbnQpXHJcbiAgICB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5hY3Rpb24pO1xyXG4gICAgICAgIF90aGlzLmZseVRvKGV2ZW50LmFjdGlvbik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbi5vbignc2VsZWN0TGF5ZXInLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmFjdGlvbik7XHJcbiAgICAgICAgX3RoaXMuY2hhbmdlTGF5ZXIoZXZlbnQuYWN0aW9uKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlRm9yd2FyZCcsIGZ1bmN0aW9uKGV2ZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgICAgICBfdGhpcy5tb3ZlKCdmb3J3YXJkJywgZXZlbnQuYWN0aW9uKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlQmFja3dhcmQnLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XHJcbiAgICAgICAgX3RoaXMubW92ZSgnYmFja3dhcmQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlVXAnLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XHJcbiAgICAgICAgX3RoaXMubW92ZSgndXAnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlRG93bicsIGZ1bmN0aW9uKGV2ZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgICAgICBfdGhpcy5tb3ZlKCdkb3duJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbi5vbignbW92ZUxlZnQnLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XHJcbiAgICAgICAgX3RoaXMubW92ZSgnbGVmdCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgX3RoaXMuc3BlZWNoUmVjb2duaXRpb24ub24oJ21vdmVSaWdodCcsIGZ1bmN0aW9uKGV2ZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgICAgICBfdGhpcy5tb3ZlKCdyaWdodCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgX3RoaXMuc3BlZWNoUmVjb2duaXRpb24ub24oJ3NldFRlcnJhaW4nLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBpZihldmVudC5hY3Rpb24gPT09ICdlaW5zY2hhbHRlbicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfdGhpcy5zZXRUZXJyYWluKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGV2ZW50LmFjdGlvbiA9PT0gJ2F1c3NjaGFsdGVuJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF90aGlzLnNldFRlcnJhaW4oZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbi5vbignaW5mb3JtYXRpb25SZXF1ZXN0JywgZnVuY3Rpb24oZXZlbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xyXG4gICAgICAgIF90aGlzLnJlYWRBYnN0cmFjdEZyb21XaWtpcGVkaWEoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCd0aGFua3MnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIF90aGlzLnNwZWVjaFN5bnRoZXNpcy5hbnN3ZXIoJ3RoYW5rcycsIHsnc3RhdGUnOiB0cnVlfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBfdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcblxyXG5DZXNpdW1Xb3JsZC5wcm90b3R5cGUuc2V0VGVycmFpbiA9IGZ1bmN0aW9uKF9zdGF0ZSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGlmKF9zdGF0ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNlbnRyYWxCb2R5LnRlcnJhaW5Qcm92aWRlciA9IHRoaXMuY2VzaXVtVGVycmFpblByb3ZpZGVyTWVzaGVzO1xyXG4gICAgICAgIHRoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignc2V0VGVycmFpbicsIHtcclxuICAgICAgICAgICAgJ3N0YXRlJzogdHJ1ZSwgXHJcbiAgICAgICAgICAgICdyZXBsYWNlJzogJ2Vpbmdlc2NoYWx0ZXQnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jZW50cmFsQm9keS50ZXJyYWluUHJvdmlkZXIgPSB0aGlzLmRlZmF1bHRUZXJyYWluUHJvdmlkZXI7XHJcbiAgICAgICAgdGhpcy5zcGVlY2hTeW50aGVzaXMuYW5zd2VyKCdzZXRUZXJyYWluJywge1xyXG4gICAgICAgICAgICAnc3RhdGUnOiB0cnVlLCBcclxuICAgICAgICAgICAgJ3JlcGxhY2UnOiAnYXVzZ2VzY2hhbHRldCdcclxuICAgICAgICB9KTtcclxuICAgIH0gIFxyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihfZGlyZWN0aW9uLCBfZmFjdG9yKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIF9mYWN0b3IgPSAxLjI7XHJcbiAgICB2YXIgbW92ZVJhdGUgPSB0aGlzLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyh0aGlzLndpZGdldC5zY2VuZS5jYW1lcmEucG9zaXRpb24pLmhlaWdodCAvIF9mYWN0b3I7XHJcblxyXG4gICAgc3dpdGNoKF9kaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgY2FzZSAnZm9yd2FyZCc6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLndpZGdldC5zY2VuZS5jYW1lcmEubW92ZUZvcndhcmQobW92ZVJhdGUpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSAnYmFja3dhcmQnOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQuc2NlbmUuY2FtZXJhLm1vdmVCYWNrd2FyZChtb3ZlUmF0ZSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLndpZGdldC5zY2VuZS5jYW1lcmEubW92ZVVwKG1vdmVSYXRlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQuc2NlbmUuY2FtZXJhLm1vdmVEb3duKG1vdmVSYXRlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQuc2NlbmUuY2FtZXJhLm1vdmVMZWZ0KG1vdmVSYXRlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkZ2V0LnNjZW5lLmNhbWVyYS5tb3ZlUmlnaHQobW92ZVJhdGUpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgX3RoaXMud2lkZ2V0LnJlc2l6ZSgpO1xyXG5cclxuICAgIC8vIFNldHVwIGEgbGlzdGVuZXIgb24gdGhlIGJyb3dzZXIgd2luZG93IHJlc2l6ZSBldmVudFxyXG4gICAgd2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24oKSB7IFxyXG4gICAgICBfdGhpcy53aWRnZXQucmVzaXplKCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmZseVRvTXlMb2NhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGZseShwb3NpdGlvbikge1xyXG4gICAgICAgIHZhciBkZXN0aW5hdGlvbiA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMocG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLCAxMDAwLjApO1xyXG4gICAgICAgIGRlc3RpbmF0aW9uID0gX3RoaXMuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGRlc3RpbmF0aW9uKTtcclxuXHJcbiAgICAgICAgdmFyIGZsaWdodCA9IENlc2l1bS5DYW1lcmFGbGlnaHRQYXRoLmNyZWF0ZUFuaW1hdGlvbihfdGhpcy53aWRnZXQuc2NlbmUsIHtcclxuICAgICAgICAgICAgZGVzdGluYXRpb24gOiBkZXN0aW5hdGlvblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIF90aGlzLndpZGdldC5zY2VuZS5hbmltYXRpb25zLmFkZChmbGlnaHQpO1xyXG4gICAgICAgIF90aGlzLnNwZWVjaFN5bnRoZXNpcy5zcGVhaygnSWNoIGhhYmUgZGljaCBnZWZ1bmRlbi4nKTtcclxuICAgIH1cclxuXHJcbiAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZseSk7XHJcbn07XHJcblxyXG5DZXNpdW1Xb3JsZC5wcm90b3R5cGUuZmx5VG8gPSBmdW5jdGlvbihfbG9jYXRpb24pIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIFxyXG4gICAgaWYoX2xvY2F0aW9uLnRvTG93ZXJDYXNlKCkgPT09ICdtaWNoJylcclxuICAgIHtcclxuICAgICAgICB0aGlzLmZseVRvTXlMb2NhdGlvbigpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdlb0NvZGVyLnZpZXdNb2RlbC5zZWFyY2hUZXh0ID0gX2xvY2F0aW9uO1xyXG4gICAgdGhpcy5nZW9Db2Rlci52aWV3TW9kZWwuc2VhcmNoKCk7XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB2YXIgc2VhcmNoUmVzdWx0ID0gX3RoaXMuZ2VvQ29kZXIudmlld01vZGVsLnNlYXJjaFRleHQ7XHJcblxyXG4gICAgICAgIGlmKHNlYXJjaFJlc3VsdC5pbmRleE9mKCcobm90IGZvdW5kKScpICE9PSAtMSkge1xyXG5cclxuICAgICAgICAgICAgX3RoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignbmF2aWdhdGVUbycsIHtcclxuICAgICAgICAgICAgICAgICdzdGF0ZScgOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICdyZXBsYWNlJyA6IF9sb2NhdGlvblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX3RoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignbmF2aWdhdGVUbycsIHRydWUsIF9sb2NhdGlvbik7XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5zcGVlY2hTeW50aGVzaXMuYW5zd2VyKCduYXZpZ2F0ZVRvJywge1xyXG4gICAgICAgICAgICAgICAgJ3N0YXRlJyA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAncmVwbGFjZScgOiBfbG9jYXRpb25cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfdGhpcy5sYXN0TG9jYXRpb24gPSBfbG9jYXRpb247XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LCAxMDAwKTtcclxufTtcclxuXHJcbkNlc2l1bVdvcmxkLnByb3RvdHlwZS5yZWFkQWJzdHJhY3RGcm9tV2lraXBlZGlhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIFxyXG4gICAgJC5hamF4KHtcclxuICAgICAgZGF0YVR5cGU6IFwianNvbnBcIixcclxuICAgICAgdXJsOiBcImh0dHBzOi8vZGUud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXF1ZXJ5JnByb3A9ZXh0cmFjdHMmZm9ybWF0PWpzb24mZXhpbnRybz0mdGl0bGVzPVwiICsgX3RoaXMubGFzdExvY2F0aW9uLFxyXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgdmFyIGZpcnN0O1xyXG4gICAgICAgICAgdmFyIHNwbGl0dGVkO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBkYXRhLnF1ZXJ5LnBhZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5xdWVyeS5wYWdlcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IGRhdGEucXVlcnkucGFnZXNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vX3RoaXMuc3BlZWNoU3ludGhlc2lzLnNwZWFrKGZpcnN0LmV4dHJhY3QucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpLnNwbGl0KFwiLlwiKVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgc3BsaXR0ZWQgPSBmaXJzdC5leHRyYWN0LnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKTsvLy5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3BsaXR0ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfdGhpcy5zcGVlY2hTeW50aGVzaXMuc3BlYWsoc3BsaXR0ZWQpO1xyXG4gICAgfX0pO1xyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmdldEluZm9ybWF0aW9uRnJvbVdpa2lwZWRpYSA9IGZ1bmN0aW9uKF9yZXNvdXJjZSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciByZXNvdXJjZSA9ICBfcmVzb3VyY2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBfcmVzb3VyY2Uuc2xpY2UoMSk7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgXHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgIGNyb3NzRG9tYWluIDogdHJ1ZSxcclxuICAgICAgdXJsOiBcImh0dHA6Ly9kYnBlZGlhLm9yZy9kYXRhL1wiICsgcmVzb3VyY2UgKyBcIi5qc29uXCIsXHJcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB2YXIgYWJzdHJhY3RMaXN0ID0gZGF0YVsnaHR0cDovL2RicGVkaWEub3JnL3Jlc291cmNlLycgKyByZXNvdXJjZV1bJ2h0dHA6Ly9kYnBlZGlhLm9yZy9vbnRvbG9neS9hYnN0cmFjdCddO1xyXG4gICAgICAgICAgdmFyIGFic3RyYWN0ID0gJyc7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhYnN0cmFjdExpc3QubGVuZ3RoOyArK2kpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgaWYoYWJzdHJhY3RMaXN0W2ldLmxhbmcgPT09ICdkZScpXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBhYnN0cmFjdCA9IGFic3RyYWN0TGlzdFtpXS52YWx1ZS5zdWJzdHJpbmcoMCwgMTAwKTtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBfdGhpcy5zcGVlY2hTeW50aGVzaXMuc3BlYWsoYWJzdHJhY3QpO1xyXG4gICAgfX0pO1xyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmNoYW5nZUxheWVyID0gZnVuY3Rpb24oX2xheWVyKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJvdmlkZXJWaWV3TW9kZWxzLmxlbmd0aDsgKytpKVxyXG4gICAge1xyXG4gICAgICAgIGlmKHRoaXMucHJvdmlkZXJWaWV3TW9kZWxzW2ldLm5hbWUgPT09IF9sYXllcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFzZUxheWVyUGlja2VyLnZpZXdNb2RlbC5zZWxlY3RlZEl0ZW0gPSB0aGlzLnByb3ZpZGVyVmlld01vZGVsc1tpXTtcclxuICAgICAgICAgICAgdGhpcy5zcGVlY2hTeW50aGVzaXMuYW5zd2VyKCdzZWxlY3RMYXllcicsIHtcclxuICAgICAgICAgICAgICAgICdzdGF0ZSc6IHRydWUsIFxyXG4gICAgICAgICAgICAgICAgJ3JlcGxhY2UnOiB0aGlzLnByb3ZpZGVyVmlld01vZGVsc1tpXS5uYW1lXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignc2VsZWN0TGF5ZXInLCB7XHJcbiAgICAgICAgJ3N0YXRlJzogZmFsc2UsIFxyXG4gICAgICAgICdyZXBsYWNlJzpfbGF5ZXJ9KTtcclxufTtcclxuXHJcblxyXG5DZXNpdW1Xb3JsZC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIHRoaXMud2lkZ2V0LnJlbmRlcigpO1xyXG59OyIsIi8qIGdsb2JhbHMgR2VzdHVyZUludHJvLCAkICovXHJcblxyXG4vKipcclxuKiBFeHBvcnQgZm9yIHJlcXVpcmUgc3RhdGVtYW50XHJcbiovXHJcbm1vZHVsZS5leHBvcnRzID0gR2VzdHVyZUludHJvO1xyXG5cclxuLyoqXHJcbiogQ29uc3RydWN0b3JcclxuKi9cclxuZnVuY3Rpb24gR2VzdHVyZUludHJvKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0dGhpcy5zbGlkZXMgPSBbXTtcclxuXHR0aGlzLmN1cnJlbnRTbGlkZSAgID0gMDtcclxuXHR0aGlzLm51bWJlck9mU2xpZGVzID0gMDtcclxufVxyXG5cclxuR2VzdHVyZUludHJvLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG5cdC8vIEdldCBhbGwgdHV0b3JpYWwgc2xpZGVzXHJcblx0X3RoaXMuc2xpZGVzID0gJCgnLmludHJvLWVsZW1lbnQnKTtcclxuXHRfdGhpcy5udW1iZXJPZlNsaWRlcyA9IF90aGlzLnNsaWRlcy5sZW5ndGg7XHJcblxyXG5cclxuXHQkKCcjYnRuLXN0YXJ0LXR1dG9yaWFsJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHQkKCcjc2xpZGUtd2VsY29tZScpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly8gU2V0IHRoZSBzbGlkZSB0aXRsZSBhbmQgZGVzY3JpcHRpb25cclxuXHRcdFx0X3RoaXMuY2hhbmdlU2xpZGVJbmZvKF90aGlzLmN1cnJlbnRTbGlkZSk7XHJcblxyXG5cdFx0XHQkKCcjc2xpZGUtdHV0b3JpYWwnKS5mYWRlSW4oNTAwLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQvLyBTaG93IHRoZSBnZXN0dXJlIGJveFxyXG5cdFx0XHRcdCQoJyNnZXN0dXJlLWludHJvJykuc2hvdygpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHQkKCcjaW50cm8tbmV4dCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdF90aGlzLmN1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdGlmICgoX3RoaXMuY3VycmVudFNsaWRlICsgMSkgPT09IF90aGlzLm51bWJlck9mU2xpZGVzKSB7XHJcblx0XHRcdCQoJyNpbnRyby1uZXh0JykuaGlkZSgpO1xyXG5cdFx0XHQkKCcud2VsY29tZWJveC1jbG9zZScpLnNob3coKTtcclxuXHRcdH1cclxuXHJcblx0XHQkKCcjc2xpZGUtaW5mbycpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdF90aGlzLmNoYW5nZVNsaWRlSW5mbyhfdGhpcy5jdXJyZW50U2xpZGUpO1xyXG5cclxuXHRcdFx0JCgnI3NsaWRlLWluZm8nKS5mYWRlSW4oNTAwKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoX3RoaXMuc2xpZGVzW190aGlzLmN1cnJlbnRTbGlkZS0xXSkuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQkKF90aGlzLnNsaWRlc1tfdGhpcy5jdXJyZW50U2xpZGVdKS5zaG93KCk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufTtcclxuXHJcbkdlc3R1cmVJbnRyby5wcm90b3R5cGUuY2hhbmdlU2xpZGVJbmZvID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHZhciB0aXRsZSAgICAgICA9ICQodGhpcy5zbGlkZXNbaW5kZXhdKS5kYXRhKCd0aXRsZScpO1xyXG5cdHZhciBkZXNjcmlwdGlvbiA9ICQodGhpcy5zbGlkZXNbaW5kZXhdKS5kYXRhKCdkZXNjcmlwdGlvbicpO1xyXG5cclxuXHQkKCcjc2xpZGUtdGl0bGUnKS50ZXh0KHRpdGxlKTtcclxuXHQkKCcjc2xpZGUtZGVzY3JpcHRpb24nKS50ZXh0KGRlc2NyaXB0aW9uKTtcclxufTsiLCIvKiBnbG9iYWxzIExlYXBDYW1lcmFDb250cm9sbGVyLCBDZXNpdW0gKi9cclxuXHJcbi8qKlxyXG4qIEV4cG9ydCBmb3IgcmVxdWlyZSBzdGF0ZW1hbnRcclxuKi9cclxubW9kdWxlLmV4cG9ydHMgPSBMZWFwQ2FtZXJhQ29udHJvbGxlcjtcclxuXHJcblxyXG5mdW5jdGlvbiBMZWFwQ2FtZXJhQ29udHJvbGxlcihjYW1lcmEsIGVsbGlwc29pZCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdGhpcy5jYW1lcmEgICAgPSBjYW1lcmE7XHJcbiAgdGhpcy5lbGxpcHNvaWQgPSBlbGxpcHNvaWQ7XHJcblxyXG4gIC8vIGFwaVxyXG4gIHRoaXMuZW5hYmxlZCAgICAgID0gdHJ1ZTtcclxuICB0aGlzLnRhcmdldCAgICAgICA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMygwLCAwLCAwKTtcclxuICB0aGlzLnN0ZXAgICAgICAgICA9IChjYW1lcmEucG9zaXRpb24ueiA9PT0gMCA/IE1hdGgucG93KDEwLCAoTWF0aC5sb2coY2FtZXJhLmZydXN0dW0ubmVhcikgKyBNYXRoLmxvZyhjYW1lcmEuZnJ1c3R1bS5mYXIpKS9NYXRoLmxvZygxMCkpLzEwLjAgOiBjYW1lcmEucG9zaXRpb24ueik7XHJcbiAgdGhpcy5maW5nZXJGYWN0b3IgPSAyO1xyXG4gIHRoaXMuc3RhcnRaICAgICAgID0gdGhpcy5jYW1lcmEucG9zaXRpb24uejtcclxuICB0aGlzLmNvbnRyb2xNb2RlICA9ICdzdGFuZGFyZCc7IC8vICdzdGFuZGFyZCcgb3IgJ2ZsaWdodCdcclxuXHJcblxyXG4gIC8vIGAuLi5IYW5kc2AgICAgICAgOiBpbnRlZ2VyIG9yIHJhbmdlIGdpdmVuIGFzIGFuIGFycmF5IG9mIGxlbmd0aCAyXHJcbiAgLy8gYC4uLkZpbmdlcnNgICAgICA6IGludGVnZXIgb3IgcmFuZ2UgZ2l2ZW4gYXMgYW4gYXJyYXkgb2YgbGVuZ3RoIDJcclxuICAvLyBgLi4uUmlnaHRIYW5kZWRgIDogYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gdXNlIGxlZnQgb3IgcmlnaHQgaGFuZCBmb3IgY29udHJvbGxpbmcgKGlmIG51bWJlciBvZiBoYW5kcyA+IDEpXHJcbiAgLy8gYC4uLkhhbmRQb3NpdGlvbmA6IGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSBwYWxtIHBvc2l0aW9uIG9yIGZpbmdlciB0aXAgcG9zaXRpb24gKGlmIG51bWJlciBvZiBmaW5nZXJzID09IDEpXHJcbiAgLy8gYC4uLlN0YWJpbGl6ZWRgICA6IGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSBzdGFiaWxpemVkIHBhbG0vZmluZ2VyIHRpcCBwb3NpdGlvbiBvciBub3RcclxuXHJcbiAgLy8gcm90YXRpb25cclxuICB0aGlzLnJvdGF0ZUVuYWJsZWQgICAgICAgPSB0cnVlO1xyXG4gIHRoaXMucm90YXRlU3BlZWQgICAgICAgICA9IDIuMDtcclxuICB0aGlzLnJvdGF0ZUhhbmRzICAgICAgICAgPSAxO1xyXG4gIHRoaXMucm90YXRlRmluZ2VycyAgICAgICA9IFsyLCAzXTsgXHJcbiAgdGhpcy5yb3RhdGVSaWdodEhhbmRlZCAgID0gdHJ1ZTtcclxuICB0aGlzLnJvdGF0ZUhhbmRQb3NpdGlvbiAgPSB0cnVlO1xyXG4gIHRoaXMucm90YXRlU3RhYmlsaXplZCAgICA9IHRydWU7XHJcbiAgdGhpcy5yb3RhdGVNaW4gICAgICAgICAgID0gMDtcclxuICB0aGlzLnJvdGF0ZU1heCAgICAgICAgICAgPSBNYXRoLlBJO1xyXG4gIHRoaXMucm90YXRlU3BlZWRJbml0ICAgICA9IHRoaXMucm90YXRlU3BlZWQ7XHJcbiAgXHJcbiAgLy8gem9vbVxyXG4gIHRoaXMuem9vbUVuYWJsZWQgICAgICAgICA9IHRydWU7XHJcbiAgdGhpcy56b29tU3BlZWQgICAgICAgICAgID0gNC4wO1xyXG4gIHRoaXMuem9vbUhhbmRzICAgICAgICAgICA9IDE7XHJcbiAgdGhpcy56b29tRmluZ2VycyAgICAgICAgID0gWzQsIDVdO1xyXG4gIHRoaXMuem9vbVJpZ2h0SGFuZGVkICAgICA9IHRydWU7XHJcbiAgdGhpcy56b29tSGFuZFBvc2l0aW9uICAgID0gdHJ1ZTtcclxuICB0aGlzLnpvb21TdGFiaWxpemVkICAgICAgPSB0cnVlO1xyXG4gIHRoaXMuem9vbUluTWF4ICAgICAgICAgICA9IDUwO1xyXG4gIHRoaXMuem9vbU91dE1heCAgICAgICAgICA9IDUwMDAwMDAwO1xyXG4gIHRoaXMuem9vbU1vdmVSYXRlRmFjdG9yICA9IDMwO1xyXG4gIFxyXG4gIC8vIHBhblxyXG4gIHRoaXMucGFuRW5hYmxlZCAgICAgICAgICA9IHRydWU7XHJcbiAgdGhpcy5wYW5TcGVlZCAgICAgICAgICAgID0gMy4wO1xyXG4gIHRoaXMucGFuSGFuZHMgICAgICAgICAgICA9IDI7XHJcbiAgdGhpcy5wYW5GaW5nZXJzICAgICAgICAgID0gWzYsIDEyXTtcclxuICB0aGlzLnBhblJpZ2h0SGFuZGVkICAgICAgPSB0cnVlO1xyXG4gIHRoaXMucGFuSGFuZFBvc2l0aW9uICAgICA9IHRydWU7XHJcbiAgdGhpcy5wYW5TdGFiaWxpemVkICAgICAgID0gdHJ1ZTtcclxuICB0aGlzLnBhblNwZWVkSW5pdCAgICAgICAgPSB0aGlzLnBhblNwZWVkO1xyXG4gIC8vIGNhbWVyYSBoZWlnaHQgYmVmb3JlIHBhbm5pbmdcclxuICB0aGlzLmNhbWVyYUhlaWdodFpvb20gICAgPSBudWxsO1xyXG4gIFxyXG4gIC8vIGludGVybmFsc1xyXG4gIHRoaXMucm90YXRlWExhc3QgICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5yb3RhdGVZTGFzdCAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLnpvb21aTGFzdCAgICAgICAgICAgPSBudWxsO1xyXG4gIHRoaXMucGFuWExhc3QgICAgICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5wYW5ZTGFzdCAgICAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLnBhblpMYXN0ICAgICAgICAgICAgPSBudWxsOyAgXHJcbn0gIFxyXG4gIFxyXG4gIFxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUudHJhbnNmb3JtRmFjdG9yID0gZnVuY3Rpb24oYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICBjYXNlICdyb3RhdGUnOlxyXG4gICAgICByZXR1cm4gdGhpcy5yb3RhdGVTcGVlZCAqICh0aGlzLnJvdGF0ZUhhbmRQb3NpdGlvbiA/IDEgOiB0aGlzLmZpbmdlckZhY3Rvcik7XHJcbiAgICBjYXNlICd6b29tJzpcclxuICAgICAgcmV0dXJuIHRoaXMuem9vbVNwZWVkICogKHRoaXMuem9vbUhhbmRQb3NpdGlvbiA/IDEgOiB0aGlzLmZpbmdlckZhY3Rvcik7XHJcbiAgICBjYXNlICdwYW4nOlxyXG4gICAgICByZXR1cm4gdGhpcy5wYW5TcGVlZCAqICh0aGlzLnBhbkhhbmRQb3NpdGlvbiA/IDEgOiB0aGlzLmZpbmdlckZhY3Rvcik7XHJcbiAgfVxyXG59O1xyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLm1hcExpbmVhciA9IGZ1bmN0aW9uKHgsIGExLCBhMiwgYjEsIGIyKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHJldHVybiBiMSArICggeCAtIGExICkgKiAoIGIyIC0gYjEgKSAvICggYTIgLSBhMSApO1xyXG59O1xyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnJvdGF0ZVRyYW5zZm9ybSA9IGZ1bmN0aW9uKGRlbHRhKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHJldHVybiB0aGlzLnRyYW5zZm9ybUZhY3Rvcigncm90YXRlJykgKiB0aGlzLm1hcExpbmVhcihkZWx0YSwgLTQwMCwgNDAwLCAtTWF0aC5QSSwgTWF0aC5QSSk7XHJcbn07XHJcblxyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnpvb21UcmFuc2Zvcm0gPSBmdW5jdGlvbihkZWx0YSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICByZXR1cm4gdGhpcy50cmFuc2Zvcm1GYWN0b3IoJ3pvb20nKSAqIHRoaXMubWFwTGluZWFyKGRlbHRhLCAtNDAwLCA0MDAsIC10aGlzLnN0ZXAsIHRoaXMuc3RlcCk7XHJcbn07XHJcblxyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnBhblRyYW5zZm9ybSA9IGZ1bmN0aW9uKGRlbHRhKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHJldHVybiB0aGlzLnRyYW5zZm9ybUZhY3RvcigncGFuJykgKiB0aGlzLm1hcExpbmVhcihkZWx0YSwgLTQwMCwgNDAwLCAtdGhpcy5zdGVwLCB0aGlzLnN0ZXApO1xyXG59O1xyXG5cclxuXHJcbkxlYXBDYW1lcmFDb250cm9sbGVyLnByb3RvdHlwZS5hcHBseUdlc3R1cmUgPSBmdW5jdGlvbihmcmFtZSwgYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgaGwgICAgPSBmcmFtZS5oYW5kcy5sZW5ndGg7XHJcbiAgdmFyIGZsICAgID0gZnJhbWUucG9pbnRhYmxlcy5sZW5ndGg7XHJcblxyXG4gIHN3aXRjaChhY3Rpb24pIHtcclxuICAgIGNhc2UgJ3JvdGF0ZSc6XHJcbiAgICAgIGlmICh0aGlzLnJvdGF0ZUhhbmRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3RhdGVGaW5nZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnJvdGF0ZUhhbmRzWzBdIDw9IGhsICYmIGhsIDw9IHRoaXMucm90YXRlSGFuZHNbMV0gJiYgdGhpcy5yb3RhdGVGaW5nZXJzWzBdIDw9IGZsICYmIGZsIDw9IHRoaXMucm90YXRlRmluZ2Vyc1sxXSkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5yb3RhdGVIYW5kc1swXSA8PSBobCAmJiBobCA8PSB0aGlzLnJvdGF0ZUhhbmRzWzFdICYmIHRoaXMucm90YXRlRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLnJvdGF0ZUZpbmdlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucm90YXRlSGFuZHMgPT09IGhsICYmIHRoaXMucm90YXRlRmluZ2Vyc1swXSA8PSBmbCAmJiBmbCA8PSB0aGlzLnJvdGF0ZUZpbmdlcnNbMV0pIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMucm90YXRlSGFuZHMgPT09IGhsICYmIHRoaXMucm90YXRlRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICd6b29tJzpcclxuICAgICAgaWYgKHRoaXMuem9vbUhhbmRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBpZiAodGhpcy56b29tRmluZ2VycyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICBpZiAodGhpcy56b29tSGFuZHNbMF0gPD0gaGwgJiYgaGwgPD0gdGhpcy56b29tSGFuZHNbMV0gJiYgdGhpcy56b29tRmluZ2Vyc1swXSA8PSBmbCAmJiBmbCA8PSB0aGlzLnpvb21GaW5nZXJzWzFdKSB7IFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLnpvb21IYW5kc1swXSA8PSBobCAmJiBobCA8PSB0aGlzLnpvb21IYW5kc1sxXSAmJiB0aGlzLnpvb21GaW5nZXJzID09PSBmbCkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMuem9vbUZpbmdlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuem9vbUhhbmRzID09PSBobCAmJiB0aGlzLnpvb21GaW5nZXJzWzBdIDw9IGZsICYmIGZsIDw9IHRoaXMuem9vbUZpbmdlcnNbMV0pIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMuem9vbUhhbmRzID09PSBobCAmJiB0aGlzLnpvb21GaW5nZXJzID09PSBmbCkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ3Bhbic6XHJcbiAgICAgIGlmICh0aGlzLnBhbkhhbmRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBpZiAodGhpcy5wYW5GaW5nZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnBhbkhhbmRzWzBdIDw9IGhsICYmIGhsIDw9IHRoaXMucGFuSGFuZHNbMV0gJiYgdGhpcy5wYW5GaW5nZXJzWzBdIDw9IGZsICYmIGZsIDw9IHRoaXMucGFuRmluZ2Vyc1sxXSkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5wYW5IYW5kc1swXSA8PSBobCAmJiBobCA8PSB0aGlzLnBhbkhhbmRzWzFdICYmIHRoaXMucGFuRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLnBhbkZpbmdlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucGFuSGFuZHMgPT09IGhsICYmIHRoaXMucGFuRmluZ2Vyc1swXSA8PSBmbCAmJiBmbCA8PSB0aGlzLnBhbkZpbmdlcnNbMV0pIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMucGFuSGFuZHMgPT09IGhsICYmIHRoaXMucGFuRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLmhhbmQgPSBmdW5jdGlvbihmcmFtZSwgYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgaGRzID0gZnJhbWUuaGFuZHM7XHJcbiAgIFxyXG4gICAgaWYgKGhkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGlmIChoZHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGhkc1swXTtcclxuICAgICAgfSBlbHNlIGlmIChoZHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgdmFyIGxoLCByaDtcclxuICAgICAgICBpZiAoaGRzWzBdLnBhbG1Qb3NpdGlvblswXSA8IGhkc1sxXS5wYWxtUG9zaXRpb25bMF0pIHtcclxuICAgICAgICAgIGxoID0gaGRzWzBdO1xyXG4gICAgICAgICAgcmggPSBoZHNbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxoID0gaGRzWzFdO1xyXG4gICAgICAgICAgcmggPSBoZHNbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgICBjYXNlICdyb3RhdGUnOlxyXG4gICAgICAgICAgICBpZiAodGhpcy5yb3RhdGVSaWdodEhhbmRlZCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiByaDtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGxoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnem9vbSc6XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnpvb21SaWdodEhhbmRlZCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiByaDtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGxoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncGFuJzpcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFuUmlnaHRIYW5kZWQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcmg7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIHJldHVybiBsaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihmcmFtZSwgYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIC8vIGFzc2VydGlvbjogaWYgYC4uLkhhbmRQb3NpdGlvbmAgaXMgZmFsc2UsIHRoZW4gYC4uLkZpbmdlcnNgIG5lZWRzIHRvIGJlIDEgb3IgWzEsIDFdXHJcbiAgdmFyIGg7XHJcbiAgc3dpdGNoKGFjdGlvbikge1xyXG4gICAgY2FzZSAncm90YXRlJzpcclxuICAgICAgaCA9IHRoaXMuaGFuZChmcmFtZSwgJ3JvdGF0ZScpO1xyXG4gICAgICByZXR1cm4gKHRoaXMucm90YXRlSGFuZFBvc2l0aW9uID8gKHRoaXMucm90YXRlU3RhYmlsaXplZCA/IGguc3RhYmlsaXplZFBhbG1Qb3NpdGlvbiA6IGgucGFsbVBvc2l0aW9uKSBcclxuICAgICAgICA6ICh0aGlzLnJvdGF0ZVN0YWJpbGl6ZWQgPyBmcmFtZS5wb2ludGFibGVzWzBdLnN0YWJpbGl6ZWRUaXBQb3NpdGlvbiA6IGZyYW1lLnBvaW50YWJsZXNbMF0udGlwUG9zaXRpb24pXHJcbiAgICAgICk7XHJcbiAgICBjYXNlICd6b29tJzpcclxuICAgICAgaCA9IHRoaXMuaGFuZChmcmFtZSwgJ3pvb20nKTtcclxuICAgICAgcmV0dXJuICh0aGlzLnpvb21IYW5kUG9zaXRpb24gPyAodGhpcy56b29tU3RhYmlsaXplZCA/IGguc3RhYmlsaXplZFBhbG1Qb3NpdGlvbiA6IGgucGFsbVBvc2l0aW9uKSBcclxuICAgICAgICA6ICh0aGlzLnpvb21TdGFiaWxpemVkID8gZnJhbWUucG9pbnRhYmxlc1swXS5zdGFiaWxpemVkVGlwUG9zaXRpb24gOiBmcmFtZS5wb2ludGFibGVzWzBdLnRpcFBvc2l0aW9uKVxyXG4gICAgICApO1xyXG4gICAgY2FzZSAncGFuJzpcclxuICAgICAgaCA9IHRoaXMuaGFuZChmcmFtZSwgJ3BhbicpO1xyXG4gICAgICByZXR1cm4gKHRoaXMucGFuSGFuZFBvc2l0aW9uID8gKHRoaXMucGFuU3RhYmlsaXplZCA/IGguc3RhYmlsaXplZFBhbG1Qb3NpdGlvbiA6IGgucGFsbVBvc2l0aW9uKSBcclxuICAgICAgICA6ICh0aGlzLnBhblN0YWJpbGl6ZWQgPyBmcmFtZS5wb2ludGFibGVzWzBdLnN0YWJpbGl6ZWRUaXBQb3NpdGlvbiA6IGZyYW1lLnBvaW50YWJsZXNbMF0udGlwUG9zaXRpb24pXHJcbiAgICAgICk7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbkxlYXBDYW1lcmFDb250cm9sbGVyLnByb3RvdHlwZS5yb3RhdGVDYW1lcmEgPSBmdW5jdGlvbihmcmFtZSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgaWYgKHRoaXMucm90YXRlRW5hYmxlZCAmJiB0aGlzLmFwcGx5R2VzdHVyZShmcmFtZSwgJ3JvdGF0ZScpKSB7XHJcbiAgICAgIC8vIGlmIGZseSB0byBtb2R1cyB3YXMgdXNlZCwgY2hhbmdlIHggYW5kIHkgYW5kIGZpeCB0aGUgaW52ZXJ0ZWQgbmV3IHhcclxuICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uKGZyYW1lLCAncm90YXRlJylbMF07XHJcbiAgICAgXHJcbiAgICAgIGlmICghdGhpcy5yb3RhdGVZTGFzdCkge1xyXG4gICAgICAgIHRoaXMucm90YXRlWUxhc3QgPSB5O1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB5RGVsdGEgPSB5IC0gdGhpcy5yb3RhdGVZTGFzdDtcclxuICAgICAgXHJcbiAgICAgIHZhciBuID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIHJvdGF0ZSBhcm91bmQgYXhpcyBpbiB4eS1wbGFuZSAoaW4gdGFyZ2V0IGNvb3JkaW5hdGUgc3lzdGVtKSB3aGljaCBpcyBvcnRob2dvbmFsIHRvIGNhbWVyYSB2ZWN0b3JcclxuICAgICAgdmFyIHQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMuc3VidHJhY3QodGhpcy5jYW1lcmEucG9zaXRpb24sIHRoaXMudGFyZ2V0KTtcclxuICAgICAgLy92YXIgdCA9IG5ldyBUSFJFRS5WZWN0b3IzKCkuc3ViVmVjdG9ycyh0aGlzLmNhbWVyYS5wb3NpdGlvbiwgdGhpcy50YXJnZXQpOyAvLyB0cmFuc2xhdGVcclxuICAgICAgdmFyIGFuZ2xlRGVsdGEgPSB0aGlzLnJvdGF0ZVRyYW5zZm9ybSh5RGVsdGEpO1xyXG5cclxuICAgICAgdmFyIG5ld0FuZ2xlID0gQ2VzaXVtLkNhcnRlc2lhbjMuYW5nbGVCZXR3ZWVuKHQsIG5ldyBDZXNpdW0uQ2FydGVzaWFuMygwLCAxLCAwKSk7XHJcbiAgICAgIC8vdmFyIG5ld0FuZ2xlID0gdC5hbmdsZVRvKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEsIDApKSArIGFuZ2xlRGVsdGE7XHJcblxyXG4gICAgICBpZiAodGhpcy5yb3RhdGVNaW4gPCBuZXdBbmdsZSAmJiBuZXdBbmdsZSA8IHRoaXMucm90YXRlTWF4KSB7XHJcbiAgICAgICAgbiA9IENlc2l1bS5DYXJ0ZXNpYW4zLm5vcm1hbGl6ZShuZXcgQ2VzaXVtLkNhcnRlc2lhbjModC56LCAwLCAtdC54KSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhLnJvdGF0ZShuLCAtYW5nbGVEZWx0YSk7ICAgXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB4ID0gLXRoaXMucG9zaXRpb24oZnJhbWUsICdyb3RhdGUnKVsxXTtcclxuICAgICAgLy8gcm90YXRlIGFyb3VuZCB5LWF4aXMgdHJhbnNsYXRlZCBieSB0YXJnZXQgdmVjdG9yXHJcbiAgICAgIGlmICghdGhpcy5yb3RhdGVYTGFzdCkge1xyXG4gICAgICAgIHRoaXMucm90YXRlWExhc3QgPSB4O1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB4RGVsdGEgPSB4IC0gdGhpcy5yb3RhdGVYTGFzdDtcclxuICAgICAgXHJcbiAgICAgIGFuZ2xlRGVsdGEgPSB0aGlzLnJvdGF0ZVRyYW5zZm9ybSh4RGVsdGEpO1xyXG4gICAgICBuID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zLm5vcm1hbGl6ZShuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoMCwgMSwgMCkpO1xyXG5cclxuXHJcbiAgICAgIC8vIHJvdGF0aW9uIHNwZWVkIGFkanVzdGluZ1xyXG4gICAgICB2YXIgY2FtZXJhSGVpZ2h0ID0gdGhpcy5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWModGhpcy5jYW1lcmEucG9zaXRpb24pLmhlaWdodDtcclxuXHJcblxyXG4gICAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgMzAwKSB7XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVNwZWVkID0gMC4wMDAwMjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPCAyMDAwICYmIGNhbWVyYUhlaWdodCA+IDMwMCkge1xyXG4gICAgICAgICAgdGhpcy5yb3RhdGVTcGVlZCA9IDAuMDAwMTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPCAxMjAwMCAmJiBjYW1lcmFIZWlnaHQgPiAyMDAwKSB7XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVNwZWVkID0gMC4wMDM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoY2FtZXJhSGVpZ2h0IDwgODAwMDAgJiYgY2FtZXJhSGVpZ2h0ID4gMTIwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjAwODtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPCAzMDAwMDAgJiYgY2FtZXJhSGVpZ2h0ID4gODAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjA1O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGNhbWVyYUhlaWdodCA8IDUwMDAwMCAmJiBjYW1lcmFIZWlnaHQgPiAzMDAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjE7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoY2FtZXJhSGVpZ2h0ID4gNTAwMDAwICYmIGNhbWVyYUhlaWdodCA8IDEwMDAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjI1O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGNhbWVyYUhlaWdodCA+IDEwMDAwMDAgJiYgY2FtZXJhSGVpZ2h0IDwgMjAwMDAwMCkge1xyXG4gICAgICAgICAgdGhpcy5yb3RhdGVTcGVlZCA9IDAuNTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPiAyMDAwMDAwICYmIGNhbWVyYUhlaWdodCA8IDUwMDAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVNwZWVkID0gdGhpcy5yb3RhdGVTcGVlZEluaXQ7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5jYW1lcmEucm90YXRlKG4sIGFuZ2xlRGVsdGEpO1xyXG5cclxuXHJcbiAgICB0aGlzLnJvdGF0ZVlMYXN0ID0geTtcclxuICAgIHRoaXMucm90YXRlWExhc3QgPSB4O1xyXG4gICAgdGhpcy56b29tWkxhc3QgICA9IG51bGw7XHJcbiAgICB0aGlzLnBhblhMYXN0ICAgID0gbnVsbDtcclxuICAgIHRoaXMucGFuWUxhc3QgICAgPSBudWxsO1xyXG4gICAgdGhpcy5wYW5aTGFzdCAgICA9IG51bGw7ICAgICAgXHJcbiAgfSBcclxuICBlbHNlIHtcclxuICAgIHRoaXMucm90YXRlWUxhc3QgPSBudWxsO1xyXG4gICAgdGhpcy5yb3RhdGVYTGFzdCA9IG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnpvb21DYW1lcmEgPSBmdW5jdGlvbihmcmFtZSkgeyBcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGlmICh0aGlzLnpvb21FbmFibGVkICYmIHRoaXMuYXBwbHlHZXN0dXJlKGZyYW1lLCAnem9vbScpKSB7XHJcbiAgICB2YXIgeiA9IHRoaXMucG9zaXRpb24oZnJhbWUsICd6b29tJylbMl07XHJcbiAgICBpZiAoIXRoaXMuem9vbVpMYXN0KSB7IFxyXG4gICAgICB0aGlzLnpvb21aTGFzdCA9IHo7XHJcbiAgICB9XHJcbiAgICB2YXIgekRlbHRhID0geiAtIHRoaXMuem9vbVpMYXN0O1xyXG5cclxuICAgIHZhciBsZW5ndGhEZWx0YSA9IHRoaXMuem9vbVRyYW5zZm9ybSh6RGVsdGEpO1xyXG5cclxuICAgIHZhciBjYW1lcmFIZWlnaHQgPSB0aGlzLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyh0aGlzLmNhbWVyYS5wb3NpdGlvbikuaGVpZ2h0O1xyXG4gICAgdmFyIG1vdmVSYXRlID0gY2FtZXJhSGVpZ2h0IC8gdGhpcy56b29tTW92ZVJhdGVGYWN0b3I7XHJcblxyXG4gICAgaWYgKGxlbmd0aERlbHRhID4gMCkge1xyXG4gICAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgdGhpcy56b29tSW5NYXgpIHtcclxuICAgICAgICAgIC8vZG9udCB6b29tIGluIGFueW1vcmVcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuY2FtZXJhLm1vdmVGb3J3YXJkKG1vdmVSYXRlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmIChjYW1lcmFIZWlnaHQgPiB0aGlzLnpvb21PdXRNYXgpIHtcclxuICAgICAgICAgIC8vZG9udCB6b29tIG91dCBhbnltb3JlXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmNhbWVyYS5tb3ZlQmFja3dhcmQobW92ZVJhdGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuY2FtZXJhSGVpZ2h0Wm9vbSA9IGNhbWVyYUhlaWdodDtcclxuXHJcblxyXG4gICAgdGhpcy56b29tWkxhc3QgICAgICAgID0gejsgXHJcbiAgICB0aGlzLnJvdGF0ZVhMYXN0ICAgICAgPSBudWxsO1xyXG4gICAgdGhpcy5yb3RhdGVZTGFzdCAgICAgID0gbnVsbDtcclxuICAgIHRoaXMucGFuWExhc3QgICAgICAgICA9IG51bGw7XHJcbiAgICB0aGlzLnBhbllMYXN0ICAgICAgICAgPSBudWxsO1xyXG4gICAgdGhpcy5wYW5aTGFzdCAgICAgICAgID0gbnVsbDtcclxuICB9IFxyXG4gIGVsc2Uge1xyXG4gICAgdGhpcy56b29tWkxhc3QgPSBudWxsOyBcclxuICB9XHJcbn07XHJcblxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUucGFuQ2FtZXJhID0gZnVuY3Rpb24oZnJhbWUpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGlmICh0aGlzLnBhbkVuYWJsZWQgJiYgdGhpcy5hcHBseUdlc3R1cmUoZnJhbWUsICdwYW4nKSkge1xyXG4gICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uKGZyYW1lLCAncGFuJylbMF07XHJcbiAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24oZnJhbWUsICdwYW4nKVsxXTtcclxuICAgIHZhciB6ID0gdGhpcy5wb3NpdGlvbihmcmFtZSwgJ3BhbicpWzJdO1xyXG4gICAgaWYgKCF0aGlzLnBhblhMYXN0KSB7XHJcbiAgICAgIHRoaXMucGFuWExhc3QgPSB4O1xyXG4gICAgfVxyXG4gICAgaWYgKCF0aGlzLnBhbllMYXN0KSB7IFxyXG4gICAgICB0aGlzLnBhbllMYXN0ID0geTtcclxuICAgIH1cclxuICAgIGlmICghdGhpcy5wYW5aTGFzdCkgeyBcclxuICAgICAgdGhpcy5wYW5aTGFzdCA9IHo7XHJcbiAgICB9XHJcbiAgICB2YXIgeERlbHRhID0geCAtIHRoaXMucGFuWExhc3Q7XHJcbiAgICB2YXIgeURlbHRhID0geSAtIHRoaXMucGFuWUxhc3Q7XHJcblxyXG5cclxuICAgIHZhciBjYW1lcmFIZWlnaHQgPSB0aGlzLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyh0aGlzLmNhbWVyYS5wb3NpdGlvbikuaGVpZ2h0O1xyXG4gICAgXHJcbiAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgMTAwMDApIHtcclxuICAgICAgICB0aGlzLnBhblNwZWVkID0gMC4wMDE7XHJcbiAgICB9XHJcbiAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgNTAwMDAgJiYgY2FtZXJhSGVpZ2h0ID4gMTAwMDApIHtcclxuICAgICAgICB0aGlzLnBhblNwZWVkID0gMC4wMTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGNhbWVyYUhlaWdodCA8IDUwMDAwMCAmJiBjYW1lcmFIZWlnaHQgPiA1MDAwMCkge1xyXG4gICAgICAgIHRoaXMucGFuU3BlZWQgPSAwLjE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPiA1MDAwMDEgJiYgY2FtZXJhSGVpZ2h0IDwgMTUwMDAwMCkge1xyXG4gICAgICAgIHRoaXMucGFuU3BlZWQgPSAwLjg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnBhblNwZWVkID0gdGhpcy5wYW5TcGVlZEluaXQ7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgdmFyIGFic29sdXRlWCA9IE1hdGguYWJzKHRoaXMucGFuVHJhbnNmb3JtKHhEZWx0YSkpO1xyXG4gIFxyXG4gICAgaWYoeERlbHRhID4gMCkge1xyXG4gICAgICB0aGlzLmNhbWVyYS5tb3ZlTGVmdChhYnNvbHV0ZVgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY2FtZXJhLm1vdmVSaWdodChhYnNvbHV0ZVgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB2YXIgYWJzb2x1dGVZID0gTWF0aC5hYnModGhpcy5wYW5UcmFuc2Zvcm0oeURlbHRhKSk7XHJcblxyXG4gICAgaWYoeURlbHRhID4gMCkge1xyXG4gICAgICB0aGlzLmNhbWVyYS5tb3ZlRG93bihhYnNvbHV0ZVkpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY2FtZXJhLm1vdmVVcChhYnNvbHV0ZVkpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB0aGlzLnBhblhMYXN0ICAgID0geDtcclxuICAgIHRoaXMucGFuWUxhc3QgICAgPSB5O1xyXG4gICAgdGhpcy5wYW5aTGFzdCAgICA9IHo7XHJcbiAgICB0aGlzLnJvdGF0ZVhMYXN0ID0gbnVsbDtcclxuICAgIHRoaXMucm90YXRlWUxhc3QgPSBudWxsO1xyXG4gICAgdGhpcy56b29tWkxhc3QgICA9IG51bGw7XHJcbiAgfSBcclxuICBlbHNlIHtcclxuICAgIHRoaXMucGFuWExhc3QgPSBudWxsO1xyXG4gICAgdGhpcy5wYW5ZTGFzdCA9IG51bGw7XHJcbiAgICB0aGlzLnBhblpMYXN0ID0gbnVsbDsgICAgIFxyXG4gIH1cclxufTtcclxuXHJcbkxlYXBDYW1lcmFDb250cm9sbGVyLnByb3RvdHlwZS5haXJwbGFuZUNhbWVyYSA9IGZ1bmN0aW9uKGZyYW1lKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgZGF0YSA9IGZyYW1lLmRhdGE7XHJcbiAgaWYgKGZyYW1lLnZhbGlkICYmIGRhdGEuaGFuZHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICB2YXIgZmluZ2VycyA9IGRhdGEucG9pbnRhYmxlcztcclxuICAgIGlmIChmaW5nZXJzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZGF0YSA9IGRhdGEuaGFuZHNbMF07XHJcbiAgICAgIGlmIChkYXRhLnRpbWVWaXNpYmxlID4gMC43NSkge1xyXG4gICAgICAgIHZhciBjYW1lcmEgPSB0aGlzLmNhbWVyYSxcclxuICAgICAgICAgICAgbW92ZW1lbnQgPSB7fSxcclxuICAgICAgICAgICAgY2FtZXJhSGVpZ2h0ID0gdGhpcy5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FtZXJhLnBvc2l0aW9uKS5oZWlnaHQsXHJcbiAgICAgICAgICAgIG1vdmVSYXRlID0gY2FtZXJhSGVpZ2h0IC8gMTAwLjA7XHJcblxyXG4gICAgICAgIC8vIHBhbiAtIHgseVxyXG4gICAgICAgIG1vdmVtZW50LnggPSBkYXRhLnBhbG1Qb3NpdGlvblswXTtcclxuICAgICAgICBtb3ZlbWVudC55ID0gZGF0YS5wYWxtUG9zaXRpb25bMl07XHJcblxyXG4gICAgICAgIC8vem9vbSAtIHogLy8gaGVpZ2h0IGFib3ZlIGxlYXBcclxuICAgICAgICBtb3ZlbWVudC56ID0gZGF0YS5wYWxtUG9zaXRpb25bMV07XHJcblxyXG4gICAgICAgIC8vcGl0Y2ggLSBwaXRjaFxyXG4gICAgICAgIHZhciBub3JtYWwgPSBkYXRhLnBhbG1Ob3JtYWw7XHJcbiAgICAgICAgbW92ZW1lbnQucGl0Y2ggPSAtMSAqIG5vcm1hbFsyXTsgLy8gbGVhcCBtb3Rpb24gaGFzIGl0IHRoYXQgbmVnYXRpdmUgaXMgc2xvcGluZyB1cHdhcmRzXHJcbiAgICAgICAgLy9NYXRoLmF0YW4yKG5vcm1hbC56LCBub3JtYWwueSkgKiAxODAvbWF0aC5waSArIDE4MDtcclxuICAgICAgICBtb3ZlbWVudC5yb3RhdGUgPSBkYXRhLmRpcmVjdGlvblswXTtcclxuICAgICAgICAvL3lhdyAtIHlhd1xyXG4gICAgICAgIG1vdmVtZW50LnlhdyA9IC0xICogbm9ybWFsWzBdOyAvLyByb2xsP1xyXG4gICAgICAgIC8vIExlYXBNb3Rpb24gZmxpcHMgaXRzIHJvbGwgYW5nbGVzIGFzIHdlbGxcclxuXHJcbiAgICAgICAgLy8gdGhpcyAnbWlkJyB2YXIgc2VlbXMgdG8gYmUgYSBuYXR1cmFsIG1pZCBwb2ludCBpbiB0aGUgJ3onXHJcbiAgICAgICAgLy8gKG9yIHZlcnRjYWwgZGlzdGFuY2UgYWJvdmUgZGV2aWNlKVxyXG4gICAgICAgIC8vIGRpcmVjdGlvbiB0aGF0IGlzIHVzZWQgZm9yIHdoZXRoZXIgeW91IGFyZSBjbG9zZXIgdG8gdGhlIGRldmljZVxyXG4gICAgICAgIC8vIG9yIGF3YXkgZnJvbSBpdC5cclxuICAgICAgICB2YXIgbWlkID0gMTc1O1xyXG4gICAgICAgIHZhciBub3JtYWxpemVkID0gKG1vdmVtZW50LnogLSBtaWQpIC8gLTEwMDtcclxuXHJcbiAgICAgICAgY2FtZXJhLm1vdmVGb3J3YXJkKG5vcm1hbGl6ZWQgKiBtb3ZlUmF0ZSk7XHJcbiAgICAgICAgY2FtZXJhLm1vdmVSaWdodChtb3ZlbWVudC54ICogbW92ZVJhdGUgLyAxMDApO1xyXG4gICAgICAgIGNhbWVyYS5tb3ZlRG93bihtb3ZlbWVudC55ICogbW92ZVJhdGUgLyAxMDApO1xyXG5cclxuICAgICAgICBjYW1lcmEubG9va1VwKG1vdmVtZW50LnBpdGNoIC8gMTAwKTtcclxuXHJcbiAgICAgICAgY2FtZXJhLnR3aXN0UmlnaHQobW92ZW1lbnQueWF3IC8gMTAwKTtcclxuICAgICAgICBjYW1lcmEubG9va1JpZ2h0KG1vdmVtZW50LnJvdGF0ZSAvIDEwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZnJhbWUpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGlmICh0aGlzLmVuYWJsZWQpIHtcclxuICAgIGlmICh0aGlzLmNvbnRyb2xNb2RlID09PSAnc3RhbmRhcmQnKSB7XHJcbiAgICAgIHRoaXMucm90YXRlQ2FtZXJhKGZyYW1lKTtcclxuICAgICAgdGhpcy56b29tQ2FtZXJhKGZyYW1lKTtcclxuICAgICAgdGhpcy5wYW5DYW1lcmEoZnJhbWUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5jb250cm9sTW9kZSA9PT0gJ2ZsaWdodCcpIHtcclxuICAgICAgdGhpcy5haXJwbGFuZUNhbWVyYShmcmFtZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCIvKiBnbG9iYWxzIExlYXAsIExlYXBDb25uZWN0b3IsIGRvY3VtZW50ICovXHJcblxyXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XHJcbnZhciB1dGlsICAgPSByZXF1aXJlKCd1dGlsJyk7XHJcblxyXG5cclxuLyoqXHJcbiogRXZlcnl0aGluZyB3aGljaCBpcyBkZWZpbmVkIHdpdGggbW9kdWxlLmV4cG9ydHMgd2lsbCBiZSBhdmFpbGFibGUgdGhyb3VnaCB0aGUgcmVxdWlyZSBjb21tYW5kXHJcbiovIFxyXG5tb2R1bGUuZXhwb3J0cyA9IExlYXBDb25uZWN0b3I7XHJcblxyXG5cclxuLyoqXHJcbiogQ29uc3RydWN0b3JcclxuKi9cclxuZnVuY3Rpb24gTGVhcENvbm5lY3RvcigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHRoaXMuTGVhcCA9IExlYXA7XHJcblxyXG4gIC8vIENyZWF0ZSBhIG5ldyBjb250cm9sbGVyXHJcbiAgdGhpcy5jb250cm9sbGVyID0gbmV3IHRoaXMuTGVhcC5Db250cm9sbGVyKHtlbmFibGVHZXN0dXJlczogdHJ1ZX0pO1xyXG5cclxuICAvLyBTZXR1cCB0aGUgY29ubmVjdCBldmVudCBsaXN0ZW5lclxyXG4gIHRoaXMuY29udHJvbGxlci5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJTdWNjZXNzZnVsbHkgY29ubmVjdGVkLlwiKTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ29ubmVjdCB0byB0aGUgbmV3bHkgY3JlYXRlZCBjb250cm9sbGVyXHJcbiAgdGhpcy5jb250cm9sbGVyLmNvbm5lY3QoKTtcclxuXHJcblxyXG4gIHRoaXMuZmluZ2VycyA9IHt9O1xyXG4gIHRoaXMuc3BoZXJlcyA9IHt9O1xyXG59XHJcblxyXG4vKipcclxuKiBJbmhlcml0IHRoZSBldmVudCBlbWl0dGVyIGZ1bmN0aW9uYWxpdHlcclxuKi9cclxudXRpbC5pbmhlcml0cyhMZWFwQ29ubmVjdG9yLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcclxuXHJcblxyXG5MZWFwQ29ubmVjdG9yLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG5cdHRoaXMuY3VycmVudEZyYW1lID0gdGhpcy5jb250cm9sbGVyLmZyYW1lKCk7XHJcblx0dGhpcy52aXN1YWxpemUoKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuKiBGdW5jdGlvbnMgZm9yIHRoZSB2aXN1YWxpemF0aW9uIG9mIHRoZSBsZWFwIGRhdGFcclxuKi9cclxuTGVhcENvbm5lY3Rvci5wcm90b3R5cGUubW92ZUZpbmdlciA9IGZ1bmN0aW9uKEZpbmdlciwgcG9zWCwgcG9zWSwgcG9zWiwgZGlyWCwgZGlyWSwgZGlyWikge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICBGaW5nZXIuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gRmluZ2VyLnN0eWxlLm1velRyYW5zZm9ybSA9IFxyXG4gIEZpbmdlci5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVgoXCIrcG9zWCtcInB4KSB0cmFuc2xhdGVZKFwiK3Bvc1krXCJweCkgdHJhbnNsYXRlWihcIitwb3NaK1wicHgpIHJvdGF0ZVgoXCIrZGlyWCtcImRlZykgcm90YXRlWSgwZGVnKSByb3RhdGVaKFwiK2RpclorXCJkZWcpXCI7XHJcbn07XHJcblxyXG5MZWFwQ29ubmVjdG9yLnByb3RvdHlwZS5tb3ZlU3BoZXJlID0gZnVuY3Rpb24oU3BoZXJlLCBwb3NYLCBwb3NZLCBwb3NaLCByb3RYKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIFNwaGVyZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBTcGhlcmUuc3R5bGUubW96VHJhbnNmb3JtID0gXHJcbiAgU3BoZXJlLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWChcIitwb3NYK1wicHgpIHRyYW5zbGF0ZVkoXCIrcG9zWStcInB4KSB0cmFuc2xhdGVaKFwiK3Bvc1orXCJweCkgcm90YXRlWChcIityb3RYK1wiZGVnKSByb3RhdGVZKDBkZWcpIHJvdGF0ZVooMGRlZylcIjtcclxufTtcclxuXHJcbkxlYXBDb25uZWN0b3IucHJvdG90eXBlLnZpc3VhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBmaW5nZXJJZHMgICA9IHt9O1xyXG4gIHZhciBoYW5kSWRzICAgICA9IHt9O1xyXG4gIHZhciBoYW5kc0xlbmd0aCA9IDA7XHJcbiAgdmFyIHNwaGVyZURpdiAgID0gbnVsbDtcclxuICB2YXIgZmluZ2VyRGl2ICAgPSBudWxsO1xyXG5cclxuICB2YXIgcG9zWCA9IDA7XHJcbiAgdmFyIHBvc1kgPSAwO1xyXG4gIHZhciBwb3NaID0gMDtcclxuXHJcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lLmhhbmRzID09PSB1bmRlZmluZWQgKSB7IFxyXG4gICAgaGFuZHNMZW5ndGggPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBoYW5kc0xlbmd0aCA9IHRoaXMuY3VycmVudEZyYW1lLmhhbmRzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGhhbmRJZCA9IDAsIGhhbmRDb3VudCA9IGhhbmRzTGVuZ3RoOyBoYW5kSWQgIT09IGhhbmRDb3VudDsgaGFuZElkKyspIHtcclxuICAgIHZhciBoYW5kID0gdGhpcy5jdXJyZW50RnJhbWUuaGFuZHNbaGFuZElkXTtcclxuXHJcbiAgICBwb3NYID0gKGhhbmQucGFsbVBvc2l0aW9uWzBdKjMpO1xyXG4gICAgcG9zWSA9IChoYW5kLnBhbG1Qb3NpdGlvblsyXSozKS0yMDA7XHJcbiAgICBwb3NaID0gKGhhbmQucGFsbVBvc2l0aW9uWzFdKjMpLTQwMDtcclxuXHJcbiAgICB2YXIgcm90WCA9IChoYW5kLl9yb3RhdGlvblsyXSo5MCk7XHJcbiAgICB2YXIgcm90WSA9IChoYW5kLl9yb3RhdGlvblsxXSo5MCk7XHJcbiAgICB2YXIgcm90WiA9IChoYW5kLl9yb3RhdGlvblswXSo5MCk7XHJcbiAgICB2YXIgc3BoZXJlID0gdGhpcy5zcGhlcmVzW2hhbmQuaWRdO1xyXG4gICAgaWYgKCFzcGhlcmUpIHtcclxuXHRcdHNwaGVyZURpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BoZXJlXCIpLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgIHNwaGVyZURpdi5zZXRBdHRyaWJ1dGUoJ2lkJyxoYW5kLmlkKTtcclxuICAgICAgICAgIHNwaGVyZURpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3I9JyNBM0EzQTMnOyAgLy8nIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKS5hcHBlbmRDaGlsZChzcGhlcmVEaXYpO1xyXG4gICAgICAgICAgdGhpcy5zcGhlcmVzW2hhbmQuaWRdID0gaGFuZC5pZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNwaGVyZURpdiA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYW5kLmlkKTtcclxuICAgICAgaWYgKHR5cGVvZihzcGhlcmVEaXYpICE9PSAndW5kZWZpbmVkJyAmJiBzcGhlcmVEaXYgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLm1vdmVTcGhlcmUoc3BoZXJlRGl2LCBwb3NYLCBwb3NZLCBwb3NaLCByb3RYLCByb3RZLCByb3RaKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaGFuZElkc1toYW5kLmlkXSA9IHRydWU7XHJcbiAgfVxyXG4gIGZvciAoaGFuZElkIGluIHRoaXMuc3BoZXJlcykge1xyXG4gICAgaWYgKCFoYW5kSWRzW2hhbmRJZF0pIHtcclxuICAgICAgc3BoZXJlRGl2ID0gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuc3BoZXJlc1toYW5kSWRdKTtcclxuICAgICAgc3BoZXJlRGl2LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3BoZXJlRGl2KTtcclxuICAgICAgZGVsZXRlIHRoaXMuc3BoZXJlc1toYW5kSWRdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgcG9pbnRhYmxlSWQgPSAwLCBwb2ludGFibGVDb3VudCA9IHRoaXMuY3VycmVudEZyYW1lLnBvaW50YWJsZXMubGVuZ3RoOyBwb2ludGFibGVJZCAhPT0gcG9pbnRhYmxlQ291bnQ7IHBvaW50YWJsZUlkKyspIHtcclxuICAgIHZhciBwb2ludGFibGUgPSB0aGlzLmN1cnJlbnRGcmFtZS5wb2ludGFibGVzW3BvaW50YWJsZUlkXTtcclxuXHJcbiAgICBwb3NYID0gKHBvaW50YWJsZS50aXBQb3NpdGlvblswXSozKTtcclxuICAgIHBvc1kgPSAocG9pbnRhYmxlLnRpcFBvc2l0aW9uWzJdKjMpLTIwMDtcclxuICAgIHBvc1ogPSAocG9pbnRhYmxlLnRpcFBvc2l0aW9uWzFdKjMpLTQwMDtcclxuXHJcbiAgICB2YXIgZGlyWCA9IC0ocG9pbnRhYmxlLmRpcmVjdGlvblsxXSo5MCk7XHJcbiAgICB2YXIgZGlyWSA9IC0ocG9pbnRhYmxlLmRpcmVjdGlvblsyXSo5MCk7XHJcbiAgICB2YXIgZGlyWiA9IChwb2ludGFibGUuZGlyZWN0aW9uWzBdKjkwKTtcclxuICAgIHZhciBmaW5nZXIgPSB0aGlzLmZpbmdlcnNbcG9pbnRhYmxlLmlkXTtcclxuICAgIGlmICghZmluZ2VyKSB7XHJcblx0XHRmaW5nZXJEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbmdlclwiKS5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICBmaW5nZXJEaXYuc2V0QXR0cmlidXRlKCdpZCcscG9pbnRhYmxlLmlkKTtcclxuICAgICAgICAgIGZpbmdlckRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3I9JyNBM0EzQTMnOyAgLy8nIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKS5hcHBlbmRDaGlsZChmaW5nZXJEaXYpO1xyXG4gICAgICAgICAgdGhpcy5maW5nZXJzW3BvaW50YWJsZS5pZF0gPSBwb2ludGFibGUuaWQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmaW5nZXJEaXYgPSAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocG9pbnRhYmxlLmlkKTtcclxuICAgICAgaWYgKHR5cGVvZihmaW5nZXJEaXYpICE9PSAndW5kZWZpbmVkJyAmJiBmaW5nZXJEaXYgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMubW92ZUZpbmdlcihmaW5nZXJEaXYsIHBvc1gsIHBvc1ksIHBvc1osIGRpclgsIGRpclksIGRpclopO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmaW5nZXJJZHNbcG9pbnRhYmxlLmlkXSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICB2YXIgZmluZ2VySWQ7XHJcbiAgZm9yIChmaW5nZXJJZCBpbiB0aGlzLmZpbmdlcnMpIHtcclxuICAgIGlmICghZmluZ2VySWRzW2ZpbmdlcklkXSkge1xyXG4gICAgICBmaW5nZXJEaXYgPSAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5maW5nZXJzW2ZpbmdlcklkXSk7XHJcbiAgICAgIGZpbmdlckRpdi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZpbmdlckRpdik7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmZpbmdlcnNbZmluZ2VySWRdO1xyXG4gICAgfVxyXG4gIH1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0hhbmRzJykuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJykuc2V0QXR0cmlidXRlKCdjbGFzcycsJ3Nob3ctaGFuZHMnKTtcclxuICB9LCBmYWxzZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGVIYW5kcycpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCcnKTtcclxuICB9LCBmYWxzZSk7XHJcbn07IiwiLyogZ2xvYmFscyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGRvY3VtZW50LCAkICovXHJcblxyXG52YXIgTGVhcENvbm5lY3RvciAgICAgICAgPSByZXF1aXJlKCcuL2xlYXBDb25uZWN0b3IuanMnKTtcclxudmFyIExlYXBDYW1lcmFDb250cm9sbGVyID0gcmVxdWlyZSgnLi9sZWFwQ2FtZXJhQ29udHJvbGxlci5qcycpO1xyXG52YXIgQ2VzaXVtV29ybGQgICAgICAgICAgPSByZXF1aXJlKCcuL2Nlc2l1bVdvcmxkLmpzJyk7XHJcbnZhciBzcGVlY2hMaXN0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vc3BlZWNoLmpzb24nKTtcclxudmFyIFNwZWVjaFJlY29nbml0aW9uICAgID0gcmVxdWlyZSgnLi9zcGVlY2hSZWNvZ25pdGlvbi5qcycpO1xyXG52YXIgU3BlZWNoU3ludGhlc2lzICAgICAgPSByZXF1aXJlKCcuL3NwZWVjaFN5bnRoZXNpcy5qcycpO1xyXG52YXIgVWkgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL1VpLmpzJyk7XHJcbnZhciBHZXN0dXJlSW50cm8gICAgICAgICA9IHJlcXVpcmUoJy4vZ2VzdHVyZUludHJvLmpzJyk7XHJcblxyXG5cclxuLy8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vLyBJbml0aWFsaXplIGFuZCBjb25uZWN0IHRoZSBtb2R1bGVzXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG52YXIgbGVhcENvbm5lY3Rpb24gICAgICAgPSBuZXcgTGVhcENvbm5lY3RvcigpO1xyXG52YXIgc3BlZWNoUmVjb2duaXRpb24gICAgPSBuZXcgU3BlZWNoUmVjb2duaXRpb24oc3BlZWNoTGlzdCk7XHJcbnZhciBzcGVlY2hTeW50aGVzaXMgICAgICA9IG5ldyBTcGVlY2hTeW50aGVzaXMoc3BlZWNoTGlzdCk7XHJcbnZhciBjZXNpdW1Xb3JsZCAgICAgICAgICA9IG5ldyBDZXNpdW1Xb3JsZChzcGVlY2hSZWNvZ25pdGlvbiwgc3BlZWNoU3ludGhlc2lzKTtcclxudmFyIGxlYXBDYW1lcmFDb250cm9sbGVyID0gbmV3IExlYXBDYW1lcmFDb250cm9sbGVyKGNlc2l1bVdvcmxkLndpZGdldC5zY2VuZS5jYW1lcmEsIGNlc2l1bVdvcmxkLmVsbGlwc29pZCk7XHJcbnZhciB1aSAgICAgICAgICAgICAgICAgICA9IG5ldyBVaShjZXNpdW1Xb3JsZCk7XHJcbnZhciBnZXN0dXJlSW50cm8gICAgICAgICA9IG5ldyBHZXN0dXJlSW50cm8oKTtcclxuXHJcblxyXG4vLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8vIFNldHVwIHNvbWUgZXZlbnQgbGlzdGVuZXJzIHRvIGNoYW5nZSB0aGUgbGVhcCBjb250cm9sIG1vZGVcclxuLy8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbnNwZWVjaFJlY29nbml0aW9uLm9uKCdmbGlnaHRNb2RlJywgZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdGxlYXBDYW1lcmFDb250cm9sbGVyLmNvbnRyb2xNb2RlID0gJ2ZsaWdodCc7XHJcblxyXG5cdHNwZWVjaFN5bnRoZXNpcy5hbnN3ZXIoJ2ZsaWdodE1vZGUnLCB7J3N0YXRlJzogdHJ1ZX0pO1xyXG59KTtcclxuXHJcbnNwZWVjaFJlY29nbml0aW9uLm9uKCdzdGFuZGFyZE1vZGUnLCBmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblx0bGVhcENhbWVyYUNvbnRyb2xsZXIuY29udHJvbE1vZGUgPSAnc3RhbmRhcmQnO1xyXG5cclxuXHRzcGVlY2hTeW50aGVzaXMuYW5zd2VyKCdzdGFuZGFyZE1vZGUnLCB7J3N0YXRlJzogdHJ1ZX0pO1xyXG59KTtcclxuXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLy8gSW5pdGlhbGl6ZSB0aGUgVUkgcmVsYXRlZCBzdHVmZiBhZnRlciB0aGUgZG9jdW1lbnQgaXMgZnVsbHkgbG9hZGVkXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHVpLmluaXQoKTtcclxuXHRnZXN0dXJlSW50cm8uaW5pdCgpO1xyXG59KTtcclxuXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLy8gU3RhcnQgdGhlIG91ciBjdXN0b20gYW5pbWF0aW9uIC8gdXBkYXRlIGxvb3BcclxuLy8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbiB1cGRhdGUoKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxuXHJcblx0bGVhcENvbm5lY3Rpb24udXBkYXRlKCk7XHJcbiAgICBjZXNpdW1Xb3JsZC51cGRhdGUoKTtcclxuICAgIGxlYXBDYW1lcmFDb250cm9sbGVyLnVwZGF0ZShsZWFwQ29ubmVjdGlvbi5jdXJyZW50RnJhbWUpO1xyXG59KCkpO1xyXG5cclxuIiwibW9kdWxlLmV4cG9ydHM9W1xyXG4gIHtcclxuICAgIFwibGFuZ3VhZ2VcIjogXCJHZXJtYW5cIixcclxuICAgIFwiY29kZVwiOiBcImRlLURFXCIsXHJcbiAgICBcIml0ZW1zXCI6IFtcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcInNlbGVjdExheWVyXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJPYmVyZmzDpGNoZVwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBoYWJlIGRpZSBPYmVyZmzDpGNoZSB6dSAjUkVQTEFDRSMgZ2XDpG5kZXJ0LlwiXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgXCJmYWlsXCI6IFtcclxuICAgICAgICAgICAgXCJJY2gga2FubiBkaWUgT2JlcmZsw6RjaGUgI1JFUExBQ0UjIG5pY2h0IGJlbnV0emVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwiZmxpZ2h0TW9kZVwiLFxyXG4gICAgICAgIFwiZGV0ZWN0XCI6IFwiRmx1Z21vZHVzXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGhhYmUgZGVuIEZsdWdtb2R1cyBha3RpdmllcnQuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgZGVuIEZsdWdtb2R1cyBuaWNodCBha3RpdmllcmVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwiaW5mb3JtYXRpb25SZXF1ZXN0XCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJJbmZvcm1hdGlvbmVuXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcInRlc3RcIixcclxuICAgICAgICBcImRldGVjdFwiOiBcInRlc3RcIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEZWluIE1pa3JvcGhvbiBmdW5rdGlvbmllcnQgc3VwZXIuXCIsXHJcbiAgICAgICAgICAgIFwiSWNoIGjDtnJlIGRpY2guXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgZGVuIEZsdWdtb2R1cyBuaWNodCBha3RpdmllcmVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwic3RhbmRhcmRNb2RlXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJTdGFuZGFyZCBtb2R1c1wiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBoYWJlIGRlbiBTdGFuZGFyZG1vZHVzIGFrdGl2aWVydC5cIlxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGtvbm50ZSBkZW4gU3RhbmRhcmRtb2R1cyBuaWNodCBha3RpdmllcmVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwidGhhbmtzXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJEYW5rZVwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkdlcm5lIGRvY2guXCIsXHJcbiAgICAgICAgICAgIFwiS2VpbiBQcm9ibGVtLlwiLFxyXG4gICAgICAgICAgICBcIkljaCBmcmV1ZSBtaWNoIGRpciBnZWhvbGZlbiB6dSBoYWJlbi5cIixcclxuICAgICAgICAgICAgXCJEYXMgaGFiZSBpY2ggZG9jaCBnZXJuIGdldGFuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwic2V0VGVycmFpblwiLFxyXG4gICAgICAgIFwiZGV0ZWN0XCI6IFwiUmVsaWVmXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGhhYmUgZGFzIFJlbGllZiAjUkVQTEFDRSMuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrYW5uIGRhcyBSZWxpZWYgbmljaHQgZWluc2NoYWx0ZW4uXCJcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBcImVtaXRcIjogXCJuYXZpZ2F0ZVRvXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJzdWNoZVwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBoYWJlICNSRVBMQUNFIyBnZWZ1bmRlblwiXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgXCJmYWlsXCI6IFtcclxuICAgICAgICAgICAgXCJJY2gga29ubnRlICNSRVBMQUNFIyBuaWNodCBmaW5kZW4uXCIsXHJcbiAgICAgICAgICAgIFwiSWNoIGhhYmUgI1JFUExBQ0UjIG5pY2h0IGdlZnVuZGVuLlwiLFxyXG4gICAgICAgICAgICBcIkVzIHR1dCBtaXIgbGVpZCwgaWNoIGhhYmUgI1JFUExBQ0UjIG5pY2h0IGdlZnVuZGVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZUZvcndhcmRcIixcclxuICAgICAgICBcImRldGVjdFwiOiBcInZlcmdyw7bDn2VyblwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkR1IGJpc3QgamV0enQgbsOkaGVyIGRyYW4uXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIHZlcmdyw7bDn2Vybi5cIlxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcIm1vdmVCYWNrd2FyZFwiLFxyXG4gICAgICAgIFwiZGV0ZWN0XCI6IFwidmVya2xlaW5lcm5cIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEdSBiaXN0IGpldHp0IHdlaXRlciB3ZWcuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIHZlcmtsZWluZXJuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZVVwXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJob2NoXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiRHUgYmlzdCBqZXR6dCB3ZWl0ZXIgb2Jlbi5cIlxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGtvbm50ZSBuaWNodCB3ZWl0ZXIgaG9jaC5cIlxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcIm1vdmVEb3duXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJydW50ZXJcIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEdSBiaXN0IGpldHp0IHdlaXRlciB1bnRlbi5cIlxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGtvbm50ZSBuaWNodCB3ZWl0ZXIgcnVudGVyLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZUxlZnRcIixcclxuICAgICAgICBcImRldGVjdFwiOiBcImxpbmtzXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiRHUgYmlzdCBqZXR6dCB3ZWl0ZXIgbGlua3MuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIGxpbmtzLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZVJpZ2h0XCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJyZWNodHNcIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEdSBiaXN0IGpldHp0IHdlaXRlciByZWNodHMuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIHJlY2h0cy5cIlxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH1cclxuXSIsIi8qIGdsb2JhbHMgU3BlZWNoUmVjb2duaXRpb24sIHdpbmRvdywgd2Via2l0U3BlZWNoUmVjb2duaXRpb24qL1xyXG5cclxuXHJcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcclxudmFyIHV0aWwgICA9IHJlcXVpcmUoJ3V0aWwnKTtcclxuXHJcbi8qKlxyXG4gKiBFeHBvcnQgZm9yIHJlcXVpcmUgc3RhdGVtYW50XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IFNwZWVjaFJlY29nbml0aW9uO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gU3BlZWNoUmVjb2duaXRpb24oX3NwZWVjaExpc3QpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbiA9IG51bGw7XHJcbiAgICB0aGlzLmlzUmVjb2duaXppbmcgPSBmYWxzZTtcclxuICAgIHRoaXMubGFuZ3VhZ2UgPSAnZGUtREUnO1xyXG4gICAgdGhpcy5zcGVlY2hMaXN0ID0gX3NwZWVjaExpc3Q7XHJcbiAgICB0aGlzLnNwZWVjaEVycm9yID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcblxyXG51dGlsLmluaGVyaXRzKFNwZWVjaFJlY29nbml0aW9uLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcclxuXHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBpZiAoISgnd2Via2l0U3BlZWNoUmVjb2duaXRpb24nIGluIHdpbmRvdykpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnU3BlZWNoIHJlY29nbml0aW9uIGlzIG5vdCBhdmFpbGFibGUuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbiA9IG5ldyB3ZWJraXRTcGVlY2hSZWNvZ25pdGlvbigpO1xyXG4gICAgICAgIHRoaXMuYnJvd3NlclJlY29nbml0aW9uLmNvbnRpbnVvdXMgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnJvd3NlclJlY29nbml0aW9uLmludGVyaW1SZXN1bHRzID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbi5sYW5nID0gdGhpcy5sYW5ndWFnZTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuYnJvd3NlclJlY29nbml0aW9uLm9uc3RhcnQgPSBmdW5jdGlvbigpe190aGlzLm9uU3RhcnQoKTt9O1xyXG4gICAgICAgIHRoaXMuYnJvd3NlclJlY29nbml0aW9uLm9ucmVzdWx0ID0gZnVuY3Rpb24oZXZlbnQpe190aGlzLm9uUmVzdWx0KGV2ZW50KTt9O1xyXG4gICAgICAgIHRoaXMuYnJvd3NlclJlY29nbml0aW9uLm9uZW5kID0gZnVuY3Rpb24oKXtfdGhpcy5vbkVuZCgpO307XHJcbiAgICAgICAgdGhpcy5icm93c2VyUmVjb2duaXRpb24ub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50KXtfdGhpcy5vbkVycm9yKGV2ZW50KTt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RhcnQoKTtcclxuICAgIH1cclxufTtcclxuXHJcblNwZWVjaFJlY29nbml0aW9uLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdGhpcy5icm93c2VyUmVjb2duaXRpb24uc3RhcnQoKTtcclxufTtcclxuXHJcblNwZWVjaFJlY29nbml0aW9uLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbi5zdG9wKCk7XHJcbn07XHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUub25TdGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdGhpcy5pc1JlY29nbml6aW5nID0gdHJ1ZTtcclxufTtcclxuXHJcblNwZWVjaFJlY29nbml0aW9uLnByb3RvdHlwZS5vblJlc3VsdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIHZhciBpbnRlcmltVHJhbnNjcmlwdCA9ICcnO1xyXG4gICAgdmFyIGZpbmFsTWF0Y2ggPSBmYWxzZTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gZXZlbnQucmVzdWx0SW5kZXg7IGkgPCBldmVudC5yZXN1bHRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQucmVzdWx0c1tpXSk7XHJcbiAgICAgICAgaWYgKGV2ZW50LnJlc3VsdHNbaV0uaXNGaW5hbCkge1xyXG4gICAgICAgICAgICBmaW5hbE1hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgaW50ZXJpbVRyYW5zY3JpcHQgKz0gZXZlbnQucmVzdWx0c1tpXVswXS50cmFuc2NyaXB0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihmaW5hbE1hdGNoKVxyXG4gICAge1xyXG4gICAgICAgIGludGVyaW1UcmFuc2NyaXB0ID0gdGhpcy50cmltU3BhY2VzKGludGVyaW1UcmFuc2NyaXB0KTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5zcGVlY2hMaXN0Lmxlbmd0aDsgKytqKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYodGhpcy5zcGVlY2hMaXN0W2pdLmNvZGUgPT09IHRoaXMubGFuZ3VhZ2UpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCB0aGlzLnNwZWVjaExpc3Rbal0uaXRlbXMubGVuZ3RoOyArK2spXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnREZXRlY3Rpb25JdGVtID0gdGhpcy5zcGVlY2hMaXN0W2pdLml0ZW1zW2tdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihpbnRlcmltVHJhbnNjcmlwdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoY3VycmVudERldGVjdGlvbkl0ZW0uZGV0ZWN0LnRvTG93ZXJDYXNlKCkpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBldmVudERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYWN0aW9uJyA6IHRoaXMudHJpbVNwYWNlcyhpbnRlcmltVHJhbnNjcmlwdC5yZXBsYWNlKGN1cnJlbnREZXRlY3Rpb25JdGVtLmRldGVjdCwgJycpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkZXRlY3RlZCcgOiBjdXJyZW50RGV0ZWN0aW9uSXRlbS5kZXRlY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZW1pdCcgOiBjdXJyZW50RGV0ZWN0aW9uSXRlbS5lbWl0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xhbmd1YWdlJyA6IHRoaXMubGFuZ3VhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChjdXJyZW50RGV0ZWN0aW9uSXRlbS5lbWl0LCBldmVudERhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKCduaWNodHMgYnJhdWNoYmFyZXMnKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgICAvLyBubyBmaW5hbCBtYXRjaFxyXG4gICAgfVxyXG59O1xyXG5cclxuU3BlZWNoUmVjb2duaXRpb24ucHJvdG90eXBlLnRyaW1TcGFjZXMgPSBmdW5jdGlvbihfc3RyaW5nKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICByZXR1cm4gX3N0cmluZy5yZXBsYWNlKC9eXFxzXFxzKi8sICcnKS5yZXBsYWNlKC9cXHNcXHMqJC8sICcnKTtcclxufTtcclxuXHJcblNwZWVjaFJlY29nbml0aW9uLnByb3RvdHlwZS5vbkVuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdGhpcy5pc1JlY29nbml6aW5nID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGlmKCF0aGlzLnNwZWVjaEVycm9yKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc3RhcnQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coXCJzcGVlY2ggcmVjb2duaXRpb24gZW5kZWRcIik7XHJcbn07XHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIGlmIChldmVudC5lcnJvciA9PT0gJ25vLXNwZWVjaCcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6IG5vIHNwZWVjaCcpO1xyXG4gICAgfVxyXG4gICAgaWYgKGV2ZW50LmVycm9yID09PSAnYXVkaW8tY2FwdHVyZScpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6IG5vIG1pY3JvcGhvbmUnKTtcclxuICAgICAgICB0aGlzLnNwZWVjaEVycm9yID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmIChldmVudC5lcnJvciA9PT0gJ25vdC1hbGxvd2VkJykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjogbm90IGFsbG93ZWQnKTtcclxuICAgICAgICB0aGlzLnNwZWVjaEVycm9yID0gdHJ1ZTtcclxuICAgIH1cclxufTsiLCIvKiBnbG9iYWxzIFNwZWVjaFN5bnRoZXNpcywgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlLCB3aW5kb3cqL1xyXG5cclxuXHJcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcclxudmFyIHV0aWwgICA9IHJlcXVpcmUoJ3V0aWwnKTtcclxuXHJcbi8qKlxyXG4gKiBFeHBvcnQgZm9yIHJlcXVpcmUgc3RhdGVtYW50XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IFNwZWVjaFN5bnRoZXNpcztcclxuXHJcblxyXG4vKipcclxuICogQ29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFNwZWVjaFN5bnRoZXNpcyhfc3BlZWNoTGlzdCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHRoaXMubWVzc2FnZSA9IG51bGw7XHJcbiAgICB0aGlzLnZvaWNlcyAgPSBbXTtcclxuICAgIHRoaXMubGFuZ3VhZ2UgPSAnZGUtREUnO1xyXG4gICAgdGhpcy5zcGVlY2hMaXN0ID0gX3NwZWVjaExpc3Q7XHJcbiAgICBcclxuICAgIHRoaXMuaW5pdCgpO1xyXG59XHJcblxyXG5cclxudXRpbC5pbmhlcml0cyhTcGVlY2hTeW50aGVzaXMsIGV2ZW50cy5FdmVudEVtaXR0ZXIpO1xyXG5cclxuXHJcblNwZWVjaFN5bnRoZXNpcy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICAvLyBDaGVja2luZyBmb3Igc3BlZWNoIHJlY29nbml0aW9uIGhlcmUgYmVjYXVzZSBzcGVlY2hTeW50aGVzaXMgaXMgYSBsaXR0bGUgYnVnZ3kgaW4gZmlyZWZveFxyXG4gICAgaWYgKCEoJ3dlYmtpdFNwZWVjaFJlY29nbml0aW9uJyBpbiB3aW5kb3cpKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NwZWVjaFN5bnRoZXNpcyBpcyBub3QgYXZhaWxhYmxlLicpO1xyXG4gICAgfSBcclxuICAgIGVsc2UgXHJcbiAgICB7XHJcblxyXG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG5ldyBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UoKTtcclxuICAgICAgICB0aGlzLnZvaWNlcyA9IHdpbmRvdy5zcGVlY2hTeW50aGVzaXMuZ2V0Vm9pY2VzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLnZvaWNlID0gdGhpcy52b2ljZXNbMF07IC8vIE5vdGU6IHNvbWUgdm9pY2VzIGRvbid0IHN1cHBvcnQgYWx0ZXJpbmcgcGFyYW1zXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLnZvaWNlVVJJID0gJ25hdGl2ZSc7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLnZvbHVtZSA9IDE7IC8vIDAgdG8gMVxyXG4gICAgICAgIHRoaXMubWVzc2FnZS5yYXRlID0gMTsgLy8gMC4xIHRvIDEwXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLnBpdGNoID0gMjsgLy8wIHRvIDJcclxuICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dCA9ICcnO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS5sYW5nID0gdGhpcy5sYW5ndWFnZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm92ZXJsZW5ndGhBcnJheSA9IFtdO1xyXG4gICAgICAgIHRoaXMub3Zlcmxlbmd0aENvdW50ID0gMDtcclxuICAgIH1cclxufTtcclxuXHJcblNwZWVjaFN5bnRoZXNpcy5wcm90b3R5cGUuc3RyU3BsaXRPbkxlbmd0aCA9IGZ1bmN0aW9uKHN0ciwgbWF4V2lkdGgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgcmVzdWx0QXJyID0gW107XHJcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyhbXFxzXFxuXFxyXSspLyk7XHJcbiAgICB2YXIgY291bnQgPSBwYXJ0cy5sZW5ndGg7XHJcbiAgICB2YXIgd2lkdGggPSAwO1xyXG4gICAgdmFyIHN0YXJ0ID0gMDtcclxuICAgIGZvciAodmFyIGk9MDsgaTxjb3VudDsgKytpKSB7XHJcbiAgICAgICAgd2lkdGggKz0gcGFydHNbaV0ubGVuZ3RoO1xyXG4gICAgICAgIGlmICh3aWR0aCA+IG1heFdpZHRoKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdEFyci5wdXNoKCBwYXJ0cy5zbGljZShzdGFydCwgaSkuam9pbignJykgKTtcclxuICAgICAgICAgICAgc3RhcnQgPSBpO1xyXG4gICAgICAgICAgICB3aWR0aCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdEFycjtcclxufTtcclxuXHJcblxyXG5TcGVlY2hTeW50aGVzaXMucHJvdG90eXBlLm9uRW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgIFxyXG4gICAgaWYoKHRoaXMub3Zlcmxlbmd0aEFycmF5Lmxlbmd0aCkgPT09IHRoaXMub3Zlcmxlbmd0aENvdW50KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS5vbmVuZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLm92ZXJsZW5ndGhDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5vdmVybGVuZ3RoQXJyYXkgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5vdmVybGVuZ3RoQ291bnQpO1xyXG4gICAgICAgICsrdGhpcy5vdmVybGVuZ3RoQ291bnQ7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLnRleHQgPSB0aGlzLm92ZXJsZW5ndGhBcnJheVt0aGlzLm92ZXJsZW5ndGhDb3VudF07XHJcbiAgICAgICAgd2luZG93LnNwZWVjaFN5bnRoZXNpcy5zcGVhayh0aGlzLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU3BlZWNoU3ludGhlc2lzLnByb3RvdHlwZS5zcGVhayA9IGZ1bmN0aW9uKF90ZXh0LCBfb3B0aW9ucykge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICB3aW5kb3cuc3BlZWNoU3ludGhlc2lzLmNhbmNlbCgpO1xyXG4gICAgXHJcbiAgICBpZihfdGV4dC5sZW5ndGggPiAyMDApXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5vdmVybGVuZ3RoQXJyYXkgPSB0aGlzLnN0clNwbGl0T25MZW5ndGgoX3RleHQsIDIwMCk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5vdmVybGVuZ3RoQXJyYXkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVzc2FnZS50ZXh0ID0gdGhpcy5vdmVybGVuZ3RoQXJyYXlbMF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1lc3NhZ2Uub25lbmQgPSBmdW5jdGlvbihldmVudCl7X3RoaXMub25FbmQoZXZlbnQpO307XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LnNwZWVjaFN5bnRoZXNpcy5zcGVhayh0aGlzLm1lc3NhZ2UpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5tZXNzYWdlLnRleHQgPSBfdGV4dDtcclxuICAgIFxyXG4gICAgdGhpcy5tZXNzYWdlLm9uZW5kID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5tZXNzYWdlLm9uc3RhcnQgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLm1lc3NhZ2Uub25wYXVzZSA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMubWVzc2FnZS5vbnJlc3VtZSA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMubWVzc2FnZS5vbmVycm9yID0gdW5kZWZpbmVkO1xyXG4gICAgXHJcbiAgICBpZih0eXBlb2YgX29wdGlvbnMgIT09ICd1bmRlZmluZWQnKVxyXG4gICAge1xyXG4gICAgICAgIGlmKHR5cGVvZiBfb3B0aW9ucy5vbkVuZCA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uZW5kID0gX29wdGlvbnMub25FbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0eXBlb2YgX29wdGlvbnMub25TdGFydCA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uc3RhcnQgPSBfb3B0aW9ucy5vblN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodHlwZW9mIF9vcHRpb25zLm9uUGF1c2UgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbnBhdXNlID0gX29wdGlvbnMub25QYXVzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiBfb3B0aW9ucy5vblJlc3VtZSA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9ucmVzdW1lID0gX29wdGlvbnMub25SZXN1bWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0eXBlb2YgX29wdGlvbnMub25FcnJvciA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uZXJyb3IgPSBfb3B0aW9ucy5vbmVycm9yO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aW5kb3cuc3BlZWNoU3ludGhlc2lzLnNwZWFrKHRoaXMubWVzc2FnZSk7XHJcbn07XHJcblxyXG5TcGVlY2hTeW50aGVzaXMucHJvdG90eXBlLmFuc3dlciA9IGZ1bmN0aW9uKF9lbWl0LCBfb3B0aW9ucykge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuc3BlZWNoTGlzdC5sZW5ndGg7ICsrailcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zcGVlY2hMaXN0W2pdLmNvZGUgPT09IHRoaXMubGFuZ3VhZ2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMuc3BlZWNoTGlzdFtqXS5pdGVtcy5sZW5ndGg7ICsraylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnREZXRlY3Rpb25JdGVtID0gdGhpcy5zcGVlY2hMaXN0W2pdLml0ZW1zW2tdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RGV0ZWN0aW9uSXRlbS5lbWl0ID09PSBfZW1pdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ29uRW5kJzogX29wdGlvbnMub25FbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbkVycm9yJzogX29wdGlvbnMub25FcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ29uU3RhcnQnOiBfb3B0aW9ucy5vblN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnb25QYXVzZSc6IF9vcHRpb25zLm9uUGF1c2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdvblJlc3VtZSc6IF9vcHRpb25zLm9uUmVzdW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZihfb3B0aW9ucy5zdGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwZWFrKGN1cnJlbnREZXRlY3Rpb25JdGVtLmFuc3dlcnMuc3VjY2Vzc1tNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogY3VycmVudERldGVjdGlvbkl0ZW0uYW5zd2Vycy5zdWNjZXNzLmxlbmd0aCkgKyAwKV0ucmVwbGFjZSgnI1JFUExBQ0UjJywgX29wdGlvbnMucmVwbGFjZSksIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwZWFrKGN1cnJlbnREZXRlY3Rpb25JdGVtLmFuc3dlcnMuZmFpbFtNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogY3VycmVudERldGVjdGlvbkl0ZW0uYW5zd2Vycy5mYWlsLmxlbmd0aCkgKyAwKV0ucmVwbGFjZSgnI1JFUExBQ0UjJywgX29wdGlvbnMucmVwbGFjZSksIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIlpiaTdnYlwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIl19
