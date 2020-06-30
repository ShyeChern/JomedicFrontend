import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { AuthContext } from './context';
import { URL } from '../util/provider';
import { getTodayDate } from '../util/getDate';
import AsyncStorage from '@react-native-community/async-storage';
import { set } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

function balance({ navigation }) {
    
    const [loading, setLoading] = useState(true);
    const [activate, setActivate] = useState(false);
    const [userid, setUserId] = useState('');
    const [walletNo, setWalletNo] = useState('');
    const [balance, setBalance] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                let userToken;
                try {
                    userToken = await AsyncStorage.getItem('userToken');

                } catch (e) {
                    console.log(e);
                }
                if (userToken != null) {
                    return userToken;

                }
                else {
                    navigation.navigate('Login')
                }

                return userToken;

            };

            fetchData().then(userToken => {
                returnData(userToken)
            })
        }, [])
    );

    const signOut = async () => {

        try {
            await AsyncStorage.removeItem('userToken');
            navigation.navigate('Login')
        } catch (e) {
            // remove error
        }
    }

    function returnData(userToken) {
        const datas = {
            txn_cd: 'MEDEWALL04',
            tstamp: getTodayDate(),
            data: {
                userID: userToken
            }
        }

        console.log(datas);

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

                setBalance(responseJson.status.available_amt);
                setWalletNo(responseJson.status.ewallet_acc_no);
                setUserId(responseJson.status.user_id);

                // if (responseJson.status === "NOTFOUND") {
                //     setActivate(true);
                // } else {

                // }

                // if (responseJson.status === 'fail' || responseJson.status === 'duplicate' || responseJson.status === 'emptyValue' || responseJson.status === 'incompleteDataReceived' || responseJson.status === 'ERROR901') {
                //     console.log('Something Error')
                // } else if (responseJson.status === 'WRONGDATA') {
                //     Alert.alert(
                //         'Failed',
                //         "Sorry, you enter invalid tac. Please make sure you put the valid tac."
                //     );

                // } else if (responseJson.status === 'SUCCESS') {
                //     signIn(email)


                // }

                setLoading(false)

            }).catch((error) => {
                alert(error)
                setLoading(false)
            });
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color='#F5A623' />
            </View>
        );
    }

    if (activate) {
        return (
            <View style={styles.containerActive}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Account')}>
                    <Text style={styles.text}>
                        Activate
               </Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={{
                borderWidth: .5, borderBottomWidth: .8, borderRadius: 5, flexDirection: 'row',
                paddingHorizontal: 20, paddingVertical: 30
            }}>
                <View style={{ flex: 3 }}>
                    <Text style={styles.title1}> Available balance (RM) </Text>
                    <Text style={styles.title2}> {(balance)}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('PaymentMethod',{
                            walletNo:walletNo,
                            userId:userid
                        })}
                        style={styles.topupBtn}>
                        < Text style={{ color: 'white', textAlign: 'center' }}>Top Up</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                </View>
            </View>

            <TouchableOpacity style={styles.button}
                onPress={() => navigation.navigate('AccountInfo')}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={styles.buttonText}> Account </Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginRight: 30, color: '#979797' }}></Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}
                onPress={() => navigation.navigate('TransactionHistory',{
                    walletNo:walletNo,
                    userId:userid
                })}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={styles.buttonText}>Transaction History</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginRight: 30, color: '#979797' }}></Text>
            </TouchableOpacity>

            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 60, }}>
                    <View >
                        <TouchableOpacity style={styles.transferBtn}
                            onPress={() => navigation.navigate('TransferMoney',{
                                walletNo:walletNo,
                                userId:userid
                            })}>
                            <Text style={{ color: 'white',textAlign: 'center' }}> Transfer</Text>
                        </TouchableOpacity>
                    </View>
                    <View >
                        <TouchableOpacity style={styles.transferBtn}
                            onPress={() => navigation.navigate('WithdrawMoney',{
                                walletNo:walletNo,
                                userId:userid
                            })}>
                            <Text style={{color: 'white', textAlign: 'center' }}> Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            

        </View>
    )
}




export default balance;

const styles = StyleSheet.create({

    title1: {
        fontSize: 18,
        color: '#979797',
    },
    title2: {
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 25,
    },

    topupBtn: {
        backgroundColor: '#F5A623',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 30
    },

    container: {
        flex: 1,
        paddingTop: 10,
        marginHorizontal: 10
    },

    button: {
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
        borderWidth: .5,
        borderBottomWidth: .8,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD44E',
    },
    buttonText: {
        textAlign: 'center',
        padding: 20,
        color: '#000000',
        fontSize: 15,
        lineHeight: 16,

    },

    transferBtn: {
        paddingHorizontal: 50,
        paddingTop: 10,
        paddingBottom: 10,
        textAlign: 'center',
        backgroundColor: '#F5A623',
        borderRadius: 24
    },

    containerActive: {
        paddingTop: 250,
        paddingLeft: 40,
        paddingRight: 40,


    },
    text: {
        borderWidth: 1,
        padding: 20,
        backgroundColor: '#F5A623',
        textAlign: 'center',
        justifyContent: 'center',



    }

});
