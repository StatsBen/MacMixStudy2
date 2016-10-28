/**
 *  This tiny, little React component renders the "Equal" button
 *   in the Macaron Mix II study interface.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var EqualButton = React.createClass({

  _handleClick: function() {
    StaircaseTaskStore.actions.clickEqual();
  },

  render: function() {
    return(
      <div id="equal-button"
           className="control-button"
           onClick={this._handleClick}>
        <p id="equal-button-text"
           className="control-button-text">
          Equal
        </p>
      </div>
    );
  }
});

module.exports = EqualButton;
