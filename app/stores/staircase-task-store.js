/**
 *  This store manages all the data that will be collected by the
 *   Macaron Mix Study II interface. It'll record all the data,
 *   and manage all the data that will be displayed in the app.
 *    This is the central hub for all the information flowing
 *     throughout the app!
 *
 *  Author: Ben Clark - Oct. 2016
 *  Contributions by Oliver Schneider, Nov. 15, 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';

var LogStore = require('./log-store.js');
var AudioHelper = require('./../util/audiohelper.js');


var ICON_TARGET = 0;
var ICON_MIX = 1;

var StaircaseTaskActions = Reflux.createActions([
  'clickEqual',
  'clickNotEqual',
  'playPositionID'
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
    //this._studyRecord = [];
    //this._currentStaircaseTask = [];
    this._currentIconNumber = 1;  // counts up to 20
    this._currentStairPhase = 1;  // counts up to 5
    this._totalNIcons = 30; // TODO Change this to the actual number after testing!
    this._nSteps = 3;       // TODO Change this after piloting!
    this._approachingTarget = true;
    this._currentMix = 0;         // decrements and increments as they click
                                  //  equal and not-equal

    //this._globalTStart = new Date().getTime()/(1000*60); //minutes since epoch
    //this._currentTStart = new Date().getTime()/(1000*60);
    //this._totalClicks = 0;        // number of clicks used in the study...

    this._currentlyPlayingPositionID = null;
    //this._autoplayStatus = "on";

    //this._studyRecord.push("begin study");
    //this._studyRecord.push(this._globalTStart);
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
                        ];

    //this function is idempotent, and used for initialization of the position ID -> Icon Map
    this._assignRandomPositionIDIconMap();

    console.log(this._studyRecord);
    LogStore.actions.log("begin", this._currentMix, "p", this._currentIconNumber);
  },

  _fisher_yates_shuffle: function (array) {
    //from https://www.frankmitchell.org/2015/01/fisher-yates/
    //also widely available elsewhere, e.g., Knuth
  var i = 0;
  var j = 0;
  var temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

},

  _assignRandomPositionIDIconMap: function() {

    //create a randomized list of position IDs
    var positionIDs = [1,2,3];
    this._fisher_yates_shuffle(positionIDs);

    //map each randomized position ID to an Icon, two to the current target and one to the current mix
    this._PositionID_Icon_Map = {};
    this._PositionID_Icon_Map[positionIDs[0]] = ICON_TARGET;
    this._PositionID_Icon_Map[positionIDs[1]] = ICON_TARGET;
    this._PositionID_Icon_Map[positionIDs[2]] = ICON_MIX;
  },

  _resetPlayButtons: function() {
    for (var i = 1; i <= 3; i++) {
      document.getElementById("playbutton-"+i).className = "playbutton not-playing";
      // Stop the other icons if one of them is playing
      //TODO: figure this out
      // if (document.getElementById("audio-"+i))
      // {
      //   document.getElementById("audio-"+i).stop();
      // }
    }
  },

  _bufferOnEnded: function(e) {
      this._resetPlayButtons();
      this._currentlyPlayingPositionID = null;
  },

  /**
  * Given a positionID, probably from a PlayButton, plays the corresponding sound
  **/
  playPositionID:function(positionID) {

    //there are three positions right now (THIS IS HARDCODED; TODO: GENERALIZE)
    //go through all buttons and reset them
    for (var i = 1; i <= 3; i++) {
      document.getElementById("playbutton-"+i).className = "playbutton not-playing no-clicking";
    }

    //now, set the now-playing position to play
    this._currentlyPlayingPositionID = positionID;
    document.getElementById("playbutton-"+positionID).className = "playbutton playing";

    if (this._PositionID_Icon_Map[this._currentlyPlayingPositionID] == ICON_TARGET)
    {
      this.playTarget();
    } else if (this._PositionID_Icon_Map[this._currentlyPlayingPositionID] == ICON_MIX) {
      this.playYours();
    } else {
      console.log("ERROR: Requesting unknown method of playing: " + this._PositionID_Icon_Map[this._currentlyPlayingPositionID]);
    }


  },

  /**
   *  "Play Target" will handle the playing of the target icon by:
   *    - stop playing whatever else might be playing
   *    - change this icon's class to "playing"
   *    - using the web-audio API to play the icon,
   *    - reset that all when it's done!
   **/
  playTarget: function() {
    
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

		var audioCtx = AudioHelper.AudioContextSingleton.getInstance();
		this._source = audioCtx.createBufferSource();
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

		this._source.buffer = myAudioBuffer;
		this._source.connect(audioCtx.destination);
    this._source.id = "target-source";
    this._source.onended = this._bufferOnEnded;
    this._source.start();
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

    var audioCtx = AudioHelper.AudioContextSingleton.getInstance();
		this._source = audioCtx.createBufferSource();
		var myAudioBuffer = audioCtx.createBuffer(channels, totalSize, sampleRate);
		var buffer = myAudioBuffer.getChannelData(0);

    var nDTWSamples = 40;
    var iconInd1 = this._iconPairings[this._currentIconNumber - 1].yours;
    var iconInd2 = this._iconPairings[this._currentIconNumber - 1].target;
    var wave1Amps = waveData[iconInd1 - 1];
    var wave2Amps = waveData[iconInd2 - 1];
    var duration1 = 3000; var duration2 = 3000;
    var partitionedAmps1 = new Array(nDTWSamples);
    var partitionedAmps2 = new Array(nDTWSamples);
    var partitionWidth = Math.round(Math.min(duration1/nDTWSamples, duration2/nDTWSamples));
    var n1 = Math.round(duration1 / partitionWidth);
    var n2 = Math.round(duration2 / partitionWidth);

    var i1 = 0;  var i2 = 0;
    var t1 = 0;  var t2 = 0;
    var j1 = 0;  var j2 = 0;

    console.log('mixing icons: ' + iconInd1 + ' and ' + iconInd2);
    console.log(wave1Amps);
    console.log(wave2Amps);

    /** Partitioning the waveform amplitude **/
    while(t1 <= duration1) {
      if (wave1Amps[i1]) {
        //console.log('case1: ');
        while (t1 >= wave1Amps[i1].t && wave1Amps[i1+1]) { i1++; }
        if (t1 >= wave1Amps[i1].t && (i1+1) == wave1Amps.length) { i1++; }
      }

      if (!wave1Amps[i1]) {
        //console.log('case 2:');
        partitionedAmps1[j1] = wave1Amps[wave1Amps.length-1].value;
      } else if (i1 == 0) {
        //console.log('case 3:');
        partitionedAmps1[j1] = wave1Amps[i1].value;
      } else {
        //console.log('case 4 and final...');
        var rise = wave1Amps[i1].value - wave1Amps[i1-1].value;
        var run = wave1Amps[i1].t - wave1Amps[i1-1].t;
        var slope = rise / run;
        var diffT = t1 - wave1Amps[i1-1].t;
        var sampledValue = wave1Amps[i1-1].value + (slope * diffT);

        // Now avoid a divide by zero error if there are two equal times.
        if (run) { var sampledValue = wave1Amps[i1-1].value + (slope * diffT); }
        else { sampledValue = wave1Amps[i1-1].value; }

        sampledValue = Math.max(0, sampledValue);
        sampledValue = Math.min(1, sampledValue);

        partitionedAmps1[j1] = +sampledValue.toFixed(3);
      }

      t1 += partitionWidth; j1++;
    }

    while (t2 <= duration2) {
      if (wave2Amps[i2]) {
        while (t2 >= wave2Amps[i2].t && wave2Amps[i2+1]) { i2++; }
        if (t2 >= wave2Amps[i2].t && (i2+1) == wave2Amps.length) { i2++; }
      }

      if (!wave2Amps[i2]) {
        partitionedAmps2[j2] = wave2Amps[wave2Amps.length-1].value;
      } else if (i2 == 0) {
        partitionedAmps2[j2] = wave2Amps[i2].value;
      } else {
        var rise = wave2Amps[i2].value - wave2Amps[i2-1].value;
        var run = wave2Amps[i2].t - wave2Amps[i2-1].t;
        var slope = rise / run;
        var diffT = t2 - wave2Amps[i2-1].t;
        var sampledValue = wave2Amps[i2-1].value + (slope * diffT);

        // Now avoid a divide by zero error if there are two equal times.
        if (run) { var sampledValue = wave2Amps[i2-1].value + (slope * diffT); }
        else { sampledValue = wave2Amps[i2-1].value; }

        sampledValue = Math.max(0, sampledValue);
        sampledValue = Math.min(1, sampledValue);

        partitionedAmps2[j2] = +sampledValue.toFixed(3);
      }

      t2 += partitionWidth; j2++;
    }
    var max1 = Math.max.apply(null, partitionedAmps1);
    var max2 = Math.max.apply(null, partitionedAmps2);
    console.log(partitionedAmps1); console.log(partitionedAmps2);

    /** Computing the Cost Matrix **/
    var costMatrix = new Array(n1 * n2);

    for (var i=0; i<=n1; i++) {
      for (var j=0; j<=n2; j++) {
        var costIndex = this._indexFunction(i,j,nSamples);
        var scaledV1 = partitionedAmps1[i] / max1;
        var scaledV2 = partitionedAmps2[j] / max2;
        var cost = this._localCost(scaledV1, scaledV2);
        cost = +cost.toFixed(3);
        costMatrix[costIndex] = cost;
      }
    }


    /** Finding the optimal path through the cost matrix **/
    var i = 0; var j = 0;
    var costSize = n1 + n2;
    var costNodes = new Array(costSize);
    costNodes[0] = {i:0, j:0, cost:costMatrix[this._indexFunction(0,0,nSamples)]};
    var nNodes = 1;

    while ((partitionedAmps1[i+1] != null) || (partitionedAmps2[j+1] != null)) {

      // Case 1: We're at the top of the Cost Matrix
      if (partitionedAmps1[i+1] == null) {
        var newNode = {i:i, j:j+1, cost:costMatrix[this._indexFunction(i,j+1,nSamples)]};
        costNodes[nNodes] = newNode;
        j++; nNodes++;
      }

      // Case 2: We're on the far right of the Cost Matrix
      else if (partitionedAmps2[j+1] == null) {
        var newNode = {i:i+1, j:j, cost:costMatrix[this._indexFunction(i+1,j,nSamples)]};
        costNodes[nNodes] = newNode;
        i++; nNodes++;
      }

      // Case 3: We're somewhere in the middle and need to choose a next step!
      else {
        var up    = costMatrix[this._indexFunction(i+1, j,  nSamples)];
        var right = costMatrix[this._indexFunction(i,   j+1,nSamples)];
        var diag  = costMatrix[this._indexFunction(i+1, j+1,nSamples)];
        var minCost = Math.min(up, right, diag);

        if (up == minCost) {
          costNodes[nNodes] = {i:i+1, j:j, cost:up}
          i++; nNodes++
        }

        else if (right == minCost) {
          costNodes[nNodes] = {i:i, j:j+1, cost: right}
          j++; nNodes++;
        }

        else if (diag == minCost) {
          costNodes[nNodes] = {i:i+1, j:j+1, cost: diag};
          j++; i++; nNodes++;
        }

        else {
          alert('uh oh... cost Matrix problems :(');
          break;
        }
      }
    }
    console.log(costNodes);

    /** Find all edges to form keyframe pairings **/
    var k = 0;
    var outputNodes = new Array(nNodes);
    var nOutNodes = 0;

    while (costNodes[k+1]) {

      // Case 1: there are a few repeat I indices
      if (costNodes[k].i == costNodes[k+1].i) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].i == costNodes[newK].i) { newK++; }
          else {done = true;}
        }
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[newK].j};
        nOutNodes++;
        k = newK;
      }

      // Case 2: there are a few repeat J indices
      else if (costNodes[k].j == costNodes[k+1].j) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].j == costNodes[newK].j) { newK++; }
          else {done = true;}
        }
        //var newI = Math.round((costNodes[k].i+costNodes[newK].i)/2);
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[newK].i, j:costNodes[k].j};
        nOutNodes++;
        k = newK;
      }

      // Case 3: No repeats
      else {
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
      }

      k++;
    }

    console.log('output nodes: ');
    console.log(outputNodes);
    var finalNodes = [];
    var wave2value = this._currentMix;
    var wave1value = 100 - wave2value;
    for (var k=0; k<nNodes; k++) {
      var i = costNodes[k].i;
      var j = costNodes[k].j;
      //var i = outputNodes[k].i;
      //var j = outputNodes[k].j;
      var iT = i * partitionWidth;
      var jT = j * partitionWidth;
      var iV = partitionedAmps1[i];
      var jV = partitionedAmps2[j];
      var newT = (wave1value*iT*0.01) + (wave2value*jT*0.01);
      var newV = (wave1value*iV*0.01) + (wave2value*jV*0.01);
      finalNodes.push({id:12, t:newT, value:newV, selected:false});
    }
    console.log('final nodes: ');
    console.log(finalNodes);


		// calculate the speaker displacement at each frame
		//  emulating a sinewave here...
		for (var i=0; i<=nSamples; i=i+1) {

 		  var t = ((i * 1000) / sampleRate);

			var amp = this._getCurrentYourAmplitude(t, finalNodes);
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

		this._source.buffer = myAudioBuffer;
		this._source.connect(audioCtx.destination);
    this._source.id = "your-source";
    this._source.onended = this._bufferOnEnded;
    this._source.start();
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
    //this._currentStaircaseTask.push(this._currentMix);
    console.log("made a step in the right direction!  " + this._currentMix);
  },

  _moveAwayFromTarget: function() {
    var stepSize = Math.round(10/this._currentStairPhase);
    this._currentMix -= stepSize;
    //this._currentStaircaseTask.push(this._currentMix);
    console.log("Moved away from target...  " + this._currentMix);
  },

  _changeDirection: function() {
    this._currentStairPhase++;
    var noMoreIcons = this._currentIconNumber == this._totalNIcons
    var hasEnoughSteps = this._currentStairPhase == this._nSteps;
    console.log(this._currentStairPhase);
    console.log(this._currentIconNumber);

      // TODO: Log the last action...

    // Case 1: The study is over!
    if (noMoreIcons && hasEnoughSteps) {
      alert('the study is complete! Thank you for participating :)');
      this._currentMix = 0;
    }

    // Case 2: we've stairstepped to the end! Woo!
    else if (hasEnoughSteps) {
      // Log it! TODO
      this._currentMix = 0;
      this._approachingTarget = true;
      this._currentIconNumber++;
      this._currentlyPlayingPositionID = "none";
      alert('task complete! Moving on to the next task now.');
    }

    // Case 3: Continue stairstepping :)
    else {
      this._approachingTarget = !this._approachingTarget;
    }
    //this._currentStaircaseTask.push(this._currentMix);  // not how we log anymore :/
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

  _getCurrentYourAmplitude: function(t, costNodes) {
    var ampData = costNodes;
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
  },

  _indexFunction: function(i, j, nSamples) {
    return (nSamples * i) + j;
  },

  _localCost: function(x, y) {
    return Math.abs(x - y);
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
