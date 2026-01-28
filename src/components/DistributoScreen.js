import React, { Component } from 'react';
import { Alert, Picker, BackHandler, View, TouchableOpacity, StatusBar } from 'react-native';
import { Text, ListItem, Header, Left, Body, Right, Title, Icon, Card, Button } from 'native-base';
import * as utilities from '../Utility/utilities';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../App';
import { strings } from '../locales/i18n';
import Loader from '../Utility/Loader';
import Modal from "react-native-modal";
import { Dropdown } from 'react-native-material-dropdown-v2';
import AsyncStorage from '@react-native-community/async-storage';

var data = [{
    value: 'All',
}, {
    value: 'Accepted',
}, {
    value: 'Pending',
}, {
    value: 'Rejected',
}];

export default class DistributorScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            loaderText: "Loading...",
            distributorId: "",
            offset: 0,
            noMoreDataError: "",
            dealerList: [],
            isModalVisible: false,
            address: "",
            city: "",
            state: "",
            pincode: ""
        }
        this._getAsyncData();
    }

    getListOfDealers = async (e) => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('distributorId', this.state.distributorId);
        formData.append('offset', 0);
        formData.append('userType', this.state.userType);
        formData.append('status', e == undefined || e == "All" ? "All" : e == "Accepted" ? 1 : e == "Pending" ? 0 : 2);
        if (this.props.languageControl) {
            formData.append('language', 'en');
        } else {
            formData.append('language', 'hi');
        }

        console.log(formData);
        var lUrl = URL + 'getDealersList';
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
                console.log(responseJson);
                this.setState({ loading: false, offset: responseJson.offset, noMoreDataError: "", dealerList: responseJson.dealersData })
            })
            .catch((error) => {
                this.setState({ loading: false, })
                console.log(error);
            });
    }
    async _getAsyncData() {
        await AsyncStorage.getItem('USERDATA', (err, result) => {		// USERDATA is set on SignUP screen
            var lData = JSON.parse(result);
            if (lData) {
                // this.distributorId = lData.data.id;
                this.setState({ distributorId: lData.data.id, userType: lData.data.userType }, () => {
                    this.getListOfDealers()
                })
            }
        });
    }
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: this.state.userType == 2 ? "#f9a61b" : "#e43c22" }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ alignItems: "center", flex: 1, }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>{strings('login.dealers')}</Title>
                    </Body>
                    <Right style={{ flex: 0.1 }} />
                </Header>
            )
        } else {
            return (
                <Header style={{ backgroundColor: this.state.userType == 2 ? "#f9a61b" : "#e43c22" }}>
                    <Left style={{ flex: 0.1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                            <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ alignItems: "center", flex: 1, }}>
                        <Title style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>{strings('login.dealers')}</Title>
                    </Body>
                    <Right style={{ flex: 0.1 }} />
                </Header>
            )
        }
    }
    confirmationApiCall = (item) => {
        Alert.alert(
            "Confirmation",
            "Approve or reject the dealer",
            [
                { text: "Accept", onPress: () => this.confirmApi(item, 1), style: 'cancel' },
                { text: "Reject", onPress: () => { this.confirmApi(item, 2) } },
                { text: "Decide Later", onPress: () => { } },
            ],
            { cancelable: false }
        );
    }
    modalHandle = (item) => {
        this.setState({ isModalVisible: !this.state.isModalVisible, address: item.address, city: item.city, state: item.state, pincode: item.pincode })
    }
    confirmApi = (item, tt) => {
        console.log("item");
        console.log(item);

        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('distributorId', this.state.distributorId);
        formData.append('dealerId', item.id);
        formData.append('isApproved', tt);

        console.log(formData);
        var lUrl = URL + 'approveRejectDealer';
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
                console.log(responseJson);
                this.getListOfDealers();
                this.setState({ loading: false, })
                utilities.showToastMsg(responseJson.message);
            })
            .catch((error) => {
                this.setState({ loading: false, })
                console.log(error);
            });
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                {this._showHeader()}
                <StatusBar backgroundColor={this.state.userType == 2 ? "#f9a61b" : "#e43c22"} barStyle="light-content" />

                <View style={{ marginHorizontal: 100 }}>
                    <Dropdown
                        label='All'
                        data={data}
                        onChangeText={(e) => { this.getListOfDealers(e) }}
                    />
                </View>

                {this.state.dealerList.length > 0 ? this.state.dealerList.map((item, key) => (
                    <Card style={{ height: item.is_approved == 0 ? 200 : 130, padding: 10, marginLeft: 10, marginRight: 10 }} key={key}>
                        <View style={{ flexDirection: "row" }}>
                            <Text>{strings('login.shopName')}: </Text>
                            <Text style={{ fontWeight: "bold" }}>{item.shop_name}</Text>
                            <Text style={{ flex: 1, opacity: 0.6, textAlign: "right", fontWeight: "bold", color: item.is_approved == 0 ? "orange" : item.is_approved == 1 ? "green" : "red" }}>{item.is_approved == 0 ? "Pending" : item.is_approved == 1 ? "Accepted" : "Rejected"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <Text>{strings('login.profile_screen_name_field')}: </Text>
                            <Text style={{ fontWeight: "bold" }}>{item.dealer_name}</Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <Text>{strings('login.mobileN')}: </Text>
                            <Text style={{ fontWeight: "bold" }}>{item.mobile_no}</Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <Text>{strings('login.profile_distributor_address')}: </Text>
                            <Text style={{ fontWeight: "bold" }}>{item.address} - </Text>
                            <TouchableOpacity onPress={() => this.modalHandle(item)}>
                                <Icon type="FontAwesome" name="info-circle" style={{ fontSize: 18, marginTop: 4, color: "#f9a61b" }} />
                            </TouchableOpacity>
                        </View>
                        {item.is_approved == 0 ?
                            <View style={{ marginTop: 30, alignSelf: "center", }}>
                                <Button style={{ backgroundColor: "green", borderRadius: 5 }} onPress={() => this.confirmationApiCall(item)}>
                                    <Text>{strings('login.actnButton:')} </Text>
                                </Button>
                            </View>
                            : null}
                    </Card>
                )) : <Text style={{ flex: 1, justifyContent: "center", textAlign: "center", color: "grey", fontSize: 20, textAlignVertical: "center" }}>No Dealers Found</Text>}

                <Modal isVisible={this.state.isModalVisible}>
                    <Card style={{ height: 180, padding: 10 }}>
                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                            <Text style={{ fontWeight: "bold", flex: 1, textAlign: "center", fontSize: 20 }}>{strings('login.profile_distributor_address')}</Text>
                            <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this.setState({ isModalVisible: !this.state.isModalVisible }) }}>
                                <Icon type="FontAwesome" name="times" style={{ fontSize: 25, color: 'red' }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: "#F2F2F2", marginTop: 10 }} />
                        <View style={{ flexDirection: "row", marginTop: 5, }}>
                            <Text style={{ fontWeight: "bold" }}>{strings('login.profile_distributor_address')} : </Text>
                            <Text style={{ fontWeight: "bold", color: "grey" }}>{this.state.address}</Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <Text style={{ fontWeight: "bold" }}>{strings('login.state')} : </Text>
                            <Text style={{ fontWeight: "bold", color: "grey" }}>{this.state.state}</Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <Text style={{ fontWeight: "bold" }}>{strings('login.city')} : </Text>
                            <Text style={{ fontWeight: "bold", color: "grey" }}>{this.state.city}</Text>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <Text style={{ fontWeight: "bold" }}>{strings('login.profile_screen_pincode_field')} : </Text>
                            <Text style={{ fontWeight: "bold", color: "grey" }}>{this.state.pincode}</Text>
                        </View>
                        <Text />
                    </Card>
                </Modal>
            </View>
        )
    }
}