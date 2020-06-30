import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { getTodayDate } from '../util/getDate'
import { handleNoInternetSignin } from '../util/CheckConn'
import { URL, URL_Provider, URL_SignIn, URL_AuditTrail } from '../util/provider'

import Loader from './Loader'

// import AsyncStorage from '@react-native-community/async-storage'

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            UserEmail: "",
            UserPassword: "",
            userData: [],
            isHidePassword: true,
            isLoading: false,
        };
    }

    // componentDidMount() {
    //     this.getToken();
    // }

    // getToken = async () => {
    //     try {
    //         let userData = await AsyncStorage.getItem("userData");
    //         let parsed = JSON.stringify(userData);
    //         console.log('data after logout:' + JSON.parse(parsed));
    //         this.setState({ dataUser: parsed });
    //     } catch (error) {
    //         console.log("Something went wrong", error);
    //     }
    // }

    // async storeToken(user) {
    //     try {
    //         await AsyncStorage.setItem("userData", user);
    //     } catch (error) {
    //         console.log("Something went wrong", error);
    //     }
    // }

    // handleAsyncStorage = (responseJson) => {
    //     const rootNav = this.props.screenProps.rootNavigation;
    //     setStorage(responseJson)
    //     onSignIn()
    //         .then(() => rootNav.navigate('TabNavigatorScreen'));
    // }

    loginProcess = async () => {
        // Validatation
        if (this.state.UserEmail === '') {
            alert('Please insert an email')
        } else if (this.state.UserPassword === '') {
            alert('Please insert a password')
        } else {
            this.setState({
                isLoading: true
            });

            let datas = {
                txn_cd: 'MEDAUTH01',
                tstamp: getTodayDate(),
                data: {
                    userID: this.state.UserEmail,
                    password: this.state.UserPassword,
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

                if (json.status == 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
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
                    if(this.setTenantOnline(tenantData.tenant_id)){

                        // Load Home Screen 
                        this.props.navigation.navigate("Home", {
                            user_id: this.state.UserEmail,
                            tenant_id: tenantData.tenant_id,
                            tenant_type: tenantData.tenant_type
                        })    
                    } else {
                        throw "Unable to login"
                    }

                    // Load Home Screen and reset navigation to Home (Cannot Go back to Login)
                    // this.props.navigation.reset({
                    //     index: 0,
                    //     routes: [
                    //         {
                    //             name: 'Home',
                    //             params: {
                    //                 user_id: this.state.UserEmail,
                    //                 tenantData: tenantData
                    //             },
                    //         },
                    //     ],
                    // })

                };

                this.clearInput();
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

    // Set Tenant Status to Online (Not Available)
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

            if (json.status === 'success' || json.status == "SUCCESS") {
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

    loadTenantData = async (user_id) => {
        let datas = {
            txn_cd: "MEDORDER011",
            tstamp: getTodayDate(),
            data: {
                user_id: user_id,
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

    clearInput = () => {
        this.setState({
            UserEmail: '',
            UserPassword: '',
        })
    }

    render() {

        // View Loading if it is loading
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={styles.ContainerActivityIndicator}>
                <View style={styles.TitleBar}>
                    <Text style={{ fontSize: 25 }}>Sign In</Text>
                </View>
                <View style={styles.SignInForm}>
                    <View style={styles.EmailInputForm}>
                        <TextInput
                            style={{ borderBottomWidth: 1, fontSize: 20 }}
                            placeholder='Email'
                            value={this.state.UserEmail}
                            onChangeText={(email) => { this.setState({ UserEmail: email }) }}
                        />
                    </View>
                    <View style={{ justify: "center" }}>
                        <TextInput
                            style={{ borderBottomWidth: 1, fontSize: 20 }}
                            placeholder='Password'
                            value={this.state.UserPassword}
                            secureTextEntry={this.state.isHidePassword}
                            onChangeText={(password) => { this.setState({ UserPassword: password }) }}
                        />
                    </View>
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.LoginButton}
                        onPress={() => this.loginProcess()}>
                        <Text style={{ fontSize: 20, color: 'white' }}>Sign In</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', padding: '20%', paddingTop: 20 }}>
                    <TouchableOpacity
                        style={{ paddingRight: 8 }}
                        onPress={() => alert("Forget password pressed")}>
                        <Text style={{ fontSize: 18 }}>Forget Password?</Text></TouchableOpacity>
                    <TouchableOpacity
                        style={{ paddingLeft: 8 }}
                        onPress={() => alert("Sign up pressed")}>
                        <Text style={{ fontSize: 18 }}>Sign Up</Text></TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    ContainerActivityIndicator: {
        paddingTop: 80,
        width: '100%',
        position: 'absolute'
    },

    TitleBar: {
        height: 55,
        elevation: 3,
        alignItems: 'center',
        paddingTop: 20
    },

    SignInForm: {
        padding: '10%',
        flexDirection: 'column',
    },

    EmailInputForm: {
        paddingBottom: 20,
    },

    LoginButton: {
        paddingHorizontal: '34%',
        paddingVertical: 15,
        backgroundColor: '#FFD54E',
        borderRadius: 50,
        marginLeft: '8%',
        marginRight: '8%',
    },

    SignInBtn: {
        alignItems: 'center',
    },

})
