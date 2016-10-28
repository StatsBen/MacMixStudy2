/**
 *  This itty-bitty little React component renders the "not equal"
 *   button for the Macaron Mix Study II interface.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';

var NotEqualButton = React.createClass({

  _handleClick: function() {
    // TODO
  },

  render: function() {
    return(
      <div id="not-equal-button" className="control-button">
        <p id="not-equal-button-text" className="control-button-text">
          Not Equal
        </p>
      </div>
    );
  }

});

module.exports = NotEqualButton;
