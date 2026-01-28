import React, { Component } from 'react';
import { ReactDOM } from 'react-dom';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity, Picker } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Header, Left, Body, Content, Card, CardItem, Text, Title, Item, Label, Input, Icon, Form } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LoginService from '../../services/LoginService/LoginService';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../Utility/Loader';
import * as utilities from '../../Utility/utilities';
import * as app from '../../App';
// import { Dropdown } from 'react-native-material-dropdown';
var _ = require('lodash');
import RNPicker from "rn-modal-picker";
import { strings } from '../../locales/i18n';


var isBrandData = false;
var isCountryData = false;
var isStatesData = false;
var isCityData = false;
export default class SignUpScreen extends Component {
	constructor(props) {
		super(props);
		this.countryList = [];
		this.statesList = [];
		this.state = {
			isConnected: true,
			name: '',
			email: '',
			phoneNumber: '',
			address: '',
			street: '',
			pinCode: '',
			panNo: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Please wait...',
			nameError: null,
			emailError: null,
			phoneNumberError: null,
			addressError: null,
			streetError: null,
			pinCodeError: null,
			panNoError: null,
			btnOTP: 'active',
			btnEmail: 'inactive',
			countriesArr: [],
			stateArr: [],
			citiesArr: [],
			brandArr: [],
			gstNo: '',
			companyName: '',
			brandIDFromStorage: '',
			selectedTextCountry: "",
			selectedTextState: "",
			selectedTextCity: "",
			selectedCity: ''
		};
	}

	handleFileUpload = event => {
		console.log(event.target.files[0].name);
	};

	_selectedValueForCountry(index, item) {
		this.setState({ selectedText: item.name });
	}
	componentDidMount() {
		this._getAsyncData();
		this.getUserData();
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}
	async getUserData() {
		await AsyncStorage.getItem('BRANDCODE', (err, result) => {
			var lData = JSON.parse(result);
			console.log(lData);
			this.setState({ brandIDFromStorage: lData })
		});
	}
	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('LoginScreen');
		return true;
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

		// for (var j = 0; j < lBrandData.length; j++) {
		// 	var dataObj = {};
		// 	dataObj.id = parseInt(lBrandData[j].id);
		// 	dataObj.value = lBrandData[j].name;
		// 	this.state.brandArr.push(dataObj)
		// }
		// for (var k = 0; k < lCountriesData.length; k++) {
		// 	var dataObj = {};
		// 	dataObj.id = parseInt(lCountriesData[k].id);
		// 	dataObj.value = lCountriesData[k].name;
		// 	this.state.countriesArr.push(dataObj)
		// }
		// for (var l = 0; l < lStateData.length; l++) {
		// 	var dataObj = {};
		// 	dataObj.id = parseInt(lStateData[l].id);
		// 	dataObj.value = lStateData[l].name;
		// 	this.state.stateArr.push(dataObj)
		// }
		for (var m = 0; m < lCitiesData.length; m++) {
			var dataObj = {};
			dataObj.id = parseInt(lCitiesData[m].id);
			dataObj.name = lCitiesData[m].name;
			this.state.citiesArr.push(dataObj)
		}

		if (pResponseData.hasOwnProperty('brands')) {
			isBrandData = true;
			let initialData = {};
			initialData.id = 0;
			initialData.value = 'Select Brand';
			arrayData.unshift(initialData);
			this.setState({ brand: arrayData });
		} else if (pResponseData.hasOwnProperty('countries')) {
			isCountryData = true;
			let initialData = {};
			initialData.id = 0;
			initialData.name = 'Select Country';
			arrayData.unshift(initialData);
			this.countryList = arrayData;
			console.log("===-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
			console.log(this.countryList);

			this.setState({ country: arrayData });
		} else if (pResponseData.hasOwnProperty('states')) {
			isStatesData = true;
			let initialData = {};
			initialData.id = 0;
			initialData.name = 'Select State';
			arrayData.unshift(initialData);
			this.statesList = arrayData;
			this.setState({ states: arrayData });
		} else if (pResponseData.hasOwnProperty('cities')) {
			isCityData = true;
			let initialData = {};
			initialData.id = 0;
			initialData.name = 'Select City';
			arrayData.unshift(initialData);
			this.setState({ city: arrayData });
		}
	}

