/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  NavigatorIOS,
  AsyncStorage,
  TouchableOpacity
} from 'react-native';
import Uploader from './app/components/Uploader.js';
import Login from './app/components/Login.js';

export default class spotog extends Component {
  render() {
    return (
      <NavigatorIOS
          style = {styles.container}
          initialRoute = {{
          title: 'Login',
          navigationBarHidden: true,
          component: Login
        }}/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

AppRegistry.registerComponent('spotog', () => spotog);
