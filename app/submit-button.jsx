/**
 *  This React component will render the submit button for the
 *   Macaron Mix Study II interface.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';

var SubmitButton = React.createClass({

  render: function() {
    return(
      <div id="submit-button" className="control-button">
        <p id="submit-button-text" className="control-button-text">
          submit
        </p>
      </div>
    );
  }

});

module.exports = SubmitButton;
