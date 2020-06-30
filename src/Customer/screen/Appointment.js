import React, { Component } from 'react';
import { Text, StyleSheet, View, SafeAreaView, SectionList, TouchableOpacity } from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { format, add } from 'date-fns';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';

AppointmentItem = ({ appointment, that }) => {

    return (
        <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
            {
                appointment === 'No appointment booked' ?
                    <View style={{ margin: 10, padding: 10, backgroundColor: '#F8F8F8' }}>
                        <Text>No appointment booked</Text>
                    </View>
                    :
                    <TouchableOpacity style={{ margin: 10, padding: 10, backgroundColor: '#F8F8F8' }}
                        onPress={() => that.props.navigation.navigate('AppointmentDetail', {
                            customerId: that.state.customerId,
                            doctorId: appointment.doctorId,
                            date: appointment.date,
                            orderNo: appointment.orderNo,
                            doctorName: appointment.doctorName,
                            startTime: appointment.startTime,
                            address: appointment.address,
                            latitude: appointment.latitude,
                            longtitude: appointment.longtitude
                        })}>
                        <Text>Doctor Name: {appointment.doctorName}</Text>
                        <Text>Time: {appointment.startTime}</Text>
                    </TouchableOpacity>

            }

        </View>
    );
}

export default class Appointment extends Component {

    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
            appointmentList: [{
                date: '',
                data: []
            }]
        }
    }

    async componentDidMount() {

        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

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
                            let appointment = [];
                            let currentDate = new Date();

                            // no appointment booked
                            for (let i = 0; i < 7; i++) {
                                let appointmentListItem = {};
                                appointmentListItem.date = format(add(currentDate, { days: i }), 'MMM dd (E)');
                                appointmentListItem.data = ['No appointment booked'];
                                appointment.push(appointmentListItem);
                            }
                            responseJson.data.forEach(element => {
                                let index = this.getIndexAppointment(appointment, element.date);
                                appointment[index].data = element.appointment;
                            });
                            this.setState({
                                appointmentList: appointment
                            });
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

    getIndexAppointment = (array, date) => {
        for (var i = 0; i < array.length; i++) {
            if (array[i].date === date) {
                return i;
            }
        }
    }

    render() {
        return (
            <View style={[styles.container]}>
                <View style={[styles.title]}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={[styles.textTitle]}>Today</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={[styles.textTitle]}>
                            {
                                format(new Date(), 'dd MMM yyyy')
                            }
                        </Text>
                        <AntDesignIcon name='calendar' size={25} color='#FDAA26' />
                    </View>
                </View>

                <View style={{ flex: 1 }}>
                    <SafeAreaView style={styles.container}>
                        <SectionList
                            sections={this.state.appointmentList}
                            keyExtractor={(item, index) => item + index}
                            renderItem={({ item }) => <AppointmentItem appointment={item} that={this} />}
                            renderSectionHeader={({ section: { date } }) => (
                                <View style={{ backgroundColor: '#ECECEC' }}>
                                    <Text style={{ fontSize: 14, lineHeight: 19, marginHorizontal: 10 }}>{date}</Text>
                                </View>
                            )}
                        />

                    </SafeAreaView>
                </View>

            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    title: {
        marginVertical: 5,
        flexDirection: 'row'
    },
    textTitle: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 16,
        color: '#FDAA26'
    }
})
