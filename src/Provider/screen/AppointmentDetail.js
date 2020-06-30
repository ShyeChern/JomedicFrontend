import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { URL_Provider } from '../util/provider';
import { intervalToDuration, parse, isAfter } from 'date-fns';
import PushNotification from "react-native-push-notification";
import moment from 'moment';
import BackgroundTimer from 'react-native-background-timer'

import { getTodayDate } from '../util/getDate'
import { requestCameraAndAudioPermission } from "../util/permission"
import { handleNoInternet } from '../util/CheckConn'
import Loader from '../screen/Loader'

// Maximum Time for the doctor to wait before an appointment can be cancelled (In minutes)
const MAX_TIME = 15

export default class AppointmentDetail extends Component {

    constructor(props) {
        super(props)

        var params = this.props.route.params

        this.state = {
            // Booleans 
            isLoading: false,
            isAppointmentTimeReached: false,
            isAppointmentActivated: false,
            isTimeoutExecuted: false,
            isTimerStart: false,
            isTimeoutStart: false,
            messageQueue: {},

            // Data from previous screen 
            name: params.name || '',
            id_number: params.id_number || '',
            email: params.email || '',
            mobile_no: params.mobile_no || '',
            picture: params.picture || "",
            order_no: params.order_no || "",
            user_id: params.user_id || "",
            tenant_id: params.tenant_id || "",
            tenant_type: params.tenant_type || "",
            appointment_date: params.appointment_date || "",
            start_time: params.start_time || "",
            address: params.address || ""
        }
    }

    async componentDidMount() {
        // 1-Check if system time is later than appointment time, activate timer if yes
        if (moment().isAfter(moment(this.state.start_time))) {
            // Run the message queue once at time = 0 second
            this.getMessageQueueData()
            this.startTimer()

            // Calculate the remaining time before reaching the cancel time
            var duration;

            // If the system datetime exceeds the cancel time boundary, set remaining time to 0
            if (moment().isAfter(moment(this.state.start_time).add(MAX_TIME, 'm'))) {
                duration = 0
            } else {
                duration = moment(this.state.start_time).add(MAX_TIME, 'm').diff(moment())
            }
            this.startTimeout(duration)
            console.log("Duration: " + duration)
        }

        // 2-Search is appointment activated (jlk_message_queue exists with the order_no), activate call button if yes (in timer)
        // 3-Check is appointment not activated after 15 minutes, activate cancel button if yes (timeout)
    }

    componentWillUnmount() {
        // End the timer
        if (this.state.isTimerStart) {
            this.endTimer();
        }
        // End the timeout
        if (this.state.isTimeoutStart) {
            this.endTimeout()
        }
    }

    getMessageQueueData = async () => {
        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER062',
            tstamp: getTodayDate(),
            data: {
                order_no: this.state.order_no,
            }
        }

