import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Divider } from 'react-native-elements'
import { Picker } from '@react-native-community/picker';

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class Cholesterol extends Component {
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

            // Cholesterol levels (reading) for LHR
            total_cholesterol: '',
            LDL_cholesterol: '',    // ALL cholesterol reading is decimal(3,1)
            HDL_cholesterol: '',    // Maximum Value is 99.9
            triglycerides: '',
            non_HDL_C: '',
            TG_to_HDL: '',

            //The Unit of the Readings
            total_unit: '',
            LDL_unit: '',
            HDL_unit: '',
            Triglycerides_unit: '',
            non_HDL_C_unit: '',
            TG_to_HDL_ratio_unit: '',
        }
    }

    async componentDidMount() {
        await this.loadCholesterol();
    }


    // Get Cholesterol data from database
    loadCholesterol = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER070',
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
                console.log('Load Cholesterol Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]
                if (data) {
                    // Load all data
                    this.setState({
                        // Readings value
                        total_cholesterol: data.total_cholesterol.toString(),
                        LDL_cholesterol: data.LDL_cholesterol.toString(),
                        HDL_cholesterol: data.HDL_cholesterol.toString(),
                        triglycerides: data.triglycerides.toString(),
                        non_HDL_C: data.non_HDL_C.toString(),
                        TG_to_HDL: data.TG_to_HDL.toString(),

                        // Units
                        total_unit: data.total_unit,
                        LDL_unit: data.LDL_unit,
                        HDL_unit: data.HDL_unit,
                        Triglycerides_unit: data.Triglycerides_unit,
                        non_HDL_C_unit: data.non_HDL_C_unit,
                        TG_to_HDL_ratio_unit: data.TG_to_HDL_ratio_unit
                    })
                }
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Load Cholesterol Error: " + error)
            handleNoInternet()
            this.setState({
                isLoading: false
            })
        }

    }

    // Save Cholesterol data into database
    saveCholesterol = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER069',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,

                // Readings value
                total_cholesterol: this.state.total_cholesterol,
                LDL_cholesterol: this.state.LDL_cholesterol,
                HDL_cholesterol: this.state.HDL_cholesterol,
                triglycerides: this.state.triglycerides,
                non_HDL_C: this.state.non_HDL_C,
                TG_to_HDL: this.state.TG_to_HDL,

                // Units
                total_unit: this.state.total_unit,
                LDL_unit: this.state.LDL_unit,
                HDL_unit: this.state.HDL_unit,
                Triglycerides_unit: this.state.Triglycerides_unit,
                non_HDL_C_unit: this.state.non_HDL_C_unit,
                TG_to_HDL_ratio_unit: this.state.TG_to_HDL_ratio_unit
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
                console.log("Cholesterol Saved.")
                Alert.alert("Cholesterol Saved.")
            } else {
                console.log("Save Cholesterol Error: " + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Cholesterol Error: " + error)
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
        var total_cholesterol = this.state.total_cholesterol
        var LDL_cholesterol = this.state.LDL_cholesterol
        var HDL_cholesterol = this.state.HDL_cholesterol
        var triglycerides = this.state.triglycerides
        var non_HDL_C = this.state.non_HDL_C
        var TG_to_HDL = this.state.TG_to_HDL

        // Ingore the operation if it is empty value
        if (total_cholesterol === '' || LDL_cholesterol === '' || HDL_cholesterol === '' || triglycerides === '' || non_HDL_C === '' || TG_to_HDL === '') {
            console.log("Something is a Empty String")
            return;
        }

        // Validate the input
        // Check Total Cholesterol
        var totalCholesterol1dp = this.round(total_cholesterol, 1);
        // Is numeric input?
        if (isNaN(totalCholesterol1dp)) {
            Alert.alert("Invalid Total Cholesterol", "Total Cholesterol only accepts number input with 1 decimal point.")
            return
        }
        // Is within boundary?
        if (totalCholesterol1dp < 0 || totalCholesterol1dp >= 100) {
            Alert.alert("Invalid Total Cholesterol", "Total Cholesterol has a minimum value of 0 and a maximum value of 99.9.")
            return
        }

        // Check LDL Cholesterol
        var LDL1dp = this.round(LDL_cholesterol, 1);
        // Is numeric input?
        if (isNaN(LDL1dp)) {
            Alert.alert("Invalid LDL Cholesterol", "LDL Cholesterol only accepts number input with 1 decimal point.")
            return
        }
        // Is within boundary?
        if (LDL1dp < 0 || LDL1dp >= 100) {
            Alert.alert("Invalid LDL Cholesterol", "LDL Cholesterol has a minimum value of 0 and a maximum value of 99.9.")
            return
        }

        // Check HDL Cholesterol
        var HDL1dp = this.round(HDL_cholesterol, 1);
        // Is numeric input?
        if (isNaN(HDL1dp)) {
            Alert.alert("Invalid HDL Cholesterol", "HDL Cholesterol only accepts number input with 1 decimal point.")
            return
        }
        // Is within boundary?
        if (HDL1dp < 0 || HDL1dp >= 100) {
            Alert.alert("Invalid HDL Cholesterol", "HDL Cholesterol has a minimum value of 0 and a maximum value of 99.9.")
            return
        }

        // Check Triglycerides
        var triglycerides1dp = this.round(triglycerides, 1);
        // Is numeric input?
        if (isNaN(triglycerides1dp)) {
            Alert.alert("Invalid Triglycerides", "Triglycerides only accepts number input with 1 decimal point.")
            return
        }
        // Is within boundary?
        if (triglycerides1dp < 0 || triglycerides1dp >= 100) {
            Alert.alert("Invalid Triglycerides", "Triglycerides has a minimum value of 0 and a maximum value of 99.9.")
            return
        }

        // Check non HDL C
        var non_HDL_C_1dp = this.round(non_HDL_C, 1);
        // Is numeric input?
        if (isNaN(non_HDL_C_1dp)) {
            Alert.alert("Invalid non-HDL-C", "non-HDL-C only accepts number input with 1 decimal point.")
            return
        }
        // Is within boundary?
        if (non_HDL_C_1dp < 0 || non_HDL_C_1dp >= 100) {
            Alert.alert("Invalid non-HDL-C", "non-HDL-C has a minimum value of 0 and a maximum value of 99.9.")
            return
        }

        // Check TG to HDL
        var TG_HDL_1dp = this.round(TG_to_HDL, 1);
        // Is numeric input?
        if (isNaN(TG_HDL_1dp)) {
            Alert.alert("Invalid TG to HDL Ratio", "TG to HDL Ratio only accepts number input with 1 decimal point.")
            return
        }
        // Is within boundary?
        if (TG_HDL_1dp < 0 || TG_HDL_1dp >= 100) {
            Alert.alert("Invalid TG to HDL Ratio", "TG to HDL Ratio has a minimum value of 0 and a maximum value of 99.9.")
            return
        }

        await this.saveCholesterol();
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Text style={styles.title}>Cholesterol</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>Total Cholesterol</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.total_cholesterol}
                                onChangeText={value => this.setState({ total_cholesterol: value })}
                                keyboardType={"numeric"}
                                maxLength={4}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.total_unit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ total_unit: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="mg/dL" value={"mg/dL"} />
                                    <Picker.Item label="mmol/L" value={"mmol/L"} />
                                </Picker>
                            </View>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>LDL Cholesterol</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.LDL_cholesterol}
                                onChangeText={value => this.setState({ LDL_cholesterol: value })}
                                keyboardType={"numeric"}
                                maxLength={4}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.LDL_unit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ LDL_unit: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="mg/dL" value={"mg/dL"} />
                                    <Picker.Item label="mmol/L" value={"mmol/L"} />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>HDL Cholesterol</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.HDL_cholesterol}
                                onChangeText={value => this.setState({ HDL_cholesterol: value })}
                                keyboardType={"numeric"}
                                maxLength={4}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.HDL_unit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ HDL_unit: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="mg/dL" value={"mg/dL"} />
                                    <Picker.Item label="mmol/L" value={"mmol/L"} />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>Triglycerides</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.triglycerides}
                                onChangeText={value => this.setState({ triglycerides: value })}
                                keyboardType={"numeric"}
                                maxLength={4}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.Triglycerides_unit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ Triglycerides_unit: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="mg/dL" value={"mg/dL"} />
                                    <Picker.Item label="mmol/L" value={"mmol/L"} />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>non-HDL-C</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.non_HDL_C}
                                onChangeText={value => this.setState({ non_HDL_C: value })}
                                keyboardType={"numeric"}
                                maxLength={4}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.non_HDL_C_unit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ non_HDL_C_unit: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="mg/dL" value={"mg/dL"} />
                                    <Picker.Item label="mmol/L" value={"mmol/L"} />
                                </Picker>
                            </View>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>TG to HDL Ratio</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.TG_to_HDL}
                                onChangeText={value => this.setState({ TG_to_HDL: value })}
                                keyboardType={"numeric"}
                                maxLength={5}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.TG_to_HDL_ratio_unit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ TG_to_HDL_ratio_unit: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="mg/dL" value={"mg/dL"} />
                                    <Picker.Item label="mmol/L" value={"mmol/L"} />
                                </Picker>
                            </View>
                        </View>

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

    labelStyle: {
        fontSize: 14,
        alignSelf: 'center',
        width: '32%'
    },

    textInputField: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000000',
        fontSize: 14,
        width: '25%',
    },

    scrollViewStyle: {
        backgroundColor: 'white',
    },

    dataDisplayArea: {
        marginHorizontal: '8%',
        marginTop: 15,
    },

    rowDisplayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },

    saveButton: {
        paddingHorizontal: '28%',
        paddingVertical: 15,
        backgroundColor: '#fdaa26',
        borderRadius: 50,
        marginHorizontal: '8%',
        marginVertical: 20,
    },

    pickerContainer: {
        borderWidth: 1,
        borderRadius: 5
    },

    pickerStyle: {
        width: 125,
        borderStyle: "solid",
        borderColor: "#ABABAB",
        borderRadius: 5,
        borderWidth: 1,
        alignSelf: "center",
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        textAlign: "center",
        textAlignVertical: "center",

        color: '#000000',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 12,
        alignItems: 'center',
    },

})
