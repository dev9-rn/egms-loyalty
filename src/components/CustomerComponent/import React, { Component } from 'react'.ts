import React, { Component } from 'react';
import { ActivityIndicator, BackHandler, StatusBar, StyleSheet, View, TouchableOpacity, ScrollView, Image,Linking, Dimensions, PermissionsAndroid, Platform} from 'react-native';
import Drawer from 'react-native-drawer';
import { Header, Left, Body, Right, Card, Text, Title, Button, Icon } from 'native-base';
import IconBadge from 'react-native-icon-badge';
import SideMenu from '../../config/SideMenu';
import * as utilities from '../../Utility/utilities';
import App, * as app from '../../App';
import { URL, APIKEY  } from '../../App';
import { Col, Grid, Row } from "react-native-easy-grid";
import { Dropdown } from 'react-native-material-dropdown-v2';
var _ = require('lodash');
import SplashScreen from 'react-native-splash-screen';
import { strings } from '../../locales/i18n';
import I18n from 'react-native-i18n';
import { connect } from 'react-redux';
import RNRestart from 'react-native-restart';
import LoginService from '../../services/LoginService/LoginService';
import moment from 'moment';
import DatePicker from 'react-native-datepicker';
import MyColors from '../../Utility/Colors';
import Loader from '../../Utility/Loader';
import AsyncStorage from '@react-native-community/async-storage';
import { locale } from 'moment';
import { SliderBox } from 'react-native-image-slider-box';
import  Icon1 from 'react-native-vector-icons/FontAwesome5';
import  Icon2 from 'react-native-vector-icons/Ionicons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';

import fs from 'react-native-fs';
import { version } from '../../../package.json';


import {
	Menu,
	MenuOptions,
	MenuOption,
	MenuTrigger,
} from 'react-native-popup-menu';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import CustSideMenu from '../../config/CustSideMenu';


// const images = [
//   "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTB8fHdvcmt8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
//   "https://media.istockphoto.com/photos/abstract-graphic-world-map-illustration-on-blue-background-big-data-picture-id1294021851?b=1&k=20&m=1294021851&s=170667a&w=0&h=vsypj3JPqiWOU5q21fX3lHt1Z7wphVNE8kfqdpogPSs=",
//   "https://images.unsplash.com/photo-1526657782461-9fe13402a841?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NjV8fHdvcmt8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
//   "https://images.unsplash.com/photo-1511649475669-e288648b2339?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8ODR8fHdvcmt8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
//   "https://media.istockphoto.com/photos/young-woman-hands-using-the-smart-phone-to-scan-the-qr-code-to-select-picture-id1299967143?b=1&k=20&m=1299967143&s=170667a&w=0&h=7PVEh5VVAIJugxJXBf3W8FyZHbnKjF33rkkG8IHR3ow=",
// ]
let imagePath = "";
let carpenter_mobile ="";
let carpenter_name = "";
let carpenter_city="";
let carpenter_state="";
let app_version=version;

