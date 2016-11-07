/**
 *  This store manages all the data that will be collected by the
 *   Macaron Mix Study II interface. It'll record all the data,
 *   and manage all the data that will be displayed in the app.
 *    This is the central hub for all the information flowing
 *     throughout the app!
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';

var LogStore = require('./log-store.js');

var StaircaseTaskActions = Reflux.createActions([
  'previewTargetIcon',
  'previewYourIcon',
  'clickEqual',
  'clickNotEqual',
  'clickSubmit',
  'playTarget',
  'playYours'
]);

var StaircaseTaskStore = Reflux.createStore({

  listenables: [StaircaseTaskActions],

  /**
   *  The "init" function is one of the React functions that acts like a "hook"
   *   so it is automatically called when the app is loaded. This one
   *    initializes all the fields that will be populated with data throughout
   *     the course of the study.
   **/
  init: function() {
    this._studyRecord = [];
    this._currentStaircaseTask = [];
    this._currentIconNumber = 1;  // counts up to 20
    this._currentStairPhase = 1;  // counts up to 5
    this._totalNIcons = 30; // TODO Change this to the actual number after testing!
    this._nSteps = 3;      // TODO Change this after piloting!
    this._approachingTarget = true;
    this._currentMix = 0;         // decrements and increments as they click
                                  //  equal and not-equal

    this._globalTStart = new Date().getTime()/(1000*60); //minutes since epoch
    this._currentTStart = new Date().getTime()/(1000*60);
    this._totalClicks = 0;        // number of clicks used in the study...

    this._currentlyPlaying = "none";
    this._autoplayStatus = "on";

    this._canSubmit = false;

    this._studyRecord.push("begin study");
    this._studyRecord.push(this._globalTStart);
    this._iconPairings = [{target:1, yours:2},
                          {target:1, yours:3},
                          {target:1, yours:4},
                          {target:1, yours:5},
                          {target:1, yours:6},
                          {target:2, yours:1},
                          {target:2, yours:3},
                          {target:2, yours:4},
                          {target:2, yours:5},
                          {target:2, yours:6},
                          {target:3, yours:1},
                          {target:3, yours:2},
                          {target:3, yours:4},
                          {target:3, yours:5},
                          {target:3, yours:6},
                          {target:4, yours:1},
                          {target:4, yours:2},
                          {target:4, yours:3},
                          {target:4, yours:5},
                          {target:4, yours:6},
                          {target:5, yours:1},
                          {target:5, yours:2},
                          {target:5, yours:3},
                          {target:5, yours:4},
                          {target:5, yours:6},
                          {target:6, yours:1},
                          {target:6, yours:2},
                          {target:6, yours:3},
                          {target:6, yours:4},
                          {target:6, yours:5},
                        ]

    console.log(this._studyRecord);
    LogStore.actions.log();
  },

  /**
   *  "Play Target" will handle the playing of the target icon by:
   *    - stop playing whatever else might be playing
   *    - change this icon's class to "playing"
   *    - using the web-audio API to play the icon,
   *    - reset that all when it's done!
   **/
  playTarget: function() {
    // Stop the other icon if it's playing...
    if (this._currentlyPlaying == "your"); {
      document.getElementById("your-icon").className = "icon not-playing";
      if (document.getElementById("your-source"))
        document.getElementById("your-source").stop();
      this._currentlyPlaying = "none";
    }

    this._currentlyPlaying = "target";
    document.getElementById("target-icon").className = "icon playing";
    document.getElementById("your-icon").className = "icon no-clicking";


    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
		var trackLength = 3; //s
		var channels = 1; // Standard mono-audio
		var sampleRate = 44100; //Hz (44100 is pretty universal)
		var bitDepth = 8; // Low-fi...
		var bitRate = channels * sampleRate * bitDepth;
		var sampleSize = (bitDepth * channels) / (8); //bytes
		var nSamples = sampleRate * trackLength;
		var totalSize = (nSamples * sampleSize) + 44;

		var range = Math.pow(2, bitDepth - 1) - 2;
							// subtract 2 to avoid any clipping.

		var phaseIntegral = 0;
		var dt_in_s = 1.0/sampleRate;

		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		var source = audioCtx.createBufferSource();
		var myAudioBuffer = audioCtx.createBuffer(channels, totalSize, sampleRate);
		var buffer = myAudioBuffer.getChannelData(0);

		// calculate the speaker displacement at each frame
		//  emulating a sinewave here...
		for (var i=0; i<=nSamples; i=i+1) {

 		  var t = ((i * 1000) / sampleRate);

			var amp = this._getCurrentTargetAmplitude(t);
			var freq = 250 // hard coded for the study interface :)

			if (i == 0) {
				// phaseIntegral = frequency;
			} else {
				phaseIntegral += (freq)*dt_in_s;
			}


			var v = amp* Math.sin(2 * Math.PI * phaseIntegral);
			var oscOffset = Math.round(range * v);

			if (oscOffset < 0) {
				oscOffset = ~(Math.abs(oscOffset));
			}

			// Range - Offset = WAV encoding of Offset... Weird!
			buffer[(i*sampleSize)] = v; /*needs to be in range  -1 to 1 to work for AudioBufferSourceNode*/
		}

		source.buffer = myAudioBuffer;
		source.connect(audioCtx.destination);
    source.id = "target-source";
    source.onended = function() {
      document.getElementById("target-icon").className = "icon not-playing";
      document.getElementById("your-icon").className = "icon not-playing";
      this._currentlyPlaying = "none";
    }
    source.start();
  },

  /**
   *  "Play Yours" will play the current icon by:
   *    - stopping whatever else might be playing
   *    - changing this icon's class to "playing"
   *    - using the web-audio API to play the icon,
   *    - resetting that all when it's done!
   *
   *  Major credit to Oliver Schneider (UBC) for devising the way of
   *   playing the icon hi-fi with the web-audio api using and a buffer!
   **/
  playYours: function() {

    // Stop the other icon if it's playing...
    if (this._currentlyPlaying == "target"); {
      document.getElementById("target-icon").className = "icon not-playing";
      if (document.getElementById("target-source"))
        document.getElementById("target-source").stop();
      this._currentlyPlaying = "none";
    }

    this._currentlyPlaying = "yours";
    document.getElementById("your-icon").className = "icon playing";
    document.getElementById("target-icon").className = "icon no-clicking";


    this._currentStaircaseTask.push("previewed their icon");

    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
		var trackLength = 3; //s
		var channels = 1; // Standard mono-audio
		var sampleRate = 44100; //Hz (44100 is pretty universal)
		var bitDepth = 8; // Low-fi...
		var bitRate = channels * sampleRate * bitDepth;
		var sampleSize = (bitDepth * channels) / (8); //bytes
		var nSamples = sampleRate * trackLength;
		var totalSize = (nSamples * sampleSize) + 44;

		var range = Math.pow(2, bitDepth - 1) - 2;
							// subtract 2 to avoid any clipping.

		var phaseIntegral = 0;
		var dt_in_s = 1.0/sampleRate;

		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		var source = audioCtx.createBufferSource();
		var myAudioBuffer = audioCtx.createBuffer(channels, totalSize, sampleRate);
		var buffer = myAudioBuffer.getChannelData(0);

		// calculate the speaker displacement at each frame
		//  emulating a sinewave here...
		for (var i=0; i<=nSamples; i=i+1) {

 		  var t = ((i * 1000) / sampleRate);

			var amp = this._getCurrentTargetAmplitude(t);
			var freq = 250 // hard coded for the study interface :)

			if (i == 0) {
				// phaseIntegral = frequency;
			} else {
				phaseIntegral += (freq)*dt_in_s;
			}


			var v = amp* Math.sin(2 * Math.PI * phaseIntegral);
			var oscOffset = Math.round(range * v);

			if (oscOffset < 0) {
				oscOffset = ~(Math.abs(oscOffset));
			}

			// Range - Offset = WAV encoding of Offset... Weird!
			buffer[(i*sampleSize)] = v; /*needs to be in range  -1 to 1 to work for AudioBufferSourceNode*/
		}

		source.buffer = myAudioBuffer;
		source.connect(audioCtx.destination);
    source.id = "your-source";
    source.onended = function() {
      document.getElementById("target-icon").className = "icon not-playing";
      document.getElementById("your-icon").className = "icon not-playing";
      this._currentlyPlaying = "none";
    }
    source.start();
  },

  /**
   *  "Click Equal" handles what should happen when the "equal"
   *   button is clicked by:
   *     - incrementing/decrementing the current mix,
   *     - recording the action in the current task,
   *     - updating the icon that will be played next,
   *     - updating the status of the "submit" button,
   *     - initiating autoplay if it's turned on!
   **/
  clickEqual: function() {

    // Case 1: We're approaching the target icon
    if (this._approachingTarget) {
      this._moveTowardsTarget();
    }
    // Case 2: We're moving away from the target
    else {
      this._changeDirection();
      this._moveAwayFromTarget();
    }
  },

  /**
   *  "Click Not-Equal" handles the event that the "not-equal" button is
   *   clicked by:
   *     - incrementing/decrementing the current mix,
   *     - recording the action in the current task,
   *     - reversing the direction of staitcasing,
   *     - updating the icon that will be played next,
   *     - updating the status of the "submit" button,
   *     - initiating autoplay if it's turned on!
   **/
  clickNotEqual: function() {
    // Case 1: We're approaching the target icon
    if (this._approachingTarget) {
      this._changeDirection();
      this._moveTowardsTarget();
    }
    // Case 2: We're headed away from the target icon
    else {
      this._moveAwayFromTarget();
    }
  },




  /**
   *     BEGIN PRIVATE FUNCTIONS
   * most of these are too short to merit extensive documentation...
   **/

  _moveTowardsTarget: function() {
    var stepSize = Math.round(10/this._currentStairPhase);
    this._currentMix += stepSize;
    this._currentStaircaseTask.push(this._currentMix);
    console.log("made a step in the right direction!  " + this._currentMix);
  },

  _moveAwayFromTarget: function() {
    var stepSize = Math.round(10/this._currentStairPhase);
    this._currentMix -= stepSize;
    this._currentStaircaseTask.push(this._currentMix);
    console.log("Moved away from target...  " + this._currentMix);
  },

  _changeDirection: function() {
    this._approachingTarget = !this._approachingTarget;
    this._currentStairPhase++;
    var hasEnoughSteps = this._currentStairPhase == this._nSteps;
    if (hasEnoughSteps) {
      this._canSubmit = true;
      this._openForSubmission();
      if (this._isEven(this._nSteps))
        this._disableNotEqualButton();
      else
        this._disableEqualButton();
    }
    this._currentStaircaseTask.push(this._currentMix);
    console.log("changed direction at: " + this._currentMix);
  },

  _disableEqualButton: function() {
    // TODO
    document.getElementById("equal-button").className += " unavailable";
  },

  _disableNotEqualButton: function() {
    // TODO
    document.getElementById("not-equal-button").className += " unavailable";
  },

  _getCurrentTargetAmplitude: function(t) {
    var i = this._iconPairings[this._currentIconNumber].target - 1;
    var ampData = waveData[i];
    var amp = 0.1; // default
    for (var j=0; j<ampData.length; j++) {

		 // Case 1: t is less than first keyframe
		 if ((j==0) && (t <= ampData[j].t)) {
			 amp = ampData[j].value;
		 }

		 // Case 2: t is between two keyframes
		 else if ((t < ampData[j].t) && (t > ampData[j-1].t)) {
			 var rise = ampData[j].value - ampData[j-1].value;
			 var run  = ampData[j].t - ampData[j-1].t;
			 var slope = rise/run;
			 amp = (slope * (t - ampData[j-1].t)) + ampData[j-1].value;
		 }

		 // Case 3: t is beyond final keyframe
		 else if ((j == (ampData.length-1)) && (t > ampData[j].t)) {
			 amp = ampData[j].value;
		 }
	 } // End of the amplitude search
	 return amp;
  },

  _isEven: function(x) {
    !(x & 1);
  }

});

