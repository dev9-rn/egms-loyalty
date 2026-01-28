import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavigationActions, DrawerActions } from 'react-navigation';
import { Alert, ScrollView, View, StyleSheet, Image, TouchableOpacity, TouchableWithoutFeedback, StatusBar,Button } from 'react-native';
// import WebView from 'react-native-webview';
import { Text, Icon, Card, Accordion } from "native-base";
import LoginService from '../services/LoginService/LoginService';
// import * as app from '../../App';
import * as utilities from '../Utility/utilities';
import Loader from '../Utility/Loader';
import SwitchToggle from "react-native-switch-toggle";
import { Grid, Row, Col } from 'react-native-easy-grid';
import { strings } from '../locales/i18n';
import I18n from 'react-native-i18n';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLanguage, setCounterValue, setCounter1Value, enableDarkTheme, fingerPrintEnableAuth, setMechanicData } from '../Redux/Actions/VerifierActions';
import { clearInsti } from '../Redux/Actions/InstituteActions'
import moment from 'moment';
import { Dropdown } from 'react-native-material-dropdown-v2';
import AsyncStorage from '@react-native-community/async-storage';
import { Linking } from 'react-native';

import MyColors from '../Utility/Colors';
import { version } from '../../package.json';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import { FCMTOKEN } from '../App';


