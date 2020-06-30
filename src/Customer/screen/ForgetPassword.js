import React, { Component } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, TouchableWithoutFeedback, Keyboard, TextInput, TouchableOpacity } from 'react-native';
import { URL } from '../util/FetchURL';
import { TextField } from 'react-native-material-textfield';

export default class ForgetPassword extends Component {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            question: '',
            answer: '',
            submitError: '',
            isLoading: false,
        }
    }

    submitEmail = () => {
        if (this.state.email === '') {
            this.setState({
                submitError: '*Please enter your email address'
            })
        }
        else {
            this.setState({
                isLoading: true,
                submitError: ''
            });

            let bodyData = {
                transactionCode: 'FORGETPASS',
                timestamp: new Date(),
                data: {
                    Email: this.state.email,
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
                    this.setState({
                        isLoading: false
                    });

                    if (responseJson.result === true) {
                        this.setState({
                            question: responseJson.data[0].question
                        });

                    }
                    else {
                        this.setState({ submitError: responseJson.value });
                    }

                })
                .catch((error) => {

                    this.setState({
                        isLoading: false
                    });

                    alert(error);
                });
        }

    }

    submitAnswer = () => {
        if (this.state.answer === '') {
            this.setState({
                submitError: '*Please enter your answer'
            })
        }
        else {
            this.setState({
                isLoading: true,
                submitError: ''
            });

            let bodyData = {
                transactionCode: 'RESETPASS',
                timestamp: new Date(),
                data: {
                    Email: this.state.email,
                    Answer: this.state.answer
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
                    this.setState({
                        isLoading: false
                    });

                    if (responseJson.result === true) {
                        alert(responseJson.value);
                        this.props.navigation.navigate('Login');

                    }
                    else {
                        this.setState({ submitError: responseJson.value });
                    }

                })
                .catch((error) => {

                    this.setState({
                        isLoading: false
                    });

                    alert(error);
                });
        }
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View>
                    <ActivityIndicator size='large'></ActivityIndicator>
                </View>
            )
        }
        else if (this.state.question === '') {
            return (
                <View style={[styles.container]}>
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{ color: 'red', marginVertical: 20, textAlign: 'center' }}>{this.state.submitError}</Text>

                            <Text style={styles.label}>Enter your email address</Text>
                            <TextField tintColor='#FFD44E'
                                containerStyle={styles.input}
                                value={this.state.email}
                                label='Email'
                                autoCapitalize='none'
                                onChangeText={(email) => this.setState({ email })}
                                keyboardType='email-address'
                                returnKeyType={"done"}
                            />
                            <TouchableOpacity style={styles.btn} onPress={() => this.submitEmail()}>
                                <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                            </TouchableOpacity>
                        </View>

                    </TouchableWithoutFeedback>
                </View>
            )
        }
        else {
            return (
                <View style={[styles.container]}>
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{ color: 'red', marginVertical: 20, textAlign: 'center' }}>{this.state.submitError}</Text>

                            <Text style={styles.label}>Secret Question</Text>
                            <Text style={styles.text}>{this.state.question}</Text>

                            <Text style={styles.label}>Secret Answer</Text>
                            <TextField tintColor='#FFD44E'
                                containerStyle={styles.input}
                                value={this.state.answer}
                                label='Secret Answer'
                                autoCapitalize='none'
                                onChangeText={(answer) => this.setState({ answer })}
                                returnKeyType={"done"}
                            />
                            <TouchableOpacity style={styles.btn} onPress={() => this.submitAnswer()}>
                                <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                            </TouchableOpacity>
                        </View>

                    </TouchableWithoutFeedback>
                </View>
            )
        }


    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    label: {
        width: '70%',
        alignSelf: 'center',
        fontSize: 14,
        lineHeight: 19
    },
    text: {
        width: '70%',
        alignSelf: 'center',
        fontSize: 16,
        lineHeight: 22,
        marginVertical: 15
    },
    input: {
        width: '70%',
        alignSelf: 'center',
    },
    btn: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD44E',
        borderRadius: 50,
        width: '60%',
        marginVertical: 38,
        height: 50
    },
})
