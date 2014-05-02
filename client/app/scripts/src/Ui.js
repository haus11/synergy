/* globals Ui, $ */

/**
* Export for require statemant
*/
module.exports = Ui;

/**
* Constructor
*/
function Ui() {
	this.stringTable = [];
	this.stringTable['en'] = [];
	this.stringTable['en']['topoDeac'] = 'Relief off';

	$('#switch-topography').text(this.stringTable['en']['topoDeac']);

}

Ui.prototype.closeWelcomeBox = function() {
	$('#welcomebox-close').click(function()
	{
		$('#welcomebox').fadeOut(500);
	});
};

Ui.prototype.toggleMenu = function () {
	$('#menu-toggler').click(function()
	{
		$('#menu-elements').slideToggle('slow');
	});
};

Ui.prototype.changeRelief = function(_cesiumWorld) {
	$('#switch-topography').click(function() {
		if($('#switch-topography').text() === 'Relief off') {
			$('#switch-topography').removeClass("topography-inactive p-btn-erro");
			$('#switch-topography').addClass("topography-active p-btn-succ");
			$('#switch-topography').text("Relief on");
			_cesiumWorld.setTerrain(true);
		}
		else if($('#switch-topography').text() === 'Relief on'){
			$('#switch-topography').removeClass("topography-active p-btn-succ");
			$('#switch-topography').addClass("topography-inactive p-btn-erro");
			$('#switch-topography').text("Relief off");
			_cesiumWorld.setTerrain(false);
		}
	});
};

console.log(Ui);