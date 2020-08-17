import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { URL } from '../util/FetchURL';
import { intervalToDuration, parse, isAfter } from 'date-fns';
import PushNotification from "react-native-push-notification";

export default class AppointmentDetail extends Component {

    constructor(props) {
        super(props)

        this.state = {
            customerId: this.props.route.params.customerId,
            doctorId: this.props.route.params.doctorId,
            date: this.props.route.params.date,
            orderNo: this.props.route.params.orderNo,
            doctorName: this.props.route.params.doctorName,
            startTime: this.props.route.params.startTime,
            address: this.props.route.params.address,
            latitude: this.props.route.params.latitude,
            longtitude: this.props.route.params.longtitude,
            timeReach: false,
        }
    }

    componentDidMount() {
        let date = this.state.date.substring(0, this.state.date.length - 6) + ' ' + this.state.startTime;
        let appointmentDateTime = parse(date, "MMM dd HH:mm", new Date());
        if (isAfter(new Date(), appointmentDateTime)) {
            this.setState({
                timeReach: true
            })
        }

    }

    cancelAppointment = () => {
        let date = this.state.date;
        date = date.substring(0, date.length - 6);

        let startDate = parse(date, "MMM dd", new Date());
        let duration = intervalToDuration({ start: startDate, end: new Date() });
        if (duration.days === 0) {
            alert('You can only cancel the appointment for more than 24 hours');
        }
        else {
            Alert.alert(
                //title
                'Cancel Appointment',
                //body
                'Confirm to cancel the appointment?',
                [
                    { text: 'Cancel' },
                    {
                        text: 'Confirm', onPress: () => {
                            let bodyData = {
                                transactionCode: 'CANCELAPPOINTMENT',
                                timestamp: new Date(),
                                data: {
                                    OrderNo: this.state.orderNo,
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
                                        let id = this.state.orderNo.slice(3, this.state.orderNo.length);
                                        PushNotification.cancelLocalNotifications({ id: id });
                                        alert('Cancel appointment successfully');
                                        this.props.navigation.navigate('Appointment');
                                    }

                                })
                                .catch((error) => {
                                    alert(error);
                                });
                        }
                    },

                ],
                { cancelable: false }
            );
        }
    }

    navigate = () => {
        const longtitude = this.state.longtitude;
        const latitude = this.state.latitude;
        const address = this.state.address;

        var url = "geo:" + longtitude + ", " + latitude + "?q=" + address;

        console.log(url);
        Linking.openURL(url);
    }

    videoConsultation = () => {
        let bodyData = {
            transactionCode: 'APPOINTMENTSTART',
            timestamp: new Date(),
            data: {
                CustomerId: this.state.customerId,
                DoctorId: this.state.doctorId,
                OrderNo: this.state.orderNo
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
                    this.props.navigation.navigate('VideoConsultation', {
                        doctorId: this.state.doctorId,
                        orderNo: this.state.orderNo
                    });
                }
                else {
                    alert(responseJson.value);
                }

            })
            .catch((error) => {
                alert(error);
            });
    }

    render() {
        return (
            <View style={styles.container}>

                <Text style={{ fontSize: 18, lineHeight: 25, fontWeight: '600', textAlign: 'center', marginVertical: 20 }}>Appointment Detail</Text>
                <Image style={{ alignSelf: 'center', width: 100, height: 100 }}
                    source={require('../asset/img/logo.png')} />
                <Text style={styles.warningText}>* Your appointment could be cancel by doctor if you are late 15 minutes.</Text>
                <View style={{ margin: 20, flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Order No:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Date:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Doctor Name:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Time:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Address:</Text>
                    </View>
                    <View style={{ flex: 2 }}>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.orderNo}</Text>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.date}</Text>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.doctorName}</Text>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.startTime}</Text>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.navigate()}>
                            <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.address}</Text>
                        </TouchableOpacity>

                    </View>

                </View>
                {
                    this.state.timeReach ?
                        <View />
                        :
                        <Text style={styles.warningText}>* Consultation is only available at the appointment time</Text>
                }

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
                    <TouchableOpacity style={[styles.btn]}
                        onPress={() => { this.cancelAppointment() }}>
                        <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>Cancel Appointment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, { backgroundColor: this.state.timeReach ? '#FFD44E' : '#EFEFEF' }]}
                        onPress={() => { this.videoConsultation() }}
                        disabled={!this.state.timeReach}
                    >
                        <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>Consultation</Text>
                    </TouchableOpacity>
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
    text: {
        fontSize: 16,
        lineHeight: 19,
        fontWeight: '600',
        flex: 1,
        marginHorizontal: 10
    },
    btn: {
        width: '35%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFD44E',
        borderRadius: 50
    },
    warningText: {
        fontSize: 14,
        color: 'red',
        textAlign: 'center',
        marginTop: 10
    }
})
