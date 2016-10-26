/**
 *  This React component will be a large button that allows a user
 *   to see and preview their  icon that they will be matching to the
 *    target icon.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';

var YourIcon = React.createClass({

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
    document.getElementById("your-icon").className = "icon playing";
    document.getElementById("staircase-task").nowPlaying = "your-audio"

    // play the icon
    document.getElementById("target-audio").play();

    // end playbakc when that's done...
    this._stopPlaying();
  },



  /**
   * End the icon playback by:
   *    - change it's class back to "not-playing"
   **/
  _stopPlaying: function() {
    //STUB TODO
    document.getElementById("your-icon").className = "icon not-playing";
    document.getElementById("staircase-task").nowPlaying = "none"
    alert('done playing...');
  },

  render: function() {
    return(
      <div id="your-icon" className="icon not-playing" onClick={this._play}>
        <p id="your-icon-label" className="icon-label">Your Icon</p>
        <p id="your-icon-instructions" className="icon-instructions">
          Double Click to Preview
        </p>
        <audio id="your-audio">
          <source src="./../icons/icon2.wav" type="audio/wav" />
        </audio>
      </div>
    );
  }

});

module.exports = YourIcon;
