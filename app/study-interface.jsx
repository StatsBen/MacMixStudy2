/**
 *  The outermost component that'll render the study
 *   interface for the second part of the Macaron Mix
 *    study which investigates algorithms for mixing
 *     haptic icons in a "perceptually soud" way.
 *
 *  We'll be using a technique from the world of
 *   psychophysics called the "staircase" method
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReactDOM from 'react-dom';

var StaircaseTask = require('./staircase-task.jsx');

var StudyInterface = React.createClass({

  render: function() {
    return(
      <div id="app">
      <p className="instruction">Your task is to find out which of the following icons is not like the others.</p>
      <p className="instruction">To feel an icon, <b>double click</b> the large rectangle in the top row.</p>
      <p className="instruction">When you find which of the icons is not like the others, please <b>double click</b> on the smaller button that corresponds to the odd-one-out in the second row.</p>
      <p className="instruction">When you finish the task, a congratulatroy pop-up window will appear. Hooray!</p>
        <StaircaseTask />
      </div>
    );
  }

});

module.exports = StudyInterface;