class CustomerHomeScreen extends Component {
  constructor(props) {
    super(props);
    this.distributorId;
    this.monthList = [{ id: '1', 'value': strings('login.homeScreen_january') }, { id: '2', 'value': strings('login.homeScreen_feb') }, { id: '3', 'value': strings('login.homeScreen_march') }, { id: '4', 'value': strings('login.homeScreen_april') },
    { id: '5', 'value': strings('login.homeScreen_may') }, { id: '6', 'value': strings('login.homeScreen_june') }, { id: '7', 'value': strings('login.homeScreen_july') }, { id: '8', 'value': strings('login.homeScreen_aug') }, { id: '9', 'value': strings('login.homeScreen_sep') },
    { id: '10', 'value': strings('login.homeScreen_oct') }, { id: '11', 'value': strings('login.homeScreen_nov') }, { id: '12', 'value': strings('login.homeScreen_dec') }]
    this.yearList = [];
    this.state = {
      isDrawerOpen: false,
      modalValue: '',
      isModalVisible: false,
      BadgeCount: 0,
      loaderText: 'Loading data please wait...',
      count: 0,
      distributorId: '',
      loading: false,
      selectedMonthId: JSON.stringify(new Date().getMonth() + 1),
      selectedYear: new Date().getFullYear(),
      selectedMonthName: '',
      userType: '',
      frmDate: moment().locale('en').clone().startOf('month').format("DD-MM-YYYY"),
      toDate: moment().locale('en').format('DD-MM-YYYY'),
      frmDatePass: moment().locale('en').clone().startOf('month').format("DD-MM-YYYY"),
      toDatePass: moment().locale('en').format('DD-MM-YYYY'),
      totalAmountReceived: 0,
      totalAmountPending:0,
      totalAmountRedeemed:0,
      totalCouponsRedeemed:0,
      ACCESSTOKEN :'RD9OIGoTl7amCKgmUj2pQeyhDSeD9G',
      offer_images:[],
      show_carousel: true,
      showFullImage: false,
      show_single_image:[],
      dashboardData : {},
      carpenter_name:''
      
    };
    this.getAsyncData();
  }
  componentDidMount = () => {
    SplashScreen.hide()
    this.requestLocationPermission();
    if (this.props.navigation.state.routeName === "AppJSScreen") {
      RNRestart.Restart();
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    if (this.state.selectedMonthId) {
      let mnth = _.filter(this.monthList, { id: this.state.selectedMonthId })[0].value
      this.setState({ selectedMonthName: mnth });
    }
    this._getYearList();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.setState({ isDrawerOpen: true });
        this._drawer.close();
        this.getAsyncData();
      }
    );
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
    BackHandler.removeEventListener('hardwareBackPress', this.ƒ);
    // navigator.geolocation.clearWatch(this.watchId);
  }

  requestLocationPermission = async () => {
    if(Platform.OS == "ios"){
      console.log("IOS request ")
      request(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
        console.log(result)
      });
    }else{     
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
    }
};

  handleDatePicked = date => {
    this.reportDataa = []
    let a = moment(date, 'DD-MM-YYYY');
    let b = moment(this.state.toDate, 'DD-MM-YYYY');

    if (moment(a).isAfter(b)) {
      this.setState({ fromDateError: 'FromDate cannot be greater than toDate.', noMoreDataError: '' })
    } else {
      this.forceUpdate();
      this.setState({ fromDateError: '', toDateError: '', frmDate: date, frmDatePass: date }, () => {
        this.getAsyncData();
      })
    }
  };
  handleDatePicked1 = date => {
    console.log(date);
    console.log("=-=-=-=-=-=-=-=-=-=-=-=----=-======-=-=-=-=-=-=-=-==-=-=-=-=-=");
    // console.log();
    // console.log();

    this.reportDataa = []
    let a = moment(date, 'DD-MM-YYYY');
    let b = moment(this.state.frmDate, 'DD-MM-YYYY');
    if (a < b) {
      this.setState({ toDateError: strings('login.FromDateError'), noMoreDataError: '' })
    } else {
      this.setState({ toDate: date, toDateError: '', fromDateError: '', toDatePass: date }, () => {
        this.getAsyncData();
      })
    }
    this.getAsyncData();
  };


  // async _callForLogoutAPI() {
  //   this.setState({ loading: true });
  //   const formData = new FormData();
  //   formData.append('authUserId', this.distributorId);
  //   formData.append('deviceToken', app.FCMTOKEN);
  //   formData.append('userType', this.state.userType);

  //   var loginApiObj = new LoginService();
  //   await loginApiObj.logOutCustomer(formData);
  //   var lResponseData = loginApiObj.getRespData();
  //   this.closeActivityIndicator();
  //   console.log(lResponseData);
  //   this.setState({ loading: false });
  //   if (!lResponseData) {
  //     utilities.showToastMsg('Something went wrong. Please try again later');
  //   } else if (lResponseData.status == 200) {
  //     AsyncStorage.clear();
  //     utilities.showToastMsg(lResponseData.message);
  //     this.props.navigation.navigate('CustomerLoginScreen');

  //   } else {
  //     utilities.showToastMsg('Something went wrong. Please try again later');
  //   }

  // }
  handleBackPress = () => {
    
    BackHandler.exitApp();
    return true;
  }
  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
      app.setValue(isConnected);
    } else {
      this.setState({ isConnected });
      app.setValue(isConnected);
      utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');
    }
  };

  closeActivityIndicator() {
    setTimeout(() => {
      this.setState({ animating: false, loading: false });
    });
  }

  // _pushNotification = (formData) => {
  //   var lUrl = URL + 'getNotificationsCountCarpenter';
  //   fetch(lUrl, {
  //     method: 'POST',
  //     headers: {
  //       'Accept': 'application\/json',
  //       'Content-Type': 'multipart\/form-data',
  //       'apikey': APIKEY,
  //       'accesstoken': this.state.ACCESSTOKEN
  //     },
  //     body: formData,
  //   })

  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       console.log("getNotificationsCount", responseJson);
  //       this.setState({ count: responseJson.notificationsCount });
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       alert(error)
  //     });

  // }

  closeControlPanel = () => {
    this._drawer.close()
  };
  openControlPanel = () => {
    this._drawer.open()
  };
  toggleControlPanel = () => {
    this._drawer.toggle();
  };

  _toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  }

  async getAsyncData() {
    this.setState({ loading: true });
    await AsyncStorage.multiGet(['USERDATA','ACCESSTOKEN'], (err, result) => {
      console.log(result);
      var lData = JSON.parse(result[0][1]);
      var at = result[1][1];
      console.log("login details:",lData);
      console.log("isVerified", lData?.is_verified);
      console.log("at",at);
      if(lData == null)
      {
        this.props.navigation.navigate('CustomerLoginScreen');
        return;
      }
      if (lData) {
        console.log("lData" + lData.data);
        this.distributorId = lData.data.id;
        this.setState({ userType: lData.data.userType , ACCESSTOKEN : at,})
        carpenter_name = lData.data.full_name;
        carpenter_mobile = lData.data.mobile_no;
        carpenter_city = lData.data.cityName;
        carpenter_state = lData.data.stateName;
        // this.setState({ userType: lData.data.userType })
        this._getDashboardData();
        // this._callForImagesAPI();
      }
    });
  }

   getDashboard = (pFormData) => {
    console.log("getDashboard");
    console.log(pFormData);
    console.log("GET DASHBOARD ACCESSTOKEN ",this.state.ACCESSTOKEN);
    this.setState({ loading: true })
      var lUrl = URL + 'getDashboardOfficerUser';
     fetch(lUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application\/json',
        'Content-Type': 'multipart\/form-data',
        'apikey': APIKEY,
        'accesstoken': this.state.ACCESSTOKEN
      },
      body: pFormData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("==-=-="+lUrl+"----"+APIKEY+"----"+this.state.ACCESSTOKEN+"---"+pFormData);
        console.log(responseJson);
        console.log(responseJson.status);
        this.setState({ loading: false });
        this.closeActivityIndicator();
        var lResponseData = responseJson;
        if (!lResponseData) {
          utilities.showToastMsg('Something went wrong. Please try again later');
        } else if (lResponseData.status == 403) {
          utilities.showToastMsg(lResponseData.message);
          // this.props.navigation.navigate('CustomerLoginScreen');
          this.props.navigation.navigate('CustomerLoginScreen');
          AsyncStorage.clear();
          return;
        }
        else if (lResponseData.status == 500 || lResponseData.status == 400) {
          utilities.showToastMsg(lResponseData.message);
        } else if (lResponseData.status == 200) {
          this._setDashboardData(lResponseData);
        } else {
          utilities.showToastMsg('Something went wrong. Please try again later');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  _getDashboardData = () => {
    this.setState({ loading: true })
    const formData = new FormData();
    
    formData.append('officerUserId', this.distributorId);
    formData.append('startDate', "2024-06-03 00:00:00");
    formData.append('end_date', "2024-06-03 00:00:00");
    formData.append('userType', "6");
    formData.append('language', "en");
    
    this.getDashboard(formData)
    // this._pushNotification(formData);

  }

  _onPressNotificationIcon() {
    this.setState({ count: 0 });
    this.props.navigation.navigate('NotificationScreen');
  }

  _onPressTutorialIcon() {
    // this.setState({ count: 0 });
    this.props.navigation.navigate('TutorialScreen',{ language:'en'});
  }

  _onPressTutorialIcon_hindi() {
    // this.setState({ count: 0 });
    this.props.navigation.navigate('TutorialScreen', { language:'hin'});
  }

  _setDashboardData(lResponseData) {
    this.setState({dashboardData : lResponseData});
    // this.setState(
    //   {
    //     totalAmountRedeemed: lResponseData.totalAmountRedeemed ,
    //     totalCouponsRedeemed: lResponseData.totalCouponsRedeemed,
    //     totalAmountReceived: lResponseData.totalAmountReceived ,
    //     totalAmountPending: lResponseData.totalAmountPending,
    //     // totalCouponsRedeemedCash: lResponseData.totalCouponsRedeemedCash,
    //     // totalCouponsRedeemedFOC: lResponseData.totalCouponsRedeemedFOC
    //   });
  }
  _onPressScanButton = () => {
    this.props.navigation.navigate('CustomerScanScreen');
    // this.props.navigation.navigate('OrderDetailsScreen');
  }
  _setMonth(month, monthList) {
    if (monthList) {
      let idForMonth = _.filter(monthList, { value: month })[0].id
      this.setState({ selectedMonthId: idForMonth }, () => this._getDashboardData());
    }
  }
  _setYear(year, yearList) {
    console.log("yearslist",year+"----"+new Date().getMonth()+1);
    if (yearList) {
      let removedYear = _.filter(yearList, { value: year })[0].value
      this.setState({ selectedYear: removedYear }, () => {
        this._getDashboardData()
      });
    }
  }
  _getYearList = () => {
   
    let currentYear = new Date().getFullYear();
    console.log("current year",currentYear);
    var j = 0
    for (var i = currentYear; i > 2020; i--) {
      var dataObj = {};
      dataObj.id = j++;
      dataObj.value = currentYear--;
      this.yearList.push(dataObj)
    }
  }
  checkAndNavigate = () => {
    if (utilities.checkDateFormat(this.state.frmDatePass)) {
      this.props.navigation.navigate("HistoryScreen", { "frmDate": this.state.frmDatePass, "toDate": this.state.toDatePass })
    } else {
      this.props.navigation.navigate("HistoryScreen", { "frmDate": moment(this.state.frmDatePass, 'DD-MM-YYYY').format("DD-MM-YYYY"), "toDate": moment(this.state.toDatePass, 'DD-MM-YYYY').format("DD-MM-YYYY") })
    }
  }
  checkAndNavigate1 = () => {
    console.log("wwe");

    if (utilities.checkDateFormat(this.state.frmDatePass)) {
      console.log("1");
      this.props.navigation.navigate("CashBatchesScreen", { "frmDate": this.state.frmDatePass, "toDate": this.state.toDatePass })
    } else {
      console.log("2");
      
      this.props.navigation.navigate("CashBatchesScreen", { "frmDate": moment(this.state.frmDatePass, 'DD-MM-YYYY').format("DD-MM-YYYY"), "toDate": moment(this.state.toDatePass, 'DD-MM-YYYY').format("DD-MM-YYYY") })
    }
  }


  async _callForImagesAPI() {
    // this.setState({ loading: true });
    const formData = new FormData();
    formData.append('carpenterId', this.distributorId);
    var lUrl = URL + 'getOffers';
    fetch(lUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application\/json',
        'Content-Type': 'multipart\/form-data',
        'apikey': APIKEY,
        'accesstoken':  this.state.ACCESSTOKEN
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        if (responseJson.status == 200) {
          console.log(responseJson.offersData.length);
          if(responseJson.offersData.length > 0 )
          {
          this.setState({ offer_images: [] });
          for(var i = 0 ; i < responseJson.offersData.length; i++)
          {
              // console.log(responseJson.offersData[i].image);
              this.setState({ offer_images : [...this.state.offer_images,responseJson.offersData[i].image], show_carousel:true})
           
          }
         console.log(this.state.offer_images);
          }
          else{
            this.setState({ show_carousel: false })
          }
        }
        else if(responseJson.status == 404)
        {
          this.setState({ show_carousel: false })
        }
         else {
          utilities.showToastMsg('Something went wrong. Please try again later');
         }
        // this.setState({ count: responseJson.offersData });
      })
      .catch((error) => {
        console.log(error);
        alert(error)
      });
  }



  render() {
    // if (!this.props.languageControl) {
    //   this.monthList = [{ id: '1', 'value': strings('login.homeScreen_january') }, { id: '2', 'value': strings('login.homeScreen_feb') }, { id: '3', 'value': strings('login.homeScreen_march') }, { id: '4', 'value': strings('login.homeScreen_april') },
    //   { id: '5', 'value': strings('login.homeScreen_may') }, { id: '6', 'value': strings('login.homeScreen_june') }, { id: '7', 'value': strings('login.homeScreen_july') }, { id: '8', 'value': strings('login.homeScreen_aug') }, { id: '9', 'value': strings('login.homeScreen_sep') },
    //   { id: '10', 'value': strings('login.homeScreen_oct') }, { id: '11', 'value': strings('login.homeScreen_nov') }, { id: '12', 'value': strings('login.homeScreen_dec') }]
    // }
    // else {
    //   this.monthList = [{ id: '1', 'value': strings('login.homeScreen_january') }, { id: '2', 'value': strings('login.homeScreen_feb') }, { id: '3', 'value': strings('login.homeScreen_march') }, { id: '4', 'value': strings('login.homeScreen_april') },
    //   { id: '5', 'value': strings('login.homeScreen_may') }, { id: '6', 'value': strings('login.homeScreen_june') }, { id: '7', 'value': strings('login.homeScreen_july') }, { id: '8', 'value': strings('login.homeScreen_aug') }, { id: '9', 'value': strings('login.homeScreen_sep') },
    //   { id: '10', 'value': strings('login.homeScreen_oct') }, { id: '11', 'value': strings('login.homeScreen_nov') }, { id: '12', 'value': strings('login.homeScreen_dec') }]
    // }
    // console.log("Selected year.............."+this.state.selectedYear);

    return (
      <View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? 'black' : 'white' }}>
        <Header style={{ backgroundColor:  MyColors.distributorColor , borderBottomColor: 'gray', borderBottomWidth: 1 }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => { this.toggleControlPanel() }}>
              <Icon type="FontAwesome" name="bars" style={{ fontSize: 30, color: '#FFFFFF', paddingRight: 10, }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.8, alignItems: 'center' }}>
            <Title style={{ color: 'white', fontSize: 16 }}>{strings('login.dashboard_title')}</Title>
          </Body>
          <Right style={{ flex: 0.1 }}>
            
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {/* <TouchableOpacity onPress={() => { this._onPressNotificationIcon() }}>
                  <IconBadge
                    MainElement={
                      <Icon type="FontAwesome" name="bell" style={{ fontSize: 25, height: 35, width: 35, color: '#FFFFFF', margin: 7, marginBottom: 0 }} />
                    }
                    BadgeElement={
                      <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{this.state.count}</Text>
                    }
                    IconBadgeStyle={
                      {
                        width: 20,
                        height: 20,
                        backgroundColor: MyColors.dealerColor,
                        marginRight: 5
                      }
                    }
                  />
                </TouchableOpacity> */}

                {/* <Menu>
							<MenuTrigger>
              <Icon1 type="Fontawesome5" name="question-circle" style={{ fontSize:22, width:35, height:35 ,color: '#FFFFFF',marginVertical: 10, marginLeft:5,marginRight: 15, marginBottom: 0 ,justifyContent:'center'  }} />
							</MenuTrigger>
							<MenuOptions>
								<MenuOption onSelect={() => this._onPressTutorialIcon()} style={{ padding: 15 }}>
									<Text style={{ color: 'black' }}>{strings('login.view_tut_eng')}</Text>
								</MenuOption>
								<MenuOption onSelect={() => this._onPressTutorialIcon_hindi()} style={{ padding: 15 }} >
									<Text style={{ color: 'black' }}>{strings('login.view_tut_hin')}</Text>
								</MenuOption>
                <MenuOption onSelect={() => 
                  Linking.openURL('whatsapp://send?text=Hi\n\nI need help in using the MagicGrip app\n\n'+carpenter_name+'\n'+carpenter_city+','+carpenter_state+'\n'+carpenter_mobile+'\nApp Version:'+app_version+'&phone=+918850935832')} style={{ padding: 15 }} >
                  <View style={{ flexDirection:'row'}}>
                  <Image
                    style={{ width: 20, height: 20, paddingRight: 15, marginHorizontal:10 }}
                    source={require('../../images/whatsapp.png')}
                  />
									<Text style={{ color: 'black' }}>{strings('login.whatsapp')}</Text>
                  </View>
                 
								</MenuOption>
							</MenuOptions>
						</Menu> */}

                {/* <TouchableOpacity onPress={() => { this._onPressTutorialIcon() }}>
                <Icon1 type="Fontawesome5" name="question-circle" style={{ fontSize:22, width:35, height:35 ,color: '#FFFFFF',marginVertical: 10, marginLeft:5,marginRight: 15, marginBottom: 0 ,justifyContent:'center'  }} />
                </TouchableOpacity> */}
              </View>
            
          </Right>
        </Header>
        <StatusBar
          backgroundColor={this.state.userType == 0 ? MyColors.distributorColor : MyColors.dealerColor }
          barStyle="light-content"
        />
         <Loader
                    loading={this.state.loading}
                    text={this.state.loaderText}
                />
        <Drawer
          ref={(ref) => this._drawer = ref}
          content={<CustSideMenu prop={this.props} drawerObj={this._drawer} />}
          tapToClose={true}
          openDrawerOffset={0.3}
          panCloseMask={0.2}
          closedDrawerOffset={-3}
          styles={drawerStyles}
        >
            { !this.state.showFullImage ?       
          <View style={{ flex: 1, padding: 5, marginTop: -1, backgroundColor:"#cccccc15" }}>
       
              <ScrollView maximumZoomScale={1} keyboardShouldPersistTaps={'handled'}>

                  <View style={{ flex: 1, flexDirection: 'column' ,marginTop : 10}}>
                    <Card style={{ flex: 0.5, marginRight: 5, padding: 5 ,borderRadius:10}}>
                      <View style={{ flexDirection:'row',marginBottom:5,}}>
                      <Text style={{ textAlign:'left', fontWeight:'bold',fontSize:18,marginLeft:2 }}>Order Information</Text>
                      <Text style={{  textAlign: 'right',fontSize:18, flex:1, marginRight:8,color:'darkgray'}}>Total</Text>
                      </View>
                      <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                        <Text style={{ padding:8, textAlign: 'left',fontSize:14 ,flex:3,marginLeft:2, }}>Total Orders</Text>
                        <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.dashboardData?.totalOrderCount}</Text>
                      </View>
                      <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                        <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2  }}>Total Orders Approved</Text>
                        <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.dashboardData?.totalApprovedOrderCount}</Text>
                      </View>
                      <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                        <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2  }}>Total Orders Pending</Text>
                        <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.dashboardData?.totalPendingOrderCount}</Text>
                      </View>
                    </Card>

                    <Card style={{ flex: 0.5, marginRight: 5, padding: 5 ,borderRadius:10}}>
                      <View style={{ flexDirection:'row',marginBottom:5,}}>
                      <Text style={{ textAlign:'left', fontWeight:'bold',fontSize:18,marginLeft:2 }}>Sticker Information</Text>
                      <Text style={{  textAlign: 'right',fontSize:18, flex:1, marginRight:8,color:'darkgray'}}>Total</Text>
                      </View>
                      <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                        <Text style={{ padding:8, textAlign: 'left',fontSize:14 ,flex:3,marginLeft:2, }}>Total Stickers</Text>
                        <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.dashboardData?.totalCouponCount}</Text>
                      </View>
                      <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                        <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2  }}>Total Stickers Floated</Text>
                        <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.dashboardData?.totalCouponsActiveCount}</Text>
                      </View>
                      <View style={{ backgroundColor:'#EBF5FB',margin:2,borderRadius:5,flexDirection:'row'}}>
                        <Text style={{ padding:8, textAlign: 'left',fontSize:14,flex:3,marginLeft:2  }}>Total Stickers Verified</Text>
                        <Text style={{ padding:8, textAlign: 'right',fontSize:14,marginLeft:2, flex:1, marginRight:2}}>{this.state.dashboardData?.totalScannedCouponsCount}</Text>
                      </View>
                    </Card>
                    
                  </View>

                  <Text />
                  <View style={{ marginTop: 10, width: 150, justifyContent: 'center', flex: 1, alignSelf: 'center' }}>
                    {/* <Button onPress={this._onPressScanButton} title="SCAN" /> */}
                    <Button style={{ justifyContent:'center', alignContent:'center',
                    backgroundColor: this.state.userType == 2 ? MyColors.dealerColor : MyColors.distributorColor , borderRadius: 20 }} 
                    onPress={this._onPressScanButton}>
                      <Text style={{ textAlign: 'center', flex: 1, fontWeight: 'bold', fontSize: 18 }}>{strings('login.scan_button')}</Text>
                      {/* <Icon2 type="Ionicons" name="qr-code" style={{ textAlign:'center', fontSize:24,paddingRight:10 ,color: MyColors.white }} /> */}
                      </Button>
                  </View>
                  
                
        
              </ScrollView> 
              </View>
              :
              <View style={{ flex: 1 , backgroundColor:"#000",}}>
                  <View style={{ flexDirection:"row", justifyContent:'space-evenly'}}>
              
                     <TouchableOpacity style= {{marginTop:10 , marginBottom:10}} onPress={ () => 
                      // Share.open(
                      //  {
                      //    title: "Sharing Image",//string
                      //   // message: "message",//string
                      //   // message: this.state.offer_images[this.state.show_single_image],
                      //   // url:'file://'+this.state.offer_images[this.state.show_single_image],
                      //   url:  fs.readFile(this.state.offer_images[this.state.show_single_image],'base64'),
                      //   // eg.'http://img.gemejo.com/product/8c/099/cf53b3a6008136ef0882197d5f5.jpg',
                      //  })

                      RNFetchBlob.config({
                        fileCache: true
                      })
                        .fetch("GET", this.state.offer_images[this.state.show_single_image])
                        // the image is now dowloaded to device's storage
                        .then(resp => {
                          // the image path you can use it directly with Image component
                          imagePath = resp.path();
                          return resp.readFile("base64");
                        })
                        .then(base64Data => {
                          // here's base64 encoded image
                          console.log(base64Data);
                          // remove the file from storage
                           fs.unlink(imagePath);
                          // var headers = obj.resp.respInfo.headers;
                          // var type = headers['Content-Type'];
                          var dataUrl = 'data:' + 'image/png' + ';base64,' + base64Data;
                          return { title:' Share Image',url: dataUrl };
                        })
                        .then(opts => {
                                       
                         return Share.open(opts);
                                          })
                                          .catch(err => {
                                              console.log(err);
                                          })
                       
                       
                       } >
                     <Text style={{ color: "#ffffff", fontSize:20 }}> <Icon1 type="FontAwesome" name="share-alt" style={{ fontSize: 20, color: '#FFFFFF', paddingRight: 10 }} /> Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style= {{ marginLeft:10,marginTop:10 , marginBottom:10}} onPress={ () => this.setState({ showFullImage: false })} >
                    <Text style={{ color: "#ff0000", fontSize:20 }}><Icon1 type="FontAwesome" name="window-close" style={{ fontSize: 25, color: '#FF0000', paddingRight: 10 }} /> Close</Text>
                  </TouchableOpacity>

                  </View>
                 
                  <ReactNativeZoomableView
                    maxZoom={1.5}
                    minZoom={1}
                    zoomStep={0.5}
                    initialZoom={1}
                    bindToBorders={true}
                    onZoomAfter={this.logOutZoomState}
                    style={{
                      padding: 10,
                      backgroundColor: 'black',
                    }}
                  >
                     <Image source={{ uri: this.state.offer_images[this.state.show_single_image]}} 
                  style={{  marginTop:10, width:Dimensions.get('window').width , height: Dimensions.get('window').height - 150 }} 
                  resizeMode="center" />
                  
                  </ReactNativeZoomableView>
                  {/* <TouchableOpacity style= {{ marginTop:10 , marginBottom:10}} onPress={ () => this.setState({ showFullImage: false })} >
                    <Text style={{ color: "#ff0000", fontSize:22 }}> X Close</Text>
                  </TouchableOpacity> */}

                  {/* <Modal visible={true} transparent={false} >
                  <ImageViewer  enableSwipeDown={true} onSwipeDown={ () => this.setState({ showFullImage: false }) } 
                  imageUrls={[{url: this.state.offer_images[this.state.show_single_image],
                   width:300 , height: 300 ,
                  props:{}}]}/>
                   <TouchableOpacity style= {{ marginTop:10 }} onPress={ () => this.setState({ showFullImage: false })} >
                    <Text style={{ color: "#ff0000", fontSize:22 }}> X Close</Text>
                  </TouchableOpacity>
                  </Modal> */}
                 
          </View>
              
              }
             
             
        </Drawer>
      </View>
    );
  }
}

