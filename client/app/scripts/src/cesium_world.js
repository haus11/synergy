/* globals Cesium, CesiumWorld, window, $, navigator */

/**
* Export for require statemant
*/
module.exports = CesiumWorld;


/**
* Constructor
*/
function CesiumWorld(_speechRecognition, _speechSynthesis) {
        
        this.providerViewModels = [];
        this.providerViewModels.push(new Cesium.ImageryProviderViewModel({
             name : 'OpenStreetMap',
             iconUrl : Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
             tooltip : 'OpenStreetMap (OSM) is a collaborative project to create a free editable map of the world.\nhttp://www.openstreetmap.org',
             creationFunction : function() {
                 return new Cesium.OpenStreetMapImageryProvider({
                     url : 'http://tile.openstreetmap.org/'
                 });
             }
         }));

         this.providerViewModels.push(new Cesium.ImageryProviderViewModel({
             name : 'black marble',
             iconUrl : Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/blackMarble.png'),
             tooltip : 'The lights of cities and villages trace the outlines of civilization in this global view of the Earth at night as seen by NASA/NOAA\'s Suomi NPP satellite.',
             creationFunction : function() {
                 return new Cesium.TileMapServiceImageryProvider({
                     url : 'https://cesiumjs.org/blackmarble',
                     maximumLevel : 8,
                     credit : 'Black Marble imagery courtesy NASA Earth Observatory'
                 });
             }
         }));

         this.providerViewModels.push(new Cesium.ImageryProviderViewModel({
             name : 'Bing',
             iconUrl : Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
             tooltip : 'The lights of cities and villages trace the outlines of civilization in this global view of the Earth at night as seen by NASA/NOAA\'s Suomi NPP satellite.',
             creationFunction : function() {
                 return new Cesium.BingMapsImageryProvider({
                    url : 'https://dev.virtualearth.net',
                    mapStyle : Cesium.BingMapsStyle.AERIAL
                });
             }
         }));

        var _this = this;
      
        this.widget = new Cesium.CesiumWidget('cesiumContainer', {
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
        this.layers = this.widget.centralBody.imageryLayers;
        this.baseLayerPicker = new Cesium.BaseLayerPicker('baseLayerContainer', this.layers, this.providerViewModels);
        this.baseLayerPicker.viewModel.selectedItem = this.providerViewModels[2];
        this.geoCoder = new Cesium.Geocoder({'container' : 'cesiumGeocoder', 'scene' : this.widget.scene});
        this.ellipsoid = this.widget.centralBody.ellipsoid;
        this.centralBody = this.widget.centralBody;
        this.centralBody.depthTestAgainstTerrain = true;
      
    
        this.widget.scene.camera.rotateRight (1.7453292519943295);
          
        this.cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
            url : 'http://cesiumjs.org/stk-terrain/tilesets/world/tiles',
            credit : 'Terrain data courtesy Analytical Graphics, Inc.'
        });
        this.defaultTerrainProvider = this.centralBody.terrainProvider;

        this.speechRecognition = _speechRecognition;
        this.speechSynthesis = _speechSynthesis;
        
        this.lastLocation = '';

        this.speechRecognition.on('navigateTo', function(event)
        {
            //console.log(event.action);
            _this.flyTo(event.action);
        });

        this.speechRecognition.on('selectLayer', function(event)
        {
            //console.log(event.action);
            _this.changeLayer(event.action);
        });

        this.speechRecognition.on('moveForward', function(event)
        {
            console.log(event);
            _this.move('forward', event.action);
        });

        this.speechRecognition.on('moveBackward', function(event)
        {
            console.log(event);
            _this.move('backward');
        });

        this.speechRecognition.on('moveUp', function(event)
        {
            console.log(event);
            _this.move('up');
        });

        this.speechRecognition.on('moveDown', function(event)
        {
            console.log(event);
            _this.move('down');
        });

        this.speechRecognition.on('moveLeft', function(event)
        {
            console.log(event);
            _this.move('left');
        });

        this.speechRecognition.on('moveRight', function(event)
        {
            console.log(event);
            _this.move('right');
        });

        this.speechRecognition.on('setTerrain', function(event)
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
        
        this.speechRecognition.on('informationRequest', function(event)
        {
            console.log(event);
            _this.readAbstractFromWikipedia();
        });

        this.init();
}


CesiumWorld.prototype.setTerrain = function(_state)
{
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

/*
    console.log(_factor);
    if(_factor === '')
    {
        _factor = 1.2;
    }
    else if(_factor === '2')
    {
        console.log('two detected');
        _factor = 1.0;
    }*/
    
    _factor = 1.2;
    var moveRate = this.ellipsoid.cartesianToCartographic(this.widget.scene.camera.position).height / _factor;

    switch(_direction)
    {
        case 'forward':
        {
            this.widget.scene.camera.moveForward(moveRate);
            //this.speechSynthesis.answer('moveForward', {'state': true});
            break;
        }
        case 'backward':
        {
            this.widget.scene.camera.moveBackward(moveRate);
            //this.speechSynthesis.answer('moveBackward', {'state': true});
            break;
        }
        case 'up':
        {
            this.widget.scene.camera.moveUp(moveRate);
            //this.speechSynthesis.answer('moveUp', {'state': true});
            break;
        }
        case 'down':
        {
            this.widget.scene.camera.moveDown(moveRate);
            //this.speechSynthesis.answer('moveDown', {'state': true});
            break;
        }
        case 'left':
        {
            this.widget.scene.camera.moveLeft(moveRate);
            //this.speechSynthesis.answer('moveLeft', {'state': true});
            break;
        }
        case 'right':
        {
            this.widget.scene.camera.moveRight(moveRate);
            //this.speechSynthesis.answer('moveRight', {'state': true});
            break;
        }
    }
};


CesiumWorld.prototype.init = function() {
   //console.log(this.geoCoder.viewModel.search);
   //console.log(this.geoCoder);
    this.widget.resize();
};

CesiumWorld.prototype.flyToMyLocation = function() 
{
    var _this = this;
    
/*
        var camera = this.widget.scene.camera;
        if (camera.transform.equals(Cesium.Matrix4.IDENTITY)) {
            return;
        }

        Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, camera.transform);
        camera.constrainedAxis = undefined;
        camera.lookAt(
                Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.normalize(new Cesium.Cartesian3(0.0, -2.0, 1.0)), 2.0 * this.ellipsoid.maximumRadius),
                Cesium.Cartesian3.ZERO,
                Cesium.Cartesian3.UNIT_Z);

        var controller = this.widget.scene.screenSpaceCameraController;
        controller.ellipsoid = this.ellipsoid;
        controller.enableTilt = true;
        */
        function fly(position) 
        {
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

CesiumWorld.prototype.readAbstractFromWikipedia = function()
{
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

CesiumWorld.prototype.getInformationFromWikipedia = function(_resource)
{
    var resource =  _resource.charAt(0).toUpperCase() + _resource.slice(1);
    var _this = this;
    
    $.ajax({
      dataType: "json",
      crossDomain : true,
      url: "http://dbpedia.org/data/" + resource + ".json",
      success: function(data){
          
          console.log(data);
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
    this.widget.render();
};