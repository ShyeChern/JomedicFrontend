import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Image, FlatList, Alert } from 'react-native'
import { Divider, ListItem } from 'react-native-elements'
import Modal from "react-native-modal";
import moment from 'moment'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'
import SelectedImg from '../img/radio_selected.png'
import UnselectedImg from '../img/radio_unselected.png'

export default class Diagnosis extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isSearching: false,
            isEdit: false,

            // Data From Previous Screen
            order_no: '',
            user_id: '',
            tenant_id: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',

            // Data for LHR Diagnosis
            icd10_description: '',
            icd10_code: '',
            term_cd: 'ICD10',
            term_description: 'ICD10',
            diagnosis_date: moment().format("DD-MM-YYYY"),
            diagnosis_status: 'Final',   // Type
            severity: 'Mild',
            comment: '',

            searchResult: [],

            selected_code: '',
            selected_description: '',

            // Radio Button Area
            radioTypeData: ['Final', 'Provision'],
            typeChecked: 0,

            radioSeveityData: ['Mild', 'Normal', 'Acute'],
            severityChecked: 0,

        }
    }

    async componentDidMount() {
        await this.initializeData();
        if (this.state.isEdit) {
            // Change the titile of screen
            this.props.navigation.setOptions({
                headerTitle: 'Edit Diagnosis'
            })

            // Load the data from list
            this.loadDiagnosis(this.props.route.params.item)
        }
    }

    initializeData = () => {
        var params = this.props.route.params

        this.setState({
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
            id_number: params.id_number,
            isEdit: params.isEdit
        })
    }

    loadDiagnosis = (data) => {
        this.setState({
            icd10_description: data.ICD10_Description,
            icd10_code: data.ICD10_Cd,
            term_cd: data.Term_Cd,
            term_description: data.Term_Description,
            diagnosis_date: data.Diagnosis_Date,
            diagnosis_status: data.Diagnosis_Status,   // Type
            severity: data.Severity,
            comment: data.Comment,
            selected_description: data.ICD10_Description,
            selected_code: data.ICD10_Cd,
        })
    }

    saveDiagnosis = async () => {
        // validate is the symptom_cd and symptom_name valid
        if (!this.state.icd10_description) {
            Alert.alert("Invalid Diagnosis Name", "No diagnosis is selected. \nPlease select a diagnosis from the search result.")
            return
        }

        if (!this.state.icd10_code || this.state.icd10_code !== this.state.selected_code) {
            Alert.alert("Invalid Diagnosis Code", "No diagnosis code is selected. \nPlease select a diagnosis from the search result.")
            return
        }

        if (this.state.icd10_description !== this.state.selected_description) {
            Alert.alert("Invalid Diagnosis Name", "This diagnosis name does not correspond to its diagnosis code.\nPlease select a diagnosis from the search result.")
            return
        }

        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER044',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                diagnosis_cd: this.state.icd10_code,
                diagnosis_status: this.state.diagnosis_status,
                diagnosis_date: this.state.diagnosis_date,
                icd10_cd: this.state.icd10_code,
                icd10_description: this.state.icd10_description,
                term_cd: this.state.term_cd,
                term_description: this.state.term_description,
                severity: this.state.severity,
                comment: this.state.comment,
                status: "0"
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
                console.log("Diagnosis Saved.")
                this.props.navigation.navigate("DiagnosisList");

            } else {
                console.log("Save Diagnosis Error: " + json.status)
                Alert.alert("Save Diagnosis Error", "Fail to save diagnosis, please try again.\n" + json.status)

            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Diagnosis Error: " + error)
            Alert.alert("Save Diagnosis Error", "Fail to save diagnosis, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }
    }

    searchIcd10 = async () => {
        var keyword = this.state.icd10_description;

        // For unknown reasons, the select statement returns no result if mixture of capital and lower letter are used, 
        // using the sql provided. Eg. "Fever" returns [], while 'fever' return valid results
        // While the same SQL statment in Complaint is able to return valid result
        // Hence, convert the keyword to all lower cases before sending it to the database

        let datas = {
            txn_cd: "MEDORDER039",
            tstamp: getTodayDate(),
            data: {
                keyword: keyword.toLowerCase()
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
                console.log('Search Diagnosis Error');
                console.log(json.status);
                Alert.alert("Search Diagnosis Error", "Fail to search diagnosis, please try again.\n" + json.status)

            }
            else {
                var data = json.status
                this.setState({
                    searchResult: data,
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Search Diagnosis Error: " + error)
            this.setState({
                isLoading: false
            });
            Alert.alert("Search Diagnosis Error", "Fail to search diagnosis, please try again.\n" + error)
        }
    }

    toggleSearch = async () => {
        if (this.state.icd10_description.length < 1) {
            return Alert.alert("Empty Keyword", "Please enter a keyword to search.")
        }
        await this.searchIcd10();

        this.toggleModal();
    }

    toggleSelect = async (item) => {

        // Extract icd10 name and icd10 code from the item
        await this.setState({
            icd10_code: item.icd10_code,
            icd10_description: item.icd10_desc,
            selected_code: item.icd10_code,
            selected_description: item.icd10_desc
        })

        this.toggleModal();

        console.log(this.state.icd10_code)
    }

    toggleModal = () => {
        this.setState(prevState => ({
            isSearching: !prevState.isSearching
        }))
    };

    renderItem = ({ item }) => (
        <ListItem
            title={item.icd10_desc}
            onPress={() => {
                this.toggleSelect(item)
            }}
            bottomDivider
        />
    )

    render() {
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Text style={styles.title}>Diagnosis</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <Text style={styles.labelText}>Diagnosis</Text>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: '75%', backgroundColor: (this.state.isEdit) ? '#F0F0F0' : '#FFFFFF' }]}
                                value={this.state.icd10_description}
                                onChangeText={(value) => this.setState({ icd10_description: value })}
                                placeholder={"Diagnosis"}
                                editable={!this.state.isEdit}
                            />
                            <TouchableOpacity style={[styles.searchButton, { backgroundColor: (this.state.isEdit) ? '#EFEFEF' : '#fdaa26' }]}
                                onPress={this.toggleSearch}
                                disabled={this.state.isEdit}
                            >
                                <Text style={styles.searchButtonText}>Search</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.labelText}>Diagnosis Date</Text>
                        <TextInput
                            style={[styles.textInputField, { marginTop: 5, color: '#000000', backgroundColor: '#F0F0F0' }]}
                            value={this.state.diagnosis_date}
                            editable={false}
                            placeholder={"DD/MM/YYYY"}
                        />

                        {/* Radio Button Type */}
                        <Text style={styles.labelText}>Type</Text>
                        <View style={styles.radioContainer}>
                            {
                                this.state.radioTypeData.map((data, key) => {
                                    return (
                                        <View key={key}>
                                            {this.state.typeChecked == key ?
                                                <TouchableOpacity style={styles.radioButton}>
                                                    <Image style={styles.radioImage} source={SelectedImg} />
                                                    <Text style={styles.radioLabel}>{data}</Text>
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity onPress={() => { this.setState({ typeChecked: key, diagnosis_status: data }) }} style={styles.radioButton}>
                                                    <Image style={styles.radioImage} source={UnselectedImg} />
                                                    <Text style={styles.radioLabel}>{data}</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>)
                                })
                            }
                        </View>

                        {/* Radio Button Severity */}
                        <Text style={styles.labelText}>Severity</Text>
                        <View style={styles.radioContainer}>
                            {
                                this.state.radioSeveityData.map((data, key) => {
                                    return (
                                        <View key={key}>
                                            {this.state.severityChecked == key ?
                                                <TouchableOpacity style={styles.radioButton}>
                                                    <Image style={styles.radioImage} source={SelectedImg} />
                                                    <Text style={styles.radioLabel}>{data}</Text>
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity onPress={() => { this.setState({ severityChecked: key, severity: data }) }} style={styles.radioButton}>
                                                    <Image style={styles.radioImage} source={UnselectedImg} />
                                                    <Text style={styles.radioLabel}>{data}</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>)
                                })
                            }
                        </View>

                        <TextInput
                            style={[styles.textInputField, { marginTop: 20 }]}
                            value={this.state.comment}
                            onChangeText={(value) => this.setState({ comment: value })}
                            placeholder={"Note"}
                            maxLength={300}
                            multiline={true}
                        />
                    </View>
                </ScrollView>

                {/* Button View Area */}
                <View>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={this.saveDiagnosis}
                    >
                        <Text style={{ fontSize: 20, color: 'white', alignSelf: 'center', textAlign: "center" }}>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal (Pop up) View */}
                <Modal isVisible={this.state.isSearching}>
                    <View style={styles.popUpContainer}>
                        {/*Patient Data View */}
                        <View style={styles.popUpContentContainer}>
                            <Text style={styles.popUpTitle}>Search Result</Text>
                            <Divider />
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={this.state.searchResult}
                                renderItem={this.renderItem}
                            />
                        </View>

                        {/* Button View */}
                        <View style={styles.buttonBar}>
                            <TouchableOpacity
                                style={styles.buttonBack}
                                onPress={() => this.toggleModal()}>
                                <Text style={{ fontSize: 18 }}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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

    labelText: {
        fontSize: 14,
        alignSelf: 'flex-start',
        textAlign: 'left',
        marginTop: 10
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

    searchButton: {
        paddingHorizontal: '4%',
        paddingVertical: '5%',
        borderRadius: 5,
    },

    searchButtonText: {
        fontSize: 14,
        fontWeight: '100',
        color: 'white',
        alignSelf: 'center',
        textAlign: "center"
    },

    saveButton: {
        paddingHorizontal: '28%',
        paddingVertical: 15,
        backgroundColor: '#fdaa26',
        borderRadius: 50,
        marginHorizontal: '8%',
        marginVertical: 20,
    },

    radioContainer: {
        flexDirection: 'row',
        marginTop: 5,
        marginBottom: 5,
    },

    radioImage: {
        height: 20,
        width: 20,
        marginRight: 3,
    },

    radioButton: {
        flexDirection: 'row',
        marginRight: 20,
    },

    radioLabel: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        color: '#4A4A4A',
    },

    popUpContainer: {
        backgroundColor: 'white',
        paddingTop: 22,
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        height: '90%',
        width: '90%',
        alignSelf: 'center',
    },

    popUpContentContainer: {
        flex: 1,
    },

    popUpTitle: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 16,
        color: '#000000',
        alignSelf: 'center',
        textAlign: 'center',
        padding: 10,
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

    buttonBack: {
        borderTopWidth: 1,
        flex: 1,
        alignItems: "center",
        padding: 15,
        borderBottomLeftRadius: 15,
    },
})
