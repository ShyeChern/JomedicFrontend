import React, { Component } from 'react'
import { Text, StyleSheet, View,TextInput,TouchableOpacity,Alert} from 'react-native'
import QRCode from 'react-native-qrcode-svg';
import { getTodayDate } from '../util/getDate';
import { URL } from '../util/provider';


export default class receiveMoney extends Component {

    constructor() {
        super();
        this.state = {
          amount: '',
          valueForQRCode: '',
        };
      }

      pay = () => {
        Alert.alert(
            'Confirmation',
            'Confirm to pay RM ' + this.state.amount + ' ?',
            [
                { text: 'Cancel' },
                { text: 'Okay', onPress: () => this.receive() }

            ],
            { cancelable: false }
        )
    }

    receive = () => {
        console.log(this.props.route.params.userId);
        console.log(this.props.route.params.walletNo);

        const datas = {
            txn_cd: 'MEDEWALL05',
            tstamp: getTodayDate(),
            data: {
                userID: this.props.route.params.userId,
                txnDate: getTodayDate(),
                ewalletAccNo: this.props.route.params.walletNo,
                txnCode: "RECEIVE",
                quantity: "",
                amount: parseFloat(this.state.amount),
                idType: "",
                idNo: "",
                photoYourself: "",
                senderAccNo: this.state.receiverAccNo,
                receiverAccNo: this.props.route.params.walletNo,
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


            }).catch((error) => {
                alert(error)
            });
    }
      
    render() {
        return (
           
            <View style={styles.MainContainer}>
        <QRCode
          //QR code value
          value={this.state.valueForQRCode ? this.state.valueForQRCode : 'NA'}
          //size of QR Code
          size={250}
          //Color of the QR Code (Optional)
          color="black"
          //Background Color of the QR Code (Optional)
          backgroundColor="white"
        
        />
        <TextInput
           style={styles.TextInputStyle}
          value={this.state.value}
          onChangeText={(senderAccNo) => this.setState({ senderAccNo })}
          underlineColorAndroid="transparent"
          placeholder={'Enter sender account number'}
          
        />
        <TextInput
          // Input to get the value to set on QRCode
          style={styles.TextInputStyle}
          onChangeText={text => this.setState({ amount: text })}
          underlineColorAndroid="transparent"
          placeholder="Enter the amount"
          keyboardType={'number-pad'}
        />
        <TouchableOpacity
          onPress={this.pay}
          activeOpacity={0.7}
          style={styles.button}>
          <Text style={styles.TextStyle}> Receive RM{this.state.amount}</Text>
        </TouchableOpacity>
      </View>
        )
    }
}

const styles = StyleSheet.create({

    MainContainer: {
        flex: 1,
        margin: 10,
        alignItems: 'center',
        paddingTop: 40,
      },
      TextInputStyle: {
        width: '100%',
        height: 40,
        marginTop: 20,
        borderWidth: 1,
        textAlign: 'center',
      },
      button: {
        width: '100%',
        paddingTop: 8,
        marginTop: 10,
        paddingBottom: 8,
        backgroundColor: '#F44336',
        marginBottom: 20,
      },
      TextStyle: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
      },
})
