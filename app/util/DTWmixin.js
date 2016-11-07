import React from 'react'

var VTIconStore = require('./../stores/vticonstore.js');

var DTWMixin = {

  _properDynamicTimeWarp: function(wave1value, wave2value, nSamples) {

    /** Setting up the variables I'll need farther down **/
    var wave1Amps = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data;
    var wave2Amps = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data;
    var duration1 = VTIconStore.store.getInitialState()["wave1"].duration;
    var duration2 = VTIconStore.store.getInitialState()["wave2"].duration;
    var partitionedAmps1 = new Array(nSamples);
    var partitionedAmps2 = new Array(nSamples);
    var partitionWidth = Math.round(Math.min(duration1/nSamples, duration2/nSamples));
    var n1 = Math.round(duration1 / partitionWidth);
    var n2 = Math.round(duration2 / partitionWidth);

    var i1 = 0;  var i2 = 0;
    var t1 = 0;  var t2 = 0;
    var j1 = 0;  var j2 = 0;

    /** Partitioning the waveform amplitude **/
    while(t1 <= duration1) {
      if (wave1Amps[i1]) {
        while (t1 >= wave1Amps[i1].t && wave1Amps[i1+1]) { i1++; }
        if (t1 >= wave1Amps[i1].t && (i1+1) == wave1Amps.length) { i1++; }
      }

      if (!wave1Amps[i1]) {
        partitionedAmps1[j1] = wave1Amps[wave1Amps.length-1].value;
      } else if (i1 == 0) {
        partitionedAmps1[j1] = wave1Amps[i1].value;
      } else {
        var rise = wave1Amps[i1].value - wave1Amps[i1-1].value;
        var run = wave1Amps[i1].t - wave1Amps[i1-1].t;
        var slope = rise / run;
        var diffT = t1 - wave1Amps[i1-1].t;
        var sampledValue = wave1Amps[i1-1].value + (slope * diffT);

        // Now avoid a divide by zero error if there are two equal times.
        if (run) { var sampledValue = wave1Amps[i1-1].value + (slope * diffT); }
        else { sampledValue = wave1Amps[i1-1].value; }

        sampledValue = Math.max(0, sampledValue);
        sampledValue = Math.min(1, sampledValue);

        partitionedAmps1[j1] = +sampledValue.toFixed(3);
      }

      t1 += partitionWidth; j1++;
    }

    while (t2 <= duration2) {
      if (wave2Amps[i2]) {
        while (t2 >= wave2Amps[i2].t && wave2Amps[i2+1]) { i2++; }
        if (t2 >= wave2Amps[i2].t && (i2+1) == wave2Amps.length) { i2++; }
      }

      if (!wave2Amps[i2]) {
        partitionedAmps2[j2] = wave2Amps[wave2Amps.length-1].value;
      } else if (i2 == 0) {
        partitionedAmps2[j2] = wave2Amps[i2].value;
      } else {
        var rise = wave2Amps[i2].value - wave2Amps[i2-1].value;
        var run = wave2Amps[i2].t - wave2Amps[i2-1].t;
        var slope = rise / run;
        var diffT = t2 - wave2Amps[i2-1].t;
        var sampledValue = wave2Amps[i2-1].value + (slope * diffT);

        // Now avoid a divide by zero error if there are two equal times.
        if (run) { var sampledValue = wave2Amps[i2-1].value + (slope * diffT); }
        else { sampledValue = wave2Amps[i2-1].value; }

        sampledValue = Math.max(0, sampledValue);
        sampledValue = Math.min(1, sampledValue);

        partitionedAmps2[j2] = +sampledValue.toFixed(3);
      }

      t2 += partitionWidth; j2++;
    }
    var max1 = Math.max.apply(null, partitionedAmps1);
    var max2 = Math.max.apply(null, partitionedAmps2);
    console.log(partitionedAmps1); console.log(partitionedAmps2);

    /** Computing the Cost Matrix **/
    var costMatrix = new Array(n1 * n2);

    for (var i=0; i<=n1; i++) {
      for (var j=0; j<=n2; j++) {
        var costIndex = this._indexFunction(i,j,nSamples);
        var scaledV1 = partitionedAmps1[i] / max1;
        var scaledV2 = partitionedAmps2[j] / max2;
        var cost = this._localCost(scaledV1, scaledV2);
        cost = +cost.toFixed(3);
        costMatrix[costIndex] = cost;
      }
    }

    /** Finding the optimal path through the cost matrix **/
    var i = 0; var j = 0;
    var costSize = n1 + n2;
    var costNodes = new Array(costSize);
    costNodes[0] = {i:0, j:0, cost:costMatrix[this._indexFunction(0,0,nSamples)]};
    var nNodes = 1;

    while ((partitionedAmps1[i+1] != null) || (partitionedAmps2[j+1] != null)) {

      // Case 1: We're at the top of the Cost Matrix
      if (partitionedAmps1[i+1] == null) {
        var newNode = {i:i, j:j+1, cost:costMatrix[this._indexFunction(i,j+1,nSamples)]};
        costNodes[nNodes] = newNode;
        j++; nNodes++;
      }

      // Case 2: We're on the far right of the Cost Matrix
      else if (partitionedAmps2[j+1] == null) {
        var newNode = {i:i+1, j:j, cost:costMatrix[this._indexFunction(i+1,j,nSamples)]};
        costNodes[nNodes] = newNode;
        i++; nNodes++;
      }

      // Case 3: We're somewhere in the middle and need to choose a next step!
      else {
        var up    = costMatrix[this._indexFunction(i+1, j,  nSamples)];
        var right = costMatrix[this._indexFunction(i,   j+1,nSamples)];
        var diag  = costMatrix[this._indexFunction(i+1, j+1,nSamples)];
        var minCost = Math.min(up, right, diag);

        if (up == minCost) {
          costNodes[nNodes] = {i:i+1, j:j, cost:up}
          i++; nNodes++
        }

        else if (right == minCost) {
          costNodes[nNodes] = {i:i, j:j+1, cost: right}
          j++; nNodes++;
        }

        else if (diag == minCost) {
          costNodes[nNodes] = {i:i+1, j:j+1, cost: diag};
          j++; i++; nNodes++;
        }

        else {
          alert('uh oh... cost Matrix problems :(');
          break;
        }
      }
    }
    console.log(costNodes);

    /** Find all edges to form keyframe pairings **/
    var k = 0;
    var outputNodes = new Array(nNodes);
    var nOutNodes = 0;

    while (costNodes[k+1]) {

      // Case 1: there are a few repeat I indices
      if (costNodes[k].i == costNodes[k+1].i) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].i == costNodes[newK].i) { newK++; }
          else {done = true;}
        }
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[newK].j};
        nOutNodes++;
        k = newK;
      }

      // Case 2: there are a few repeat J indices
      else if (costNodes[k].j == costNodes[k+1].j) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].j == costNodes[newK].j) { newK++; }
          else {done = true;}
        }
        //var newI = Math.round((costNodes[k].i+costNodes[newK].i)/2);
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[newK].i, j:costNodes[k].j};
        nOutNodes++;
        k = newK;
      }

      // Case 3: No repeats
      else {
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
      }

      k++;
    }

    console.log(outputNodes);

    /** Use that path through the cost matrix to mix the waves! **/
    VTIconStore.actions.selectAllKeyframes("mixedWave");
    VTIconStore.actions.deleteSelectedKeyframes("mixedWave");
    //for (var k=0; k<nOutNodes; k++) {
    for (var k=0; k<nNodes; k++) {
      var i = costNodes[k].i;
      var j = costNodes[k].j;
      //var i = outputNodes[k].i;
      //var j = outputNodes[k].j;
      var iT = i * partitionWidth;
      var jT = j * partitionWidth;
      var iV = partitionedAmps1[i];
      var jV = partitionedAmps2[j];
      var newT = (wave1value*iT*0.01) + (wave2value*jT*0.01);
      var newV = (wave1value*iV*0.01) + (wave2value*jV*0.01);
      VTIconStore.actions.newKeyframe("amplitude", newT, newV, "mixedWave");
    }

    /** Then just average the frequency data... **/
    var wave1Freq = VTIconStore.store.getInitialState()["wave1"].parameters.frequency.data;
    var wave2Freq = VTIconStore.store.getInitialState()["wave2"].parameters.frequency.data;
    var n1 = wave1Freq.length; var n2 = wave2Freq.length;
    var avg1 = 0; var avg2 = 0;
    for (var i=0; i<n1; i++) { avg1 += (1/n1) * wave1Freq[i].value; }
    for (var i=0; i<n2; i++) { avg2 += (1/n2) * wave2Freq[i].value; }
    var newF = ((wave1value/100)*avg1)+((wave2value/100)*avg2);
    VTIconStore.actions.newKeyframe("frequency", 0, newF, "mixedWave");
    VTIconStore.actions.newKeyframe("frequency", 3000, newF, "mixedWave");
    VTIconStore.actions.removeDefaultKeyframes("mixedWave");
    VTIconStore.actions.unselectKeyframes("mixedWave");
  },


  _indexFunction: function(i, j, nSamples) {
    return (nSamples * i) + j;
  },

  _localCost: function(x, y) {
    return Math.abs(x - y);
  }

};