        try {
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
                console.log('Get Message Queue Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]
                if (data) {
                    this.setState({
                        messageQueue: data,
                        isAppointmentActivated: true
                    })
                    // End the timer if appointment activated
                    this.endTimer()

                    // End the timeout as it is not needed anymore
                    this.endTimeout()
                }
            };
        } catch (error) {
            console.log("Get Message Queue Error: " + error)
            handleNoInternet()
        }
    }

    updateMessageStatusActive = async () => {

        // Get the accepted order no and update it
        let datas = {
            txn_cd: 'MEDORDER013',
            tstamp: getTodayDate(),
            data: {
                order_no: this.state.order_no,
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'success' || json.status == "SUCCESS") {
                console.log("Queue status updated.")
                this.setState({
                    isLoading: false
                });

                return true;
            }
            else {
                console.log('Accept Order Error');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;

            };


        } catch (error) {
            console.log("Accept Order Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()

            return false;
        }
    }

    updateTenantBusy = async () => {
        let datas = {
            txn_cd: 'MEDORDER026',
            tstamp: getTodayDate(),
            data: {
                tenant_id: this.state.tenant_id,
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status == 'success' || json.status == "SUCCESS") {
                console.log("Tenant Status Updated.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                console.log("Accept Appointment Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Accept Appointment Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false
        }
    }

    cancelAppointment = async () => {
        let datas = {
            txn_cd: 'MEDORDER061',
            tstamp: getTodayDate(),
            data: {
                order_no: this.state.order_no,
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'success' || json.status == "SUCCESS") {
                console.log("Appointment canceled.")
                this.setState({
                    isLoading: false
                });
                this.props.navigation.goBack();
            }
            else {
                console.log('Cancel Appointment Error');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

            };


        } catch (error) {
            console.log("Cancel Appointment Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    startAppointmentVideo = async () => {

    }

    handleCancel = async () => {
        Alert.alert(
            'Cancel Appointment', // Alert Title
            "Do you want to cancel this appointment?", // Alert Message
            [
                {
                    text: "No", // No Button
                    onPress: () => {
                        console.log("No Pressed")    // Do nothing~~~XD
                    }
                },
                {
                    text: "Yes", // Yes Button
                    onPress: () => {
                        console.log("Yes pressed")
                        this.cancelAppointment()
                    }
                }
            ],
            { cancelable: false }   // Set the alert to must be answered
        )
    }

    handleStart = async () => {
        // Request Permission for video call if needed
        if (Platform.OS === 'android') {
            var result = await requestCameraAndAudioPermission() //Request required permissions from Android
            if (!result) {
                // Cancel the operation if no permission was granted
                Alert.alert("Permission Denied", "You do not grant the permission to use the camera and microphone for video call.")
                return;
            } else {
                console.log("Permission Accepted")
            }
        }

        // Set the order status to accepted
        // Set Tenant Status to Busy
        var encounter_date = getTodayDate()

        if (this.updateMessageStatusActive() && this.updateTenantBusy()) {
            // Discard this screen
            this.props.navigation.goBack()

            // Determine the txn_code, and active the service
            // Navigate to Video Call Screen
            this.props.navigation.navigate("VideoCall", {
                name: this.state.name,
                id_number: this.state.id_number,
                email: this.state.email,
                mobile_no: this.state.mobile_no,
                picture: this.state.picture,
                order_no: this.state.order_no,
                user_id: this.state.user_id,
                tenant_id: this.state.tenant_id,
                tenant_type: this.state.tenant_type,
                episode_date: moment(this.state.messageQueue.txn_date).format("YYYY-MM-DD HH:mm:ss"), // Convert datetime from isoFormat to db format
                encounter_date: encounter_date,
                isAppointment: true,
                messageQueue: this.state.messageQueue
            })

        } else {
            console.log("Error: Unable to update order status & tenant status")
        }

    }

    timer = null

    startTimer = () => {
        this.timer = BackgroundTimer.setInterval(() => {
            // this will be executed every 5000 ms (5s)
            // even when app is the the background
            // Check status
            this.getMessageQueueData()
            console.log("Timer Running in Appointment Detail...")
        }, 5000);
        this.setState({
            isTimerStart: true
        })

    }

    endTimer = () => {
        BackgroundTimer.clearInterval(this.timer);
        console.log("Appointment Detail Timer ends.")
        this.setState({
            isTimerStart: false
        })
    }

    timeout = null

    startTimeout = (timeoutValue = (MAX_TIME * 60000)) => {
        this.timeout = BackgroundTimer.setTimeout(() => {
            // this will be executed once after 900000 ms (15 minutes)
            // even when app is the the background
            this.setState({
                isTimeoutExecuted: true
            })
        }, timeoutValue);

        this.setState({
            isTimeoutStart: true
        })
    }

    // Timeout will be cleared if video call cab be started (Consultation button activated) or unmounted
    endTimeout = () => {
        BackgroundTimer.clearTimeout(this.timeout);
        this.setState({
            isTimeoutStart: false
        })
    }


    navigate = () => {
        this.props.navigation.navigate("Map", {
            address: this.state.address
        })
    }

    render() {
        // display detail, navigate etc
        return (
            <View style={styles.container}>

                <Text style={{ fontSize: 18, lineHeight: 25, fontWeight: '600', textAlign: 'center', marginVertical: 20 }}>Appointment Detail</Text>
                <Image style={{ alignSelf: 'center', width: 100, height: 100 }}
                    source={require('../img/logo.png')} />

                <View style={{ margin: 30, flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Order No:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Date:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Customer Name:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Time:</Text>
                        <Text style={[styles.text, { fontWeight: 'bold', textAlign: 'right' }]}>Address:</Text>
                    </View>
                    <View style={{ flex: 2 }}>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.order_no}</Text>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{moment(this.state.appointment_date).format("DD MMM YYYY (ddd)")}</Text>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.name}</Text>
                        <Text style={[styles.text, { textAlign: 'left' }]}>{moment(this.state.start_time).format("hh:mm A")}</Text>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.navigate()}>
                            <Text style={[styles.text, { textAlign: 'left' }]}>{this.state.address}</Text>
                        </TouchableOpacity>

                    </View>

                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: (this.state.isTimeoutExecuted && !this.state.isAppointmentActivated) ? '#FFD44E' : '#EFEFEF' }]}
                        onPress={() => { this.handleCancel() }}
                        disabled={!(this.state.isTimeoutExecuted && !this.state.isAppointmentActivated)}
                    >
                        <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>Cancel Appointment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, { backgroundColor: this.state.isAppointmentActivated ? '#FFD44E' : '#EFEFEF' }]}
                        onPress={() => { this.handleStart() }}
                        disabled={!this.state.isAppointmentActivated}
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
    }
})
