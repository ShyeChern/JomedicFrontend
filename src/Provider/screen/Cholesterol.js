import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { Divider } from 'react-native-elements'
import { Picker } from '@react-native-community/picker';

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class Cholesterol extends Component {
    constructor(props) {
        super(props)
        this.state = {
            order_no: '',
            user_id: '',
            tenant_id: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',

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

    componentDidMount() {
        // this.initializeData();
    }

    // initializeData = () => {
    //     var params = this.props.route.params;

    //     this.setState({
    //       order_no: params.order_no,
    //       user_id: params.user_id,
    //       tenant_id: params.tenant_id,
    //       episode_date: params.episode_date,
    //       encounter_date: params.encounter_date,
    //       id_number: params.id_number,
    //     })
    //   }

    render() {
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
