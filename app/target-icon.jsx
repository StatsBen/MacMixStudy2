/**
 *  This React component will be a large button that allows a user
 *   to see and preview the target icon that they will be matching.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';

var TargetIcon = React.createClass({

  /**
   *  Play the icon by:
   *    - stop playing whatever else might be playing
   *    - change this icon's class to "playing"
   *    - using the web-audio API to play the icon,
   *    - call _endPlay() when it's done
   **/
  _play: function() {
    // STUB  TODO

    // stop playing whatever else might be playing
    if (document.getElementById("staircase-task").nowPlaying != "none") {
      // something else is playing... deal with that!
      alert('other stuff is happening...');
    } else {
      // nothing else is playing, carry on!
      alert('you are clear to go!');
    }

    // change the icon's class to "playing"
    document.getElementById("target-icon").className = "icon playing";

    // play the icon
    alert('playing!');

    // end playbakc when that's done...
    this._stopPlaying();
  },

  /**
   * End the icon playback by:
   *    - change it's class back to "not-playing"
   **/
  _stopPlaying: function() {
    //STUB TODO
    document.getElementById("target-icon").className = "icon not-playing";
    alert('done playing...');
  },

  render: function() {
    return(
      <div id="target-icon" className="icon not-playing" onClick={this._play}>
        <p id="target-icon-label" className="icon-label">Target Icon</p>
        <p id="target-icon-instructions" className="icon-instructions">
          Double Click to Preview
        </p>
      </div>
    );
  }

});

module.exports = TargetIcon;
