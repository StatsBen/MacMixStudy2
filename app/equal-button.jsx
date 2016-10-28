/**
 *  This tiny, little React component renders the "Equal" button
 *   in the Macaron Mix II study interface.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';

var EqualButton = React.createClass({

  render: function() {
    return(
      <div id="equal-button" className="control-button">
        <p id="equal-button-text" className="control-button-text">Equal</p>
      </div>
    );
  }
});

module.exports = EqualButton;
