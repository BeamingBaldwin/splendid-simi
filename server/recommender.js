var Firebase = require('firebase');
var fb_keys = require('../firebaselink.js');
var scraper = require('./scraper');


var distance = function(latU, longU, latP, longP) {
  return Math.sqrt(Math.pow((latP - latU) * 69.1128, 2) + Math.pow((longP - longU) * 57.2807, 2));
}

var firecloud = new Firebase(fb_keys.url);
firecloud.child('Users').remove();
var usersRef = firecloud.child('Users'); 

usersRef.on('child_added', function(childSnapshot, prevChildKey) {
  var start = Date.now();
  var user = childSnapshot.val();
  var userKey = childSnapshot.key();
  console.log('+', userKey);

  var radius = user.range;
  var tuple = [user.latitude, user.longitude];

  firecloud.child('MeteredParkingSpots').once('value', function(snapshot) {

    var pSpots = snapshot.val();
    var closeSpots = [];
    var freeSpots = {};

    for (var key in pSpots) {
      var displacement = distance(tuple[0], tuple[1], pSpots[key].latitude, pSpots[key].longitude);
      if (displacement < radius) {

        pSpots[key].distance = displacement;
        if (pSpots[key].mostRecentEvent === 'SE') {
          freeSpots[key] = pSpots[key];
        }
      } 
    } 
    firecloud.child('Users').child(userKey).child('Recommendations').set(freeSpots);
    console.log('-', userKey, Date.now() - start, 'ms');
  });
});
