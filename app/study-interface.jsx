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
      <p>write a whole bunch of instructions here...</p>
        <StaircaseTask />
      </div>
    );
  }

});

module.exports = StudyInterface;
