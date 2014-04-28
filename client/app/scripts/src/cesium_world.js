/* globals Cesium, CesiumWorld*/

/**
* Export for require statemant
*/ 
module.exports = CesiumWorld;


/**
* Constructor
*/
function CesiumWorld() {

	this.init();
}


CesiumWorld.prototype.init = function() {
   var widget = new Cesium.CesiumWidget('cesiumContainer');
   
   console.log(widget.length);

};


CesiumWorld.prototype.update = function() {
	
};