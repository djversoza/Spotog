import React, { Component } from 'react';
import {
  AppRegistry,
  CameraRoll,
  NativeModules,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  Platform,
  NavigatorIOS,
  TouchableHighlight,
  View
} from 'react-native';


import Firebase from './fbdata';
import RNFetchBlob from 'react-native-fetch-blob';


export default class Uploader extends Component {

  componentWillMount(){

  }
  constructor() {
    super();
    this.state = { images: [], selected: '' };
  }
  componentDidMount() {
    CameraRoll.getPhotos({first: 5}).done(
  (data) =>{
     data.edges.map(x => {
       return this.state.images.push(x.node.image)
     });
    this.setState({
      images: data.edges
    })
    // console.log(this.state.images)
  },
  (error) => {
    console.warn(error);
  }
);
  }

  storeImages(data) {
    const assets = data.edges;
    const images = assets.map((asset) => asset.node.image);
    this.setState({
      images: images
    })
  }

  logImageError(err){
    console.log(err)
  }

  selectImage(urie) {

    const image = urie

      const Blob = RNFetchBlob.polyfill.Blob
      const fs = RNFetchBlob.fs
      window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
      window.Blob = Blob


      let uploadBlob = null
      const imageRef = Firebase.storage().ref('images').child("pasta.jpg")
      let mime = 'image/jpg'
      fs.readFile(image, 'base64')
        .then((data) => {
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
          // URL of the image uploaded on Firebase storage
          console.log(url);

        })
        .catch((error) => {
          console.log(error);

        })

   }


  render() {
    return (
      <View style={styles.imageGrid}>
                  { this.state.images.map((image, key) => {
                      console.log(image.node.image)
                      return (
                          <TouchableHighlight key={key} onPress={this.selectImage.bind(null, image.node.image.uri)}>
                          <Image key={key} style={styles.image} source={{ uri: image.node.image.uri }} />
                          </TouchableHighlight>
                      );
                      })
                  }
        </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#F5FCFF',
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
  }
});


module.exports = Uploader;
