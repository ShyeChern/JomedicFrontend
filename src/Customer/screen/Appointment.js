import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, RefreshControl } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { format, add } from 'date-fns';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';

export default class Appointment extends Component {

    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
            appointmentList: [],
            isRefreshing: true,
            items: {},
            minDate: format(new Date(), 'yyyy-MM-dd'),
            maxDate: format(add(new Date(), { days: 60 }), 'yyyy-MM-dd'),
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

        this.getAppointmentData();
    }

    getAppointmentData = () => {
        this.interval = setInterval(() => {
            if (this.props.navigation.isFocused()) {
                let bodyData = {
                    transactionCode: 'APPOINTMENT',
                    timestamp: new Date(),
                    data: {
                        CustomerId: this.state.customerId,
                    }
                };

                fetch(URL, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bodyData),
                }).then((response) => response.json())
                    .then((responseJson) => {

                        if (responseJson.result === true) {

                            this.setState({
                                appointmentList: responseJson.data,
                                isRefreshing: false
                            });

                            this.loadItems();
                        }

                    })
                    .catch((error) => {
                        alert(error);
                    });
            }
        }, 3000);

    }

    componentWillUnmount = () => {
        clearInterval(this.interval);
    }


    loadItems(day) {

        let newList = {};
        for (let i = 0; i < 61; i++) {
            const time = new Date(this.state.minDate).getTime() + i * 24 * 60 * 60 * 1000;
            const date = new Date(time).toISOString().split('T')[0];

            if (!newList[date]) {
                newList[date] = [];
            }
        }


        this.state.appointmentList.forEach(function (item, index) {
            item.appointment.forEach(function (item, index) {
                newList[item.date].push({
                    appointment: item,
                    doctorId: item.doctorId,
                    date: item.date,
                    orderNo: item.orderNo,
                    doctorName: item.doctorName,
                    startTime: item.startTime,
                    address: item.address,
                    latitude: item.latitude,
                    longtitude: item.longtitude,
                    doctorName: item.doctorName,
                    startTime: item.startTime
                })
            })
        })

        this.setState({
            items: newList
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Agenda
                    items={this.state.items}
                    loadItemsForMonth={this.loadItems.bind(this)}
                    selected={this.state.minDate}
                    minDate={this.state.minDate}
                    maxDate={this.state.maxDate}
                    futureScrollRange={2}
                    renderKnob={() => { return (<View ><Text style={{ fontStyle: 'italic', color: '#4A4A4A', paddingVertical: 3 }}>View Calendar</Text></View>); }}
                    renderItem={(item) => {
                        return (
                            <TouchableOpacity style={styles.item}
                                onPress={() => this.props.navigation.navigate('AppointmentDetail', {
                                    customerId: this.state.customerId,
                                    doctorId: item.doctorId,
                                    date: item.date,
                                    orderNo: item.orderNo,
                                    doctorName: item.doctorName,
                                    startTime: item.startTime,
                                    address: item.address,
                                    latitude: item.latitude,
                                    longtitude: item.longtitude
                                })}>
                                <Text>Doctor Name: {item.doctorName}</Text>
                                <Text>Time: {item.startTime}</Text>
                            </TouchableOpacity>
                        );
                    }}
                    renderEmptyDate={() => {
                        return (
                            <View style={styles.emptyDate}>
                                <Text>No appointments booked</Text>
                            </View>
                        );
                    }}
                    rowHasChanged={(r1, r2) => { return r1.name !== r2.name; }}
                    theme={{
                        selectedDayBackgroundColor: '#FFD54E',
                        selectedDotColor: '#FFFFFF',
                        todayTextColor: '#FFD54E',
                        dotColor: '#FDAA26',
                        agendaTodayColor: '#FFD54E',
                        agendaKnobColor: '#FFD54E',
                    }}
                    refreshControl={<RefreshControl refreshing={this.state.isRefreshing} />}
                />
            </View>

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17,
        height: 60,
        justifyContent: 'center'
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30,
        justifyContent: 'center',
    }
})
