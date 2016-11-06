/**
 *  This store will allow us to log all the user's actions with Google's
 *   "Firebase" tool that makes database records out of JSON-style objects.
 *
 *  Author: Ben Clark - Oct. 2016,
 **/
import React from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';


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

		// Initialize Firebase
		var config = {
		  apiKey: this._APIKey,
		  authDomain: this._ProjectID + ".firebaseapp.com",
		  databaseURL: "https://" + This._DatabaseName + ".firebaseio.com",
		  storageBucket: "<BUCKET>.appspot.com",
		};

		firebase.initializeApp(config);


		this._db = firebase.database();
  },


  log: function(button, currentMix, currentIconNumber) {
		this._db.ref
  }

});
