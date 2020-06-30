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
        }
    }

    pay = () => {
        Alert.alert(
            'Confirmation',
            'Confirm to pay RM ' + this.state.amount + ' ?',
            [
                { text: 'Cancel' },
                { text: 'Okay', onPress: () => this.transfer() }

            ],
            { cancelable: false }
        )
    }

    transfer = () => {
        console.log(this.props.route.params.userId);
        console.log(this.props.route.params.walletNo);

        const datas = {
            txn_cd: 'MEDEWALL05',
            tstamp: getTodayDate(),
            data: {
                userID: this.props.route.params.userId,
                txnDate: getTodayDate(),
                ewalletAccNo: this.props.route.params.walletNo,
                txnCode: "TRANSFER",
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
                    this.props.navigation.goBack();
                    alert('Transfer Success');

                }

            }).catch((error) => {
                alert(error)
            });
    }




    render() {



        return (

            <View style={styles.container}>

                <View style={{ borderRadius: 10, padding: 40 }}>

                    <TextInput
                        value={this.state.value}
                        onChangeText={(receiverAccNo) => this.setState({ receiverAccNo })}
                        placeholder={'Enter receiver account number'}
                        style={styles.input}
                    />
                    <TextInput
                        value={this.state.amount}
                        onChangeText={(amount) => this.setState({ amount })}
                        placeholder={'Enter the amount'}
                        style={styles.input}
                        keyboardType={'number-pad'}
                    />

                </View>
                <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 40 }}>
                    <TouchableOpacity style={styles.btn} onPress={() => this.pay()}>
                        <Text style={{ color: '#FFFFFF' }}>Pay RM{this.state.amount}</Text>
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
