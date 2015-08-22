'use strict';

var React = require('react-native');
var MapDisplaySection = require('./components/MapSection.io.js');
var Spinner = require('./components/Spinner.js');

var mapRef = 'mapRef';

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBarIOS,
  TouchableHighlight,
  Image,
} = React;


var colors = {
  black: '#000',
  white: '#fff',
  midnight: '#24313F',
  midnightBlue: '#2c3e50',
  wetAsphault: '#34495e',
  concrete: '#95a5a6',
  abestos: '#7f8c8d',
  clouds: '#ecf0f1',
  silver: '#bdc3c7',
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: colors.wetAsphault,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    backgroundColor: colors.midnight,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: colors.clouds,
  },
  map: {
    flex: 1,
  },
  buttons: {
    flex: 1, flexDirection: 'row', position: 'absolute', right: 0, bottom: 0, left: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0)',
  },
  setLocationBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', height: 44, margin: 8, borderRadius: 4, backgroundColor: colors.midnight,
  },
  setLocationBtnText: {
    fontFamily: 'Montserrat-Bold', color: colors.clouds, fontSize: 12,
  },
  resetLocationBtn: {
    flex: 0, alignItems: 'center', justifyContent: 'center', width: 44, height: 44, margin: 8, borderRadius: 4, backgroundColor: colors.midnight,
  },
  resetLocationBtnImage: {
    width: 24, height: 24,
  },
});
var ParkingAssist = React.createClass({
  getInitialState: function() {
    return {
      isLoading: false,
    };
  },
  componentDidMount: function() {
    StatusBarIOS.setStyle(1);
  },
  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            PRK
          </Text>
        </View>
        <View style={styles.map}>
          <MapDisplaySection setMessageReceiver={this.setMessageReceiver} handleLoading={this.handleLoading} ref={mapRef} />
        </View>
        <View style={styles.buttons}>
          <TouchableHighlight
            style={styles.setLocationBtn}
            onPress={this._handleSetLocationBtnClick}
          >
              <Text style={styles.setLocationBtnText}>REDO SEARCH IN THIS AREA</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.resetLocationBtn}
            onPress={this._handleResetLocationBtnClick}
          >
            <Image
              style={styles.resetLocationBtnImage}
              source={{ uri: 'http://i.imgur.com/wNXcUtd.png' }}
            />
          </TouchableHighlight>
        </View>
        { this.state.isLoading ? <Spinner/> : null }
      </View>
    );
  },
  setMessageReceiver: function(messageReceiver) {
    this.setState({messageReceiver});
  },
  _handleSetLocationBtnClick: function() {
    this.setState({isLoading: true});
    // console.log('_handleSetLocationBtnClick');
    this.state.messageReceiver('doSearch');
  },
  _handleResetLocationBtnClick: function() {
    this.setState({isLoading: true});
    // console.log('_handleResetLocationBtnClick');
    this.state.messageReceiver('resetUserLocation');
  },
  handleLoading: function(bool) {
    this.setState({isLoading: bool});
  },
});

AppRegistry.registerComponent('ParkingAssist', () => ParkingAssist);
