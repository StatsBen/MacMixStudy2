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
   *  Function exported to the staircase task store :/
   *   Then this function just makes it visually obvious that it's playing.
   **/
  _play: function() {
    StaircaseTaskStore.actions.playTarget();
    // TODO: Highlight the thing....
  },

  render: function() {
    return(
      <div id="target-icon" className="icon not-playing" onClick={this._play}>
        <p id="target-icon-label" className="icon-label">Target Icon</p>
        <p id="target-icon-instructions" className="icon-instructions">
          Double Click to Preview
        </p>
        <audio id="target-audio">
          <source src="./../icons/icon2.wav" type="audio/wav" />
        </audio>
      </div>
    );
  }

});

module.exports = TargetIcon;
