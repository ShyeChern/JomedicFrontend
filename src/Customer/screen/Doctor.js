import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, Linking } from 'react-native';
import { Divider } from 'react-native-elements';
import Modal from "react-native-modal";
import Detail from '../component/doctorAction/Detail';
import WaitingDoctorAcceptModal from '../component/modal/WaitingDoctorAcceptModal';
import LiveChatInfo from '../component/doctorAction/LiveChatInfo';
import VideoConsultationInfo from '../component/doctorAction/VideoConsultationInfo';
import AppointmentTime from '../component/doctorAction/AppointmentTime';
import MakeAppointment from '../component/doctorAction/MakeAppointment';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';
import { format } from 'date-fns';
import PushNotification from "react-native-push-notification";


export default class Doctor extends Component {

    constructor(props) {
        super(props)
        this.state = {
            doctorId: '',
            doctorImage: this.props.route.params.picture,
            doctorName: '',
            doctorSpecialist: '',
            doctorStatus: '',
            action: 'detail',
            graduateFrom: '',
            practicePlace: '',
            preferredLanguage: '',
            experience: '',
            workLocation: '',
            address: '',
            consultationFee: 0,
            videoConsultationFee: 0,
            walletBalance: 0,
            requestChatFeedback: '',
            waitingDoctorAcceptModal: false,
            appointmentTimeList: [],
            customerId: '',
            selectedAppointment: {},
        }

    }

