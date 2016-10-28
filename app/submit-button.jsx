/**
 *  This React component will render the submit button for the
 *   Macaron Mix Study II interface.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var SubmitButton = React.createClass({

  componentDidMount: function() {
    document.getElementById("submit-button").className += " unavailable";
  },

  _handleClick: function() {
    StaircaseTaskStore.actions.clickSubmit();
  },

  render: function() {
    return(
      <div id="submit-button"
           className="control-button"
           onClick={this._handleClick}>
        <p id="submit-button-text"
           className="control-button-text">
          Submit
        </p>
      </div>
    );
  }

});

module.exports = SubmitButton;
