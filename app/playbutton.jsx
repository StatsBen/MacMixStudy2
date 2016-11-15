/**
 *  This React component will be a large button that allows a user
 *   to see and preview an icon
 *
 *  Author: Oliver Schneider, Nov. 15 2016
 *  Based heavily on previous "your-icon" code by Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var PlayButton = React.createClass({

  
  propTypes: {
    positionID : React.PropTypes.number.isRequired
      },

  /**
   *  Function exported to the staircase task store :/
   *   Then this function just makes it visually obvious that it's playing.
   **/
  _play: function() {
    StaircaseTaskStore.actions.play(this.props.positionID);
    // TODO: Highlight the thing....
  },



  render: function() {
    return(
      <div id={"playbutton-"+this.props.positionID}
           className="playbutton not-playing"
           ref={"ref-playbutton-"+this.props.positionID}
           onDoubleClick={this._play}>
        <p id={"playbutton-"+this.props.positionID+"-label"} className="playbutton-label">{this.props.positionID}</p>
        <p id={"playbutton-"+this.props.positionID+"instructions"} className="playbutton-instructions">
          Double Click to Preview
        </p>
        <audio id={"audio-"+this.props.positionID}>
          <source src="./../icons/icon2.wav" type="audio/wav" />
        </audio>
      </div>
    );
  }

});

module.exports = PlayButton;
