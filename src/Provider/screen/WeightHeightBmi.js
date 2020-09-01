import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Divider } from 'react-native-elements'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class WeightHeightBmi extends Component {
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

            // Readings for lhr_weight_height
            weight_reading: '', // decimal(6,2)
            height_reading: '', // decimal(6,2)
            bmi: '',
            weightStatus: '',
        }
    }

    async componentDidMount() {
        await this.loadWeightHeight();
    }

    // Get weight & height data from database
    loadWeightHeight = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER072',
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
                console.log('Load Weight & Height Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]
                if (data) {
                    var weight = data.weight_reading;
                    var height = data.height_reading;

                    this.setState({
                        weight_reading: weight.toString(),
                        height_reading: height.toString()
                    })

                    this.calculateBMI(height, weight);
                }
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Load Weight & Height Error: " + error)
            handleNoInternet()
            this.setState({
                isLoading: false
            })
        }

    }

    // Save weight & height data into database
    saveWeightHeight = async (weight_reading, height_reading) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER071',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                weight_reading: weight_reading,
                height_reading: height_reading
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
                console.log("Weight & Height Saved.")
                Alert.alert("Weight & Height Saved.")
            } else {
                console.log("Save Weight & Height Error: " + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Weight & Height Error: " + error)
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
        if (this.state.weight_reading === '' || this.state.height_reading === '') {
            console.log("Empty String")
            return;
        }

        // Validate the input is float
        try {
            // Parse weight & height to 2 decimal places
            var weight2dp = this.round(this.state.weight_reading, 2)
            var height2dp = this.round(this.state.height_reading, 2)

            // Weight Checking
            // Check weight is numeric input
            if (isNaN(weight2dp)) {
                Alert.alert("Invalid Weight", "Weight only accepts number input with 2 decimal points.")
                return
            }
            // Check is weight within boundaries 0~9999.99
            if (weight2dp < 0 || weight2dp >= 10000) {
                Alert.alert("Invalid Weight", "Weight has a minimum value of 0 and a maximum value of 9999.99.")
                return
            }

            // Height Checking
            // Check height is numeric input
            if (isNaN(height2dp)) {
                Alert.alert("Invalid Height", "Height only accepts number input with 2 decimal points.")
                return
            }
            // Check is height within boundaries 0~999.99
            if (height2dp < 0 || height2dp >= 10000) {
                Alert.alert("Invalid Height", "Height has a minimum value of 0 and a maximum value of 9999.99.")
                return
            }

            this.calculateBMI(height2dp, weight2dp);
            await this.saveWeightHeight(weight2dp, height2dp);

        } catch (error) {
            console.log(error)
        }
    }

    // Function to calculate the BMI value
    calculateBMI = (heightStr, weightStr) => {
        try {
            // Convert into float
            var height = parseFloat(heightStr);
            var weight = parseFloat(weightStr);

            var bmi = "";
            var weightStatus = "";

            if (height < 0 || weight < 0 || height >= 10000 || weight >= 10000 ) {
                bmi = "Invalid Weight or Height";
                weightStatus = "Invalid Weight or Height";
            } else {
                var heightInMeter = height / 100;

                bmi = this.round(weight / (heightInMeter * heightInMeter), 1);
                if (isNaN(bmi)) {
                    bmi = "Invalid Weight or Height";
                }

                if (bmi >= 0 && bmi < 18.5) {
                    weightStatus = "Underweight";
                } else if (bmi >= 18.5 && bmi < 25) {
                    weightStatus = "Normal";
                } else if (bmi >= 25 && bmi < 30) {
                    weightStatus = "Overweight";
                } else if (bmi >= 30) {
                    weightStatus = "Obesity";
                } else {
                    weightStatus = "Invalid Weight or Height";
                }
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
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

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
                            <Text style={styles.unitLabelFont}>kg</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>BMI</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.bmi}
                                editable={false}
                            />
                            <TouchableOpacity
                                style={styles.bmiButton}
                                onPress={() => this.calculateBMI(this.state.height_reading, this.state.weight_reading)}
                            >
                                <Text style={{ fontSize: 14, color: 'white', alignSelf: 'center', textAlign: "center" }}>Calculate</Text>
                                <Text style={{ fontSize: 14, color: 'white', alignSelf: 'center', textAlign: "center" }}>BMI</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelStyle}>Weight Status</Text>
                            <TextInput
                                style={styles.textInputField}
                                value={this.state.weightStatus}
                                editable={false}
                            />
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

    rowDisplayContainer: {
        flexDirection: 'row',
        marginVertical: 5,
    },

    labelStyle: {
        fontSize: 14,
        alignSelf: 'center',
        width: '30%'
    },

    textInputField: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000000',
        fontSize: 14,
        width: '50%',
        marginLeft: 5,
        marginRight: 10
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
        paddingHorizontal: '2%',
        paddingVertical: '2%',
        backgroundColor: '#fdaa26',
        borderRadius: 5,
    },

})