module.exports = {
  actions:StaircaseTaskActions,
  store:StaircaseTaskStore
};


var waveData1 = [
        {
          "id": 263,
          "t": 0,
          "value": 0.6609196616507107,
          "selected": false
        },
        {
          "id": 264,
          "t": 100,
          "value": 0.13731804984211493,
          "selected": false
        },
        {
          "id": 265,
          "t": 200,
          "value": 0.8664597719942129,
          "selected": false
        },
        {
          "id": 266,
          "t": 300,
          "value": 0.46235011113631086,
          "selected": false
        },
        {
          "id": 267,
          "t": 400,
          "value": 0.7763798539131679,
          "selected": false
        },
        {
          "id": 268,
          "t": 500,
          "value": 0.7365254439935847,
          "selected": false
        },
        {
          "id": 269,
          "t": 600,
          "value": 0.11889881267270574,
          "selected": false
        },
        {
          "id": 270,
          "t": 700,
          "value": 0.48093229950139516,
          "selected": false
        },
        {
          "id": 271,
          "t": 800,
          "value": 0.8272716300326786,
          "selected": false
        },
        {
          "id": 272,
          "t": 900,
          "value": 0.96624775603498,
          "selected": false
        },
        {
          "id": 273,
          "t": 1000,
          "value": 0.4530446290679162,
          "selected": false
        },
        {
          "id": 274,
          "t": 1100,
          "value": 0.44830560273986597,
          "selected": false
        },
        {
          "id": 275,
          "t": 1200,
          "value": 0.5163285485690046,
          "selected": false
        },
        {
          "id": 276,
          "t": 1300,
          "value": 0.31363522770610386,
          "selected": false
        },
        {
          "id": 277,
          "t": 1400,
          "value": 0.3064652042261775,
          "selected": false
        },
        {
          "id": 278,
          "t": 1500,
          "value": 0.14907750475545312,
          "selected": false
        },
        {
          "id": 279,
          "t": 1600,
          "value": 0.9204995510764995,
          "selected": false
        },
        {
          "id": 280,
          "t": 1700,
          "value": 0.7367372505756618,
          "selected": false
        },
        {
          "id": 281,
          "t": 1800,
          "value": 0.0713950295124437,
          "selected": false
        },
        {
          "id": 282,
          "t": 1900,
          "value": 0.6436516981646314,
          "selected": false
        },
        {
          "id": 283,
          "t": 2000,
          "value": 0.6724276694679672,
          "selected": false
        },
        {
          "id": 284,
          "t": 2100,
          "value": 0.6412851735431726,
          "selected": false
        },
        {
          "id": 285,
          "t": 2200,
          "value": 0.32964498368773354,
          "selected": false
        },
        {
          "id": 286,
          "t": 2300,
          "value": 0.6692259368564188,
          "selected": false
        },
        {
          "id": 287,
          "t": 2400,
          "value": 0.8172599211660962,
          "selected": false
        },
        {
          "id": 288,
          "t": 2500,
          "value": 0.5750134372451459,
          "selected": false
        },
        {
          "id": 289,
          "t": 2600,
          "value": 0.9057342840913365,
          "selected": false
        },
        {
          "id": 290,
          "t": 2700,
          "value": 0.9053349018542887,
          "selected": false
        },
        {
          "id": 291,
          "t": 2800,
          "value": 0.22379590747499511,
          "selected": false
        },
        {
          "id": 292,
          "t": 2900,
          "value": 0.5120550256665919,
          "selected": false
        }
      ]