    async componentDidMount() {
        await getCustomerId()
            .then(response => this.setState({ customerId: response }))
            .catch(error => alert(error));

        let bodyData = {
            transactionCode: 'DOCTORDETAIL',
            timestamp: new Date(),
            data: {
                DoctorId: this.props.route.params.doctorId,
                CustomerId: this.state.customerId
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
                        doctorId: responseJson.data[0].tenant_id,
                        doctorName: responseJson.data[0].tenant_name,
                        doctorSpecialist: responseJson.data[0].specialty_cd,
                        doctorStatus: responseJson.data[0].status,
                        graduateFrom: responseJson.data[0].university_name,
                        practicePlace: responseJson.data[0].university_name,
                        preferredLanguage: responseJson.data[0].qualification_cd,
                        experience: responseJson.data[0].graduation_year + ' Year(s)',
                        consultationFee: responseJson.data[0].chat,
                        videoConsultationFee: responseJson.data[0].video,
                        appointmentTimeList: responseJson.data[0].appointmentTimeList,
                        workLocation: responseJson.data[0].hfc_name,
                        address: "geo:" + responseJson.data[0].longitude + ", " + responseJson.data[0].latitude + "?q="
                            + responseJson.data[0].hfc_name + "+" + responseJson.data[0].address,
                        // walletBalance: responseJson.data[0].walletBalance,
                    });

                }
                else {
                    alert(JSON.stringify(responseJson));
                }

            })
            .catch((error) => {
                alert(error);
            });

        let bodyData2 = {
            transactionCode: 'GETWALLET',
            timestamp: new Date(),
            data: {
                CustomerId: this.state.customerId
            }
        };

        fetch(URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData2),
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result === true) {
                    this.setState({
                        walletBalance: responseJson.data[0].available_amt,
                    });
                }
                else {
                    alert(JSON.stringify(responseJson));
                }

            })
            .catch((error) => {
                alert(error);
            });

    }

    doctorActionChange = (action) => {
        this.setState({
            action: action
        });
    }

    requestChat = () => {

        // compare money
        if (this.state.consultationFee > this.state.walletBalance) {
            alert('Not Enough Balance. Please top up to use the service.');
        }
        else {
            let bodyData = {
                transactionCode: 'CREATECHAT',
                timestamp: new Date(),
                data: {
                    CustomerId: this.state.customerId,
                    DoctorId: this.state.doctorId
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
                        // this.props.navigation.navigate('LiveChat', {
                        //     DoctorId: responseJson.data[0].receiver_id,
                        //     DoctorName: this.state.doctorName,
                        //     DoctorSpecialist: this.state.doctorSpecialist,
                        //     OrderNo: responseJson.data[0].order_no,
                        //     DoctorImage: this.state.doctorImage,
                        // });
                        this.setState({
                            requestChatFeedback: responseJson.data,
                            action: "detail",
                            waitingDoctorAcceptModal: true
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

    submitWaitingDoctorAcceptModal = () => {
        this.setState({ waitingDoctorAcceptModal: false });
    }

    requestVideoConsultation = () => {

        if (this.state.videoConsultationFee > this.state.walletBalance) {
            alert('Not Enough Balance. Please top up to use the service.');
        }
        else {
            if (this.state.doctorStatus === 'Available') {

                let bodyData = {
                    transactionCode: 'CREATEVIDEO',
                    timestamp: new Date(),
                    data: {
                        CustomerId: this.state.customerId,
                        DoctorId: this.state.doctorId
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
                                orderNo: responseJson.data.orderNo
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

    }

    requestChooseAppointmentTime = (id) => {

        this.setState({
            selectedAppointment: this.state.appointmentTimeList[id]
        })
        this.doctorActionChange('MakeAppointment');
    }

    requestMakeAppointment = (makeAppointment) => {

        let bodyData = {
            transactionCode: 'MAKEAPPOINTMENT',
            timestamp: new Date(),
            data: {
                CustomerId: this.state.customerId,
                DoctorId: this.state.doctorId,
                Date: makeAppointment.date,
                Time: makeAppointment.time
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
                    alert('Make Appointment Success');
                    let id = responseJson.orderNo.slice(3, responseJson.orderNo.length);
                    PushNotification.localNotificationSchedule({
                        id: id,
                        title: "You have Appointment Today!", // (optional)
                        message: "Don't forget your today appointment with Doctor " + this.state.doctorName +
                            " at " + format(makeAppointment.time, 'HH:mm'),
                        // date: new Date(Date.now() + 5 * 1000),
                        date: new Date(makeAppointment.date),

                    })


                    this.props.navigation.navigate('Appointment');
                }
                else {
                    alert(responseJson.value);
                }

            })
            .catch((error) => {
                alert(error);
            });

    }

    doctorAction = () => {
        if (this.state.action == 'detail') {
            return (
                <Detail graduateFrom={this.state.graduateFrom} practicePlace={this.state.practicePlace} preferredLanguage={this.state.preferredLanguage}
                    experience={this.state.experience} workLocation={this.state.workLocation} address={this.state.address}
                    doctorActionChange={this.doctorActionChange} />
            )
        }
        else if (this.state.action == 'LiveChatInfo') {
            return (
                <LiveChatInfo consultationFee={this.state.consultationFee} walletBalance={this.state.walletBalance}
                    requestChat={this.requestChat} doctorActionChange={this.doctorActionChange} />
            )
        }
        else if (this.state.action == 'VideoConsultation') {
            return (
                <VideoConsultationInfo doctorStatus={this.state.doctorStatus} requestVideoConsultation={this.requestVideoConsultation}
                    videoConsultationFee={this.state.videoConsultationFee} walletBalance={this.state.walletBalance}
                    doctorActionChange={this.doctorActionChange} />
            )

        }
        else if (this.state.action == 'AppointmentTime') {
            return (
                <AppointmentTime appointmentTimeList={this.state.appointmentTimeList} requestChooseAppointmentTime={this.requestChooseAppointmentTime}
                    doctorActionChange={this.doctorActionChange} />
            )
        }
        else if (this.state.action == 'MakeAppointment') {
            return (
                <MakeAppointment selectedAppointment={this.state.selectedAppointment} requestMakeAppointment={this.requestMakeAppointment}
                    doctorActionChange={this.doctorActionChange} />
            )
        }
    }

    render() {
        return (
            <View style={[styles.container]}>
                <Modal isVisible={this.state.waitingDoctorAcceptModal}>
                    <WaitingDoctorAcceptModal submitWaitingDoctorAcceptModal={this.submitWaitingDoctorAcceptModal}
                        requestChatFeedback={this.state.requestChatFeedback} />
                </Modal>

                <View>
                    <View style={[styles.doctorView]}>
                        <Image style={[styles.doctorImage]} source={{ uri: 'data:image/jpg;base64,' + this.state.doctorImage }} />
                        <Text style={{ fontWeight: '600', fontSize: 18, lineHeight: 25, color: '#000000' }}>{this.state.doctorName}</Text>
                        <Text style={[styles.text, { color: '#979797' }]}>{this.state.doctorSpecialist}</Text>
                    </View>
                </View>

                <Divider style={{ backgroundColor: 'black', height: 1, marginTop: 20 }} />

                <View style={[styles.doctorAction]}>
                    {this.doctorAction()}
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    doctorView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30
    },
    doctorImage: {
        margin: 5,
        width: 107,
        height: 107,
        borderRadius: 107 / 2
    },
    doctorAction: {
        flex: 1,
        backgroundColor: '#FCFCFC'
    },

})