	async callForAPIBrandId() {
		var brandApiObj = new LoginService();
		this.setState({ loading: true });
		await brandApiObj.getBrands();
		var lResponseData = brandApiObj.getRespData();

		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async callForAPICountrty() {
		var countryApiObj = new LoginService();
		this.setState({ loading: true });
		await countryApiObj.getCountries();
		var lResponseData = countryApiObj.getRespData();

		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async callForAPIStates(pCountryId) {
		var statesApiObj = new LoginService();
		this.setState({ loading: true });
		const formData = new FormData();
		formData.append('countryId', parseInt(pCountryId));

		await statesApiObj.getStatesByCountry(formData);
		var lResponseData = statesApiObj.getRespData();

		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async callForAPICity(pStateId) {
		var statesApiObj = new LoginService();
		this.setState({ loading: true });
		const formData = new FormData();
		formData.append('stateId', parseInt(pStateId));

		await statesApiObj.getCitiesByState(formData);
		var lResponseData = statesApiObj.getRespData();
		console.log(lResponseData);
		debugger;
		this.closeActivityIndicator();
		this._setPickerData(lResponseData);
	}

	async _getAsyncData() {
		// await this.callForAPIBrandId();
		await this.callForAPICountrty();
	}

	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ loading: false });
		});
	}

	_getStatesByCountry(pCountryId) {
		this.callForAPIStates(pCountryId);
	}

	_getCitiesByState(pStateId) {
		this.callForAPICity(pStateId);
	}

	_validateName() {
		let lName = this.state.name;
		let res = utilities.checkSpecialChar(lName);
		if (!res) {
			this.setState({ nameError: strings('login.spcError') });
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

	_validatePanNo() {
		let lPanNo = this.state.panNo;
		let res = '';
		res = utilities.checkPanNo(lPanNo);
		if (!res) {
			this.setState({ panNoError: strings('login.panNoInvalid') });
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

	_validateCountry() {
		let lCountry = this.state.selectedCountry;
		if (!lCountry) {
			lCountry = false;
			this.setState({ countryError: strings('login.countryError') });
		}
		return lCountry;
	}

	_validateState() {
		let lState = this.state.selectedStates;
		if (!lState) {
			lState = false;
			this.setState({ stateError: strings('login.stateError') });
		}
		return lState;
	}

	_setBrand(brand, brandList) {
		let idForCountry = _.filter(brandList, { value: brand })[0].id
		this.setState({ selectedBrandId: idForCountry });
	}

	_setCountry(CountryName, countryList) {
		if (CountryName === strings('login.countryError')) {
			this.setState({ selectedCountry: '' })
			return;
		}
		if (countryList) {
			this.statesList = []
			let idForCountry = _.filter(countryList, { name: CountryName })[0].id
			if (CountryName != '') {
				this.setState({ selectedCountry: idForCountry, citiesArr: [], selectedTextState: '', selectedTextCity: '' });
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
		if (pStates === strings('login.stateError')) {
			this.setState({ selectedStates: '' })
			return;
		}
		if (statesList) {
			if (pStates != 0) {
				let idForState = _.filter(statesList, { name: pStates })[0].id
				this.setState({ selectedStates: idForState, citiesArr: [], selectedTextCity: '' });
				this._getCitiesByState(idForState);
			} else {
				this.setState({ selectedStates: idForState });
			}
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
			this.setState({ selectedCity: city });
		}
	}

	async callForAPI() {
		let lName = this.state.name.trim();
		let lEmail = this.state.email.trim();
		let lPhoneNumber = this.state.phoneNumber;
		let lAddress = this.state.address;
		let lStreet = this.state.street;
		let lPinCode = this.state.pinCode;
		// let lBrand = this.state.brandIDFromStorage;
		let lCountry = this.state.selectedCountry;
		let lStates = this.state.selectedStates;
		let lCity = this.state.selectedCity;
		let lCompanyName = this.state.companyName;
		let lPanNo = this.state.panNo;
		let lGstNo = this.state.gstNo;

		const formData = new FormData();
		formData.append('name', lName);
		formData.append('mobileNo', lPhoneNumber);
		formData.append('emailId', lEmail);
		formData.append('address', lAddress);
		formData.append('street', lStreet);
		formData.append('pinCode', lPinCode);
		// formData.append('brandId', lBrand);
		// formData.append('countryId', lCountry);
		formData.append('stateId', lStates);
		formData.append('cityId', lCity);
		formData.append('companyName', lCompanyName);
		formData.append('panNo', lPanNo);
		formData.append('gstNo', lGstNo);
		var loginApiObj = new LoginService();

		this.setState({ loading: true });
		await loginApiObj.registration(formData);
		var lResponseData = loginApiObj.getRespData();
		console.log("0---uuuuu-----");

		console.log(lResponseData);
		debugger;
		if (!lResponseData || lResponseData.status == 500) {
			this.closeActivityIndicator();
			utilities.showToastMsg('Something went wrong. Please try again later');
		} else if (lResponseData.status == 409 || lResponseData.message == 'Distributor already exists with same mobile no.') {		// 	Same mobile or email
			this.closeActivityIndicator();
			this.setState({ phoneNumberError: lResponseData.message });
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 409 || lResponseData.message == 'Distributor already exists with same email.') {		// 	Same mobile or email
			this.closeActivityIndicator();
			this.setState({ emailError: lResponseData.message });
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 422 || lResponseData.message == 'Please enter valid mobile number.') {		// 	Same mobile or email
			this.closeActivityIndicator();
			this.setState({ phoneNumberError: lResponseData.message });
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 422 || lResponseData.message == 'Please enter valid email id.') {		// 	Same mobile or email
			this.closeActivityIndicator();
			this.setState({ emailError: lResponseData.message });
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 400) {
			this.closeActivityIndicator();
			utilities.showToastMsg(lResponseData.message);
		} else if (lResponseData.status == 200) {
			setTimeout(() => {
				this.setState({ animating: false, loading: false });
			}, 2000);
			try {
				await AsyncStorage.setItem('OTPDATA', JSON.stringify(lResponseData));
				// this.props.navigation.navigate('OTPVerification');
				Alert.alert(
					'SUCCESS',
					'OTP sent successfully',
					[
						{ text: 'OK', onPress: () => this.props.navigation.navigate('OTPVerification', { mobileNumber: this.state.phoneNumber }) },
					],
					{ cancelable: false }
				)
			} catch (error) {
				console.log(error);
			}
		} else {
			this.closeActivityIndicator();
			utilities.showToastMsg('Something went wrong. Please try again later');
		}

	}

	_onPressButton() {
		console.log("==-=-=-=-=-=");
		console.log(this.state.selectedCity);


		let lName = this.state.name;
		let lEmail = this.state.email;
		let lPhoneNumber = this.state.phoneNumber;
		let lAddress = this.state.address;
		let lStreet = this.state.street;
		let lPinCode = this.state.pinCode;
		let lBrand = this.state.selectedBrandId;
		let lCountry = this.state.selectedCountry;
		let lStates = this.state.selectedStates;
		let lCity = this.state.selectedCity;
		let lPanNo = this.state.panNo;
		var isValidName = '';
		// var isValidUserName = '';
		var isValidPassword = '';
		var isValidMobileNumber = '';
		var isValidEmail = '';
		var isValidPanNo = ''

		if (lName === "") {
			Alert.alert(
				strings('login.ScanScreenAlertTitle'),
				strings('login.nameError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ nameError: strings('login.nameError') });
			return;
		} else {
			this.setState({ nameError: null });
		}
		if (lPhoneNumber === "") {
			Alert.alert(
				strings('login.ScanScreenAlertTitle'),
				strings('login.phnError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ phoneNumberError: strings('login.phnError') });
			return;
		} else {
			this.setState({ phoneNumberError: null });
		}
		if (lEmail === "") {
			Alert.alert(
				strings('login.ScanScreenAlertTitle'),
				strings('login.emError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ emailError: strings('login.emError') });
			return;
		} else {
			this.setState({ emailError: null });
		}

		if (lAddress === "") {
			Alert.alert(
				strings('login.ScanScreenAlertTitle'),
				strings('login.addError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ addressError: strings('login.addError') });
			return;
		} else {
			this.setState({ addressError: null });
		}

		if (lStreet === "") {
			Alert.alert(
				strings('login.ScanScreenAlertTitle'),
				strings('login.streetError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ streetError: strings('login.streetError') });
			return;
		} else {
			this.setState({ streetError: null });
		}

		if (lPinCode === "") {
			Alert.alert(
				strings('login.ScanScreenAlertTitle'),
				strings('login.PinCodeError'),
				[
					{ text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				],
				{ cancelable: false }
			);
			this.setState({ pinCodeError: strings('login.PinCodeError') });
			return;
		} else {
			this.setState({ pinCodeError: null });
		}

		if (!lCountry || lCountry == 0) {
			Alert.alert(
				strings('login.ScanScreenAlertTitle'),
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
				strings('login.ScanScreenAlertTitle'),
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
				strings('login.ScanScreenAlertTitle'),
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

		if (this.state.nameError == null && this.state.emailError == null && this.state.phoneNumberError == null && this.state.addressError == null && this.state.streetError == null && this.state.pinCodeError == null) {
			isValidName = this._validateName();
			// isValidUserName = this._validateUserName();
			isValidMobileNumber = this._validateMobileNumber();
			// isValidPassword = this._validatePassword();
			isValidEmail = this._validateEmail();
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

		}
	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#e43c22' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('LoginScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9 }}>
						<Title style={{ color: '#FFFFFF' }}>{strings('login.SeQr')}</Title>
					</Body>

				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#e43c22' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('LoginScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, alignItems: 'center' }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>{strings('login.SeQr')}</Title>
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
			if (this.state.brand) {
				BrandItems = this.state.brand.map((s, i) => {
					return <Picker.Item key={i} value={s.id} label={s.value} />
				});
			}
		}
		if (isCountryData) {
			if (this.state.country) {
				CountryItems = this.state.country.map((s, i) => {
					return <Picker.Item key={i} value={s.id} label={s.value} />
				});
			}
		}
		if (isStatesData) {
			if (this.state.states) {
				StateItems = this.state.states.map((s, i) => {
					return <Picker.Item key={i} value={s.id} label={s.value} />
				});
			}
		}
		if (isCityData) {
			if (this.state.city) {
				CityItems = this.state.city.map((s, i) => {
					return <Picker.Item key={i} value={s.id} label={s.value} />
				});
			}
		}
		return (
			<View style={styles.container}>
				{this._showHeader()}
				<StatusBar barStyle="light-content" backgroundColor="#e43c22" />
				<Loader loading={this.state.loading} text={this.state.loaderText} />
				<View style={styles.signUpViewContainer}>
					<Card style={styles.cardContainer}>
						<CardItem header style={styles.cardHeader}>
							<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>{strings('login.signup_button')}</Text>
						</CardItem>
						<KeyboardAwareScrollView enableOnAndroid={true} extraScrollHeight={150} keyboardShouldPersistTaps={'handled'}>
							<Content>
								<Form>
									{!!this.state.nameError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													placeholder={strings('login.profile_screen_name_field')}
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ nameError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.nameError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label>{strings('login.profile_screen_name_field')}</Label>
											<Input
												autoFocus={true}
												style={{ marginTop: 3 }}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(name) => this.setState({ name })}
											/>
										</Item>
									}
									{!!this.state.phoneNumberError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													placeholder={strings('login.profile_screen_phn_field')}
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ phoneNumberError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.phoneNumberError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label>{strings('login.profile_screen_phn_field')}</Label>
											<Input
												keyboardType='number-pad'
												style={{ marginTop: 3 }}
												maxLength={10}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
											/>
										</Item>
									}
									{!!this.state.emailError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													placeholder={strings('login.profile_distributor_email')}
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ emailError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.emailError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label>{strings('login.profile_distributor_email')}</Label>
											<Input
												keyboardType='email-address'
												style={{ marginTop: 3 }}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(email) => this.setState({ email })}
											/>
										</Item>
									}

									{!!this.state.addressError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													placeholder={strings('login.profile_distributor_address')}
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ addressError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.addressError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label>{strings('login.profile_distributor_address')}</Label>
											<Input
												style={{ marginTop: 3 }}
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
													placeholder={strings('login.profile_distributor_street')}
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ streetError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.streetError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label>{strings('login.profile_distributor_street')}</Label>
											<Input
												style={{ marginTop: 3 }}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(street) => this.setState({ street })}
											/>
										</Item>
									}

									{!!this.state.pinCodeError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													placeholder={strings('login.profile_distributor_pincode')}
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ pinCodeError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.pinCodeError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label>{strings('login.profile_distributor_pincode')}</Label>
											<Input
												keyboardType='number-pad'
												style={{ marginTop: 3 }}
												maxLength={6}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(pinCode) => this.setState({ pinCode })}
											/>
										</Item>
									}

									{/* <View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07 }}> */}
									{/* <Picker
											selectedValue={this.state.selectedBrandId}
											style={{ flex: 0.3 }}
											onValueChange={(brand) => this._setBrand(brand)}>
											{BrandItems}
										</Picker> */}
									{/* <Dropdown
											label="Select brand"
											data={this.state.brandArr}
											baseColor="(default: rgba(0, 0, 0, 5))"
											onChangeText={(brand) => this._setBrand(brand, this.state.brandArr)}
										/>
									</View> */}


									<View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07, marginTop: 20 }}>
										{/* <Dropdown
											label="Select country"
											data={this.countryList}
											baseColor="(default: rgba(0, 0, 0, 5))"
											onChangeText={(value) => { this._setCountry(value, this.countryList) }}
										/> */}

										<RNPicker
											dataSource={this.countryList}
											dummyDataSource={this.countryList}
											defaultValue={false}
											pickerItemTextStyle={styles.listTextViewStyle}
											pickerTitle={"Select Country"}
											showSearchBar={true}
											disablePicker={false}
											changeAnimation={"none"}
											searchBarPlaceHolder={"Search....."}
											showPickerTitle={true}
											selectedLabel={this.state.selectedTextCountry}
											placeHolderLabel={strings('login.pleaseSelCountry')}
											selectedValue={(index, item) => { this._setCountry(item.name, this.countryList), this.setState({ selectedTextCountry: item.name }) }}
										/>

									</View>

									<View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07, marginTop: 20 }}>
										{/* <Dropdown
											label="Select state"
											data={this.statesList}
											baseColor="(default: rgba(0, 0, 0, 5))"
											onChangeText={(states) => this._setStates(states, this.statesList)}
										/> */}

										<RNPicker
											dataSource={this.statesList}
											dummyDataSource={this.statesList}
											defaultValue={false}
											pickerItemTextStyle={styles.listTextViewStyle}
											pickerTitle={"Select State"}
											showSearchBar={true}
											disablePicker={false}
											changeAnimation={"none"}
											searchBarPlaceHolder={"Search....."}
											showPickerTitle={true}
											selectedLabel={this.state.selectedTextState}
											placeHolderLabel={strings('login.pleaseSelState')}
											selectedValue={(index, item) => { this._setStates(item.name, this.statesList), this.setState({ selectedTextState: item.name }) }}
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
											label="Select city"
											data={this.state.citiesArr}
											baseColor="(default: rgba(0, 0, 0, 5))"
											onChangeText={(city) => this._setCity(city, this.state.citiesArr)}
										/> */}

										<RNPicker
											dataSource={this.state.citiesArr}
											dummyDataSource={this.state.citiesArr}
											defaultValue={false}
											pickerItemTextStyle={styles.listTextViewStyle}
											pickerTitle={"Select City"}
											showSearchBar={true}
											disablePicker={false}
											changeAnimation={"none"}
											searchBarPlaceHolder={"Search....."}
											showPickerTitle={true}
											selectedLabel={this.state.selectedTextCity}
											placeHolderLabel={strings('login.pleaseSelCity')}
											selectedValue={(index, item) => { this._setCity(item.name, this.state.citiesArr), this.setState({ selectedTextCity: item.name }) }}
										/>
									</View>



									<Item floatingLabel>
										<Label>{strings('login.profile_distributor_companyName')}</Label>
										<Input
											style={{ marginTop: 3 }}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(companyName) => this.setState({ companyName })}
										/>
									</Item>

									{!!this.state.panNoError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													placeholder={strings('login.profile_distributor_panNo')}
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ panNoError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.panNoError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label>{strings('login.profile_distributor_panNo')}</Label>
											<Input
												style={{ marginTop: 3 }}
												maxLength={10}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(panNo) => this.setState({ panNo })}
											/>
										</Item>
									}

									<Item floatingLabel>
										<Label>{strings('login.profile_distributor_GSTno')}</Label>
										<Input
											style={{ marginTop: 3 }}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(gstNo) => this.setState({ gstNo })}
										/>
									</Item>

									<Content padder>
										<TouchableOpacity onPress={() => this._onPressButton()}>
											<View style={styles.buttonSignUp}>
												<LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.linearGradient}>
													<Text style={styles.buttonTextSignUp}>{strings('login.signup_button')}</Text>
												</LinearGradient>
											</View>
										</TouchableOpacity>
									</Content>

								</Form>
							</Content>
						</KeyboardAwareScrollView>
					</Card>
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
		// alignItems: 'center',
		backgroundColor: '#e43c22',
		borderRadius: 5,
		flex: 1
	},
	buttonTextSignUp: {
		margin: 10,
		color: 'white',
		textAlign: 'center',
		backgroundColor: 'transparent',
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
	linearGradient: {
		flex: 1,
		paddingLeft: 15,
		paddingRight: 15,
		borderRadius: 5
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