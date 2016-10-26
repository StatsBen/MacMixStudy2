/**
 * This is just a container component for all the
 *  components that will really go into the study activity
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react'
import ReactDOM from 'react-dom'

var AutoPlayButton = require('./auto-play-button.jsx');
var TargetIcon = require('./target-icon.jsx');
var YourIcon = require('./your-icon.jsx');

var StaircaseTask = React.createClass({

  render: function() {
    return(
      <div id="staircase-task" nowPlaying="none">
        <h2 id="staircase-task-header">Matching Task</h2>
        <AutoPlayButton />
        <div id="icon-player-container">
          <TargetIcon />
          <div id="ene-container">
            
          </div>
          <YourIcon />
        </div>
      </div>
    );
  }

});

module.exports = StaircaseTask;
