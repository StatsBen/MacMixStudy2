/**
 * This is just a container component for all the
 *  components that will really go into the study activity
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react'
import ReactDOM from 'react-dom'

var AutoPlayButton = require('./auto-play-button.jsx');

var StaircaseTask = React.createClass({

  render: function() {
    return(
      <div id="staircase-task">
        <h2>Better Test...</h2>
        <AutoPlayButton />
      </div>
    );
  }

});

module.exports = StaircaseTask;
