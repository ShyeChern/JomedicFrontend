import React, { Component } from 'react'
import { Text, StyleSheet, View, FlatList, List, TouchableOpacity, TextInput } from 'react-native';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";
import { getTodayDate } from '../util/getDate';
import { URL } from '../util/provider';


var radio_props = [
    { label: 'Maybank', value: 0 },
    { label: 'CIMB', value: 1 },
    { label: 'RHB', value: 2 }
];

export default class onlineBanking extends Component {
    constructor(props) {
        super(props)

        this.state = {
            cardNumber: '',
            cvv: '',
            pinNumber: '',
            amount: '',
        }
    }

    pay = () => {
        Alert.alert(
            'Confirmation',
            'Confirm to pay RM ' + this.state.topupAmount + ' ?',
            [
                { text: 'Cancel' },
                { text: 'Okay', onPress: () => alert('Paid') }

            ],
            { cancelable: false }
        )
    }

    card = () => {
        if (this.state.cardNumber && this.state.cvv) {

            let data = {
                txn_cd: 'MEDEWALL04',
                tstamp: getTodayDate(),
                data: {
                    userID: this.props.route.params.userId
                }
            }

            fetch(URL + '/EWALL', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)

            }).then((response) => response.json())
                .then((responseJson) => {
                    data = {
                        txn_cd: 'MEDEWALL03',
                        tstamp: getTodayDate(),
                        data: {
                            userID: this.props.route.params.userId,
                            ewalletAccNo: responseJson.status.ewallet_acc_no,
                            banAccNo: responseJson.status.bank_acc_no,
                            creditCardNo: responseJson.status.credit_card_no,
                            
                            
                            freezeAmt: responseJson.status.freeze_amt,
                            floatAmt: responseJson.status.float_amt,
                            currencyCd: responseJson.status.currency_cd,
                            status: responseJson.status.status,
                        }
                    }


                    fetch(URL + '/EWALL', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)

                    }).then((response) => response.json())
                        .then((responseJson) => {
                            if (responseJson.status == "SUCCESS") {
                                this.props.navigation.goBack();
                                alert('Top Up Successfully');
                            }

                        }).catch((error) => {
                            alert(error)
                        });

                }).catch((error) => {
                    alert(error)
                });
        }
        else{
            alert('Please enter card number and cvv number');
        }

    }

    reload = () => {

        const datas = {
            txn_cd: 'MEDEWALL09',
            tstamp: getTodayDate(),
            data: {
                userID: this.props.route.params.userId,
                pinNumber: this.state.pinNumber,
                txnDate: getTodayDate(),
                status: "001",
                walletAccNo: this.props.route.params.walletNo
            }
        }


        fetch(URL + '/EWALL', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datas)

        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status == "SUCCESS") {

                    let data = {
                        txn_cd: 'MEDEWALL04',
                        tstamp: getTodayDate(),
                        data: {
                            userID: this.props.route.params.userId
                        }
                    }

                    fetch(URL + '/EWALL', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)

                    }).then((response) => response.json())
                        .then((responseJson) => {
                            data = {
                                txn_cd: 'MEDEWALL03',
                                tstamp: getTodayDate(),
                                data: {
                                    userID: this.props.route.params.userId,
                                    ewalletAccNo: responseJson.status.ewallet_acc_no,
                                    banAccNo: responseJson.status.bank_acc_no,
                                    creditCardNo: responseJson.status.credit_card_no,
                                    availableAmt: responseJson.status.available_amt + 100,
                                    freezeAmt: responseJson.status.freeze_amt,
                                    floatAmt: responseJson.status.float_amt,
                                    currencyCd: responseJson.status.currency_cd,
                                    status: responseJson.status.status,
                                }
                            }


                            fetch(URL + '/EWALL', {
                                method: 'POST',
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data)

                            }).then((response) => response.json())
                                .then((responseJson) => {
                                    if (responseJson.status == "SUCCESS") {
                                        this.props.navigation.goBack();
                                        alert('Top Up Successfully');
                                    }

                                }).catch((error) => {
                                    alert(error)
                                });

                        }).catch((error) => {
                            alert(error)
                        });
                }
            }).catch((error) => {
                alert(error)
            });
    }

    render() {
        return (
            <View>
                <View>

                    <View style={styles.Method}>
                        <Text style={{ fontSize: 23, color: 'grey' }}> Top Up Methods</Text>
                    </View>
                    <View style={{ paddingTop: 40 }}>
                        <Collapse>
                            <CollapseHeader>
                                <View style={{ backgroundColor: '#ccdfff', height: 30, justifyContent: 'center', borderWidth: .5 }}>

                                    <Text style={styles.CreditOnline}> Your Credit/ Debit Card         </Text>

                                </View>
                            </CollapseHeader>
                            <CollapseBody>
                                <View style = {{ paddingTop: 5}}>
                                <Text style = {{height: 20, marginRight: 150,marginLeft: 50}}> Card Number</Text>
                                    <TextInput
                                        style={styles.InputCardNumber}
                                        onChangeText={(cardNumber) => this.setState({ cardNumber })}
                                        placeholder={' Enter Card Number'}
                                        value={this.state.cardNumber}
                                    />

                                </View>
                                <View style = {{ paddingTop: 5}}>
                                <Text style = {{height: 20, marginRight: 150,marginLeft: 50}}> CVV</Text>
                                        <TextInput
                                        style={styles.InputCVV}
                                        onChangeText={(cvv) => this.setState({ cvv })}
                                        placeholder={'Enter 3 digit CVV number'}
                                        value={this.state.cvv} />
                                </View>

                                <View style = {{ paddingTop: 5}}>
                                <Text style = {{height: 20, marginRight: 150,marginLeft: 50}}> Amount</Text>
                                    <TextInput
                                        style={styles.InputCVV}
                                        onChangeText={(amount) => this.setState({ amount })}
                                        placeholder={'Enter the topup amount'}
                                        value={this.state.amount} />
                                </View>

                                <Text style={styles.Acknowledge}> I acknowledge that my card information is saved in my jomedic
                            account and one time password might not be required for transaction in Jomedic.</Text>

                                <View style={{ padding: 3 }}>
                                    <TouchableOpacity onPress={() => this.card()} style={styles.reload}>
                                        <Text style={{ textAlign: 'center' }}> Pay Now </Text>
                                    </TouchableOpacity>
                                </View>

                            </CollapseBody>
                        </Collapse>
                        { <Collapse>
                            <CollapseHeader>
                                <View style={{ backgroundColor: '#ccdfff', height: 30, justifyContent: 'center', borderWidth: .5 }}>
                                    <Text style={styles.CreditOnline}> Online Banking         </Text>

                                </View>
                            </CollapseHeader>
                            <CollapseBody>
                                <View>
                                    <RadioForm style={styles.Radio}
                                        radio_props={radio_props}
                                        initial={0}
                                        onPress={(value) => { this.setState({ value: value }) }}
                                    />
                                </View>

                                <View style = {{ paddingTop: 5}}>
                                    <Text style = {{height: 20, marginRight: 150,marginLeft: 50}}> Amount</Text>
                                    <TextInput
                                        style={styles.InputCVV}
                                        onChangeText={(amount) => this.setState({ amount })}
                                        placeholder={'Enter the topup amount'}
                                        value={this.state.amount} />
                                </View>

                                <View style={{ padding:9}}>
                                    <TouchableOpacity onPress={() => this.reload()} style={styles.reload}>
                                        <Text style={{ textAlign: 'center' }}> Pay Now </Text>
                                    </TouchableOpacity>
                                </View>

                            </CollapseBody>
                        </Collapse> }
                        <Collapse>
                            <CollapseHeader>
                                <View style={{ backgroundColor: '#ccdfff', height: 30, justifyContent: 'center', borderWidth: .5 }}>
                                    <Text style={styles.CreditOnline}>   Pin Reload    </Text>

                                </View>
                            </CollapseHeader>
                            <CollapseBody>
                                <View style={{ padding: 10, }}>

                                    <TextInput
                                        value={this.state.pinNumber}
                                        onChangeText={(pinNumber) => this.setState({ pinNumber })}
                                        placeholder={' Enter Reload Pin'}
                                        style={styles.input}
                                    />
                                </View>
                                <View style={{ padding: 9 }}>
                                    <TouchableOpacity onPress={() => this.reload()} style={styles.reload}>
                                        <Text style={{ textAlign: 'center' }}> Reload </Text>
                                    </TouchableOpacity>
                                </View>

                            </CollapseBody>
                        </Collapse>
                    </View>
                </View>








            </View>
        )
    }
}

const styles = StyleSheet.create({

    Amount: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
        marginTop: 50,

    },

    Method: {

        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
        marginTop: 20,


    },

    CreditOnline: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 30,
        marginTop: 30,
        fontSize: 18,

    },

    continueBtn: {
        paddingHorizontal: '30%',
        paddingVertical: 10,
        backgroundColor: '#F5A623',
        borderRadius: 50,


    },

    Continue: {
        alignItems: 'center',
        padding: 20,




    },

    Acknowledge: {
        alignItems: 'center',
        fontSize: 16,
        paddingTop: '3%',
        paddingLeft: '15%',
        paddingRight: '10%'
    },

    Radio: {
        paddingLeft: '15%',
        paddingRight: '10%'
    },

    InputCardNumber: {
        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        marginRight: 60,
        marginLeft: 50
    },

    InputCVV: {

        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        marginRight: 150,
        marginLeft: 50
    },

    reload: {
        marginLeft: 100,
        marginRight: 100,
        paddingBottom: 10,
        paddingTop: 10,
        textAlign: 'center',
        backgroundColor: '#F5A623',
        borderRadius: 24
    },








})
