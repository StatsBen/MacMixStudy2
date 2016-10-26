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

var StaircaseTask = React.createClass({

  render: function() {
    return(
      <div id="staircase-task" nowPlaying="none">
        <h2>Matching Task</h2>
        <AutoPlayButton />
        <div id="icon-player-container">
          <TargetIcon />
        </div>
      </div>
    );
  }

});

module.exports = StaircaseTask;
