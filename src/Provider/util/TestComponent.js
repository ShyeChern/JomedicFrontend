import React, { Component } from 'react'
import { StyleSheet, Text, View, SafeAreaView, SectionList, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment'

import { getTodayDate, getDatesFor7DayFromToday } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class TestComponent extends Component {

  constructor(props) {
    super(props)
    this.state = {
        isLoading: false,
        user_id: '',
        tenant_id: '',

        appointmentList: [],
        appointmentDays: [],
        appontments: [],
    }
}

async componentDidMount() {
    var appointmentDates = this.getAppointmentDates();
    var appointments = await this.getAppointments();

    this.createAppointmentList(appointmentDates, appointments);
}

  getAppointmentDates = () => {
    // Get the date range
    var days = getDatesFor7DayFromToday();

    // Insert the dates into an array
    var formatDates = []

    for (let index = 0; index < days.length; index++) {
        formatDates.push(moment(days[index]).format("ddd MMM DD"))
    }

    return formatDates
}

getAppointments = async () => {
    var appointments = [];
    var tenant_id = "tenant550";

    var days = getDatesFor7DayFromToday();
    var startDay = days[0]
    var endDay = days[days.length - 1]

    // Set tenant id, start date and end date
    let datas = {
        txn_cd: 'MEDORDER036',
        tstamp: getTodayDate(),
        data: {
            hfc_cd: tenant_id,
            start_date: startDay,
            end_date: endDay
        }
    }

    try {
        this.setState({
            isLoading: true
        });

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
            console.log('Get user Profile Error');
            console.log(json.status);
        }
        else {
            let data = json.status;

            if (!data) {
                appointments = []
            } else {

                // For each of the days, filter the appointment to remain the day only
                for (let index = 0; index < days.length; index++) {
                    // Create a new array to filter the data
                    var filteredAppointment = [];

                    // Clone the data to retain the original data
                    var dataClone = [...data];

                    // Filter the data array
                    var filteredAppointment = dataClone.filter((element) => {
                        return moment(element.appointment_date).format("YYYY-MM-DD") === days[index]
                    })
                    
                    // Add the filtered Appointment into the appointment list
                    appointments.push(filteredAppointment);
                }

            }
        };

        this.setState({
            isLoading: false
        });

    } catch (error) {
        console.log(error)
        this.setState({
            isLoading: false
        });
        handleNoInternet()
    }

    console.log("Appointments are: ")
    console.log(appointments)
    return appointments
}

createAppointmentList = (appointmentDates, appointments) => {
    console.log("Hello?")
    var newAppointmentList = []

    for (let i = 0; i < 7; i++) {
        newAppointmentList.push({
            title: appointmentDates[i],
            data: appointments[i]
        })
    }

    this.setState({
        appointmentList: newAppointmentList
    })

    console.log("The final appointment list is: ")
    console.log(newAppointmentList)
}

  render() {
    return (
      <View>
        <Text> textInComponent </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({})
