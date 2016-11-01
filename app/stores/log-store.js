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
var FIREBASE_URL = "https://shining-heat-4904.firebaseio.com";
var FIREBASE_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0NDA1MjY5NDMsImQiOnsidWlkIjoib2xpdmVyLW1hY2Fyb24ifSwidiI6MH0.ICq8i8FMOMTL4VaEedsRsY-hZe2-a6YsebuHc3ptPo4";

var LogStoreActions = Reflux.createActions( ['log'] );

var LogStore = Reflux.createStore({

	listenables: [LogStoreActions],

  init: function() {
    //set up firebase test user data
		var firebase_base = new Firebase(FIREBASE_URL+"/"+this._pid+"/");

		//authenticate firebase
		firebase_base.auth(FIREBASE_AUTH_TOKEN, function(error, result) {
		  if (error) {
		    console.log("Authentication Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", result.auth);
		    console.log("Auth expires at:", new Date(result.expires * 1000));
		  }
		});

    this._firebase_block = firebase_base.push();
		this._firebase_block.set(
			{
				animation:this._animation,
				startTime:Date.now(),
				"interface":interfaceText
			});

		//setup firebase log data
		var block_key = this._firebase_block.key();
		this._firebase_log = new Firebase(FIREBASE_URL+"/"+this._pid+"/"+block_key+"/log/");


  },


  log: function() {
		this._firebase_log.push({t:Date.now(), value:txt});
    // TODO Add to what's being logged!
  }

});
