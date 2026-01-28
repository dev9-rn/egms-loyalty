import React, { Component } from 'react';
import { Dimensions, Alert,  Toast, Platform, StyleSheet, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Header, Left, Body, Content, Card, Form, Label, Text, Title, Icon, Item, Input, CardItem } from 'native-base';
import { URL, APIKEY, ACCESSTOKEN } from '../../App';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Loader from '../../Utility/Loader';
import { Col, Row, Grid } from 'react-native-easy-grid';
// import { Dropdown } from 'react-native-material-dropdown';
import LinearGradient from 'react-native-linear-gradient';
import * as utilities from '../../Utility/utilities';
var _ = require('lodash');
import RNPicker from "rn-modal-picker";
import { strings } from '../../locales/i18n';
import AsyncStorage from '@react-native-community/async-storage';

export default class MechanicSignupForm extends Component {
    constructor(props) {
        super(props);
        this.statesList = [];
        this.state = {
            loaderText: 'Loading...',
            showHideLoading: false,
            borderBottomColorPassword: '#757575',
            borderBottomColorUserName: '#757575',
            name: '',
            shopName: '',
            state: '',
            city: '',
            pinCode: '',
            panNo: '',
            nameError: '',
            shopNameError: '',
            pinCodeError: '',
            panNoError: '',
            stateError: '',
            CityError: '',
            cityList: [],
            mobileNo: '',
            phoneNumberError: '',
            selectedTextState: '',
            selectedTextCity: ''
        }
    }
    componentDidMount = () => {
        const formData = new FormData();
        formData.append('countryId', '101');
        this.getStatesByCountry(formData);
    }
    async getStatesByCountry(pFormData) {
        this.setState({ showHideLoading: true })
        var lUrl = URL + 'getStatesByCountry';
        await fetch(lUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': 'pFqDf7vuaOQ[87yF6D:=2OqjE*wa:0'
            },
            body: pFormData
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ showHideLoading: false })
                for (var i = 0; i < responseJson.states.length; i++) {
                    var dataObj = {};
                    dataObj.id = parseInt(responseJson.states[i].id);
                    dataObj.name = responseJson.states[i].name;
                    this.statesList.push(dataObj);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };
    _setCity(city, citiesList) {
        let idForCity = _.filter(citiesList, { name: city })[0].id
        this.setState({ city: idForCity });
    }
    _setStates(pStates, statesList) {
        if (pStates === "Select State") {
            this.setState({ selectedTextCity: '', cityList: [] })
            return;
        }
        let idForState = _.filter(statesList, { name: pStates })[0].id
        this.setState({ cityList: [], state: idForState, cityList: [], selectedTextCity: '' })
        const formData = new FormData();
        formData.append('stateId', idForState);
        this.getCitiesByState(formData)
    }
    async getCitiesByState(pFormData) {
        this.setState({ showHideLoading: true })
        var lUrl = URL + 'getCitiesByState';
        await fetch(lUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': 'pFqDf7vuaOQ[87yF6D:=2OqjE*wa:0'
            },
            body: pFormData
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ showHideLoading: false })
                for (var i = 0; i < responseJson.cities.length; i++) {
                    var dataObj = {};
                    dataObj.id = parseInt(responseJson.cities[i].id);
                    dataObj.name = responseJson.cities[i].name;
                    this.state.cityList.push(dataObj);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#e43c22', display: 'flex' }}>
                    <Grid>
                        <Col style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('MechanicLoginScreen')}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF' }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={15} style={{ justifyContent: 'center', paddingRight: 20 }}>
                            <Title style={{ color: '#FFFFFF' }}>{strings('login.SeQr')}</Title>
                        </Col>
                    </Grid>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: '#e43c22' }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('MechanicLoginScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 0.9, alignItems: 'center', }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, marginLeft: -10 }}>{strings('login.SeQr')}</Title>
                    </Body>
                </Header>
            )
        }
    }
    _validateMobileNumber() {
        let lPhoneNumber = this.state.mobileNo;
        let res = '';
        res = utilities.checkMobileNumber(lPhoneNumber);
        if (!res || lPhoneNumber.trim().length < 10) {
            this.setState({ phoneNumberError: strings('login.phnInvalid') });
        }
        return res;
    }
    _onPressButton = () => {
        console.log(this.state);
        // ifisValidMobileNumber = this._validateMobileNumber();

        if (!this.state.name) {
            this.setState({ nameError: strings('login.nameError') })
            return;
        } else if (!this.state.shopName) {
            this.setState({ shopNameError: strings('login.shopError') })
            return;
        } else if (!this.state.mobileNo) {
            this.setState({ phoneNumberError: strings('login.phnError') })
            return;
        } else if (!this._validateMobileNumber()) {
            this.setState({ phoneNumberError: 'Phone no is not valid.' })
            return;
        }
        else if (!this.state.state) {
            Alert.alert(
                strings('login.ScanScreenAlertTitle'),
                strings('login.stateError'),
                [
                    { text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
            this.setState({ stateError: strings('login.stateError') })
            return;
        } else if (!this.state.city) {
            Alert.alert(
                strings('login.ScanScreenAlertTitle'),
                strings('login.cityError'),
                [
                    { text: strings('login.OK'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
            this.setState({ CityError: strings('login.cityError') })
            return;
        } else if (!this.state.pinCode) {
            this.setState({ pinCodeError: strings('login.PinCodeError') })
            return;
        } else if (!this.state.panNo) {
            this.setState({ panNoError: strings('login.pandError') })
            return;
        } else {
            this.signUpApiCall();
        }
    }
    _validatePanNo() {
        let lPanNo = this.state.panNo;
        let res = '';
        res = utilities.checkPanNo(lPanNo);
        if (!res) {
            return false;
        } else {
            return true;
        }
    }
    signUpApiCall = () => {
        this.setState({ showHideLoading: true })
        let panNoValid = this._validatePanNo();

        if (panNoValid) {
            this.setState({ panNoError: '' })
            const formData = new FormData();
            formData.append('name', this.state.name);
            formData.append('mobileNo', this.state.mobileNo);
            formData.append('shopName', this.state.shopName);
            formData.append('pinCode', this.state.pinCode);
            formData.append('stateId', this.state.state);
            formData.append('cityId', this.state.city);
            formData.append('panNo', this.state.panNo);

            var lUrl = URL + 'registerMechanic';
            fetch(lUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application\/json',
                    'Content-Type': 'multipart\/form-data',
                    'apikey': APIKEY,
                    'accesstoken': ACCESSTOKEN
                },
                body: formData,
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({ showHideLoading: false })
                    console.log(JSON.stringify(responseJson));
                    if (responseJson.status == 200) {
                        AsyncStorage.setItem('OTPDATA', JSON.stringify(responseJson));
                        this.props.navigation.navigate('MechanicOtpVerification', { mobileNumber: this.state.mobileNo });

                        // Alert.alert(
                        //     '',
                        //     responseJson.message,
                        //     [
                        //         { text: 'OK', onPress: () => this.props.navigation.navigate('MechanicLoginScreen') },
                        //     ],
                        //     { cancelable: false }
                        // )
                    } else if (responseJson.status == 409) {
                        utilities.showToastMsg(responseJson.message);
                    } else if (responseJson.status == 422) {
                        alert(utilities.showToastMsg(responseJson.message))
                    } else if (responseJson.status == 400) {
                        alert(utilities.showToastMsg(responseJson.message))
                    }
                })
                .catch((error) => {
                    this.setState({ showHideLoading: false })
                    console.error(error);
                });
        } else {
            this.setState({ showHideLoading: false, panNoError: strings('login.panNoInvalid') })
            return;
        }

    };
    render() {
        return (
            <View style={{ flex: 1 }}>
                {this._showHeader()}
                {this.state.showHideLoading ? <Loader loading={this.state.loading} text={this.state.loaderText} /> : null}
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

                                    {!!this.state.shopNameError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_shopName_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ shopNameError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.shopNameError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label>{strings('login.profile_screen_shopName_field')}</Label>
                                            <Input
                                                style={{ marginTop: 3 }}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(shopName) => this.setState({ shopName })}
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
                                                onChangeText={(mobileNo) => this.setState({ mobileNo })}
                                            />
                                        </Item>
                                    }

                                    <View style={{ width: '80%', marginLeft: Dimensions.get('window').width * 0.07, marginTop: 40 }}>
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
                                            pickerTitle={"Select State"}
                                            pickerItemTextStyle={styles.listTextViewStyle}
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
                                        {/* <Dropdown
                                            label="Select city"
                                            data={this.state.cityList}
                                            baseColor="(default: rgba(0, 0, 0, 5))"
                                            onChangeText={(city) => this._setCity(city, this.state.cityList)}
                                        /> */}
                                        <RNPicker
                                            dataSource={this.state.cityList}
                                            dummyDataSource={this.state.cityList}
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
                                            selectedValue={(index, item) => { this._setCity(item.name, this.state.cityList), this.setState({ selectedTextCity: item.name }) }}
                                        />
                                    </View>


                                    {!!this.state.pinCodeError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_pincode_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ pinCodeError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.pinCodeError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label>{strings('login.profile_screen_pincode_field')}</Label>
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

                                    {!!this.state.panNoError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder={strings('login.profile_screen_panNo_field')}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ panNoError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.panNoError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label>{strings('login.profile_screen_panNo_field')}</Label>
                                            <Input
                                                style={{ marginTop: 3 }}
                                                maxLength={10}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(panNo) => this.setState({ panNo })}
                                            />
                                        </Item>
                                    }

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
}
const styles = StyleSheet.create({
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
    buttonSignUp: {
        marginTop: 10,
        marginBottom: 50,
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
        textAlign: "left",
    },
})