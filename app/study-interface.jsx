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
      <p>Your task is to find out which of the following icons is not like the others.</p>
      <p>To feel an icon, double click the large rectangle in the top row.</p>
      <p>When you find which of the icons is not like the others, click on the smaller rectangle that represents it in the second row.</p>
      <p>When you finish the task, a congratulatroy pop-up window will appear. These tasks typically take 8-15 minutes to complete, so it may feel like it's taking a long time to finish, but just keep at it!</p>
        <StaircaseTask />
      </div>
    );
  }

});

module.exports = StudyInterface;
