import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Header, BackHandler } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { URL } from '../util/provider';
import { getTodayDate } from '../util/getDate';
// import { createStackNavigator, createAppContainer } from 'react-navigation';  

function login({ navigation }) {

    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [checked, setChecked] = useState(false);


    // static navigationOptions = {
    //     title: 'Home',
    //     headerStyle: {
    //         backgroundColor: '#f4511e',
    //     },
    //     //headerTintColor: '#0ff',  
    //     headerTitleStyle: {
    //         fontWeight: 'bold',
    //     },
    // };

    useEffect(() => {
        const backAction = () => {
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    });

    const nextProcess = () => {

        if (userEmail === '') {
            alert('Please insert email')
        } else if (checked === false) {
            alert('Please tick the term and condition')
        } else {
            setLoading(true);

            let datas = {
                txn_cd: 'MEDVER01',
                tstamp: getTodayDate(),
                data: {
                    email: userEmail,
                }
            };

            fetch(URL + '/EWALL', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)

            }).then((response) => response.json())
                .then((responseJson) => {
                    console.log(responseJson);
                    if (responseJson.status === 'fail' || responseJson.status === 'duplicate' || responseJson.status === 'emptyValue' || responseJson.status === 'incompleteDataReceived' || responseJson.status === 'ERROR901') {
                        console.log('Something Error')
                    } else if (responseJson.status === 'IDXDE') {
                        Alert.alert(
                            'Failed',
                            "Sorry, you enter invalid email. Please make sure you put the active email."
                        );

                    } else if (responseJson.status === 'SUCCESS') {
                        navigation.navigate('Verify', { email: userEmail });
                    }

                    clearInput();
                    setLoading(false)

                }).catch((error) => {
                    alert(error)
                    clearInput();
                    setLoading(false)
                });

        }



    }

    const clearInput = () => {
        setUserEmail("")
        setChecked(false)
    }


    if (loading) {
        return (
            <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
                <ActivityIndicator size="large" color='#F5A623' />
            </View>
        );
    }

    return (
        <View >
            {/* <View style={{ alignItems: "center", backgroundColor: '#F5A623', padding: 15 }}>
                <Text style={{ color: 'white' }}> JOMEDIC WALLET</Text>
            </View> */}
            <View style={styles.SignInForm}>
                <View style={styles.InputFormEmail}></View>

                <TextInput
                    value={userEmail}
                    onChangeText={(userEmail) => setUserEmail(userEmail)}
                    placeholder={'Enter your email address'}
                />
                <View style={{ flexDirection: 'row' }}>
                    <CheckBox
                        value={checked}
                        onValueChange={() => checked ? setChecked(false) : setChecked(true)}
                    />
                    <Text style={{ marginTop: 5 }}>By continuing, you agree to the  </Text>
                    <TouchableOpacity
                        onPress={() => alert('Terms & Condition')}>
                        <Text style={{ marginTop: 5, fontWeight: 'bold' }}>terms & condition </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => nextProcess()}
                    style={styles.LogIn}>
                    < Text style={{ color: 'white', textAlign: 'center' }}>NEXT</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default login;


const styles = StyleSheet.create({

    containerActivityIndicator: {
        paddingTop: 150,
        width: '100%',
        position: 'absolute'
    },

    navBar: {
        height: 55,
        backgroundColor: 'white',
        elevation: 3,
        alignItems: 'center',
        paddingTop: 20
    },

    BtnBar: {
        flexDirection: 'row',
        //justifyContent:'space-between'

    },
    myButton: {
        paddingHorizontal: 75,
        paddingVertical: 15,
        backgroundColor: '#F5A623',
        elevation: 3,
        borderEndWidth: 0.5

    },

    SignInForm: {
        padding: '10%',
        flexDirection: 'column',
    },

    InputFormEmail: {

    },
    LogIn: {
        paddingHorizontal: '35%',
        paddingVertical: 15,
        backgroundColor: '#F5A623',
        borderRadius: 50,
    },

    SignInBtn: {
        alignItems: 'center'
    },

    touachableButton: {
        position: 'absolute',
        right: 12,
    },


});


