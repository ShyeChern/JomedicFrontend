import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native'
import { Avatar } from 'react-native-elements'
import moment from 'moment'

import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { requestCameraAndAudioPermission } from '../util/permission';

// const EMPTY_QUEUE_MODAL_DATA = {
// name: item.name,
// picture: item.picture,
// district: item.district,
// state: item.state,
// txn_code: item.txn_code,
// DOB: item.DOB,
// nationality_cd: item.nationality_cd,
// country: item.country,
// order_no: item.order_no,
// user_id: item.user_id,
// tenant_id: this.props.route.params.tenant_id
// }

export default class QueueModal extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,
            isRejected: false,
            isAccepted: false,
            isBusy: false,

            // Variable from previous screen
            name: '',
            id_number: '',
            email: '',
            mobile_no: '',
            picture: '',
            district: '',
            state: '',
            txn_code: '',
            DOB: '',
            nationality_cd: '',
            country: '',
            order_no: '',
            user_id: '',
            tenant_id: '',
            tenant_type: '',
            txn_date: '',
            encounter_date: '',

            // Variable obtained from current screen
            age: '',
            consultationType: '',
        }
    }

    componentDidMount() {
        this.loadQueueModalData()
    }

    loadQueueModalData = () => {
        // Get the params data
        var params = this.props.route.params;

        // Calculate the age 
        var age = moment().diff(params.DOB, 'year')

        // Determine the consultation type with txn_code
        var consultationType = ''
        if (params.txn_code === 'CHAT') {
            consultationType = "Chat Consultation"
        } else {
            consultationType = "Video Consultation"
        }

        this.setState({
            name: params.name,
            id_number: params.id_number,
            email: params.email,
            mobile_no: params.mobile_no,
            picture: params.picture,
            district: params.district,
            state: params.state,
            txn_code: params.txn_code,
            DOB: params.DOB,
            nationality_cd: params.nationality_cd,
            country: params.country,
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            tenant_type: params.tenant_type,
            txn_date: params.txn_date,
            age: age,
            consultationType: consultationType
        })
    }

    updateMessageStatusReject = async () => {
        // Get the rejected order no
        let datas = {
            txn_cd: 'MEDORDER012',
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

            if (json.status == 'success' || json.status == "SUCCESS") {
                this.setState({
                    isLoading: false
                });

                return true;
            } else {
                console.log('Reject Order Error: ', json.status);
                Alert.alert("Reject Order Error", "Fail to reject order, please try again.\n" + json.status)

                this.setState({
                    isLoading: false
                });

                return false;
            };


        } catch (error) {
            console.log("Reject Order Error: " + error)
            Alert.alert("Reject Order Error", "Fail to reject order, please try again.\n" + error)

            this.setState({
                isLoading: false
            });
            // handleNoInternet()
            return false;
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
                console.log('Accept Order Error', json.status);
                Alert.alert("Accept Order Error", "Fail to accept order, please try again.\n" + json.status)

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
            // handleNoInternet()
            Alert.alert("Accept Order Error", "Fail to accept order, please try again.\n" + error)

            return false;
        }
    }

    updateTenantBusy = async () => {

        console.log(this.state.tenant_id)

        // Get the tenant id
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

            if (json.status == 'success' ||json.status == "SUCCESS") {
                console.log("Tenant Status Updated.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                var error = json.status;
                console.log("Tenant Status Update (Busy) Error: " + error)
                Alert.alert("Tenant Status Update (Busy) Error", "Fail to update tenant status, please try again.\n" + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Tenant Status Update (Busy) Error: " + error)
            this.setState({
                isLoading: false
            });
            // handleNoInternet()
            Alert.alert("Tenant Status Update (Busy) Error", "Fail to update tenant status, please try again.\n" + error)

            return false
        }
    }

    toggleAccept = async () => {
        // Request Permission for video call if needed
        if (this.state.txn_code.toUpperCase() === 'VIDEO') {
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
        }
        // Set the order status to accepted
        // Set Tenant Status to Busy

        var encounter_date = getTodayDate()

        if (this.updateMessageStatusActive(encounter_date) && this.updateTenantBusy()) {
            
            // Determine the txn_code, and active the service
            if (this.state.txn_code.toUpperCase() === 'CHAT') {
                // Navigate to Live Chat Screen
                this.props.navigation.navigate("LiveChat", {
                    isReadOnly: false,
                    name: this.state.name,
                    id_number: this.state.id_number,
                    email: this.state.email,
                    mobile_no: this.state.mobile_no,        
                    picture: this.state.picture,
                    order_no: this.state.order_no,
                    user_id: this.state.user_id,
                    tenant_id: this.state.tenant_id,
                    tenant_type: this.state.tenant_type,
                    episode_date: moment(this.state.txn_date).format("YYYY-MM-DD HH:mm:ss"), // Convert datetime from isoFormat to db format
                    encounter_date: encounter_date,
                })
            } else {
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
                    episode_date: moment(this.state.txn_date).format("YYYY-MM-DD HH:mm:ss"), // Convert datetime from isoFormat to db format
                    encounter_date: encounter_date,
                    isAppointment: false,
                })
            }
        } else {
            console.log("Error: Unable to update order status & tenant status")
        }
    }

    toggleReject = () => {
        // Set the message queue status to Reject and return to queue screen
        if (this.updateMessageStatusReject())
            this.props.navigation.goBack()
    }

    render() {
        return (
            <View style={styles.popUpContainer}>
                {/*Patient Avatar View */}
                <View style={styles.avatarIcon}>
                    <Avatar
                        rounded
                        size='large'
                        source={{ uri: this.state.picture }}
                    />
                </View>

                {/*Patient Data View */}
                <View style={styles.popUpContentContainer}>
                    <Text style={styles.popUpTitle}>{this.state.name}</Text>
                    <Text style={styles.popUpBody}>{this.state.consultationType}</Text>
                    <Text style={styles.popUpBody}>{this.state.age} years old</Text>
                    <Text style={styles.popUpBody}>{this.state.nationality_cd}</Text>
                </View>

                {/* Button View */}
                <View style={styles.buttonBar}>
                    <TouchableOpacity
                        style={styles.buttonDecline}
                        onPress={() => this.toggleReject()}>
                        <Text style={{ fontSize: 18 }}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonAccept}
                        onPress={() => this.toggleAccept()}>
                        <Text style={{ fontSize: 18, color: 'white' }}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    // For the Pop Up
    avatarIcon: {
        alignItems: 'center'
    },

    popUpContainer: {
        marginTop: 'auto',
        marginBottom: 'auto',
        backgroundColor: 'white',
        paddingTop: 22,
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        height: '45%',
        width: '75%',
        alignSelf: 'center',
    },

    popUpContentContainer: {
        flex: 1,
    },

    popUpTitle: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 5,
        alignSelf: 'center',
    },

    popUpBody: {
        fontSize: 14,
        color: '#7C7C7C',
        alignSelf: 'center',
        margin: 5,
    },

    buttonBar: {
        flexDirection: 'row',
    },

    buttonDecline: {
        flex: 1,
        alignItems: "center",
        padding: 15,
        borderBottomLeftRadius: 15,
    },

    buttonAccept: {
        backgroundColor: '#FFD54E',
        flex: 1,
        alignItems: "center",
        padding: 15,
        borderBottomRightRadius: 15,
    },
})