var languageDropDown = [{
  value: 'English - (English)',
}, {
  value: 'Hindi - (हिन्दी)',
}, {
  value: 'Marathi - (मराठी)',
}, {
  value: 'Punjabi - (ਪੰਜਾਬੀ)',
}, {
  value: 'Gujarati - (ગુજરાતી)',
}, {
  value: 'Telugu - (తెలుగు)',
}, {
  value: 'Tamil - (தமிழ்)',
}, {
  value: 'Bengali - (বাংলা)',
}, {
  value: 'Urdu - (اردو)',
}, {
  value: 'Kannada - (ಕನ್ನಡ)',
}, {
  value: 'Odia - (ଓଡିଆ)',
}
  //  {
  //   value: 'French - (Française)',
  // }, {
  //   value: 'Swahili - (Kiswahili)'
  // }
];
class CustSideMenu extends Component {
  constructor(props) {
   // console.log("CustSideMenu props",props);
    super(props);
    this.officerUserId;
    this.state = {
      isDrawerOpen: true,
      imageURL: '',
      userType: '',
      loading: false,
      isLoaded:false,
      loaderText: 'Logging out...',
      menuList: [],
      changeThemeEnable: '',
      accesstoken:'',
      showWebView: false,
      socialLinkUrl: ''
    };

    this._renderContent = this._renderContent.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
  }
  componentDidUpdate = () => {
    require('moment/locale/hi.js');
    // require('moment/locale/fr.js');
    require('moment/locale/mr.js');
    // require('moment/locale/pa-in.js');
    require('moment/locale/gu.js');
    require('moment/locale/te.js');
    require('moment/locale/ta.js');
    require('moment/locale/bn.js');
    require('moment/locale/ur.js');
    require('moment/locale/kn.js');
    require('moment/locale/sw.js');

    if (I18n.currentLocale() == 'hi') {
      moment.locale('hi');
    } 
    // else if (I18n.currentLocale() == 'fr') {
    //   moment.locale('fr');
    // } 
    else if (I18n.currentLocale() == 'en') {
      moment.locale('en');
    } else if (I18n.currentLocale() == 'pa') {
      moment.locale('en');
    } else if (I18n.currentLocale() == 'ma') {
      moment.locale('mr');
    } else if (I18n.currentLocale() == 'gu') {
      moment.locale('gu');
    } else if (I18n.currentLocale() == 'tl') {
      moment.locale('te');
    } else if (I18n.currentLocale() == 'ta') {
      moment.locale('ta');
    } else if (I18n.currentLocale() == 'ben') {
      moment.locale('bn');
    } else if (I18n.currentLocale() == 'ur') {
      moment.locale('ur');
    } else if (I18n.currentLocale() == 'kan') {
      moment.locale('kn');
    } else if (I18n.currentLocale() == 'od') {
      moment.locale('en');
    } else if (I18n.currentLocale() == 'swa') {
      moment.locale('sw');
    }
    else {
      moment.locale('en');
    }
  }
  navigateToScreen = (route) => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route,
      params: {},
      action: DrawerActions.toggleDrawer()
    });
    this.props.prop.navigation.dispatch(navigateAction);
  }
  componentWillUnmount() {
    this.willFocusSubscription.remove();
    // navigator.geolocation.clearWatch(this.watchId);
  }
  componentDidMount() {
    this.getAsyncData();
    this.willFocusSubscription = this.props.prop.navigation.addListener(
      'willFocus',
      payload => {
        this.getAsyncData()
      }
    );
  }
  async closeActivityIndicator() {
    await setTimeout(() => {
      this.setState({ loading: false });
    });
  }
  async getAsyncData() {
    await AsyncStorage.multiGet(['USERDATA', 'FCMTOKEN','ACCESSTOKEN'], (err, result) => {
      var lData = JSON.parse(result[0][1]);
      var lDataFcmToken = JSON.parse(result[1][1]);
      var at = result[2][1];
      this.setState({ accesstoken : at});
      if (lData) {
        console.log("CustSideMenu data",lData);

         this.setState({
          name: lData.data.full_name ? lData.data.full_name : lData.data.shop_name, imageURL: lData.data.brand_logo, userType: lData.data.userType,
           menuList: [
            { title: strings('login.profile'), 
            nav1: 'CustomerProfileScreen' },
            // { title: strings('login.CustSideMenu_paymentoptions'), nav1: 'PaymentDetailsScreen' },
            { title: strings('login.sdemenu_scan'), nav1: 'CustomerScanScreen' },
            // { title: strings('login.sidemenu_couponhistory'), nav1: 'CustomerOrderHistoryScreen' } ,
            { title: strings('login.sidemenu_couponhistory'), nav1: 'CustomerOrderHistoryScreen' },

            //  { title: strings('login.cashbash'), nav1: 'CashBatchesScreen' } ,
          //  { title: strings('login.CustSideMenu_report'), nav1: 'ReportScreen' } ,
            // { title: strings('login.CustSideMenu_reporthistory'), nav1: 'ReportHistory' } ,
           
            // lData.data.userType == 0 ? {} : lData.data.userType == 2 ? {} : { title: strings('login.passBook'), nav1: 'PassbookScreen' },
            // lData.data.userType == 0 ? {} : lData.data.userType == 2 ? {} : { title: strings('login.Products'), nav1: 'GiftProductsScreen' },
            // lData.data.userType == 0 ? {} : lData.data.userType == 2 ? {} : { title: strings('login.productsHistory'), nav1: 'ProductsHistoryScreen' },
            // lData.data.userType == 0 ? { title: strings('login.dealers'), nav1: 'DistributorScreen' } : {},
            { title: strings('login.logout') },
            { title: "LANGUAGE" },
          ],
        
        });
        this.setState({ isLoaded: true });
        this.officerUserId = lData.data.id;
        console.log("CustSideMenu usertype", this.state.userType);
      }
    });
  }

  async _callForLogoutAPI() {
    console.log("=======logout")
    this.setState({ loading: true });
    const formData = new FormData();
    formData.append('officerUserId', this.officerUserId);
    formData.append('deviceToken', FCMTOKEN);
    formData.append('userType', 6);
    if (this.props.languageControl) {
      formData.append('language', 'en');
    } else {
      formData.append('language', 'hi');
    }

    var loginApiObj = new LoginService();
    await loginApiObj.logOutCustomer(formData,this.state.accesstoken);
    var lResponseData = loginApiObj.getRespData();
    this.closeActivityIndicator();
    console.log(lResponseData);

    if (!lResponseData) {
      utilities.showToastMsg('Something went wrong. Please try again later');
    } else if (lResponseData.status == 200) {
      AsyncStorage.clear();
      // AsyncStorage.multiRemove(['USERDATA','LOGINEDUSERFLAG','ACCESSTOKEN'],(err, result) => {
      //   console.log(result)});
      AsyncStorage.getItem('USERDATA',(err, result) => {  console.log("USERDATA",result)});
      AsyncStorage.getItem('LOGINEDUSERFLAG',(err, result) => {  console.log("LOGINEDUSERFLAG",result)});
      AsyncStorage.getItem('ACCESSTOKEN',(err, result) => {  console.log("ACCESSTOKEN",result)});
      this.props.clearInsti();
      this.props.setMechanicData([]);
      this.props.fingerPrintEnableAuth(false)
      this.props.setCounterValue(0)
      this.props.setCounter1Value(0)
      // this.props.setLanguage('English - (English)');
      utilities.showToastMsg(lResponseData.message);
      this.props.prop.navigation.navigate('MainScreen');
      // this.props.prop.navigation.navigate('LandingScreen');
    } else {
      utilities.showToastMsg('Something went wrong. Please try again later');
    }

  }

  _logOut() {
    Alert.alert(
      strings('login.logoutMsg_title'),
      strings('login.logoutMsg'),
      [
        { text: strings('login.alertNo'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: strings('login.alertYes'), onPress: () => {
            this._callForLogoutAPI();
          }
        },
      ],
      { cancelable: false }
    );
  }

  _renderHeader(item, expanded) {
    if (item.title == 'LOGOUT' || item.title == 'लॉग आउट' || item.title == 'প্রস্থান' || item.title == 'લૉગ આઉટ' || item.title == 'ಲಾಗ್ ಔಟ್' || item.title == 'बाहेर पडणे' || item.title == 'ପ୍ରସ୍ଥାନ କର' || item.title == 'ਲਾੱਗ ਆਊਟ' || item.title == 'வெளியேறு' || item.title == 'లాగ్అవుట్' || item.title == 'لاگ آوٹ' || item.title == 'Déconnecter' || item.title == 'Njia kutoka') {
      return (
        <TouchableOpacity onPress={() => { this._logOut() }}>
          {/* <View style={{
            // flexDirection: "row",
            // padding: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: '#FF1E58',
          }}
          ></View> */}
          <View style={{
            flexDirection: "row",
            padding: 10,
            borderBottomWidth: 0.5,
            borderTopWidth: 1,
            borderBottomColor: MyColors.distributorColor,
            borderTopColor: MyColors.distributorColor,
            backgroundColor: this.props.enableDarkTheme ? 'black' : 'white',
            // marginTop: this.state.userType == 2 ? 30 : 20
          }}
          >
            <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify', color: this.props.enableDarkTheme ? 'white' : 'black' }}>
              <Icon type="FontAwesome" name="power-off" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
              {"   "}{item.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } if (
      item.title == 'SCAN' || item.title == 'স্ক্যান' || item.title == "Analyse" || item.title == "સ્કેન" || item.title == "स्कैन" || item.title == "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ" || item.title == "स्कॅन" || item.title == "ସ୍କାନ୍ କରନ୍ତୁ |" || item.title == "ਸਕੈਨ" || item.title == "ஊடுகதிர்" || item.title == "స్కాన్" || item.title == "اسکین" || item.title == 'Kanuni' ||
      item.title == 'PROFILE' || item.title == 'प्रोफ़ाइल' || item.title == 'Profil' || item.title == 'प्रोफाइल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'પ્રોફાઇલ' || item.title == 'ప్రొఫైల్' || item.title == 'சுயவிவரம்' || item.title == 'নথিপত্র' || item.title == 'پروفائل' || item.title == 'ಪ್ರೊಫೈಲ್' || item.title == 'ପ୍ରୋଫାଇଲ୍ |' || item.title == 'MWANDISHI' ||
      item.title == 'STICKER HISTORY' || item.title == 'कूपन इतिहास' || item.title == 'Historique des stickers' || item.title == 'कूपन इतिहास' || item.title == 'ਕੂਪਨ ਇਤਿਹਾਸ' || item.title == 'કૂપન ઇતિહાસ' || item.title == 'కూపన్ చరిత్ర' || item.title == 'கூப்பன் வரலாறு' || item.title == 'কুপন ইতিহাস' || item.title == 'کوپن کی تاریخ' || item.title == 'ಕೂಪನ್ ಇತಿಹಾಸ' || item.title == 'କୁପନ୍ ଇତିହାସ |' || item.title == 'Historia ya sticker' ||
      item.title == 'CASH-BATCH REPORT' || item.title == "कैश-बैच रिपोर्ट" || item.title == "নগদ-ব্যাচের প্রতিবেদন" || item.title == "Rapport Cash-Batch" || item.title == "કેશ-બેચ રિપોર્ટ" || item.title == "ನಗದು-ಬ್ಯಾಚ್ ವರದಿ" || item.title == "रोख-बॅच अहवाल" || item.title == "ନଗଦ-ବ୍ୟାଚ୍ ରିପୋର୍ଟ" || item.title == "ਨਕਦ-ਬੈਚ ਦੀ ਰਿਪੋਰਟ" || item.title == "Cash-Batch-rapport" || item.title == "பண-தொகுதி அறிக்கை" || item.title == "నగదు-బ్యాచ్ నివేదిక" || item.title == "کیش بیچ کی رپورٹ" ||
      item.title == 'PAYMENT OPTIONS' || item.title == 'भुगतान विकल्प' || item.title == 'Options de paiement' || item.title == 'पैसे भरणासाठीचे पर्याय' || item.title == 'ਭੁਗਤਾਨ ਵਿਕਲਪ' || item.title == 'ચુકવણી વિકલ્પો' || item.title == 'చెల్లింపు పద్ధతులు' || item.title == 'கட்டண விருப்பங்கள்' || item.title == 'অর্থ প্রদানের বিকল্পগুলি' || item.title == 'آدائیگی کے طریقے' || item.title == 'ಪಾವತಿಯ ವಿಧ' || item.title == 'ଦେୟ ବିକଳ୍ପ' || item.title == 'Malengo ya utoaji' ||
      item.title == 'REPORT' || item.title == 'रिपोर्ट' || item.title == 'Rapport' || item.title == 'अहवाल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'અહેવાલ' || item.title == 'నివేదిక' || item.title == 'அறிக்கை' || item.title == 'প্রতিবেদন' || item.title == 'رپورٹ کریں' || item.title == 'ವರದಿ' || item.title == 'ରିପୋର୍ଟ' || item.title == 'Ripoti' ||
      item.title == 'PASSBOOK' || item.title == 'पासवृक' || item.title == 'PASSBOOK' || item.title == 'পাসবুক' || item.title == 'પાસબુક' || item.title == 'ಪಾಸ್‌ಬುಕ್' || item.title == 'पासबुक' || item.title == 'ପାସ୍ବୁକ୍ |' || item.title == 'ਪਾਸਬੁਕ' || item.title == 'பாஸ்புக்' || item.title == 'లావాదేవీల' || item.title == 'پاس بک' || item.title == 'PISANI' ||
      item.title == 'PRODUCTS' || item.title == 'उत्पादों' || item.title == 'DES PRODUITS' || item.title == 'পণ্য' || item.title == 'પ્રૉડક્ટ્સ' || item.title == 'ಪ್ರಾಡಕ್ಟ್ಸ್' || item.title == 'प्रॉडक्ट्स' || item.title == 'ଉତ୍ପାଦଗୁଡିକ' || item.title == 'ਪ੍ਰਾਡਕ੍ਟ੍ਸ' || item.title == 'தயாரிப்புகள்' || item.title == 'ఉత్పత్తులు' || item.title == 'مصنوعات' || item.title == 'Bidhaa' ||
      item.title == 'REPORT HISTORY' || item.title == 'रिपोर्ट इतिहास' || item.title == 'Historique du rapport' || item.title == 'ইতিহাসের প্রতিবেদন করুন' || item.title == 'ઇતિહાસની જાણ કરો' || item.title == 'ಇತಿಹಾಸವನ್ನು ವರದಿ ಮಾಡಿ' || item.title == 'इतिहास नोंदवा' || item.title == 'ରିପୋର୍ଟ ଇତିହାସ' || item.title == 'ਇਤਿਹਾਸ ਦੀ ਰਿਪੋਰਟ ਕਰੋ' || item.title == 'வரலாற்றைப் புகாரளிக்கவும்' || item.title == 'చరిత్రను నివేదించండి' || item.title == 'تاریخ(ہسٹری ) کی اطلاع دیں' || item.title == 'Ripoti ya historia' ||
      item.title == 'PRODUCTS HISTORY' || item.title == 'उत्पाद इतिहास' || item.title == 'HISTOIRE DES PRODUITS' || item.title == 'পণ্য ইতিহাস' || item.title == 'પ્રૉડક્ટ્સ હિસ્ટરી' || item.title == 'ಪ್ರಾಡಕ್ಟ್ಸ್ ಹಿಸ್ಟರೀ' || item.title == 'प्रॉडक्ट्स हिस्टरी' || item.title == 'ଉତ୍ପାଦ ଇତିହାସ |' || item.title == 'ਪ੍ਰਾਡਕ੍ਟ੍ਸ ਹਿਸ੍ਟਰੀ' || item.title == 'தயாரிப்புகள் வரலாறு' || item.title == 'ఉత్పత్తుల చరిత్ర' || item.title == 'مصنوعات کی تاریخ' || item.title == 'Historia ya Bidhaa'
      // item.title == 'DEALERS' || item.title == 'डीलरों' || item.title == 'ব্যবসায়ীরা' || item.title == 'Concessionnaires' || item.title == 'વેપારીઓ' || item.title == 'ವಿತರಕರು' || item.title == 'विक्रेते' || item.title == 'ଡିଲରମାନେ' || item.title == 'ਡੀਲਰ' || item.title == 'Återförsäljare' || item.title == 'விநியோகஸ்தர்கள்' || item.title == 'డీలర్లు' || item.title == 'ڈیلر'
    ) {
      return (
        <TouchableOpacity onPress={this.navigateToScreen(item.nav1)}>
          <View style={{
            flexDirection: "row",
            // padding: 10,
            // borderBottomWidth: 0.5,
            // borderBottomColor: '#FF1E58',

            padding: 10,
            // borderBottomWidth: 0.5,
            borderTopWidth: 1,
            // borderBottomColor: '#FF1E58',
            borderTopColor:MyColors.distributorColor,
          }}
          >
            <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify', color: this.props.enableDarkTheme ? 'white' : 'black' }}>
              {item.title == 'SCAN' || item.title == 'স্ক্যান' || item.title == "Analyse" || item.title == "સ્કેન" || item.title == "स्कैन" || item.title == "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ" || item.title == "स्कॅन" || item.title == "ସ୍କାନ୍ କରନ୍ତୁ |" || item.title == "ਸਕੈਨ" || item.title == "ஊடுகதிர்" || item.title == "స్కాన్" || item.title == "اسکین" || item.title == 'Kanuni' ?
                <Icon type="FontAwesome" name="qrcode" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                :
                item.title == 'PROFILE' || item.title == 'प्रोफ़ाइल' || item.title == 'Profil' || item.title == 'प्रोफाइल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'પ્રોફાઇલ' || item.title == 'ప్రొఫైల్' || item.title == 'சுயவிவரம்' || item.title == 'নথিপত্র' || item.title == 'پروفائل' || item.title == 'ಪ್ರೊಫೈಲ್' || item.title == 'ପ୍ରୋଫାଇଲ୍ |' || item.title == 'MWANDISHI' ?
                  <Icon type="FontAwesome" name="user" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                  :
                  item.title == 'STICKER HISTORY' || item.title == 'कूपन इतिहास' || item.title == 'Historique des stickers' || item.title == 'कूपन इतिहास' || item.title == 'ਕੂਪਨ ਇਤਿਹਾਸ' || item.title == 'કૂપન ઇતિહાસ' || item.title == 'కూపన్ చరిత్ర' || item.title == 'கூப்பன் வரலாறு' || item.title == 'কুপন ইতিহাস' || item.title == 'کوپن کی تاریخ' || item.title == 'ಕೂಪನ್ ಇತಿಹಾಸ' || item.title == 'କୁପନ୍ ଇତିହାସ |' || item.title == 'Historia ya sticker' ?
                    <Icon type="FontAwesome" name="book" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                    :
                    item.title == 'CASH-BATCH REPORT' || item.title == "कैश-बैच रिपोर्ट" || item.title == "নগদ-ব্যাচের প্রতিবেদন" || item.title == "Rapport Cash-Batch" || item.title == "કેશ-બેચ રિપોર્ટ" || item.title == "ನಗದು-ಬ್ಯಾಚ್ ವರದಿ" || item.title == "रोख-बॅच अहवाल" || item.title == "ନଗଦ-ବ୍ୟାଚ୍ ରିପୋର୍ଟ" || item.title == "ਨਕਦ-ਬੈਚ ਦੀ ਰਿਪੋਰਟ" || item.title == "Cash-Batch-rapport" || item.title == "பண-தொகுதி அறிக்கை" || item.title == "నగదు-బ్యాచ్ నివేదిక" || item.title == "کیش بیچ کی رپورٹ" ?
                      <Icon type="FontAwesome" name="money" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                      :
                      item.title == 'PAYMENT OPTIONS' || item.title == 'भुगतान विकल्प' || item.title == 'Options de paiement' || item.title == 'पैसे भरणासाठीचे पर्याय' || item.title == 'ਭੁਗਤਾਨ ਵਿਕਲਪ' || item.title == 'ચુકવણી વિકલ્પો' || item.title == 'చెల్లింపు పద్ధతులు' || item.title == 'கட்டண விருப்பங்கள்' || item.title == 'অর্থ প্রদানের বিকল্পগুলি' || item.title == 'آدائیگی کے طریقے' || item.title == 'ಪಾವತಿಯ ವಿಧ' || item.title == 'ଦେୟ ବିକଳ୍ପ' || item.title == 'Malengo ya utoaji' ?
                        <Icon type="FontAwesome" name="credit-card" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                        :
                        item.title == 'REPORT' || item.title == 'रिपोर्ट' || item.title == 'Rapport' || item.title == 'अहवाल' || item.title == 'ਪ੍ਰੋਫਾਈਲ' || item.title == 'અહેવાલ' || item.title == 'నివేదిక' || item.title == 'அறிக்கை' || item.title == 'প্রতিবেদন' || item.title == 'رپورٹ کریں' || item.title == 'ವರದಿ' || item.title == 'ରିପୋର୍ଟ' || item.title == 'Ripoti' ?
                          <Icon type="FontAwesome" name="flag" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                          :
                          item.title == 'PASSBOOK' || item.title == 'पासवृक' || item.title == 'PASSBOOK' || item.title == 'পাসবুক' || item.title == 'પાસબુક' || item.title == 'ಪಾಸ್‌ಬುಕ್' || item.title == 'पासबुक' || item.title == 'ପାସ୍ବୁକ୍ |' || item.title == 'ਪਾਸਬੁਕ' || item.title == 'பாஸ்புக்' || item.title == 'లావాదేవీల' || item.title == 'پاس بک' || item.title == 'PISANI' ?
                            <Icon type="FontAwesome" name="address-book" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                            :
                            item.title == 'PRODUCTS' || item.title == 'उत्पादों' || item.title == 'DES PRODUITS' || item.title == 'পণ্য' || item.title == 'પ્રૉડક્ટ્સ' || item.title == 'ಪ್ರಾಡಕ್ಟ್ಸ್' || item.title == 'प्रॉडक्ट्स' || item.title == 'ଉତ୍ପାଦଗୁଡିକ' || item.title == 'ਪ੍ਰਾਡਕ੍ਟ੍ਸ' || item.title == 'தயாரிப்புகள்' || item.title == 'ఉత్పత్తులు' || item.title == 'مصنوعات' || item.title == 'Bidhaa' ?
                              <Icon type="FontAwesome" name="ticket" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                              :
                              item.title == 'REPORT HISTORY' || item.title == 'रिपोर्ट इतिहास' || item.title == 'Historique du rapport' || item.title == 'ইতিহাসের প্রতিবেদন করুন' || item.title == 'ઇતિહાસની જાણ કરો' || item.title == 'ಇತಿಹಾಸವನ್ನು ವರದಿ ಮಾಡಿ' || item.title == 'इतिहास नोंदवा' || item.title == 'ରିପୋର୍ଟ ଇତିହାସ' || item.title == 'ਇਤਿਹਾਸ ਦੀ ਰਿਪੋਰਟ ਕਰੋ' || item.title == 'வரலாற்றைப் புகாரளிக்கவும்' || item.title == 'చరిత్రను నివేదించండి' || item.title == 'تاریخ(ہسٹری ) کی اطلاع دیں' || item.title == 'Ripoti ya historia' ?
                                <Icon type="FontAwesome" name="history" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                                :
                                item.title == 'PRODUCTS HISTORY' || item.title == 'उत्पाद इतिहास' || item.title == 'HISTOIRE DES PRODUITS' || item.title == 'পণ্য ইতিহাস' || item.title == 'પ્રૉડક્ટ્સ હિસ્ટરી' || item.title == 'ಪ್ರಾಡಕ್ಟ್ಸ್ ಹಿಸ್ಟರೀ' || item.title == 'प्रॉडक्ट्स हिस्टरी' || item.title == 'ଉତ୍ପାଦ ଇତିହାସ |' || item.title == 'ਪ੍ਰਾਡਕ੍ਟ੍ਸ ਹਿਸ੍ਟਰੀ' || item.title == 'தயாரிப்புகள் வரலாறு' || item.title == 'ఉత్పత్తుల చరిత్ర' || item.title == 'مصنوعات کی تاریخ' || item.title == 'Historia ya Bidhaa' ?
                                  <Icon type="FontAwesome" name="history" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                                  :
                                  // item.title == 'DEALERS' || item.title == 'डीलरों' || item.title == 'ব্যবসায়ীরা' || item.title == 'Concessionnaires' || item.title == 'વેપારીઓ' || item.title == 'ವಿತರಕರು' || item.title == 'विक्रेते' || item.title == 'ଡିଲରମାନେ' || item.title == 'ਡੀਲਰ' || item.title == 'Återförsäljare' || item.title == 'விநியோகஸ்தர்கள்' || item.title == 'డీలర్లు' || item.title == 'ڈیلر' ?
                                  //   <Icon type="FontAwesome5" name="user-plus" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
                                  //   :
                                    <Icon type="FontAwesome" name="ban" style={{ fontSize: 18, color: this.props.enableDarkTheme ? 'white' : 'black' }} />
              }
              {"   "}{item.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    // else if (item.title == 'LANGUAGE') {
    //   return (
    //     <TouchableOpacity onPress={() => { this._logOut() }}>
    //       <View style={{
    //         flexDirection: "row",
    //         padding: 10,
    //         borderBottomWidth: 0.5,
    //         borderBottomColor: '#FF1E58',
    //         marginTop: 20
    //       }}
    //       >
    //         {/* <Text style={{ fontWeight: "bold", paddingLeft: 25, textAlign: 'justify' }}>
    //           <Icon type="FontAwesome" name="power-off" style={{ fontSize: 18 }} />
    //           {"   "}{"Bichoo Gang"}
    //         </Text> */}
    //       </View>
    //     </TouchableOpacity>
    //   );
    // }
  }
  _renderContent(item) {
    if (item.title == 'HISTORY') {
      return (
        <View>
          <TouchableWithoutFeedback onPress={this.navigateToScreen(item.nav1)} >
            <View style={styles.subMenu}>
              <Text>{item.subMenu1} </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.navigateToScreen(item.nav2)} >
            <View style={styles.subMenu}>
              <Text>{item.subMenu2} </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      );
    } else if (item.title == 'LOGOUT') {
      this._logout();
    }
  }
  onPress2 = (lang) => {
    // if (lang == "English") {
    //   this.props.setLanguage(lang)
    //   I18n.locale = 'en';
    // } else if (lang == "Hindi") {
    //   this.props.setLanguage(lang)
    //   I18n.locale = 'hi';
    // } else {
    //   this.props.setLanguage(lang)
    // }

    this.props.setLanguage(lang)

    this.setState({
      menuList: [
        // { title: strings('login.profile'), nav1: this.state.userType == 0 ? 'ProfileScreen' : 'MechanicProfileScreen' },
        // { title: strings('login.sdemenu_scan'), nav1: 'ScanScreen' },
        // { title: strings('login.CustSideMenu_couponhistory'), nav1: 'HistoryScreen' },
        // this.state.userType == 0 ? { title: strings('login.CustSideMenu_report'), nav1: 'ReportScreen' } : {},
        // this.state.userType == 0 ? { title: strings('login.CustSideMenu_reporthistory'), nav1: 'ReportHistory' } : {},
        // this.state.userType == 0 ? {} : { title: strings('login.CustSideMenu_paymentoptions'), nav1: 'PaymentDetailsScreen' },
        // this.state.userType == 0 ? {} : { title: strings('login.passBook'), nav1: 'PassbookScreen' },
        // this.state.userType == 0 ? {} : { title: strings('login.Products'), nav1: 'GiftProductsScreen' },
        // this.state.userType == 0 ? {} : { title: strings('login.productsHistory'), nav1: 'ProductsHistoryScreen' },
        // { title: strings('login.logout') },
        // { title: "LANGUAGE" },
        { title: strings('login.profile'), nav1: this.state.userType == 0 ? 'ProfileScreen' : this.state.userType == 2 ? "DealerProfileScreen" : 'MechanicProfileScreen' },
        // this.state.userType == 4 ?  { title: strings('login.CustSideMenu_paymentoptions'), nav1: 'PaymentDetailsScreen' } : {},
        this.state.userType == 2 ? { title: strings('login.sdemenu_scan'), nav1: 'DealerScanScreen' } : { title: strings('login.sdemenu_scan'), nav1: 'ScanScreen' },
        this.state.userType == 2 ? { title: strings('login.CustSideMenu_couponhistory'), nav1: 'DealerHistoryScreen' } : { title: strings('login.CustSideMenu_couponhistory'), nav1: 'HistoryScreen' },
        // this.state.userType == 4 ? { title: strings('login.cashbash'), nav1: 'CashBatchesScreen' } : {},
        this.state.userType == 4 ? { title: strings('login.CustSideMenu_report'), nav1: 'ReportScreen' } : {},
        this.state.userType == 4 ? { title: strings('login.CustSideMenu_reporthistory'), nav1: 'ReportHistory' } : {},
      
        // this.state.userType == 0 ? {} : this.state.userType == 2 ? {} : { title: strings('login.passBook'), nav1: 'PassbookScreen' },
        // this.state.userType == 0 ? {} : this.state.userType == 2 ? {} : { title: strings('login.Products'), nav1: 'GiftProductsScreen' },
        // this.state.userType == 0 ? {} : this.state.userType == 2 ? {} : { title: strings('login.productsHistory'), nav1: 'ProductsHistoryScreen' },
        this.state.userType == 0 ? { title: strings('login.dealers'), nav1: 'DistributorScreen' } : {},
        { title: strings('login.logout') },
        { title: "LANGUAGE" },
      ]
    });
  }
  changeTheme = () => {
    this.setState({
      changeThemeEnable: !this.state.changeThemeEnable
    }, () => {
      if (this.state.changeThemeEnable) {
        this.props.enableDarkThemeCall(true)
      } else {
        this.props.enableDarkThemeCall(false)
      }
    })
  }
  enableFingerPrintAuth = () => {
    let verify = !this.props.fingerPrintEnable
    if (verify) {
      this.props.fingerPrintEnableAuth(true)
    } else {
      this.props.fingerPrintEnableAuth(false)
    }
  }

   loadInBrowser_youtube= async (url)  => {
    // Linking.openURL('https://www.youtube.com/watch?v=Ehg5sj-R2B4&feature=share&si=ELPmzJkDCLju2KnD5oyZMQ');
    // Linking.openURL('https://instagram.com/magicgripbond?igshid=YmMyMTA2M2Y=').catch(err => console.error("Couldn't load page", err));
    if (await InAppBrowser.isAvailable()) {
     await InAppBrowser.open('https://www.youtube.com/watch?v=Ehg5sj-R2B4&feature=share&si=ELPmzJkDCLju2KnD5oyZMQ', {
      // iOS Properties
      dismissButtonStyle: 'cancel',
      preferredBarTintColor: '#453AA4',
      preferredControlTintColor: 'white',
      readerMode: false,
      animated: true,
      modalPresentationStyle: 'fullScreen',
      modalTransitionStyle: 'coverVertical',
      modalEnabled: true,
      enableBarCollapsing: false,
      // Android Properties
      showTitle: true,
      toolbarColor: MyColors.distributorColor,
      secondaryToolbarColor: 'black',
      navigationBarColor: 'black',
      navigationBarDividerColor: 'white',
      enableUrlBarHiding: true,
      enableDefaultShare: true,
      forceCloseOnRedirection: false,
      // Specify full animation resource identifier(package:anim/name)
      // or only resource name(in case of animation bundled with app).
      animations: {
        startEnter: 'slide_in_right',
        startExit: 'slide_out_left',
        endEnter: 'slide_in_left',
        endExit: 'slide_out_right'
      },
      headers: {
        'my-custom-header': 'my custom header value'
      }
    })
    // await this.sleep(800);
    // Alert.alert("---");
  }

  }

  loadInBrowser_facebook= async (url)  => {
    // Linking.openURL('https://www.youtube.com/watch?v=Ehg5sj-R2B4&feature=share&si=ELPmzJkDCLju2KnD5oyZMQ');
    // Linking.openURL('https://instagram.com/magicgripbond?igshid=YmMyMTA2M2Y=').catch(err => console.error("Couldn't load page", err));
    if (await InAppBrowser.isAvailable()) {
     await InAppBrowser.open('https://www.facebook.com/magicgripbond/', {
      // iOS Properties
      dismissButtonStyle: 'cancel',
      preferredBarTintColor: '#453AA4',
      preferredControlTintColor: 'white',
      readerMode: false,
      animated: true,
      modalPresentationStyle: 'fullScreen',
      modalTransitionStyle: 'coverVertical',
      modalEnabled: true,
      enableBarCollapsing: false,
      // Android Properties
      showTitle: true,
      toolbarColor: MyColors.distributorColor,
      secondaryToolbarColor: 'black',
      navigationBarColor: 'black',
      navigationBarDividerColor: 'white',
      enableUrlBarHiding: true,
      enableDefaultShare: true,
      forceCloseOnRedirection: false,
      // Specify full animation resource identifier(package:anim/name)
      // or only resource name(in case of animation bundled with app).
      animations: {
        startEnter: 'slide_in_right',
        startExit: 'slide_out_left',
        endEnter: 'slide_in_left',
        endExit: 'slide_out_right'
      },
      headers: {
        'my-custom-header': 'my custom header value'
      }
    })
    // await this.sleep(800);
    // Alert.alert("---");
  }

  }


  loadInBrowser_instagram= async (url)  => {
    // Linking.openURL('https://www.youtube.com/watch?v=Ehg5sj-R2B4&feature=share&si=ELPmzJkDCLju2KnD5oyZMQ');
    // Linking.openURL('https://instagram.com/magicgripbond?igshid=YmMyMTA2M2Y=').catch(err => console.error("Couldn't load page", err));
    if (await InAppBrowser.isAvailable()) {
     await InAppBrowser.open('https://instagram.com/magicgripbond?igshid=YmMyMTA2M2Y=', {
      // iOS Properties
      dismissButtonStyle: 'cancel',
      preferredBarTintColor: '#453AA4',
      preferredControlTintColor: 'white',
      readerMode: false,
      animated: true,
      modalPresentationStyle: 'fullScreen',
      modalTransitionStyle: 'coverVertical',
      modalEnabled: true,
      enableBarCollapsing: false,
      // Android Properties
      showTitle: true,
      toolbarColor: MyColors.distributorColor,
      secondaryToolbarColor: 'black',
      navigationBarColor: 'black',
      navigationBarDividerColor: 'white',
      enableUrlBarHiding: true,
      enableDefaultShare: true,
      forceCloseOnRedirection: false,
      // Specify full animation resource identifier(package:anim/name)
      // or only resource name(in case of animation bundled with app).
      animations: {
        startEnter: 'slide_in_right',
        startExit: 'slide_out_left',
        endEnter: 'slide_in_left',
        endExit: 'slide_out_right'
      },
      headers: {
        'my-custom-header': 'my custom header value'
      }
    })
    // await this.sleep(800);
    // Alert.alert("---");
  }

  }



 
  render() {
    console.log(this.props.languageControl);
    console.log("usertype", this.state.userType);
    console.log("isLoaded", this.state.isLoaded);

    console.log(this.state.menuList , 'menuList');

    return (
      
      <View style={{ backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white', flex: 1, borderColor: this.props.enableDarkTheme ? 'gray' : 'black', borderWidth: 1, borderTopWidth: 0, opacity: 1 }}>
      
        <ScrollView style={{}}>
          { !this.state.isLoaded ?
          <Loader
            loading={this.state.isLoaded}
            text=" Please Wait while loading..."
          /> 
          :
          <View></View>
          }
          
          <StatusBar
            backgroundColor={this.state.userType == 2 ? MyColors.distributorColor : MyColors.distributorColor}
            barStyle="light-content"
          />
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 10 }} resizeMode="contain">
            <Image source={require('../images/wwe.png')} style={{
              width: 220,
              height: 110,
            }}
              resizeMode="contain"
            />
            <Text style={{ paddingTop: 10, color: 'grey' }}>{strings('login.welcome')}</Text>
            {/* <Text style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>Zoomol</Text> */}
            <Text style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{this.state.name}</Text>
          </View>
          <View style={{ alignItems: 'stretch', paddingTop: 5 }}>
            <Accordion
              dataArray={this.state.menuList}
              animation={true}
              // expanded={true}
              expanded={[]}
              renderHeader={this._renderHeader}
              style={{ borderTopWidth: 0.5, borderTopColor: MyColors.distributorColor }}
            />
          </View>

          {/* <Card style={{ marginTop: 20, backgroundColor: this.props.enableDarkTheme ? 'black' : 'white', elevation: 0 }}>
            <Text style={{ marginTop: 10, marginLeft: 10, fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.choose_lang')} :</Text>

            <View style={{ marginLeft: 20, marginRight: 20 }}>
              <Dropdown
                label={this.props.languageControl}
                labelFontSize={0}
                data={languageDropDown}
                style={{ color: this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))" }}
                baseColor={this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))"}
                onChangeText={(lan) => this.onPress2(lan)}
                containerStyle={{ bottom: 12 }}
              />
            </View>

           
          </Card> */}
         

         
         
                  {/* <View style={{ flex:1, flexDirection:'row', marginVertical: 10, justifyContent:'center',alignItems: "center" }}>
                    
                    <TouchableOpacity 
                    
                        onPress={
                            this.loadInBrowser_youtube
                        }>
                     <Image source={require('../images/youtube.png')} 
                    style={{ borderWidth:1, borderColor:'#ccc',height: 30, width: 30, margin:15 }} resizeMode="cover" />
                    </TouchableOpacity>
                  
                    <TouchableOpacity 
                    onPress={
                      this.loadInBrowser_facebook
                     }>
                       
                    
                  <Image source={require('../images/facebook.png')} style={{  borderWidth:1, borderColor:'#ccc',height: 30, width: 30 ,margin:15 }} resizeMode="cover" />
                  </TouchableOpacity>
                  

                  <TouchableOpacity 
                   onPress={
                    this.loadInBrowser_instagram
                   }>
                     
                  <Image source={require('../images/instagram.png')} style={{  borderWidth:1, borderColor:'#ccc',height: 30, width: 30 ,margin:15 }} resizeMode="cover" />
                     </TouchableOpacity>
                 </View> */}
                
          <View style={{marginTop: 20}}>
            <Text style={{ textAlign: "center" }}>Version {version}</Text>
          </View>

         
          
        </ScrollView>
              
      
      </View>
      
    );
  
}
}
CustSideMenu.propTypes = {
  navigation: PropTypes.object
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    opacity: 1,
    borderWidth: 1,
    borderColor: 'black',
  },
  subMenu: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingLeft: 25,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10
  },
  imgStyle: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 70,
    resizeMode: 'contain'
  }

});
const mapStateToProps = (state) => {
  // console.log(state.VerifierReducer);

  return {
    languageControl: state.VerifierReducer.languageEnglish,
    enableDarkTheme: state.VerifierReducer.enableDarkTheme,
    fingerPrintEnable: state.VerifierReducer.enableFingerPrint
  }
}
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setLanguage: setLanguage, setCounterValue: setCounterValue,
    setCounter1Value: setCounter1Value, enableDarkThemeCall: enableDarkTheme, fingerPrintEnableAuth: fingerPrintEnableAuth, clearInsti: clearInsti, setMechanicData: setMechanicData
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(CustSideMenu)