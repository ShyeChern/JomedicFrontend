import React, { Component } from 'react'

import { Text, StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Alert, NativeModules, Dimensions } from 'react-native'
import { Avatar } from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { HeaderBackButton } from '@react-navigation/stack';
import { RtcEngine, AgoraView } from 'react-native-agora';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { AndroidBackHandler } from "react-navigation-backhandler";

import { URL_Provider, URL_AuditTrail, CODE_JomedicVideoCall } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'

const { Agora } = NativeModules;                  // Define Agora object as a native module

const {
    FPS30,
    AudioProfileDefault,
    AudioScenarioDefault,
    Adaptative,
} = Agora;                                        // Set defaults for Stream


export default class VideoCall extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // Data from previous screen
            name: '',
            picture: '',
            order_no: '',
            user_id: '',
            tenant_id: '',
            tenant_type: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',
            email: '',
            mobile_no: '',
            servicePrice: 0,

            messageQueue: {},
            orderMaster: {},
            orderDetail: {},

            // Data for Agora Video Chat
            // AppId: 'fd28bb7a43b64c24aca39b278fd4fefc', // Internal Test
            AppId: 'bfead23d9417459298408e5f9f1fb9f4',  // Real Test
            ChannelName: '',

            // Booleans
            isVideoMute: false,
            isAudioMute: false,
            isJoinSuccess: false,
            isLoading: false,
            isAppointment: this.props.route.params.isAppointment,
            isStart: true,

            // For connection details
            peerIds: [],                                //Array for storing connected peers
            uid: Math.floor(Math.random() * 100),       //Generate a UID for local user

        }

        const config = {                              //Setting config of the app
            appid: this.state.AppId,                  //App ID
            channelProfile: 0,                        //Set channel profile as 0 for RTC
            videoEncoderConfig: {                     //Set Video feed encoder settings
                width: 720,
                height: 1080,
                bitrate: 1,
                frameRate: FPS30,
                orientationMode: Adaptative,
            },
            audioProfile: AudioProfileDefault,
            audioScenario: AudioScenarioDefault,
        };
        RtcEngine.init(config);                     //Initialize the RTC engine
    }

    async componentDidMount() {

        this.initialzeData();
        this.customizeHeader();

        // Get the price for video call
        await this.getServicePrice();

        // Start the video call
        this.startVideoCall();
    }

    initialzeData = () => {
        var params = this.props.route.params

        this.setState({
            name: params.name,
            id_number: params.id_number,
            email: params.email,
            mobile_no: params.mobile_no,
            picture: params.picture,
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            tenant_type: params.tenant_type,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
            isAppointment: params.isAppointment,

            // Set the Order Number as Channel Name
            ChannelName: params.order_no,
        })
    }

    updateTenantAvailable = async () => {
        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER024',
            tstamp: getTodayDate(),
            data: {
                tenant_id: this.props.route.params.tenant_id,
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
                console.log("End Order Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("End Order Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false
        }
    }

    updateMessageStatusEnd = async () => {
        // Get the ended order no
        let datas = {
            txn_cd: 'MEDORDER014',
            tstamp: getTodayDate(),
            data: {
                order_no: this.props.route.params.order_no,
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
                console.log('Reject Order Error');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };


        } catch (error) {
            console.log("Reject Order Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }
    }

    updateAppointmentStatusEnd = async () => {
        // Get the ended order no
        let datas = {
            txn_cd: 'MEDORDER060',
            tstamp: getTodayDate(),
            data: {
                order_no: this.props.route.params.order_no,
                episode_date: this.props.route.params.episode_date,
                encounter_date: this.props.route.params.encounter_date
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
                console.log('Reject Order Error');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };


        } catch (error) {
            console.log("Reject Order Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }
    }

    getOrderMasterData = async () => {
        var params = this.props.route.params

        // Get the order no
        let datas = {
            txn_cd: 'MEDORDER002',
            tstamp: getTodayDate(),
            data: {
                user_id: params.user_id,
                order_no: params.order_no,
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
                console.log('Get Order Master Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]

                this.setState({
                    orderMaster: data
                })
                console.log("Order Master Data: ")
                console.log(this.state.orderMaster)

            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Order Master Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    getOrderDetailData = async () => {
        var params = this.props.route.params

        // Get the order no
        let datas = {
            txn_cd: 'MEDORDER006',
            tstamp: getTodayDate(),
            data: {
                order_no: params.order_no,
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
                console.log('Get Order Detail Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]

                this.setState({
                    orderDetail: data
                })

                console.log("Order Detail data: ")
                console.log(this.state.orderDetail)

            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Order Detail Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    getMessageQueueData = async () => {
        var params = this.props.route.params

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER021',
            tstamp: getTodayDate(),
            data: {
                order_no: params.order_no,
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
                this.setState({
                    messageQueue: data
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Message Queue: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    customizeHeader = () => {
        this.props.navigation.setOptions({
            headerTintColor: 'white',
            headerTransparent: false,
            headerShown: true,
            headerTitle: () => (
                <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                    <Avatar rounded
                        size={40}
                        source={{ uri: this.state.picture }} />
                    <Text style={{
                        fontSize: 16,
                        color: '#FFFFFF',
                        alignSelf: 'center',
                        marginLeft: 10,
                    }}>{this.state.name}</Text>
                </View>
            ),
            headerStyle: {
                backgroundColor: '#FFD54E',
            },
            headerLeft: () => <HeaderBackButton
                tintColor={"white"}
                onPress={() => {
                    this.handleEndCall()
                }}
            />,
            headerRight: () => (
                <Menu
                    ref={this.setMenuReference}
                    button={
                        <TouchableOpacity
                            onPress={this.showMenu}>
                            <Icon name="more-vert" size={35} color={"white"} />
                        </TouchableOpacity>
                    }
                >
                    <MenuItem
                        onPress={() => {
                            this.hideMenu();
                            this.props.navigation.navigate("ComplaintList", {
                                order_no: this.props.route.params.order_no,
                                user_id: this.props.route.params.user_id,
                                tenant_id: this.props.route.params.tenant_id,
                                encounter_date: this.props.route.params.encounter_date,
                                episode_date: this.props.route.params.episode_date,
                                id_number: this.props.route.params.id_number
                            });
                        }}>
                        Complaint
                </MenuItem>
                    <MenuItem
                        onPress={() => {
                            this.hideMenu()
                            this.props.navigation.navigate("DiagnosisList", {
                                order_no: this.props.route.params.order_no,
                                user_id: this.props.route.params.user_id,
                                tenant_id: this.props.route.params.tenant_id,
                                encounter_date: this.props.route.params.encounter_date,
                                episode_date: this.props.route.params.episode_date,
                                id_number: this.props.route.params.id_number
                            });
                        }}>
                        Diagnosis
                </MenuItem>
                    <MenuItem
                        onPress={() => {
                            this.hideMenu();
                            this.props.navigation.navigate("VitalSign", {
                                order_no: this.props.route.params.order_no,
                                user_id: this.props.route.params.user_id,
                                tenant_id: this.props.route.params.tenant_id,
                                encounter_date: this.props.route.params.encounter_date,
                                episode_date: this.props.route.params.episode_date,
                                id_number: this.props.route.params.id_number
                            });
                        }}>
                        Vital Signs
                </MenuItem>
                    <MenuItem
                        onPress={() => {
                            this.hideMenu();
                            this.props.navigation.navigate("MedicationList", {
                                order_no: this.props.route.params.order_no,
                                user_id: this.props.route.params.user_id,
                                tenant_id: this.props.route.params.tenant_id,
                                encounter_date: this.props.route.params.encounter_date,
                                episode_date: this.props.route.params.episode_date,
                                id_number: this.props.route.params.id_number
                            });
                        }}>
                        Medication
                </MenuItem>
                </Menu>
            )
        })
    }

    sendPrescriptionSlip = async (tenant_id, pmi_no, order_no) => {
        let datas = {
            txn_cd: "MEDORDER073",
            tstamp: getTodayDate(),
            data: {
                order_no: order_no,
                pmi_no: pmi_no,
                hfc_cd: tenant_id,
            }
        }

        try {
            this.setState({ isLoading: true })

            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'SUCCESS' || json.status === 'success') {
                this.setState({
                    isLoading: false
                });

                return true;
            } else {
                console.log('Send Prescription Error: ');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };

        } catch (error) {
            console.log("Send Prescription Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }

    }

    getServicePrice = async () => {

        // Get the code for online chat
        let datas = {
            txn_cd: 'MEDORDER033',
            tstamp: getTodayDate(),
            data: {
                service_type: CODE_JomedicVideoCall,
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
                this.setState({
                    isLoading: false
                });
                return 0;
            }
            else {
                var data = json.status[0]
                this.setState({
                    servicePrice: data.price,
                    isLoading: false
                })
                return parseFloat(data.price);
            };


        } catch (error) {
            console.log("Get Message Queue: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return 0;
        }
    }

    receivePayment = async (todaydate, payment) => {
        this.setState({ isLoading: true });

        // Get the required datas
        let datas = {
            txn_cd: 'MEDORDER074',
            tstamp: todaydate,
            data: {
                user_id: this.state.tenant_id,
                payment: payment
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
                console.log('Receive Payment Error (Message Queue)');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };


        } catch (error) {
            console.log("Receive Payment Error (Message Queue): " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }

    }

    menu = null;

    setMenuReference = (ref) => {
        this.menu = ref;
    }

    hideMenu = () => {
        this.menu.hide();
    }

    showMenu = () => {
        this.menu.show();
    }

    startVideoCall = () => {
        RtcEngine.on('userJoined', (data) => {
            const { peerIds } = this.state;             //Get currrent peer IDs
            if (peerIds.indexOf(data.uid) === -1) {     //If new user has joined
                this.setState({
                    peerIds: [...peerIds, data.uid],        //add peer ID to state array
                });
            }
        });
        RtcEngine.on('userOffline', (data) => {       //If user leaves
            this.setState({
                peerIds: this.state.peerIds.filter(uid => uid !== data.uid), //remove peer ID from state array
            });
        });
        RtcEngine.on('joinChannelSuccess', (data) => {                   //If Local user joins RTC channel
            RtcEngine.startPreview();                                    //Start RTC preview
            this.setState({
                isJoinSuccess: true,                                     //Set state variable to true
            });
        });
        RtcEngine.joinChannel(this.props.route.params.order_no, this.state.uid);  //Join Channel
        // RtcEngine.joinChannel('ABCDE', this.state.uid);  //Join Channel

        RtcEngine.enableAudio();                                        //Enable the audio

    }

    toggleAudio() {
        let mute = this.state.isAudioMute;
        console.log('Audio toggle', mute);
        RtcEngine.muteLocalAudioStream(!mute);
        this.setState({
            isAudioMute: !mute,
        });
    }

    toggleVideo() {
        let mute = this.state.isVideoMute;
        console.log('Video toggle', mute);
        this.setState({
            isVideoMute: !mute,
        });
        RtcEngine.muteLocalVideoStream(!this.state.isVideoMute);
    }

    endVideoCall() {
        RtcEngine.destroy();
        console.log("Is Appointment: " + this.state.isAppointment.toString())

        // Check the video call is appointment or normal order
        if (this.state.isAppointment) {
            if (!this.updateAppointmentStatusEnd()) {
                Alert.alert("End Appointment Fail", "Fail to end this appointment, please try again.")
            } else {
                console.log("End Appointment Success")
            }
        }

        var todayDate = getTodayDate();
        var isPaymentReceived = this.receivePayment(todayDate, this.state.servicePrice);

        // Update Status to end, and go to Consultation Note Modal
        if (this.updateMessageStatusEnd() && isPaymentReceived && this.sendPrescriptionSlip(this.state.tenant_id, this.state.id_number, this.state.order_no)) {
            this.props.navigation.navigate("RateCustomerModal", {
                tenant_id: this.state.tenant_id,
                tenant_type: this.state.tenant_type,
                user_id: this.state.user_id,
                order_no: this.state.order_no,
                isAppointment: this.state.isAppointment
            })
        }
        else {
            Alert.alert("End Order Fail", "Fail to end this order, please try again.")
        }

    }

    onBackButtonPressAndroid = () => {
        if (this.state.isStart) {
            console.log("Hardware Back button blocked in video call")
            this.handleEndCall();
            return true;
        }
        return false;
    };

    handleEndCall = () => {
        Alert.alert(
            'Leave Video Call Session', // Alert Title
            "Do you want to leave the video call session?" + "\nThe video call will end once you leave." +
            "\n\nPlease ensure that you have saved all consultation notes before leaving the call.", // Alert Message
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
                        this.endVideoCall()
                    }
                }
            ],
            { cancelable: false }   // Set the alert to must be answered
        )
    }

    BottomButtonBar = () => {
        return (

            <View style={styles.buttonBar}>
                <Icon.Button style={styles.iconStyle}
                    backgroundColor="#FFD54E"
                    name={this.state.isAudioMute ? 'mic-off' : 'mic'}
                    onPress={() => this.toggleAudio()}
                />
                <Icon.Button style={styles.iconStyle}
                    backgroundColor="#FFD54E"
                    name="call-end"
                    onPress={() => this.handleEndCall()}
                />
                <Icon.Button style={styles.iconStyle}
                    backgroundColor="#FFD54E"
                    name={this.state.isVideoMute ? 'videocam-off' : 'videocam'}
                    onPress={() => this.toggleVideo()}
                />
            </View>
        )
    }

    VideoView = () => {
        return (
            <View style={{ flex: 1 }}>
                {
                    this.state.peerIds.length > 1
                        ? <View style={{ flex: 1 }}>
                            <View style={{ height: dimensions.height * 3 / 4 - 50 }}>
                                <AgoraView style={{ flex: 1 }}
                                    remoteUid={this.state.peerIds[0]} mode={1} key={this.state.peerIds[0]} />
                            </View>
                            <View style={{ height: dimensions.height / 4 }}>
                                <ScrollView horizontal={true} decelerationRate={0}
                                    snapToInterval={dimensions.width / 2} snapToAlignment={'center'} style={{ width: dimensions.width, height: dimensions.height / 4 }}>
                                    {
                                        this.state.peerIds.slice(1).map((data) => (
                                            <TouchableOpacity style={{ width: dimensions.width / 2, height: dimensions.height / 4 }}
                                                key={data}>
                                                <AgoraView style={{ width: dimensions.width / 2, height: dimensions.height / 4 }}
                                                    remoteUid={data} mode={1} key={data} />
                                            </TouchableOpacity>
                                        ))
                                    }
                                </ScrollView>
                            </View>
                        </View>
                        : this.state.peerIds.length > 0
                            ? <View style={{ height: dimensions.height - 50 }}>
                                <AgoraView style={{ flex: 1 }}
                                    remoteUid={this.state.peerIds[0]} mode={1} />
                            </View>
                            : <View style={{ justifyContent: 'center', flex: 1 }}>
                                <Text style={{ textAlign: 'center' }}>Please wait for customer to connect</Text>
                            </View>

                }
                {
                    !this.state.isVideoMute                                              //view for local video
                        ? <AgoraView style={styles.localVideoStyle} zOrderMediaOverlay={true} showLocalVideo={true} mode={1} />
                        : <View />
                }
            </View>
        )
    }

    render() {
        return (
            <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
                <View style={{ flex: 1 }}>
                    <this.VideoView />
                    <this.BottomButtonBar />
                </View>
            </AndroidBackHandler>
        )
    }
}

let dimensions = {                                            //get dimensions of the device to use in view styles
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
};

const styles = StyleSheet.create({
    buttonBar: {
        height: 50,
        backgroundColor: '#FFD54E',
        display: 'flex',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    localVideoStyle: {
        width: 140,
        height: 160,
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 100,
    },
    iconStyle: {
        fontSize: 34,
        paddingTop: 15,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 15,
        borderRadius: 0,
    },

})
