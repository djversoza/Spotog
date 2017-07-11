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
  Image
} from 'react-native';

import Uploader from './Uploader';

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {username: '', password: '', modalVisible: false}
  };

  setModalVisible(visible) {
   this.setState({modalVisible: visible});
 };

//   componentWillMount() {
//    let checked = AsyncStorage.getItem('creds', (err, res) =>{
//      if (res != null) {
//        let username = JSON.parse(res).username;
//        let id = JSON.parse(res).id;
//        this.props.navigator.push({
//          title: 'Map',
//          component: Maps,
//          navigationBarHidden: true,
//          passProps: {'username': username,
//                      'id': id}
//        });
//      }
//    });
// }

  goToMaps(){
    fetch('http://127.0.0.1:3000/users/LoginUser', {
      method: 'POST',
        headers: {
          'Accept' : 'application/json',
          'Content-Type': 'application/json'
        },
          body: JSON.stringify({
            username: this.state.username,
            password: this.state.password
          })
    })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.success === true) {
        let username = resp.message.username;
        let id = resp.message.id;
        let creds = {'username': username, 'id': id};
        AsyncStorage.setItem('creds', JSON.stringify(creds));

        this.props.navigator.push({
          title: 'Map',
          component: Maps,
          navigationBarHidden: true,
          passProps: {'username': username,
                      'id': id}
        });
      } else {
        alert(resp.message)
      }

    })
    .done();
  };

  mapper(){
    this.props.navigator.push({
      title: 'Uploader',
      component: Uploader,
      navigationBarHidden: true,
    });
  };

  regAcc(){
    if (this.state.username.length < 5 || this.state.password.length < 8) {
        alert('Username must be at least 5 characters \n Password must be at least 8 characters');

      } else {
      fetch('http://127.0.0.1:3000/users/NewUser', {
        method: 'POST',
          headers: {
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
          },
            body: JSON.stringify({
              username: this.state.username,
              password: this.state.password
            })
      })
      .then((res) => res.json())
      .then((resp) => {
        if (resp.success === true) {
          this.setState({username: '', password: ''});
          alert(resp.message);
        } else {
          alert(resp.message);
        }
      })
      .done();
    }
  };

  render() {
    return (
      <View style = {styles.container}>

        <Image source={require('./img/rain.jpg')} style={styles.backgroundImage}>

          <View style={styles.content}>
            <Text style={styles.logo}> Spotographer</Text>

            <View style={styles.inputContainer}>

              <TextInput style={styles.input}
                onChangeText={(username) => this.setState({username})}
                value={this.state.username}

                placeholder='username'>
              </TextInput>

              <TextInput secureTextEntry={true} style={styles.input}
              onChangeText={(password) => this.setState({password})}
              value={this.state.password}
              placeholder='password'>
              </TextInput>

              <TouchableOpacity onPress={this.goToMaps.bind(this)} style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.mapper.bind(this)} style={styles.buttonContainer}>
                <Text style={styles.buttonText}>go</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.regAcc.bind(this)} style={styles.buttonContainer}>
                <Text style={styles.buttonText}>create</Text>
              </TouchableOpacity>

            </View>

          </View>
        </Image>
      </View>
    );
  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    justifyContent: 'center'
  },
  content: {
    alignItems: 'center'
  },
  logo: {
    backgroundColor:'transparent',
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    textShadowColor: '#252525',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
    marginBottom: 20
  },
  inputContainer: {
    margin: 20,
    marginBottom: 0,
    padding: 20,
    paddingBottom: 10,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  input: {
    fontSize: 16,
    height: 40,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,1)'
  },
  buttonContainer: {
    alignSelf: 'stretch',
    margin: 20,
    padding: 20,
    backgroundColor: 'blue',
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.6)'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

module.exports = Login;
