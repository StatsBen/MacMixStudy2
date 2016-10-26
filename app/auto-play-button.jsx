/**
 * This React component controls and renders the auto-play
 *  button.
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';

var AutoPlayButton = React.createClass({

  render: function() {
    return(
      <p>
        Auto Play On/Off 
        <input type="radio" name="autoplay" value="on/off" className="off">
        </input>
      </p>
    );
  }

});

module.exports = AutoPlayButton;
