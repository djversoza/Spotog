import React, { Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  NavigatorIOS,
  TouchableOpacity,
  TextInput,
  AsyncStorage,
  Menu,
  ScrollView,
  Image
} from 'react-native';

import Maps from './Maps'

export default class Settings extends Component {

  render() {
    return (
      <ScrollView>
      <View style={styles.settings}><Text style={styles.text}>Testing</Text></View>
      <View style={styles.settings}><Text style={styles.text}>Testing</Text></View>
      <View style={styles.settings}><Text style={styles.text}>Testing</Text></View>
      </ScrollView>
    );
  }
};


const styles = StyleSheet.create({
  settings: {
    alignItems: 'center',
    borderColor: 'red',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    padding: 8
  },
  text: {
    fontSize: 20,

  }
});

module.exports = Settings;
