import React, { Component } from 'react';
import { Alert, BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity, StatusBar, Animated, ScrollView, Easing, PermissionsAndroid, Button, Linking, NativeEventEmitter } from 'react-native';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Icon, Toast } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Modal from "react-native-modal";
import ScanService from '../../services/ScanService/ScanService';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
import Moment from 'moment';
import { Col, Row, Grid } from "react-native-easy-grid";
import { RNCamera } from 'react-native-camera';
import { strings } from '../../locales/i18n';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
var Sound = require('react-native-sound');
import ImagePicker from 'react-native-image-picker';
import MyColors from '../../Utility/Colors';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from '@react-native-community/geolocation';
import AndroidOpenSettings from 'react-native-android-open-settings';
import Colors from '../../Utility/Colors';
import { NetworkInfo } from 'react-native-network-info';
import { BarcodeManager } from '@datalogic/react-native-datalogic-module'; // comment to build IOS build
// import ViewShot from "react-native-view-shot";

var redeemMethodsT = [];
var redeemMethodsP = [];
var redeemMethodsUs = [];
class ScanScreen extends Component {
    constructor(props) {
        super(props);
        this.distributorId;
        this.animatedValue = new Animated.Value(0)
        // redeemMethodsT = [];
        this.qrText;
        this.state = {
            userId: '',
            userName: '',
            userMobile: "0000000000",
            flashEnabled: false,
            loading: false,
            showCamera: true,
            showCameraText: true,
            showModal: false,
            isModalVisible: false,
            loaderText: 'Scanning...',
            redeemType: '',
            redeemMethods: [],
            offerDetails: {},
            userType: '',
            flash: '',
            checkForPayment: '',
            animatedWidth: new Animated.Value(0),
            animatedHeight: new Animated.Value(0),
            isSuccess: false,
            reactivateScanner: 3000,
            scanningTitle: '',
            scanningBody: '',
            cashDetails: '',
            loyaltyPoints: '',
            productName: "",
            productDenomination: "",
            accesstoken :"",
            redeemedBy:"",
            userType:'',
            businessName: '',
            carpenterId:'',
            currentLocation: {},
            endDate:'',
        };
    }
    componentWillMount() { this._getAsyncData(); }
    componentDidMount = () => {
        // this.refs.viewShot.capture().then(uri => {
        //     console.log("do something with ", uri);
        //   });
        let ip = this.getIPAddress();
        this.getLocation();
        this.didFocusSubscription = this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.setState({ showCamera: true });
            }
        );
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        if(Platform.OS == 'android'){
            try {
                const eventEmitter = new NativeEventEmitter(BarcodeManager);
                eventEmitter.addListener('successCallback', map => {
                    this.getLocation();
                    if(this.state.currentLocation?.longitude){
                        this._callForAPIRedeem({data : map.barcodeData});
                    }else{
                        this.permissionAlert();
                    }
                    Alert.alert('Barcode Result', map.barcodeData + '\n' + map.barcodeType);
                });
                BarcodeManager.addReadListener();
            } catch (e) {
                console.error(e);
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        this.didFocusSubscription.remove();
    }
    handleBackPress = () => {
        this.props.navigation.navigate('LoginScreen');
        return true;
    }
    closeActivityIndicator() {
        setTimeout(() => {
            this.setState({ loading: false });
        });
    }

    requestLocationPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Geolocation Permission',
              message: 'Can we access your location?',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          console.log('granted', granted);
          if (granted === 'granted') {
            console.log('You can use Geolocation');
            return true;
          } else {
            console.log('You cannot use Geolocation');
            return false;
          }
        } catch (err) {
          return false;
        }
    };

    getLocation = () => {
        // const result = this.requestLocationPermission();
        // result.then(res => {
        //   console.log('res is:', res);
        //   if (res) {
            Geolocation.getCurrentPosition(
              position => {
                console.log(position);
                this.setState({currentLocation : position.coords})
                // setLocation(position);
              },
              error => {
                // See error code charts below.
                this.setState({currentLocation : {},showCamera : false})
                this.permissionAlert();
                // this.requestLocationPermission();
                console.log(error.code, error.message);
                // setLocation(false);
              },
            );
        //   }else{
        //     this.setState({currentLocation : {}})
        //   }
        // });
        // console.log(location);
    };

    permissionAlert(){
        Alert.alert(
            'Permission Required',
            'Location permission is required to access these features.',
            [
                { text: strings('login.OK'), onPress: () => { 
                        if (Platform.OS == 'ios') {
                            Linking.canOpenURL('app-settings:').then(supported => {
                                if (!supported) {
                                    console.log('Can\'t handle settings url');
                                } else {
                                    return Linking.openURL('app-settings:');
                                }
                            }).catch(err => console.error('An error occurred', err));
                        } else {
                            AndroidOpenSettings.generalSettings();
                        }
                    }
                },
            ],
            { cancelable: true }
        );
    }

    async _getAsyncData() {

        await AsyncStorage.multiGet(['USERDATA','ACCESSTOKEN'], (err, result) => {
            
            var lData = JSON.parse(result[0][1]);
            this.setState({ accesstoken: result[1][1] });
            console.log(JSON.stringify(lData , null,2));
            if (lData) {
                // this.distributorId = lData.data.id;
                this.setState({ carpenterId: lData.data.id, userType: lData.data.userType, checkForPayment: lData.data.payment_option ,userMobile : lData.data.mobile_no})
            }
        });
    }
    _showModalOffer() { this.setState({ modalValue: 'offers', isModalVisible: !this.state.isModalVisible }); }
    onSuccess(e) {
        console.log("=-=-=-=00000");
        // console.log(e.data);

        this.setState({ showCamera: false, showCameraText: false });
        // this._callForAPICheckCoupon(e);
        this.getLocation();
        if(this.state.currentLocation?.longitude){
            this._callForAPIRedeem(e);
        }else{
            this.permissionAlert();
        }
    }

    async getIPAddress(){
        // let ipAddress = await NetworkInfo.getIPAddress().then(ipv4Address => {
        //     console.log("========IPadress",ipv4Address);
        //     return ipv4Address;
        // });
        let ipAddress = await fetch('https://api.ipify.org?format=json')
          .then(response => response.json())
          .then(data => {
            return data.ip;
          })
          .catch(error => {
            console.error("Error fetching the IP address: ", error);
          });

        // console.log("========IPadress1",ipAddress);
        return ipAddress;
    }

    async _callForAPIRedeem(e) {
        this.setState({ isModalVisible: !this.state.isModalVisible, isCheckedScheme: false, isCheckedCash: false });
        let redeemType = this.state.redeemType;
            console.log(redeemType);
            let ip = await this.getIPAddress();
            console.log("1" ,ip);
            const formData = new FormData();
            formData.append('qrText', e.data);
            formData.append('carpenterId', this.state.carpenterId);
            formData.append('redeemType', "0");
            formData.append('ip_address', ip || "0.0.0.0");
            formData.append('latitude' , this.state?.currentLocation?.latitude || 0);
            formData.append('longitude' , this.state?.currentLocation?.longitude || 0);
            // formData.append('userType', this.state.userType);
            formData.append('deviceType' , Platform.OS);
            if (this.props.languageControl) {
                formData.append('language', 'en');
            } else {
                formData.append('language', 'hi');
            }
            console.log("======formdata",formData);

            var scanApiObj = new ScanService();
            this.setState({ loading: true, loaderText: "Loading..." });
            await scanApiObj.redeemCoupon(formData,this.state.accesstoken);
            var lResponseData = scanApiObj.getRespData();
            // console.log(lResponseData);
            await this.closeActivityIndicator();
            if (!lResponseData) {
                utilities.showToastMsg('Something went wrong. Please try again later');
            } else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 422) {
                console.log("1");
                this.animatedBoxForDanger(lResponseData.message)
                // utilities.showToastMsg(lResponseData.message);
            } else if (lResponseData.status == 403) {
                utilities.showToastMsg(lResponseData.message);
                this.props.navigation.navigate('LoginScreen');
                AsyncStorage.clear();
                return;
            }
            else if (lResponseData.status == 404) {
                utilities.showToastMsg(lResponseData.message);
                this.props.navigation.navigate('PaymentDetailsScreen');
                // AsyncStorage.clear();
                return;
            }
            
            else if (lResponseData.status == 200) {
                // utilities.showToastMsg(lResponseData.message);
                redeemMethodsT = lResponseData.couponData;
                redeemMethodsP = lResponseData.productData;
                redeemMethodsUs = lResponseData.userData;
                console.log("=========response" , JSON.stringify(lResponseData , null,2))
                this.setState({isSuccess: true , cashDetails : redeemMethodsT.value, productName : redeemMethodsP.product_name , productDenomination : redeemMethodsP.product_denomination , scanningBody : lResponseData.message , businessName: redeemMethodsUs.business_name ,userMobile: redeemMethodsUs.mobile_no, endDate : redeemMethodsT?.end_date})
                // this.setState({ redeemMethods: lResponseData.redeemMethodsT, redeemType: redeemMethodsT[0].redeem_type })
                // for (var i = 0; i < redeemMethodsT.length; i++) {
                //     if (redeemMethodsT[i].redeem_type == "1") {
                //         this.setState({ offerDetails: redeemMethodsT[i].details });
                //     } else if (redeemMethodsT[i].redeem_type == "0") {
                //         console.log("][][][][][][][]][][][");
                //         console.log(redeemMethodsT[i]);

                //         this.setState({ redeemedBy: lResponseData.dealerName, cashDetails: redeemMethodsT[i].details.value, productName: lResponseData.couponData.product_name, loyaltyPoints: lResponseData.couponData.product_loyalty_points }, () => console.log(this.state.cashDetails));
                //     }
                // }

                // this.animatedBox(lResponseData.message); //comment code for new changes
                // this.setState({ showCamera: true }); //comment code for new changes
                // this.props.navigation.navigate('ScanScreen');

            } else {
                utilities.showToastMsg('Something went wrong. Please try again later');
            }
        // }
    }
    // async _callForAPICheckCoupon(e) {
    //     if (this.props.pymOpn == '0') {
    //         Alert.alert(
    //             strings('login.ScanScreenAlertTitle'),
    //             strings('login.ScanScreenAlertContent'),
    //             [
    //                 { text: strings('login.OK'), onPress: () => { this.props.navigation.navigate('PaymentDetailsScreen') } },
    //             ],
    //             { cancelable: true }
    //         )
    //         return;
    //     } else {
    //         this.qrText = e.data;
    //         const formData = new FormData();
    //         formData.append('qrText', e.data);
    //         formData.append('distributorId', this.distributorId);
    //         formData.append('userType', this.state.userType);
    //         if (this.props.languageControl) {
    //             formData.append('language', 'en');
    //         } else {
    //             formData.append('language', 'hi');
    //         }
    //         console.log("0000");
    //         console.log(formData);

    //         var scanApiObj = new ScanService();
    //         this.setState({ loading: true, loaderText: "Loading..." });
    //         await scanApiObj.checkCoupon(formData,this.state.accesstoken);
    //         var lResponseData = scanApiObj.getRespData();

    //         console.log("=-=-=-=-=-=-output=-=-=-=-=------------");
    //         console.log(lResponseData);

    //         await this.closeActivityIndicator();
    //         debugger
    //         if (!lResponseData) {
    //             utilities.showToastMsg('Something went wrong. Please try again later');
    //         } else if (lResponseData.status == 500 || lResponseData.status == 400 || lResponseData.status == 422) {
    //             this.animatedBoxForDanger(lResponseData.message)
    //             return;
    //         } else if (lResponseData.status == 200) {
    //             redeemMethodsT = lResponseData.redeemMethods;
    //             this.setState({ redeemMethods: lResponseData.redeemMethodsT, redeemType: redeemMethodsT[0].redeem_type })
    //             for (var i = 0; i < redeemMethodsT.length; i++) {
    //                 if (redeemMethodsT[i].redeem_type == "1") {
    //                     this.setState({ offerDetails: redeemMethodsT[i].details });
    //                 } else if (redeemMethodsT[i].redeem_type == "0") {
    //                     console.log("][][][][][][][]][][][");
    //                     console.log(redeemMethodsT[i]);

    //                     this.setState({ redeemedBy: lResponseData.dealerName, cashDetails: redeemMethodsT[i].details.value, productName: lResponseData.couponData.product_name, loyaltyPoints: lResponseData.couponData.product_loyalty_points }, () => console.log(this.state.cashDetails));
    //                 }
    //             }
    //             this._showModalOffer();
    //         } else {
    //             utilities.showToastMsg('Something went wrong. Please try again later');
    //         }
    //     }
    // }

    _scanAgain(){
        this.setState({ showCamera: true, showCameraText: true ,isSuccess : false});
    }

    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: this.state.userType == 2 ? MyColors.dealerColor : MyColors.distributorColor }}>
                    <Left style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => {this.state.isSuccess ? this._scanAgain() : this.props.navigation.navigate('LoginScreen')}}>
                            <Icon type="FontAwesome5" name="arrow-left" style={{ fontSize: 20, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.6 }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, textAlign : 'center'}}>{strings('login.scan_screen_title')}</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => { this._openFlash() }}>
                            {this.state.flashEnabled ?
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: 'yellow', paddingLeft: 10, paddingRight: 10 }} />
                                :
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                            }
                        </TouchableOpacity>
                    </Right>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: this.state.userType == 2 ? MyColors.dealerColor : MyColors.distributorColor}}>
                    <Left style={{ flex: 0.5 }}>
                        <TouchableOpacity onPress={() => {this.state.isSuccess ? this._scanAgain() : this.props.navigation.navigate('LoginScreen')}}>
                            <Icon type="FontAwesome5" name="arrow-left" style={{ fontSize: 20, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.7 }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>{strings('login.scan_screen_title')}</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => { this._openFlash() }}>
                            {this.state.flashEnabled ?
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: 'yellow', paddingLeft: 10, paddingRight: 10 }} />
                                :
                                <Icon type="FontAwesome" name="lightbulb-o" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                            }
                        </TouchableOpacity>
                    </Right>
                </Header>
            )
        }
    }
    _showModal() {
        if (Platform.OS == 'ios') {
            if (this.state.isModalVisible) {
                return (
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <ScrollView style={{ width: 350, paddingTop: 20 }} keyboardShouldPersistTaps={'handled'}>
                            <Card style={{ flex: 1, borderRadius: 7, padding: 20, }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{strings('login.couponDetails')}{'\n'}</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                                {this.state.redeemType === '1'
                                    ? <View style={{ paddingBottom: 10, flexDirection: 'row' }}>
                                    </View>
                                    :
                                    <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row' }}>
                                        <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                        {/* {this.state.redeem_type} */}
                                    </View>
                                }
                                {this.state.redeemType === '1' ?
                                    <View style={{ flex: 1, }}>

                                        <Grid >
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.tit')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.title} </Text></Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>Description : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.gift} </Text></Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.validity')} : <Text style={{ fontSize: 14 }}>{strings('login.offer')}
                                                        <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.from_date).format('D-MMM-YYYY')}
                                                            {""} <Text style={{ fontSize: 14 }}>{strings('login.til')}</Text> {""}
                                                            <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.to_date).format('D-MMM-YYYY')}
                                                            </Text></Text></Text></Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginLeft: 10 }}>
                                                <Col size={3}>
                                                    <Text style={{ color: 'grey' }}>*</Text>
                                                </Col>
                                                <Col size={97}>
                                                    <Text style={{ fontSize: 14, color: 'grey', }}>Target-- : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.target} </Text></Text>
                                                </Col>
                                            </Row>
                                            <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20 }} />
                                        </Grid>
                                    </View>
                                    :
                                    // <View></View>
                                    <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row' }}>
                                        <Grid>
                                            {/* <Row>
                                                <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                            </Row>
                                            <Row style={{ marginTop: 10 }}>
                                                <Col size={1.3}>
                                                    <Text style={{ textAlign: 'right', flex: 1, }}>Amount : </Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ flex: 1, textAlign: 'left' }}><Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginTop: 10 , backgroundColor:'red' , justifyContent:'center'}}>
                                                <Col size={1.3}>
                                                    <Text style={{ textAlign: 'right', flex: 1, }}>Loyalty Points : </Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ flex: 1, textAlign: 'left' }}>{this.state.loyaltyPoints}</Text>
                                                </Col>
                                            </Row> */}
                                            {/* <Row>
                                                <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                            </Row> */}

                                            {this.props.languageControl == 'Urdu - (اردو)' ?
                                                <Grid>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}> : {strings('login.amt')}</Text>
                                                        <Text style={{}}><Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                    </Row>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.scanned_by')} : 
                                                        { this.state.redeemedBy === "" ?  '  - ' :this.state.redeemedBy}
                                                         </Text>
                                                        
                                                    </Row>
                                                    {/* <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}> : {strings('login.LoPoints')}</Text>
                                                        <Text style={{}}>{this.state.loyaltyPoints}</Text>
                                                    </Row> */}
                                                </Grid>
                                                :
                                                <Grid>
                                                    {/* <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.LoProductName')}</Text>
                                                        <Text style={{}}> : {this.state.productName}</Text>
                                                    </Row> */}
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.amt')}</Text>
                                                        <Text style={{}}> : <Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                    </Row>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.scanned_by')} : 
                                                        { this.state.redeemedBy === "" ?  '  - ' :this.state.redeemedBy}
                                                         </Text>
                                                        
                                                    </Row>
                                                    {/* <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.LoPoints')}</Text>
                                                        <Text style={{}}> : {this.state.loyaltyPoints}</Text>
                                                    </Row> */}
                                                </Grid>
                                            }
                                        </Grid>
                                    </View>
                                }
                                <View style={{ paddingTop: 20, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this._callForAPIRedeem() }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.REDEEM')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { this.setState({ isModalVisible: !this.state.isModalVisible, showCamera: true, showCameraText: true, isCheckedScheme: false, isCheckedCash: false }) }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.CANCEL')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </ScrollView>
                    </View>
                )
            }
        } else {
            return (
                <Modal isVisible={this.state.isModalVisible} style={{ paddingTop: 50 }}>
                    <View style={{ flex: 1, }}>
                        <ScrollView>
                            <Card style={{ flex: 1, borderRadius: 7, padding: 20, }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{strings('login.couponDetails')}{'\n'}</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
                                {this.state.redeemType === '1'
                                    ? <View style={{ paddingBottom: 10, flexDirection: 'row' }}>
                                    </View>
                                    :
                                    <View style={{ paddingTop: 10, paddingBottom: 10, flex: 1, flexDirection: 'row' }}>
                                        <Grid>
                                            {/* <Row>
                                                <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                            </Row>
                                            <Row style={{ marginTop: 10 }}>
                                                <Col size={1.3}>
                                                    <Text style={{ textAlign: 'right', flex: 1, }}>Amount : </Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ flex: 1, textAlign: 'left' }}><Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                </Col>
                                            </Row>
                                            <Row style={{ marginTop: 10 , backgroundColor:'red' , justifyContent:'center'}}>
                                                <Col size={1.3}>
                                                    <Text style={{ textAlign: 'right', flex: 1, }}>Loyalty Points : </Text>
                                                </Col>
                                                <Col>
                                                    <Text style={{ flex: 1, textAlign: 'left' }}>{this.state.loyaltyPoints}</Text>
                                                </Col>
                                            </Row> */}
                                            <Row>
                                                <Text style={{ paddingTop: 10, textAlign: 'center', flex: 1 }}>{strings('login.RedeemCash')}</Text>
                                            </Row>

                                            {this.props.languageControl == 'Urdu - (اردو)' ?
                                                <Grid>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}> : {strings('login.amt')}</Text>
                                                        <Text style={{}}><Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                    </Row>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.scanned_by')} : 
                                                        { this.state.redeemedBy === "" ?  '  - ' :this.state.redeemedBy}
                                                         </Text>
                                                        
                                                    </Row>
                                                    {/* <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}> : {strings('login.LoPoints')}</Text>
                                                        <Text style={{}}>{this.state.loyaltyPoints}</Text>
                                                    </Row> */}
                                                </Grid>
                                                :
                                                <Grid>
                                                    {/* <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.LoProductName')}</Text>
                                                        <Text style={{}}> : {this.state.productName}</Text>
                                                    </Row> */}
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.amt')}</Text>
                                                        <Text style={{}}> : <Icon type="FontAwesome" name="inr" style={{ fontSize: 13 }} />{this.state.cashDetails}</Text>
                                                    </Row>
                                                    <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.scanned_by')} : 
                                                        { this.state.redeemedBy === "" ?  '  - ' :this.state.redeemedBy}
                                                         </Text>
                                                        
                                                    </Row>
                                                    {/* <Row style={{ marginTop: 10, alignSelf: 'center' }}>
                                                        <Text style={{ textAlign: 'left', color: 'grey' }}>{strings('login.LoPoints')}</Text>
                                                        <Text style={{}}> : {this.state.loyaltyPoints}</Text>
                                                    </Row> */}
                                                </Grid>
                                            }
                                        </Grid>
                                    </View>
                                }
                                {this.state.redeemType === '1' ?
                                    <View style={{ flex: 1, }}>
                                        <Grid style={{ marginLeft: 30 }}>
                                            {this.props.languageControl == 'Urdu - (اردو)' ?
                                                <Grid>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.tit')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.title} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.prodName')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.product_name} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalProd')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_products} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalBox')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_boxes} </Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <Row style={{ alignSelf: 'flex-end' }}>
                                                        <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.validity')} : <Text style={{ fontSize: 14 }}>{strings('login.offer')}
                                                            <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.from_date).format('D-MMM-YYYY')}
                                                                {""} <Text style={{ fontSize: 14 }}>{strings('login.til')}</Text> {""}
                                                                <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.to_date).format('D-MMM-YYYY')}
                                                                </Text></Text></Text></Text>
                                                        <Text style={{ color: 'grey' }}>*</Text>
                                                    </Row>
                                                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20 }} />
                                                </Grid>
                                                :
                                                <Grid>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.tit')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.title} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.prodName')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.product_name} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalProd')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_products} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.totalBox')} : <Text style={{ fontSize: 14 }}>{this.state.offerDetails.total_boxes} </Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col size={3}>
                                                            <Text style={{ color: 'grey' }}>*</Text>
                                                        </Col>
                                                        <Col size={97}>
                                                            <Text style={{ fontSize: 14, color: 'grey', }}>{strings('login.validity')} : <Text style={{ fontSize: 14 }}>{strings('login.offer')}
                                                                <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.from_date).format('D-MMM-YYYY')}
                                                                    {""} <Text style={{ fontSize: 14 }}>{strings('login.til')}</Text> {""}
                                                                    <Text style={{ color: 'green', fontSize: 14 }}> {Moment(this.state.offerDetails.to_date).format('D-MMM-YYYY')}
                                                                    </Text></Text></Text></Text>
                                                        </Col>
                                                    </Row>
                                                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20 }} />
                                                </Grid>
                                            }
                                        </Grid>
                                    </View>
                                    :
                                    <View></View>
                                }
                                <View style={{ paddingTop: 20, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this._callForAPIRedeem() }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.REDEEM')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { this.setState({ isModalVisible: !this.state.isModalVisible, showCamera: true, showCameraText: true, isCheckedScheme: false, isCheckedCash: false }) }}>
                                        <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 18 }} >{strings('login.CANCEL')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </ScrollView>
                    </View>
                </Modal>
            )
        }
    }
    _openFlash = async () => {
        this.setState(prevState => ({
            flashEnabled: !prevState.flashEnabled
        }), () => {
            if (this.state.flashEnabled) {
                this.setState({ flash: RNCamera.Constants.FlashMode.torch })
            } else {
                this.setState({ flash: RNCamera.Constants.FlashMode.off })
            }
        });
    }
    animatedBox = (msg) => {
        this.setState({ isSuccess: true, reactivateScanner: 5000, showCamera: true, scanningTitle: 'SUCCESS', scanningBody: msg }, () => {
            var whoosh = new Sound('eventually.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                } else {
                    whoosh.play();
                }
            });
            Animated.timing(this.state.animatedWidth, {
                toValue: 300,
                duration: 500
            }).start()
            Animated.timing(this.state.animatedHeight, {
                toValue: 300,
                duration: 500
            }).start()
            this.animate()
            setTimeout(() => {
                Animated.timing(this.state.animatedWidth, {
                    toValue: 0,
                    duration: 400
                }).start()
                Animated.timing(this.state.animatedHeight, {
                    toValue: 0,
                    duration: 400
                }).start()
            }, 2000);
        })
    }
    animate() {
        this.animatedValue.setValue(0)
        Animated.timing(
            this.animatedValue,
            {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear
            }
        ).start(() => this.animate())
    }
    animatedBoxForDanger = (msg) => {
        this.setState({ isSuccess: false, reactivateScanner: 3000, showCamera: true, scanningTitle: 'Warning!', scanningBody: msg }, () => {
            var whoosh = new Sound('system_fault.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                } else {
                    whoosh.play();
                }
            });
            Animated.timing(this.state.animatedWidth, {
                toValue: 300,
                duration: 500
            }).start()
            Animated.timing(this.state.animatedHeight, {
                toValue: 300,
                duration: 500
            }).start()
            this.animate()
            setTimeout(() => {
                Animated.timing(this.state.animatedWidth, {
                    toValue: 0,
                    duration: 400
                }).start()
                Animated.timing(this.state.animatedHeight, {
                    toValue: 0,
                    duration: 400
                }).start()
            }, 2000);
        })
    }
    animateForDanger() {
        this.animatedValue.setValue(0)
        Animated.timing(
            this.animatedValue,
            {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear
            }
        ).start(() => this.animateForDanger())
    }
    takePicture = async () => {
        try {
            const options = { quality: 0.5, pauseAfterCapture: true };
            const data = await this.camera.takePictureAsync(options);
            this.setState({ path: data.uri, data: data });
            console.log('Path to image: ' + data.uri);
        } catch (err) {
            console.log('err: ', err);
        }
    };


    _renderSuccessResponse = () =>{
        return(
            <ScrollView
                style={{
                    backgroundColor : "#008000",
                    width : Dimensions.get('screen').width,
                    height : Dimensions.get('screen').height
                }}
            >
                {true ?
                    <Icon type="FontAwesome" name="check-circle-o" style={{ fontSize: 80, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                    :
                    <Icon type="FontAwesome" name="times-circle-o" style={{ fontSize: 80, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                }

                <Text style={{ color: 'white', fontSize: 22, textAlign: 'center', textAlignVertical: 'center',marginVertical : 25,fontWeight : '700'}}>Sticker verified successfully</Text>

                <View style={styles.itemContainer}>
                    <View style={{width : '38%'}}>
                        <Text style={styles.successItem}>Product Name</Text>
                    </View>
                    <View style={{width : '2%'}}>
                        <Text style={styles.successItem}>:</Text>
                    </View>
                    <View style={{width : '57%'}}>
                        <Text style={styles.successItem}>{this.state.productName}</Text>
                    </View>
                    {/* <Text style={{ color: 'white', fontSize: 17, marginVertical: 10 , marginLeft : 20}}>{this.state.productName}</Text>     */}
                </View>

                <View style={styles.itemContainer}>
                    <View style={{width : '38%'}}>
                        <Text style={styles.successItem}>Expiry Date</Text>
                    </View>
                    <View style={{width : '2%'}}>
                        <Text style={styles.successItem}>:</Text>
                    </View>
                    <View style={{width : '57%'}}>
                        <Text style={styles.successItem}>{Moment(this.state.endDate).format('D MMMM YYYY')}</Text>
                    </View>
                </View>
                
                <View style={{width : '100%' , height : 0.5 , backgroundColor : 'lightgray' ,marginVertical : 10}}></View>
                
                <View style={styles.itemContainer}>
                    <View style={{width : '38%'}}>
                        <Text style={styles.successItem}>Manufacturer</Text>
                    </View>
                    <View style={{width : '2%'}}>
                        <Text style={styles.successItem}>:</Text>
                    </View>
                    <View style={{width : '57%'}}>
                        <Text style={styles.successItem}>{this.state.businessName}</Text>
                    </View>
                </View>

                <View style={styles.itemContainer}>
                    <View style={{width : '38%'}}>
                        <Text style={styles.successItem}>Mobile No.</Text>
                    </View>
                    <View style={{width : '2%'}}>
                        <Text style={styles.successItem}>:</Text>
                    </View>
                    <View style={{width : '57%'}}>
                        <Text style={styles.successItem}>{this.state.userMobile}</Text>
                    </View>
                </View>
                {/* <Text style={{ color: 'white', fontSize: 17, marginVertical: 10 , marginLeft : 20}}>{`Sticker Denomination : ${this.state.productDenomination}`}</Text>
                <Text style={{ color: 'white', fontSize: 17, marginVertical: 10 , marginLeft : 20}}>{`Mobile No. : ${this.state.userMobile}`}</Text> */}
                
                <View style={{width : '100%' , height : 0.5 , backgroundColor : 'lightgray' ,marginVertical : 10}}></View>

                <Text style={{ color: 'white', fontSize: 17, marginVertical: 10 , marginLeft : 20,fontWeight : '700'}}>Captured Location : </Text>
                <View style={styles.itemContainer}>
                    <View style={{width : '28%'}}>
                        <Text style={styles.successItem}>Longitude</Text>
                    </View>
                    <View style={{width : '2%'}}>
                        <Text style={styles.successItem}>:</Text>
                    </View>
                    <View style={{width : '67%'}}>
                        <Text style={styles.successItem}>{this.state.currentLocation?.longitude}</Text>
                    </View>
                </View>
                <View style={styles.itemContainer}>
                    <View style={{width : '28%'}}>
                        <Text style={styles.successItem}>Latitude</Text>
                    </View>
                    <View style={{width : '2%'}}>
                        <Text style={styles.successItem}>:</Text>
                    </View>
                    <View style={{width : '67%'}}>
                        <Text style={styles.successItem}>{this.state.currentLocation?.latitude}</Text>
                    </View>
                </View>
                

                <View style={{width : '100%' , height : 0.5 , backgroundColor : 'lightgray' ,marginVertical : 10}}></View>
                
                <View 
                    style={{
                        flexDirection : 'row',
                        justifyContent : 'center',
                        marginVertical : 40
                    }}
                >
                    <TouchableOpacity onPress={()=>this._scanAgain()} 
                    style={{
                        backgroundColor : Colors.distributorColor,
                        paddingVertical : 10,
                        paddingHorizontal : 40,
                        borderRadius : 14,
                        // width : '50%',
                        flexDirection : 'row',
                        justifyContent : 'center'
                    }}>
                        <Text style={[styles.successItem,{textTransform : 'uppercase'}]}>{'Scan New'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }

    render() {
        const opacity = this.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0]
        })
        return (
            <View style={styles.container}>
                {this._showHeader()}
                {this.state.isSuccess ? this._renderSuccessResponse() :
                <>
                    <StatusBar
                        backgroundColor={this.state.userType == 2 ? MyColors.dealerColor : MyColors.distributorColor}
                        barStyle="light-content"
                    />
                    <Loader
                        loading={this.state.loading}
                        text={this.state.loaderText}
                    />
                        {/* <Text> </Text>
                        <Text> </Text>
                        <Text> </Text> */}

                        {/* <RNCamera
                            style={styles.preview}
                            onBarCodeRead={this.onSuccess.bind(this)}
                            captureAudio={false}
                        /> */}
                    {this.state.showCamera && this.state.flashEnabled ?
                        <QRCodeScanner
                            onRead={this.onSuccess.bind(this)}
                            cameraStyle={{ width: '100%', height: '100%' }}
                            showMarker={true}
                            flashMode={RNCamera.Constants.FlashMode.torch}
                            reactivate={true}
                            reactivateTimeout={this.state.reactivateScanner}
                        />
                        : <View></View>
                    }
                    {!this.state.flashEnabled ?
                        <QRCodeScanner
                            onRead={this.onSuccess.bind(this)}
                            cameraStyle={{ width: '100%', height: '100%' }}
                            showMarker={true}
                            reactivate={true}
                            reactivateTimeout={this.state.reactivateScanner}
                        />
                        : <View />
                    }
                    {/* <Text> </Text>
                    <Text> </Text>
                    <Text> </Text> */}
                </>}
                <Animated.View style={[{ alignSelf:'center', backgroundColor: this.state.isSuccess ? '#008000' : '#CD5C5C', position: 'absolute', marginTop: '45%', justifyContent:'center' }, { width: this.state.animatedWidth, height: this.state.animatedHeight }]}>
                    {this.state.isSuccess ?
                        <Icon type="FontAwesome" name="check-circle-o" style={{ fontSize: 45, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                        :
                        <Icon type="FontAwesome" name="times-circle-o" style={{ fontSize: 45, color: '#FFFFFF', textAlign: 'center', marginTop: 10 }} />
                    }
                    <Text style={{ color: 'white', fontSize: 23, textAlign: 'center', textAlignVertical: 'center',marginVertical : 10 }}>{this.state.scanningTitle}</Text>
                    {/* {this.state.isSuccess ?
                    <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', textAlignVertical: 'center', flex: 1, }}>
                        Denomination: {this.state.cashDetails} Rs
                        </Text>
                        :
                        <Text></Text>
                    }
                     {this.state.isSuccess ?
                    <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', textAlignVertical: 'center',  }}>
                        Product : {this.state.productName}
                        </Text>
                        :
                        <Text></Text>
                    } */}
                    

                    <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>{this.state.scanningBody}</Text>
                </Animated.View>
                {/* {this._showModal()} */}
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    successItem:{
        fontSize : 15,
        color : 'white'
    },
    itemContainer :{
        flexDirection : 'row' , 
        justifyContent : 'space-between' ,
        marginLeft : 20, 
        marginVertical: 5,
        // alignItems : 'center'
    }, 
    mapStyle: {  
        width: '90%', 
        height: 180,
        // aspectRatio : 16/9,
        alignSelf : 'center',
        marginTop : 20
    }, 
    preview: {
        flex: 1,
        width: '100%',
      },
    barcodeText: {
        fontSize: 18,
        color: 'black',
        padding: 16,
    }, 
})
const mapStateToProps = (state) => {
    console.log(state.VerifierReducer.languageEnglish);

    return {
        pymOpn: state.VerifierReducer.mechanicData.payment_option,
        languageControl: state.VerifierReducer.languageEnglish,
    }
}
export default connect(mapStateToProps, null)(ScanScreen)