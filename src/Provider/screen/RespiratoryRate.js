import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Divider } from 'react-native-elements'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_Provider, URL_AuditTrail } from '../util/provider'
import Loader from '../screen/Loader'

export default class RespiratoryRate extends Component {
    constructor(props) {
        super(props)

        var params = this.props.route.params;

        this.state = {
            isLoading: false,

            order_no: params.order_no || '',
            user_id: params.user_id || '',
            tenant_id: params.tenant_id || '',
            episode_date: params.episode_date || '',
            encounter_date: params.encounter_date || '',
            id_number: params.id_number || '',

            rate: '',   // decimal(3,0)
        }
    }

    async componentDidMount() {
        await this.loadRespiratoryRate();
    }

    // Get respiratory rate data from database
    loadRespiratoryRate = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER066',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date
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
                console.log('Load Respiratory Rate Error');
                console.log(json.status);
                Alert.alert("Load Respiratory Rate Error", "Fail to load respiratory rate, please try again.\n" + json.status)
            }
            else {
                var data = json.status[0]
                if (data) {
                    this.setState({
                        rate: data.rate.toString(),
                    })
                }
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Load Respiratory Rate Error: " + error)
            Alert.alert("Load Respiratory Rate Error", "Fail to load respiratory rate, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }

    }

    // Save respiratory rate data into database
    saveRespiratoryRate = async (rate) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER065',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                rate: rate
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

            if (json.status == 'success' || json.status == "SUCCESS") {
                console.log("Respiratory Rate Saved.")
                Alert.alert("Respiratory Rate Saved.")
            } else {
                console.log("Save Respiratory Rate Error: " + json.status)
                Alert.alert("Save Respiratory Rate Error", "Fail to save respiratory rate, please try again.\n" + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Respiratory Rate Error: " + error)
            Alert.alert("Save Respiratory Rate Error", "Fail to save respiratory rate, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }
    }

    // Function to round numbers to specified decimal places
    round = (value, decimals) => {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    // Event handler for Save button
    handleSave = async () => {
        // Ingore the operation if it is empty value
        if (this.state.rate === '') {
            Alert.alert("Invalid Respiratory Rate", "Please enter an respiratory rate reading.")
            return;
        }

        // Check is it numeric input
        if (isNaN(this.state.rate)) {
            Alert.alert("Invalid Respiratory Rate", "Respiratory rate only accepts number input with no decimal points.")
            return
        }

        // Validate the input is integer
        try {
            var rate = parseFloat(this.state.rate)

            if(Math.ceil(rate) !== Math.floor(rate)){
                Alert.alert("Invalid Respiratory Rate", "Respiratory rate only accepts number input with no decimal points.")
                return    
            }

            // Parse respiratory rate to 0 decimal places
            var rateInt = this.round(rate, 0)

            // Check is temperature within boundaries 0~999.99
            if (rateInt < 0 || rateInt >= 1000) {
                Alert.alert("Invalid Respiratory Rate", "Respiratory Rate has a minimum value of 0 and a maximum value of 999.")
                return
            }

            await this.saveRespiratoryRate(rateInt);

        } catch (error) {
            console.log(error)
        }
    }


    render() {
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Text style={styles.title}>Respiratory Rate</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <TextInput
                            style={styles.textInputField}
                            value={this.state.rate}
                            onChangeText={(value) => this.setState({ rate: value })}
                            keyboardType={"numeric"}
                            placeholder={"Respiratory Rate"}
                            maxLength={3}
                        />
                        <Text style={styles.unitLabelFont}>breaths / min</Text>
                    </View>
                </ScrollView>

                {/* Button View Area */}
                <View>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={this.handleSave}
                    >
                        <Text style={{ fontSize: 20, color: 'white', alignSelf: 'center', textAlign: "center" }}>Save</Text>
                    </TouchableOpacity>
                </View>

            </View >
        )
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginHorizontal: '8%',
        marginVertical: 10,
    },

    divider: {
        marginHorizontal: '8%',
        backgroundColor: '#000000'
    },

    textInputField: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000000',
        fontSize: 14,
        width: '65%'
    },

    unitLabelFont: {
        fontSize: 14,
        color: '#000000',
        alignSelf: "center",
        fontWeight: 'bold'
    },

    scrollViewStyle: {
        backgroundColor: 'white',
    },

    dataDisplayArea: {
        marginHorizontal: '8%',
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between"
    },

    saveButton: {
        paddingHorizontal: '28%',
        paddingVertical: 15,
        backgroundColor: '#fdaa26',
        borderRadius: 50,
        marginHorizontal: '8%',
        marginVertical: 20,
    },
})
