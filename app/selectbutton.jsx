/**
 *  This tiny, little React component renders the "Select" buttons
 *   in the Macaron Mix II study interface.
 *
 *  Author: Oliver Schneider, Nov. 15, 2016
 *  Based heavily on EqualButton (and NotEqualButton) code by Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';
var StaircaseTaskStore = require('./stores/staircase-task-store.js');

var SelectButton = React.createClass({

  propTypes: {
    positionID : React.PropTypes.number.isRequired
      },

  _handleClick: function() {
    StaircaseTaskStore.actions.selectPosition(this.props.positionID);
  },

  render: function() {
    return(
      <div id={"selectbutton-"+this.props.positionID}
           className="select-button"
           onClick={this._handleClick}>
        <p id={"selectbutton-"+this.props.positionID+"-text"}
           className="select-button-text">
          This is the odd one out.
        </p>
      </div>
    );
  }
});

module.exports = SelectButton;
