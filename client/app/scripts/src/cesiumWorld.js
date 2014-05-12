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