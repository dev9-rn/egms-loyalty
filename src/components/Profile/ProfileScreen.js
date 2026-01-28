import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, Picker } from 'react-native';
import {
	Container, Header, Left, Body, Right, Content, Card, CardItem, Text,
	Title, Item, Label, Toast, InputGroup, Input, Icon, Form
} from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LinearGradient from 'react-native-linear-gradient';

import LoginService from '../../services/LoginService/LoginService';
import ProfileService from '../../services/ProfileService/ProfileService';
import { strings } from '../../locales/i18n';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
// import { Dropdown } from 'react-native-material-dropdown';
var _ = require('lodash');
import RNPicker from "rn-modal-picker";
import { connect } from 'react-redux';
import MyColors from '../../Utility/Colors';
import AsyncStorage from '@react-native-community/async-storage';

var isBrandData = false;
var isCountryData = false;
var isStatesData = false;
var isCityData = false;
// var brandData = [];
// var countryList = [];
// var statesList = [];
// var citiesList = [];

class ProfileScreen extends React.Component {

	constructor(props) {
		super(props);
		this.brandData = [];
		this.countryList = [];
		this.statesList = [];
		this.citiesList = [];
		this.state = {
			selectedBrandId: '',
			name: '',
			email: '',
			phoneNumber: '',
			phoneNumber1: '',
			address: '',
			street: '',
			pincode: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Please wait...',
			nameError: null,
			emailError: null,
			phoneNumberError: null,
			phoneNumberError1: null,
			addressError: null,
			streetError: null,
			pincodeError: null,
			panNoError: null,
			btnOTP: 'active',
			btnEmail: 'inactive',
			brandName: '',
			country_id: '',
			country_name: '',
			state_id: '',
			state_name: '',
			city_id: '',
			city_name: '',
			companyName: '',
			gstNo: '',
			selectedCity: '',
			distributor_code: "",
			accesstoken:""
		};
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		this.getAsyncUserData();
		this._getAsyncData();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('HomeScreen');
		return true;
	}

	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ loading: false });
		});
	}

	async getAsyncUserData() {
		await AsyncStorage.multiGet(['USERDATA','ACCESSTOKEN'], (err, result) => {    // FCMTOKEN is set on App.js
			var lData = JSON.parse(result[0][1]);
			this.setState({ accesstoken : result[1][1]});
			if (lData) {
				this.distributorId = lData.data.id;
				this.setState({
					selectedBrandId: lData.data.brand_id
				})
				this._getUserData();
			}
		});
	}

	async _getUserData() {
		const formData = new FormData();
		formData.append('distributorId', this.distributorId);
		if (this.props.languageControl) {
			formData.append('language', 'en');
		} else {
			formData.append('language', 'hi');
		}

		var profileApiObj = new ProfileService();
		this.setState({ loading: true });
		await profileApiObj.getDistributorProfile(formData, this.state.accesstoken);
		var lResponseData = profileApiObj.getRespData();
		if (!lResponseData) {
			utilities.showToastMsg('Something went wrong. Please try again later');
		} else if (lResponseData.status == 500 || lResponseData.status == 400) {
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 403) {
			utilities.showToastMsg(lResponseData.message);
			this.props.navigation.navigate('LoginScreen');
			AsyncStorage.clear();
			return;
		}
		else if (lResponseData.status == 200) {
			console.log("lResponseData.data");
			console.log(lResponseData.data);

			this.userdata = lResponseData.data;
			this.setState({
				name: lResponseData.data.name,
				distributor_code: lResponseData.data.distributor_code,
				phoneNumber: lResponseData.data.mobile,
				phoneNumber1: lResponseData.data.mobile_no_2,
				email: lResponseData.data.email,
				address: lResponseData.data.address,
				street: lResponseData.data.street,
				pincode: lResponseData.data.pincode,
				companyName: lResponseData.data.company_name,
				gstNo: lResponseData.data.gst_no,
				panNo: lResponseData.data.pan_no,
				selectedCity: lResponseData.data.city_id,
				selectedStates: lResponseData.data.state_id,
				selectedCountry: lResponseData.data.country_id,
				selectedBrandId: lResponseData.data.brand_id
			});
		} else {
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	_setPickerData(pResponseData) {
		var lData;
		var lBrandData = [];
		var lCountriesData = [];
		var lStateData = [];
		var lCitiesData = [];
		if (pResponseData.hasOwnProperty('brands')) {
			lData = pResponseData.brands;
			lBrandData = lData;
		} else if (pResponseData.hasOwnProperty('countries')) {
			lData = pResponseData.countries;
			lCountriesData = lData;
		} else if (pResponseData.hasOwnProperty('states')) {
			lData = pResponseData.states;
			lStateData = lData;
		} else if (pResponseData.hasOwnProperty('cities')) {
			lData = pResponseData.cities;
			lCitiesData = lData;
		}
		var arrayData = [];

		for (var i = 0; i < lData.length; i++) {
			var dataObj = {};
			dataObj.id = parseInt(lData[i].id);
			dataObj.name = lData[i].name;
			arrayData.push(dataObj);

		}
		for (var j = 0; j < lBrandData.length; j++) {
			var dataObj = {};
			dataObj.id = parseInt(lBrandData[j].id);
			dataObj.value = lBrandData[j].name;
			if (dataObj.id === parseInt(this.state.selectedBrandId)) {
				this.setState({ loading: true });
				this.setState({ brandName: dataObj.value })
				// arrayData.push(dataObj);
			}
		}
		for (var k = 0; k < lCountriesData.length; k++) {
			var dataObj = {};
			dataObj.id = parseInt(lCountriesData[k].id);
			dataObj.name = lCountriesData[k].name;
			if (dataObj.id == parseInt(this.state.selectedCountry)) {
				this.setState({ loading: true });
				this._setCountry(parseInt(this.state.selectedCountry))
				this.setState({ country_name: dataObj.name })
				// arrayData.push(dataObj);
			}
		}
		for (var l = 0; l < lStateData.length; l++) {
			var dataObj = {};
			dataObj.id = parseInt(lStateData[l].id);
			dataObj.name = lStateData[l].name;
			if (dataObj.id == parseInt(this.state.selectedStates)) {
				this.setState({ loading: true });
				this._setStates(parseInt(this.state.selectedStates))
				this.setState({ state_name: dataObj.name })
				// arrayData.push(dataObj);
			}
		}
		for (var m = 0; m < lCitiesData.length; m++) {
			var dataObj = {};
			dataObj.id = parseInt(lCitiesData[m].id);
			dataObj.name = lCitiesData[m].name;
			if (dataObj.id == parseInt(this.state.selectedCity)) {
				this.setState({ loading: true });
				this._setCity(parseInt(this.state.selectedCity))
				this.setState({ city_name: dataObj.name })
				// arrayData.push(dataObj);
			}
		}

		if (pResponseData.hasOwnProperty('brands')) {
			isBrandData = true;
			let initialData = {};
			initialData.id = this.state.selectedBrandId;
			initialData.value = this.state.brandName;

			arrayData.unshift(initialData);
			this.brandData = arrayData;
			this.setState({ brand: arrayData });

		} else if (pResponseData.hasOwnProperty('countries')) {
			isCountryData = true;
			let initialData = {};
			initialData.id = this.state.selectedCountry;
			initialData.name = this.state.country_name;
			arrayData.unshift(initialData);
			this.countryList = arrayData;
			// let CountryItems = this.countryList.map( (s, i) => {
			//    	    return <Picker.Item key={i} value={s.id} label={s.value} />
			//    	});

			this.setState({ country: arrayData });
		} else if (pResponseData.hasOwnProperty('states')) {
			isStatesData = true;
			let initialData = {};
			initialData.id = this.state.selectedStates;
			initialData.name = 'Select State';
			arrayData.unshift(initialData);
			this.statesList = arrayData;

			// let StateItems = this.statesList.map( (s, i) => {
			//        	return <Picker.Item key={i} value={s.id} label={s.value} />
			//    	});
			this.setState({ states: arrayData });
		} else if (pResponseData.hasOwnProperty('cities')) {
			isCityData = true;
			let initialData = {};
			initialData.id = this.state.selectedCity;
			initialData.name = 'Select City';
			arrayData.unshift(initialData);
			this.citiesList = arrayData;

			// let CityItems = this.citiesList.map( (s, i) => {
			//         return <Picker.Item key={i} value={s.id} label={s.value} />
			//     });
			this.setState({ city: arrayData });
		}
		// this.setState({brand: arrayData, country: arrayData, states: arrayData, city: arrayData});
	}

	async callForAPIBrandId() {
		console.log("brands-----");
		var brandApiObj = new LoginService();
		this.setState({ loading: true });
		await brandApiObj.getBrands();
		var lResponseData = brandApiObj.getRespData();

		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async callForAPICountrty() {
		console.log("country-----");
		var countryApiObj = new LoginService();
		this.setState({ loading: true });
		await countryApiObj.getCountries();
		var lResponseData = countryApiObj.getRespData();

		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async callForAPIStates(pCountryId) {
		console.log("states-----");
		var statesApiObj = new LoginService();
		this.setState({ loading: true });
		const formData = new FormData();
		formData.append('countryId', parseInt(pCountryId));
		if (this.props.languageControl) {
			formData.append('language', 'en');
		} else {
			formData.append('language', 'hi');
		}
		await statesApiObj.getStatesByCountry(formData);
		var lResponseData = statesApiObj.getRespData();
		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async callForAPICity(pStateId) {
		console.log("city-----");
		var statesApiObj = new LoginService();
		this.setState({ loading: true });
		const formData = new FormData();
		formData.append('stateId', parseInt(pStateId));
		if (this.props.languageControl) {
			formData.append('language', 'en');
		} else {
			formData.append('language', 'hi');
		}

		await statesApiObj.getCitiesByState(formData);
		var lResponseData = statesApiObj.getRespData();
		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async _getAsyncData() {
		await this.callForAPIBrandId();
		await this.callForAPICountrty();
	}

	_getStatesByCountry(pCountryId) {
		this.callForAPIStates(pCountryId);
	}

	_getCitiesByState(pStateId) {
		this.callForAPICity(pStateId);
	}

	_setBrand(brand) {
		this.setState({ selectedBrandId: brand });
	}

	_setCountry(CountryName, countryList) {
		if (countryList) {
			this.statesList = [];
			this.citiesList = [];
			let idForCountry = _.filter(countryList, { name: CountryName })[0].id
			if (CountryName != '') {
				this.setState({ selectedCountry: idForCountry, state_name: '', city_name: '' });
				this._getStatesByCountry(idForCountry);
			} else {
				this.setState({ selectedCountry: idForCountry });
			}
		} else {
			if (CountryName != 0) {
				this.setState({ selectedCountry: CountryName });
				this._getStatesByCountry(CountryName);
			} else {
				this.setState({ selectedCountry: CountryName });
			}
		}
	}

	_setStates(pStates, statesList) {
		if (statesList) {
			this.citiesList = [];
			if (pStates === "Select State") {
				this.setState({ selectedStates: "", city_name: '' });
				return;
			}
			let idForState = _.filter(statesList, { name: pStates })[0].id
			this.setState({ selectedStates: idForState, city_name: '' });
			this._getCitiesByState(idForState);
		} else {
			if (pStates != 0) {
				this.setState({ selectedStates: pStates });
				this._getCitiesByState(pStates);
			} else {
				this.setState({ selectedStates: pStates });
			}
		}
	}

	_setCity(city, citiesList) {
		if (citiesList) {
			let idForState = _.filter(citiesList, { name: city })[0].id
			this.setState({ selectedCity: idForState });
		} else {
			this.setState({ selectedCity: "" });
		}
	}

	_validateName() {
		let lName = this.state.name;
		let res = utilities.checkSpecialChar(lName);
		if (!res) {
			this.setState({ nameError: strings('login.spcError') });
		}
		return res;
	}

	_validateMobileNumber() {
		let lPhoneNumber = this.state.phoneNumber;
		let res = '';
		res = utilities.checkMobileNumber(lPhoneNumber);
		if (!res || lPhoneNumber.trim().length < 10) {
			this.setState({ phoneNumberError: strings('login.phnInvalid') });
		}
		return res;
	}

	_validateEmail() {
		let lEmail = this.state.email;
		let res = utilities.checkEmail(lEmail);
		if (!res) {
			this.setState({ emailError: strings('login.emailInvalid') });
		}
		return res;
	}

	_validateBrand() {
		let lBrand = this.state.selectedBrandId;
		if (!lBrand) {
			lBrand = false;
			this.setState({ brandError: "Select brand" });
		}
		return lBrand;
	}

	_validateCountry() {
		let lCountry = this.state.selectedCountry;
		if (!lCountry) {
			lCountry = false;
			this.setState({ countryError: "Select country" });
		}
		return lCountry;
	}

	_validateState() {
		let lState = this.state.selectedStates;
		if (!lState) {
			lState = false;
			this.setState({ stateError: "Select state" });
		}
		return lState;
	}

	_validatePanNo() {
		let lPanNo = this.state.panNo;
		let res = '';
		res = utilities.checkPanNo(lPanNo);
		if (!res) {
			this.setState({ panNoError: strings('login.panNoInvalid') });
		}
		return res;
	}

	async callForAPI() {
		let lName = this.state.name.trim();
		let lEmail = this.state.email.trim();
		let lPhoneNumber = this.state.phoneNumber;
		let lAddress = this.state.address;
		let lStreet = this.state.street;
		let lPinCode = this.state.pincode;
		let lBrand = this.state.selectedBrandId;
		let lCountry = this.state.selectedCountry;
		let lStates = this.state.selectedStates;
		let lCity = this.state.selectedCity;
		let lCompanyName = this.state.companyName;
		let lPanNo = this.state.panNo;
		let lGstNo = this.state.gstNo;

		const formData = new FormData();
		formData.append('distributorId', this.distributorId)
		formData.append('name', lName);
		formData.append('mobileNo', lPhoneNumber);
		formData.append('emailId', lEmail);
		formData.append('address', lAddress);
		formData.append('street', lStreet);
		formData.append('pinCode', lPinCode);
		formData.append('brandId', lBrand);
		formData.append('countryId', lCountry);
		formData.append('stateId', lStates);
		formData.append('cityId', lCity);
		formData.append('companyName', lCompanyName);
		formData.append('panNo', lPanNo);
		formData.append('gstNo', lGstNo);
		if (this.props.languageControl) {
			formData.append('language', 'en');
		} else {
			formData.append('language', 'hi');
		}

		var profileApiObj = new ProfileService();
		// this.props.navigation.navigate('OTPVerification');

		this.setState({ loading: true });
		await profileApiObj.updateProfile(formData);
		var lResponseData = profileApiObj.getRespData();

		if (!lResponseData || lResponseData.status == 500) {
			this.closeActivityIndicator();
			utilities.showToastMsg('Something went wrong. Please try again later');
		} else if (lResponseData.status == 400 || lResponseData.status == 409 || lResponseData.status == 422) {
			this.closeActivityIndicator();
			this.setState({ phoneNumberError: lResponseData.message });
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 200) {
			this.closeActivityIndicator();
			utilities.showToastMsg(lResponseData.message);
			this.props.navigation.navigate('HomeScreen');
		} else {
			this.closeActivityIndicator();
			utilities.showToastMsg('Something went wrong. Please try again later');
		}
	}

	_onPressButton() {
		let lName = this.state.name;
		let lEmail = this.state.email;
		let lPhoneNumber = this.state.phoneNumber;
		let lAddress = this.state.address;
		let lStreet = this.state.street;
		let lPincode = this.state.pincode;
		let lBrand = this.state.selectedBrandId;
		let lCountry = this.state.selectedCountry;
		let lStates = this.state.selectedStates;
		let lCity = this.state.selectedCity;
		let lPanNo = this.state.panNo;

		var isValidName = '';
		var isValidMobileNumber = '';
		var isValidEmail = '';

		if (lName === "") {
			this.setState({ nameError: strings('login.nameError') });
			return;
		} else {
			this.setState({ nameError: null });
		}

		if (lEmail === "") {
			this.setState({ emailError: strings('login.emError') });
			return;
		} else {
			this.setState({ emailError: null });
		}

		if (lPhoneNumber === "") {
			this.setState({ phoneNumberError: strings('login.phnError') });
			return;
		} else {
			this.setState({ phoneNumberError: null });
		}

		if (lAddress === "") {
			this.setState({ addressError: strings('login.addError') });
			return;
		} else {
			this.setState({ addressError: null });
		}

		if (lStreet === "") {
			this.setState({ streetError: strings('login.streetError') });
			return;
		} else {
			this.setState({ streetError: null });
		}

		if (lPincode === "") {
			this.setState({ pincodeError: strings('login.PinCodeError') });
			return;
		} else {
			this.setState({ pincodeError: null });
		}

		// if (!lBrand || lBrand == 0) {
		// 	alert('Please select Brand');
		// 	this.setState({ brandError: "Brand required." });
		// } else {
		// 	this.setState({ brandError: null });
		// }

		if (!lCountry || lCountry == 0) {
			Alert.alert(
				'Alert',
				strings('login.countryError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ countryError: strings('login.countryError') });
			return;
		} else {
			this.setState({ countryError: null });
		}

		if (!lStates || lStates == 0) {
			Alert.alert(
				'Alert',
				strings('login.stateError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ stateError: strings('login.stateError') });
			return;
		} else {
			this.setState({ stateError: null });
		}

		if (!lCity || lCity == 0) {
			Alert.alert(
				'Alert',
				strings('login.cityError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ cityError: strings('login.cityError') });
			return;
		} else {
			this.setState({ cityError: null });
		}

		if (this.state.nameError == null && this.state.emailError == null && this.state.phoneNumberError == null && this.state.addressError == null && this.state.streetError == null && this.state.pincodeError == null) {
			;
			isValidName = this._validateName();
			// isValidUserName = this._validateUserName();
			isValidMobileNumber = this._validateMobileNumber();
			isValidEmail = this._validateEmail();
			// isValidBrand = this._validateBrand();
			// isValidCity = this._validCity();

			if (lPanNo) {
				isValidPanNo = this._validatePanNo();
			}

			if (isValidName && isValidEmail && isValidMobileNumber) {
				this.callForAPI();
			}

		} else {
			if (lName != "") {
				lName = '';
				isValidName = this._validateName();
			}
			if (lEmail != '') {
				lEmail = '';
				isValidEmail = this._validateEmail();
			}
			if (lPhoneNumber != '') {
				lPhoneNumber = '';
				isValidMobileNumber = this._validateMobileNumber();
			}
			// if (lUserName) {
			// 	lUserName = '';
			// 	isValidUserName = this._validateUserName();
			// }
			// if (lPassword != '') {
			// 	lPassword = '';
			// 	isValidPassword = this._validatePassword();
			// }
		}
	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: MyColors.distributorColor }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, paddingRight: 23 }}>
						<Title style={{ color: '#FFFFFF' }}>{strings('login.profile_distributor_title')}</Title>
					</Body>

				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: MyColors.distributorColor }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, alignItems: 'center', }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16, marginLeft: -10 }}>{strings('login.profile_distributor_title')}</Title>
					</Body>
				</Header>
			)
		}
	}
	render() {
		var BrandItems;
		var CountryItems;
		var StateItems;
		var CityItems;

		if (isBrandData) {
			BrandItems = this.brandData.map((s, i) => {
				return <Picker.Item key={i} value={s.id} label={s.value} />
			});
		}
		if (isCountryData) {
			CountryItems = this.countryList.map((s, i) => {
				return <Picker.Item key={i} value={s.id} label={s.value} />
			});
		}
		if (isStatesData) {
			StateItems = this.statesList.map((s, i) => {
				return <Picker.Item key={i} value={s.id} label={s.value} />
			});
		}
		if (isCityData) {
			CityItems = this.citiesList.map((s, i) => {
				return <Picker.Item key={i} value={s.id} label={s.value} />
			});
		}

		return (
			<View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? 'black' : 'white' }}>

				{this._showHeader()}
				<StatusBar
					backgroundColor={ MyColors.distributorColor}
					barStyle="light-content"
				/>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>

				<View style={styles.signUpViewContainer}>
				<KeyboardAwareScrollView enableOnAndroid={true} extraScrollHeight={150} keyboardShouldPersistTaps={'handled'}>
						<Card style={{
							// padding: 10,
							// marginTop: 20,
							marginLeft: 10,
							marginRight: 10,
							backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white',
							elevation: 0
						}}>

							<Content>
								<Form>
									<Item stackedLabel>
										<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_companyName')}</Label>
										<Input
											disabled={true}
											autoFocus={true}
											value={this.state.companyName}
											style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
											// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(companyName) => this.setState({ companyName })}
										/>
									</Item>
									<Item stackedLabel>
										<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_distributor_code')}</Label>
										<Input
											disabled={true}
											autoFocus={true}
											value={this.state.distributor_code}
											style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
											// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(distributor_code) => this.setState({ distributor_code })}
										/>
									</Item>

									{!!this.state.nameError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													placeholder={strings('login.profile_distributor_name')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ nameError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.nameError}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_name')}</Label>
											<Input
												disabled={true}
												value={this.state.name}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
												autoFocus={true}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(name) => this.setState({ name })}
											/>
										</Item>
									}

									{!!this.state.phoneNumberError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													placeholder={strings('login.profile_distributor_phnNo')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ phoneNumberError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.phoneNumberError}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_phnNo')}</Label>
											<Input
												disabled={true}
												value={this.state.phoneNumber}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
												keyboardType='number-pad'
												maxLength={10}
												autoFocus={true}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
											/>
										</Item>
									}
									{!!this.state.phoneNumberError1 ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													placeholder={strings('login.profile_distributor_phnNo1')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ phoneNumberError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.phoneNumberError1}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_phnNo1')}</Label>
											<Input
												disabled={true}
												value={this.state.phoneNumber1}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
												keyboardType='number-pad'
												maxLength={10}
												autoFocus={true}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(phoneNumber1) => this.setState({ phoneNumber1 })}
											/>
										</Item>
									}

									{!!this.state.emailError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													placeholder={strings('login.profile_distributor_email')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ emailError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.emailError}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_email')}</Label>
											<Input
												disabled={true}
												autoFocus={true}
												value={this.state.email}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
												keyboardType='email-address'
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(email) => this.setState({ email })}
											/>
										</Item>
									}

									{!!this.state.addressError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													placeholder={strings('login.profile_distributor_address')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ addressError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.addressError}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_address')}</Label>
											<Input
												disabled={true}
												autoFocus={true}
												value={this.state.address}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(address) => this.setState({ address })}
											/>
										</Item>
									}

									{!!this.state.streetError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													style={{ paddingBottom: 5 }}
													placeholder={strings('login.profile_distributor_street')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ streetError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.streetError}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_street')}</Label>
											<Input
												disabled={true}
												autoFocus={true}
												value={this.state.street}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(street) => this.setState({ street })}
											/>
										</Item>
									}

									{!!this.state.pincodeError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													placeholder={strings('login.profile_distributor_pincode')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ pincodeError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.pincodeError}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_pincode')}</Label>
											<Input
												disabled={true}
												autoFocus={true}
												value={this.state.pincode}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(pincode) => this.setState({ pincode })}
											/>
										</Item>
									}


									{/* <View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07 }}>
										{this.state.selectedBrandId ?
											<Dropdown
												label={this.state.brandName}
												data={this.brandData}
												style={{ color: this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))" }}
												baseColor={this.props.enableDarkTheme ? 'grey' : "(default: rgba(0, 0, 0, 5))"}
												disabled={true}
												onChangeText={(brand) => this._setBrand(brand)}
											/>
											: <View></View>}
									</View> */}
									<Item stackedLabel>
										<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_brandName')}</Label>
										<Input
											disabled={true}
											autoFocus={true}
											value={this.state.brandName}
											style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'grey' }}
											// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(companyName) => this.setState({ companyName })}
										/>
									</Item>


									<View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07, marginTop: 30 }}>
										{/* <Picker
											selectedValue={this.state.selectedCountry}
											style={{ flex: 0.3 }}
											onValueChange={(country) => this._setCountry(country)}>
											{CountryItems}
										</Picker> */}
										{/* <Dropdown
											label={this.state.country_name}
											data={this.countryList}
											baseColor="(default: rgba(0, 0, 0, 5))"
											onChangeText={(value) => { this._setCountry(value, this.countryList) }}
										/> */}

										<RNPicker
											dataSource={this.countryList}
											dummyDataSource={this.countryList}
											defaultValue={true}
											pickerTitle={"Select Country"}
											pickerItemTextStyle={styles.listTextViewStyle}
											showSearchBar={true}
											disablePicker={true}
											changeAnimation={"none"}
											searchBarPlaceHolder={"Search....."}
											showPickerTitle={true}
											selectedLabel={this.state.country_name}
											placeHolderLabel={"Please Select Country"}
											selectedValue={(index, item) => { this._setCountry(item.name, this.countryList), this.setState({ country_name: item.name }) }}
										/>
									</View>

									<View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07, marginTop: 20 }}>
										{/* <Picker
											selectedValue={this.state.selectedStates}
											style={{ flex: 0.3 }}
											onValueChange={(states) => this._setStates(states)}>
											{StateItems}
										</Picker> */}
										{/* <Dropdown
											label={this.state.state_name}
											data={this.statesList}
											baseColor="(default: rgba(0, 0, 0, 5))"
											onChangeText={(states) => this._setStates(states, this.statesList)}
										/> */}

										<RNPicker
											dataSource={this.statesList}
											dummyDataSource={this.statesList}
											defaultValue={true}
											pickerTitle={"Select State"}
											pickerItemTextStyle={styles.listTextViewStyle}
											showSearchBar={true}
											disablePicker={true}
											changeAnimation={"none"}
											searchBarPlaceHolder={"Search....."}
											showPickerTitle={true}
											selectedLabel={this.state.state_name}
											placeHolderLabel={"Please Select State"}
											selectedValue={(index, item) => { this._setStates(item.name, this.statesList), this.setState({ state_name: item.name }) }}
										/>
									</View>

									<View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07, marginTop: 20 }}>
										{/* <Picker
											selectedValue={this.state.selectedCity}
											style={{ flex: 0.3 }}
											onValueChange={(city) => this._setCity(city)}>
											{CityItems}
										</Picker> */}
										{/* <Dropdown
											label={this.state.city_name}
											data={this.citiesList}
											baseColor="(default: rgba(0, 0, 0, 5))"
											onChangeText={(city) => this._setCity(city, this.citiesList)}
										/> */}

										<RNPicker
											dataSource={this.citiesList}
											dummyDataSource={this.citiesList}
											defaultValue={true}
											pickerItemTextStyle={styles.listTextViewStyle}
											pickerTitle={"Select City"}
											showSearchBar={true}
											disablePicker={true}
											changeAnimation={"none"}
											searchBarPlaceHolder={"Search....."}
											showPickerTitle={true}
											selectedLabel={this.state.city_name}
											placeHolderLabel={"Please Select City"}
											selectedValue={(index, item) => { this._setCity(item.name, this.citiesList), this.setState({ city_name: item.name }) }}
										/>
									</View>
									<View>
										<Button style={{marginBottom: 10, backgroundColor: MyColors.distributorColor }} onPress={() => this.handleFileUpload.click()} >
                                    		<Text>Open Camera</Text>
                                		</Button>
									</View>



									{/* {!!this.state.panNoError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													disabled={true}
													placeholder={strings('login.profile_distributor_panNo')}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ panNoError: null }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.panNoError}</Text>
										</Form>
									) :
										<Item stackedLabel>
											<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_panNo')}</Label>
											<Input
												disabled={true}
												value={this.state.panNo}
												style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}
												// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(panNo) => this.setState({ panNo })}
											/>
										</Item>
									} */}
									{/* <Item stackedLabel>
										<Label style={{ color: this.props.enableDarkTheme ? 'white' : 'black' }}>{strings('login.profile_distributor_GSTno')}</Label>
										<Input
											disabled={true}
											value={this.state.gstNo}
											style={{ marginTop: 3, color: this.props.enableDarkTheme ? 'white' : 'black' }}
											// onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											// onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(gstNo) => this.setState({ gstNo })}
										/>
									</Item> */}

									{/* <Content padder>
										<TouchableOpacity onPress={() => this._onPressButton()}>
											<View style={styles.buttonSignUp}>
												<LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.linearGradient}>
													<Text style={styles.buttonTextSignUp}>{strings('login.profileScreenSubmit')}</Text>
												</LinearGradient>
											</View>
										</TouchableOpacity>

									</Content> */}
									<Text />
								</Form>
							</Content>
						</Card>
					</KeyboardAwareScrollView>
				</View>
			</View>
		)
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	signUpViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: 5
	},
	cardContainer: {
		padding: 15,
		marginTop: 20,
		marginLeft: 10,
		marginRight: 10
	},
	cardHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0'
	},
	inputContainer: {
		height: 100,
		marginBottom: 15,
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	inputs: {
		height: 45,
		marginLeft: 5,
		borderBottomWidth: 1,
		flex: 1,
	},
	buttonSignUp: {
		marginTop: 10,
		marginBottom: 50,
		backgroundColor: '#e43c22',
		borderRadius: 5,
		flex: 1
	},
	buttonTextSignUp: {
		padding: 10,
		color: 'white',
		textAlign: 'center',
		fontWeight: 'bold',
	},
	buttonOTP: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#33B5E5',
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextOTP: {
		paddingLeft: 5,
		color: 'white',
		fontSize: 12,
	},
	buttonEmail: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#33B5E5',
		borderBottomRightRadius: 10,
		borderTopRightRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextEmail: {
		padding: 2,
		color: '#FFFFFF',
		fontSize: 12,
	},
	buttonEmailOff: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderBottomRightRadius: 10,
		borderTopRightRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextEmailOff: {
		padding: 2,
		color: '#33B5E5',
		fontSize: 12,

	},
	buttonOTPOff: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextOTPOff: {
		fontSize: 12,
		padding: 2,
		color: '#33B5E5',
	},
	errorMsg: {
		marginLeft: 18,
		fontSize: 12,
		color: 'red'
	},
	listTextViewStyle: {
		color: "#000",
		borderBottomWidth: 0.5,
		borderBottomColor: 'grey',
		marginVertical: 10,
		flex: 0.9,
		marginHorizontal: 10,
		textAlign: "left"
	},
})
const mapStateToProps = (state) => {
	return {
		languageControl: state.VerifierReducer.languageEnglish,
		enableDarkTheme: state.VerifierReducer.enableDarkTheme
	}
}
export default connect(mapStateToProps, null)(ProfileScreen)