
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, } from 'react-native';
import { getTodayDate } from '../util/getDate';
import { URL } from '../util/provider';

export default class transferDetails extends Component {

  constructor(props) {
    super(props)

    this.state = {

      userID: '',
      eWalletAccNo: '',
      receiverAccNo: '',
      Receiver_reference: '',
      Other_reference: '',
      amount: '',
    }
  }

  componentDidMount() {
    this.setState({
      userID: this.props.route.params.userId,
      eWalletAccNo: this.props.route.params.walletId,
      receiverAccNo: this.props.route.params.receiverAccNo,
      Receiver_reference: this.props.route.params.Receiver_reference,
      Other_reference: this.props.route.params.Other_reference,
      amount: this.props.route.params.amount,
    })
  }

  confirmTransfer = () => {
    const datas = {
      txn_cd: 'MEDEWALL05',
      tstamp: getTodayDate(),
      data: {
        userID: this.state.userID,
        txnDate: getTodayDate(),
        ewalletAccNo: this.state.eWalletAccNo,
        txnCode: "TRANSFER",
        quantity: "",
        amount: parseFloat(this.state.amount),
        idType: "",
        idNo: "",
        photoYourself: "",
        senderAccNo: this.state.eWalletAccNo,
        receiverAccNo: this.state.receiverAccNo,
        tacCode: "",
        status: "001"
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
          if (responseJson.status == "SUCCESS") {
              let data = {
                  txn_cd: 'MEDEWALL04',
                  tstamp: getTodayDate(),
                  data: {
                      userID: this.state.userID
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
                              userID: this.state.userID,
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
                                  this.props.navigation.navigate('Balance');
                                  alert('Transfer Success');
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
        <View style={{ paddingTop: 10, paddingBottom: 20 }}>
          <Text style={{ textAlign: "center", fontSize: 25 }}> Details </Text>
        </View>
        <View style={styles.detail}>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>User ID</Text>
            <Text style={styles.text}>{this.state.userID}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>From account</Text>
            <Text style={styles.text}>{this.state.eWalletAccNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>To account</Text>
            <Text style={styles.text}>{this.state.receiverAccNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Receiver reference</Text>
            <Text style={styles.text}>{this.state.Receiver_reference}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Other reference</Text>
            <Text style={styles.text}>{this.state.Other_reference}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Amount</Text>
            <Text style={styles.text}>RM {this.state.amount}</Text>
          </View>

        </View>
        <View style={{ padding: 50 }}>
          <TouchableOpacity style={styles.btn} onPress={() => this.confirmTransfer()}>
            <Text> Confirm </Text>
          </TouchableOpacity>
        </View>






      </View>
    );
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 30,

  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1
  },
  labelText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#808080',
    textAlign: 'left'
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'right'
  },

  btn: {
    backgroundColor: '#FFD44E',
    height: 50,
    borderRadius: 50,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',

  }

});
