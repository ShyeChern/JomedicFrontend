import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Alert } from 'react-native'
import { Divider, ListItem } from 'react-native-elements'
import MaterialIcon from "react-native-vector-icons/MaterialIcons"

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class DiagnosisList extends Component {
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

            diagnosisList: [],
        }
    }

    async componentDidMount() {
        // Load for first time
        await this.initializeData();
        await this.loadDiagnosises()

        // Add hook to refresh complaint list from database when screen is Focus, and if reload is true
        this.props.navigation.addListener('focus',
            async event => {
                await this.loadDiagnosises()
            }
        )

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

    // Load Complaints from database
    loadDiagnosises = async () => {
        let datas = {
            txn_cd: "MEDORDER045",
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date
            }
        }

        try {
            this.setState({ isLoading: true })

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
                console.log('Load Diagnosis Error');
                console.log(json.status);
                Alert.alert("Load Diagnosis Error", "Fail to load diagnosis, please try again.\n" + json.status)
            }
            else {
                var data = json.status
                this.setState({
                    diagnosisList: data,
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Load Diagnosis Error: " + error)
            this.setState({
                isLoading: false
            });
            Alert.alert("Load Diagnosis Error", "Fail to load diagnosis, please try again.\n" + error)
        }

    }

    // Add a new complaint
    addDiagnosis = () => {
        var params = this.props.route.params
        this.props.navigation.navigate("Diagnosis", {
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
            id_number: params.id_number,
            isEdit: false
        });
    }

    // Send the complaint for edit
    editDiagnosis = (item) => {
        var params = this.props.route.params

        this.props.navigation.navigate("Diagnosis", {
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
            id_number: params.id_number,
            item: item,
            isEdit: true,
        });
    }


    // Delete a complaint from database
    removeDiagnosis = async (item) => {

        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER046',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                diagnosis_cd: item.Diagnosis_Cd,
            }
        }

        console.log(datas)

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
                console.log("Diagnosis Removed.")
                this.loadDiagnosises()

            } else {
                console.log("Remove Diagnosis Error: " + json.status)
                Alert.alert("Remove Diagnosis Error", "Fail to remove diagnosis, please try again.\n" + json.status)

            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Remove Diagnosis Error: " + error)
            Alert.alert("Remove Diagnosis Error", "Fail to remove diagnosis, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }

    }

    renderItem = ({ index, item }) => {
        return (
            <View style={styles.itemDisplayContainer}>
                <Text style={styles.labelText}>{item.ICD10_Description}</Text>
                <View style={styles.buttonSmallContainer}>
                    <TouchableOpacity style={styles.buttonSmall}
                        onPress={() => {
                            this.editDiagnosis(item)
                        }}
                    >
                        <MaterialIcon name={'edit'} size={30} color={'white'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonSmall}
                        onPress={() => {
                            this.removeDiagnosis(item)
                        }}
                    >
                        <MaterialIcon name={'delete'} size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ backgroundColor: 'white', flex: 1, paddingHorizontal: '8%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.title}>Diagnosis List</Text>
                    <TouchableOpacity style={styles.buttonSmallAdd}
                        onPress={() => {
                            this.addDiagnosis()
                        }}
                    >
                        <MaterialIcon name={'add'} size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
                <Divider style={styles.divider} />

                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={this.state.diagnosisList}
                    renderItem={this.renderItem}
                />

                {/* Button View Area */}
                {/* <View>
                        <TouchableOpacity
                            style={styles.saveButton}
                        >
                            <Text style={{ fontSize: 20, color: 'white', alignSelf: 'center', textAlign: "center" }}>Save</Text>
                        </TouchableOpacity>
                    </View> */}

            </View >
        )
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginVertical: 10,
    },

    divider: {
        backgroundColor: '#000000'
    },

    itemDisplayContainer: {
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
    },

    labelText: {
        fontSize: 16,
        alignSelf: "flex-start",
        textAlign: "left",
        textAlignVertical: 'center',
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

    buttonSmallContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },


    buttonSmallAdd: {
        backgroundColor: '#FFD54E',
        alignItems: "center",
        alignSelf: 'center',
        alignContent: 'center',
        borderRadius: 5,
        padding: 5,
        marginHorizontal: 5,

    },

    buttonSmall: {
        backgroundColor: '#FFD54E',
        alignItems: "center",
        padding: 5,
        borderRadius: 5,
        marginHorizontal: 5,
    },

})
