var React = require('react-native');
var MapboxGLMap = require('react-native-mapbox-gl');
var RecommendationService = require('./RecommendationService');
var Q = require('q');
var mapRef = 'mapRef';

var {
  StyleSheet,
  Text,
  View,
} = React;

var METER_ICON = 'http://i.imgur.com/MpFpHXa.png';

var styles = StyleSheet.create({
  map: {
    flex: 5,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
});

var MapDisplaySection = React.createClass({
  propTypes: {
    handleLoading: React.PropTypes.func,
    setMessageReceiver: React.PropTypes.func,
  },
  mixins: [MapboxGLMap.Mixin],
  getInitialState: function() {
    return {
      meters: [],
      loaded: false,
      center: { // Santa Monica
        latitude: 34.0218629,
        longitude: -118.4804206,
      },
      zoom: 13,
    };
  },
  componentDidMount: function() {
    this.props.handleLoading(true);
    this.props.setMessageReceiver(this.handleMessage);
    this.getGPSUserLocation()
    .then(this.setViewLocation)
    .then(this.getRecommendations)
    .then(this.showMeters)
    .then(function() { this.props.handleLoading(false); }.bind(this));
  },
  onRegionChange(location) {
    // console.log('onRegionChange', this.state.isMoving);
    if (this.state.isMoving) {
      this._setState({
        viewLocation: location,
        // isMoving: false,
      });
    }
    this.setState({isMoving: false});
  },
  onRegionWillChange(location) {
    this._setState({isMoving: true});
    // console.log('onRegionWillChange', location);
  },
  onUpdateUserLocation(location) {
    // console.log('onUpdateUserLocation', location);
  },
  onOpenAnnotation(annotation) {
    // console.log('onOpenAnnotation', annotation);
  },
  onRightAnnotationTapped(e) {
    // console.log(e);
  },
  getGPSUserLocation: function(callback, q) {
    q = q || Q.defer();
    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        var {latitude, longitude} = initialPosition.coords;
        var user = {latitude, longitude, zoom: 17, range: 0.2};
        q.resolve(user);
      },
      (error) => {
        // console.log('navigation error', error.message);
        this.getGPSUserLocation(callback, q);
      },
      {enableHighAccuracy: true, timeout: 1000, maximumAge: 1000}
    );
    return q.promise;
  },
  getMapUserLocation: function() {
    var q = Q.defer();
    // console.log('getMapUserLocation', this.state.isMoving, this.state.viewLocation);
    // if(this.state.isMoving) q.reject('error: moving');
    // else {
      // console.log('view', this.state.viewLocation);
      q.resolve(this.state.viewLocation);
    // }
    return q.promise;
  },
  getRecommendations: function(location) {
    var q = Q.defer();
    RecommendationService.getRecommendations(location, (meters) => {
      // console.log('getRecommendations', meters);
      q.resolve(meters);
    });
    return q.promise;
  },
  renderLoadingView: function() {
    return (
      <View>
        <Text>Loading maps...</Text>
      </View>
    );
  },
  render: function() {
    return (
      <View style={styles.container}>
        <MapboxGLMap
          style={styles.map}
          direction={0}
          rotateEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          annotations={this.state.annotations}
          ref={mapRef}
          accessToken={'pk.eyJ1Ijoic3RldmVsZWVtIiwiYSI6IjgzZThjNzViM2U0Yjk0NjUyNzQxM2E2YWY1NDEyZmQxIn0.3VNCjC8-V2Y6ger0kSLjhQ'}
          styleURL={'asset://styles/mapbox-streets-v7.json'}
          centerCoordinate={this.state.center}
          userLocationVisible={true}
          zoomLevel={this.state.zoom}
          onRegionChange={this.onRegionChange}
          onRegionWillChange={this.onRegionWillChange}/>
      </View>
    );
  },
  setViewLocation: function(location) {
    var q = Q.defer();
    var { latitude, longitude, zoom } = location;
    // console.log('setViewLocation', location);
    this.setCenterCoordinateZoomLevelAnimated(mapRef, latitude, longitude, zoom);
    this.setState({viewLocation: location, isMoving: false}, () => {
      // console.log('setViewLocation resolving');
      q.resolve(location);
    });
    return q.promise;
  },
  showMeters: function(meters) {
    var q = Q.defer();
    // console.log('showMeters', meters);
    meters.forEach((meter) => {
      meter.annotationImage = {
        url: METER_ICON,
        height: 25,
        width: 25,
      };
    });
    this.addAnnotations(mapRef, meters);
    q.resolve();
    this.props.handleLoading(false);
    return q.promise;
  },
  handleMessage: function(message) {
    switch (message) {
    case 'doSearch':
      this.getMapUserLocation()
      // .then(this.setViewLocation)
      .then(this.getRecommendations)
      .then(this.showMeters)
      .catch((err) => console.log('error', err));
      break;
    case 'resetUserLocation':
      this.getGPSUserLocation()
      .then(this.setViewLocation)
      .then(this.onRegionChange)
      .then(function() { this.props.handleLoading(false); }.bind(this));
      break;
    default:
    }
  },
  _setState: function(obj) {
    var q = Q.defer();
    this.setState(obj, () => {
      // console.log('setting', obj);
      q.resolve(obj);
    });
    return q.promise;
  },
});

module.exports = MapDisplaySection;
