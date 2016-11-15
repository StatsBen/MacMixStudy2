/**
 * This is just a container component for all the
 *  components that will really go into the study activity
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react'
import ReactDOM from 'react-dom'

var TargetIcon = require('./target-icon.jsx');
var YourIcon = require('./your-icon.jsx');
var EqualButton = require('./equal-button.jsx');
var NotEqualButton = require('./not-equal-button.jsx');
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var StaircaseTask = React.createClass({

  render: function() {
    return(
      <div id="staircase-task">
        <h2 id="staircase-task-header">Matching Task</h2>
        
        <div id="icon-player-container">
          <TargetIcon />
          <div id="controls-container">
            <EqualButton />
            <NotEqualButton />
          </div>
          <YourIcon />
        </div>
      </div>
    );
  }

});

module.exports = StaircaseTask;
