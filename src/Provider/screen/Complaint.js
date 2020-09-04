import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Image, FlatList, Alert } from 'react-native'
import { Divider, ListItem } from 'react-native-elements'
import { Picker } from '@react-native-community/picker';
import Modal from "react-native-modal";


import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'
import SelectedImg from '../img/radio_selected.png'
import UnselectedImg from '../img/radio_unselected.png'

export default class Complaint extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isSearching: false,
            isEdit: false,

            order_no: '',
            user_id: '',
            tenant_id: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',

            symptom_cd: '',
            symptom_name: '',
            term_type: 'CTV3',
            severity_desc: 'Mild',  // Set default value
            duration: 0, // decimal(3,0)
            unit: 'minute',
            comment: '',

            searchResult: [],

            selected_cd: '',
            selected_name: '',

            // Radio Button Area
            radioSeverityData: ['Mild', 'Normal', 'Acute'],
            checked: 0,
        }
    }

    async componentDidMount() {
        await this.initializeData();
        if (this.state.isEdit) {
            // Change the titile of screen
            this.props.navigation.setOptions({
                headerTitle: 'Edit Complaint'
            })

            // Load the data from list
            this.loadComplaint(this.props.route.params.item)
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

    searchSymptoms = async () => {

        // For unknown reasons, the select statement in diagnosis returns no result if mixture of capital and lower letter are used, 
        // using the sql provided.
        // Although the same SQL statment in here (Complaint) is able to return valid results,
        // convert the keyword to all lower cases before sending it to the database just in case.

        var keyword = this.state.symptom_name;

        let datas = {
            txn_cd: "MEDORDER037",
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
                console.log('Search Symptoms Error');
                console.log(json.status);
                Alert.alert("Search Symptoms Error", "Fail to search symptoms, please try again.\n" + json.status)
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
            console.log("Search Symptoms Error: " + error)
            this.setState({
                isLoading: false
            });
            Alert.alert("Search Symptoms Error", "Fail to search symptoms, please try again.\n" + error)
        }
    }


    loadComplaint = (data) => {
        this.setState({
            symptom_name: data.symptom_name,
            symptom_cd: data.symptom_cd,
            term_type: data.term_type,
            severity_desc: data.severity_desc,
            duration: data.duration, // decimal(3,0)
            unit: data.unit,
            comment: data.comment,
            selected_name: data.symptom_name,
            selected_cd: data.symptom_cd,
        })
    }

    saveComplaint = async () => {
        // validate is the symptom_cd and symptom_name valid
        if (!this.state.symptom_name) {
            Alert.alert("Invalid Symptom Name", "No symptom is selected. \nPlease select a symptom from the search result.")
            return
        }

        if (!this.state.symptom_cd || this.state.selected_cd !== this.state.symptom_cd) {
            Alert.alert("Invalid Symptom Code", "No symptom code is selected. \nPlease select a symptom from the search result.")
            return
        }

        if (this.state.selected_name !== this.state.symptom_name) {
            Alert.alert("Invalid Symptom Name", "This symptom name does not correspond to its symptom code.\nPlease select a symptom from the search result.")
            return
        }

        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER041',
            tstamp: getTodayDate(),
            data: {
                pmi_no: this.state.id_number,
                hfc_cd: this.state.tenant_id,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                symptom_cd: this.state.symptom_cd,
                symptom_name: this.state.symptom_name,
                term_type: this.state.term_type,
                duration: this.state.duration,
                unit: this.state.unit,
                severity_desc: this.state.severity_desc,
                comment: this.state.comment,
                status: "0"
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
                console.log("Complaint Saved.")
                this.props.navigation.navigate("ComplaintList");

            } else {
                console.log("Save Complaint Error: " + json.status)
                Alert.alert("Save Complaint Error", "Fail to save complaint, please try again.\n" + json.status)

            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Complaint Error: " + error)
            Alert.alert("Save Complaint Error", "Fail to save complaint, please try again.\n" + error)
            this.setState({
                isLoading: false
            })
        }
    }


    toggleSearch = async () => {
        if (this.state.symptom_name.length < 1) {
            return Alert.alert("Empty Keyword", "Please enter a keyword to search.")
        }
        await this.searchSymptoms();

        this.toggleModal();
    }

    toggleSelect = async (item) => {
        // Extract the name and code from the item
        await this.setState({
            symptom_name: item.RCC_DESC,
            symptom_cd: item.RCC_CD,
            selected_name: item.RCC_DESC,
            selected_cd: item.RCC_CD
        })

        this.toggleModal();
    }

    toggleModal = () => {
        this.setState(prevState => ({
            isSearching: !prevState.isSearching
        }))
    };

    renderItem = ({ item }) => (
        <ListItem
            title={item.RCC_DESC}
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
                <Text style={styles.title}>Chief Complaint</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <Text style={styles.labelText}>Symptoms</Text>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: '75%', backgroundColor: (this.state.isEdit) ? '#F0F0F0' : '#FFFFFF' }]}
                                value={this.state.symptom_name}
                                onChangeText={(value) => this.setState({ symptom_name: value })}
                                placeholder={"Symptoms"}
                                editable={!this.state.isEdit}
                            />
                            <TouchableOpacity style={[styles.searchButton, { backgroundColor: (this.state.isEdit) ? '#EFEFEF' : '#fdaa26' }]}
                                onPress={this.toggleSearch}
                                disabled={this.state.isEdit}
                            >
                                <Text style={styles.searchButtonText}>Search</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Duration & Unit */}
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.pickerLabel}>Duration</Text>
                            <Text style={styles.pickerLabel}>Unit</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.duration}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ duration: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="0" value={0} />
                                    <Picker.Item label="1" value={1} />
                                    <Picker.Item label="2" value={2} />
                                    <Picker.Item label="3" value={3} />
                                    <Picker.Item label="4" value={4} />
                                    <Picker.Item label="5" value={5} />
                                    <Picker.Item label="6" value={6} />
                                    <Picker.Item label="7" value={7} />
                                    <Picker.Item label="8" value={8} />
                                    <Picker.Item label="9" value={9} />
                                    <Picker.Item label="10" value={10} />
                                    <Picker.Item label="11" value={11} />
                                    <Picker.Item label="12" value={12} />
                                    <Picker.Item label="13" value={13} />
                                    <Picker.Item label="14" value={14} />
                                    <Picker.Item label="15" value={15} />
                                    <Picker.Item label="16" value={16} />
                                    <Picker.Item label="17" value={17} />
                                    <Picker.Item label="18" value={18} />
                                    <Picker.Item label="19" value={19} />
                                    <Picker.Item label="20" value={20} />
                                    <Picker.Item label="21" value={21} />
                                    <Picker.Item label="22" value={22} />
                                    <Picker.Item label="23" value={23} />
                                    <Picker.Item label="24" value={24} />
                                    <Picker.Item label="25" value={25} />
                                    <Picker.Item label="26" value={26} />
                                    <Picker.Item label="27" value={27} />
                                    <Picker.Item label="28" value={28} />
                                    <Picker.Item label="29" value={29} />
                                    <Picker.Item label="30" value={30} />
                                </Picker>
                            </View>

                            <View style={styles.pickerContainer}>
                                <Picker
                                    style={styles.pickerStyle}
                                    mode="dropdown"
                                    selectedValue={this.state.unit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.setState({ unit: itemValue })
                                    }
                                    }>
                                    <Picker.Item label="minute" value={"minute"} />
                                    <Picker.Item label="hour" value={"hour"} />
                                    <Picker.Item label="day" value={"day"} />
                                    <Picker.Item label="week" value={"week"} />
                                    <Picker.Item label="month" value={"month"} />
                                    <Picker.Item label="year" value={"year"} />
                                </Picker>
                            </View>
                        </View>

                        {/* Radio Button Severity */}
                        <Text style={styles.labelText}>Severity</Text>
                        <View style={styles.radioContainer}>
                            {
                                this.state.radioSeverityData.map((data, key) => {
                                    return (
                                        <View key={key}>
                                            {this.state.checked == key ?
                                                <TouchableOpacity style={styles.radioButton}>
                                                    <Image style={styles.radioImage} source={SelectedImg} />
                                                    <Text style={styles.radioLabel}>{data}</Text>
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity onPress={() => { this.setState({ checked: key, severity_desc: data }) }} style={styles.radioButton}>
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
                        onPress={() => this.saveComplaint()}
                    >
                        <Text style={{ fontSize: 20, color: 'white', alignSelf: 'center', textAlign: "center" }}>
                            Save
                        </Text>
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

    pickerLabel: {
        fontSize: 14,
        marginTop: 10,
        alignSelf: "center",
        textAlign: "center",
        width: '40%'
    },

    pickerContainer: {
        borderWidth: 1,
        borderRadius: 5
    },

    pickerStyle: {
        width: 150,
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