const drawerStyles = {
  drawer: {
  },
  main: { paddingLeft: 3 },
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  btnReadMore: {
    marginTop: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF1E58',
    borderRadius: 2,

    flexDirection: 'row'
  },
  btnTextReadMore: {
    padding: 7,
    color: '#FF1E58',
  },
  carousalcontainer:{
    flex:1,
    borderColor:'#ccc',
    borderWidth:2,
    borderRadius:15,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#F5FCFF",
    height:250,
    marginTop:10,
    overflow:'hidden'
}
});
const mapStateToProps = (state) => {
  if (state.VerifierReducer.languageEnglish == "English - (English)") {
    I18n.locale = 'en'
  } else if (state.VerifierReducer.languageEnglish == "French - (Française)") {
    I18n.locale = 'fr'
  } else if (state.VerifierReducer.languageEnglish == "Hindi - (हिन्दी)") {
    I18n.locale = 'hi'
  } else if (state.VerifierReducer.languageEnglish == "Punjabi - (ਪੰਜਾਬੀ)") {
    I18n.locale = 'pa'
  } else if (state.VerifierReducer.languageEnglish == "Marathi - (मराठी)") {
    I18n.locale = 'ma'
  } else if (state.VerifierReducer.languageEnglish == "Gujarati - (ગુજરાતી)") {
    I18n.locale = 'gu'
  } else if (state.VerifierReducer.languageEnglish == "Telugu - (తెలుగు)") {
    I18n.locale = 'tl'
  } else if (state.VerifierReducer.languageEnglish == "Tamil - (தமிழ்)") {
    I18n.locale = 'ta'
  } else if (state.VerifierReducer.languageEnglish == "Bengali - (বাংলা)") {
    I18n.locale = 'ben'
  } else if (state.VerifierReducer.languageEnglish == "Urdu - (اردو)") {
    I18n.locale = 'ur'
  } else if (state.VerifierReducer.languageEnglish == "Kannada - (ಕನ್ನಡ)") {
    I18n.locale = 'kan'
  } else if (state.VerifierReducer.languageEnglish == "Odia - (ଓଡିଆ)") {
    I18n.locale = 'od'
  } else if (state.VerifierReducer.languageEnglish == "Swahili - (Kiswahili)") {
    I18n.locale = 'swa'
  } else {
    I18n.locale = 'en'
  }
  return {
    languageControl: state.VerifierReducer.languageEnglish,
    enableDarkTheme: state.VerifierReducer.enableDarkTheme,
    fingerPrintEnable: state.VerifierReducer.enableFingerPrint
  }
}
export default connect(mapStateToProps, null)(CustomerHomeScreen)