/**
 * RecommendationService.js
 * Wraps backend/database services for getting parking meter recommendations.
 */
'use strict';

var _fb = require('firebase');
var _url = require('../firebaselink').url;
var _ref = new _fb(_url);
var moment = require('moment');

var sortDistance = (objs) => {
  var arr = [];
  var obj;
  for (obj in objs) {
    if (!!objs[obj]) {
      arr.push(objs[obj]);
    }
  }
  return arr.sort((a, b) => a.distance - b.distance);
};

var getRecommendations = (user, callback) => {
  var userRef;
  if (!user.range) user.range = 0.2;
  // console.log('getRecommendations', user);
  userRef = _ref.child('Users').push(user);

  userRef
  .child('Recommendations')
  .once('child_added', () => {
    userRef
    .child('Recommendations')
    .orderByChild('distance')
    .limitToFirst(5)
    .once('value', (snapshot) => {
      var recommendations = snapshot.val();
      // console.log(
      //   'number of recommendations',
      //   Object.keys(recommendations).length
      // );
      userRef.remove();
      recommendations = sortDistance(recommendations);
      recommendations.forEach((meter) => {
        meter.title = moment(meter.timeStamp, 'YYYYMMDDTHHmmssSSZ').fromNow();
      }
      );
      callback(recommendations);
    });
    userRef.off('child_added');
  });
};

var RecommendationService = {
  getRecommendations,
};

module.exports = RecommendationService;
