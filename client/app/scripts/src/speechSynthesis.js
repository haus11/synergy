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