import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { URL } from '../util/provider';
import { getTodayDate } from '../util/getDate';
import { AuthContext } from './context';
import AsyncStorage from '@react-native-community/async-storage';
// import {
//     CodeField,
//     Cursor,
//     useBlurOnFulfill,
//     useClearByFocusCell,
// } from 'react-native-confirmation-code-field';



// const CELL_COUNT = 6;

function verify({ route, navigation }) {
    // const [value, setValue] = useState('');
    // const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    // const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    //     value,
    //     setValue,
    // });

    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");

    const { email } = route.params;

    const nextBtn = () => {
        if (code === "") {
            alert("Please enter code");
        } else {
            setLoading(true);

            let datas = {
                txn_cd: 'MEDEWALL01',
                tstamp: getTodayDate(),
                data: {
                    userID: email,
                    TAC: code
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
                    console.log(responseJson)
                    if (responseJson.status === 'fail' || responseJson.status === 'duplicate' || responseJson.status === 'emptyValue' || responseJson.status === 'incompleteDataReceived' || responseJson.status === 'ERROR901') {
                        console.log('Something Error')
                    } else if (responseJson.status === 'WRONGDATA') {
                        Alert.alert(
                            'Failed',
                            "Sorry, you enter invalid tac. Please make sure you put the valid tac."
                        );

                    } else if (responseJson.status === 'SUCCESS') {

                        setToken();
                        navigation.navigate('Balance');

                    }

                    setLoading(false)

                }).catch((error) => {
                    alert(error)
                    setLoading(false)
                });
        }
    }

    const setToken = async () => {
        try {
            await AsyncStorage.setItem('userToken', email);
        } catch (e) {
            console.log(e);
        }
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
        <SafeAreaView style={styles.root}>
            <TouchableOpacity style={{ position: 'absolute', top: 5, left: 10 }}
                onPress={() => navigation.goBack()}>
                <AntDesign name='arrowleft' size={30} color='#4A4A4A' />
            </TouchableOpacity>

            <Text style={styles.title}>Enter the verification that was send to {email}</Text>
            {/* <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFiledRoot}
                keyboardType="number-pad"
                renderCell={({ index, symbol, isFocused }) => (
                    <Text
                        key={index}
                        style={[styles.cell, isFocused && styles.focusCell]}
                        onLayout={getCellOnLayoutHandler(index)}>
                        {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>

                )}
            /> */}
            <TextInput
                value={code}
                onChangeText={(code) => setCode(code)}
                placeholder={'Enter the verification code'}
                secureTextEntry={true}
            />


            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => nextBtn()}
                style={styles.verifyBtn}>
                < Text style={{ color: 'white', textAlign: 'center' }}>NEXT</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}> Didnt get the code?</Text>
                <TouchableOpacity
                    onPress={() => alert('Code sent')}>
                    <Text style={{ fontSize: 18 }}> Resend code </Text>
                </TouchableOpacity>


            </View>
        </SafeAreaView>

    );


};

export default verify;

const styles = StyleSheet.create({
    root: { flex: 1, padding: 55 },
    title: { textAlign: 'center', fontSize: 18, marginBottom: 50 },
    codeFiledRoot: { marginBottom: 50 },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#00000030',
        textAlign: 'center',
    },
    focusCell: {
        borderColor: '#000',
    },

    verifyBtn: {
        paddingHorizontal: '35%',
        paddingVertical: 15,
        backgroundColor: '#F5A623',
        borderRadius: 50,
        marginBottom: 30,
    },
});



