/* globals Cesium, CesiumWorld, window */

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
                     url : 'http://cesiumjs.org/blackmarble',
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
                    url : 'http://dev.virtualearth.net',
                    mapStyle : Cesium.BingMapsStyle.AERIAL
                });
             }
         }));
        
        var _this = this;

        this.widget = new Cesium.CesiumWidget('cesiumContainer', {'imageryProvider': false});
        this.layers = this.widget.centralBody.imageryLayers;
        this.baseLayerPicker = new Cesium.BaseLayerPicker('baseLayerContainer', this.layers, this.providerViewModels);
        this.baseLayerPicker.viewModel.selectedItem = this.providerViewModels[2];
        this.geoCoder = new Cesium.Geocoder({'container' : 'cesiumGeocoder', 'scene' : this.widget.scene});
        this.ellipsoid = this.widget.centralBody.ellipsoid;
        this.speechRecognition = _speechRecognition;
        this.speechSynthesis = _speechSynthesis;
        
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
            _this.move('forward');
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
        
        this.speechRecognition.on('gnhi', function(event)
        {
            console.log(event);
            _this.geoCoder.viewModel.searchText = 'Odessa, Ukraine';
            _this.geoCoder.viewModel.search();
        });
        
        this.init();
}

CesiumWorld.prototype.move = function(_direction) {
    
    var moveRate = this.ellipsoid.cartesianToCartographic(this.widget.scene.camera.position).height / 1.2;
    
    switch(_direction)
    {
        case 'forward':
        {
            this.widget.scene.camera.moveForward(moveRate);
            this.speechSynthesis.answer('moveForward', true);
            break;
        }
        case 'backward':
        {
            this.widget.scene.camera.moveBackward(moveRate);
            this.speechSynthesis.answer('moveBackward', true);
            break;
        }
        case 'up':
        {
            this.widget.scene.camera.moveUp(moveRate);
            this.speechSynthesis.answer('moveUp', true);
            break;
        }
        case 'down':
        {
            this.widget.scene.camera.moveDown(moveRate);
            this.speechSynthesis.answer('moveDown', true);
            break;
        }
        case 'left':
        {
            this.widget.scene.camera.moveLeft(moveRate);
            this.speechSynthesis.answer('moveLeft', true);
            break;
        }
        case 'right':
        {
            this.widget.scene.camera.moveRight(moveRate);
            this.speechSynthesis.answer('moveRight', true);
            break;
        }
    }
};


CesiumWorld.prototype.init = function() {
   console.log(this.geoCoder.viewModel.search);
   console.log(this.geoCoder);
};

CesiumWorld.prototype.flyTo = function(_location) {
    
    this.geoCoder.viewModel.searchText = _location;
    this.geoCoder.viewModel.search();
    
    var _this = this;
    
    window.setTimeout(function(){
        
        var searchResult = _this.geoCoder.viewModel.searchText;

        if(searchResult.indexOf('(not found)') !== -1) {

            _this.speechSynthesis.answer('navigateTo', false, _location);
        }
        else
        {
            _this.speechSynthesis.answer('navigateTo', true, _location);
        }
        
    }, 1000);
};

CesiumWorld.prototype.changeLayer = function(_layer) {
    for(var i = 0; i < this.providerViewModels.length; ++i)
    {
        if(this.providerViewModels[i].name === _layer)
        {
            this.baseLayerPicker.viewModel.selectedItem = this.providerViewModels[i];
            this.speechSynthesis.answer('selectLayer', true, this.providerViewModels[i].name);
            return;
        }
    }
    
    this.speechSynthesis.answer('selectLayer', false, _layer);
};


CesiumWorld.prototype.update = function() {
	
};