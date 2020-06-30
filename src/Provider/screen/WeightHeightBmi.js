import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { Divider } from 'react-native-elements'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class WeightHeightBmi extends Component {
    constructor(props) {
        super(props)
        this.state = {
            order_no: '',
            user_id: '',
            tenant_id: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',

            // Readings for lhr_weight_height
            weight_reading: '', // decimal(6,2)
            height_reading: '',
            bmi: '',
            weightStatus: '',
        }
    }

    componentDidMount() {
        // this.initializeData();
    }

    // initializeData = () => {
    //     var params = this.props.route.params;

    //     this.setState({
    //         order_no: params.order_no,
    //         user_id: params.user_id,
    //         tenant_id: params.tenant_id,
    //         episode_date: params.episode_date,
    //         encounter_date: params.encounter_date,
    //         id_number: params.id_number,
    //     })
    // }

    calculateBMI = (heightStr, weightStr) => {
        try {
            // Convert into float
            var height = parseFloat(heightStr);
            var weight = parseFloat(weightStr);

            var heightInMeter = height / 100;

            var bmi = this.round(weight / (heightInMeter * heightInMeter), 1);
            var weightStatus = "";
            // 
            if (bmi < 18.5) {
                weightStatus = "Underweight";
            } else if (bmi >= 18.5 && bmi < 25) {
                weightStatus = "Normal";
            } else if (bmi >= 25 && bmi < 30) {
                weightStatus = "Overweight";
            } else if (bmi >= 30) {
                weightStatus = "Obesity";
            } else {
                weightStatus = "Invalid BMI";
            }
    
            this.setState({
                bmi: bmi.toString(), 
                weightStatus: weightStatus
            })

            console.log("Bmi: " + this.state.bmi);
            console.log("weight status: " + this.state.weightStatus);
        } catch (error) {
            console.log(error)
        }
    }

    // Function to round numbers to specified decimal places
    round = (value, decimals) => {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    render() {
        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Text style={styles.title}>Others</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>Height</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.height_reading}
                                onChangeText={value => this.setState({ height_reading: value })}
                                keyboardType={"numeric"}
                                maxLength={7}
                            />
                            <Text style={styles.unitLabelFont}>cm</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>Weight</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.weight_reading}
                                onChangeText={value => this.setState({ weight_reading: value })}
                                keyboardType={"numeric"}
                                maxLength={7}
                            />
                            <Text style={styles.unitLabelFont}>cm</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>BMI</Text>
                            {/* <TextInput
                                style={styles.textInputField}
                                value={this.state.bmi}
                                onChangeText={value => this.setState({ bmi: value })}
                                keyboardType={"numeric"}
                            /> */}
                            <Text>{this.state.bmi}</Text>
                            <TouchableOpacity   
                                style={styles.bmiButton}
                                onPress={() => this.calculateBMI(this.state.height_reading, this.state.weight_reading)}
                            >
                                <Text style={{ fontSize: 14, color: 'white', alignSelf: 'center', textAlign: "center" }}>Calculate BMI</Text>
                            </TouchableOpacity>
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

    rowDisplayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },

    labelStyle: {
        fontSize: 14,
        alignSelf: 'center',
    },

    textInputField: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000000',
        fontSize: 14,
        width: '20%'
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
    },

    saveButton: {
        paddingHorizontal: '28%',
        paddingVertical: 15,
        backgroundColor: '#fdaa26',
        borderRadius: 50,
        marginHorizontal: '8%',
        marginVertical: 20,
    },

    bmiButton: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        backgroundColor: '#fdaa26',
        borderRadius: 5,
    },

})
