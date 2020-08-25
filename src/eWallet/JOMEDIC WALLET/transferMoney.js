import React, { Component } from 'react';
import { TextInput, StyleSheet, Text, View, TouchableOpacity, Alert, TouchableHighlight } from 'react-native'
import { getTodayDate } from '../util/getDate';
import { URL } from '../util/provider';

export default class TransferMoney extends Component {

    constructor(props) {
        super(props)

        this.state = {
            amount: '',
            receiverAccNo: '',
            Receiver_reference: '',
            Other_reference: '',
        }
    }

    componentDidMount() {

    }

    proceedTransfer = () => {
        console.log(this.props.route.params.userId);
        console.log(this.props.route.params.walletNo);
        if (this.state.amount && this.state.receiverAccNo && this.state.Receiver_reference && this.state.Other_reference) {
            const datas = {
                txn_cd: 'MEDEWALL04-1',
                tstamp: getTodayDate(),
                data: {
                    ewalletAccNo: this.state.receiverAccNo
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
                    console.log(responseJson)
                    if (responseJson.status == "NOTFOUND") {
                        alert("Invalid receiver e-wallet number");
                    }
                    else {
                        
                        this.props.navigation.navigate('transferDetails', {
                            receiverAccNo: this.state.receiverAccNo,
                            Receiver_reference: this.state.Receiver_reference,
                            Other_reference: this.state.Other_reference,
                            amount: this.state.amount,
                            userId: this.props.route.params.userId,
                            walletId: this.props.route.params.walletNo,
                            receiverUserId:responseJson.status.user_id
                        })
                    }
                })
                .catch((error) => {
                    alert(error)
                });

        }
        else {
            alert("Please fill in all the detail");
        }

    }




    render() {



        return (

            <View style={styles.container}>

                <View style={{ borderRadius: 10, padding: 20, }}>
                    <View style={{ paddingTop: 10, paddingBottom: 5 }}>
                        <Text style={{ textAlign: "center", fontSize: 20 }}>  Transfer </Text>
                    </View>

                    <View style={{ paddingTop: 20 }}>
                        <Text> Receiver e-wallet number</Text>
                        <TextInput
                            value={this.state.value}
                            onChangeText={(receiverAccNo) => this.setState({ receiverAccNo })}
                            placeholder={'Enter receiver e-wallet number'}
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                        />
                    </View>

                    <View style={{ paddingTop: 20 }}>
                        <Text> Receiver reference </Text>
                        <TextInput
                            value={this.state.value}
                            onChangeText={(Receiver_reference) => this.setState({ Receiver_reference })}
                            placeholder={'Enter receiver reference'}
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}

                        />
                    </View>

                    <View style={{ paddingTop: 20 }}>
                        <Text> Other reference</Text>
                        <TextInput
                            value={this.state.value}
                            onChangeText={(Other_reference) => this.setState({ Other_reference })}
                            placeholder={'Enter Other references'}
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                        />
                    </View>

                    <View style={{ paddingTop: 20 }}>
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
                    <TouchableOpacity style={styles.btn} onPress={() => this.proceedTransfer()}>
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


    Method: {

        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        marginTop: 10,


    },




});
