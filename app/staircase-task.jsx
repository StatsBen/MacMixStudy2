/**
 * This is just a container component for all the
 *  components that will really go into the study activity
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react'
import ReactDOM from 'react-dom'

var PlayButton = require('./playbutton.jsx');
var SelectButton = require('./selectbutton.jsx');
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var StaircaseTask = React.createClass({

  render: function() {
    return(
      <div id="staircase-task">
        <h2 id="staircase-task-header">Matching Task</h2>
        
        <div id="playbutton-player-container">
          <div className="button-container">
            <PlayButton positionID={1} />
            <SelectButton positionID={1} />
          </div>
          <div className="button-container">
            <PlayButton positionID={2} />
            <SelectButton positionID={2} />
          </div>
          <div className="button-container">
            <PlayButton positionID={3} />
            <SelectButton positionID={3} />
          </div>
        </div>
      </div>
    );
  }

});

module.exports = StaircaseTask;
