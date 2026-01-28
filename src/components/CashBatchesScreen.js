import React, { Component } from 'react';
import { StatusBar, StyleSheet, View, TouchableOpacity, Alert, ScrollView, BackHandler, PermissionsAndroid, Platform, Linking } from 'react-native';
import { Text, ListItem, Header, Left, Body, Right, Card, Title, Button, Icon, TabHeading } from 'native-base';
import Loader from '../Utility/Loader';
import * as utilities from '../Utility/utilities';
import moment from 'moment';
import { URL, HEADER, APIKEY, ACCESSTOKEN } from '../../src/App';
import { Col, Grid } from "react-native-easy-grid";
import DatePicker from 'react-native-date-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { strings } from '../locales/i18n';
import { connect } from 'react-redux';
var _ = require('lodash');
// import { Dropdown } from 'react-native-material-dropdown-v2';
import Modal from "react-native-modal";
import RNFetchBlob from 'rn-fetch-blob';
import { writeFile, readFile } from 'react-native-fs';
import XLSX from 'xlsx';
// import ReactExport from "react-export-excel";
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import MyColors from '../Utility/Colors';
import AsyncStorage from '@react-native-community/async-storage';

class CashBatchesScreen extends Component {

    constructor(props) {
        super(props);
        this.requestCameraPermission();
        this.redeemHistoryCash = this.props.redeemCash;
        this.monthList = [{ id: '1', 'value': strings('login.homeScreen_january') }, { id: '2', 'value': strings('login.homeScreen_feb') }, { id: '3', 'value': strings('login.homeScreen_march') }, { id: '4', 'value': strings('login.homeScreen_april') },
        { id: '5', 'value': strings('login.homeScreen_may') }, { id: '6', 'value': strings('login.homeScreen_june') }, { id: '7', 'value': strings('login.homeScreen_july') }, { id: '8', 'value': strings('login.homeScreen_aug') }, { id: '9', 'value': strings('login.homeScreen_sep') },
        { id: '10', 'value': strings('login.homeScreen_oct') }, { id: '11', 'value': strings('login.homeScreen_nov') }, { id: '12', 'value': strings('login.homeScreen_dec') }]
        this.yearList = [];
        this.state = {
            data: this.props.redeemCash,
            // data: redeemHistoryCash,
            deleteItem: false,
            loading: false,
            isDateTimePickerVisible: false,
            isDateTimePickerVisible1: false,
            // frmDate: moment().locale('en').clone().startOf('month').format("DD-MM-YYYY"),
            // toDate: moment().locale('en').format('DD-MM-YYYY'),
            frmDate: this.props.navigation.state.params.frmDate ? this.props.navigation.state.params.frmDate : moment().locale('en').clone().startOf('month').format("DD-MM-YYYY"),
            toDate: this.props.navigation.state.params.toDate ? this.props.navigation.state.params.toDate : moment().locale('en').format('DD-MM-YYYY'),
            fromDateError: '',
            toDateError: '',
            carpenterId: '',
            lResponseData: '',
            redeemHistory: [],
            redeemHistoryCash: [],
            redeemHistoryScheme: [],
            redeemHistoryCashArr: [],
            loaderText: 'Please wait...',
            offset: 0,
            noMoreDataError: '',
            userType: '',
            selectedMonthId: JSON.stringify(new Date().getMonth() + 1),
            selectedYear: new Date().getFullYear(),
            selectedMonthName: '',
            isModalVisible: false,
            dataToShowOnModal: {},
            accesstoken:'',
            open1:false,
            open2:false
            
        };
    }
    _getYearList = () => {
        let currentYear = new Date().getFullYear();
        var j = 0
        for (var i = 0; i < 1; i++) {
            var dataObj = {};
            dataObj.id = j++;
            dataObj.value = currentYear--;
            this.yearList.push(dataObj)
        }
    }
    downloadTheFile = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('carpenterId', this.state.carpenterId);
        // formData.append('year', this.state.selectedYear);
        formData.append('startDate', this.state.frmDate);
        formData.append('endDate', this.state.toDate);
        formData.append('userType', this.state.userType);
        formData.append('language','en');