var waveData2 = [
        {
          "id": 213,
          "t": 236.65893271461726,
          "value": 9.020562075079397e-17,
          "selected": false
        },
        {
          "id": 220,
          "t": 243.61948955916475,
          "value": 1,
          "selected": false
        },
        {
          "id": 214,
          "t": 508.1206496519728,
          "value": 0.9999999999999999,
          "selected": false
        },
        {
          "id": 215,
          "t": 515.0812064965196,
          "value": 0.006249999999999645,
          "selected": false
        },
        {
          "id": 216,
          "t": 1632.2505800464037,
          "value": 0,
          "selected": false
        },
        {
          "id": 217,
          "t": 2651.9721577726214,
          "value": 1,
          "selected": false
        },
        {
          "id": 218,
          "t": 2658.932714617169,
          "value": 1.1102230246251565e-16,
          "selected": false
        }
      ]
var waveData3 = [
  {
    "id": 0,
    "t": 560.3248259860787,
    "value": 0,
    "selected": true
  },
  {
    "id": 201,
    "t": 563.8051044083526,
    "value": 0.9999999999999999,
    "selected": true
  },
  {
    "id": 202,
    "t": 1580.0464037122968,
    "value": 1,
    "selected": true
  },
  {
    "id": 203,
    "t": 1587.006960556844,
    "value": 1.1102230246251565e-16,
    "selected": true
  },
  {
    "id": 205,
    "t": 1941.995359628771,
    "value": 9.020562075079397e-17,
    "selected": false
  },
  {
    "id": 204,
    "t": 1948.9559164733184,
    "value": 1,
    "selected": false
  },
  {
    "id": 206,
    "t": 2213.457076566126,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 207,
    "t": 2220.417633410673,
    "value": 0.006249999999999645,
    "selected": false
  }
]
var waveData4 = [
  {
    "id": 201,
    "t": 344.54756380510423,
    "value": 0,
    "selected": false
  },
  {
    "id": 202,
    "t": 348.0278422273781,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 204,
    "t": 1371.2296983758695,
    "value": 1.1102230246251565e-16,
    "selected": false
  },
  {
    "id": 205,
    "t": 1781.902552204177,
    "value": 9.020562075079397e-17,
    "selected": false
  },
  {
    "id": 206,
    "t": 1788.8631090487245,
    "value": 1,
    "selected": false
  },
  {
    "id": 208,
    "t": 2784.222737819024,
    "value": 0.006249999999999645,
    "selected": false
  }
]
var waveData5 = [
  {
    "id": 213,
    "t": 132.25058004640385,
    "value": 9.020562075079397e-17,
    "selected": false
  },
  {
    "id": 220,
    "t": 139.21113689095134,
    "value": 1,
    "selected": false
  },
  {
    "id": 214,
    "t": 403.7122969837594,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 215,
    "t": 410.6728538283062,
    "value": 0.006249999999999645,
    "selected": false
  },
  {
    "id": 216,
    "t": 636.890951276102,
    "value": 0,
    "selected": false
  },
  {
    "id": 217,
    "t": 1656.6125290023197,
    "value": 1,
    "selected": false
  },
  {
    "id": 218,
    "t": 1663.5730858468673,
    "value": 1.1102230246251565e-16,
    "selected": false
  },
  {
    "id": 221,
    "t": 1830.6264501160094,
    "value": 4.5102810375396984e-17,
    "selected": false
  },
  {
    "id": 222,
    "t": 2888.631090487236,
    "value": 1,
    "selected": false
  },
  {
    "id": 223,
    "t": 2888.631090487239,
    "value": 0,
    "selected": false
  }
]
var waveData6 = [
  {
    "id": 227,
    "t": 3.4802784222739263,
    "value": 0,
    "selected": false
  },
  {
    "id": 229,
    "t": 1023.201856148492,
    "value": 1,
    "selected": false
  },
  {
    "id": 230,
    "t": 1030.1624129930392,
    "value": 0,
    "selected": false
  },
  {
    "id": 231,
    "t": 1433.8747099767984,
    "value": 0,
    "selected": false
  },
  {
    "id": 232,
    "t": 1440.835266821346,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 233,
    "t": 1677.494199535963,
    "value": 1,
    "selected": false
  },
  {
    "id": 234,
    "t": 1684.4547563805102,
    "value": 1.1102230246251565e-16,
    "selected": false
  },
  {
    "id": 236,
    "t": 2025.522041763341,
    "value": 1.3877787807814457e-16,
    "selected": false
  },
  {
    "id": 235,
    "t": 2032.4825986078888,
    "value": 1,
    "selected": false
  },
  {
    "id": 237,
    "t": 2993.039443155453,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 238,
    "t": 2999.999999999999,
    "value": 0.0062500000000002,
    "selected": false
  }
]
var waveData = [waveData1,waveData2,waveData3,waveData4,waveData5,waveData6];
