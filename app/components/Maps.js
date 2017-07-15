import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  AsyncStorage,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  Image,
  CameraRoll,
  AlertIOS,
  Modal
} from 'react-native';

import MapView from 'react-native-maps';
import Login from './Login';
import Uploader from './Uploader';
import Firebase from './fbdata';
import RNFetchBlob from 'react-native-fetch-blob';

const {width, height} = Dimensions.get('window');
const SCREEN_WIDTH = width;
const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class Maps extends Component {

  constructor(props){
    super(props);

    this.state = {
      initialPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      markerPosition: {
        latitude: 0,
        longitude: 0
      },
      markers: [],
      modalVisible: false,
      images: [],
      dlPhotos: [],
      show: false,
      showPhotos: false,
      markerID: null,
      loading: false
    }
  };

  watchID: ?number = null;

  componentDidMount() {
    console.log(this.state.markerID)
    navigator.geolocation.getCurrentPosition((position) =>{
      var lat = parseFloat(position.coords.latitude);
      var long = parseFloat(position.coords.longitude);

      var initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      this.setState({initialPosition: initialRegion});
      this.setState({markerPosition: initialRegion});
    }, (error) => alert(JSON.stringify(error)),
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 100});

    this.watchID = navigator.geolocation.watchPosition((position) =>{
      var lat = parseFloat(position.coords.latitude);
      var long = parseFloat(position.coords.longitude);

      var lastRegion = {
        latitude: lat,
        longitude: long,
        longitudeDelta: LONGITUDE_DELTA,
        latitudeDelta: LATITUDE_DELTA
      }
      this.setState({initialPosition: lastRegion});
      this.setState({markerPosition: lastRegion});
    });

    fetch('http://127.0.0.1:3000/users/GetMarkers', {
      method: 'POST',
        headers: {
          'Accept' : 'application/json',
          'Content-Type': 'application/json'
        },
          body: JSON.stringify({
            id: this.props.id
          })
    })
    .then((res) => res.json())
    .then((resp) => {
      this.setState({markers: resp});
    })
    .done();
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  };

  addMarker(){ //Places a marker at your current location.
    navigator.geolocation.getCurrentPosition((position) =>{
      var lat = parseFloat(position.coords.latitude);
      var long = parseFloat(position.coords.longitude);

      fetch('http://127.0.0.1:3000/users/NewMarker', {
        method: 'POST',
          headers: {
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
          },
            body: JSON.stringify({
              latitude: lat,
              longitude: long,
              id: this.props.id
            })
      })
      .then((res) => res.json())
      .then((resp) =>{
        this.setState({markers: resp});
      })
      .done()
    })
  };

  logout(){
    AsyncStorage.setItem('creds', '');
    this.props.navigator.push({
      title: 'Login',
      component: Login,
      navigationBarHidden: true,
    });
  };

  componentWillUnmount(){
    navigator.geolocation.clearWatch(this.watchID);
  };

  showMe(marker){
    this.setState({markerID: marker.id});
    this.setModalVisible(true)
  };

  selectImage() {
    this.setState({show: true, showPhotos: false});
    CameraRoll.getPhotos({first: 6}).done((data) =>{
     data.edges.map(x => {
       return this.state.images.push(x.node.image)
     });
      this.setState({
        images: data.edges
     })
    },
    (error) => {
      console.warn(error);
    })
   };

   uploadPhoto(uri){
     const image = uri;
     let time = new Date();
     let theTime = time.toString();

     const Blob = RNFetchBlob.polyfill.Blob
     const fs = RNFetchBlob.fs
     window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
     window.Blob = Blob



     let uploadBlob = null
     const imageRef = Firebase.storage().ref('images').child(theTime.split(" ").join("") + this.props.id + ".jpg")
     let mime = 'image/jpg'

     fs.readFile(image, 'base64')
       .then((data) => {
         this.setState({loading: true});
         return Blob.build(data, { type: `${mime};BASE64` })
       })
       .then((blob) => {
           uploadBlob = blob
           return imageRef.put(blob, { contentType: mime })
       })
         .then(() => {
           uploadBlob.close()
           return imageRef.getDownloadURL()
         })
         .then((url) => {

           fetch('http://127.0.0.1:3000/users/UploadPhotos', {
             method: 'POST',
               headers: {
                 'Accept' : 'application/json',
                 'Content-Type': 'application/json'
               },
                 body: JSON.stringify({
                   url: url,
                   marker: this.state.markerID,
                 })
           })
           .done();

           alert('Upload Successful')
           console.log(url);
           console.log(this.state.loading)
         })
         .then(() =>{
           this.setState({loading: false})
         })
         .catch((error) => {
           console.log(error);

         })
         this.setState({loading: false})
   };

   viewImages(){

     fetch('http://127.0.0.1:3000/users/GetPhotos', {
       method: 'POST',
         headers: {
           'Accept' : 'application/json',
           'Content-Type': 'application/json'
         },
           body: JSON.stringify({
             id: this.state.markerID
           })
     })
     .then((res) => res.json())
     .then((resp) => {
       let arr = resp.map(x =>{
         return x.url.replace(/[\\$]/, '?')
       })
       this.setState({dlPhotos: arr});
     })
     .done();

     this.setState({showPhotos: true, show: false});

   };

   closePicker(){
     this.setState({images:[], show: false});
   };

   closeViewer(){
     this.setState({dlPhotos: [], showPhotos: false});
   }

  render() {

    return (
      <View style={styles.container}>

      <Modal
          animationType={"slide"}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {alert("Modal has been closed.")}}
          >
        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', height: 567, alignItems: 'center', justifyContent: 'center'}}>

          <View style={{marginTop: 22}}>

            <View style={styles.menuBox}>
            <View style={styles.uploader}><Text onPress={this.selectImage.bind(this)}> Choose Photos </Text></View>
            {this.state.show ? <TouchableOpacity style={styles.closeBox}><Text onPress={this.closePicker.bind(this)} style={styles.closePhotos}>X</Text></TouchableOpacity> : null}
              {this.state.show ? <View style={styles.imageGrid}>
                          { this.state.images.map((image, key) => {
                              return (
                                  <TouchableHighlight onPress={this.uploadPhoto.bind(this, image.node.image.uri)} key={key}>
                                  <Image key={key} style={styles.image} source={{ uri: image.node.image.uri }} />
                                  </TouchableHighlight>
                              );
                              })
                          }
                          </View> : null}

            <View style={styles.viewPhotos}><Text onPress={this.viewImages.bind(this)}> View Photos</Text></View>
            {this.state.showPhotos ? <TouchableOpacity style={styles.closeBox}><Text onPress={this.closeViewer.bind(this)} style={styles.closePhotos}>X</Text></TouchableOpacity> : null}
              {this.state.showPhotos ? <View style={styles.imageGrid}>
                          { this.state.dlPhotos.map((image, key) => {
                            console.log(image)
                              return (
                                  <TouchableHighlight  key={key}>
                                  <Image key={key} style={styles.image} source={{ uri: image}} />
                                  </TouchableHighlight>
                              );
                              })
                          }
                          </View> : null}


              <TouchableHighlight onPress={() => {
                this.setModalVisible(!this.state.modalVisible)
                this.setState({images:[], show: false})
                this.setState({dlPhotos:[], showPhotos: false})
              }}>
                <View style={styles.hider}><Text>Hide Modal</Text></View>
              </TouchableHighlight>

            </View>
          </View>
        </View>
      </Modal>

        <MapView
            style={styles.map}
            region={this.state.initialPosition}>

            <MapView.Marker coordinate={this.state.markerPosition}>
              <View style={styles.radius}>
                <View style={styles.marker}/>
              </View>
            </MapView.Marker>

            {this.state.markers.map((marker, key)=>{
              return  <MapView.Marker key={key} onPress={this.showMe.bind(this, marker)} coordinate={marker}/>
            })}
        </MapView>

          <View style={styles.footer}>

            <TouchableOpacity onPress={this.addMarker.bind(this, this.state.markerPosition)} style={styles.addButton}>
                <Text style={styles.buttonText}>Add Marker</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.logout.bind(this)} style={styles.logoutButton}>
                <Text style={styles.buttonText}>logout</Text>
            </TouchableOpacity>

          </View>

      </View>
    );
  }
};

