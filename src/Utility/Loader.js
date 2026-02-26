
import React, { Component } from 'react';
import { StyleSheet, View, Modal, ActivityIndicator, Dimensions, Text } from 'react-native';
import MyColors from '../Utility/Colors';
const Loader = props => {
  const {
    loading,
    text,
    ...attributes
  } = props;
  
  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      onRequestClose={() => {console.log('close modal')}}
      >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            color = { MyColors.dealerColor}
            animating={loading} 
            style={styles.activityIndicator}
            size = "large"
          />
          <Text style={styles.text1}>{ text }</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 60,
    // width: 100,
    width: Dimensions.get('window').width * 0.8,
    borderRadius: 8,
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'space-around'

    // flex: 1,
    flexDirection: 'row' ,
    // alignItems: 'stretch', 
    // backgroundColor: 'yellow'
  },
  activityIndicator:{
    flex:0.2,
    // backgroundColor: 'skyblue'
  },
  text1:{
    marginTop: 18,
    marginLeft: 5,
    // backgroundColor: 'orange',
    flex:0.8,
    color: '#000000',
  }
});

export default Loader;
