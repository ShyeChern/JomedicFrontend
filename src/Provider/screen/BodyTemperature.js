import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Divider } from 'react-native-elements'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class BodyTemperature extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,

            order_no: '',
            user_id: '',
            tenant_id: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',

            // Variables for LHS
            temperature_reading: '', // decimal(5,2)
            test: '123'
        }
    }

    async componentDidMount() {
        await this.initializeData();

        // Load the temperature from database
        await this.loadTemperature()
    }

    initializeData = () => {
        var params = this.props.route.params;

        this.setState({
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
            id_number: params.id_number,
        })
    }

    // Get temperature data from database
    loadTemperature = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER048',
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
                console.log('Load Body Temperature Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]
                if (data) {
                    this.setState({
                        temperature_reading: data.temperature_reading.toString(),
                    })
                }
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Load Body Temperature Error: " + error)
            handleNoInternet()
            this.setState({
                isLoading: false
            })
        }

    }

    // Save temperature data into database
    saveTemperature = async (temperature) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER047',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                temperature_reading: temperature
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
                console.log("Body Temperature Saved.")
                Alert.alert("Body Temperature Saved.")
            } else {
                console.log("Save Body Temperature Error: " + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Body Temperature Error: " + error)
            handleNoInternet()
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
        if (this.state.temperature_reading === '') {
            console.log("Empty String")
            return;
        }

        // Validate the input is float
        try {
            var temperature = parseFloat(this.state.temperature_reading)

            // Parse temperature to 2 decimal places
            var temperature2dp = this.round(temperature, 2)

            // Check is it numeric input
            if (isNaN(temperature2dp)) {
                Alert.alert("Invalid Body Temperature", "Body temperature only accepts number input with decimal points.")
                return
            }

            // Check is temperature within boundaries 0~999.99
            if (temperature2dp < 0 || temperature2dp >= 1000) {
                Alert.alert("Invalid Body Temperature", "Body temperature has a minimum value of 0 and a maximum value of 999.99.")
                return
            }

            await this.saveTemperature(temperature2dp);

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
                <Text style={styles.title}>Body Temperature</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <TextInput
                            style={styles.textInputField}
                            value={this.state.temperature_reading}
                            onChangeText={(value) => this.setState({ temperature_reading: value })}
                            keyboardType={"numeric"}
                            placeholder={"Body Temperature (°C)"}
                            maxLength={6}
                        />
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
        fontSize: 14
    },

    detailHeaderFont: {
        fontSize: 18,
        // fontWeight: 'bold',
        color: '#000000',
    },

    detailDataFont: {
        fontSize: 16,
        color: '#595959',
        marginBottom: 5,
    },

    scrollViewStyle: {
        backgroundColor: 'white',
    },

    dataDisplayArea: {
        marginHorizontal: '8%',
        marginTop: 15,
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
