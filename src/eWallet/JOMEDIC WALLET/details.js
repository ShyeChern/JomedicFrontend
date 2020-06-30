import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { URL } from '../util/provider';
import { getTodayDate } from '../util/getDate';

export default class Details extends Component {
    constructor(props) {
        super(props)

        this.state = {
            amount: 0,
            transactionType: '',
            dateTime: '',
            walletAccountNo: '',
            status: 'SUCCESS',
            orderNo: '',
        }
    }

    componentDidMount() {
        const datas = {
          txn_cd: 'MEDEWALL07',
          tstamp: new Date(),
          data: {
            userID: this.props.route.params.userId,
            txnDate : this.props.route.params.date,
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
             transactionType: responseJson.status.txn_code,
             dateTime: responseJson.status.txn_date,
             walletAccountNo: responseJson.status.ewallet_acc_no,
            //  status: responseJson.status.status,
            //  orderNo: responseJson.status.order_no,
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
               <Text style = {{ textAlign:"center", paddingTop: 40, fontSize:25}}>Details</Text>
                <View style={styles.detail}>
                    <View style={styles.detailRow}>
                        <Text style={styles.labelText}>Transaction Type</Text>
                        <Text style={styles.text}>{this.state.transactionType}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.labelText}>Date/Time</Text>
                        <Text style={styles.text}>{this.state.dateTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.labelText}>Wallet Account No</Text>
                        <Text style={styles.text}>{this.state.walletAccountNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.labelText}>Status</Text>
                        <Text style={styles.text}>{this.state.status}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.labelText}>Order No</Text>
                        <Text style={styles.text}>{this.state.orderNo}</Text>
                    </View>

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    amount: {
        color: '#FFD44E',
        fontWeight: 'bold',
        fontSize: 25,
        margin: 20
    },
    detail: {
        flex: 1,
        paddingTop: 30
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
})
