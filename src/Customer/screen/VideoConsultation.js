import React, { Component } from 'react';
import { View, StyleSheet, NativeModules, Text, TouchableOpacity, BackHandler } from 'react-native';
import { RtcEngine, AgoraView } from 'react-native-agora';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackgroundTimer from 'react-native-background-timer';
import { requestVideoCallPermission } from '../util/permission/Permission';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';

const { Agora } = NativeModules;                  //Define Agora object as a native module

const {
    FPS30,
    AudioProfileDefault,
    AudioScenarioDefault,
    Adaptative,
} = Agora;                                        //Set defaults for Stream

export default class VideoConsultation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            permissionCheck: false,
            peerIds: [],                                //Array for storing connected peers
            uid: Math.floor(Math.random() * 100),       //Generate a UID for local user (urself)
            appid: 'bfead23d9417459298408e5f9f1fb9f4',  //Enter the App ID generated from the Agora Website
            channelName: this.props.route.params.orderNo,        //Channel Name for the current session, 
            videoMute: false,                             //State variable for Video Mute
            joinSucceed: false,                         //State variable for storing success
            peerMuteVideo: false,
            startTime: '',
            customerId: '',
            doctorId: this.props.route.params.doctorId,
            orderNo: this.props.route.params.orderNo,
            interval:'',
        };

        const config = {                            //Setting config of the app
            appid: this.state.appid,                  //App ID
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

    componentDidMount() {
        this.checkPermission();

        alert('Channel Name(doctorId): ' + this.state.channelName);

        this.state.interval = BackgroundTimer.setInterval(() => {
            this.checkReject();
        }, 2000);

        RtcEngine.on('userJoined', (data) => {
            const { peerIds } = this.state;             //Get currrent peer IDs
            if (peerIds.indexOf(data.uid) === -1) {     //If new user has joined
                this.setState({
                    peerIds: [...peerIds, data.uid],        //add peer ID to state array
                    startTime: new Date()
                });
            }
        });

        RtcEngine.on('userOffline', (data) => {       //If user leaves
            this.setState({
                peerIds: this.state.peerIds.filter(uid => uid !== data.uid), //remove peer ID from state array
            });
            this.endCall(new Date());
        });

        RtcEngine.on('joinChannelSuccess', (data) => {                   //If Local user joins RTC channel
            RtcEngine.startPreview();                                      //Start RTC preview
            this.setState({
                joinSucceed: true,                                           //Set state variable to true
            });
        });

        RtcEngine.joinChannel(this.state.channelName, this.state.uid);  //Join Channel
        RtcEngine.enableAudio();                                        //Enable the audio

        RtcEngine.on('remoteVideoStateChanged', (data) => {
            if (data.reason === 5) {
                this.setState({
                    peerMuteVideo: true
                })
            }
            else if (data.reason === 6) {
                this.setState({
                    peerMuteVideo: false
                })
            }

        })

        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); // maybe not necessary as cause memory leaked
    }

    checkPermission = async () => {
        if (Platform.OS === 'android') {
            await requestVideoCallPermission().then(response => {
                if (response["android.permission.CAMERA"] !== 'granted' || response["android.permission.RECORD_AUDIO"] !== 'granted') {
                    alert('Please enable the permission before video consultation');
                    this.props.navigation.goBack();
                }
                else {
                    this.setState({ permissionCheck: true });
                    RtcEngine.enableLocalVideo(true);
                }
            });
        }

    }

    handleBackPress = () => {
        if (this.props.navigation.isFocused()) {
            return true;
        }
    }

    switchCamera = () => {
        RtcEngine.switchCamera();
    }

    toggleVideo = () => {
        let mute = this.state.videoMute;
        this.setState({
            videoMute: !mute,
        });
        RtcEngine.muteLocalVideoStream(!this.state.videoMute);
    }

    checkReject = () => {
        let bodyData = {
            transactionCode: 'CHECKREJECT',
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
                    if (responseJson.data[0].order_status == 'reject') {
                        this.props.navigation.goBack();
                        BackgroundTimer.clearInterval(this.state.interval);
                        alert('Doctor has reject your request');
                    }
                    else if (responseJson.data[0].order_status == 'active'){
                        BackgroundTimer.clearInterval(this.state.interval);
                    }

                }
                else {
                    alert(responseJson.value);
                }

            })
            .catch((error) => {
                alert(error);
            });
    }

    endCall = async (endTime) => {
        RtcEngine.destroy();

        if (this.state.startTime === '') {
            let bodyData = {
                transactionCode: 'CANCELVIDEO',
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
                        this.props.navigation.goBack();
                    }
                    else {
                        alert(responseJson.value);
                    }

                })
                .catch((error) => {
                    alert(error);
                });
        }

        else {
            await getCustomerId()
                .then(response => this.setState({ customerId: response }))
                .catch(error => alert(error));

            // chat duration in millisecond
            let chatDuration = endTime - this.state.startTime;

            // Math.floor((endTime - this.state.startTime) / 1000 / 60);  in minutes

            let bodyData = {
                transactionCode: 'VIDEOEND',
                timestamp: new Date(),
                data: {
                    OrderNo: this.state.orderNo,
                    CustomerId: this.state.customerId,
                    ChatDuration: chatDuration,
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
                        this.props.navigation.navigate('ConsultationReceipt', {
                            chatDuration: responseJson.data[0].item_desc,
                            doctorId: this.state.doctorId,
                            orderNo: responseJson.data[0].order_no,
                            service: responseJson.data[0].service_name,
                            consultationFee: responseJson.data[0].amount,
                            totalFee: responseJson.data[0].amount,
                            doctorName: responseJson.data[0].tenant_name,
                            dateTime: responseJson.data[0].txn_date,
                            feedbackModal: true,
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
    }

    videoView = () => {
        if (!this.state.permissionCheck) {
            return (
                <View style={{ flex: 1 }} />
            )
        }
        else {

            return (
                <View style={{ flex: 1 }}>
                    {
                        this.state.peerIds.length > 0 ?
                            this.state.peerMuteVideo ?
                                <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#FFFFFF' }}>Doctor muted the video</Text>
                                </View>
                                :
                                <View style={{ flex: 1 }}>
                                    <AgoraView style={{ flex: 1 }}
                                        remoteUid={this.state.peerIds[0]} mode={1} />
                                </View>
                            :
                            <View style={{ justifyContent: 'center', flex: 1 }}>
                                <Text style={{ textAlign: 'center' }}>Please wait for doctor to connect</Text>
                            </View>
                    }
                    {
                        !this.state.videoMute                                              //view for local video
                            ? <AgoraView style={styles.localVideoStyle} zOrderMediaOverlay={true} showLocalVideo={true} mode={1} />
                            : <View />
                    }
                </View>
            );
        }


    }

    render() {
        return (
            <View style={styles.container}>

                {this.videoView()}
                <View style={styles.btnBar}>
                    <TouchableOpacity style={styles.btn}
                        onPress={() => this.switchCamera()}>
                        <MaterialIcons name="autorenew" color="#FFFFFF" size={30} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn}
                        onPress={() => this.endCall(new Date())}>
                        <MaterialIcons name="call-end" color="#FFFFFF" size={30} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn}
                        onPress={() => this.toggleVideo()}>
                        <MaterialIcons name={this.state.videoMute ? 'videocam-off' : 'videocam'} color="#FFFFFF" size={30} />
                    </TouchableOpacity>
                </View>
            </View>

        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    btnBar: {
        backgroundColor: '#FFD44E',
        width: '100%',
        flexDirection: 'row',
    },
    btn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15
    },
    localVideoStyle: {
        width: 140,
        height: 160,
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 100,
    }
});

