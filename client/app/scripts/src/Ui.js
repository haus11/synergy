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