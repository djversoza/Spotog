import React, { Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  NavigatorIOS,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  AsyncStorage,
  Menu,
  AlertIOS,
  ScrollView,
  Image
} from 'react-native';

import Maps from './Maps';
import Login from './Login';

export default class Settings extends Component {

  constructor(props){
    super(props);

    this.state = {
      showpass: false
    }
  }

  deleteAcc(){
      text => fetch('http://127.0.0.1:3000/users/DeleteAccount', {
        method: 'POST',
          headers: {
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
          },
            body: JSON.stringify({
              id: this.props.id,
              password: text
            })
      })
      .then((res) => res.json())
      .then((resp) =>{
        this.setState({markers: resp});
      })
      .done()


    AlertIOS.prompt(
  'Enter password',
  'Deleting account cannot be undone',
  [
    {text: 'OK', onPress: password => fetch('http://127.0.0.1:3000/users/DeleteAccount', {
      method: 'POST',
        headers: {
          'Accept' : 'application/json',
          'Content-Type': 'application/json'
        },
          body: JSON.stringify({
            id: this.props.id,
            password: password
          })
    })
    .then((res) => res.json())
    .then((resp) =>{
      if (resp.success === true) {
        AsyncStorage.setItem('creds', '');
        this.props.navigator.push({
          title: 'Login',
          component: Login,
          navigationBarHidden: true,
        });
      } else {
        alert(resp.message)
      }
    })
    .done()
  },
  ],
  'secure-text',

);
  };

  render() {
    return (
      <ScrollView>
      <TouchableHighlight style={styles.settingsTop} onPress={this.deleteAcc.bind(this)} >
        <Text style={styles.text}>Delete Account</Text>
      </TouchableHighlight>


      <View style={styles.settings}><Text style={styles.text}>Change Pass</Text></View>
      </ScrollView>
    );
  }
};


const styles = StyleSheet.create({
  settings: {
    alignItems: 'center',
    borderColor: 'red',
    borderBottomWidth: 3,
    padding: 8
  },
  settingsTop: {
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
