import React, { Component } from 'react'
import { StyleSheet, Text, View, SafeAreaView, SectionList, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment'

import { getTenantId, getTenantType, getUserId } from '../util/Auth'
import { getTodayDate, getDatesFor7DayFromToday } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from './Loader'

// Data Section
const EMPTY_APPOINTMENT = "No appointment booked"

const DATA = [
    {
        title: 'Mon Jan 27',
        data: ['No appointment booked'],
    },
    {
        title: 'Tue Jan 28',
        data: ['No appointment booked'],
    }, {
        title: 'Wed Jan 29',
        data: ['No appointment booked'],
    }, {
        title: 'Thu Jan 30',
        data: ['No appointment booked'],
    }, {
        title: 'Fri Jan 31',
        data: ['No appointment booked'],
    }, {
        title: 'Sat Feb 1',
        data: ['No appointment booked'],
    }, {
        title: 'Sun Feb 2',
        data: ['No appointment booked'],
    },
];

// Function to render each Item in a Appointment Date
const Item = ({ item, that }) => {
    return (
        <TouchableOpacity
            onPress={() => {
                handlePress(item, that)
            }}
        >
            <View style={styles.itemAppointment}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.title}>{moment(item.start_time).format("hh:mm A")}</Text>
            </View>
        </TouchableOpacity>
    );
}

// Event Handle for clicking the 
const handlePress = (item, that) => {
    that.props.navigation.navigate("AppointmentDetail", {
        name: item.name,
        id_number: item.id_number,
        email: item.email,
        mobile_no: item.mobile_no,
        picture: item.picture,
        order_no: item.order_no,
        user_id: item.user_id,
        tenant_id: that.state.tenant_id,
        tenant_type: that.state.tenant_type,
        appointment_date: item.appointment_date,
        start_time: item.start_time,
        address: item.home_address1 + " " + item.home_address2 + " " + item.home_address3,
    })
}

export default class Appointment extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            onRefresh: false,
            user_id: '',
            tenant_id: '',
            tenant_type: '',

            appointmentList: [],
            appointmentDays: [],
            appontments: [],
        }
    }

    async componentDidMount() {
        await this.initializeData();

        this.refreshAppointmentList();
        // Set Notifications for all today appointment

        // Add hook to refresh profile data when screen is Focus, and if reload is true
        this.props.navigation.addListener('focus',
            event => {
                this.refreshAppointmentList();
            }
        )

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

    loadAppointments = async () => {
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
        var tenant_id = this.state.tenant_id;

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
                        if (filteredAppointment.length <= 0) {
                            appointments.push([])
                        } else {
                            appointments.push(filteredAppointment);
                        }
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
        return appointments
    }

    refreshAppointmentList = (refresh) => {
        this.setState({
            onRefresh: refresh
        })
        this.loadAppointments()
    }

    createAppointmentList = (appointmentDates, appointments) => {
        var newAppointmentList = []

        for (let i = 0; i < 7; i++) {
            newAppointmentList.push({
                title: appointmentDates[i],
                data: appointments[i]
            })
        }

        this.setState({
            appointmentList: newAppointmentList,
            onRefresh: false
        })
    }

    render() {

        // if (this.state.isLoading) {
        //     return (
        //         <Loader isLoading={this.state.isLoading} />
        //     )
        // }

        return (
            <View>
                {/* Appointment List Header View */}
                <View style={styles.flexRow}>
                    <Text style={[styles.headerText, styles.headerContainer]}>Today</Text>
                    <View style={[styles.flexRow, styles.calendarContainer]}>
                        <Text style={styles.headerText}>{moment().format("DD MMM YYYY")}</Text>
                        <TouchableOpacity
                        // onPress={() => alert("Calender Pressed")}
                        >
                            <View style={[styles.flexRow, { marginLeft: 5 }]}>
                                <Icon name='calendar-month-outline'
                                    size={22}
                                    color={'#FDAA26'}></Icon>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Appointment List View */}
                <SafeAreaView style={styles.container}>
                    <SectionList
                        sections={this.state.appointmentList}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => <Item item={item} that={this} />}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.itemDate}>{title}</Text>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.onRefresh}
                                onRefresh={() => this.refreshAppointmentList(true)}
                            />
                        }
                    />
                </SafeAreaView>
            </View>
        )
    }
}

const styles = StyleSheet.create({

    flexRow: {
        flexDirection: 'row',
    },

    headerContainer: {
        flex: 0.5,
        marginLeft: '3%',
        marginRight: '3%',
    },

    calendarContainer: {

    },

    headerText: {
        fontSize: 16,
        color: '#FDAA26',
    },

    itemDate: {
        marginTop: 10,
        marginBottom: 10,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: '3%',
        fontSize: 10,
        backgroundColor: '#ECECEC'
    },

    itemAppointment: {
        fontSize: 10,
        paddingHorizontal: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
})
