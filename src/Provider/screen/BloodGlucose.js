import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Divider } from 'react-native-elements'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class BloodGlucose extends Component {
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

            blood_glucose_level: '',    // decimal(3,1)
        }
    }

    async componentDidMount() {
        await this.loadBloodGlucose();
    }

    // Get blood glucose data from database
    loadBloodGlucose = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER068',
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
                console.log('Load Blood Glucose Error');
                console.log(json.status);
                Alert.alert("Load Blood Glucose Error", "Fail to load blood glucose, please try again.\n" + json.status)
            }
            else {
                var data = json.status[0]
                if (data) {
                    this.setState({
                        blood_glucose_level: data.blood_glucose_level.toString(),
                    })
                }
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Load Blood Glucose Error: " + error)
            Alert.alert("Load Blood Glucose Error", "Fail to load blood glucose, please try again.\n" + error)
            handleNoInternet()
            this.setState({
                isLoading: false
            })
        }

    }

    // Save blood glucose data into database
    saveBloodGlucose = async (blood_glucose_level) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER067',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                blood_glucose_level: blood_glucose_level
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
                console.log("Blood Glucose Saved.")
                Alert.alert("Blood Glucose Saved.")
            } else {
                console.log("Save Blood Glucose Error: " + json.status)
                Alert.alert("Save Blood Glucose Error", "Fail to save blood glucose, please try again.\n" + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Blood Glucose Error: " + error)
            Alert.alert("Save Blood Glucose Error", "Fail to save blood glucose, please try again.\n" + error)
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
        if (this.state.blood_glucose_level === '') {
            Alert.alert("Invalid Blood Glucose", "Please enter a blood glucose reading.")
            return;
        }

        // Validate the input is float
        try {
            // Check is it numeric input
            if (isNaN(this.state.blood_glucose_level)) {
                Alert.alert("Invalid Blood Glucose", "Blood Glucose only accepts number input with 1 decimal point.")
                return
            }

            var blood_glucose_level_1dp = this.round(parseFloat(this.state.blood_glucose_level), 1)

            // Check is temperature within boundaries 0~999.99
            if (blood_glucose_level_1dp < 0 || blood_glucose_level_1dp >= 100) {
                Alert.alert("Invalid Blood Glucose", "Blood Glucose has a minimum value of 0 and a maximum value of 99.9.")
                return
            }

            await this.saveBloodGlucose(blood_glucose_level_1dp);

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
                <Text style={styles.title}>Blood Glucose</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <TextInput
                            style={styles.textInputField}
                            value={this.state.blood_glucose_level}
                            onChangeText={(value) => this.setState({ blood_glucose_level: value })}
                            keyboardType={"numeric"}
                            placeholder={"Blood Glucose (mmol/L)"}
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
