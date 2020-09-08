import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, ScrollView, } from 'react-native';
import { format } from 'date-fns';
import { URL } from '../util/FetchURL';


export default class PreviousChatDetail extends Component {
    constructor(props) {
        super(props)

        this.state = {
            doctor: this.props.route.params.DoctorName,
            doctorImage: this.props.route.params.DoctorImage,
            doctorSpecialist: this.props.route.params.DoctorSpecialist,
            customerId: '',
            orderNo: this.props.route.params.OrderNo,
            orderDate:this.props.route.params.OrderDate,
            messages: [],
        }
    }

    componentDidMount() {
        let bodyData = {
            transactionCode: 'CHATHISTORY',
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
                        <Text style={{ alignSelf: 'center', marginVertical: 5 }}>{this.state.orderDate}</Text>
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
