/**
 *  This itty-bitty little React component renders the "not equal"
 *   button for the Macaron Mix Study II interface.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var NotEqualButton = React.createClass({

  _handleClick: function() {
    StaircaseTaskStore.actions.clickNotEqual();
  },

  render: function() {
    return(
      <div id="not-equal-button"
           className="control-button"
           onClick={this._handleClick}>
        <p id="not-equal-button-text"
           className="control-button-text">
          Not Equal
        </p>
      </div>
    );
  }

});

module.exports = NotEqualButton;
