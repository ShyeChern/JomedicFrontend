//This is an example of Calendar// 
import React, { Component } from 'react';
//import react in our code. 

import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
//import all the components we are going to use.

import DateTimePicker from '@react-native-community/datetimepicker';
//import CalendarPicker from the package we installed

import AntDesign from 'react-native-vector-icons/AntDesign';

import { getTodayDate } from '../util/getDate';
import { URL } from '../util/provider';


function History({ id, type, date, receiverAcc, amount, that }) {
  return (
    <View style={{ borderWidth: 1, margin: 10, borderRadius: 10 }}>
      <TouchableOpacity style={{ padding: 9, flexDirection: 'row', flex: 1 }}
        onPress={() => that.props.navigation.navigate('Details', {
          userId: that.props.route.params.userId,
          date: date
        })}>
        <View style={{ flex: 4 }}>
          <Text>{type}</Text>
          <Text>{date}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text>{type === 'RECEIVE' ? '+ RM' + amount : '- RM' + amount}</Text>
        </View>

      </TouchableOpacity>
    </View>
  );
}

export default class transactionHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //set value in state for start and end date
      selectedStartDate: null,
      selectedEndDate: null,
      startDate: new Date(),
      endDate: new Date(),
      showStartDatePicker: false,
      showEndDatePicker: false,
      transactionData: [],
    };
    this.onDateChange = this.onDateChange.bind(this);
  }

  componentDidMount() {

    const datas = {
      txn_cd: 'MEDEWALL08',
      tstamp: getTodayDate(),
      data: {
        userID: this.props.route.params.userId,

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
        // console.log(responseJson.status)
        let historyData = [];
        responseJson.status.forEach((value, index) => {
          if (value.txn_code !== 'TAC') {
            let historyObject = {
              id: index,
              type: value.txn_code,
              date: value.txn_date,
              receiverAcc: value.receiver_acc_no,
              amount: value.amount
            }

            historyData.push(historyObject);
          }
          historyData.reverse();
          this.setState({ transactionData: historyData })
        })



      }).catch((error) => {
        alert(error)
      });
  }

  onDateChange(date, type) {
    //function to handle the date change 
    if (type === 'END_DATE') {
      this.setState({
        selectedEndDate: date,
      });
    } else {
      this.setState({
        selectedStartDate: date,
        selectedEndDate: null,
      });
    }
  }


  showStartDate = () => {
    if (this.state.showStartDatePicker) {
      return (
        <DateTimePicker
          value={this.state.startDate}
          mode={'date'}
          display='calendar'
          onChange={(event, date) => { if (event.type === 'set') { this.setState({ startDate: date, showStartDatePicker: false }); } }}

        />
      )
    }
  }

  showEndDate = () => {
    if (this.state.showEndDatePicker) {
      return (
        <DateTimePicker
         value={this.state.endDate}
          mode={'date'}
          display='calendar'
          onChange={(event, date) => { if (event.type === 'set') { this.setState({ endDate: date, showEndDatePicker: false }); } }}
        />
      )
    }
  }

  render() {
    const { selectedStartDate, selectedEndDate } = this.state;
    const minDate = new Date(2018, 1, 1); // Min date
    const maxDate = new Date(2050, 6, 3); // Max date
    const startDate = selectedStartDate ? selectedStartDate.toString() : ''; //Start date
    const endDate = selectedEndDate ? selectedEndDate.toString() : ''; //End date
    return (
      <View style={styles.container}>

        <View style={styles.Method}>
           <Text style={{ fontSize: 20, color: 'grey' }}> Transaction History</Text>
        </View>
       
        <View style={{ flexDirection: 'row', padding: 40, justifyContent: 'center' }}>
          <View style={{ justifyContent: 'center' }}>
            <AntDesign name='calendar' size={35} color='#4A4A4A' />
          </View>

          <View style={{ justifyContent: 'center', }}>
            <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 2, marginHorizontal: 10, padding: 10 }}
              onPress={() => this.setState({ showStartDatePicker: true })}>
              <Text>{this.state.startDate.getDate().toString()}</Text>
              <Text>/</Text>
              <Text>{(this.state.startDate.getMonth() + 1).toString()}</Text>
              <Text>/</Text>
              <Text>{this.state.startDate.getFullYear().toString()}</Text>
            </TouchableOpacity>
            {this.showStartDate()}

          </View>

          <View style={{ justifyContent: 'center' }}>
            <AntDesign name='calendar' size={35} color='#4A4A4A' />
          </View>
          <View style={{ justifyContent: 'center' }}>
            <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 2, marginHorizontal: 10, padding: 10 }}
              onPress={() => this.setState({ showEndDatePicker: true })}>
              <Text>{this.state.endDate.getDate().toString()}</Text>
              <Text>/</Text>
              <Text>{(this.state.endDate.getMonth() + 1).toString()}</Text>
              <Text>/</Text>
              <Text>{this.state.endDate.getFullYear().toString()}</Text>
            </TouchableOpacity>
            {this.showEndDate()}
          </View>

        </View>

        <SafeAreaView style={styles.container}>
          <FlatList
            data={this.state.transactionData}
            renderItem={({ item }) => <History id={item.id} type={item.type} date={item.date} receiverAcc={item.receiverAcc} amount={item.amount} that={this} />}
            keyExtractor={item => item.id}
          />
        </SafeAreaView>




      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 6,
    paddingBottom: 10,

    flex: 1,
    paddingTop: 1

  },

  Method: {

    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 5,
    marginTop: 20,


},

});