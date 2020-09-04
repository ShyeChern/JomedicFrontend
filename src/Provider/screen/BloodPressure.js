import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Divider } from 'react-native-elements'
import moment from 'moment'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class BloodPressure extends Component {
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

            // Blood Pressure Readings for LHR bp, ALL readings are decimal(3,0)
            // Sitting
            systolic_sitting: '',
            diastolic_sitting: '',
            sitting_pulse: '',

            // Standing
            systolic_standing: '',
            diastolic_standing: '',
            standing_pulse: '',

            // Lying
            systolic_supine: '',
            diastolic_supine: '',
            supine_pulse: '',
        }
    }

    async componentDidMount() {
        await this.initializeData();
        await this.loadBloodPressure()
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

    loadBloodPressure = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER050',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
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
                console.log('Load Blood Pressure Error');
                console.log(json.status);
                Alert.alert("Load Blood Pressure Error", "Fail to load blood pressure, please try again.\n" + json.status)
            }
            else {
                var data = json.status[0]
                if (data) {
                    this.setState({
                        systolic_sitting: data.systolic_sitting.toString(),
                        diastolic_sitting: data.diastolic_sitting.toString(),
                        sitting_pulse: data.sitting_pulse.toString(),
                        systolic_standing: data.systolic_standing.toString(),
                        diastolic_standing: data.diastolic_standing.toString(),
                        standing_pulse: data.standing_pulse.toString(),
                        systolic_supine: data.systolic_supine.toString(),
                        diastolic_supine: data.diastolic_supine.toString(),
                        supine_pulse: data.supine_pulse.toString(),
                    })
                }
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Load Blood Pressure Error: " + error)
            Alert.alert("Load Blood Pressure Error", "Fail to load blood pressure, please try again.\n" + error)
            handleNoInternet()
            this.setState({
                isLoading: false
            })
        }
    }

    saveBloodPressure = async (objectBP) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER049',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                systolic_sitting: objectBP.systolic_sitting,
                diastolic_sitting: objectBP.diastolic_sitting,
                sitting_pulse: objectBP.sitting_pulse,
                systolic_standing: objectBP.systolic_standing,
                diastolic_standing: objectBP.diastolic_standing,
                standing_pulse: objectBP.standing_pulse,
                systolic_supine: objectBP.systolic_supine,
                diastolic_supine: objectBP.diastolic_supine,
                supine_pulse: objectBP.supine_pulse
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
                console.log("Blood Pressure Saved.")
                Alert.alert("Blood Pressure Saved.")
            } else {
                console.log("Save Blood Pressure Error: " + json.status)
                Alert.alert("Save Blood Pressure Error", "Fail to save blood pressure, please try again.\n" + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Blood Pressure Error: " + error)
            Alert.alert("Save Blood Pressure Error", "Fail to save blood pressure, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }
    }

    handleSave = () => {
        // Create Object containing validated Blood Pressure Data
        const objBP = {
            systolic_sitting: this.validateNumericInput(this.state.systolic_sitting),
            diastolic_sitting: this.validateNumericInput(this.state.diastolic_sitting),
            sitting_pulse: this.validateNumericInput(this.state.sitting_pulse),
            systolic_standing: this.validateNumericInput(this.state.systolic_standing),
            diastolic_standing: this.validateNumericInput(this.state.diastolic_standing),
            standing_pulse: this.validateNumericInput(this.state.standing_pulse),
            systolic_supine: this.validateNumericInput(this.state.systolic_supine),
            diastolic_supine: this.validateNumericInput(this.state.diastolic_supine),
            supine_pulse: this.validateNumericInput(this.state.supine_pulse)
        }

        // Cycle the array to find any invalid input (-1)
        // Show error message and exit the function if true
        for (var key in objBP) {
            if (objBP[key] < 0) {
                Alert.alert("Invalid Blood Pressure Reading", "Blood pressure reading must be number input, with values between 0 to 999.")
                return;
            }
        }

        console.log("All input are valid")

        // Pass the validated object to saveBloodPressure() to save in database
        this.saveBloodPressure(objBP);
    }

    validateNumericInput = (stringInput) => {
        if (stringInput === "") {
            return 0
        } else {
            if (isNaN(stringInput)) {
                return -1;
            }

            var value = this.round(stringInput, 0)
            if (isNaN(value)) {
                return -1;
            }
            else {
                if (value >= 0 && value <= 999) {
                    return value;
                } else {
                    return -1;
                }
            }
        }
    }

    // Function to round numbers to specified decimal places
    round = (value, decimals) => {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Text style={styles.title}>Blood Pressure</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <Text style={styles.labelTitleStyle}>Sitting</Text>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelHeaderStyle}>Systolic</Text>
                            <Text style={styles.labelHeaderStyle}>Diastolic</Text>
                            <Text style={styles.labelHeaderStyle}>Pulse</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.systolic_sitting}
                                onChangeText={value => this.setState({ systolic_sitting: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.diastolic_sitting}
                                onChangeText={value => this.setState({ diastolic_sitting: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.sitting_pulse}
                                onChangeText={value => this.setState({ sitting_pulse: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                        </View>
                    </View>
                    <Divider style={styles.divider} />
                    <View style={styles.dataDisplayArea}>
                        <Text style={styles.labelTitleStyle}>Standing</Text>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelHeaderStyle}>Systolic</Text>
                            <Text style={styles.labelHeaderStyle}>Diastolic</Text>
                            <Text style={styles.labelHeaderStyle}>Pulse</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.systolic_standing}
                                onChangeText={value => this.setState({ systolic_standing: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.diastolic_standing}
                                onChangeText={value => this.setState({ diastolic_standing: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.standing_pulse}
                                onChangeText={value => this.setState({ standing_pulse: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                        </View>
                    </View>
                    <Divider style={styles.divider} />
                    <View style={styles.dataDisplayArea}>
                        <Text style={styles.labelTitleStyle}>Lying</Text>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelHeaderStyle}>Systolic</Text>
                            <Text style={styles.labelHeaderStyle}>Diastolic</Text>
                            <Text style={styles.labelHeaderStyle}>Pulse</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.systolic_supine}
                                onChangeText={value => this.setState({ systolic_supine: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.diastolic_supine}
                                onChangeText={value => this.setState({ diastolic_supine: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.supine_pulse}
                                onChangeText={value => this.setState({ supine_pulse: value })}
                                keyboardType={"numeric"}
                                placeholder={"mmHg"}
                                maxLength={3}
                            />
                        </View>
                    </View>
                    <Divider style={styles.divider} />
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

    rowDisplayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },

    labelTitleStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: '5%',
    },

    labelHeaderStyle: {
        fontSize: 14,
        alignSelf: 'flex-start',
        textAlign: 'left',
        width: '30%',
    },

    textInputField: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000000',
        fontSize: 14,
        width: '30%',
    },

    scrollViewStyle: {
        backgroundColor: 'white',
    },

    dataDisplayArea: {
        marginHorizontal: '8%',
        marginVertical: 15,
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