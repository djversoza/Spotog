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
      showpass: false,
      password: "",
      passwordCon: "",
      newPass: ""
    }
  }

  deleteAcc(){

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

  changePassToggle(){
  //   AlertIOS.prompt(
  //   'Enter New password',
  //   '',
  //   [
  //     {text: 'OK', onPress: password => fetch('http://127.0.0.1:3000/users/ChangePass', {
  //       method: 'POST',
  //         headers: {
  //           'Accept' : 'application/json',
  //           'Content-Type': 'application/json'
  //         },
  //           body: JSON.stringify({
  //             id: this.props.id,
  //             password: password
  //           })
  //     })
  //     .then((res) => res.json())
  //     .then((resp) =>{
  //       if (resp.success === true) {
  //         console.log('success')
  //         ;
  //       } else {
  //         alert(resp.message)
  //       }
  //     })
  //     .done()
  //   },
  //   ],
  //   'secure-text',
  // );
  this.setState({showpass: true})
  };

  changePass(){
    if (this.state.password !== this.state.passwordCon){
      alert('Passwords do not match')
    }

   if (this.state.newPass && this.state.password === this.state.passwordCon){
     fetch('http://127.0.0.1:3000/users/ChangePass', {
       method: 'POST',
         headers: {
           'Accept' : 'application/json',
           'Content-Type': 'application/json'
         },
           body: JSON.stringify({
             newPass: this.state.newPass,
             password: this.state.password,
             id: this.props.id
           })
     })
     .then((res) => res.json())
     .then((resp) => {
       if (resp.success === true) {
         this.setState({newPass: '', password: '', passwordCon: ''});
         alert(resp.message);
       } else {
         alert(resp.message);
       }
     })
     .done();
    } else {
      alert('must not be blank')
    }
  };

  render() {
    return (
      <View>
        <ScrollView style={styles.scroller}>
        <TouchableHighlight style={styles.settingsTop} onPress={this.deleteAcc.bind(this)} >
          <Text style={styles.text}>Delete Account</Text>
        </TouchableHighlight>


        <TouchableHighlight onPress={this.changePassToggle.bind(this)} style={styles.settings}><Text style={styles.text}>Change Pass</Text></TouchableHighlight>
        </ScrollView>

        {this.state.showpass ? <View style={styles.inputContainer}>
          <TextInput secureTextEntry={true} style={styles.input}
            onChangeText={(password) => this.setState({password})}
            value={this.state.password}
            placeholder='password'>
          </TextInput>

          <TextInput secureTextEntry={true} style={styles.input}
          onChangeText={(passwordCon) => this.setState({passwordCon})}
          value={this.state.passwordCon}
          placeholder='confirm password'>
          </TextInput>

          <TextInput secureTextEntry={true} style={styles.input}
          onChangeText={(newPass) => this.setState({newPass})}
          value={this.state.newPass}
          placeholder='new password'>
          </TextInput>

          <TouchableOpacity onPress={this.changePass.bind(this)} style={styles.buttonContainer}>
            <Text style={styles.buttonText}>ChangePass</Text>
          </TouchableOpacity>

        </View> : null}
      </View>
    );
  }
};


const styles = StyleSheet.create({
  scroller: {
    paddingBottom: 70
  },
  settings: {
    alignItems: 'center',
    borderColor: '#41454c',
    borderBottomWidth: 3,
    padding: 8
  },
  settingsTop: {
    alignItems: 'center',
    borderColor: '#41454c',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    padding: 8
  },
  text: {
    fontSize: 20,
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 0,
    paddingBottom: 10,
    borderWidth: 5,
    borderColor: 'black',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  input: {
    width: 280,
    marginTop: 5,
    fontSize: 16,
    height: 40,
    padding: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'grey'
  },
  buttonContainer: {
    alignSelf: 'stretch',
    margin: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'grey',
    backgroundColor: 'rgba(255,255,255,0.6)'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

module.exports = Settings;
