import React, { Component } from 'react'
import { Text, TextInput, StyleSheet, View, ScrollView, Button, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'

import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'

const MAX_LENGTH = 20

const calculateRemainingChar = (noOfChar, maxLength) => {
    return maxLength - noOfChar
}

export default class ConsultationNoteModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            // Data from previous screen
            tenant_id: '',
            tenant_type: '',
            user_id: '',
            order_no: '',

            isLoading: false,

            // Strings for Notes
            complaint: '',
            diagnosis: '',
            vitalSign: '',
            medication: '',

        }
    }

    componentDidMount() {
        this.initializeData()
    }

    initializeData() {
        var params = this.props.route.params

        this.setState({
            tenant_id: params.tenant_id,
            tenant_type: params.tenant_type,
            user_id: params.user_id,
            order_no: params.order_no
        })
    }

    saveNote = () => {

        // Save the note into the database

        // Navigate to customer rating
        this.props.navigation.navigate("RateCustomerModal", {
            tenant_id: this.state.tenant_id,
            tenant_type: this.state.tenant_type,
            user_id: this.state.user_id,
            order_no: this.state.order_no
        })
    }

    render() {
        return (
            <View style={styles.popUpContainer}>
                <Text style={styles.popUpTitle}>Insert consultation note from your conservation</Text>

                <ScrollView style={styles.popUpContentContainer}>
                    {/* Text Input Fields */}
                    <View style={styles.popUpBodyContainer}>
                        <TextInput
                            style={styles.textInputStyle}
                            placeholder='Complaint'
                            maxLength={MAX_LENGTH}
                            value={this.state.complaint}
                            onChangeText={(complaint) => this.setState({ complaint: complaint })}
                        />
                        <Text style={styles.wordCountStyle}>{calculateRemainingChar(this.state.complaint.length, MAX_LENGTH)}</Text>

                        <TextInput
                            style={styles.textInputStyle}
                            placeholder='Diagnosis'
                            maxLength={MAX_LENGTH}
                            value={this.state.diagnosis}
                            onChangeText={(diagnosis) => this.setState({ diagnosis: diagnosis })}
                        />
                        <Text style={styles.wordCountStyle}>{calculateRemainingChar(this.state.diagnosis.length, MAX_LENGTH)}</Text>

                        <TextInput
                            style={styles.textInputStyle}
                            placeholder='Vital Sign'
                            maxLength={MAX_LENGTH}
                            value={this.state.vitalSign}
                            onChangeText={(vitalSign) => this.setState({ vitalSign: vitalSign })}
                        />
                        <Text style={styles.wordCountStyle}>{calculateRemainingChar(this.state.vitalSign.length, MAX_LENGTH)}</Text>

                        <TextInput
                            style={styles.textInputStyle}
                            placeholder='Medication'
                            maxLength={MAX_LENGTH}
                            value={this.state.medication}
                            onChangeText={(medication) => this.setState({ medication: medication })}
                        />
                        <Text style={styles.wordCountStyle}>{calculateRemainingChar(this.state.medication.length, MAX_LENGTH)}</Text>

                    </View>
                </ScrollView>

                <View style={styles.buttonBar}>
                    <TouchableOpacity
                        style={styles.buttonSave}
                        onPress={() => this.saveNote()}>
                        <Text style={{ fontSize: 18, color: 'white' }}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({

    // For the Pop Up
    popUpContainer: {
        marginTop: 'auto',
        marginBottom: 'auto',
        backgroundColor: 'white',
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        height: '60%',
        width: '70%',
        alignSelf: 'center',
    },

    popUpContentContainer: {
        flex: 1,
    },

    popUpTitle: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        color: '#000000',
        alignSelf: 'center',
        textAlign: 'center',
        padding: 10,
    },

    popUpBodyContainer: {
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
    },

    textInputStyle: {
        borderBottomWidth: 1,
        fontSize: 12,
    },

    wordCountStyle: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 9,
        lineHeight: 12,
        color: '#000000',
        alignSelf: 'flex-end',
        padding: 2,
    },

    popUpBody: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 18,
        lineHeight: 16,
        color: '#000000',
        alignSelf: 'center',
        textAlign: 'center',
        padding: 5,
    },

    buttonBar: {
        flexDirection: 'row',
    },

    buttonSave: {
        backgroundColor: '#FFD54E',
        flex: 1,
        alignItems: "center",
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },

})
