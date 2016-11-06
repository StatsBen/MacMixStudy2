/**
 *  This React component will be a large button that allows a user
 *   to see and preview their  icon that they will be matching to the
 *    target icon.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var YourIcon = React.createClass({

  /**
   *  Function exported to the staircase task store :/
   *   Then this function just makes it visually obvious that it's playing.
   **/
  _play: function() {
    StaircaseTaskStore.actions.playYours();
    // TODO: Highlight the thing....
  },

  render: function() {
    return(
      <div id="your-icon"
           className="icon not-playing"
           onDoubleClick={this._play}>
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