var waveData1 = [
        {
          "id": 263,
          "t": 0,
          "value": 0.6609196616507107,
          "selected": false
        },
        {
          "id": 264,
          "t": 100,
          "value": 0.13731804984211493,
          "selected": false
        },
        {
          "id": 265,
          "t": 200,
          "value": 0.8664597719942129,
          "selected": false
        },
        {
          "id": 266,
          "t": 300,
          "value": 0.46235011113631086,
          "selected": false
        },
        {
          "id": 267,
          "t": 400,
          "value": 0.7763798539131679,
          "selected": false
        },
        {
          "id": 268,
          "t": 500,
          "value": 0.7365254439935847,
          "selected": false
        },
        {
          "id": 269,
          "t": 600,
          "value": 0.11889881267270574,
          "selected": false
        },
        {
          "id": 270,
          "t": 700,
          "value": 0.48093229950139516,
          "selected": false
        },
        {
          "id": 271,
          "t": 800,
          "value": 0.8272716300326786,
          "selected": false
        },
        {
          "id": 272,
          "t": 900,
          "value": 0.96624775603498,
          "selected": false
        },
        {
          "id": 273,
          "t": 1000,
          "value": 0.4530446290679162,
          "selected": false
        },
        {
          "id": 274,
          "t": 1100,
          "value": 0.44830560273986597,
          "selected": false
        },
        {
          "id": 275,
          "t": 1200,
          "value": 0.5163285485690046,
          "selected": false
        },
        {
          "id": 276,
          "t": 1300,
          "value": 0.31363522770610386,
          "selected": false
        },
        {
          "id": 277,
          "t": 1400,
          "value": 0.3064652042261775,
          "selected": false
        },
        {
          "id": 278,
          "t": 1500,
          "value": 0.14907750475545312,
          "selected": false
        },
        {
          "id": 279,
          "t": 1600,
          "value": 0.9204995510764995,
          "selected": false
        },
        {
          "id": 280,
          "t": 1700,
          "value": 0.7367372505756618,
          "selected": false
        },
        {
          "id": 281,
          "t": 1800,
          "value": 0.0713950295124437,
          "selected": false
        },
        {
          "id": 282,
          "t": 1900,
          "value": 0.6436516981646314,
          "selected": false
        },
        {
          "id": 283,
          "t": 2000,
          "value": 0.6724276694679672,
          "selected": false
        },
        {
          "id": 284,
          "t": 2100,
          "value": 0.6412851735431726,
          "selected": false
        },
        {
          "id": 285,
          "t": 2200,
          "value": 0.32964498368773354,
          "selected": false
        },
        {
          "id": 286,
          "t": 2300,
          "value": 0.6692259368564188,
          "selected": false
        },
        {
          "id": 287,
          "t": 2400,
          "value": 0.8172599211660962,
          "selected": false
        },
        {
          "id": 288,
          "t": 2500,
          "value": 0.5750134372451459,
          "selected": false
        },
        {
          "id": 289,
          "t": 2600,
          "value": 0.9057342840913365,
          "selected": false
        },
        {
          "id": 290,
          "t": 2700,
          "value": 0.9053349018542887,
          "selected": false
        },
        {
          "id": 291,
          "t": 2800,
          "value": 0.22379590747499511,
          "selected": false
        },
        {
          "id": 292,
          "t": 2900,
          "value": 0.5120550256665919,
          "selected": false
        }
      ]
