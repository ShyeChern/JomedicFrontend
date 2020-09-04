import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Divider } from 'react-native-elements'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class OxygenSaturation extends Component {
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

            spo2_reading: "",   // decimal(3,1)
        }
    }

    async componentDidMount() {
        // Load the oxygen saturation from database
        await this.loadOxygenSaturation()
    }

    loadOxygenSaturation = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER064',
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
                console.log('Load Oxygen Saturation Error');
                console.log(json.status);
                Alert.alert("Load Oxygen Saturation Error", "Fail to load oxygen saturation, please try again.\n" + json.status)

            }
            else {
                var data = json.status[0]
                if (data) {
                    this.setState({
                        spo2_reading: data.spo2_reading.toString(),
                    })
                }
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Load Oxygen Saturation Error: " + error)
            Alert.alert("Load Oxygen Saturation Error", "Fail to load oxygen saturation, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }

    }

    saveOxygenSaturation = async (spo2_reading) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER063',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                spo2_reading: spo2_reading
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
                console.log("Oxygen Saturation Saved.")
                Alert.alert("Oxygen Saturation Saved.")
            } else {
                console.log("Save Oxygen Saturation Error: " + json.status)
                Alert.alert("Save Oxygen Saturation Error", "Fail to save oxygen saturation, please try again.\n" + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Oxygen Saturation Error: " + error)
            Alert.alert("Save Oxygen Saturation Error", "Fail to save oxygen saturation, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }

    }

    // Function to round numbers to specified decimal places
    round = (value, decimals) => {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    handleSave = async () => {
        // Ingore the operation if it is empty value
        if (this.state.spo2_reading === '') {
            Alert.alert("Invalid Oxygen Saturation", "Please enter an oxygen saturation reading.")
            return;
        }

        // Check is it numeric input
        if (isNaN(this.state.spo2_reading)) {
            Alert.alert("Invalid Oxygen Saturation", "Oxygen Saturation only accepts number input with 1 decimal point.")
            return
        }

        // Parse spo2 to 1 decimal places
        var spo2_in_1dp = this.round(this.state.spo2_reading, 1)

        // Check is temperature within boundaries 0~99.9
        if (spo2_in_1dp < 0 || spo2_in_1dp >= 100) {
            Alert.alert("Invalid Oxygen Saturation", "Oxygen Saturation has a minimum value of 0% and a maximum value of 99.9%.")
            return
        }

        await this.saveOxygenSaturation(spo2_in_1dp);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Text style={styles.title}>Oxygen Saturation</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <TextInput
                            style={styles.textInputField}
                            value={this.state.spo2_reading}
                            onChangeText={(value) => this.setState({ spo2_reading: value })}
                            keyboardType={"numeric"}
                            placeholder={"Oxygen Saturation (%)"}
                            maxLength={4}
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