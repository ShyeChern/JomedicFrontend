import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { URL } from '../util/provider';

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            UserEmail: "",
            UserPassword: "",
            isLoading: false,
        };
    }
    loginProcess() {
       
        let datas = {
            txn_cd: 'AUTH01',
            tstamp: '2020-02-10 19:32:00',
            data: {
                email: this.state.UserEmail,
                password: this.state.UserPassword,
                modul: 'NOQ'
            }
        };

        if (this.state.UserEmail === '') {
            alert('Please insert email')
        } else if (this.state.UserPassword === ''){
            alert('Please insert password')
        }else {
                this.setState({
                isLoading: true
           })
            fetch(URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)

            }).then((response) => response.json())
                .then((responseJson) => {
                    console.log(responseJson)
                    if (responseJson.status === 'fail' || responseJson.status === 'duplicate' || responseJson.status === 'emptyValue' || responseJson.status === 'incompleteDataReceived' || responseJson.status === 'ERROR901') {
                        console.log('Something Error')
                    } else if (responseJson.status === 'EMAILXDE') {
                        Alert.alert(
                            'Sign-in failed',
                            "Sorry, we can't find an account with this email. Please make sure you put the correct email."
                        );
                   
                    } else if (responseJson.status === 'PASSWORDWRONG') {
                        Alert.alert(
                            'Sign-in failed',
                            "Sorry, you enter wrong password. Please make sure you put the correct password."
                        );
                      
                    }
                    else {
                        alert("Succesfully login")
                       
                    };
  
                    this.clearInput();
                    this.setState({
                        isLoading: false
                    })

                }).catch((error) => {
                  
                    alert('Success')
                });

        }
    

            
    }
    clearInput(){
        this.setState({
            UserEmail:'',
            UserPassword : '',
        })
    }
    render() {

        if (this.state.isLoading) {
            return (
                <View>
                    <ActivityIndicator size='large'></ActivityIndicator>
                </View>
            )
        }
        return (
            <View>
                <Text style={{ fontSize: 20 }}> User Email</Text>
                <TextInput
                    value={this.state.UserEmail}
                    onChangeText={(UserEmail) => this.setState({ UserEmail })}
                    placeholder={'UserEmail'}
                />
                <Text style={{ fontSize: 20 }}> User Password</Text>
                <TextInput
                    value={this.state.UserPassword}
                    onChangeText={(UserPassword) => this.setState({ UserPassword })}
                    placeholder={'UserPassword'}
                />
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => this.loginProcess()}
                    style={{ backgroundColor: 'blue' }}>
                    < Text style={{ color: 'white', textAlign: 'center' }}>LOGIN</Text>
                </TouchableOpacity>

            </View>
        )
    }
}

const styles = StyleSheet.create({})
