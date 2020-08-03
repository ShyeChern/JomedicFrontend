import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, BackHandler, SafeAreaView, FlatList } from 'react-native';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';

import PushNotification from "react-native-push-notification";

const SERVICE = [
    {
        id: "1",
        name: "Find Doctor",
        icon: require('../asset/icon/doctor.png'),
        navigate: "FindDoctor",
    },
    {
        id: "2",
        name: "Find Healthcare",
        icon: require('../asset/icon/healthcare.png'),
        navigate: "FindHealthcare",
    },
    {
        id: "3",
        name: "Find Map",
        icon: require('../asset/icon/map.png'),
        navigate: "FindMap",
    },
    {
        id: "4",
        name: "Current Chat",
        icon: require('../asset/icon/chat.png'),
        navigate: "CurrentChat",
    },
]

Services = ({ id, name, icon, navigate, that }) => {
    return (
        <View style={{ alignItems: 'center', marginHorizontal: 15, marginVertical: 10, flex: 1 }}>
            <TouchableOpacity style={[styles.serviceBtn]}
                onPress={() => that.props.navigation.navigate(navigate)}>
                <Image style={[styles.icon]}
                    source={icon}
                />
            </TouchableOpacity>
            <Text style={[styles.serviceText]}>{name}</Text>
        </View>
    )
}

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
                                    message: "Doctor has accepted your chat request. Go to Jomedic tab and click the chat button to chat now",
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
        this.props.navigation.setOptions({
            headerRight: () => null
        });

        return (
            <View style={[styles.container]}>

                <View style={[styles.imageView]}>
                    <Image style={[styles.mainMenuImage]}
                        source={require('../asset/img/home.png')}
                    />
                </View>

                <View style={[styles.serviceView]}>

                    <Text style={{ fontSize: 14, marginHorizontal: 20, fontWeight: '600', lineHeight: 19 }}>Services</Text>

                    <SafeAreaView style={{ flex: 1 }}>
                        <FlatList
                            data={SERVICE}
                            renderItem={({ item, index }) =>
                                <Services id={item.id} name={item.name} icon={item.icon} navigate={item.navigate} that={this} />
                            }
                            keyExtractor={item => item.id}
                            numColumns={3}
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
    imageView: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25
    },
    mainMenuImage: {
        width: '90%',
        height: '80%',
        borderRadius: 4
    },
    serviceView: {
        flex: 3
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
        overflow: 'hidden',
        flex: 1
    },
    icon: {
        width: 66,
        height: 66,
        borderRadius: 66 / 2,
        resizeMode: 'contain',
    }
})
