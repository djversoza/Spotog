import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
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
import Settings from './Settings'
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
      showComments: false,
      markerID: null,
      loading: false,
      place: "",
      comment: "",
      comments: []
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
      AlertIOS.prompt(
        'Name this spot',
        null,
        text => fetch('http://127.0.0.1:3000/users/NewMarker', {
          method: 'POST',
            headers: {
              'Accept' : 'application/json',
              'Content-Type': 'application/json'
            },
              body: JSON.stringify({
                latitude: lat,
                longitude: long,
                id: this.props.id,
                place: text
              })
        })
        .then((res) => res.json())
        .then((resp) =>{
          this.setState({markers: resp});
        })
        .done()
      );

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
    console.log(marker.name)
    this.setState({markerID: marker.id, place: marker.name});
    this.setModalVisible(true)
  };

  selectImage() {
    this.setState({show: true, showPhotos: false, showComments: false});
    CameraRoll.getPhotos({first: 10}).done((data) =>{
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
     this.setState({showPhotos: true, show: false, showComments: false});
   };

   closePicker(){
     this.setState({images:[], show: false});
   };

   closeViewer(){
     this.setState({dlPhotos: [], showPhotos: false, });
   };

   settings(){
     this.props.navigator.push({
       title: 'Settings',
       component: Settings,
     });
   };

   viewComments(){
     this.setState({showComments: true, showPhotos: false, show: false});
     fetch('http://127.0.0.1:3000/users/GetComments', {
       method: 'POST',
         headers: {
           'Accept' : 'application/json',
           'Content-Type': 'application/json'
         },
           body: JSON.stringify({
             marker: this.state.markerID ,
           })
     })
     .then((res) => res.json())
     .then((resp) =>{
       this.setState({comments: resp});
     })
     .done()
   };

   addComment(){
     if(this.state.comment.length > 0) {
       fetch('http://127.0.0.1:3000/users/AddComment', {
         method: 'POST',
           headers: {
             'Accept' : 'application/json',
             'Content-Type': 'application/json'
           },
             body: JSON.stringify({
               marker: this.state.markerID ,
               comment: this.state.comment,
               poster: this.props.id,
             })
       })
       .then((res) => res.json())
       .then((resp) =>{
         this.setState({comments: resp, comment: ""});
       })
       .done()
     }  else {
       alert('Must not be blank');
     }
   };

   closeComments(){
     this.setState({showComments: false, comments: []});
   };

  render() {
    let commentsArr = this.state.comments.map((comment, index) =>{
      return comment.comment;
    })

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

          <View style={{backgroundColor: 'white', alignItems: 'center', marginBottom: 3, borderRadius: 4}}><Text>You are looking at {this.state.place}</Text></View>
            <View style={styles.menuBox}>
            <TouchableOpacity style={styles.uploader} onPress={this.selectImage.bind(this)}><Text> Upload Photos </Text></TouchableOpacity>
            {this.state.show ? <TouchableOpacity style={styles.closeBox} onPress={this.closePicker.bind(this)}><Text style={styles.closePhotos}>X</Text></TouchableOpacity> : null}
              {this.state.show ? <ScrollView style={{backgroundColor: 'white', marginTop: 15}}>
                        <View style={styles.imageGrid}>
                          { this.state.images.map((image, key) => {
                              return (

                                  <TouchableHighlight onPress={this.uploadPhoto.bind(this, image.node.image.uri)} key={key}>
                                  <Image key={key} style={styles.image} source={{ uri: image.node.image.uri }} />
                                  </TouchableHighlight>

                              );
                              })
                          }
                          </View>
                          </ScrollView> : null}

            <TouchableOpacity style={styles.viewPhotos} onPress={this.viewImages.bind(this)}><Text>View Photos</Text></TouchableOpacity>
            {this.state.showPhotos ? <TouchableOpacity style={styles.closeBox2} onPress={this.closeViewer.bind(this)}><Text style={styles.closePhotos}>X</Text></TouchableOpacity> : null}
              {this.state.showPhotos ? <ScrollView style={{backgroundColor: 'white', marginBottom: 15}}>
                        <View style={styles.imageGrid}>
                          { this.state.dlPhotos.map((image, key) => {
                              return (
                                  <TouchableHighlight  key={key}>
                                  <Image key={key} style={styles.image} source={{ uri: image}} />
                                  </TouchableHighlight>
                              );
                              })
                          }
                          </View>
                          </ScrollView> : null}

            <TouchableOpacity onPress={this.viewComments.bind(this)} style={styles.comments}><Text>Comments</Text></TouchableOpacity>
            {this.state.showComments ? <TouchableOpacity style={styles.closeBox3} onPress={this.closeComments.bind(this)}><Text>X</Text></TouchableOpacity> : null}
            {this.state.showComments ? <TouchableOpacity style={styles.closeBox3Add} onPress={this.addComment.bind(this)}><Text>+</Text></TouchableOpacity> : null}
              {this.state.showComments ? <ScrollView style={{backgroundColor: 'white', marginBottom: 15, width: 230}}>
                    {this.state.comments.map((comment, key) =>{
                      return (
                        <View><Text>{comment.comment}</Text></View>
                      );
                    })
                  }
                  </ScrollView> : null}
            {this.state.showComments ? <View style={styles.addComment}><TextInput onChangeText={(comment) => this.setState({comment})} value={this.state.comment}></TextInput></View> : null}


              <TouchableOpacity onPress={() => {
                this.setModalVisible(!this.state.modalVisible)
                this.setState({images:[],
                              show: false,
                              dlPhotos:[],
                              showPhotos: false,
                              place: "",
                              comments: []
                            })
                }}>
                <View style={styles.hider}><Text>Close Menu</Text></View>
              </TouchableOpacity>

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

            <TouchableOpacity onPress={this.settings.bind(this)} style={styles.settingsButton}>
                <Text>Settings</Text>
            </TouchableOpacity>

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
      width: 100,
      height: 60,
      borderRadius: 50,
      borderColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      marginBottom: 0,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      // left: 30
    },
    logoutButton: {
      backgroundColor: '#E91E63',
      width: 60,
      height: 60,
      borderRadius: 50,
      borderColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      marginBottom: 0,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      // left: 80
    },
    settingsButton: {
      backgroundColor: '#E91E63',
      width: 60,
      height: 60,
      borderRadius: 50,
      borderColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      marginBottom: 0,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      // left: 80
    },
    buttonText: {
      color: 'white'
    },
    menuBox: {
      borderColor: 'white',
      borderWidth: 3,
      backgroundColor: '#E91E63',
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
        justifyContent: 'center',
    },
    image: {
        width: 100,
        height: 100,
        margin: 10,
    },
    closePhotos: {
      color: 'white',
      fontSize: 12
    },
    closeBox: {
      position: 'absolute',
      borderRadius: 8,
      left: 256,
      top: 21.5,
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      padding: 4,
      backgroundColor: 'blue'
    },
    closeBox2: {
      position: 'absolute',
      borderRadius: 8,
      left: 256,
      top: 63.5,
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      padding: 4,
      backgroundColor: 'blue'
    },
    closeBox3: {
      position: 'absolute',
      borderRadius: 8,
      left: 256,
      top: 106,
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      padding: 4,
      backgroundColor: 'blue'
    },
    closeBox3Add: {
      position: 'absolute',
      borderRadius: 8,
      left: 225,
      top: 106,
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      padding: 4,
      backgroundColor: 'blue'
    },
    closeComments: {

    },
    hider: {
      backgroundColor: 'white',
      width: 270,
      alignItems: 'center',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      padding: 5
    },
    viewPhotos: {
      backgroundColor: 'white',
      width: 270,
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 15,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      padding: 5
    },
    uploader: {
      backgroundColor: 'white',
      alignItems: 'center',
      width: 270,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      padding: 5
    },
    comments: {
      backgroundColor: 'white',
      alignItems: 'center',
      width: 270,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      padding: 5,
      marginBottom: 15
    },
    addComment: {
      position: 'absolute',
      backgroundColor: 'blue',
      top: 392,
      height: 40,
      width: 230,
      padding: 10,
    }
});

module.exports = Maps;
