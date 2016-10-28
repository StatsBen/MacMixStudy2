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
import ReacDOM from 'react-dom';
import Reflux from 'reflux';

var StaircaseTaskActions = Reflux.createActions([
  'previewTargetIcon',
  'previewYourIcon',
  'clickEqual',
  'clickNotEqual',
  'clickSubmit'
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
    this._currentIconNumber = 1;  // counts down from 20
    this._currentStairPhase = 1;  // counts down from 5
    this._totalNIcons = 2; // TODO Change this to the actual number after testing!
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

    console.log(this._studyRecord);
  },

  /**
   *  "Preview Target Icon" will handle the playing of the target icon by:
   *    - stop playing whatever else might be playing
   *    - change this icon's class to "playing"
   *    - using the web-audio API to play the icon,
   *    - reset that all when it's done!
   **/
  previewTargetIcon: function() {
    this._currentStaircaseTask.push("previewed target icon");
  },

  /**
   *  "Preview Your Icon" will play the current icon by:
   *    - stopping whatever else might be playing
   *    - changing this icon's class to "playing"
   *    - using the web-audio API to play the icon,
   *    - resetting that all when it's done!
   **/
  previewYourIcon: function() {
    this._currentStaircaseTask.push("previewed their icon");
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
   *  The "Click Submit" function handles the event in which the submit button
   *   is clicked. If the task can't be submitted yet, then an alert is
   *    created. Otherwise, the task will be submitted by:
   *     - saving the Current Staircase Task to the Study Record,
   *     - resetting the Staircase Phase and Current Mix,
   *     - decrementing the Current Icon Number,
   *     - recording the time required to complete the task,
   *     - initiating autoplay if it's turned on,
   *     - displaying a short congratulatory message!
   **/
  clickSubmit: function() {

    if (this._canSubmit) {

       // Wrap up the last iteration...
      var newT = new Date().getTime()/(1000*60);
      var t = newT - this._currentTStart;
      this._currentStaircaseTask.push("total time: " + t);
      this._studyRecord.push(this._currentStaircaseTask);
      console.log(this._studyRecord);

      // Start the new task

    }

    else {
      alert("Sorry, the task isn't complete yet. Please continue with the activity.");
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
    this._approachingTarget = false;
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

  _openForSubmission: function() {
    // TODO
    document.getElementById("submit-button").className = "control-button";
  },

  _isEven: function(x) {
    !(x & 1);
  }

});

module.exports = {
  actions:StaircaseTaskActions,
  store:StaircaseTaskStore
};
