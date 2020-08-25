import React, { Component } from 'react'
import { Text, StyleSheet, View,TextInput,TouchableOpacity,Alert } from 'react-native'
import { getTodayDate } from '../util/getDate';
import { URL } from '../util/provider';

export default class withdrawMoney extends Component {

    constructor() {
        super();
        this.state = {
            amount: '',
            receiverAccNo: '',
            Receiver_reference: '',
            Other_reference:'',
        };
      }

      componentDidMount(){

    }

    withdraw = () => {
        console.log(this.props.route.params.userId);
        console.log(this.props.route.params.walletNo);

        const datas = {
            txn_cd: 'MEDEWALL05',
            tstamp: getTodayDate(),
            data: {
                userID: this.props.route.params.userId,
                txnDate: getTodayDate(),
                ewalletAccNo: this.props.route.params.walletNo,
                txnCode: "WITHDRAW",
                quantity: "",
                amount: parseFloat(this.state.amount),
                idType: "",
                idNo: "",
                photoYourself: "",
                senderAccNo: this.props.route.params.walletNo,
                receiverAccNo: this.state.receiverAccNo,
                tacCode: "",
                status: "001"
                

            }
        }

        console.log(datas);

        fetch(URL + '/EWALL', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datas)

        }).then((response) => response.json())
        .then((responseJson) => {
            console.log(responseJson)
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
                                availableAmt: responseJson.status.available_amt-this.state.amount,
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
                                    alert('Withdrawal Success');
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

            <View style={styles.container}>

               
                <View style={{ borderRadius: 10, padding: 40,  }}>
                <View style={{ paddingTop:2.5, paddingBottom: 5 }}>
                     <Text style={{ textAlign: "center", fontSize: 20 }}>  Withdraw </Text>
                 </View>

                    <View style = {{ paddingTop: 20}}>
                    <Text> Bank account number</Text>
                        <TextInput
                         value={this.state.value}
                         onChangeText={(receiverAccNo) => this.setState({ receiverAccNo })}
                         placeholder={'Enter bank account number'}
                         style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    />
                    </View>

                <View style = {{ paddingTop: 20}}>
                    <Text> Receiver reference </Text>
                     <TextInput
                     value={this.state.value}
                     onChangeText={(Receiver_reference) => this.setState({ Receiver_reference })}
                     placeholder={'Enter receiver reference'}
                     style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
   
                    />
                </View>

                <View style = {{ paddingTop: 20}}>
                     <Text> Other reference</Text>
                      <TextInput
                      value={this.state.value}
                      onChangeText={(Other_reference) => this.setState({ Other_reference })}
                      placeholder={'Enter Other references'}
                      style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    />
                </View>

                <View style = {{ paddingTop: 20}}>
                    <Text> Amount</Text>
                    <TextInput
                    value={this.state.amount}
                    onChangeText={(amount) => this.setState({ amount })}
                    placeholder={'Enter the amount'}
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    keyboardType={'number-pad'}
                    />

                </View>

                </View>

                <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 40 }}>
                    <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate('transferDetails',{
                            receiverAccNo:this.state.receiverAccNo,
                            Receiver_reference:this.state.Receiver_reference,
                            Other_reference:this.state.Other_reference,
                            amount:this.state.amount,
                            userId:this.props.route.params.userId,
                            walletId:this.props.route.params.walletNo

                         })}>
                        <Text style={{ color: '#FFFFFF' }}>Proceed</Text>
                    </TouchableOpacity>
                </View>

            </View>
            
        );
    }
}

const styles = StyleSheet.create({
    title1: {
        textAlign: 'left',
        fontSize: 16,
        marginRight: 150,
        marginLeft: 10,
    },
    title2: {
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 35,
        marginRight: 250,
        marginLeft: 20
    },
    container: {

        flex: 1,
        backgroundColor: 'white',


    },

    btn: {
        backgroundColor: '#FFD44E',
        height: 60,
        borderRadius: 50,
        width: '70%',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },

    note: {

        textAlign: 'left',
        fontSize: 16,
        marginRight: 150,
        marginLeft: 20,


    },
    button: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
        width: 300,
        marginTop: 16,

    },



});
