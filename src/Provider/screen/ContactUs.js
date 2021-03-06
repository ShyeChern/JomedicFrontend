import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { getCustomerId, getUserId } from "../util/Auth";
import { URL_Provider } from '../util/provider';
import { getTodayDate } from '../util/getDate';

export default class ContactUs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user_id: '',
            subject: '',
            content: '',
        }
    }

    async componentDidMount() {
        await getUserId().then(response => {
            this.setState({ user_id: response });
        });
    }

    send = () => {
        if (this.state.subject === '' || this.state.content === '') {
            alert('Please enter all the field');
        }
        else {
            let datas = {
                txn_cd: "CONTACT",
                tstamp: getTodayDate(),
                data: {
                    user_id: this.state.user_id,
                    subject: this.state.subject,
                    content: this.state.content
                }
            }

            fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas),
            }).then((response) => response.json())
                .then((responseJson) => {

                    if (responseJson.status === "SUCCESS" || responseJson.status === "success") {
                        this.setState({
                            subject: '',
                            content: ''
                        });

                        alert('Your problem have been received, we will reply you via email soon.');
                    }
                    else {
                        alert(responseJson.status);
                    }

                })
                .catch((error) => {
                    alert(error);
                });
        }

    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.text}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            value={this.state.subject}
                            onChangeText={(subject) => this.setState({ subject })}
                            placeholder={' Your Problem'}
                            returnKeyType={"next"}
                            ref={(subject) => { this.subject = subject; }}
                            onSubmitEditing={() => { this.content.focus(); }}
                        />
                        <Text style={styles.text}>Content</Text>
                        <TextInput
                            style={[styles.input, { height: 200 }]}
                            value={this.state.content}
                            onChangeText={(content) => this.setState({ content })}
                            placeholder={' Describe Your Problem Here...'}
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
            </View>
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
        margin: 15
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
