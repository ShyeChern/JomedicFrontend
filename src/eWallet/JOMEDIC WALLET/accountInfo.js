
import React, { Component } from 'react';
import {StyleSheet,Text,View, TouchableOpacity,} from 'react-native';
import { getTodayDate } from '../util/getDate';
import { URL } from '../util/provider';

export default class AccountInfo extends Component {

  constructor(props) {
    super(props)

    this.state = {

      userID: '',
      eWalletAccNo: '',
      bankAccNovalue: '',
      creditCardNovalue: '',
      status: '',
    }
  }

  componentDidMount() {
    const datas = {
      txn_cd: 'MEDEWALL04',
      tstamp: new Date(),
      data: {
        userID: 'syazreenshuayli@gmail.com'
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
        this.setState({
          userID: responseJson.status.user_id,
          eWalletAccNo: responseJson.status.ewallet_acc_no,
          bankAccNovalue: responseJson.status.bank_acc_no,
          creditCardNovalue: responseJson.status.credit_card_no,
          status: responseJson.status.status,
        })

      }).catch((error) => {
        alert(error)
      });
  }

  updateProfile() {
    this.props.navigation.navigate("Balance");
  }

  render() {
    return (
      <View style={styles.container}>
        <View style = {{ paddingTop: 10, paddingBottom:30}}>
          <Text style = {{ textAlign:"center", fontSize:25}}> Account </Text>
        </View>
        <View style={styles.detail}>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>User ID</Text>
            <Text style={styles.text}>{this.state.userID}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>eWallet Account No</Text>
            <Text style={styles.text}>{this.state.eWalletAccNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Bank Account No</Text>
            <Text style={styles.text}>{this.state.bankAccNovalue}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.labelText}>Status</Text>
            <Text style={styles.text}>{this.state.status}</Text>
          </View>


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
  }



});
