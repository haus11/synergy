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

    this.message = null;
    this.voices  = [];
    this.language = 'de-DE';
    this.speechList = _speechList;
    
    this.init();
}


util.inherits(SpeechSynthesis, events.EventEmitter);


SpeechSynthesis.prototype.init = function() {
    
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
        
        //var _this = this;
    }
};

SpeechSynthesis.prototype.speak = function(_text) {
    this.message.text = _text;
    window.speechSynthesis.speak(this.message);
};

SpeechSynthesis.prototype.answer = function(_emit, _state, _replace) {
    
    for (var j = 0; j < this.speechList.length; ++j)
    {
        if (this.speechList[j].code === this.language)
        {
            for (var k = 0; k < this.speechList[j].items.length; ++k)
            {
                var currentDetectionItem = this.speechList[j].items[k];

                if (currentDetectionItem.emit === _emit)
                {
                    if(_state)
                    {
                         this.speak(currentDetectionItem.answers.success[Math.floor((Math.random() * currentDetectionItem.answers.success.length) + 0)].replace('#REPLACE#', _replace));
                    }
                    else
                    {
                        this.speak(currentDetectionItem.answers.fail[Math.floor((Math.random() * currentDetectionItem.answers.fail.length) + 0)].replace('#REPLACE#', _replace));
                    }
                }
            }
        }
    }
};