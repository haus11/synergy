/* globals Cesium, CesiumWorld */

/**
* Export for require statemant
*/ 
module.exports = CesiumWorld;


/**
* Constructor
*/
function CesiumWorld(_speechRecognition) {

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
        this.speechRecognition = _speechRecognition;
        
        console.log('Up Vector: ' + this.widget.scene.camera.up);

        
        this.widget.resize();
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
        
        this.init();
}


CesiumWorld.prototype.init = function() {
   console.log(this.geoCoder.viewModel.search);
   console.log(this.geoCoder);
};

CesiumWorld.prototype.flyTo = function(_location) {
    this.geoCoder.viewModel.searchText = _location;
    this.geoCoder.viewModel.search();
};

CesiumWorld.prototype.changeLayer = function(_layer) {
    for(var i = 0; i < this.providerViewModels.length; ++i)
    {
        if(this.providerViewModels[i].name === _layer)
        {
            this.baseLayerPicker.viewModel.selectedItem = this.providerViewModels[i];
        }
    }
};


CesiumWorld.prototype.update = function() {
	
};