import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Alert } from 'react-native'
import { Divider, ListItem } from 'react-native-elements'
import MaterialIcon from "react-native-vector-icons/MaterialIcons"

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class ComplaintList extends Component {
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

            medicationList: [],
            medicationMaster: {}
        }
    }

    async componentDidMount() {
        // Load for first time
        await this.initializeData();
        await this.loadMedicationMaster();
        // await this.loadMedications();

        // Add hook to refresh complaint list from database when screen is Focus, and if reload is true
        this.props.navigation.addListener('focus',
            async event => {
                await this.loadMedicationMaster();
                // await this.loadMedications();
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

    // Load Medication Master from database
    loadMedicationMaster = async () => {
        let datas = {
            txn_cd: "MEDORDER056",
            tstamp: getTodayDate(),
            data: {
                order_no: this.state.order_no,
                pmi_no: this.state.id_number,
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
                console.log('Load Medications Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]
                if (data) {
                    this.setState({
                        medicationMaster: data,
                    })

                    this.loadMedications()
                }
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Load Medications Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    // Load Complaints from database
    loadMedications = async () => {
        let datas = {
            txn_cd: "MEDORDER058",
            tstamp: getTodayDate(),
            data: {
                order_no: this.state.order_no
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
                console.log('Load Medications Error');
                console.log(json.status);
            }
            else {
                var data = json.status
                this.setState({
                    medicationList: data,
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Load Medications Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }
    }

    // Add a new complaint
    addMedication = () => {
        var params = this.props.route.params
        this.props.navigation.navigate("Medication", {
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
            id_number: params.id_number,
            isEdit: false,
            medicationMaster: this.state.medicationMaster
        });
    }

    // Send the complaint for edit
    editMedication = (item) => {
        var params = this.props.route.params

        this.props.navigation.navigate("Medication", {
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
            id_number: params.id_number,
            medication: item,
            medicationMaster: this.state.medicationMaster,
            isEdit: true,
        });
    }


    // Delete a complaint from database
    removeMedication = async (item) => {
        console.log(item)

        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER059',
            tstamp: getTodayDate(),
            data: {
                order_no: this.state.order_no,
                drug_item_code: item.DRUG_ITEM_CODE,
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
                console.log("Medication Removed.")
                this.loadMedications()

            } else {
                console.log("Remove Medication Error: " + json.status)
            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Remove Medication Error: " + error)
            handleNoInternet()
            this.setState({
                isLoading: false
            })
        }

    }

    renderItem = ({ index, item }) => {
        return (
            <View style={styles.itemDisplayContainer}>
                <Text style={styles.labelText}>{item.DRUG_ITEM_DESC}</Text>
                <View style={styles.buttonSmallContainer}>
                    <TouchableOpacity style={styles.buttonSmall}
                        onPress={() => {
                            this.editMedication(item)
                        }}
                    >
                        <MaterialIcon name={'edit'} size={30} color={'white'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonSmall}
                        onPress={() => {
                            this.removeMedication(item)
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
                    <Text style={styles.title}>Medication List</Text>
                    <TouchableOpacity style={styles.buttonSmallAdd}
                        onPress={() => {
                            this.addMedication()
                        }}
                    >
                        <MaterialIcon name={'add'} size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
                <Divider style={styles.divider} />

                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={this.state.medicationList}
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
