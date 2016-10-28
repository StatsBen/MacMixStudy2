/**
 *  This store manages all the data that will be collected by the
 *   Macaron Mix Study II interface. It'll record all the data,
 *   and manage all the data that will be displayed in the app.
 *    This is the central hub for all the information flowing
 *     throughout the app!
 *
 *  Author: Ben Clark - Oct. 2016
 **/
import React from 'react';
import ReacDOM from 'react-dom';
import Reflux from 'reflux';

var StaircaseTaskActions = Reflux.createActions([
  'previewTargetIcon',
  'previewYourIcon',
  'clickEqual',
  'clickNotEqual',
  'submitTask'
]);

var StaircaseTaskStore = Reflux.createStore({

  listenables: [StaircaseTaskActions],

  init: function() {
    this._usefulInfo = [];  // Initialize properties/fields like this!
    // Initialize all the data and get ready to collect info!
  },

  previewTargetIcon: function() {
    //do nothing
  },

  previewYourIcon: function() {
    //do nothing
  },

  clickEqual: function() {
    //do nothing
    alert('eq test successful!');
  },

  clickNotEqual: function() {
    //do nothing
    alert('ne test successful!');
  },

  clickSubmit: function() {
    //do nothing
    alert('submit test successful!');
  }

});

module.exports = {
  actions:StaircaseTaskActions,
  store:StaircaseTaskStore
};
