import React, { Component } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import AsyncStorage from '@react-native-community/async-storage';
import { URL } from '../util/FetchURL';
import { URL_SignIn, URL_Provider } from '../../Provider/util/provider'
import { getTodayDate } from "../../Provider/util/getDate"
import { handleNoInternetSignin } from "../../Provider/util/CheckConn"

// login Screen

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            errors: { email: '', password: '' },
            submitError: '',
            isLoading: false,
        };

    }

    login = async () => {
        Keyboard.dismiss();

        let errors = { email: '', password: '' };
        let inputValid = true;

        if (this.state.email == '') {
            errors.email = 'Please enter this field';
            inputValid = false;
        }

        if (this.state.password == '') {
            errors.password = 'Please enter this field';
            inputValid = false;
        }

        if (inputValid) {
            this.setState({
                isLoading: true
            });


            let bodyData = {
                transactionCode: 'USERTYPE',
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
                .then(async (responseJson) => {
                    if (responseJson.result === true) {
                        if (responseJson.data[0].user_type == '6') {

                            let bodyData = {
                                transactionCode: 'LOGIN',
                                timestamp: new Date(),
                                data: {
                                    Email: this.state.email,
                                    Password: this.state.password,
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
                                        if (responseJson.data[0].user_type === '6') {
                                            this.storeLoginDetail(responseJson.data[0].customer_id, responseJson.data[0].user_type);
                                            this.props.navigation.navigate('Jomedic');
                                        }

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
                        else {
                            console.log("Entered Provider Login")
                            let datas = {
                                txn_cd: 'MEDAUTH01',
                                tstamp: getTodayDate(),
                                data: {
                                    userID: this.state.email,
                                    password: this.state.password,
                                }
                            }

                            try {
                                const response = await fetch(URL_SignIn, {
                                    method: 'POST',
                                    headers: {
                                        Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(datas)
                                });

                                const json = await response.json();

                                if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                                    console.log('Login Error');
                                    console.log(json.status);
                                }
                                else if (json.status === 'IDXDE') {
                                    Alert.alert(
                                        'Sign-in failed',
                                        "Sorry, we can't find an account with this user id. Please make sure you put the correct user id."
                                    );
                                } else if (json.status === 'EMAILXDE') {
                                    Alert.alert(
                                        'Sign-in failed',
                                        "Sorry, we can't find an account with this email. Please make sure you put the correct email."
                                    );
                                } else if (json.status === 'PASSWORDWRONG') {
                                    Alert.alert(
                                        'Sign-in failed',
                                        "Sorry, you enter wrong password. Please make sure you put the correct password."
                                    );
                                }
                                else {
                                    // Get the tenant Data
                                    const tenantData = await this.loadTenantData(this.state.UserEmail)

                                    if (typeof (tenantData) == 'string' || typeof (tenantData) == 'undefined') {
                                        throw "Unable to get Tenant Data: " + tenantData
                                    }

                                    // Set Tenant Status to Online
                                    if (this.setTenantOnline(tenantData.tenant_id)) {

                                        this.storeProviderDetail(this.state.email, tenantData.tenant_id, tenantData.tenant_type);
                                        this.props.navigation.navigate("Home", {
                                            user_id: this.state.email,
                                            tenant_id: tenantData.tenant_id,
                                            tenant_type: tenantData.tenant_type
                                        })

                                    } else {
                                        throw "Unable to login"
                                    }
                                };

                                this.setState({
                                    isLoading: false
                                });
                            } catch (error) {
                                console.log(error)
                                this.setState({
                                    isLoading: false
                                });
                                handleNoInternetSignin()
                            }
                        }

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
        else {
            this.setState({ errors: errors });
        }

    }

    loadTenantData = async (user_id) => {
        let datas = {
            txn_cd: "MEDORDER011",
            tstamp: getTodayDate(),
            data: {
                user_id: this.state.email,
                tenant_type: '0001',
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                console.log('Get Tenant Data Error');
                console.log(json.status);
                return json.status
            }
            else {
                let data = json.status[0]
                return data
            }
        }
        catch (error) {
            console.log(error)
            return error.toString()
        }

    }

    setTenantOnline = async (tenant_id) => {

        // Get User Profile and its data
        let datas = {
            txn_cd: 'MEDORDER025',
            tstamp: getTodayDate(),
            data: {
                tenant_id: tenant_id,
            }
        }

        try {
            this.setState({ isLoading: true })

            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'success' || json.status === 'SUCCESS') {
                // Return to Account Settings
                console.log(json.status)
                return true;
            } else {
                console.log('Logout Error');
                console.log(json.status);
                return false;
            };

        } catch (error) {
            console.log(error)
            return false;
        }
    }

    storeLoginDetail = async (id, userType) => {
        try {
            await AsyncStorage.setItem('loginStatus', 'true');
            await AsyncStorage.setItem('customerId', id);
            await AsyncStorage.setItem('userType', userType);
        } catch (e) {
            console.log(e);
        }
    }

    // for provider
    storeProviderDetail = async (userId, tenantId, tenantType) => {

        try {
            await AsyncStorage.setItem('loginStatus', 'true');
            await AsyncStorage.setItem('userId', userId);
            await AsyncStorage.setItem('tenantId', tenantId);
            await AsyncStorage.setItem('tenantType', tenantType);
            await AsyncStorage.setItem('userType', '4');
        } catch (e) {
            console.log(e);
        }
    }

    onFocus = () => {

        let errors = this.state.errors;
        for (let field in errors) {

            if (this[field] && this[field].isFocused()) {
                errors[field] = '';
            }
        }

        this.setState({
            errors: errors,
            submitError: '',
        });
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
            <View style={[styles.container]}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View>
                        <Text style={[styles.title]}> Login </Text>

                        <Text style={[styles.signInInput, { color: 'red' }]}>{this.state.submitError}</Text>

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signInInput}
                            ref={(email) => { this.email = email; }}
                            value={this.state.email}
                            label='Email'
                            autoCapitalize='none'
                            onChangeText={(email) => this.setState({ email })}
                            keyboardType='email-address'
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.password.focus(); }}
                            error={this.state.errors.email}
                        />

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signInInput}
                            ref={(password) => { this.password = password; }}
                            value={this.state.password}
                            secureTextEntry={true}
                            label='Password'
                            autoCapitalize='none'
                            onChangeText={(password) => this.setState({ password })}
                            returnKeyType={'done'}
                            onFocus={this.onFocus}
                            error={this.state.errors.password}
                        />

                        <TouchableOpacity style={[styles.signInBtn]}
                            onPress={() => this.login()}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', lineHeight: 22 }}>Login</Text>
                        </TouchableOpacity>


                        <TouchableOpacity style={[styles.signInInput, { margin: 5 }]}
                            onPress={() => this.props.navigation.navigate('ForgetPassword')}>
                            <Text style={{ textAlign: 'center' }}>Forget Password?</Text>
                        </TouchableOpacity>


                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginHorizontal: 58,
        lineHeight: 33,
        marginVertical: 17
    },
    signInInput: {
        width: '70%',
        alignSelf: 'center',
    },
    signInBtn: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD44E',
        borderRadius: 50,
        width: '70%',
        marginTop: 38,
        marginBottom: 10,
        height: 50
    }

})
