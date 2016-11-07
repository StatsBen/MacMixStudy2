/**
 *  This store will allow us to log all the user's actions with Google's
 *   "Firebase" tool that makes database records out of JSON-style objects.
 *
 *  Author: Ben Clark - Oct. 2016,
 **/
import React from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';
var Firebase = require('firebase');


/**  Yep, only one action here!  **/
var LogStoreActions = Reflux.createActions( ['log'] );

var LogStore = Reflux.createStore({

	listenables: [LogStoreActions],

  init: function() {

		/**   Here's the Firebase Credentials - Edit them here if using a
		 *     different account or if you get a new key... etc.         **/
		this._DatabaseName = "macaron-mix-ii-7868f";
		this._ProjectID = "macaron-mix-ii-7868f";
		this._APIKey = "AIzaSyCVdXzvIQWrYXp4JX_Zs9lmELybDTI0aw4";
		this._URL = "https://" + this._DatabaseName + ".firebaseio.com";
		this._Bucket = "";
		this._pid = 1;     // TODO: Tweak manually for each study...

		// Initialize Firebase
		var config = {
		  apiKey: this._APIKey,
		  authDomain: this._ProjectID + ".firebaseapp.com",
		  databaseURL: "https://" + this._DatabaseName + ".firebaseio.com",
		  storageBucket: "<BUCKET>.appspot.com",
		};

		firebase.initializeApp(config, "macmix");
		//this._db =
  },


  log: function(button, mix, participant, iconNumber) {
		console.log('logged: ' + button + mix.toString() + participant + iconNumber, Date.now());
  }

});

module.exports = {
	actions:LogStoreActions,
	store:LogStore
}
