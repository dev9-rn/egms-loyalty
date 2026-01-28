import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, ScrollView, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, Picker } from 'react-native';
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
import MyColors from '../../Utility/Colors';
var _ = require('lodash');
import RNPicker from "rn-modal-picker";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

class DealerProfileScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            loaderText: "Loading...",
            userType: '',
            dealerId: "",
            distributorCode: "",
            distributorName: "",
            shopName: "",
            mobileNo: "",
            email:"",
            address: "",
            state: "",
            city: "",
            pincode: "",
            stateList: [],
            cityList: []
        }
        this.getAsyncData();
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate('HomeScreen');
        return true;
    }

    getDealerData = async () => {
        this.setState({ loading: true });
        const formData = new FormData();
        formData.append('dealerId', this.state.dealerId);
        console.log(formData);
        var profileApiObj = new ProfileService();
        await profileApiObj.getDealerProfile(formData);
        this.setState({ loading: false });
        var lResponseData = profileApiObj.getRespData();
        this.setState({
            distributorCode: lResponseData.data.distributor_code, distributorName: lResponseData.data.dealer_name, shopName: lResponseData.data.shop_name,
            mobileNo: lResponseData.data.mobile_no, address: lResponseData.data.address, state: lResponseData.data.state, city: lResponseData.data.city,
            pincode: lResponseData.data.pincode,email: lResponseData.data.email
        })

    }
    async getAsyncData() {
        await AsyncStorage.multiGet(['USERDATA'], (err, result) => {
            var lData = JSON.parse(result[0][1]);
            if (lData) {
                this.setState({ userType: lData.data.userType, dealerId: lData.data.id }, () => {
                    this.getDealerData();
                })
            }
        });
    }
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: this.state.userType == 2 ? MyColors.dealerColor : MyColors.distributorColor }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ alignItems: "center" }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, marginLeft: -10 }}>{strings('login.profile_screen_title')}</Title>
                    </Body>
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: this.state.userType == 2 ?MyColors.dealerColor : MyColors.distributorColor }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ alignItems: "center" }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, marginLeft: -10 }}>{strings('login.profile_screen_title')}</Title>
                    </Body>
                </Header>
            )
        }
    }
    render() {
        return (
            <ScrollView style={{ flex: 1, }} keyboardShouldPersistTaps={"handled"}>
                {this._showHeader()}
                <StatusBar backgroundColor={this.state.userType == 2 ? MyColors.dealerColor : MyColors.distributorColor} barStyle="light-content" />
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                <Card style={{ width: "93%", flex: 1, marginTop: 15, alignSelf: "center" }}>
                    {/* <CardItem header style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', }}>
                        <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}> SignUp</Text>
                    </CardItem> */}

                    <Form style={{ marginTop: 10 }}>
                        <Item stackedLabel >
                            <Label style={{ color: "#3c24ae" }}>{strings('login.profile_distributor_distributor_code')}:</Label>
                            <Input disabled={true} value={this.state.distributorCode} onChangeText={(e) => this.setState({ distributorCode: e })} />
                        </Item>

                        <Item stackedLabel style={{ marginTop: 10 }}>
                            <Label style={{ color: "#3c24ae" }}>{strings('login.shopName')}:</Label>
                            <Input disabled={true} value={this.state.shopName} onChangeText={(e) => this.setState({ shopName: e })} />
                        </Item>

                        <Item stackedLabel style={{ marginTop: 10 }}>
                            <Label style={{ color: "#3c24ae" }}>{strings('login.dealerName')}:</Label>
                            <Input disabled={true} value={this.state.distributorName} onChangeText={(e) => this.setState({ distributorName: e })} />
                        </Item>

                        <Item stackedLabel style={{ marginTop: 10 }}>
                            <Label style={{ color: "#3c24ae" }}>{strings('login.mobileN')}:</Label>
                            <Input disabled={true} keyboardType={"number-pad"} maxLength={10} value={this.state.mobileNo} onChangeText={(e) => this.setState({ mobileNo: e })} />
                        </Item>

                        <Item stackedLabel style={{ marginTop: 10 }}>
                            <Label style={{ color: "#3c24ae" }}>{strings('login.profile_distributor_email')}:</Label>
                            <Input disabled={true}  value={this.state.email} onChangeText={(e) => this.setState({ email: e })} />
                        </Item>

                        <Item stackedLabel style={{ marginTop: 10 }}>
                            <Label style={{ color: "#3c24ae" }}>{strings('login.profile_distributor_address')}:</Label>
                            <Input disabled={true} value={this.state.address} onChangeText={(e) => this.setState({ address: e })} />
                        </Item>

                        <Label style={{ color: "#3c24ae", paddingLeft: 15, marginTop: 20, fontSize: 16 }}>{strings('login.state')}:</Label>
                        <View style={{ width: 300, alignSelf: "center", marginTop: 10 }}>
                            <RNPicker
                                dataSource={this.state.stateList}
                                dummyDataSource={this.state.stateList}
                                defaultValue={true}
                                pickerTitle={"Select State"}
                                pickerItemTextStyle={{
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: 'grey',
                                    marginVertical: 10,
                                    marginHorizontal: 10,
                                    textAlign: "left"
                                }}
                                showSearchBar={true}
                                disablePicker={true}
                                changeAnimation={"none"}
                                searchBarPlaceHolder={"Search....."}
                                showPickerTitle={true}
                                selectedLabel={this.state.state}
                                placeHolderLabel={"Select State"}
                                selectedValue={(index, item) => { this.cityListApiCall(item.id), this.setState({ state: item.name }) }}
                            />
                        </View>

                        <Label style={{ color: "#3c24ae", paddingLeft: 15, marginTop: 20, fontSize: 16 }}>{strings('login.city')}:</Label>
                        <View style={{ width: 300, alignSelf: "center", marginTop: 10 }}>
                            <RNPicker
                                dataSource={this.state.cityList}
                                dummyDataSource={this.state.cityList}
                                defaultValue={true}
                                pickerTitle={"Select City"}
                                pickerItemTextStyle={{
                                    color: "#000",
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: 'grey',
                                    marginVertical: 10,
                                    flex: 0.9,
                                    marginHorizontal: 10,
                                    textAlign: "left",
                                }}
                                showSearchBar={true}
                                disablePicker={true}
                                changeAnimation={"none"}
                                searchBarPlaceHolder={"Search....."}
                                showPickerTitle={true}
                                selectedLabel={this.state.city}
                                placeHolderLabel={"Select City"}
                                selectedValue={(index, item) => { this.setState({ cityId: item.id, city: item.name }) }}
                            />
                        </View>

                        <Item stackedLabel style={{ marginTop: 10 }}>
                            <Label style={{ color: "#3c24ae" }}>{strings('login.profile_screen_pincode_field')}:</Label>
                            <Input disabled={true} value={this.state.pincode} onChangeText={(e) => this.setState({ pincode: e })} />
                        </Item>

                        <Text />
                    </Form>
                </Card>
            </ScrollView>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        languageControl: state.VerifierReducer.languageEnglish,
        enableDarkTheme: state.VerifierReducer.enableDarkTheme
    }
}
export default connect(mapStateToProps, null)(DealerProfileScreen)