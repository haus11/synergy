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
        console.log('not available');
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
    
    if (!('speechSynthesis' in window)) {
        console.log('not available');
    } else {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXHRob21pXFxTa3lEcml2ZVxcV29ya3NwYWNlXFxzeW5lcmd5XFxjbGllbnRcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L2FwcC9zY3JpcHRzL3NyYy9VaS5qcyIsIkM6L1VzZXJzL3Rob21pL1NreURyaXZlL1dvcmtzcGFjZS9zeW5lcmd5L2NsaWVudC9hcHAvc2NyaXB0cy9zcmMvY2VzaXVtV29ybGQuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL2dlc3R1cmVJbnRyby5qcyIsIkM6L1VzZXJzL3Rob21pL1NreURyaXZlL1dvcmtzcGFjZS9zeW5lcmd5L2NsaWVudC9hcHAvc2NyaXB0cy9zcmMvbGVhcENhbWVyYUNvbnRyb2xsZXIuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL2xlYXBDb25uZWN0b3IuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL21haW4uanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvYXBwL3NjcmlwdHMvc3JjL3NwZWVjaC5qc29uIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L2FwcC9zY3JpcHRzL3NyYy9zcGVlY2hSZWNvZ25pdGlvbi5qcyIsIkM6L1VzZXJzL3Rob21pL1NreURyaXZlL1dvcmtzcGFjZS9zeW5lcmd5L2NsaWVudC9hcHAvc2NyaXB0cy9zcmMvc3BlZWNoU3ludGhlc2lzLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiQzovVXNlcnMvdGhvbWkvU2t5RHJpdmUvV29ya3NwYWNlL3N5bmVyZ3kvY2xpZW50L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJDOi9Vc2Vycy90aG9taS9Ta3lEcml2ZS9Xb3Jrc3BhY2Uvc3luZXJneS9jbGllbnQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbHMgVWksICQgKi9cclxuXHJcbi8qKlxyXG4qIEV4cG9ydCBmb3IgcmVxdWlyZSBzdGF0ZW1hbnRcclxuKi9cclxubW9kdWxlLmV4cG9ydHMgPSBVaTtcclxuXHJcbi8qKlxyXG4qIENvbnN0cnVjdG9yXHJcbiovXHJcbmZ1bmN0aW9uIFVpKGNlc2l1bVdvcmxkKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR0aGlzLnN0cmluZ1RhYmxlID0gW107XHJcblx0dGhpcy5zdHJpbmdUYWJsZVsnZW4nXSA9IFtdO1xyXG5cdHRoaXMuc3RyaW5nVGFibGVbJ2VuJ11bJ3RvcG9EZWFjJ10gPSAnUmVsaWVmIG9mZic7XHJcblx0dGhpcy5jZXNpdW1Xb3JsZCA9IGNlc2l1bVdvcmxkO1xyXG5cclxuXHQkKCcjc3dpdGNoLXRvcG9ncmFwaHknKS50ZXh0KHRoaXMuc3RyaW5nVGFibGVbJ2VuJ11bJ3RvcG9EZWFjJ10pO1xyXG5cclxufVxyXG5cclxuVWkucHJvdG90eXBlLmNsb3NlV2VsY29tZUJveCA9IGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0JCgnLndlbGNvbWVib3gtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0JCgnI3dlbGNvbWVib3gsICNnZXN0dXJlLWludHJvJykuZmFkZU91dCg1MDApO1xyXG5cdH0pO1xyXG59O1xyXG5cclxuVWkucHJvdG90eXBlLnRvZ2dsZU1lbnUgPSBmdW5jdGlvbiAoKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHQkKCcjbWVudS10b2dnbGVyJykuY2xpY2soZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdCQoJyNtZW51LWVsZW1lbnRzJykuc2xpZGVUb2dnbGUoJ3Nsb3cnKTtcclxuXHR9KTtcclxufTtcclxuXHJcblVpLnByb3RvdHlwZS5jaGFuZ2VSZWxpZWYgPSBmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG5cdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYoJCgnI3N3aXRjaC10b3BvZ3JhcGh5JykudGV4dCgpID09PSAnUmVsaWVmIG9mZicpIHtcclxuXHRcdFx0JCgnI3N3aXRjaC10b3BvZ3JhcGh5JykucmVtb3ZlQ2xhc3MoXCJ0b3BvZ3JhcGh5LWluYWN0aXZlIHAtYnRuLWVycm9cIik7XHJcblx0XHRcdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLmFkZENsYXNzKFwidG9wb2dyYXBoeS1hY3RpdmUgcC1idG4tc3VjY1wiKTtcclxuXHRcdFx0JCgnI3N3aXRjaC10b3BvZ3JhcGh5JykudGV4dChcIlJlbGllZiBvblwiKTtcclxuXHRcdFx0X3RoaXMuY2VzaXVtV29ybGQuc2V0VGVycmFpbih0cnVlKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYoJCgnI3N3aXRjaC10b3BvZ3JhcGh5JykudGV4dCgpID09PSAnUmVsaWVmIG9uJyl7XHJcblx0XHRcdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLnJlbW92ZUNsYXNzKFwidG9wb2dyYXBoeS1hY3RpdmUgcC1idG4tc3VjY1wiKTtcclxuXHRcdFx0JCgnI3N3aXRjaC10b3BvZ3JhcGh5JykuYWRkQ2xhc3MoXCJ0b3BvZ3JhcGh5LWluYWN0aXZlIHAtYnRuLWVycm9cIik7XHJcblx0XHRcdCQoJyNzd2l0Y2gtdG9wb2dyYXBoeScpLnRleHQoXCJSZWxpZWYgb2ZmXCIpO1xyXG5cdFx0XHRfdGhpcy5jZXNpdW1Xb3JsZC5zZXRUZXJyYWluKGZhbHNlKTtcclxuXHRcdH1cclxuXHR9KTtcclxufTtcclxuXHJcblVpLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR0aGlzLmNsb3NlV2VsY29tZUJveCgpO1xyXG5cdHRoaXMudG9nZ2xlTWVudSgpO1xyXG5cdHRoaXMuY2hhbmdlUmVsaWVmKCk7XHJcbn07IiwiLyogZ2xvYmFscyBDZXNpdW0sIENlc2l1bVdvcmxkLCB3aW5kb3csICQsIG5hdmlnYXRvciAqL1xyXG5cclxuLyoqXHJcbiogRXhwb3J0IGZvciByZXF1aXJlIHN0YXRlbWFudFxyXG4qL1xyXG5tb2R1bGUuZXhwb3J0cyA9IENlc2l1bVdvcmxkO1xyXG5cclxuXHJcbi8qKlxyXG4qIENvbnN0cnVjdG9yXHJcbiovXHJcbmZ1bmN0aW9uIENlc2l1bVdvcmxkKF9zcGVlY2hSZWNvZ25pdGlvbiwgX3NwZWVjaFN5bnRoZXNpcykge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgX3RoaXMucHJvdmlkZXJWaWV3TW9kZWxzID0gW107XHJcbiAgICBfdGhpcy5wcm92aWRlclZpZXdNb2RlbHMucHVzaChuZXcgQ2VzaXVtLkltYWdlcnlQcm92aWRlclZpZXdNb2RlbCh7XHJcbiAgICAgICAgIG5hbWUgOiAnT3BlblN0cmVldE1hcCcsXHJcbiAgICAgICAgIGljb25VcmwgOiBDZXNpdW0uYnVpbGRNb2R1bGVVcmwoJy4uLy4uLy4uL2ltYWdlcy9vcGVuU3RyZWV0TWFwLnBuZycpLFxyXG4gICAgICAgICB0b29sdGlwIDogJ09wZW5TdHJlZXRNYXAgKE9TTSkgaXMgYSBjb2xsYWJvcmF0aXZlIHByb2plY3QgdG8gY3JlYXRlIGEgZnJlZSBlZGl0YWJsZSBtYXAgb2YgdGhlIHdvcmxkLlxcbmh0dHA6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcnLFxyXG4gICAgICAgICBjcmVhdGlvbkZ1bmN0aW9uIDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gbmV3IENlc2l1bS5PcGVuU3RyZWV0TWFwSW1hZ2VyeVByb3ZpZGVyKHtcclxuICAgICAgICAgICAgICAgICB1cmwgOiAnaHR0cDovL3RpbGUub3BlbnN0cmVldG1hcC5vcmcvJ1xyXG4gICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICB9KSk7XHJcblxyXG4gICAgIF90aGlzLnByb3ZpZGVyVmlld01vZGVscy5wdXNoKG5ldyBDZXNpdW0uSW1hZ2VyeVByb3ZpZGVyVmlld01vZGVsKHtcclxuICAgICAgICAgbmFtZSA6ICdibGFjayBtYXJibGUnLFxyXG4gICAgICAgICBpY29uVXJsIDogQ2VzaXVtLmJ1aWxkTW9kdWxlVXJsKCcuLi8uLi8uLi9pbWFnZXMvYmxhY2tNYXJibGUucG5nJyksXHJcbiAgICAgICAgIHRvb2x0aXAgOiAnVGhlIGxpZ2h0cyBvZiBjaXRpZXMgYW5kIHZpbGxhZ2VzIHRyYWNlIHRoZSBvdXRsaW5lcyBvZiBjaXZpbGl6YXRpb24gaW4gdGhpcyBnbG9iYWwgdmlldyBvZiB0aGUgRWFydGggYXQgbmlnaHQgYXMgc2VlbiBieSBOQVNBL05PQUFcXCdzIFN1b21pIE5QUCBzYXRlbGxpdGUuJyxcclxuICAgICAgICAgY3JlYXRpb25GdW5jdGlvbiA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgcmV0dXJuIG5ldyBDZXNpdW0uVGlsZU1hcFNlcnZpY2VJbWFnZXJ5UHJvdmlkZXIoe1xyXG4gICAgICAgICAgICAgICAgIHVybCA6ICdodHRwczovL2Nlc2l1bWpzLm9yZy9ibGFja21hcmJsZScsXHJcbiAgICAgICAgICAgICAgICAgbWF4aW11bUxldmVsIDogOCxcclxuICAgICAgICAgICAgICAgICBjcmVkaXQgOiAnQmxhY2sgTWFyYmxlIGltYWdlcnkgY291cnRlc3kgTkFTQSBFYXJ0aCBPYnNlcnZhdG9yeSdcclxuICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgfSkpO1xyXG5cclxuICAgICBfdGhpcy5wcm92aWRlclZpZXdNb2RlbHMucHVzaChuZXcgQ2VzaXVtLkltYWdlcnlQcm92aWRlclZpZXdNb2RlbCh7XHJcbiAgICAgICAgIG5hbWUgOiAnQmluZycsXHJcbiAgICAgICAgIGljb25VcmwgOiBDZXNpdW0uYnVpbGRNb2R1bGVVcmwoJy4uLy4uLy4uL2ltYWdlcy9iaW5nQWVyaWFsLnBuZycpLFxyXG4gICAgICAgICB0b29sdGlwIDogJ1RoZSBsaWdodHMgb2YgY2l0aWVzIGFuZCB2aWxsYWdlcyB0cmFjZSB0aGUgb3V0bGluZXMgb2YgY2l2aWxpemF0aW9uIGluIHRoaXMgZ2xvYmFsIHZpZXcgb2YgdGhlIEVhcnRoIGF0IG5pZ2h0IGFzIHNlZW4gYnkgTkFTQS9OT0FBXFwncyBTdW9taSBOUFAgc2F0ZWxsaXRlLicsXHJcbiAgICAgICAgIGNyZWF0aW9uRnVuY3Rpb24gOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgIHJldHVybiBuZXcgQ2VzaXVtLkJpbmdNYXBzSW1hZ2VyeVByb3ZpZGVyKHtcclxuICAgICAgICAgICAgICAgIHVybCA6ICdodHRwczovL2Rldi52aXJ0dWFsZWFydGgubmV0JyxcclxuICAgICAgICAgICAgICAgIG1hcFN0eWxlIDogQ2VzaXVtLkJpbmdNYXBzU3R5bGUuQUVSSUFMXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgfSkpO1xyXG5cclxuICBcclxuICAgIF90aGlzLndpZGdldCA9IG5ldyBDZXNpdW0uQ2VzaXVtV2lkZ2V0KCdjZXNpdW1Db250YWluZXInLCB7XHJcbiAgICAgICAgJ2ltYWdlcnlQcm92aWRlcic6IGZhbHNlLFxyXG4gICAgICAgIHNreUJveCA6IG5ldyBDZXNpdW0uU2t5Qm94KHtcclxuICAgICAgICAgICAgc291cmNlcyA6IHtcclxuICAgICAgICAgICAgICBwb3NpdGl2ZVggOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfcHguanBnJyxcclxuICAgICAgICAgICAgICBuZWdhdGl2ZVggOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfbXguanBnJyxcclxuICAgICAgICAgICAgICBwb3NpdGl2ZVkgOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfcHkuanBnJyxcclxuICAgICAgICAgICAgICBuZWdhdGl2ZVkgOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfbXkuanBnJyxcclxuICAgICAgICAgICAgICBwb3NpdGl2ZVogOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfcHouanBnJyxcclxuICAgICAgICAgICAgICBuZWdhdGl2ZVogOiAndGV4dHVyZXMvU2t5Qm94L1R5Y2hvU2t5bWFwSUkudDNfMDgxOTJ4MDQwOTZfODBfbXouanBnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgdXNlRGVmYXVsdFJlbmRlckxvb3A6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIF90aGlzLmxheWVycyA9IHRoaXMud2lkZ2V0LmNlbnRyYWxCb2R5LmltYWdlcnlMYXllcnM7XHJcbiAgICBfdGhpcy5iYXNlTGF5ZXJQaWNrZXIgPSBuZXcgQ2VzaXVtLkJhc2VMYXllclBpY2tlcignYmFzZUxheWVyQ29udGFpbmVyJywgdGhpcy5sYXllcnMsIHRoaXMucHJvdmlkZXJWaWV3TW9kZWxzKTtcclxuICAgIF90aGlzLmJhc2VMYXllclBpY2tlci52aWV3TW9kZWwuc2VsZWN0ZWRJdGVtID0gdGhpcy5wcm92aWRlclZpZXdNb2RlbHNbMl07XHJcbiAgICBfdGhpcy5nZW9Db2RlciA9IG5ldyBDZXNpdW0uR2VvY29kZXIoeydjb250YWluZXInIDogJ2Nlc2l1bUdlb2NvZGVyJywgJ3NjZW5lJyA6IHRoaXMud2lkZ2V0LnNjZW5lfSk7XHJcbiAgICBfdGhpcy5lbGxpcHNvaWQgPSB0aGlzLndpZGdldC5jZW50cmFsQm9keS5lbGxpcHNvaWQ7XHJcbiAgICBfdGhpcy5jZW50cmFsQm9keSA9IHRoaXMud2lkZ2V0LmNlbnRyYWxCb2R5O1xyXG4gICAgX3RoaXMuY2VudHJhbEJvZHkuZGVwdGhUZXN0QWdhaW5zdFRlcnJhaW4gPSB0cnVlO1xyXG4gIFxyXG5cclxuICAgIF90aGlzLndpZGdldC5zY2VuZS5jYW1lcmEucm90YXRlUmlnaHQgKDEuNzQ1MzI5MjUxOTk0MzI5NSk7XHJcbiAgICAgIFxyXG4gICAgX3RoaXMuY2VzaXVtVGVycmFpblByb3ZpZGVyTWVzaGVzID0gbmV3IENlc2l1bS5DZXNpdW1UZXJyYWluUHJvdmlkZXIoe1xyXG4gICAgICAgIHVybCA6ICdodHRwOi8vY2VzaXVtanMub3JnL3N0ay10ZXJyYWluL3RpbGVzZXRzL3dvcmxkL3RpbGVzJyxcclxuICAgICAgICBjcmVkaXQgOiAnVGVycmFpbiBkYXRhIGNvdXJ0ZXN5IEFuYWx5dGljYWwgR3JhcGhpY3MsIEluYy4nXHJcbiAgICB9KTtcclxuICAgIF90aGlzLmRlZmF1bHRUZXJyYWluUHJvdmlkZXIgPSB0aGlzLmNlbnRyYWxCb2R5LnRlcnJhaW5Qcm92aWRlcjtcclxuXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbiA9IF9zcGVlY2hSZWNvZ25pdGlvbjtcclxuICAgIF90aGlzLnNwZWVjaFN5bnRoZXNpcyA9IF9zcGVlY2hTeW50aGVzaXM7XHJcbiAgICBcclxuICAgIF90aGlzLmxhc3RMb2NhdGlvbiA9ICcnO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCduYXZpZ2F0ZVRvJywgZnVuY3Rpb24oZXZlbnQpXHJcbiAgICB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5hY3Rpb24pO1xyXG4gICAgICAgIF90aGlzLmZseVRvKGV2ZW50LmFjdGlvbik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbi5vbignc2VsZWN0TGF5ZXInLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmFjdGlvbik7XHJcbiAgICAgICAgX3RoaXMuY2hhbmdlTGF5ZXIoZXZlbnQuYWN0aW9uKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlRm9yd2FyZCcsIGZ1bmN0aW9uKGV2ZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgICAgICBfdGhpcy5tb3ZlKCdmb3J3YXJkJywgZXZlbnQuYWN0aW9uKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlQmFja3dhcmQnLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XHJcbiAgICAgICAgX3RoaXMubW92ZSgnYmFja3dhcmQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlVXAnLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XHJcbiAgICAgICAgX3RoaXMubW92ZSgndXAnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCdtb3ZlRG93bicsIGZ1bmN0aW9uKGV2ZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgICAgICBfdGhpcy5tb3ZlKCdkb3duJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbi5vbignbW92ZUxlZnQnLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XHJcbiAgICAgICAgX3RoaXMubW92ZSgnbGVmdCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgX3RoaXMuc3BlZWNoUmVjb2duaXRpb24ub24oJ21vdmVSaWdodCcsIGZ1bmN0aW9uKGV2ZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgICAgICBfdGhpcy5tb3ZlKCdyaWdodCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgX3RoaXMuc3BlZWNoUmVjb2duaXRpb24ub24oJ3NldFRlcnJhaW4nLCBmdW5jdGlvbihldmVudClcclxuICAgIHtcclxuICAgICAgICBpZihldmVudC5hY3Rpb24gPT09ICdlaW5zY2hhbHRlbicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfdGhpcy5zZXRUZXJyYWluKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKGV2ZW50LmFjdGlvbiA9PT0gJ2F1c3NjaGFsdGVuJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF90aGlzLnNldFRlcnJhaW4oZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBfdGhpcy5zcGVlY2hSZWNvZ25pdGlvbi5vbignaW5mb3JtYXRpb25SZXF1ZXN0JywgZnVuY3Rpb24oZXZlbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xyXG4gICAgICAgIF90aGlzLnJlYWRBYnN0cmFjdEZyb21XaWtpcGVkaWEoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIF90aGlzLnNwZWVjaFJlY29nbml0aW9uLm9uKCd0aGFua3MnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIF90aGlzLnNwZWVjaFN5bnRoZXNpcy5hbnN3ZXIoJ3RoYW5rcycsIHsnc3RhdGUnOiB0cnVlfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBfdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcblxyXG5DZXNpdW1Xb3JsZC5wcm90b3R5cGUuc2V0VGVycmFpbiA9IGZ1bmN0aW9uKF9zdGF0ZSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGlmKF9zdGF0ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNlbnRyYWxCb2R5LnRlcnJhaW5Qcm92aWRlciA9IHRoaXMuY2VzaXVtVGVycmFpblByb3ZpZGVyTWVzaGVzO1xyXG4gICAgICAgIHRoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignc2V0VGVycmFpbicsIHtcclxuICAgICAgICAgICAgJ3N0YXRlJzogdHJ1ZSwgXHJcbiAgICAgICAgICAgICdyZXBsYWNlJzogJ2Vpbmdlc2NoYWx0ZXQnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jZW50cmFsQm9keS50ZXJyYWluUHJvdmlkZXIgPSB0aGlzLmRlZmF1bHRUZXJyYWluUHJvdmlkZXI7XHJcbiAgICAgICAgdGhpcy5zcGVlY2hTeW50aGVzaXMuYW5zd2VyKCdzZXRUZXJyYWluJywge1xyXG4gICAgICAgICAgICAnc3RhdGUnOiB0cnVlLCBcclxuICAgICAgICAgICAgJ3JlcGxhY2UnOiAnYXVzZ2VzY2hhbHRldCdcclxuICAgICAgICB9KTtcclxuICAgIH0gIFxyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihfZGlyZWN0aW9uLCBfZmFjdG9yKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIF9mYWN0b3IgPSAxLjI7XHJcbiAgICB2YXIgbW92ZVJhdGUgPSB0aGlzLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyh0aGlzLndpZGdldC5zY2VuZS5jYW1lcmEucG9zaXRpb24pLmhlaWdodCAvIF9mYWN0b3I7XHJcblxyXG4gICAgc3dpdGNoKF9kaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgY2FzZSAnZm9yd2FyZCc6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLndpZGdldC5zY2VuZS5jYW1lcmEubW92ZUZvcndhcmQobW92ZVJhdGUpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSAnYmFja3dhcmQnOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQuc2NlbmUuY2FtZXJhLm1vdmVCYWNrd2FyZChtb3ZlUmF0ZSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLndpZGdldC5zY2VuZS5jYW1lcmEubW92ZVVwKG1vdmVSYXRlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQuc2NlbmUuY2FtZXJhLm1vdmVEb3duKG1vdmVSYXRlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQuc2NlbmUuY2FtZXJhLm1vdmVMZWZ0KG1vdmVSYXRlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkZ2V0LnNjZW5lLmNhbWVyYS5tb3ZlUmlnaHQobW92ZVJhdGUpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgX3RoaXMud2lkZ2V0LnJlc2l6ZSgpO1xyXG5cclxuICAgIC8vIFNldHVwIGEgbGlzdGVuZXIgb24gdGhlIGJyb3dzZXIgd2luZG93IHJlc2l6ZSBldmVudFxyXG4gICAgd2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24oKSB7IFxyXG4gICAgICBfdGhpcy53aWRnZXQucmVzaXplKCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmZseVRvTXlMb2NhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGZseShwb3NpdGlvbikge1xyXG4gICAgICAgIHZhciBkZXN0aW5hdGlvbiA9IENlc2l1bS5DYXJ0b2dyYXBoaWMuZnJvbURlZ3JlZXMocG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlLCAxMDAwLjApO1xyXG4gICAgICAgIGRlc3RpbmF0aW9uID0gX3RoaXMuZWxsaXBzb2lkLmNhcnRvZ3JhcGhpY1RvQ2FydGVzaWFuKGRlc3RpbmF0aW9uKTtcclxuXHJcbiAgICAgICAgdmFyIGZsaWdodCA9IENlc2l1bS5DYW1lcmFGbGlnaHRQYXRoLmNyZWF0ZUFuaW1hdGlvbihfdGhpcy53aWRnZXQuc2NlbmUsIHtcclxuICAgICAgICAgICAgZGVzdGluYXRpb24gOiBkZXN0aW5hdGlvblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIF90aGlzLndpZGdldC5zY2VuZS5hbmltYXRpb25zLmFkZChmbGlnaHQpO1xyXG4gICAgICAgIF90aGlzLnNwZWVjaFN5bnRoZXNpcy5zcGVhaygnSWNoIGhhYmUgZGljaCBnZWZ1bmRlbi4nKTtcclxuICAgIH1cclxuXHJcbiAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZseSk7XHJcbn07XHJcblxyXG5DZXNpdW1Xb3JsZC5wcm90b3R5cGUuZmx5VG8gPSBmdW5jdGlvbihfbG9jYXRpb24pIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIFxyXG4gICAgaWYoX2xvY2F0aW9uLnRvTG93ZXJDYXNlKCkgPT09ICdtaWNoJylcclxuICAgIHtcclxuICAgICAgICB0aGlzLmZseVRvTXlMb2NhdGlvbigpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdlb0NvZGVyLnZpZXdNb2RlbC5zZWFyY2hUZXh0ID0gX2xvY2F0aW9uO1xyXG4gICAgdGhpcy5nZW9Db2Rlci52aWV3TW9kZWwuc2VhcmNoKCk7XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB2YXIgc2VhcmNoUmVzdWx0ID0gX3RoaXMuZ2VvQ29kZXIudmlld01vZGVsLnNlYXJjaFRleHQ7XHJcblxyXG4gICAgICAgIGlmKHNlYXJjaFJlc3VsdC5pbmRleE9mKCcobm90IGZvdW5kKScpICE9PSAtMSkge1xyXG5cclxuICAgICAgICAgICAgX3RoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignbmF2aWdhdGVUbycsIHtcclxuICAgICAgICAgICAgICAgICdzdGF0ZScgOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICdyZXBsYWNlJyA6IF9sb2NhdGlvblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX3RoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignbmF2aWdhdGVUbycsIHRydWUsIF9sb2NhdGlvbik7XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5zcGVlY2hTeW50aGVzaXMuYW5zd2VyKCduYXZpZ2F0ZVRvJywge1xyXG4gICAgICAgICAgICAgICAgJ3N0YXRlJyA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAncmVwbGFjZScgOiBfbG9jYXRpb25cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfdGhpcy5sYXN0TG9jYXRpb24gPSBfbG9jYXRpb247XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LCAxMDAwKTtcclxufTtcclxuXHJcbkNlc2l1bVdvcmxkLnByb3RvdHlwZS5yZWFkQWJzdHJhY3RGcm9tV2lraXBlZGlhID0gZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIFxyXG4gICAgJC5hamF4KHtcclxuICAgICAgZGF0YVR5cGU6IFwianNvbnBcIixcclxuICAgICAgdXJsOiBcImh0dHBzOi8vZGUud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXF1ZXJ5JnByb3A9ZXh0cmFjdHMmZm9ybWF0PWpzb24mZXhpbnRybz0mdGl0bGVzPVwiICsgX3RoaXMubGFzdExvY2F0aW9uLFxyXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgdmFyIGZpcnN0O1xyXG4gICAgICAgICAgdmFyIHNwbGl0dGVkO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBkYXRhLnF1ZXJ5LnBhZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5xdWVyeS5wYWdlcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IGRhdGEucXVlcnkucGFnZXNbcHJvcGVydHldO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vX3RoaXMuc3BlZWNoU3ludGhlc2lzLnNwZWFrKGZpcnN0LmV4dHJhY3QucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpLnNwbGl0KFwiLlwiKVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgc3BsaXR0ZWQgPSBmaXJzdC5leHRyYWN0LnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKTsvLy5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3BsaXR0ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfdGhpcy5zcGVlY2hTeW50aGVzaXMuc3BlYWsoc3BsaXR0ZWQpO1xyXG4gICAgfX0pO1xyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmdldEluZm9ybWF0aW9uRnJvbVdpa2lwZWRpYSA9IGZ1bmN0aW9uKF9yZXNvdXJjZSkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciByZXNvdXJjZSA9ICBfcmVzb3VyY2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBfcmVzb3VyY2Uuc2xpY2UoMSk7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgXHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgIGNyb3NzRG9tYWluIDogdHJ1ZSxcclxuICAgICAgdXJsOiBcImh0dHA6Ly9kYnBlZGlhLm9yZy9kYXRhL1wiICsgcmVzb3VyY2UgKyBcIi5qc29uXCIsXHJcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB2YXIgYWJzdHJhY3RMaXN0ID0gZGF0YVsnaHR0cDovL2RicGVkaWEub3JnL3Jlc291cmNlLycgKyByZXNvdXJjZV1bJ2h0dHA6Ly9kYnBlZGlhLm9yZy9vbnRvbG9neS9hYnN0cmFjdCddO1xyXG4gICAgICAgICAgdmFyIGFic3RyYWN0ID0gJyc7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhYnN0cmFjdExpc3QubGVuZ3RoOyArK2kpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgaWYoYWJzdHJhY3RMaXN0W2ldLmxhbmcgPT09ICdkZScpXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBhYnN0cmFjdCA9IGFic3RyYWN0TGlzdFtpXS52YWx1ZS5zdWJzdHJpbmcoMCwgMTAwKTtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBfdGhpcy5zcGVlY2hTeW50aGVzaXMuc3BlYWsoYWJzdHJhY3QpO1xyXG4gICAgfX0pO1xyXG59O1xyXG5cclxuQ2VzaXVtV29ybGQucHJvdG90eXBlLmNoYW5nZUxheWVyID0gZnVuY3Rpb24oX2xheWVyKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucHJvdmlkZXJWaWV3TW9kZWxzLmxlbmd0aDsgKytpKVxyXG4gICAge1xyXG4gICAgICAgIGlmKHRoaXMucHJvdmlkZXJWaWV3TW9kZWxzW2ldLm5hbWUgPT09IF9sYXllcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFzZUxheWVyUGlja2VyLnZpZXdNb2RlbC5zZWxlY3RlZEl0ZW0gPSB0aGlzLnByb3ZpZGVyVmlld01vZGVsc1tpXTtcclxuICAgICAgICAgICAgdGhpcy5zcGVlY2hTeW50aGVzaXMuYW5zd2VyKCdzZWxlY3RMYXllcicsIHtcclxuICAgICAgICAgICAgICAgICdzdGF0ZSc6IHRydWUsIFxyXG4gICAgICAgICAgICAgICAgJ3JlcGxhY2UnOiB0aGlzLnByb3ZpZGVyVmlld01vZGVsc1tpXS5uYW1lXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3BlZWNoU3ludGhlc2lzLmFuc3dlcignc2VsZWN0TGF5ZXInLCB7XHJcbiAgICAgICAgJ3N0YXRlJzogZmFsc2UsIFxyXG4gICAgICAgICdyZXBsYWNlJzpfbGF5ZXJ9KTtcclxufTtcclxuXHJcblxyXG5DZXNpdW1Xb3JsZC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIHRoaXMud2lkZ2V0LnJlbmRlcigpO1xyXG59OyIsIi8qIGdsb2JhbHMgR2VzdHVyZUludHJvLCAkICovXHJcblxyXG4vKipcclxuKiBFeHBvcnQgZm9yIHJlcXVpcmUgc3RhdGVtYW50XHJcbiovXHJcbm1vZHVsZS5leHBvcnRzID0gR2VzdHVyZUludHJvO1xyXG5cclxuLyoqXHJcbiogQ29uc3RydWN0b3JcclxuKi9cclxuZnVuY3Rpb24gR2VzdHVyZUludHJvKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0dGhpcy5zbGlkZXMgPSBbXTtcclxuXHR0aGlzLmN1cnJlbnRTbGlkZSAgID0gMDtcclxuXHR0aGlzLm51bWJlck9mU2xpZGVzID0gMDtcclxufVxyXG5cclxuR2VzdHVyZUludHJvLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG5cdC8vIEdldCBhbGwgdHV0b3JpYWwgc2xpZGVzXHJcblx0X3RoaXMuc2xpZGVzID0gJCgnLmludHJvLWVsZW1lbnQnKTtcclxuXHRfdGhpcy5udW1iZXJPZlNsaWRlcyA9IF90aGlzLnNsaWRlcy5sZW5ndGg7XHJcblxyXG5cclxuXHQkKCcjYnRuLXN0YXJ0LXR1dG9yaWFsJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHQkKCcjc2xpZGUtd2VsY29tZScpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly8gU2V0IHRoZSBzbGlkZSB0aXRsZSBhbmQgZGVzY3JpcHRpb25cclxuXHRcdFx0X3RoaXMuY2hhbmdlU2xpZGVJbmZvKF90aGlzLmN1cnJlbnRTbGlkZSk7XHJcblxyXG5cdFx0XHQkKCcjc2xpZGUtdHV0b3JpYWwnKS5mYWRlSW4oNTAwLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHQvLyBTaG93IHRoZSBnZXN0dXJlIGJveFxyXG5cdFx0XHRcdCQoJyNnZXN0dXJlLWludHJvJykuc2hvdygpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHQkKCcjaW50cm8tbmV4dCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdF90aGlzLmN1cnJlbnRTbGlkZSsrO1xyXG5cclxuXHRcdGlmICgoX3RoaXMuY3VycmVudFNsaWRlICsgMSkgPT09IF90aGlzLm51bWJlck9mU2xpZGVzKSB7XHJcblx0XHRcdCQoJyNpbnRyby1uZXh0JykuaGlkZSgpO1xyXG5cdFx0XHQkKCcud2VsY29tZWJveC1jbG9zZScpLnNob3coKTtcclxuXHRcdH1cclxuXHJcblx0XHQkKCcjc2xpZGUtaW5mbycpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdF90aGlzLmNoYW5nZVNsaWRlSW5mbyhfdGhpcy5jdXJyZW50U2xpZGUpO1xyXG5cclxuXHRcdFx0JCgnI3NsaWRlLWluZm8nKS5mYWRlSW4oNTAwKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoX3RoaXMuc2xpZGVzW190aGlzLmN1cnJlbnRTbGlkZS0xXSkuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQkKF90aGlzLnNsaWRlc1tfdGhpcy5jdXJyZW50U2xpZGVdKS5zaG93KCk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufTtcclxuXHJcbkdlc3R1cmVJbnRyby5wcm90b3R5cGUuY2hhbmdlU2xpZGVJbmZvID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHZhciB0aXRsZSAgICAgICA9ICQodGhpcy5zbGlkZXNbaW5kZXhdKS5kYXRhKCd0aXRsZScpO1xyXG5cdHZhciBkZXNjcmlwdGlvbiA9ICQodGhpcy5zbGlkZXNbaW5kZXhdKS5kYXRhKCdkZXNjcmlwdGlvbicpO1xyXG5cclxuXHQkKCcjc2xpZGUtdGl0bGUnKS50ZXh0KHRpdGxlKTtcclxuXHQkKCcjc2xpZGUtZGVzY3JpcHRpb24nKS50ZXh0KGRlc2NyaXB0aW9uKTtcclxufTsiLCIvKiBnbG9iYWxzIExlYXBDYW1lcmFDb250cm9sbGVyLCBDZXNpdW0gKi9cclxuXHJcbi8qKlxyXG4qIEV4cG9ydCBmb3IgcmVxdWlyZSBzdGF0ZW1hbnRcclxuKi9cclxubW9kdWxlLmV4cG9ydHMgPSBMZWFwQ2FtZXJhQ29udHJvbGxlcjtcclxuXHJcblxyXG5mdW5jdGlvbiBMZWFwQ2FtZXJhQ29udHJvbGxlcihjYW1lcmEsIGVsbGlwc29pZCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdGhpcy5jYW1lcmEgICAgPSBjYW1lcmE7XHJcbiAgdGhpcy5lbGxpcHNvaWQgPSBlbGxpcHNvaWQ7XHJcblxyXG4gIC8vIGFwaVxyXG4gIHRoaXMuZW5hYmxlZCAgICAgID0gdHJ1ZTtcclxuICB0aGlzLnRhcmdldCAgICAgICA9IG5ldyBDZXNpdW0uQ2FydGVzaWFuMygwLCAwLCAwKTtcclxuICB0aGlzLnN0ZXAgICAgICAgICA9IChjYW1lcmEucG9zaXRpb24ueiA9PT0gMCA/IE1hdGgucG93KDEwLCAoTWF0aC5sb2coY2FtZXJhLmZydXN0dW0ubmVhcikgKyBNYXRoLmxvZyhjYW1lcmEuZnJ1c3R1bS5mYXIpKS9NYXRoLmxvZygxMCkpLzEwLjAgOiBjYW1lcmEucG9zaXRpb24ueik7XHJcbiAgdGhpcy5maW5nZXJGYWN0b3IgPSAyO1xyXG4gIHRoaXMuc3RhcnRaICAgICAgID0gdGhpcy5jYW1lcmEucG9zaXRpb24uejtcclxuICB0aGlzLmNvbnRyb2xNb2RlICA9ICdzdGFuZGFyZCc7IC8vICdzdGFuZGFyZCcgb3IgJ2ZsaWdodCdcclxuXHJcblxyXG4gIC8vIGAuLi5IYW5kc2AgICAgICAgOiBpbnRlZ2VyIG9yIHJhbmdlIGdpdmVuIGFzIGFuIGFycmF5IG9mIGxlbmd0aCAyXHJcbiAgLy8gYC4uLkZpbmdlcnNgICAgICA6IGludGVnZXIgb3IgcmFuZ2UgZ2l2ZW4gYXMgYW4gYXJyYXkgb2YgbGVuZ3RoIDJcclxuICAvLyBgLi4uUmlnaHRIYW5kZWRgIDogYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gdXNlIGxlZnQgb3IgcmlnaHQgaGFuZCBmb3IgY29udHJvbGxpbmcgKGlmIG51bWJlciBvZiBoYW5kcyA+IDEpXHJcbiAgLy8gYC4uLkhhbmRQb3NpdGlvbmA6IGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSBwYWxtIHBvc2l0aW9uIG9yIGZpbmdlciB0aXAgcG9zaXRpb24gKGlmIG51bWJlciBvZiBmaW5nZXJzID09IDEpXHJcbiAgLy8gYC4uLlN0YWJpbGl6ZWRgICA6IGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSBzdGFiaWxpemVkIHBhbG0vZmluZ2VyIHRpcCBwb3NpdGlvbiBvciBub3RcclxuXHJcbiAgLy8gcm90YXRpb25cclxuICB0aGlzLnJvdGF0ZUVuYWJsZWQgICAgICAgPSB0cnVlO1xyXG4gIHRoaXMucm90YXRlU3BlZWQgICAgICAgICA9IDIuMDtcclxuICB0aGlzLnJvdGF0ZUhhbmRzICAgICAgICAgPSAxO1xyXG4gIHRoaXMucm90YXRlRmluZ2VycyAgICAgICA9IFsyLCAzXTsgXHJcbiAgdGhpcy5yb3RhdGVSaWdodEhhbmRlZCAgID0gdHJ1ZTtcclxuICB0aGlzLnJvdGF0ZUhhbmRQb3NpdGlvbiAgPSB0cnVlO1xyXG4gIHRoaXMucm90YXRlU3RhYmlsaXplZCAgICA9IHRydWU7XHJcbiAgdGhpcy5yb3RhdGVNaW4gICAgICAgICAgID0gMDtcclxuICB0aGlzLnJvdGF0ZU1heCAgICAgICAgICAgPSBNYXRoLlBJO1xyXG4gIHRoaXMucm90YXRlU3BlZWRJbml0ICAgICA9IHRoaXMucm90YXRlU3BlZWQ7XHJcbiAgXHJcbiAgLy8gem9vbVxyXG4gIHRoaXMuem9vbUVuYWJsZWQgICAgICAgICA9IHRydWU7XHJcbiAgdGhpcy56b29tU3BlZWQgICAgICAgICAgID0gNC4wO1xyXG4gIHRoaXMuem9vbUhhbmRzICAgICAgICAgICA9IDE7XHJcbiAgdGhpcy56b29tRmluZ2VycyAgICAgICAgID0gWzQsIDVdO1xyXG4gIHRoaXMuem9vbVJpZ2h0SGFuZGVkICAgICA9IHRydWU7XHJcbiAgdGhpcy56b29tSGFuZFBvc2l0aW9uICAgID0gdHJ1ZTtcclxuICB0aGlzLnpvb21TdGFiaWxpemVkICAgICAgPSB0cnVlO1xyXG4gIHRoaXMuem9vbUluTWF4ICAgICAgICAgICA9IDUwO1xyXG4gIHRoaXMuem9vbU91dE1heCAgICAgICAgICA9IDUwMDAwMDAwO1xyXG4gIHRoaXMuem9vbU1vdmVSYXRlRmFjdG9yICA9IDMwO1xyXG4gIFxyXG4gIC8vIHBhblxyXG4gIHRoaXMucGFuRW5hYmxlZCAgICAgICAgICA9IHRydWU7XHJcbiAgdGhpcy5wYW5TcGVlZCAgICAgICAgICAgID0gMy4wO1xyXG4gIHRoaXMucGFuSGFuZHMgICAgICAgICAgICA9IDI7XHJcbiAgdGhpcy5wYW5GaW5nZXJzICAgICAgICAgID0gWzYsIDEyXTtcclxuICB0aGlzLnBhblJpZ2h0SGFuZGVkICAgICAgPSB0cnVlO1xyXG4gIHRoaXMucGFuSGFuZFBvc2l0aW9uICAgICA9IHRydWU7XHJcbiAgdGhpcy5wYW5TdGFiaWxpemVkICAgICAgID0gdHJ1ZTtcclxuICB0aGlzLnBhblNwZWVkSW5pdCAgICAgICAgPSB0aGlzLnBhblNwZWVkO1xyXG4gIC8vIGNhbWVyYSBoZWlnaHQgYmVmb3JlIHBhbm5pbmdcclxuICB0aGlzLmNhbWVyYUhlaWdodFpvb20gICAgPSBudWxsO1xyXG4gIFxyXG4gIC8vIGludGVybmFsc1xyXG4gIHRoaXMucm90YXRlWExhc3QgICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5yb3RhdGVZTGFzdCAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLnpvb21aTGFzdCAgICAgICAgICAgPSBudWxsO1xyXG4gIHRoaXMucGFuWExhc3QgICAgICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5wYW5ZTGFzdCAgICAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLnBhblpMYXN0ICAgICAgICAgICAgPSBudWxsOyAgXHJcbn0gIFxyXG4gIFxyXG4gIFxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUudHJhbnNmb3JtRmFjdG9yID0gZnVuY3Rpb24oYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICBjYXNlICdyb3RhdGUnOlxyXG4gICAgICByZXR1cm4gdGhpcy5yb3RhdGVTcGVlZCAqICh0aGlzLnJvdGF0ZUhhbmRQb3NpdGlvbiA/IDEgOiB0aGlzLmZpbmdlckZhY3Rvcik7XHJcbiAgICBjYXNlICd6b29tJzpcclxuICAgICAgcmV0dXJuIHRoaXMuem9vbVNwZWVkICogKHRoaXMuem9vbUhhbmRQb3NpdGlvbiA/IDEgOiB0aGlzLmZpbmdlckZhY3Rvcik7XHJcbiAgICBjYXNlICdwYW4nOlxyXG4gICAgICByZXR1cm4gdGhpcy5wYW5TcGVlZCAqICh0aGlzLnBhbkhhbmRQb3NpdGlvbiA/IDEgOiB0aGlzLmZpbmdlckZhY3Rvcik7XHJcbiAgfVxyXG59O1xyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLm1hcExpbmVhciA9IGZ1bmN0aW9uKHgsIGExLCBhMiwgYjEsIGIyKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHJldHVybiBiMSArICggeCAtIGExICkgKiAoIGIyIC0gYjEgKSAvICggYTIgLSBhMSApO1xyXG59O1xyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnJvdGF0ZVRyYW5zZm9ybSA9IGZ1bmN0aW9uKGRlbHRhKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHJldHVybiB0aGlzLnRyYW5zZm9ybUZhY3Rvcigncm90YXRlJykgKiB0aGlzLm1hcExpbmVhcihkZWx0YSwgLTQwMCwgNDAwLCAtTWF0aC5QSSwgTWF0aC5QSSk7XHJcbn07XHJcblxyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnpvb21UcmFuc2Zvcm0gPSBmdW5jdGlvbihkZWx0YSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICByZXR1cm4gdGhpcy50cmFuc2Zvcm1GYWN0b3IoJ3pvb20nKSAqIHRoaXMubWFwTGluZWFyKGRlbHRhLCAtNDAwLCA0MDAsIC10aGlzLnN0ZXAsIHRoaXMuc3RlcCk7XHJcbn07XHJcblxyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnBhblRyYW5zZm9ybSA9IGZ1bmN0aW9uKGRlbHRhKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHJldHVybiB0aGlzLnRyYW5zZm9ybUZhY3RvcigncGFuJykgKiB0aGlzLm1hcExpbmVhcihkZWx0YSwgLTQwMCwgNDAwLCAtdGhpcy5zdGVwLCB0aGlzLnN0ZXApO1xyXG59O1xyXG5cclxuXHJcbkxlYXBDYW1lcmFDb250cm9sbGVyLnByb3RvdHlwZS5hcHBseUdlc3R1cmUgPSBmdW5jdGlvbihmcmFtZSwgYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgaGwgICAgPSBmcmFtZS5oYW5kcy5sZW5ndGg7XHJcbiAgdmFyIGZsICAgID0gZnJhbWUucG9pbnRhYmxlcy5sZW5ndGg7XHJcblxyXG4gIHN3aXRjaChhY3Rpb24pIHtcclxuICAgIGNhc2UgJ3JvdGF0ZSc6XHJcbiAgICAgIGlmICh0aGlzLnJvdGF0ZUhhbmRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3RhdGVGaW5nZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnJvdGF0ZUhhbmRzWzBdIDw9IGhsICYmIGhsIDw9IHRoaXMucm90YXRlSGFuZHNbMV0gJiYgdGhpcy5yb3RhdGVGaW5nZXJzWzBdIDw9IGZsICYmIGZsIDw9IHRoaXMucm90YXRlRmluZ2Vyc1sxXSkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5yb3RhdGVIYW5kc1swXSA8PSBobCAmJiBobCA8PSB0aGlzLnJvdGF0ZUhhbmRzWzFdICYmIHRoaXMucm90YXRlRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLnJvdGF0ZUZpbmdlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucm90YXRlSGFuZHMgPT09IGhsICYmIHRoaXMucm90YXRlRmluZ2Vyc1swXSA8PSBmbCAmJiBmbCA8PSB0aGlzLnJvdGF0ZUZpbmdlcnNbMV0pIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMucm90YXRlSGFuZHMgPT09IGhsICYmIHRoaXMucm90YXRlRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICd6b29tJzpcclxuICAgICAgaWYgKHRoaXMuem9vbUhhbmRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBpZiAodGhpcy56b29tRmluZ2VycyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICBpZiAodGhpcy56b29tSGFuZHNbMF0gPD0gaGwgJiYgaGwgPD0gdGhpcy56b29tSGFuZHNbMV0gJiYgdGhpcy56b29tRmluZ2Vyc1swXSA8PSBmbCAmJiBmbCA8PSB0aGlzLnpvb21GaW5nZXJzWzFdKSB7IFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGlmICh0aGlzLnpvb21IYW5kc1swXSA8PSBobCAmJiBobCA8PSB0aGlzLnpvb21IYW5kc1sxXSAmJiB0aGlzLnpvb21GaW5nZXJzID09PSBmbCkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMuem9vbUZpbmdlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuem9vbUhhbmRzID09PSBobCAmJiB0aGlzLnpvb21GaW5nZXJzWzBdIDw9IGZsICYmIGZsIDw9IHRoaXMuem9vbUZpbmdlcnNbMV0pIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMuem9vbUhhbmRzID09PSBobCAmJiB0aGlzLnpvb21GaW5nZXJzID09PSBmbCkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ3Bhbic6XHJcbiAgICAgIGlmICh0aGlzLnBhbkhhbmRzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBpZiAodGhpcy5wYW5GaW5nZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnBhbkhhbmRzWzBdIDw9IGhsICYmIGhsIDw9IHRoaXMucGFuSGFuZHNbMV0gJiYgdGhpcy5wYW5GaW5nZXJzWzBdIDw9IGZsICYmIGZsIDw9IHRoaXMucGFuRmluZ2Vyc1sxXSkgeyBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5wYW5IYW5kc1swXSA8PSBobCAmJiBobCA8PSB0aGlzLnBhbkhhbmRzWzFdICYmIHRoaXMucGFuRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICh0aGlzLnBhbkZpbmdlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucGFuSGFuZHMgPT09IGhsICYmIHRoaXMucGFuRmluZ2Vyc1swXSA8PSBmbCAmJiBmbCA8PSB0aGlzLnBhbkZpbmdlcnNbMV0pIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHRoaXMucGFuSGFuZHMgPT09IGhsICYmIHRoaXMucGFuRmluZ2VycyA9PT0gZmwpIHsgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLmhhbmQgPSBmdW5jdGlvbihmcmFtZSwgYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgaGRzID0gZnJhbWUuaGFuZHM7XHJcbiAgIFxyXG4gICAgaWYgKGhkcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGlmIChoZHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGhkc1swXTtcclxuICAgICAgfSBlbHNlIGlmIChoZHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgdmFyIGxoLCByaDtcclxuICAgICAgICBpZiAoaGRzWzBdLnBhbG1Qb3NpdGlvblswXSA8IGhkc1sxXS5wYWxtUG9zaXRpb25bMF0pIHtcclxuICAgICAgICAgIGxoID0gaGRzWzBdO1xyXG4gICAgICAgICAgcmggPSBoZHNbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxoID0gaGRzWzFdO1xyXG4gICAgICAgICAgcmggPSBoZHNbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgICBjYXNlICdyb3RhdGUnOlxyXG4gICAgICAgICAgICBpZiAodGhpcy5yb3RhdGVSaWdodEhhbmRlZCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiByaDtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGxoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnem9vbSc6XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnpvb21SaWdodEhhbmRlZCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiByaDtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGxoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncGFuJzpcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFuUmlnaHRIYW5kZWQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcmg7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIHJldHVybiBsaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihmcmFtZSwgYWN0aW9uKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIC8vIGFzc2VydGlvbjogaWYgYC4uLkhhbmRQb3NpdGlvbmAgaXMgZmFsc2UsIHRoZW4gYC4uLkZpbmdlcnNgIG5lZWRzIHRvIGJlIDEgb3IgWzEsIDFdXHJcbiAgdmFyIGg7XHJcbiAgc3dpdGNoKGFjdGlvbikge1xyXG4gICAgY2FzZSAncm90YXRlJzpcclxuICAgICAgaCA9IHRoaXMuaGFuZChmcmFtZSwgJ3JvdGF0ZScpO1xyXG4gICAgICByZXR1cm4gKHRoaXMucm90YXRlSGFuZFBvc2l0aW9uID8gKHRoaXMucm90YXRlU3RhYmlsaXplZCA/IGguc3RhYmlsaXplZFBhbG1Qb3NpdGlvbiA6IGgucGFsbVBvc2l0aW9uKSBcclxuICAgICAgICA6ICh0aGlzLnJvdGF0ZVN0YWJpbGl6ZWQgPyBmcmFtZS5wb2ludGFibGVzWzBdLnN0YWJpbGl6ZWRUaXBQb3NpdGlvbiA6IGZyYW1lLnBvaW50YWJsZXNbMF0udGlwUG9zaXRpb24pXHJcbiAgICAgICk7XHJcbiAgICBjYXNlICd6b29tJzpcclxuICAgICAgaCA9IHRoaXMuaGFuZChmcmFtZSwgJ3pvb20nKTtcclxuICAgICAgcmV0dXJuICh0aGlzLnpvb21IYW5kUG9zaXRpb24gPyAodGhpcy56b29tU3RhYmlsaXplZCA/IGguc3RhYmlsaXplZFBhbG1Qb3NpdGlvbiA6IGgucGFsbVBvc2l0aW9uKSBcclxuICAgICAgICA6ICh0aGlzLnpvb21TdGFiaWxpemVkID8gZnJhbWUucG9pbnRhYmxlc1swXS5zdGFiaWxpemVkVGlwUG9zaXRpb24gOiBmcmFtZS5wb2ludGFibGVzWzBdLnRpcFBvc2l0aW9uKVxyXG4gICAgICApO1xyXG4gICAgY2FzZSAncGFuJzpcclxuICAgICAgaCA9IHRoaXMuaGFuZChmcmFtZSwgJ3BhbicpO1xyXG4gICAgICByZXR1cm4gKHRoaXMucGFuSGFuZFBvc2l0aW9uID8gKHRoaXMucGFuU3RhYmlsaXplZCA/IGguc3RhYmlsaXplZFBhbG1Qb3NpdGlvbiA6IGgucGFsbVBvc2l0aW9uKSBcclxuICAgICAgICA6ICh0aGlzLnBhblN0YWJpbGl6ZWQgPyBmcmFtZS5wb2ludGFibGVzWzBdLnN0YWJpbGl6ZWRUaXBQb3NpdGlvbiA6IGZyYW1lLnBvaW50YWJsZXNbMF0udGlwUG9zaXRpb24pXHJcbiAgICAgICk7XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbkxlYXBDYW1lcmFDb250cm9sbGVyLnByb3RvdHlwZS5yb3RhdGVDYW1lcmEgPSBmdW5jdGlvbihmcmFtZSkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgaWYgKHRoaXMucm90YXRlRW5hYmxlZCAmJiB0aGlzLmFwcGx5R2VzdHVyZShmcmFtZSwgJ3JvdGF0ZScpKSB7XHJcbiAgICAgIC8vIGlmIGZseSB0byBtb2R1cyB3YXMgdXNlZCwgY2hhbmdlIHggYW5kIHkgYW5kIGZpeCB0aGUgaW52ZXJ0ZWQgbmV3IHhcclxuICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uKGZyYW1lLCAncm90YXRlJylbMF07XHJcbiAgICAgXHJcbiAgICAgIGlmICghdGhpcy5yb3RhdGVZTGFzdCkge1xyXG4gICAgICAgIHRoaXMucm90YXRlWUxhc3QgPSB5O1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB5RGVsdGEgPSB5IC0gdGhpcy5yb3RhdGVZTGFzdDtcclxuICAgICAgXHJcbiAgICAgIHZhciBuID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIHJvdGF0ZSBhcm91bmQgYXhpcyBpbiB4eS1wbGFuZSAoaW4gdGFyZ2V0IGNvb3JkaW5hdGUgc3lzdGVtKSB3aGljaCBpcyBvcnRob2dvbmFsIHRvIGNhbWVyYSB2ZWN0b3JcclxuICAgICAgdmFyIHQgPSBuZXcgQ2VzaXVtLkNhcnRlc2lhbjMuc3VidHJhY3QodGhpcy5jYW1lcmEucG9zaXRpb24sIHRoaXMudGFyZ2V0KTtcclxuICAgICAgLy92YXIgdCA9IG5ldyBUSFJFRS5WZWN0b3IzKCkuc3ViVmVjdG9ycyh0aGlzLmNhbWVyYS5wb3NpdGlvbiwgdGhpcy50YXJnZXQpOyAvLyB0cmFuc2xhdGVcclxuICAgICAgdmFyIGFuZ2xlRGVsdGEgPSB0aGlzLnJvdGF0ZVRyYW5zZm9ybSh5RGVsdGEpO1xyXG5cclxuICAgICAgdmFyIG5ld0FuZ2xlID0gQ2VzaXVtLkNhcnRlc2lhbjMuYW5nbGVCZXR3ZWVuKHQsIG5ldyBDZXNpdW0uQ2FydGVzaWFuMygwLCAxLCAwKSk7XHJcbiAgICAgIC8vdmFyIG5ld0FuZ2xlID0gdC5hbmdsZVRvKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEsIDApKSArIGFuZ2xlRGVsdGE7XHJcblxyXG4gICAgICBpZiAodGhpcy5yb3RhdGVNaW4gPCBuZXdBbmdsZSAmJiBuZXdBbmdsZSA8IHRoaXMucm90YXRlTWF4KSB7XHJcbiAgICAgICAgbiA9IENlc2l1bS5DYXJ0ZXNpYW4zLm5vcm1hbGl6ZShuZXcgQ2VzaXVtLkNhcnRlc2lhbjModC56LCAwLCAtdC54KSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhLnJvdGF0ZShuLCAtYW5nbGVEZWx0YSk7ICAgXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB4ID0gLXRoaXMucG9zaXRpb24oZnJhbWUsICdyb3RhdGUnKVsxXTtcclxuICAgICAgLy8gcm90YXRlIGFyb3VuZCB5LWF4aXMgdHJhbnNsYXRlZCBieSB0YXJnZXQgdmVjdG9yXHJcbiAgICAgIGlmICghdGhpcy5yb3RhdGVYTGFzdCkge1xyXG4gICAgICAgIHRoaXMucm90YXRlWExhc3QgPSB4O1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB4RGVsdGEgPSB4IC0gdGhpcy5yb3RhdGVYTGFzdDtcclxuICAgICAgXHJcbiAgICAgIGFuZ2xlRGVsdGEgPSB0aGlzLnJvdGF0ZVRyYW5zZm9ybSh4RGVsdGEpO1xyXG4gICAgICBuID0gbmV3IENlc2l1bS5DYXJ0ZXNpYW4zLm5vcm1hbGl6ZShuZXcgQ2VzaXVtLkNhcnRlc2lhbjMoMCwgMSwgMCkpO1xyXG5cclxuXHJcbiAgICAgIC8vIHJvdGF0aW9uIHNwZWVkIGFkanVzdGluZ1xyXG4gICAgICB2YXIgY2FtZXJhSGVpZ2h0ID0gdGhpcy5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWModGhpcy5jYW1lcmEucG9zaXRpb24pLmhlaWdodDtcclxuXHJcblxyXG4gICAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgMzAwKSB7XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVNwZWVkID0gMC4wMDAwMjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPCAyMDAwICYmIGNhbWVyYUhlaWdodCA+IDMwMCkge1xyXG4gICAgICAgICAgdGhpcy5yb3RhdGVTcGVlZCA9IDAuMDAwMTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPCAxMjAwMCAmJiBjYW1lcmFIZWlnaHQgPiAyMDAwKSB7XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVNwZWVkID0gMC4wMDM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoY2FtZXJhSGVpZ2h0IDwgODAwMDAgJiYgY2FtZXJhSGVpZ2h0ID4gMTIwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjAwODtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPCAzMDAwMDAgJiYgY2FtZXJhSGVpZ2h0ID4gODAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjA1O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGNhbWVyYUhlaWdodCA8IDUwMDAwMCAmJiBjYW1lcmFIZWlnaHQgPiAzMDAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjE7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoY2FtZXJhSGVpZ2h0ID4gNTAwMDAwICYmIGNhbWVyYUhlaWdodCA8IDEwMDAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAwLjI1O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGNhbWVyYUhlaWdodCA+IDEwMDAwMDAgJiYgY2FtZXJhSGVpZ2h0IDwgMjAwMDAwMCkge1xyXG4gICAgICAgICAgdGhpcy5yb3RhdGVTcGVlZCA9IDAuNTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPiAyMDAwMDAwICYmIGNhbWVyYUhlaWdodCA8IDUwMDAwMDApIHtcclxuICAgICAgICAgIHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVNwZWVkID0gdGhpcy5yb3RhdGVTcGVlZEluaXQ7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5jYW1lcmEucm90YXRlKG4sIGFuZ2xlRGVsdGEpO1xyXG5cclxuXHJcbiAgICB0aGlzLnJvdGF0ZVlMYXN0ID0geTtcclxuICAgIHRoaXMucm90YXRlWExhc3QgPSB4O1xyXG4gICAgdGhpcy56b29tWkxhc3QgICA9IG51bGw7XHJcbiAgICB0aGlzLnBhblhMYXN0ICAgID0gbnVsbDtcclxuICAgIHRoaXMucGFuWUxhc3QgICAgPSBudWxsO1xyXG4gICAgdGhpcy5wYW5aTGFzdCAgICA9IG51bGw7ICAgICAgXHJcbiAgfSBcclxuICBlbHNlIHtcclxuICAgIHRoaXMucm90YXRlWUxhc3QgPSBudWxsO1xyXG4gICAgdGhpcy5yb3RhdGVYTGFzdCA9IG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxuTGVhcENhbWVyYUNvbnRyb2xsZXIucHJvdG90eXBlLnpvb21DYW1lcmEgPSBmdW5jdGlvbihmcmFtZSkgeyBcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGlmICh0aGlzLnpvb21FbmFibGVkICYmIHRoaXMuYXBwbHlHZXN0dXJlKGZyYW1lLCAnem9vbScpKSB7XHJcbiAgICB2YXIgeiA9IHRoaXMucG9zaXRpb24oZnJhbWUsICd6b29tJylbMl07XHJcbiAgICBpZiAoIXRoaXMuem9vbVpMYXN0KSB7IFxyXG4gICAgICB0aGlzLnpvb21aTGFzdCA9IHo7XHJcbiAgICB9XHJcbiAgICB2YXIgekRlbHRhID0geiAtIHRoaXMuem9vbVpMYXN0O1xyXG5cclxuICAgIHZhciBsZW5ndGhEZWx0YSA9IHRoaXMuem9vbVRyYW5zZm9ybSh6RGVsdGEpO1xyXG5cclxuICAgIHZhciBjYW1lcmFIZWlnaHQgPSB0aGlzLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyh0aGlzLmNhbWVyYS5wb3NpdGlvbikuaGVpZ2h0O1xyXG4gICAgdmFyIG1vdmVSYXRlID0gY2FtZXJhSGVpZ2h0IC8gdGhpcy56b29tTW92ZVJhdGVGYWN0b3I7XHJcblxyXG4gICAgaWYgKGxlbmd0aERlbHRhID4gMCkge1xyXG4gICAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgdGhpcy56b29tSW5NYXgpIHtcclxuICAgICAgICAgIC8vZG9udCB6b29tIGluIGFueW1vcmVcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuY2FtZXJhLm1vdmVGb3J3YXJkKG1vdmVSYXRlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmIChjYW1lcmFIZWlnaHQgPiB0aGlzLnpvb21PdXRNYXgpIHtcclxuICAgICAgICAgIC8vZG9udCB6b29tIG91dCBhbnltb3JlXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmNhbWVyYS5tb3ZlQmFja3dhcmQobW92ZVJhdGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuY2FtZXJhSGVpZ2h0Wm9vbSA9IGNhbWVyYUhlaWdodDtcclxuXHJcblxyXG4gICAgdGhpcy56b29tWkxhc3QgICAgICAgID0gejsgXHJcbiAgICB0aGlzLnJvdGF0ZVhMYXN0ICAgICAgPSBudWxsO1xyXG4gICAgdGhpcy5yb3RhdGVZTGFzdCAgICAgID0gbnVsbDtcclxuICAgIHRoaXMucGFuWExhc3QgICAgICAgICA9IG51bGw7XHJcbiAgICB0aGlzLnBhbllMYXN0ICAgICAgICAgPSBudWxsO1xyXG4gICAgdGhpcy5wYW5aTGFzdCAgICAgICAgID0gbnVsbDtcclxuICB9IFxyXG4gIGVsc2Uge1xyXG4gICAgdGhpcy56b29tWkxhc3QgPSBudWxsOyBcclxuICB9XHJcbn07XHJcblxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUucGFuQ2FtZXJhID0gZnVuY3Rpb24oZnJhbWUpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGlmICh0aGlzLnBhbkVuYWJsZWQgJiYgdGhpcy5hcHBseUdlc3R1cmUoZnJhbWUsICdwYW4nKSkge1xyXG4gICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uKGZyYW1lLCAncGFuJylbMF07XHJcbiAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24oZnJhbWUsICdwYW4nKVsxXTtcclxuICAgIHZhciB6ID0gdGhpcy5wb3NpdGlvbihmcmFtZSwgJ3BhbicpWzJdO1xyXG4gICAgaWYgKCF0aGlzLnBhblhMYXN0KSB7XHJcbiAgICAgIHRoaXMucGFuWExhc3QgPSB4O1xyXG4gICAgfVxyXG4gICAgaWYgKCF0aGlzLnBhbllMYXN0KSB7IFxyXG4gICAgICB0aGlzLnBhbllMYXN0ID0geTtcclxuICAgIH1cclxuICAgIGlmICghdGhpcy5wYW5aTGFzdCkgeyBcclxuICAgICAgdGhpcy5wYW5aTGFzdCA9IHo7XHJcbiAgICB9XHJcbiAgICB2YXIgeERlbHRhID0geCAtIHRoaXMucGFuWExhc3Q7XHJcbiAgICB2YXIgeURlbHRhID0geSAtIHRoaXMucGFuWUxhc3Q7XHJcblxyXG5cclxuICAgIHZhciBjYW1lcmFIZWlnaHQgPSB0aGlzLmVsbGlwc29pZC5jYXJ0ZXNpYW5Ub0NhcnRvZ3JhcGhpYyh0aGlzLmNhbWVyYS5wb3NpdGlvbikuaGVpZ2h0O1xyXG4gICAgXHJcbiAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgMTAwMDApIHtcclxuICAgICAgICB0aGlzLnBhblNwZWVkID0gMC4wMDE7XHJcbiAgICB9XHJcbiAgICBpZiAoY2FtZXJhSGVpZ2h0IDwgNTAwMDAgJiYgY2FtZXJhSGVpZ2h0ID4gMTAwMDApIHtcclxuICAgICAgICB0aGlzLnBhblNwZWVkID0gMC4wMTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGNhbWVyYUhlaWdodCA8IDUwMDAwMCAmJiBjYW1lcmFIZWlnaHQgPiA1MDAwMCkge1xyXG4gICAgICAgIHRoaXMucGFuU3BlZWQgPSAwLjE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjYW1lcmFIZWlnaHQgPiA1MDAwMDEgJiYgY2FtZXJhSGVpZ2h0IDwgMTUwMDAwMCkge1xyXG4gICAgICAgIHRoaXMucGFuU3BlZWQgPSAwLjg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnBhblNwZWVkID0gdGhpcy5wYW5TcGVlZEluaXQ7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgdmFyIGFic29sdXRlWCA9IE1hdGguYWJzKHRoaXMucGFuVHJhbnNmb3JtKHhEZWx0YSkpO1xyXG4gIFxyXG4gICAgaWYoeERlbHRhID4gMCkge1xyXG4gICAgICB0aGlzLmNhbWVyYS5tb3ZlTGVmdChhYnNvbHV0ZVgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY2FtZXJhLm1vdmVSaWdodChhYnNvbHV0ZVgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB2YXIgYWJzb2x1dGVZID0gTWF0aC5hYnModGhpcy5wYW5UcmFuc2Zvcm0oeURlbHRhKSk7XHJcblxyXG4gICAgaWYoeURlbHRhID4gMCkge1xyXG4gICAgICB0aGlzLmNhbWVyYS5tb3ZlRG93bihhYnNvbHV0ZVkpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY2FtZXJhLm1vdmVVcChhYnNvbHV0ZVkpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB0aGlzLnBhblhMYXN0ICAgID0geDtcclxuICAgIHRoaXMucGFuWUxhc3QgICAgPSB5O1xyXG4gICAgdGhpcy5wYW5aTGFzdCAgICA9IHo7XHJcbiAgICB0aGlzLnJvdGF0ZVhMYXN0ID0gbnVsbDtcclxuICAgIHRoaXMucm90YXRlWUxhc3QgPSBudWxsO1xyXG4gICAgdGhpcy56b29tWkxhc3QgICA9IG51bGw7XHJcbiAgfSBcclxuICBlbHNlIHtcclxuICAgIHRoaXMucGFuWExhc3QgPSBudWxsO1xyXG4gICAgdGhpcy5wYW5ZTGFzdCA9IG51bGw7XHJcbiAgICB0aGlzLnBhblpMYXN0ID0gbnVsbDsgICAgIFxyXG4gIH1cclxufTtcclxuXHJcbkxlYXBDYW1lcmFDb250cm9sbGVyLnByb3RvdHlwZS5haXJwbGFuZUNhbWVyYSA9IGZ1bmN0aW9uKGZyYW1lKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICB2YXIgZGF0YSA9IGZyYW1lLmRhdGE7XHJcbiAgaWYgKGZyYW1lLnZhbGlkICYmIGRhdGEuaGFuZHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICB2YXIgZmluZ2VycyA9IGRhdGEucG9pbnRhYmxlcztcclxuICAgIGlmIChmaW5nZXJzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgZGF0YSA9IGRhdGEuaGFuZHNbMF07XHJcbiAgICAgIGlmIChkYXRhLnRpbWVWaXNpYmxlID4gMC43NSkge1xyXG4gICAgICAgIHZhciBjYW1lcmEgPSB0aGlzLmNhbWVyYSxcclxuICAgICAgICAgICAgbW92ZW1lbnQgPSB7fSxcclxuICAgICAgICAgICAgY2FtZXJhSGVpZ2h0ID0gdGhpcy5lbGxpcHNvaWQuY2FydGVzaWFuVG9DYXJ0b2dyYXBoaWMoY2FtZXJhLnBvc2l0aW9uKS5oZWlnaHQsXHJcbiAgICAgICAgICAgIG1vdmVSYXRlID0gY2FtZXJhSGVpZ2h0IC8gMTAwLjA7XHJcblxyXG4gICAgICAgIC8vIHBhbiAtIHgseVxyXG4gICAgICAgIG1vdmVtZW50LnggPSBkYXRhLnBhbG1Qb3NpdGlvblswXTtcclxuICAgICAgICBtb3ZlbWVudC55ID0gZGF0YS5wYWxtUG9zaXRpb25bMl07XHJcblxyXG4gICAgICAgIC8vem9vbSAtIHogLy8gaGVpZ2h0IGFib3ZlIGxlYXBcclxuICAgICAgICBtb3ZlbWVudC56ID0gZGF0YS5wYWxtUG9zaXRpb25bMV07XHJcblxyXG4gICAgICAgIC8vcGl0Y2ggLSBwaXRjaFxyXG4gICAgICAgIHZhciBub3JtYWwgPSBkYXRhLnBhbG1Ob3JtYWw7XHJcbiAgICAgICAgbW92ZW1lbnQucGl0Y2ggPSAtMSAqIG5vcm1hbFsyXTsgLy8gbGVhcCBtb3Rpb24gaGFzIGl0IHRoYXQgbmVnYXRpdmUgaXMgc2xvcGluZyB1cHdhcmRzXHJcbiAgICAgICAgLy9NYXRoLmF0YW4yKG5vcm1hbC56LCBub3JtYWwueSkgKiAxODAvbWF0aC5waSArIDE4MDtcclxuICAgICAgICBtb3ZlbWVudC5yb3RhdGUgPSBkYXRhLmRpcmVjdGlvblswXTtcclxuICAgICAgICAvL3lhdyAtIHlhd1xyXG4gICAgICAgIG1vdmVtZW50LnlhdyA9IC0xICogbm9ybWFsWzBdOyAvLyByb2xsP1xyXG4gICAgICAgIC8vIExlYXBNb3Rpb24gZmxpcHMgaXRzIHJvbGwgYW5nbGVzIGFzIHdlbGxcclxuXHJcbiAgICAgICAgLy8gdGhpcyAnbWlkJyB2YXIgc2VlbXMgdG8gYmUgYSBuYXR1cmFsIG1pZCBwb2ludCBpbiB0aGUgJ3onXHJcbiAgICAgICAgLy8gKG9yIHZlcnRjYWwgZGlzdGFuY2UgYWJvdmUgZGV2aWNlKVxyXG4gICAgICAgIC8vIGRpcmVjdGlvbiB0aGF0IGlzIHVzZWQgZm9yIHdoZXRoZXIgeW91IGFyZSBjbG9zZXIgdG8gdGhlIGRldmljZVxyXG4gICAgICAgIC8vIG9yIGF3YXkgZnJvbSBpdC5cclxuICAgICAgICB2YXIgbWlkID0gMTc1O1xyXG4gICAgICAgIHZhciBub3JtYWxpemVkID0gKG1vdmVtZW50LnogLSBtaWQpIC8gLTEwMDtcclxuXHJcbiAgICAgICAgY2FtZXJhLm1vdmVGb3J3YXJkKG5vcm1hbGl6ZWQgKiBtb3ZlUmF0ZSk7XHJcbiAgICAgICAgY2FtZXJhLm1vdmVSaWdodChtb3ZlbWVudC54ICogbW92ZVJhdGUgLyAxMDApO1xyXG4gICAgICAgIGNhbWVyYS5tb3ZlRG93bihtb3ZlbWVudC55ICogbW92ZVJhdGUgLyAxMDApO1xyXG5cclxuICAgICAgICBjYW1lcmEubG9va1VwKG1vdmVtZW50LnBpdGNoIC8gMTAwKTtcclxuXHJcbiAgICAgICAgY2FtZXJhLnR3aXN0UmlnaHQobW92ZW1lbnQueWF3IC8gMTAwKTtcclxuICAgICAgICBjYW1lcmEubG9va1JpZ2h0KG1vdmVtZW50LnJvdGF0ZSAvIDEwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5MZWFwQ2FtZXJhQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZnJhbWUpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIGlmICh0aGlzLmVuYWJsZWQpIHtcclxuICAgIGlmICh0aGlzLmNvbnRyb2xNb2RlID09PSAnc3RhbmRhcmQnKSB7XHJcbiAgICAgIHRoaXMucm90YXRlQ2FtZXJhKGZyYW1lKTtcclxuICAgICAgdGhpcy56b29tQ2FtZXJhKGZyYW1lKTtcclxuICAgICAgdGhpcy5wYW5DYW1lcmEoZnJhbWUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5jb250cm9sTW9kZSA9PT0gJ2ZsaWdodCcpIHtcclxuICAgICAgdGhpcy5haXJwbGFuZUNhbWVyYShmcmFtZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCIvKiBnbG9iYWxzIExlYXAsIExlYXBDb25uZWN0b3IsIGRvY3VtZW50ICovXHJcblxyXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XHJcbnZhciB1dGlsICAgPSByZXF1aXJlKCd1dGlsJyk7XHJcblxyXG5cclxuLyoqXHJcbiogRXZlcnl0aGluZyB3aGljaCBpcyBkZWZpbmVkIHdpdGggbW9kdWxlLmV4cG9ydHMgd2lsbCBiZSBhdmFpbGFibGUgdGhyb3VnaCB0aGUgcmVxdWlyZSBjb21tYW5kXHJcbiovIFxyXG5tb2R1bGUuZXhwb3J0cyA9IExlYXBDb25uZWN0b3I7XHJcblxyXG5cclxuLyoqXHJcbiogQ29uc3RydWN0b3JcclxuKi9cclxuZnVuY3Rpb24gTGVhcENvbm5lY3RvcigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHRoaXMuTGVhcCA9IExlYXA7XHJcblxyXG4gIC8vIENyZWF0ZSBhIG5ldyBjb250cm9sbGVyXHJcbiAgdGhpcy5jb250cm9sbGVyID0gbmV3IHRoaXMuTGVhcC5Db250cm9sbGVyKHtlbmFibGVHZXN0dXJlczogdHJ1ZX0pO1xyXG5cclxuICAvLyBTZXR1cCB0aGUgY29ubmVjdCBldmVudCBsaXN0ZW5lclxyXG4gIHRoaXMuY29udHJvbGxlci5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCJTdWNjZXNzZnVsbHkgY29ubmVjdGVkLlwiKTtcclxuICB9KTtcclxuXHJcbiAgLy8gQ29ubmVjdCB0byB0aGUgbmV3bHkgY3JlYXRlZCBjb250cm9sbGVyXHJcbiAgdGhpcy5jb250cm9sbGVyLmNvbm5lY3QoKTtcclxuXHJcblxyXG4gIHRoaXMuZmluZ2VycyA9IHt9O1xyXG4gIHRoaXMuc3BoZXJlcyA9IHt9O1xyXG59XHJcblxyXG4vKipcclxuKiBJbmhlcml0IHRoZSBldmVudCBlbWl0dGVyIGZ1bmN0aW9uYWxpdHlcclxuKi9cclxudXRpbC5pbmhlcml0cyhMZWFwQ29ubmVjdG9yLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcclxuXHJcblxyXG5MZWFwQ29ubmVjdG9yLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG5cdHRoaXMuY3VycmVudEZyYW1lID0gdGhpcy5jb250cm9sbGVyLmZyYW1lKCk7XHJcblx0dGhpcy52aXN1YWxpemUoKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuKiBGdW5jdGlvbnMgZm9yIHRoZSB2aXN1YWxpemF0aW9uIG9mIHRoZSBsZWFwIGRhdGFcclxuKi9cclxuTGVhcENvbm5lY3Rvci5wcm90b3R5cGUubW92ZUZpbmdlciA9IGZ1bmN0aW9uKEZpbmdlciwgcG9zWCwgcG9zWSwgcG9zWiwgZGlyWCwgZGlyWSwgZGlyWikge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICBGaW5nZXIuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gRmluZ2VyLnN0eWxlLm1velRyYW5zZm9ybSA9IFxyXG4gIEZpbmdlci5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVgoXCIrcG9zWCtcInB4KSB0cmFuc2xhdGVZKFwiK3Bvc1krXCJweCkgdHJhbnNsYXRlWihcIitwb3NaK1wicHgpIHJvdGF0ZVgoXCIrZGlyWCtcImRlZykgcm90YXRlWSgwZGVnKSByb3RhdGVaKFwiK2RpclorXCJkZWcpXCI7XHJcbn07XHJcblxyXG5MZWFwQ29ubmVjdG9yLnByb3RvdHlwZS5tb3ZlU3BoZXJlID0gZnVuY3Rpb24oU3BoZXJlLCBwb3NYLCBwb3NZLCBwb3NaLCByb3RYKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIFNwaGVyZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBTcGhlcmUuc3R5bGUubW96VHJhbnNmb3JtID0gXHJcbiAgU3BoZXJlLnN0eWxlLnRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWChcIitwb3NYK1wicHgpIHRyYW5zbGF0ZVkoXCIrcG9zWStcInB4KSB0cmFuc2xhdGVaKFwiK3Bvc1orXCJweCkgcm90YXRlWChcIityb3RYK1wiZGVnKSByb3RhdGVZKDBkZWcpIHJvdGF0ZVooMGRlZylcIjtcclxufTtcclxuXHJcbkxlYXBDb25uZWN0b3IucHJvdG90eXBlLnZpc3VhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIHZhciBmaW5nZXJJZHMgICA9IHt9O1xyXG4gIHZhciBoYW5kSWRzICAgICA9IHt9O1xyXG4gIHZhciBoYW5kc0xlbmd0aCA9IDA7XHJcbiAgdmFyIHNwaGVyZURpdiAgID0gbnVsbDtcclxuICB2YXIgZmluZ2VyRGl2ICAgPSBudWxsO1xyXG5cclxuICB2YXIgcG9zWCA9IDA7XHJcbiAgdmFyIHBvc1kgPSAwO1xyXG4gIHZhciBwb3NaID0gMDtcclxuXHJcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lLmhhbmRzID09PSB1bmRlZmluZWQgKSB7IFxyXG4gICAgaGFuZHNMZW5ndGggPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBoYW5kc0xlbmd0aCA9IHRoaXMuY3VycmVudEZyYW1lLmhhbmRzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGhhbmRJZCA9IDAsIGhhbmRDb3VudCA9IGhhbmRzTGVuZ3RoOyBoYW5kSWQgIT09IGhhbmRDb3VudDsgaGFuZElkKyspIHtcclxuICAgIHZhciBoYW5kID0gdGhpcy5jdXJyZW50RnJhbWUuaGFuZHNbaGFuZElkXTtcclxuXHJcbiAgICBwb3NYID0gKGhhbmQucGFsbVBvc2l0aW9uWzBdKjMpO1xyXG4gICAgcG9zWSA9IChoYW5kLnBhbG1Qb3NpdGlvblsyXSozKS0yMDA7XHJcbiAgICBwb3NaID0gKGhhbmQucGFsbVBvc2l0aW9uWzFdKjMpLTQwMDtcclxuXHJcbiAgICB2YXIgcm90WCA9IChoYW5kLl9yb3RhdGlvblsyXSo5MCk7XHJcbiAgICB2YXIgcm90WSA9IChoYW5kLl9yb3RhdGlvblsxXSo5MCk7XHJcbiAgICB2YXIgcm90WiA9IChoYW5kLl9yb3RhdGlvblswXSo5MCk7XHJcbiAgICB2YXIgc3BoZXJlID0gdGhpcy5zcGhlcmVzW2hhbmQuaWRdO1xyXG4gICAgaWYgKCFzcGhlcmUpIHtcclxuXHRcdHNwaGVyZURpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BoZXJlXCIpLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgIHNwaGVyZURpdi5zZXRBdHRyaWJ1dGUoJ2lkJyxoYW5kLmlkKTtcclxuICAgICAgICAgIHNwaGVyZURpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3I9JyNBM0EzQTMnOyAgLy8nIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKS5hcHBlbmRDaGlsZChzcGhlcmVEaXYpO1xyXG4gICAgICAgICAgdGhpcy5zcGhlcmVzW2hhbmQuaWRdID0gaGFuZC5pZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNwaGVyZURpdiA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYW5kLmlkKTtcclxuICAgICAgaWYgKHR5cGVvZihzcGhlcmVEaXYpICE9PSAndW5kZWZpbmVkJyAmJiBzcGhlcmVEaXYgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLm1vdmVTcGhlcmUoc3BoZXJlRGl2LCBwb3NYLCBwb3NZLCBwb3NaLCByb3RYLCByb3RZLCByb3RaKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaGFuZElkc1toYW5kLmlkXSA9IHRydWU7XHJcbiAgfVxyXG4gIGZvciAoaGFuZElkIGluIHRoaXMuc3BoZXJlcykge1xyXG4gICAgaWYgKCFoYW5kSWRzW2hhbmRJZF0pIHtcclxuICAgICAgc3BoZXJlRGl2ID0gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuc3BoZXJlc1toYW5kSWRdKTtcclxuICAgICAgc3BoZXJlRGl2LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3BoZXJlRGl2KTtcclxuICAgICAgZGVsZXRlIHRoaXMuc3BoZXJlc1toYW5kSWRdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgcG9pbnRhYmxlSWQgPSAwLCBwb2ludGFibGVDb3VudCA9IHRoaXMuY3VycmVudEZyYW1lLnBvaW50YWJsZXMubGVuZ3RoOyBwb2ludGFibGVJZCAhPT0gcG9pbnRhYmxlQ291bnQ7IHBvaW50YWJsZUlkKyspIHtcclxuICAgIHZhciBwb2ludGFibGUgPSB0aGlzLmN1cnJlbnRGcmFtZS5wb2ludGFibGVzW3BvaW50YWJsZUlkXTtcclxuXHJcbiAgICBwb3NYID0gKHBvaW50YWJsZS50aXBQb3NpdGlvblswXSozKTtcclxuICAgIHBvc1kgPSAocG9pbnRhYmxlLnRpcFBvc2l0aW9uWzJdKjMpLTIwMDtcclxuICAgIHBvc1ogPSAocG9pbnRhYmxlLnRpcFBvc2l0aW9uWzFdKjMpLTQwMDtcclxuXHJcbiAgICB2YXIgZGlyWCA9IC0ocG9pbnRhYmxlLmRpcmVjdGlvblsxXSo5MCk7XHJcbiAgICB2YXIgZGlyWSA9IC0ocG9pbnRhYmxlLmRpcmVjdGlvblsyXSo5MCk7XHJcbiAgICB2YXIgZGlyWiA9IChwb2ludGFibGUuZGlyZWN0aW9uWzBdKjkwKTtcclxuICAgIHZhciBmaW5nZXIgPSB0aGlzLmZpbmdlcnNbcG9pbnRhYmxlLmlkXTtcclxuICAgIGlmICghZmluZ2VyKSB7XHJcblx0XHRmaW5nZXJEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbmdlclwiKS5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICBmaW5nZXJEaXYuc2V0QXR0cmlidXRlKCdpZCcscG9pbnRhYmxlLmlkKTtcclxuICAgICAgICAgIGZpbmdlckRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3I9JyNBM0EzQTMnOyAgLy8nIycrTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2Nzc3MjE1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NlbmUnKS5hcHBlbmRDaGlsZChmaW5nZXJEaXYpO1xyXG4gICAgICAgICAgdGhpcy5maW5nZXJzW3BvaW50YWJsZS5pZF0gPSBwb2ludGFibGUuaWQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmaW5nZXJEaXYgPSAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocG9pbnRhYmxlLmlkKTtcclxuICAgICAgaWYgKHR5cGVvZihmaW5nZXJEaXYpICE9PSAndW5kZWZpbmVkJyAmJiBmaW5nZXJEaXYgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMubW92ZUZpbmdlcihmaW5nZXJEaXYsIHBvc1gsIHBvc1ksIHBvc1osIGRpclgsIGRpclksIGRpclopO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmaW5nZXJJZHNbcG9pbnRhYmxlLmlkXSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICB2YXIgZmluZ2VySWQ7XHJcbiAgZm9yIChmaW5nZXJJZCBpbiB0aGlzLmZpbmdlcnMpIHtcclxuICAgIGlmICghZmluZ2VySWRzW2ZpbmdlcklkXSkge1xyXG4gICAgICBmaW5nZXJEaXYgPSAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5maW5nZXJzW2ZpbmdlcklkXSk7XHJcbiAgICAgIGZpbmdlckRpdi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZpbmdlckRpdik7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmZpbmdlcnNbZmluZ2VySWRdO1xyXG4gICAgfVxyXG4gIH1cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvd0hhbmRzJykuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJykuc2V0QXR0cmlidXRlKCdjbGFzcycsJ3Nob3ctaGFuZHMnKTtcclxuICB9LCBmYWxzZSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGVIYW5kcycpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCcnKTtcclxuICB9LCBmYWxzZSk7XHJcbn07IiwiLyogZ2xvYmFscyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGRvY3VtZW50LCAkICovXHJcblxyXG52YXIgTGVhcENvbm5lY3RvciAgICAgICAgPSByZXF1aXJlKCcuL2xlYXBDb25uZWN0b3IuanMnKTtcclxudmFyIExlYXBDYW1lcmFDb250cm9sbGVyID0gcmVxdWlyZSgnLi9sZWFwQ2FtZXJhQ29udHJvbGxlci5qcycpO1xyXG52YXIgQ2VzaXVtV29ybGQgICAgICAgICAgPSByZXF1aXJlKCcuL2Nlc2l1bVdvcmxkLmpzJyk7XHJcbnZhciBzcGVlY2hMaXN0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vc3BlZWNoLmpzb24nKTtcclxudmFyIFNwZWVjaFJlY29nbml0aW9uICAgID0gcmVxdWlyZSgnLi9zcGVlY2hSZWNvZ25pdGlvbi5qcycpO1xyXG52YXIgU3BlZWNoU3ludGhlc2lzICAgICAgPSByZXF1aXJlKCcuL3NwZWVjaFN5bnRoZXNpcy5qcycpO1xyXG52YXIgVWkgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL1VpLmpzJyk7XHJcbnZhciBHZXN0dXJlSW50cm8gICAgICAgICA9IHJlcXVpcmUoJy4vZ2VzdHVyZUludHJvLmpzJyk7XHJcblxyXG5cclxuLy8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vLyBJbml0aWFsaXplIGFuZCBjb25uZWN0IHRoZSBtb2R1bGVzXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG52YXIgbGVhcENvbm5lY3Rpb24gICAgICAgPSBuZXcgTGVhcENvbm5lY3RvcigpO1xyXG52YXIgc3BlZWNoUmVjb2duaXRpb24gICAgPSBuZXcgU3BlZWNoUmVjb2duaXRpb24oc3BlZWNoTGlzdCk7XHJcbnZhciBzcGVlY2hTeW50aGVzaXMgICAgICA9IG5ldyBTcGVlY2hTeW50aGVzaXMoc3BlZWNoTGlzdCk7XHJcbnZhciBjZXNpdW1Xb3JsZCAgICAgICAgICA9IG5ldyBDZXNpdW1Xb3JsZChzcGVlY2hSZWNvZ25pdGlvbiwgc3BlZWNoU3ludGhlc2lzKTtcclxudmFyIGxlYXBDYW1lcmFDb250cm9sbGVyID0gbmV3IExlYXBDYW1lcmFDb250cm9sbGVyKGNlc2l1bVdvcmxkLndpZGdldC5zY2VuZS5jYW1lcmEsIGNlc2l1bVdvcmxkLmVsbGlwc29pZCk7XHJcbnZhciB1aSAgICAgICAgICAgICAgICAgICA9IG5ldyBVaShjZXNpdW1Xb3JsZCk7XHJcbnZhciBnZXN0dXJlSW50cm8gICAgICAgICA9IG5ldyBHZXN0dXJlSW50cm8oKTtcclxuXHJcblxyXG4vLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8vIFNldHVwIHNvbWUgZXZlbnQgbGlzdGVuZXJzIHRvIGNoYW5nZSB0aGUgbGVhcCBjb250cm9sIG1vZGVcclxuLy8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbnNwZWVjaFJlY29nbml0aW9uLm9uKCdmbGlnaHRNb2RlJywgZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdGxlYXBDYW1lcmFDb250cm9sbGVyLmNvbnRyb2xNb2RlID0gJ2ZsaWdodCc7XHJcblxyXG5cdHNwZWVjaFN5bnRoZXNpcy5hbnN3ZXIoJ2ZsaWdodE1vZGUnLCB7J3N0YXRlJzogdHJ1ZX0pO1xyXG59KTtcclxuXHJcbnNwZWVjaFJlY29nbml0aW9uLm9uKCdzdGFuZGFyZE1vZGUnLCBmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblx0bGVhcENhbWVyYUNvbnRyb2xsZXIuY29udHJvbE1vZGUgPSAnc3RhbmRhcmQnO1xyXG5cclxuXHRzcGVlY2hTeW50aGVzaXMuYW5zd2VyKCdzdGFuZGFyZE1vZGUnLCB7J3N0YXRlJzogdHJ1ZX0pO1xyXG59KTtcclxuXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLy8gSW5pdGlhbGl6ZSB0aGUgVUkgcmVsYXRlZCBzdHVmZiBhZnRlciB0aGUgZG9jdW1lbnQgaXMgZnVsbHkgbG9hZGVkXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdHVpLmluaXQoKTtcclxuXHRnZXN0dXJlSW50cm8uaW5pdCgpO1xyXG59KTtcclxuXHJcbi8vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLy8gU3RhcnQgdGhlIG91ciBjdXN0b20gYW5pbWF0aW9uIC8gdXBkYXRlIGxvb3BcclxuLy8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbiB1cGRhdGUoKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxuXHJcblx0bGVhcENvbm5lY3Rpb24udXBkYXRlKCk7XHJcbiAgICBjZXNpdW1Xb3JsZC51cGRhdGUoKTtcclxuICAgIGxlYXBDYW1lcmFDb250cm9sbGVyLnVwZGF0ZShsZWFwQ29ubmVjdGlvbi5jdXJyZW50RnJhbWUpO1xyXG59KCkpO1xyXG5cclxuIiwibW9kdWxlLmV4cG9ydHM9W1xyXG4gIHtcclxuICAgIFwibGFuZ3VhZ2VcIjogXCJHZXJtYW5cIixcclxuICAgIFwiY29kZVwiOiBcImRlLURFXCIsXHJcbiAgICBcIml0ZW1zXCI6IFtcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcInNlbGVjdExheWVyXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJPYmVyZmzDpGNoZVwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBoYWJlIGRpZSBPYmVyZmzDpGNoZSB6dSAjUkVQTEFDRSMgZ2XDpG5kZXJ0LlwiXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgXCJmYWlsXCI6IFtcclxuICAgICAgICAgICAgXCJJY2gga2FubiBkaWUgT2JlcmZsw6RjaGUgI1JFUExBQ0UjIG5pY2h0IGJlbnV0emVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwiZmxpZ2h0TW9kZVwiLFxyXG4gICAgICAgIFwiZGV0ZWN0XCI6IFwiRmx1Z21vZHVzXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGhhYmUgZGVuIEZsdWdtb2R1cyBha3RpdmllcnQuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgZGVuIEZsdWdtb2R1cyBuaWNodCBha3RpdmllcmVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwiaW5mb3JtYXRpb25SZXF1ZXN0XCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJJbmZvcm1hdGlvbmVuXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcInRlc3RcIixcclxuICAgICAgICBcImRldGVjdFwiOiBcInRlc3RcIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEZWluIE1pa3JvcGhvbiBmdW5rdGlvbmllcnQgc3VwZXIuXCIsXHJcbiAgICAgICAgICAgIFwiSWNoIGjDtnJlIGRpY2guXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgZGVuIEZsdWdtb2R1cyBuaWNodCBha3RpdmllcmVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwic3RhbmRhcmRNb2RlXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJTdGFuZGFyZCBtb2R1c1wiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBoYWJlIGRlbiBTdGFuZGFyZG1vZHVzIGFrdGl2aWVydC5cIlxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGtvbm50ZSBkZW4gU3RhbmRhcmRtb2R1cyBuaWNodCBha3RpdmllcmVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwidGhhbmtzXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJEYW5rZVwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkdlcm5lIGRvY2guXCIsXHJcbiAgICAgICAgICAgIFwiS2VpbiBQcm9ibGVtLlwiLFxyXG4gICAgICAgICAgICBcIkljaCBmcmV1ZSBtaWNoIGRpciBnZWhvbGZlbiB6dSBoYWJlbi5cIixcclxuICAgICAgICAgICAgXCJEYXMgaGFiZSBpY2ggZG9jaCBnZXJuIGdldGFuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwic2V0VGVycmFpblwiLFxyXG4gICAgICAgIFwiZGV0ZWN0XCI6IFwiUmVsaWVmXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGhhYmUgZGFzIFJlbGllZiAjUkVQTEFDRSMuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrYW5uIGRhcyBSZWxpZWYgbmljaHQgZWluc2NoYWx0ZW4uXCJcclxuICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBcImVtaXRcIjogXCJuYXZpZ2F0ZVRvXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJzdWNoZVwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBoYWJlICNSRVBMQUNFIyBnZWZ1bmRlblwiXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgXCJmYWlsXCI6IFtcclxuICAgICAgICAgICAgXCJJY2gga29ubnRlICNSRVBMQUNFIyBuaWNodCBmaW5kZW4uXCIsXHJcbiAgICAgICAgICAgIFwiSWNoIGhhYmUgI1JFUExBQ0UjIG5pY2h0IGdlZnVuZGVuLlwiLFxyXG4gICAgICAgICAgICBcIkVzIHR1dCBtaXIgbGVpZCwgaWNoIGhhYmUgI1JFUExBQ0UjIG5pY2h0IGdlZnVuZGVuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZUZvcndhcmRcIixcclxuICAgICAgICBcImRldGVjdFwiOiBcInZlcmdyw7bDn2VyblwiLFxyXG4gICAgICAgIFwiYW5zd2Vyc1wiOiB7XHJcbiAgICAgICAgICBcInN1Y2Nlc3NcIjogW1xyXG4gICAgICAgICAgICBcIkR1IGJpc3QgamV0enQgbsOkaGVyIGRyYW4uXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIHZlcmdyw7bDn2Vybi5cIlxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcIm1vdmVCYWNrd2FyZFwiLFxyXG4gICAgICAgIFwiZGV0ZWN0XCI6IFwidmVya2xlaW5lcm5cIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEdSBiaXN0IGpldHp0IHdlaXRlciB3ZWcuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIHZlcmtsZWluZXJuLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZVVwXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJob2NoXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiRHUgYmlzdCBqZXR6dCB3ZWl0ZXIgb2Jlbi5cIlxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGtvbm50ZSBuaWNodCB3ZWl0ZXIgaG9jaC5cIlxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIFwiZW1pdFwiOiBcIm1vdmVEb3duXCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJydW50ZXJcIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEdSBiaXN0IGpldHp0IHdlaXRlciB1bnRlbi5cIlxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIFwiZmFpbFwiOiBbXHJcbiAgICAgICAgICAgIFwiSWNoIGtvbm50ZSBuaWNodCB3ZWl0ZXIgcnVudGVyLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZUxlZnRcIixcclxuICAgICAgICBcImRldGVjdFwiOiBcImxpbmtzXCIsXHJcbiAgICAgICAgXCJhbnN3ZXJzXCI6IHtcclxuICAgICAgICAgIFwic3VjY2Vzc1wiOiBbXHJcbiAgICAgICAgICAgIFwiRHUgYmlzdCBqZXR6dCB3ZWl0ZXIgbGlua3MuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIGxpbmtzLlwiXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJlbWl0XCI6IFwibW92ZVJpZ2h0XCIsXHJcbiAgICAgICAgXCJkZXRlY3RcIjogXCJyZWNodHNcIixcclxuICAgICAgICBcImFuc3dlcnNcIjoge1xyXG4gICAgICAgICAgXCJzdWNjZXNzXCI6IFtcclxuICAgICAgICAgICAgXCJEdSBiaXN0IGpldHp0IHdlaXRlciByZWNodHMuXCJcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBcImZhaWxcIjogW1xyXG4gICAgICAgICAgICBcIkljaCBrb25udGUgbmljaHQgd2VpdGVyIHJlY2h0cy5cIlxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXVxyXG4gIH1cclxuXSIsIi8qIGdsb2JhbHMgU3BlZWNoUmVjb2duaXRpb24sIHdpbmRvdywgd2Via2l0U3BlZWNoUmVjb2duaXRpb24qL1xyXG5cclxuXHJcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcclxudmFyIHV0aWwgICA9IHJlcXVpcmUoJ3V0aWwnKTtcclxuXHJcbi8qKlxyXG4gKiBFeHBvcnQgZm9yIHJlcXVpcmUgc3RhdGVtYW50XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IFNwZWVjaFJlY29nbml0aW9uO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gU3BlZWNoUmVjb2duaXRpb24oX3NwZWVjaExpc3QpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbiA9IG51bGw7XHJcbiAgICB0aGlzLmlzUmVjb2duaXppbmcgPSBmYWxzZTtcclxuICAgIHRoaXMubGFuZ3VhZ2UgPSAnZGUtREUnO1xyXG4gICAgdGhpcy5zcGVlY2hMaXN0ID0gX3NwZWVjaExpc3Q7XHJcbiAgICB0aGlzLnNwZWVjaEVycm9yID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcblxyXG51dGlsLmluaGVyaXRzKFNwZWVjaFJlY29nbml0aW9uLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcclxuXHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBpZiAoISgnd2Via2l0U3BlZWNoUmVjb2duaXRpb24nIGluIHdpbmRvdykpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnbm90IGF2YWlsYWJsZScpO1xyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgdGhpcy5icm93c2VyUmVjb2duaXRpb24gPSBuZXcgd2Via2l0U3BlZWNoUmVjb2duaXRpb24oKTtcclxuICAgICAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbi5jb250aW51b3VzID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbi5pbnRlcmltUmVzdWx0cyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5icm93c2VyUmVjb2duaXRpb24ubGFuZyA9IHRoaXMubGFuZ3VhZ2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbi5vbnN0YXJ0ID0gZnVuY3Rpb24oKXtfdGhpcy5vblN0YXJ0KCk7fTtcclxuICAgICAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbi5vbnJlc3VsdCA9IGZ1bmN0aW9uKGV2ZW50KXtfdGhpcy5vblJlc3VsdChldmVudCk7fTtcclxuICAgICAgICB0aGlzLmJyb3dzZXJSZWNvZ25pdGlvbi5vbmVuZCA9IGZ1bmN0aW9uKCl7X3RoaXMub25FbmQoKTt9O1xyXG4gICAgICAgIHRoaXMuYnJvd3NlclJlY29nbml0aW9uLm9uZXJyb3IgPSBmdW5jdGlvbihldmVudCl7X3RoaXMub25FcnJvcihldmVudCk7fTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHRoaXMuYnJvd3NlclJlY29nbml0aW9uLnN0YXJ0KCk7XHJcbn07XHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdGhpcy5icm93c2VyUmVjb2duaXRpb24uc3RvcCgpO1xyXG59O1xyXG5cclxuU3BlZWNoUmVjb2duaXRpb24ucHJvdG90eXBlLm9uU3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHRoaXMuaXNSZWNvZ25pemluZyA9IHRydWU7XHJcbn07XHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUub25SZXN1bHQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICB2YXIgaW50ZXJpbVRyYW5zY3JpcHQgPSAnJztcclxuICAgIHZhciBmaW5hbE1hdGNoID0gZmFsc2U7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IGV2ZW50LnJlc3VsdEluZGV4OyBpIDwgZXZlbnQucmVzdWx0cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnJlc3VsdHNbaV0pO1xyXG4gICAgICAgIGlmIChldmVudC5yZXN1bHRzW2ldLmlzRmluYWwpIHtcclxuICAgICAgICAgICAgZmluYWxNYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgIGludGVyaW1UcmFuc2NyaXB0ICs9IGV2ZW50LnJlc3VsdHNbaV1bMF0udHJhbnNjcmlwdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYoZmluYWxNYXRjaClcclxuICAgIHtcclxuICAgICAgICBpbnRlcmltVHJhbnNjcmlwdCA9IHRoaXMudHJpbVNwYWNlcyhpbnRlcmltVHJhbnNjcmlwdCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaXMuc3BlZWNoTGlzdC5sZW5ndGg7ICsrailcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc3BlZWNoTGlzdFtqXS5jb2RlID09PSB0aGlzLmxhbmd1YWdlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGsgPSAwOyBrIDwgdGhpcy5zcGVlY2hMaXN0W2pdLml0ZW1zLmxlbmd0aDsgKytrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50RGV0ZWN0aW9uSXRlbSA9IHRoaXMuc3BlZWNoTGlzdFtqXS5pdGVtc1trXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaW50ZXJpbVRyYW5zY3JpcHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKGN1cnJlbnREZXRlY3Rpb25JdGVtLmRldGVjdC50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnREYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FjdGlvbicgOiB0aGlzLnRyaW1TcGFjZXMoaW50ZXJpbVRyYW5zY3JpcHQucmVwbGFjZShjdXJyZW50RGV0ZWN0aW9uSXRlbS5kZXRlY3QsICcnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGV0ZWN0ZWQnIDogY3VycmVudERldGVjdGlvbkl0ZW0uZGV0ZWN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2VtaXQnIDogY3VycmVudERldGVjdGlvbkl0ZW0uZW1pdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsYW5ndWFnZScgOiB0aGlzLmxhbmd1YWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoY3VycmVudERldGVjdGlvbkl0ZW0uZW1pdCwgZXZlbnREYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnbmljaHRzIGJyYXVjaGJhcmVzJyk7XHJcbiAgICB9XHJcbiAgICBlbHNlXHJcbiAgICB7XHJcbiAgICAgICAgLy8gbm8gZmluYWwgbWF0Y2hcclxuICAgIH1cclxufTtcclxuXHJcblNwZWVjaFJlY29nbml0aW9uLnByb3RvdHlwZS50cmltU3BhY2VzID0gZnVuY3Rpb24oX3N0cmluZykge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgcmV0dXJuIF9zdHJpbmcucmVwbGFjZSgvXlxcc1xccyovLCAnJykucmVwbGFjZSgvXFxzXFxzKiQvLCAnJyk7XHJcbn07XHJcblxyXG5TcGVlY2hSZWNvZ25pdGlvbi5wcm90b3R5cGUub25FbmQgPSBmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHRoaXMuaXNSZWNvZ25pemluZyA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBpZighdGhpcy5zcGVlY2hFcnJvcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKFwic3BlZWNoIHJlY29nbml0aW9uIGVuZGVkXCIpO1xyXG59O1xyXG5cclxuU3BlZWNoUmVjb2duaXRpb24ucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBpZiAoZXZlbnQuZXJyb3IgPT09ICduby1zcGVlY2gnKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiBubyBzcGVlY2gnKTtcclxuICAgIH1cclxuICAgIGlmIChldmVudC5lcnJvciA9PT0gJ2F1ZGlvLWNhcHR1cmUnKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiBubyBtaWNyb3Bob25lJyk7XHJcbiAgICAgICAgdGhpcy5zcGVlY2hFcnJvciA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoZXZlbnQuZXJyb3IgPT09ICdub3QtYWxsb3dlZCcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3I6IG5vdCBhbGxvd2VkJyk7XHJcbiAgICAgICAgdGhpcy5zcGVlY2hFcnJvciA9IHRydWU7XHJcbiAgICB9XHJcbn07IiwiLyogZ2xvYmFscyBTcGVlY2hTeW50aGVzaXMsIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSwgd2luZG93Ki9cclxuXHJcblxyXG52YXIgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XHJcbnZhciB1dGlsICAgPSByZXF1aXJlKCd1dGlsJyk7XHJcblxyXG4vKipcclxuICogRXhwb3J0IGZvciByZXF1aXJlIHN0YXRlbWFudFxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBTcGVlY2hTeW50aGVzaXM7XHJcblxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBTcGVlY2hTeW50aGVzaXMoX3NwZWVjaExpc3QpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgdGhpcy52b2ljZXMgID0gW107XHJcbiAgICB0aGlzLmxhbmd1YWdlID0gJ2RlLURFJztcclxuICAgIHRoaXMuc3BlZWNoTGlzdCA9IF9zcGVlY2hMaXN0O1xyXG4gICAgXHJcbiAgICB0aGlzLmluaXQoKTtcclxufVxyXG5cclxuXHJcbnV0aWwuaW5oZXJpdHMoU3BlZWNoU3ludGhlc2lzLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcclxuXHJcblxyXG5TcGVlY2hTeW50aGVzaXMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIFxyXG4gICAgaWYgKCEoJ3NwZWVjaFN5bnRoZXNpcycgaW4gd2luZG93KSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdub3QgYXZhaWxhYmxlJyk7XHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBuZXcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlKCk7XHJcbiAgICAgICAgdGhpcy52b2ljZXMgPSB3aW5kb3cuc3BlZWNoU3ludGhlc2lzLmdldFZvaWNlcygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWVzc2FnZS52b2ljZSA9IHRoaXMudm9pY2VzWzBdOyAvLyBOb3RlOiBzb21lIHZvaWNlcyBkb24ndCBzdXBwb3J0IGFsdGVyaW5nIHBhcmFtc1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS52b2ljZVVSSSA9ICduYXRpdmUnO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS52b2x1bWUgPSAxOyAvLyAwIHRvIDFcclxuICAgICAgICB0aGlzLm1lc3NhZ2UucmF0ZSA9IDE7IC8vIDAuMSB0byAxMFxyXG4gICAgICAgIHRoaXMubWVzc2FnZS5waXRjaCA9IDI7IC8vMCB0byAyXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLm1lc3NhZ2UubGFuZyA9IHRoaXMubGFuZ3VhZ2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vdmVybGVuZ3RoQXJyYXkgPSBbXTtcclxuICAgICAgICB0aGlzLm92ZXJsZW5ndGhDb3VudCA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TcGVlY2hTeW50aGVzaXMucHJvdG90eXBlLnN0clNwbGl0T25MZW5ndGggPSBmdW5jdGlvbihzdHIsIG1heFdpZHRoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIHJlc3VsdEFyciA9IFtdO1xyXG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8oW1xcc1xcblxccl0rKS8pO1xyXG4gICAgdmFyIGNvdW50ID0gcGFydHMubGVuZ3RoO1xyXG4gICAgdmFyIHdpZHRoID0gMDtcclxuICAgIHZhciBzdGFydCA9IDA7XHJcbiAgICBmb3IgKHZhciBpPTA7IGk8Y291bnQ7ICsraSkge1xyXG4gICAgICAgIHdpZHRoICs9IHBhcnRzW2ldLmxlbmd0aDtcclxuICAgICAgICBpZiAod2lkdGggPiBtYXhXaWR0aCkge1xyXG4gICAgICAgICAgICByZXN1bHRBcnIucHVzaCggcGFydHMuc2xpY2Uoc3RhcnQsIGkpLmpvaW4oJycpICk7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gaTtcclxuICAgICAgICAgICAgd2lkdGggPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHRBcnI7XHJcbn07XHJcblxyXG5cclxuU3BlZWNoU3ludGhlc2lzLnByb3RvdHlwZS5vbkVuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICBcclxuICAgIGlmKCh0aGlzLm92ZXJsZW5ndGhBcnJheS5sZW5ndGgpID09PSB0aGlzLm92ZXJsZW5ndGhDb3VudClcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1lc3NhZ2Uub25lbmQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5vdmVybGVuZ3RoQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMub3Zlcmxlbmd0aEFycmF5ID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMub3Zlcmxlbmd0aENvdW50KTtcclxuICAgICAgICArK3RoaXMub3Zlcmxlbmd0aENvdW50O1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS50ZXh0ID0gdGhpcy5vdmVybGVuZ3RoQXJyYXlbdGhpcy5vdmVybGVuZ3RoQ291bnRdO1xyXG4gICAgICAgIHdpbmRvdy5zcGVlY2hTeW50aGVzaXMuc3BlYWsodGhpcy5tZXNzYWdlKTtcclxuICAgIH1cclxufTtcclxuXHJcblNwZWVjaFN5bnRoZXNpcy5wcm90b3R5cGUuc3BlYWsgPSBmdW5jdGlvbihfdGV4dCwgX29wdGlvbnMpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIFxyXG4gICAgd2luZG93LnNwZWVjaFN5bnRoZXNpcy5jYW5jZWwoKTtcclxuICAgIFxyXG4gICAgaWYoX3RleHQubGVuZ3RoID4gMjAwKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMub3Zlcmxlbmd0aEFycmF5ID0gdGhpcy5zdHJTcGxpdE9uTGVuZ3RoKF90ZXh0LCAyMDApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMub3Zlcmxlbmd0aEFycmF5KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1lc3NhZ2UudGV4dCA9IHRoaXMub3Zlcmxlbmd0aEFycmF5WzBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uZW5kID0gZnVuY3Rpb24oZXZlbnQpe190aGlzLm9uRW5kKGV2ZW50KTt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdpbmRvdy5zcGVlY2hTeW50aGVzaXMuc3BlYWsodGhpcy5tZXNzYWdlKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMubWVzc2FnZS50ZXh0ID0gX3RleHQ7XHJcbiAgICBcclxuICAgIHRoaXMubWVzc2FnZS5vbmVuZCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMubWVzc2FnZS5vbnN0YXJ0ID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5tZXNzYWdlLm9ucGF1c2UgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLm1lc3NhZ2Uub25yZXN1bWUgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLm1lc3NhZ2Uub25lcnJvciA9IHVuZGVmaW5lZDtcclxuICAgIFxyXG4gICAgaWYodHlwZW9mIF9vcHRpb25zICE9PSAndW5kZWZpbmVkJylcclxuICAgIHtcclxuICAgICAgICBpZih0eXBlb2YgX29wdGlvbnMub25FbmQgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbmVuZCA9IF9vcHRpb25zLm9uRW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodHlwZW9mIF9vcHRpb25zLm9uU3RhcnQgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbnN0YXJ0ID0gX29wdGlvbnMub25TdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHR5cGVvZiBfb3B0aW9ucy5vblBhdXNlID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub25wYXVzZSA9IF9vcHRpb25zLm9uUGF1c2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0eXBlb2YgX29wdGlvbnMub25SZXN1bWUgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbnJlc3VtZSA9IF9vcHRpb25zLm9uUmVzdW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodHlwZW9mIF9vcHRpb25zLm9uRXJyb3IgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbmVycm9yID0gX29wdGlvbnMub25lcnJvcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LnNwZWVjaFN5bnRoZXNpcy5zcGVhayh0aGlzLm1lc3NhZ2UpO1xyXG59O1xyXG5cclxuU3BlZWNoU3ludGhlc2lzLnByb3RvdHlwZS5hbnN3ZXIgPSBmdW5jdGlvbihfZW1pdCwgX29wdGlvbnMpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIFxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLnNwZWVjaExpc3QubGVuZ3RoOyArK2opXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3BlZWNoTGlzdFtqXS5jb2RlID09PSB0aGlzLmxhbmd1YWdlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLnNwZWVjaExpc3Rbal0uaXRlbXMubGVuZ3RoOyArK2spXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50RGV0ZWN0aW9uSXRlbSA9IHRoaXMuc3BlZWNoTGlzdFtqXS5pdGVtc1trXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudERldGVjdGlvbkl0ZW0uZW1pdCA9PT0gX2VtaXQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbkVuZCc6IF9vcHRpb25zLm9uRW5kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnb25FcnJvcic6IF9vcHRpb25zLm9uRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdvblN0YXJ0JzogX29wdGlvbnMub25TdGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ29uUGF1c2UnOiBfb3B0aW9ucy5vblBhdXNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnb25SZXN1bWUnOiBfb3B0aW9ucy5vblJlc3VtZVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX29wdGlvbnMuc3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGVhayhjdXJyZW50RGV0ZWN0aW9uSXRlbS5hbnN3ZXJzLnN1Y2Nlc3NbTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnREZXRlY3Rpb25JdGVtLmFuc3dlcnMuc3VjY2Vzcy5sZW5ndGgpICsgMCldLnJlcGxhY2UoJyNSRVBMQUNFIycsIF9vcHRpb25zLnJlcGxhY2UpLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGVhayhjdXJyZW50RGV0ZWN0aW9uSXRlbS5hbnN3ZXJzLmZhaWxbTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnREZXRlY3Rpb25JdGVtLmFuc3dlcnMuZmFpbC5sZW5ndGgpICsgMCldLnJlcGxhY2UoJyNSRVBMQUNFIycsIF9vcHRpb25zLnJlcGxhY2UpLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJaYmk3Z2JcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSJdfQ==
