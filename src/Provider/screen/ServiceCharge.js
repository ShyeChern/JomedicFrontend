import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, Alert, TouchableOpacity } from 'react-native'

import { getTodayDate } from '../util/getDate'
import {
    URL_Provider,
    CODE_JomedicOnlineChat,
    CODE_JomedicPhoneCall,
    CODE_JomedicVideoCall,
    CODE_JomedicAppointment,
    CODE_JomedicHomeService
} from '../util/provider'
import Loader from '../screen/Loader'

export default class ServiceCharge extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,

            liveChatCharge: '',
            videoConsultationCharge: '',
        }
    }

    componentDidMount() {
        this.getVideoPrice();
        this.getLiveChatPrice();
    }

    getVideoPrice = async () => {

        // Get the code for online chat
        let datas = {
            txn_cd: 'MEDORDER033',
            tstamp: getTodayDate(),
            data: {
                service_type: CODE_JomedicVideoCall,
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                console.log('Get Video Chat Price Error: ', json.status);
                Alert.alert('Get Video Consultation Price Error', 'Fail to get video consultation price, please try again.\n' + json.status);
            }
            else {
                var data = json.status[0]
                this.setState({
                    videoConsultationCharge: data.price.toFixed(2)
                })

            };
            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Video Chat Price Error: " + error)
            this.setState({
                isLoading: false
            });
            Alert.alert('Get Video Consultation Price Error', 'Fail to get video consultation price, please try again.\n' + error);
            // handleNoInternet()
        }
    }

    getLiveChatPrice = async () => {

        // Get the code for online chat
        let datas = {
            txn_cd: 'MEDORDER033',
            tstamp: getTodayDate(),
            data: {
                service_type: CODE_JomedicOnlineChat,
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                console.log('Get Live Chat Price Error');
                console.log(json.status);
                Alert.alert('Get Chat Consultation Price Error', 'Fail to get chat consultation price, please try again.\n' + json.status);
            }
            else {
                var data = json.status[0]
                this.setState({
                    liveChatCharge: data.price.toFixed(2)
                })

            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Live Chat Price Error: " + error)
            this.setState({
                isLoading: false
            });
            Alert.alert('Get Chat Consultation Price Error', 'Fail to get chat consultation price, please try again.\n' + error);
            // handleNoInternet()
        }
    }

    render() {
        return (
            <View style={styles.pageContainer}>
                <View>
                    <Text style={styles.labelTextStyle}>Live Chat Charges (RM)</Text>
                    <TextInput
                        style={styles.inputTextStyle}
                        placeholder='Enter amount'
                        value={this.state.liveChatCharge}
                        editable={false}
                    />
                </View>
                <View>
                    <Text style={styles.labelTextStyle}>Video Consultation Charges (RM)</Text>
                    <TextInput
                        style={styles.inputTextStyle}
                        placeholder='Enter amount'
                        value={this.state.videoConsultationCharge}
                        editable={false}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    pageContainer: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: '15%',
        backgroundColor: '#E5E5E5',
        flex: 1
    },

    inputTextStyle: {
        backgroundColor: '#F2F2F2',
        borderRadius: 6,
        borderStyle: "solid",
        borderColor: "#D3D3D3",
        borderRadius: 6,
        borderWidth: 1,
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        // fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#000000',
        marginBottom: 30,
    },

    labelTextStyle: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#000000',
        marginBottom: 6,
    },

    bottom: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 20,
    }
})