const styles = StyleSheet.create({
  radius: {
      height: 50,
      width: 50,
      borderRadius: 50 / 2,
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(0,122,255, 0.3)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    marker: {
      height: 20,
      width: 20,
      borderWidth: 3,
      borderColor: 'white',
      borderRadius: 20 / 2,
      overflow: 'hidden',
      backgroundColor: '#007AFF'
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
    },
    map: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      position: 'absolute'
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
    footer: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 0,
      left: 0,
      right: 0,
      alignSelf: 'stretch',
      padding: 15,
      paddingTop: 8,
      height: 100,
      backgroundColor: '#252525',
    },
      addButton: {
      backgroundColor: '#E91E63',
      width: 80,
      height: 80,
      borderRadius: 50,
      borderColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      marginBottom: 0,
      left: 35
    },
    logoutButton: {
      backgroundColor: '#E91E63',
      width: 90,
      height: 45,
      borderRadius: 210,
      borderColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      left: 20,
      marginBottom: 0,
      left: 60
    },
    buttonText: {
      color: 'white'
    },
    menuBox: {
      borderColor: 'white',
      borderWidth: 3,
      backgroundColor: 'red',
      height: 500,
      width: 300,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
    },
    imageGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    image: {
        width: 100,
        height: 100,
        margin: 10,
    },
    closePhotos: {
      color: 'white',
      fontSize: 18
    },
    closeBox: {
      position: 'absolute',
      borderRadius: 50,
      left: 250,
      top: 13,
      alignItems: 'center',
      justifyContent: 'center',
      width: 27,
      height: 27,
      padding: 5,
      backgroundColor: 'blue'
    },
    hider: {
      backgroundColor: 'white',
      padding: 5
    },
    viewPhotos: {
      backgroundColor: 'white',
      padding: 5
    },
    uploader: {
      backgroundColor: 'white',
      padding: 5
    }
});

module.exports = Maps;