        fetch("https://seqrloyalty.com/magicgrip/api/exportCashBatchReportCarpenter", {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                'accesstoken': this.state.accesstoken
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ loading: false })
                console.log("=-=-=-=------------------xxxxxx----=-=-=-=-=-=-==-=-=-==---file");
                console.log(responseJson);
                Alert.alert(
                    "Success",
                    responseJson.message,
                    [
                        // { text: "Ok", onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        { text: "OK", onPress: () => { 
                            Platform.OS == "android" ?
                            this.downloadFile(responseJson.reportLink) 
                            :
                            this.showFile(responseJson.reportLink)
                        } },
                        // { text: "OK", onPress: () => { this.downloadFile("https://seqrloyalty.com/karigar/uploads/excels/mobile/Karigar Credit Batch SCUBE01 05_08_2021_11_11_47_.xlsx") } },
                    ],
                    { cancelable: false }
                );

            })
            .catch((error) => {
                this.setState({ loading: false })
                console.log(error);
            });
    }
    getLocalPath(url) {
        const filename = url.split('/').pop();
        if(Platform.OS == "android")
        {
            return `${RNFS.DownloadDirectoryPath}/${filename}`;
        }
        else{
             return `${RNFS.DocumentDirectoryPath}/${filename}`;
        }
       
    }
    async downloadFile(fileUrl) {
        this.setState({ loading: true });
        const url = fileUrl;
        const localFile = this.getLocalPath(url);
        const options = {
            fromUrl: encodeURI(url),
            toFile: localFile,
            fileCache : true
        };
        RNFS.downloadFile(options).promise
            .then(async () => {
                this.setState({ loading: false });
                console.log(localFile);
                if(Platform.OS == "android")
              {
                FileViewer.open(localFile,{
                    displayName: "Documents",
                    showOpenWithDialog: true,
                    showAppsSuggestions: true,

                })
                .catch(() => {
                    Alert.alertWithType("warn", "Sorry", "Cannot open file...", 5000);
                  });
                }
                else{
                    console.log("else");
                    try{
                      

                    }
                    catch (e) {
                        console.warn(TAG, "An error occurred", JSON.stringify(e));
                    }
                }
            
               
            })
            .catch(error => {
                this.setState({ animating: false, loading: false });
                console.warn("Error in downloading file" + error);
            });
    }

    /////////////////
    async showFile (fileUrl) {
        const ext = fileUrl.split(/[#?]/)[0].split('.').pop().trim()
        return new Promise((resolve, reject) => {
          RNFetchBlob.config({
             fileCache: true,
             path: dirs.DocumentDir + "/Magicgrip.xls",
             appendExt: ext
          })
            .fetch('GET', encodeURI(fileUrl))
            .then(res => {
              console.log('The file saved to ', res.path())
              const downloadFile =
                Platform.OS === 'android' ? 'file://' + res.path() : '' + res.path()
              setTimeout(() => {
                FileViewer.open(downloadFile, { showOpenWithDialog: true, onDismiss: () => RNFetchBlob.fs.unlink(res.path()) })
              }, 350)
              resolve(true)
            })
            .catch(err => {
              console.log(err)
              reject(err)
            })
        })
      }
    /////////////////
    requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "App Storage Permission",
                    message:
                        "App needs access to your storage " +
                        "so you can download file.",
                    // buttonNeutral: "Ask Me Later",
                    // buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the camera");
            } else {
                console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    };
    showDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: true, isDateTimePickerVisible1: false });
    };
    showDateTimePicker1 = () => {
        this.setState({ isDateTimePickerVisible: false, isDateTimePickerVisible1: true });
    };

    hideDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: false, isDateTimePickerVisible1: false });
    };
    handleBackPress = () => {
        this.props.navigation.navigate('HomeScreen');
        return true;
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }
    componentDidMount = () => {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this._getAsyncData();
        if (this.state.selectedMonthId) {
            let mnth = _.filter(this.monthList, { id: this.state.selectedMonthId })[0].value
            this.setState({ selectedMonthName: mnth });
        }
        this._getYearList();
    }
    async _getAsyncData() {
        await AsyncStorage.multiGet(['USERDATA','ACCESSTOKEN'], (err, result) => {		// USERDATA is set on SignUP screen
            var lData = JSON.parse(result[0][1]);
            this.setState({ accesstoken : result[1][1] })
            if (lData) {
                // this.distributorId = lData.data.id;
                this.setState({ carpenterId: lData.data.id, userType: lData.data.userType }, () => {
                    this.callApi()
                })
            }
        });
    }
    callApi = () => {
        this.setState({ loading: true })
        const formData = new FormData();

        formData.append('carpenterId', this.state.carpenterId);
        formData.append('startDate', this.state.frmDate);
        formData.append('endDate', this.state.toDate);
        // formData.append('year', this.state.selectedYear);
        // formData.append('toDate', this.state.toDate);
        // formData.append('offset', this.state.offset);
        // formData.append('redeemType', 'Cash');
        formData.append('userType', this.state.userType);
        if (this.props.languageControl) {
            formData.append('language', 'en');
        } else {
            formData.append('language', 'hi');
        }
        console.log(formData);
        console.log(APIKEY);
        console.log(ACCESSTOKEN);


        var lUrl = URL + 'getCashBatchesCarpenter';
        fetch(lUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                'accesstoken': this.state.accesstoken
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ loading: false })
                console.log("=-=-=-=------------------xxxxxx----=-=-=-=-=-=-==-=-=-==---");
                console.log(responseJson);

                // this.setState({ offset: responseJson.offset })
                this.dataVerify(responseJson)
            })
            .catch((error) => {
                this.setState({ loading: false })
                console.log(error);
            });
    }
    dataVerify = (lResponseData) => {
        this.setState({ loading: false })
        if (!lResponseData) {
            utilities.showToastMsg('Something went wrong. Please try again later');
        } else if (lResponseData.status == 500 || lResponseData.status == 400) {
            this.setState({ noMoreDataError: "" })
            utilities.showToastMsg(lResponseData.message);
            this.setState({ noMoreDataError: "" })
        } else if (lResponseData.status == 403) {
            AsyncStorage.clear();
            utilities.showToastMsg(lResponseData.message);
            this.props.navigation.navigate('LoginScreen');
            return;
        } else if (lResponseData.status == 404) {
            this.setState({ noMoreDataError: strings('login.noMoreData') });
            return;
        }
        else if (lResponseData.status == 200) {
            console.log("lResponseData.batchesData");
            console.log(lResponseData.batchesData);

            this.setState({ noMoreDataError: "", redeemHistoryCashArr: lResponseData.batchesData })
        } else {
            utilities.showToastMsg('Something went wrong. Please try again later');
            this.setState({ redeemHistoryCash: [] })
        }
    }
    renderFooter = () => {
        return (
            <View>
                {this.state.noMoreDataError ?
                    <Text style={{ color: 'red', textAlign: 'center', }}>{this.state.noMoreDataError}</Text>
                    : <Text></Text>}
            </View>
        )
    };
    handleLoadMore = () => {
        if (!this.state.noMoreDataError) {
            this.callApi();
        }
    };
    openData = (data) => {
        this.setState({ isModalVisible: !this.state.isModalVisible, dataToShowOnModal: data })
    }
    _displayList() {
        if (this.state.redeemHistoryCashArr.length <= 0) {
            return (
                <View style={styles.noRecord}>
                    <Text style={{ fontSize: 28, color: this.props.enableDarkTheme ? 'white' : '#BDBDBD' }}>{strings('login.NoHistory_Error')}</Text>
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white', marginTop: 10 }}>
                    <ScrollView>
                        {this.state.redeemHistoryCashArr.map((item, key) => (
                            <Card key={key} style={{ padding: 10, height: 125 }}>
                                <View style={{ flexDirection: "row", }}>
                                    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
                                        <Text style={{ fontWeight: "bold" }}>{strings('login.batch')}: </Text>
                                        <Text style={{ color: "grey" }}>#{item.batch_number}</Text>
                                    </View>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", }}>
                                        <Text style={{ fontWeight: "bold" }}>{strings('login.status')}: </Text>
                                        <Text style={{ color: item.status == "Pending" ? "red" : "green", opacity: 0.5 }}>{item.status}</Text>

                                        {item.status != "Pending" ?
                                            <View style={{ flexDirection: "row" }}>
                                                <Text style={{ color: "grey", }}> - </Text>
                                                <TouchableOpacity style={{ justifyContent: "flex-end" }} onPress={() => { this.openData(item) }}>
                                                    <Icon type="FontAwesome" name="info-circle" style={{ fontSize: 18, }} />
                                                </TouchableOpacity>
                                            </View> : null}
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                                    <Text style={{ fontWeight: "bold" }}>{strings('login.totalScanCo')}: </Text>
                                    <Text style={{ color: "grey" }}>{item.total_coupons_scanned}</Text>
                                </View>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 3 }}>
                                    <Text style={{ fontWeight: "bold" }}>{strings('login.totlAmnt')}: </Text>
                                    <Text style={{ color: "grey" }}>{item.total_amount}</Text>
                                </View>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 3, }}>
                                    <Text style={{ fontWeight: "bold" }}>{strings('login.range')}: </Text>
                                    <Text style={{ color: "grey" }}>{moment(item.start_date).format("DD-MM-YYYY")} to {moment(item.end_date).format("DD-MM-YYYY")}</Text>
                                </View>
                            </Card>
                        ))}
                    </ScrollView>
                </View>
            )
        }
    }
    _setMonth(month, monthList) {
        if (monthList) {
            let idForMonth = _.filter(monthList, { value: month })[0].id
            this.setState({ selectedMonthId: idForMonth }, () => this.callApi());
        }
    }
    _setYear(year, yearList) {
        this.setState({ redeemHistoryCashArr: [] }, () => {
            if (yearList) {
                let removedYear = _.filter(yearList, { value: year })[0].value
                this.setState({ selectedYear: removedYear }, () => {
                    this.callApi()
                });
            }
        })
    }

    handleDatePicked = date => {
        let a = moment(date, 'DD-MM-YYYY');
        let b = moment(this.state.toDate, 'DD-MM-YYYY');
        this.setState({ redeemHistoryCashArr: [] }, () => {
            if (moment(a).isAfter(b)) {
                this.setState({ fromDateError: 'FromDate cannot be greater than toDate.', noMoreDataError: '',open1:false })
            } else {
                this.forceUpdate();
                this.setState({ fromDateError: '', toDateError: '', frmDate: a.format("DD-MM-yyyy"), frmDatePass: date,open1:false }, () => {
                    this.callApi();
                })
            }
        })
    };
    handleDatePicked1 = date => {
        console.log(date);
        console.log("=-=-=-=-=-=-=-=-=-=-=-=----=-======-=-=-=-=-=-=-=-==-=-=-=-=-=");
        this.setState({ redeemHistoryCashArr: [] }, () => {
            let a = moment(date, 'DD-MM-YYYY');
            let b = moment(this.state.frmDate, 'DD-MM-YYYY');
            if (a < b) {
                this.setState({ toDateError: strings('login.FromDateError'), noMoreDataError: '',open2:false })
            } else {
                this.setState({ toDate: a.format("DD-MM-yyyy"), toDateError: '', fromDateError: '', toDatePass: date,open2:false }, () => {
                    this.callApi();
                })
            }
        })
    };

    render() {
        if (!this.props.languageControl) {
            this.monthList = [{ id: '1', 'value': strings('login.homeScreen_january') }, { id: '2', 'value': strings('login.homeScreen_feb') }, { id: '3', 'value': strings('login.homeScreen_march') }, { id: '4', 'value': strings('login.homeScreen_april') },
            { id: '5', 'value': strings('login.homeScreen_may') }, { id: '6', 'value': strings('login.homeScreen_june') }, { id: '7', 'value': strings('login.homeScreen_july') }, { id: '8', 'value': strings('login.homeScreen_aug') }, { id: '9', 'value': strings('login.homeScreen_sep') },
            { id: '10', 'value': strings('login.homeScreen_oct') }, { id: '11', 'value': strings('login.homeScreen_nov') }, { id: '12', 'value': strings('login.homeScreen_dec') }]
        }
        else {
            this.monthList = [{ id: '1', 'value': strings('login.homeScreen_january') }, { id: '2', 'value': strings('login.homeScreen_feb') }, { id: '3', 'value': strings('login.homeScreen_march') }, { id: '4', 'value': strings('login.homeScreen_april') },
            { id: '5', 'value': strings('login.homeScreen_may') }, { id: '6', 'value': strings('login.homeScreen_june') }, { id: '7', 'value': strings('login.homeScreen_july') }, { id: '8', 'value': strings('login.homeScreen_aug') }, { id: '9', 'value': strings('login.homeScreen_sep') },
            { id: '10', 'value': strings('login.homeScreen_oct') }, { id: '11', 'value': strings('login.homeScreen_nov') }, { id: '12', 'value': strings('login.homeScreen_dec') }]
        }
        return (
            <View style={{ flex: 1, backgroundColor: this.props.enableDarkTheme ? '#1a1a1a' : 'white' }}>
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                <Header style={{ backgroundColor: MyColors.distributorColor, borderBottomWidth: 1 }}>
                    <Left style={{ flex: 0.2 }}>
                        <TouchableOpacity onPress={() => { this.props.navigation.navigate("HomeScreen") }}>
                            <Icon type="FontAwesome5" name="arrow-left" style={{ fontSize: 20, color: '#FFFFFF', paddingRight: 10 }} />
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ flex: 1, alignItems: 'center' }}>
                        <Title style={{ color: 'white', fontSize: 16 }}>{strings('login.cashbash')}</Title>
                    </Body>
                    <Right style={{ flex: 0.2 }}>
                        {this.state.redeemHistoryCashArr.length > 0 ?
                            <TouchableOpacity style={{}} onPress={() => { this.downloadTheFile() }}>
                                {/* <Icon type="FontAwesome5" name="file-download" style={{ fontSize: 20, color: "#e95f49" }} /> */}
                                <Icon type="FontAwesome5" name="file-download" style={{ fontSize: 20, color: "white", marginRight: 10 }} />
                            </TouchableOpacity>
                            : null}
                    </Right>
                </Header>
                <StatusBar backgroundColor={MyColors.distributorColor} barStyle="light-content" />

                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                    <View style={{flex:1,flexDirection: "row" }}>
                        <Text style={{ fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black', marginTop: 15 }}>{strings('login.coupon_history_fromDate')} : </Text>
                        <View style={{ marginTop: 15,  }}>

                            {/* <DatePicker
                                date={this.state.frmDate}
                                confirmBtnText="Select"
                                cancelBtnText="Cancel"
                                mode="date"
                                format="DD-MM-YYYY"
                                locale={moment.locale('en')}
                                maxDate={moment().format('DD-MM-YYYY')}
                                showIcon={false}
                                // onCancel={ this.hideDateTimePicker }
                                onConfirm={(date) => { this.handleDatePicked(date) }}
                                customStyles={{
                                    dateInput: {
                                        borderWidth: 0,
                                        alignItems: 'flex-start',
                                        // marginRight: this.props.enableDarkTheme ? 65 : 0,
                                        backgroundColor: 'white',
                                    }
                                }}
                                style={{ width: 100 }}
                            /> */}
                             {/* <Button  title="Open" onPress={() => this.setState({open:true}) } /> */}
                             <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this.setState({ open1: true }) }}>
                             <Text onPress={() => { this.setState({ open1: true })} }  style={{ color:"#000000"}}>{this.state.frmDate}</Text>
                             </TouchableOpacity>
                            <DatePicker
                                modal
                                mode="date"
                                open={this.state.open1}
                                date={new Date()}
                                maximumDate={new Date()}
                                color="#000000"
                                textColor="#000000"
                                onConfirm={(date) => {
                                    this.handleDatePicked(date) 
                                }}
                                onCancel={() => {
                                // setOpen(false)
                                this.setState({ open1: false})
                                }}
                                
                            />
                           
                        </View>
                    </View>
                    <View style={{ flex:1,flexDirection: "row" }}>
                        <Text style={{ fontWeight: 'bold', color: this.props.enableDarkTheme ? 'white' : 'black', marginTop: 15 }}>{strings('login.coupon_history_toDate')} : </Text>
                        <View style={{ marginTop: 15, }}>
                            {/* <DatePicker
                                date={this.state.toDate}
                                confirmBtnText="Select"
                                cancelBtnText="Cancel"
                                // date={moment().clone().startOf('month').format("YYYY-MM-DD")}
                                mode="date"
                                format="DD-MM-YYYY"
                                locale={moment.locale('en')}
                                maxDate={moment().format('DD-MM-YYYY')}
                                showIcon={false}
                                onDateChange={(date) => { this.handleDatePicked1(date) }}
                                customStyles={{
                                    dateInput: {
                                        borderWidth: 0,
                                        alignItems: 'flex-start',
                                        // marginRight: this.props.enableDarkTheme ? 65 : 0,
                                        backgroundColor: 'white'
                                    }
                                }}
                                style={{ width: 100 }}
                            /> */}
                             <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this.setState({ open2: true }) }}>
                             <Text style={{ color:"#000000"}}>{this.state.toDate}</Text>
                             </TouchableOpacity>
                              <DatePicker
                                modal
                                mode="date"
                                open={this.state.open2}
                                date={new Date()}
                                maximumDate={new Date()}
                                color="#000000"
                                textColor="#000000"
                                onConfirm={(date) => {

                                    this.handleDatePicked1(date) 
                                }}
                                onCancel={() => {
                                // setOpen(false)
                                this.setState({ open2: false})
                                }}
                            />
                        </View>
                    </View>
                </View>
                {this.state.fromDateError ?
                    <View style={{ marginTop: 15, marginLeft: 20 }}>
                        <Text style={{ color: 'red' }}>{this.state.fromDateError}</Text>
                    </View>
                    : <View></View>}
                {this.state.toDateError ?
                    <View style={{ marginTop: 15, marginLeft: 20 }}>
                        <Text style={{ color: 'red' }}>{this.state.toDateError}</Text>
                    </View>
                    : <View></View>}
                <View style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 20, }} />

                {/* <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", paddingHorizontal: 10 }}>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Dropdown
                            label={JSON.stringify(new Date().getFullYear())}
                            // labelFontSize={0}
                            // labelTextStyle={{ fontSize: 0, display: "none" }}
                            style={{ color: this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))", }}
                            data={this.yearList.reverse()}
                            baseColor={this.props.enableDarkTheme ? 'white' : "(default: rgba(0, 0, 0, 5))"}
                            onChangeText={(year) => this._setYear(year, this.yearList)}
                            containerStyle={{ bottom: 12, width: 80, }}
                        />
                    </View>
                    <View style={{ flex: 0.1, alignItems: "center" }}>
                        <TouchableOpacity style={{}} onPress={() => { this.downloadTheFile() }}>
                            <Icon type="FontAwesome5" name="file-download" style={{ fontSize: 20, color: "#e95f49" }} />
                        </TouchableOpacity>
                    </View>
                </View> */}
                {/* <View style={{ borderWidth: 1, borderColor: "#F2F2F2", marginTop: 5 }} /> */}
                {this._displayList()}
                <Modal isVisible={this.state.isModalVisible}>
                    <Card style={{ height: 160, }}>
                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                            <Text style={{ fontWeight: "bold", flex: 1, textAlign: "center", fontSize: 20 }}>{strings('login.couponDetails')}</Text>
                            <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => { this.setState({ isModalVisible: !this.state.isModalVisible }) }}>
                                <Icon type="FontAwesome" name="times" style={{ fontSize: 25, color: 'red' }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ borderWidth: 1, borderColor: "#F2F2F2", marginTop: 10 }} />
                        <View style={{ flexDirection: "row", paddingLeft: 10, paddingRight: 10, marginTop: 15 }}>
                            <Text style={{ fontWeight: "bold" }}>{strings('login.cnDate')}: </Text>
                            <Text style={{ color: "grey" }}>{moment(this.state.dataToShowOnModal.credit_note_date).format("DD-MM-YYYY")}</Text>
                        </View>
                        <View style={{ flexDirection: "row", paddingLeft: 10, paddingRight: 10, marginTop: 5 }}>
                            <Text style={{ fontWeight: "bold" }}>{strings('login.cnNo')}: </Text>
                            <Text style={{ color: "grey" }}>{this.state.dataToShowOnModal.credit_note_no}</Text>
                        </View>
                        <View style={{ flexDirection: "row", paddingLeft: 10, paddingRight: 10, marginTop: 5 }}>
                            <Text style={{ fontWeight: "bold" }}>{strings('login.cnValue')}: </Text>
                            <Text style={{ color: "grey" }}>{this.state.dataToShowOnModal.credit_note_value}</Text>
                        </View>
                    </Card>
                </Modal>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    noRecord: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
const mapStateToProps = (state) => {
    return {
        enableDarkTheme: state.VerifierReducer.enableDarkTheme,
        languageControl: state.VerifierReducer.languageEnglish,
    }
}
export default connect(mapStateToProps, null)(CashBatchesScreen)