var waveData2 = [
        {
          "id": 213,
          "t": 236.65893271461726,
          "value": 9.020562075079397e-17,
          "selected": false
        },
        {
          "id": 220,
          "t": 243.61948955916475,
          "value": 1,
          "selected": false
        },
        {
          "id": 214,
          "t": 508.1206496519728,
          "value": 0.9999999999999999,
          "selected": false
        },
        {
          "id": 215,
          "t": 515.0812064965196,
          "value": 0.006249999999999645,
          "selected": false
        },
        {
          "id": 216,
          "t": 1632.2505800464037,
          "value": 0,
          "selected": false
        },
        {
          "id": 217,
          "t": 2651.9721577726214,
          "value": 1,
          "selected": false
        },
        {
          "id": 218,
          "t": 2658.932714617169,
          "value": 1.1102230246251565e-16,
          "selected": false
        }
      ]
var waveData3 = [
  {
    "id": 0,
    "t": 560.3248259860787,
    "value": 0,
    "selected": true
  },
  {
    "id": 201,
    "t": 563.8051044083526,
    "value": 0.9999999999999999,
    "selected": true
  },
  {
    "id": 202,
    "t": 1580.0464037122968,
    "value": 1,
    "selected": true
  },
  {
    "id": 203,
    "t": 1587.006960556844,
    "value": 1.1102230246251565e-16,
    "selected": true
  },
  {
    "id": 205,
    "t": 1941.995359628771,
    "value": 9.020562075079397e-17,
    "selected": false
  },
  {
    "id": 204,
    "t": 1948.9559164733184,
    "value": 1,
    "selected": false
  },
  {
    "id": 206,
    "t": 2213.457076566126,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 207,
    "t": 2220.417633410673,
    "value": 0.006249999999999645,
    "selected": false
  }
]
var waveData4 = [
  {
    "id": 201,
    "t": 344.54756380510423,
    "value": 0,
    "selected": false
  },
  {
    "id": 202,
    "t": 348.0278422273781,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 204,
    "t": 1371.2296983758695,
    "value": 1.1102230246251565e-16,
    "selected": false
  },
  {
    "id": 205,
    "t": 1781.902552204177,
    "value": 9.020562075079397e-17,
    "selected": false
  },
  {
    "id": 206,
    "t": 1788.8631090487245,
    "value": 1,
    "selected": false
  },
  {
    "id": 208,
    "t": 2784.222737819024,
    "value": 0.006249999999999645,
    "selected": false
  }
]
var waveData5 = [
  {
    "id": 213,
    "t": 132.25058004640385,
    "value": 9.020562075079397e-17,
    "selected": false
  },
  {
    "id": 220,
    "t": 139.21113689095134,
    "value": 1,
    "selected": false
  },
  {
    "id": 214,
    "t": 403.7122969837594,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 215,
    "t": 410.6728538283062,
    "value": 0.006249999999999645,
    "selected": false
  },
  {
    "id": 216,
    "t": 636.890951276102,
    "value": 0,
    "selected": false
  },
  {
    "id": 217,
    "t": 1656.6125290023197,
    "value": 1,
    "selected": false
  },
  {
    "id": 218,
    "t": 1663.5730858468673,
    "value": 1.1102230246251565e-16,
    "selected": false
  },
  {
    "id": 221,
    "t": 1830.6264501160094,
    "value": 4.5102810375396984e-17,
    "selected": false
  },
  {
    "id": 222,
    "t": 2888.631090487236,
    "value": 1,
    "selected": false
  },
  {
    "id": 223,
    "t": 2888.631090487239,
    "value": 0,
    "selected": false
  }
]
var waveData6 = [
  {
    "id": 227,
    "t": 3.4802784222739263,
    "value": 0,
    "selected": false
  },
  {
    "id": 229,
    "t": 1023.201856148492,
    "value": 1,
    "selected": false
  },
  {
    "id": 230,
    "t": 1030.1624129930392,
    "value": 0,
    "selected": false
  },
  {
    "id": 231,
    "t": 1433.8747099767984,
    "value": 0,
    "selected": false
  },
  {
    "id": 232,
    "t": 1440.835266821346,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 233,
    "t": 1677.494199535963,
    "value": 1,
    "selected": false
  },
  {
    "id": 234,
    "t": 1684.4547563805102,
    "value": 1.1102230246251565e-16,
    "selected": false
  },
  {
    "id": 236,
    "t": 2025.522041763341,
    "value": 1.3877787807814457e-16,
    "selected": false
  },
  {
    "id": 235,
    "t": 2032.4825986078888,
    "value": 1,
    "selected": false
  },
  {
    "id": 237,
    "t": 2993.039443155453,
    "value": 0.9999999999999999,
    "selected": false
  },
  {
    "id": 238,
    "t": 2999.999999999999,
    "value": 0.0062500000000002,
    "selected": false
  }
]
var waveData = [waveData1,waveData2,waveData3,waveData4,waveData5,waveData6];


module.exports = DTWMixin;
