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