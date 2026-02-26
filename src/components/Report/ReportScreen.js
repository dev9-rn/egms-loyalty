import React, {Component} from 'react';
import {
  Alert,
  StatusBar,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
// import CompressImage from 'react-native-compress-image';
import ImagePicker from 'react-native-image-picker';
import {
  Header,
  Left,
  Body,
  Title,
  Icon,
  Label,
  Text,
  Button,
} from 'native-base';
import {URL, APIKEY, ACCESSTOKEN} from '../../App';
import Loader from '../../Utility/Loader';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {strings} from '../../locales/i18n';
import {connect} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import MyColors from '../../Utility/Colors';
import AsyncStorage from '@react-native-community/async-storage';

import AndroidOpenSettings from 'react-native-android-open-settings';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {PERMISSIONS, request} from 'react-native-permissions';

class ReportScreen extends Component {
  state = {
    // pickedImage: IMG,
    pickedImage: '',
    pickedImage1: '',
    isImage: false,
    SrNo: '',
    Description: '',
    mobile_number: '',
    reporter_name: '',
    distributorId: '',
    carpenterId: '',
    loaderText: 'Please Wait...',
    showHideLoading: false,
    accesstoken: '',
    isPermissionGranted: false,
    isStoragePermissionGranted: false,
  };
  getDataFromAPi = () => {
    console.log('Validating form before submission...');
    if (!this._validateForm()) {
      return; // ❌ stop here if validation fails
    }

    AsyncStorage.multiGet(['USERDATA', 'ACCESSTOKEN'])
      .catch(err => {
        alert('Error');
      })
      .then(res => {
        var lData = JSON.parse(res[0][1]);
        this.setState({accesstoken: res[1][1]});
        this._onPressSendButton();
      });
  };

  componentDidMount() {
    this._requestPermission();
    this._requestStoragePermission();
  }

  _requestPermission = async () => {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    ).then(result => {
      if (result == 'granted') {
        this.setState({isPermissionGranted: true});
      }
      // console.log(result)
    });
  };

  _requestStoragePermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : Platform.Version >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    request(permission).then(result => {
      if (result == 'granted') {
        this.setState({isStoragePermissionGranted: true});
      }
    });
  };

  imagePickerHandler = async type => {
    try {
      if (
        this.state.isPermissionGranted &&
        (type === 'capture' || this.state.isStoragePermissionGranted)
      ) {
        if (type == 'capture') {
          await launchCamera(
            {
              saveToPhotos: true,
              mediaType: 'photo',
              includeBase64: false,
              includeExtra: true,
            },
            res => {
              // console.log("===result res" , JSON.stringify(res , null,2))
              if (res.didCancel) {
                // alert("u have cancelled.")
              } else if (res.error) {
                // console.log("image pucker" , res.error)
                alert('u have an error.');
              } else {
                this.setState({
                  isImage: true,
                  pickedImage: {uri: res?.assets[0].uri, data: res?.assets[0]},
                });
              }
            },
          );
        } else {
          await launchImageLibrary(
            {
              selectionLimit: 0,
              mediaType: 'photo',
              includeBase64: false,
              includeExtra: true,
            },
            res => {
              // console.log("===result res" , JSON.stringify(res , null,2))
              if (res.didCancel) {
                // alert("u have cancelled.")
              } else if (res.error) {
                // console.log("image pucker" , res.error)
                alert('u have an error.');
              } else {
                this.setState({
                  isImage: true,
                  pickedImage: {uri: res?.assets[0].uri, data: res?.assets[0]},
                });
              }
            },
          );
        }
      } else {
        Alert.alert(
          'Need Permissions ',
          'Camera and storage permissions are required.',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
            },
            {
              text: 'Open Setting',
              onPress: () => {
                this._openSettings();
              },
            },
          ],
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  // imagePickerHandler1 = async(type) => {
  //     try{
  //         if(this.state.isPermissionGranted){
  //             if(type == "capture"){
  //                 await launchCamera({
  //                     saveToPhotos: true,
  //                     mediaType: 'photo',
  //                     includeBase64: false,
  //                     includeExtra: true,
  //                 } , res =>{
  //                     // console.log("===result res" , JSON.stringify(res , null,2))
  //                     if (res.didCancel) {
  //                         // alert("u have cancelled.")
  //                     } else if (res.error) {
  //                         // console.log("image pucker" , res.error)
  //                         alert("u have an error.")
  //                     } else {
  //                         this.setState({
  //                             isImage: true,
  //                             pickedImage1: { uri: res?.assets[0].uri ,data : res?.assets[0]}
  //                         })
  //                     }
  //                 });
  //             }else{
  //                 await launchImageLibrary({
  //                     selectionLimit: 0,
  //                     mediaType: 'photo',
  //                     includeBase64: false,
  //                     includeExtra: true,
  //                 } , res =>{
  //                     // console.log("===result res" , JSON.stringify(res , null,2))
  //                     if (res.didCancel) {
  //                         // alert("u have cancelled.")
  //                     } else if (res.error) {
  //                         // console.log("image pucker" , res.error)
  //                         alert("u have an error.")
  //                     } else {
  //                         this.setState({
  //                             isImage: true,
  //                             pickedImage1: { uri: res?.assets[0].uri , data : res?.assets[0]}
  //                         })
  //                     }
  //                 });
  //             }
  //         }else{
  //             Alert.alert('Need Camera Persmission ', '', [
  //                 {
  //                     text: 'Cancel',
  //                     onPress: () => console.log('Cancel Pressed'),
  //                 },
  //                 {
  //                   text: 'Open Setting',
  //                   onPress: () => {this._openSettings()},
  //                 },

  //               ])
  //         }

  //     }catch(e){
  //         console.log(e)
  //     }
  // }

  _validateForm = () => {
    const {SrNo, Description, mobile_number, reporter_name, pickedImage} =
      this.state;

    if (!pickedImage || !pickedImage.uri) {
      Alert.alert('Validation Error', 'Please upload coupon image');
      return false;
    }

    if (!SrNo.trim()) {
      Alert.alert('Validation Error', 'Please enter Serial Number');
      return false;
    }

    if (!Description.trim()) {
      Alert.alert('Validation Error', 'Please enter description');
      return false;
    }

    if (!reporter_name.trim()) {
      Alert.alert('Validation Error', 'Please enter reporter name');
      return false;
    }

    if (!mobile_number.trim()) {
      Alert.alert('Validation Error', 'Please enter mobile number');
      return false;
    }

    if (mobile_number.length !== 10) {
      Alert.alert(
        'Validation Error',
        'Please enter valid 10 digit mobile number',
      );
      return false;
    }

    return true;
  };

  _openSettings() {
    if (Platform.OS == 'ios') {
      Linking.canOpenURL('app-settings:')
        .then(supported => {
          if (!supported) {
            console.log("Can't handle settings url");
          } else {
            return Linking.openURL('app-settings:');
          }
        })
        .catch(err => console.error('An error occurred', err));
    } else {
      AndroidOpenSettings.generalSettings();
    }
  }
  _onPressSendButton = () => {
    this.setState({showHideLoading: true});
    const photo = {
      uri: this.state.pickedImage.uri,
      type: this.state.pickedImage.data.type
        ? this.state.pickedImage.data.type
        : 'image/jpeg',
      name:
        Platform.OS == 'ios'
          ? 'coupon_front.jpg'
          : this.state.pickedImage.data.fileName,
    };
    // const photo1 = {
    //     uri: this.state.pickedImage1.uri,
    //     type: this.state.pickedImage1.data.type ? this.state.pickedImage1.data.type : "image/jpeg",
    //     name: Platform.OS == "ios" ? 'coupon_back.jpg' : this.state.pickedImage1.data.fileName
    // }

    const formData = new FormData();
    formData.append('srNo', this.state.SrNo);
    formData.append('description', this.state.Description);
    formData.append('mobile_number', this.state.mobile_number);
    formData.append('reporter_name', this.state.reporter_name);
    formData.append('couponFile', photo);
    // formData.append('couponFileBack', photo1);
    if (this.props.languageControl) {
      formData.append('language', 'en');
    } else {
      formData.append('language', 'hi');
    }
    //console.log(photo);
    // console.log(photo1);
    // console.log(formData);
    // console.log(this.state.accesstoken);
    var lUrl = URL + 'reportCouponCarpenterV1';

    console.log('URL: ', lUrl);
    console.log('FormData: ', formData);
    console.log('ACCESSTOKEN: ', this.state.accesstoken);

    for (let pair of formData._parts) {
      console.log('FormData => ', pair[0], pair[1]);
    }

    fetch(lUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        apikey: APIKEY,
        Cookie:
          'ci_session=a%3A5%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%22da38a377f3409665e3434080849b240b%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A13%3A%2245.248.66.185%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A21%3A%22PostmanRuntime%2F7.51.0%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1769480053%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3B%7D46ec330ecc43e5641051d7fee2d2feb1b305e9e1',
      },
      body: formData,
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({showHideLoading: false});
        console.log('responseJson', responseJson);
        // console.log(responseJson);
        if (responseJson.status == 403) {
          utilities.showToastMsg(responseJson.message);
          this.props.navigation.navigate('LoginScreen');
          AsyncStorage.clear();
          return;
        } else if (responseJson.status == 400) {
          Alert.alert(
            strings('login.ScanScreenAlertTitle'),
            responseJson.message,
            [
              // { text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              {
                text: strings('login.OK'),
              },
            ],
            {cancelable: false},
          );
        } else if (responseJson.message) {
          // alert(JSON.stringify(responseJson.message))
          Alert.alert(
            strings('login.ScanScreenAlertTitle'),
            responseJson.message,
            [
              // { text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              {
                text: strings('login.OK'),
                onPress: () => {
                  this.props.navigation.navigate('LoginScreen');
                },
              },
            ],
            {cancelable: false},
          );
        } else {
          alert(JSON.stringify(responseJson));
        }
      })
      .catch(error => {
        this.setState({showHideLoading: false});
        alert(error);
      });
  };
  _showHeader() {
    if (Platform.OS == 'ios') {
      return (
        <Header
          style={{backgroundColor: MyColors.distributorColor, display: 'flex'}}>
          <Grid>
            <Col style={{justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('LoginScreen')}>
                <Icon
                  type="FontAwesome5"
                  name="arrow-left"
                  style={{fontSize: 20, color: '#FFFFFF'}}
                />
              </TouchableOpacity>
            </Col>
            <Col size={15} style={{justifyContent: 'center', paddingRight: 20}}>
              <Title style={{color: '#FFFFFF'}}>
                {strings('login.report_screen_title')}
              </Title>
            </Col>
          </Grid>
        </Header>
      );
    } else {
      return (
        <Header style={{backgroundColor: MyColors.distributorColor}}>
          <Left style={{flex: 0.1}}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('LoginScreen')}>
              <Icon
                type="FontAwesome5"
                name="arrow-left"
                style={{fontSize: 20, color: '#FFFFFF', paddingLeft: 10}}
              />
            </TouchableOpacity>
          </Left>
          <Body style={{flex: 0.9, alignItems: 'center'}}>
            <Title style={{color: '#FFFFFF', fontSize: 16, marginLeft: -10}}>
              {strings('login.report_screen_title')}
            </Title>
          </Body>
        </Header>
      );
    }
  }
  render() {
    return (
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        style={{
          backgroundColor: this.props.enableDarkTheme ? 'black' : 'white',
        }}>
        {this._showHeader()}
        <StatusBar
          backgroundColor={MyColors.distributorColor}
          barStyle="light-content"
        />
        <View
          style={{flexDirection: 'row', flex: 1, margin: 10, marginTop: 20}}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Pick an image ', '', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                },
                {
                  text: 'Take Photo..',
                  onPress: () => this.imagePickerHandler('capture'),
                },
                {
                  text: 'choose from Gallery...',
                  onPress: () => this.imagePickerHandler('gallery'),
                },
              ]);
            }}
            style={{
              overflow: 'hidden',
              height: 200,
              width: 200,
              flex: 1,
              alignItems: 'center',
              marginLeft: 0,
              marginRight: 0,
              borderWidth: 1,
            }}>
            {this.state.pickedImage ? (
              <Image
                source={this.state.pickedImage}
                style={{width: 195, height: 198}}
                resizeMode="contain"
              />
            ) : (
              <View style={{flex: 1, justifyContent: 'center'}}>
                <Icon
                  type="FontAwesome"
                  name="camera-retro"
                  style={{fontSize: 25, alignSelf: 'center'}}
                />
                <Text style={{textAlignVertical: 'center', marginTop: 10}}>
                  {strings('login.uploadImage')}
                  <Text style={{color: 'red'}}>*</Text>
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={()=>{
                        Alert.alert('Pick an image ', '', [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                            },
                            {
                              text: 'Take Photo..',
                              onPress: () => this.imagePickerHandler1('capture'),
                            },
                            {
                                text: 'choose from Gallery...', 
                                onPress: () => this.imagePickerHandler1('gallery')
                            },
                          ])
                    }} style={{ overflow:'hidden',height: 200, flex: 1, alignItems: 'center', marginLeft: 10, marginRight: 0, borderWidth: 1, }}>
                        {this.state.pickedImage1 ?
                            <Image source={this.state.pickedImage1} style={{ width: 195, height: 198, }} resizeMode="stretch" />
                            :
                            <View style={{ flex: 1, justifyContent: "center" }}>
                                <Icon type="FontAwesome" name="camera-retro" style={{ fontSize: 25, alignSelf: "center", }} />
                                <Text style={{ textAlignVertical: "center", marginTop: 10 }}>{strings('login.cou[ponBackSide')}
                                    <Text style={{ color: "red", }}>*</Text>
                                </Text>
                            </View>
                        }
                    </TouchableOpacity> */}
        </View>

        {this.state.showHideLoading ? (
          <Loader loading={this.state.loading} text={this.state.loaderText} />
        ) : null}
        <Label
          style={{
            marginLeft: 10,
            marginTop: '15%',
            fontWeight: 'bold',
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}>
          {strings('login.report_screen_srNo')}
          <Text style={{color: 'red'}}>* </Text>:
        </Label>

        <TextInput
          style={{
            borderBottomColor: MyColors.distributorColor,
            borderBottomWidth: 1,
            marginBottom: 30,
            marginLeft: 20,
            marginRight: 20,
            marginTop: 10,
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}
          placeholder={strings('login.report_screen_srNo')}
          // autoFocus={true}
          onChangeText={SrNo => this.setState({SrNo})}
        />
        <Label
          style={{
            marginLeft: 10,
            fontWeight: 'bold',
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}>
          {strings('login.report_screen_descr')}
          <Text style={{color: 'red'}}>* </Text>:
        </Label>
        <TextInput
          style={{
            borderBottomColor: MyColors.distributorColor,
            borderBottomWidth: 1,
            marginBottom: 30,
            marginLeft: 20,
            marginRight: 20,
            marginTop: 10,
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}
          placeholder={strings('login.report_screen_descr')}
          onChangeText={Description => this.setState({Description})}
        />
        <Label
          style={{
            marginLeft: 10,
            fontWeight: 'bold',
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}>
          Name
          <Text style={{color: 'red'}}>* </Text>:
        </Label>
        <TextInput
          style={{
            borderBottomColor: MyColors.distributorColor,
            borderBottomWidth: 1,
            marginBottom: 30,
            marginLeft: 20,
            marginRight: 20,
            marginTop: 10,
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}
          placeholder="Enter Reporter Name"
          onChangeText={reporter_name => this.setState({reporter_name})}
        />
        <Label
          style={{
            marginLeft: 10,
            fontWeight: 'bold',
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}>
          Mobile Number
          <Text style={{color: 'red'}}>* </Text>:
        </Label>
        <TextInput
          style={{
            borderBottomColor: MyColors.distributorColor,
            borderBottomWidth: 1,
            marginBottom: 30,
            marginLeft: 20,
            marginRight: 20,
            marginTop: 10,
            color: this.props.enableDarkTheme ? 'white' : 'black',
          }}
          placeholder="Enter Mobile Number"
          keyboardType="phone-pad"
          onChangeText={mobile_number => this.setState({mobile_number})}
        />

        <View
          style={{
            marginTop: 30,
            marginBottom: 0,
            flex: 1,
            alignSelf: 'center',
          }}>
          <Button
            style={{
              backgroundColor: MyColors.distributorColor,
              borderRadius: 20,
              width: 200,
            }}
            onPress={this.getDataFromAPi}>
              <Text
              style={{
                textAlign: 'center',
                flex: 1,
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              {strings('login.sendButton')}
            </Text>
            </Button>
          {/* <Button style={{ backgroundColor: "#e43c22" }} onPress={this.getDataFromAPi} title={strings('login.sendButton')} disabled={this.state.SrNo.trim().length > 0 && this.state.Description.trim().length > 0
                        && this.state.pickedImage.uri && this.state.pickedImage1.uri ? false : true} /> */}
          {/* <Button
            style={{
              backgroundColor: MyColors.distributorColor,
              borderRadius: 20,
              width: 200,
            }}
            onPress={this.getDataFromAPi}
            disabled={
              this.state.SrNo.trim().length > 0 &&
              this.state.Description.trim().length > 0 &&
              this.state.mobile_number.trim().length > 0 &&
              this.state.reporter_name.trim().length > 0 &&
              this.state.pickedImage.uri
                ? false
                : true
            }>
            <Text
              style={{
                textAlign: 'center',
                flex: 1,
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              {strings('login.sendButton')}
            </Text>
          </Button> */}
        </View>
      </ScrollView>
    );
  }
}
const mapStateToProps = state => {
  return {
    enableDarkTheme: state.VerifierReducer.enableDarkTheme,
    languageControl: state.VerifierReducer.languageEnglish,
  };
};
export default connect(mapStateToProps, null)(ReportScreen);
