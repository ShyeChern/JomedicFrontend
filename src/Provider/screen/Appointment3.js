import React, { Component } from 'react'
import { StyleSheet, Text, View, SafeAreaView, SectionList, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { Divider } from 'react-native-elements';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';


import { getTenantId, getTenantType, getUserId } from '../util/Auth'
import { getTodayDate, getStartOfMonth, getEndOfMonth, getDatesForCurrentMonth } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from './Loader'

import { useFocusEffect, useIsFocused } from '@react-navigation/native'

export default class AgendaScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isRefreshing: false,
            user_id: '',
            tenant_id: '',
            tenant_type: '',

            todayDate: moment().format("YYYY-MM-DD"),
            items: {},
            selectedDay: {},
        };
    }

    async componentDidMount() {
        await this.initializeData();

        // Add hook to refresh profile data when screen is Focus, and if reload is true
        // this.props.navigation.addListener('focus',
        //     event => {
        //         this.refreshAppointment(true);
        //     }
        // )

    }

    initializeData = async () => {
        await getUserId().then(response => {
            this.setState({ user_id: response });
        });

        await getTenantType().then(response => {
            this.setState({ tenant_type: response });
        });

        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });
    }


    getAppointments = async (startDate, endDate) => {
        var appointments = [];
        var tenant_id = this.state.tenant_id;

        // Set tenant id, start date and end date
        let datas = {
            txn_cd: 'MEDORDER036',
            tstamp: getTodayDate(),
            data: {
                hfc_cd: tenant_id,
                start_date: startDate,
                end_date: endDate
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
                console.log('Get Appointment Error');
                console.log(json.status);
            }
            else {
                let data = json.status;

                if (!data) {
                    appointments = []
                } else {
                    appointments = data
                }
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log('Get Appointment Error');
            console.log(error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

        return appointments
    }

    sortAppointments = (appointments, dates) => {
        var sortedAppointments = [];

        // For each of the dates, filter the appointment to remain the day only
        for (let index = 0; index < dates.length; index++) {
            // Create a new array to filter the data
            var filteredAppointment = [];

            // Clone the data to retain the original data
            var dataClone = [...appointments];

            // Filter the data array
            var filteredAppointment = dataClone.filter((element) => {
                return moment(element.appointment_date).format("YYYY-MM-DD") === dates[index]
            })

            // Add the filtered Appointment into the appointment list
            if (filteredAppointment.length <= 0) {
                sortedAppointments.push([])
            } else {
                sortedAppointments.push(filteredAppointment);
            }
        }

        return sortedAppointments;
    }

    loadAppointmentDetails = (item) => {
        this.props.navigation.navigate("AppointmentDetail", {
            name: item.name,
            id_number: item.id_number,
            email: item.email,
            mobile_no: item.mobile_no,
            picture: item.picture,
            order_no: item.order_no,
            user_id: item.user_id,
            tenant_id: this.state.tenant_id,
            tenant_type: this.state.tenant_type,
            appointment_date: item.appointment_date,
            start_time: item.start_time,
            address: item.home_address1 + " " + item.home_address2 + " " + item.home_address3,
        })
    }

    loadItems(day) {
        console.log("The date from loadMonth: ")
        console.log(day)

        // As react native calendars Agenda tend to load previous month from today during the first initalization,
        // Ignore the operation if month is previous than today date
        var selectedMonth = moment(day.dateString);
        if (selectedMonth.isBefore(moment(), "month")) {
            return;
        }

        // Set the state
        this.setState({
            selectedDay: day
        })

        setTimeout(async () => {

            var startDate = getStartOfMonth(day.dateString);
            var endDate = getEndOfMonth(day.dateString);
            var dates = getDatesForCurrentMonth(day.dateString);

            console.log(startDate)
            console.log(endDate)

            // Get the Appointments from database
            var unsortedAppointments = await this.getAppointments(startDate, endDate);

            // Sort the appointments into their respective dates
            var sortedAppointments = [];
            sortedAppointments = this.sortAppointments(unsortedAppointments, dates);

            // Construct the Object for Agenda
            var agendas = {}
            if (sortedAppointments.length > 0) {
                for (let index = 0; index < dates.length; index++) {
                    agendas[dates[index]] = sortedAppointments[index]
                }
            } else {
                for (let index = 0; index < dates.length; index++) {
                    agendas[dates[index]] = []
                }
            }

            Object.keys(this.state.items).forEach(key => { agendas[key] = this.state.items[key]; });
            this.setState({
                items: agendas,
            });
        }, 1000);

        this.setState({ isRefreshing: false });
    }

    renderItem(item) {
        return (
            <TouchableOpacity
                style={[styles.item, { height: 70 }]}
                onPress={() => this.loadAppointmentDetails(item)}
            >
                <Text>Name: {item.name}</Text>
                {/* <Text>Date: {moment(item.start_time).format("DD MMMM YYYY")}</Text> */}
                <Text>Time: {moment(item.start_time).format("hh:mm A")}</Text>
            </TouchableOpacity>
        );
    }

    renderEmptyDate() {
        return (
            <View style={styles.emptyDate}>
                <Text>No appointments booked</Text>
            </View>
        );
    }

    rowHasChanged(r1, r2) {
        return r1.name !== r2.name;
    }

    timeToString(time) {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }

    refreshAppointment = () => {
        this.setState({ isRefreshing: true })
        this.setState({ items: {} });
        this.loadItems(this.state.selectedDay);
        this.setState({ isRefreshing: false });
    }

    renderNextMonth = async (day) => {
        const totalNumOfDay = 7
        const time = day.timestamp + totalNumOfDay * 24 * 60 * 60 * 1000;
        const strTime = this.timeToString(time)
        console.log("StrTime is: " + strTime)

        // Check if the appointment with date strTime exists in the list, load from database if no.
        if (!this.state.items[strTime]) {
            console.log("No such time in items: " + strTime)
            var newDay = {
                "dateString": strTime,
                "day": parseInt(moment(strTime).format("DD")),
                "month": parseInt(moment(strTime).format("MM")),
                "timestamp": time,
                "year": parseInt(moment(strTime).format("YYYY"))
            }
            this.loadItems(newDay);
        }
    }

    render() {
        return (
            <Agenda
                items={this.state.items}
                loadItemsForMonth={this.loadItems.bind(this)}
                onDayChange={(day) => this.renderNextMonth(day)}
                selected={this.state.todayDate}
                minDate={this.state.todayDate}
                pastScrollRange={2}
                futureScrollRange={12}
                renderItem={this.renderItem.bind(this)}
                renderEmptyDate={this.renderEmptyDate.bind(this)}
                rowHasChanged={this.rowHasChanged.bind(this)}
                theme={{
                    selectedDayBackgroundColor: '#FFD54E',
                    selectedDotColor: '#FFFFFF',
                    todayTextColor: '#FFD54E',
                    dotColor: '#FDAA26',
                    agendaTodayColor: '#FFD54E',
                    agendaKnobColor: '#FFD54E',
                }}
                onRefresh={
                    () => this.refreshAppointment()
                }
                refreshing={this.state.isRefreshing}
                renderKnob={() => {
                    return (
                        <View>
                            <Icon name={'chevron-triple-down'} size={20} color={'#FFD54E'} />
                        </View>
                    );
                }}
            />
        );
    }

}


const styles = StyleSheet.create({
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30
    }
});