import React, { Component } from 'react';
import {
  AppRegistry,
  CameraRoll,
  NativeModules,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  NavigatorIOS,
  TouchableHighlight,
  View
} from 'react-native';

export default class Uploader extends Component {

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

  selectImage(uri) {
       console.log(uri)
   }


  render() {
    return (
      <View style={styles.imageGrid}>
                  { this.state.images.map((image) => {
                      console.log(image.node.image)
                      return (
                          <TouchableHighlight onPress={this.selectImage.bind(null, image.node.image.uri)}>
                          <Image style={styles.image} source={{ uri: image.node.image.uri }} />
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
