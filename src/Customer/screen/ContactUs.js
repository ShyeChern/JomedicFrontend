import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';

export default class ContactUs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
            subject: '',
            content: '',
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });
    }

    send = () => {
        if (this.state.subject === '' || this.state.content === '') {
            alert('Please enter all the field');
        }
        else {
            let bodyData = {
                transactionCode: 'CONTACT',
                timestamp: new Date(),
                data: {
                    CustomerId: this.state.customerId,
                    Subject: this.state.subject,
                    Content: this.state.content
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
                            subject: '',
                            content: ''
                        });

                        alert('Your question have been submitted, we will reply you via email soon.');
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

    render() {
        return (
            <ScrollView style={styles.container}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 16, lineHeight: 22, fontWeight: 'bold', marginHorizontal: 15 }}>Submit Us Your Problem</Text>
                        <Text style={[styles.text, { fontWeight: 'normal', textAlign:'justify' }]}>Please kindly describe your question in the given space below. Our staff will assist and reply to you via email as soon as possible.</Text>
                        <Text style={styles.text}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            value={this.state.subject}
                            onChangeText={(subject) => this.setState({ subject })}
                            placeholder={' Your Question'}
                            returnKeyType={"next"}
                            ref={(subject) => { this.subject = subject; }}
                            onSubmitEditing={() => { this.content.focus(); }}
                        />
                        <Text style={styles.text}>Content</Text>
                        <TextInput
                            style={[styles.input, { height: 200 }]}
                            value={this.state.content}
                            onChangeText={(content) => this.setState({ content })}
                            placeholder={' Describe Your Question Here...'}
                            multiline={true}
                            // numberOfLines={10}
                            // onContentSizeChange={(e) => e.nativeEvent.contentSize.height}
                            ref={(content) => { this.content = content; }}
                        />

                        <TouchableOpacity style={styles.btn} onPress={() => this.send()}>
                            <Text style={styles.btnText}>SEND</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    text: {
        fontSize: 14,
        lineHeight: 19,
        margin: 15,
        fontWeight: 'bold'
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        width: '90%',
        alignSelf: 'center',
    },
    btn: {
        backgroundColor: '#FFD54E',
        borderRadius: 50,
        height: 50,
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 20
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 19
    }
})
