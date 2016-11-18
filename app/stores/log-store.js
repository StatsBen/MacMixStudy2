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

  		// Initialize Firebase
			console.log("initializing firebase");
		  var config = {
		    apiKey: "AIzaSyDjrQ1GP5VUosv5RBa609IPEcGere7Gx1I",
		    authDomain: "macaronmixstudy2.firebaseapp.com",
		    databaseURL: "https://macaronmixstudy2.firebaseio.com",
		    storageBucket: "macaronmixstudy2.appspot.com",
		    messagingSenderId: "85286530565"
		  };
		  Firebase.initializeApp(config);


		  Firebase.auth().signInWithEmailAndPassword('oschneid@cs.ubc.ca', '98wehfn9a0fy08wnr2309fu23-23nr8394yqfno3ewiuh').catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
			console.log("error code: ");
			console.log(errorCode);
			console.log("error message thing: ");
		  console.log(errorMessage);
			//...
			});

		  this._database = Firebase.database();
			this._recordNumber = 0;




		// /**   Here's the Firebase Credentials - Edit them here if using a
		//  *     different account or if you get a new key... etc.         **/
		// this._DatabaseName = "macaron-mix-ii-7868f";
		// this._ProjectID = "macaron-mix-ii-7868f";
		// this._APIKey = "AIzaSyCVdXzvIQWrYXp4JX_Zs9lmELybDTI0aw4";
		// this._URL = "https://" + this._DatabaseName + ".firebaseio.com";
		// this._Bucket = "";
		// this._pid = 1;     // TODO: Tweak manually for each study...

		// // Initialize Firebase
		// var config = {
		//   apiKey: this._APIKey,
		//   authDomain: this._ProjectID + ".firebaseapp.com",
		//   databaseURL: "https://" + this._DatabaseName + ".firebaseio.com",
		//   storageBucket: "<BUCKET>.appspot.com",
		// };

		// firebase.initializeApp(config, "macmix");
		// //this._db =
  },


  log: function(recordBlob, pid) {
		var recordID = pid + "-" + this._recordNumber.toString();
		var dataRef = this._database.ref().child(pid).child(recordID);
	  dataRef.set(recordBlob);
		this._recordNumber++;
  }

});

module.exports = {
	actions:LogStoreActions,
	store:LogStore
}
