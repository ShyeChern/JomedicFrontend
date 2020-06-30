import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, TextInput, BackHandler, ScrollView, Keyboard } from 'react-native';
import Modal from "react-native-modal";
import { format } from 'date-fns';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import DoctorBusyModal from '../component/modal/DoctorBusyModal';
import WaitingDoctorModal from '../component/modal/WaitingDoctorModal';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';

import BackgroundTimer from 'react-native-background-timer';

export default class LiveChat extends Component {

    constructor(props) {
        super(props);

        this.state = {
            doctor: this.props.route.params.DoctorName,
            doctorImage: this.props.route.params.DoctorImage,
            doctorSpecialist: this.props.route.params.DoctorSpecialist,
            doctorBusyModal: false,
            waitingDoctorModal: false,
            doctorId: this.props.route.params.DoctorId,
            customerId: '',
            orderNo: this.props.route.params.OrderNo,
            message: '',
            messages: [],
            showAccessory: false,
            interval: '',
        }

        this.keyboardDidShow = this.keyboardDidShow.bind(this);

    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

        this.state.interval = BackgroundTimer.setInterval(() => {
            this.getMessage();
        }, 2000);

        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.keyboardDidShow,
        );

    }

    componentWillUnmount() {

        BackgroundTimer.clearInterval(this.state.interval);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        this.keyboardDidShowListener.remove();
    }

    submitDoctorBusyModal = (action) => {
        if (action === true) {
            this.setState({
                doctorBusyModal: !this.state.doctorBusyModal,
                waitingDoctorModal: true
            })
        }
        else {
            this.props.navigation.navigate('Doctor');
        }
    }

    submitWaitingDoctorModal = () => {
        this.setState({
            waitingDoctorModal: false
        })
    }

    keyboardDidShow = () => {
        this.refs.scrollView.scrollToEnd();
    }

    handleBackPress = () => {
        if (this.state.showAccessory) {
            this.setState({ showAccessory: false })
            return true;
        }
        else {
            return false;
        }
    }


    send = () => {
        let bodyData = {
            transactionCode: 'SENDCHAT',
            timestamp: new Date(),
            data: {
                Message: this.state.message,
                OrderNo: this.state.orderNo,
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
                    this.setState({
                        message: ''
                    });

                    this.getMessage();

                }
                else {
                    alert(responseJson.value);
                }

            })
            .catch((error) => {
                alert(error);
            });

    }

    getMessage = () => {
        let bodyData = {
            transactionCode: 'GETCHAT',
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
                    let messages = []
                    if (responseJson.order_status === 'active') {
                        responseJson.data.forEach(element => {
                            let messageObject = {
                                messageId: element.message_id,
                                message: element.message,
                                userType: element.user_type
                            }
                            messages.push(messageObject);
                        });

                        this.setState({
                            messages: messages
                        })
                    }
                    else{
                        BackgroundTimer.clearInterval(this.state.interval);
                        this.chatEnded();
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

    endChat = () => {
        let bodyData = {
            transactionCode: 'ENDLIVECHAT',
            timestamp: new Date(),
            data: {
                OrderNo: this.state.orderNo,
                DoctorId: this.state.doctorId,
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
                    BackgroundTimer.clearInterval(this.state.interval);
                    this.props.navigation.navigate('ConsultationReceipt', {
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

    chatEnded = () => {
        let bodyData = {
            transactionCode: 'CHATENDED',
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
                    
                    this.props.navigation.navigate('ConsultationReceipt', {
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

    render() {
        return (
            <View style={[styles.container]}>

                <Modal isVisible={this.state.doctorBusyModal}>
                    <DoctorBusyModal submitDoctorBusyModal={this.submitDoctorBusyModal} />
                </Modal>

                <Modal isVisible={this.state.waitingDoctorModal}>
                    <WaitingDoctorModal submitWaitingDoctorModal={this.submitWaitingDoctorModal} />
                </Modal>

                <View style={[styles.chatPersonView]}>
                    <View style={{ marginLeft: 50 }}>
                        <Image style={[styles.doctorImage]} source={{ uri: 'data:image/jpg;base64,' + this.state.doctorImage }} />
                    </View>
                    <View style={{ marginHorizontal: 20 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 19, color: '#FFFFFF' }}>{this.state.doctor}</Text>
                        <Text style={{ fontWeight: '600', fontSize: 12, lineHeight: 16, color: '#FFFFFF' }}>{this.state.doctorSpecialist}</Text>
                    </View>
                </View>

                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }} ref='scrollView'
                        onContentSizeChange={() => {
                            this.refs.scrollView.scrollToEnd();
                        }}
                    >
                        {/* date of start chatting in database? check in message id json file */}
                        <Text style={{ alignSelf: 'center', marginVertical: 5 }}>{format(new Date(), 'dd MMM yyyy')}</Text>
                        {this.state.messages.map((message, index) => {
                            let messagePosition = message.userType == 'customer' ? { marginLeft: 50, marginRight: 10, alignSelf: 'flex-end' } : { marginLeft: 10, marginRight: 50, alignSelf: 'flex-start' }
                            return (
                                <View key={index} style={[messagePosition, { backgroundColor: '#FFFFFF', borderRadius: 5, marginVertical: 8 }]}>
                                    <Text style={{ alignSelf: 'flex-start', color: '#4F4F4F', fontWeight: '600', fontSize: 11, lineHeight: 15, margin: 8 }}>{message.message}</Text>
                                    <Text style={{ alignSelf: 'flex-end', color: '#D6D6D6', fontWeight: '600', fontSize: 10, lineHeight: 14, marginHorizontal: 8, marginBottom: 5 }}>{message.messageId}</Text>
                                </View>
                            )


                        })}

                    </ScrollView>

                    <View style={{ justifyContent: 'flex-end' }}>
                        <View style={{ flexDirection: 'row' }}>
                            {
                                this.state.showAccessory === true ?

                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1, marginBottom: 5 }}>
                                        <View style={{ backgroundColor: '#FFFFFF20', flex: 1, borderRadius: 15, borderWidth: .1 }}>

                                            <TouchableOpacity style={{
                                                width: '20%', height: 80, justifyContent: 'center', alignItems: 'center',
                                                backgroundColor: '#FFD44E', borderWidth: 1, borderColor: '#FDAA26', margin: 10, borderRadius: 15
                                            }}
                                                onPress={() => this.endChat()}
                                            >

                                                <Text style={{ fontSize: 14, lineHeight: 19, color: '#FFFFFF' }}>End Chat</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    :
                                    <View />
                            }
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={{ backgroundColor: '#FFD44E', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}
                                onPress={() => this.setState({ showAccessory: !this.state.showAccessory })}>

                                <EntypoIcon name={this.state.showAccessory === false ? 'chevron-right' : 'chevron-up'} size={20} color='#000000' />

                            </TouchableOpacity>
                            <TextInput style={{ backgroundColor: '#FFFFFF', flex: 1 }}
                                value={this.state.message}
                                onChangeText={(message) => this.setState({ message })}
                                returnKeyType='none'
                                multiline={true}
                                placeholder={'Type your message here...'}
                            />
                            {
                                this.state.message === '' ?
                                    <View />
                                    :
                                    <TouchableOpacity style={{ backgroundColor: '#FFD44E', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 }}
                                        onPress={() => this.send()}>
                                        <Text style={{ color: '#FFFFFF' }}>Send</Text>
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>

                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1,
        backgroundColor: '#EFEFEF'
    },
    chatPersonView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 5,
        alignItems: 'center',
        borderBottomWidth: 1,
        backgroundColor: '#FFD44E'
    },
    doctorImage: {
        width: 41,
        height: 41,
        borderRadius: 41 / 2,
        borderWidth: 1,
        borderColor: '#555555'
    }

})
