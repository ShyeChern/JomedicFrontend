import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, BackHandler } from 'react-native';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';
import PushNotification from "react-native-push-notification";

export default class Home extends Component {

    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
        }

    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

        this.interval = setInterval(() => {
            if (this.props.navigation.isFocused()) {
                let bodyData = {
                    transactionCode: 'CHECKCHAT',
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
                            if (responseJson.accept === true) {
                                PushNotification.localNotification({
                                    id: 1,
                                    title: "Request Accepted",
                                    message: "Doctor has accepted your chat request. Go to Account > Current Chat to chat now",
                                })
                            }

                            if (responseJson.reject === true) {
                                PushNotification.localNotification({
                                    id: 2,
                                    title: "Request Rejected",
                                    message: "Doctor has reject your chat request.",
                                })
                            }

                        }

                    })
                    .catch((error) => {
                        alert(error);
                    });
            }
        }, 3000);


        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        clearInterval(this.interval);

    }

    handleBackPress = () => {
        if (this.props.navigation.isFocused()) {
            return true;
        }
    }

    render() {
        return (
            <View style={[styles.container]}>

                <View style={[styles.imageView]}>
                    <Image style={[styles.mainMenuImage]}
                        source={require('../asset/img/home.png')}
                    />
                </View>

                <View style={[styles.serviceView]}>

                    <Text style={{ fontSize: 14, marginHorizontal: 20, fontWeight: '600', lineHeight: 19 }}>Services</Text>

                    <View style={[styles.serviceBtnView]}>

                        <View style={{ alignItems: 'center', marginHorizontal: 5, flex: 1 }}>
                            <TouchableOpacity style={[styles.serviceBtn]}
                                onPress={() => this.props.navigation.navigate('FindDoctor')}>
                                <Image style={[styles.icon]}
                                    source={require('../asset/icon/doctor.png')}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.serviceText]}>Find Doctor</Text>
                        </View>

                        <View style={{ alignItems: 'center', marginHorizontal: 5, flex: 1 }}>
                            <TouchableOpacity style={[styles.serviceBtn]}
                                onPress={() => this.props.navigation.navigate('FindHealthcare')}>
                                <Image style={[styles.icon]}
                                    source={require('../asset/icon/healthcare.png')}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.serviceText]}>Find Healthcare</Text>
                        </View>

                        <View style={{ alignItems: 'center', marginHorizontal: 5, flex: 1 }}>
                            <TouchableOpacity style={[styles.serviceBtn]}
                                onPress={() => this.props.navigation.navigate('FindMap')}>
                                <Image style={[styles.icon]}
                                    source={require('../asset/icon/map.png')}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.serviceText]}>View Map</Text>
                        </View>


                    </View>

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
    imageView: {
        flex: 2,
        alignItems: 'center',
        marginTop: 25,
        justifyContent: 'center'
    },
    mainMenuImage: {
        width: '90%',
        height: '80%',
        borderRadius: 4
    },
    serviceView: {
        flex: 3
    },
    serviceBtnView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: 10,
        flex: 1
    },
    serviceText: {
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16
    },
    serviceBtn: {
        alignItems: 'center',
        backgroundColor: '#FBB03B',
        justifyContent: 'center',
        width: 66,
        height: 66,
        borderRadius: 66 / 2,
        margin: 10
    },
    icon: {
        width: 66,
        height: 66,
        borderRadius: 66 / 2,
    }
})
