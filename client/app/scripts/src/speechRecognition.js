/* globals SpeechRecognition, window, webkitSpeechRecognition*/


var events = require('events');
var util   = require('util');

/**
 * Export for require statemant
 */
module.exports = SpeechRecognition;


/**
 * Constructor
 */
function SpeechRecognition(_speechList) {
    'use strict';

    this.browserRecognition = null;
    this.isRecognizing = false;
    this.language = 'de-DE';
    this.speechList = _speechList;
    this.speechError = false;

    this.init();
}


util.inherits(SpeechRecognition, events.EventEmitter);


SpeechRecognition.prototype.init = function() {
    'use strict';
    
    if (!('webkitSpeechRecognition' in window)) {
        console.log('not available');
    } else {

        this.browserRecognition = new webkitSpeechRecognition();
        this.browserRecognition.continuous = true;
        this.browserRecognition.interimResults = true;
        this.browserRecognition.lang = this.language;
        
        var _this = this;
        
        this.browserRecognition.onstart = function(){_this.onStart();};
        this.browserRecognition.onresult = function(event){_this.onResult(event);};
        this.browserRecognition.onend = function(){_this.onEnd();};
        this.browserRecognition.onerror = function(event){_this.onError(event);};
        
        this.start();
    }
};

SpeechRecognition.prototype.start = function() {
    'use strict';
    this.browserRecognition.start();
};

SpeechRecognition.prototype.stop = function() {
    'use strict';
    this.browserRecognition.stop();
};

SpeechRecognition.prototype.onStart = function() {
    'use strict';
    this.isRecognizing = true;
};

SpeechRecognition.prototype.onResult = function(event) {
    'use strict';
    
    var interimTranscript = '';
    var finalMatch = false;

    for (var i = event.resultIndex; i < event.results.length; ++i) {
        console.log(event.results[i]);
        if (event.results[i].isFinal) {
            finalMatch = true;
            interimTranscript += event.results[i][0].transcript;
        }
    }

    if(finalMatch)
    {
        interimTranscript = this.trimSpaces(interimTranscript);
        
        for(var j = 0; j < this.speechList.length; ++j)
        {
            if(this.speechList[j].code === this.language)
            {
                for(var k = 0; k < this.speechList[j].items.length; ++k)
                {
                    var currentDetectionItem = this.speechList[j].items[k];

                    if(interimTranscript.toLowerCase().indexOf(currentDetectionItem.detect.toLowerCase()) !== -1)
                    {
                        var eventData = {
                            'action' : this.trimSpaces(interimTranscript.replace(currentDetectionItem.detect, '')),
                            'detected' : currentDetectionItem.detect,
                            'emit' : currentDetectionItem.emit,
                            'language' : this.language
                        };

                        this.emit(currentDetectionItem.emit, eventData);
                        return;
                    }
                }
            }
        }
        
        console.log('nichts brauchbares');
    }
    else
    {
        // no final match
    }
};

SpeechRecognition.prototype.trimSpaces = function(_string) {
    'use strict';
    return _string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

SpeechRecognition.prototype.onEnd = function() {
    'use strict';
    this.isRecognizing = false;
    
    if(!this.speechError)
    {
        this.start();
    }
    
    console.log("speech recognition ended");
};

SpeechRecognition.prototype.onError = function(event) {
    'use strict';
    
    if (event.error === 'no-speech') {
        console.log('Error: no speech');
    }
    if (event.error === 'audio-capture') {
        console.log('Error: no microphone');
        this.speechError = true;
    }
    if (event.error === 'not-allowed') {
        console.log('Error: not allowed');
        this.speechError = true;
    }
};