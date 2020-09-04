import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native'
import { Divider, ListItem } from 'react-native-elements'
import Modal from 'react-native-modal'
import moment from 'moment'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import Loader from '../screen/Loader'

export default class Medication extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isEdit: false,
            isSearchProvider: false,
            isSearchMedication: false,

            order_no: '',
            user_id: '',
            tenant_id: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',
            medicationMaster: {},

            // Data for pis_order_detail
            drug_name: '',
            drug_item_code: '', // mdc2: ud_mdc_code
            drug_item_desc: '', // mdc2: d_general_name
            drug_frequency: '', // mdc2: d_frequency
            duration: '',       // varchar(13)
            durationt: '',      // mdc2: d_durationt
            qty_ordered: '',    // varchar(7)
            comment: '',        // varchar(255)
            dosage: '',         // drug_dosage = dosage + dosage_unit // varchar(200)
            dosage_unit: '',    // mdc2: d_qtyt
            provider: '',
            hfc_cd: '',
            drug_strength: '',  // mdc2: d_strength
            drug_route: '',     // mdc2: d_route_code
            drug_form: '',      // mdc2: d_form_code
            batch_no: '',       // mdc2: batch_no

            // Field for validation purposes
            selected_provider: '',
            selected_hfc_cd: '',
            selected_drug_item_desc: '',
            selected_drug_item_code: '',
            selected_drug_name: '',

            // For search
            providerResults: [],
            medicationResults: []
        }
    }

    async componentDidMount() {
        await this.initializeData();
        if (this.state.isEdit) {
            // Change the titile of screen
            this.props.navigation.setOptions({
                headerTitle: 'Edit Medication'
            })

            // Load the data from list
            await this.loadMedicationMaster(this.props.route.params.medicationMaster)
            this.loadMedication(this.props.route.params.medication)
        } 
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
            isEdit: params.isEdit,
            medicationMaster: params.medicationMaster
        })
    }

    searchProviders = async () => {
        var keyword = this.state.provider;

        let datas = {
            txn_cd: "MEDORDER051",
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
                console.log('Search Providers Error: ', json.status);
                Alert.alert('Search Providers Error', 'Fail to search provider, please try again./n' + json.status);
            }
            else {
                var data = json.status
                this.setState({
                    providerResults: data,
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Search Providers Error: " + error)
            this.setState({
                isLoading: false
            });
            // handleNoInternet()
            Alert.alert('Search Providers Error', 'Fail to search provider, please try again./n' + error);
        }
    }

    getProviderName = async (hfc_cd) => {
        let datas = {
            txn_cd: "MEDORDER054",
            tstamp: getTodayDate(),
            data: {
                hfc_cd: hfc_cd
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
                console.log('Search Providers Error: ', json.status);
                Alert.alert('Get Provider Name Error', 'Fail to get provider name, please try again./n' + json.status);

            }
            else {
                var data = json.status[0]
                this.setState({
                    provider: data.hfc_name,
                    selected_provider: data.hfc_name
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Search Providers Error (Get PRovider Name): " + error)
            this.setState({
                isLoading: false
            });
            // handleNoInternet()
            Alert.alert('Get Provider Name Error', 'Fail to get provider name, please try again./n' + error);

        }

    }

    searchMedications = async () => {
        var keyword = this.state.drug_item_desc;

        let datas = {
            txn_cd: "MEDORDER052",
            tstamp: getTodayDate(),
            data: {
                keyword: keyword.toLowerCase(),
                hfc_cd: this.state.hfc_cd
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
                console.log('Search Medications Error');
                console.log(json.status);
                Alert.alert('Search Medications Error', 'Fail to search medications, please try again./n' + json.status);
            }
            else {
                var data = json.status
                this.setState({
                    medicationResults: data
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Search Medications Error: " + error)
            this.setState({
                isLoading: false
            });
            // handleNoInternet()
            Alert.alert('Search Medications Error', 'Fail to get search medications, please try again./n' + error);
        }
    }

    getMedicationData = async (item) => {

        this.setState({ isLoading: true })

        let datas = {
            txn_cd: "MEDORDER053",
            tstamp: getTodayDate(),
            data: {
                ud_mdc_code: item.ud_mdc_code,
                hfc_cd: this.state.hfc_cd,
                batch_no: item.batch_no
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
                console.log('Get Medication Data Error');
                console.log(json.status);
                Alert.alert('Get Medication Data Error', 'Fail to get medication data, please try again./n' + json.status);

            }
            else {
                var data = json.status[0]

                await this.setState({
                    drug_name: data.d_gnr_name.toString(),
                    drug_item_code: data.ud_mdc_code.toString(),
                    drug_item_desc: data.d_gnr_name.toString(),
                    drug_frequency: data.d_frequency.toString(),
                    durationt: data.d_durationt.toString(),
                    dosage_unit: data.d_qtyt.toString(),
                    drug_strength: data.d_strength.toString(),
                    drug_route: data.d_route_code.toString(),
                    drug_form: data.d_form_code.toString(),
                    batch_no: data.batch_no.toString(),
                    selected_drug_item_code: data.ud_mdc_code.toString(),
                    selected_drug_item_desc: data.d_gnr_name.toString(),
                    selected_drug_name: data.d_trade_name.toString()
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Medication Data Error: " + error)
            this.setState({
                isLoading: false
            });
            // handleNoInternet()
            Alert.alert('Get Medication Data Error', 'Fail to get medication data, please try again./n' + error);
        }
    }

    saveMedicationMaster = async (todayDate) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER055',
            tstamp: todayDate,
            data: {
                order_no: this.state.order_no,
                txn_date: todayDate,
                pmi_no: this.state.id_number,
                health_facility_code: this.state.hfc_cd,
                episode_date: this.state.episode_date,
                encounter_date: this.state.encounter_date,
                tenant_id: this.state.tenant_id,
                status: "0",
                order_status: "0"
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
        
            console.log(json.status)

            if (json.status == 'success' || json.status == "SUCCESS") {
                console.log("Medication Master Saved.")
                this.saveMedication(todayDate)
            } else if (json.status == 'duplicate') {
                console.log(this.state.medicationMaster.TXN_DATE)
                this.saveMedication(moment(this.state.medicationMaster.TXN_DATE).format("YYYY-MM-DD HH:mm:ss"))
            } else {
                console.log("Save Medication Master Error: " + json.status)
                Alert.alert('Save Medication Master Error', 'Fail to save medication master, please try again./n' + json.status);

                this.setState({
                    isLoading: false
                })
            };

        } catch (error) {
            console.log("Save Medication Master Error: " + error)
            Alert.alert('Save Medication Master Error', 'Fail to save medication master, please try again./n' + error);
            // handleNoInternet()
            this.setState({
                isLoading: false
            })
        }
    }

    saveMedication = async (todayDate) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: 'MEDORDER057',
            tstamp: todayDate,
            data: {
                order_no: this.state.order_no,
                drug_item_code: this.state.drug_item_code,
                drug_item_desc: this.state.drug_item_desc,
                drug_frequency: this.state.drug_frequency,
                drug_route: this.state.drug_route,
                drug_form: this.state.drug_form,
                drug_strength: this.state.drug_strength,
                drug_dosage: this.state.dosage + " " + this.state.dosage_unit,
                duration: this.state.duration,
                order_status: "0",
                qty_ordered: this.state.qty_ordered,
                status: "0",
                durationt: this.state.durationt,
                comment: this.state.comment,
                batch_no: this.state.batch_no
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
                console.log("Medication Saved.")
                this.props.navigation.navigate("MedicationList");
            } else {
                console.log("Save Medication Error: " + json.status)
                Alert.alert('Save Medication Error', 'Fail to save medication, please try again./n' + json.status);

            };

            this.setState({
                isLoading: false
            })

        } catch (error) {
            console.log("Save Medication Error: " + error)
            Alert.alert('Save Medication Error', 'Fail to save medication, please try again./n' + error);

            handleNoInternet()
            this.setState({
                isLoading: false
            })
        }

    }

    loadMedicationMaster = async (data) => {
        var hfc_cd = data.HEALTH_FACILITY_CODE.toString()

        await this.getProviderName(hfc_cd)

        this.setState({
            hfc_cd: hfc_cd,
            selected_hfc_cd: hfc_cd
        })
    }

    loadMedication = (data) => {

        // Split the Drug dosage to dosage and unit
        var unit = data.DRUG_DOSAGE.split(" ")[1]
        var dosage = data.DRUG_DOSAGE.split(" ")[0]

        // Load the drug provider data
        this.setState({
            drug_item_code: data.DRUG_ITEM_CODE,
            drug_item_desc: data.DRUG_ITEM_DESC,
            drug_frequency: data.DRUG_FREQUENCY,
            duration: data.DURATION,
            durationt: data.DURATIONT,
            qty_ordered: data.QTY_ORDERED,
            comment: data.COMMENT,
            dosage: dosage.toString(),
            dosage_unit: unit.toString(),
            drug_strength: data.DRUG_STRENGTH,
            drug_route: data.DRUG_ROUTE,
            drug_form: data.DRUG_FORM,
            batch_no: data.batch_no,
            selected_drug_item_desc: data.DRUG_ITEM_DESC,
            selected_drug_item_code: data.DRUG_ITEM_CODE,
        })
    }

    handleSaveMedication = async () => {
        // Validate if all necessary fields are filled, with valid and matching data
        // Things to validate
        // 1. Provider name and code exists, and are the same
        if (!this.state.provider) {
            Alert.alert("Invalid Provider", "No provider is selected. \nPlease select a provider from the search result.")
            return
        }
        if (!this.state.hfc_cd || this.state.hfc_cd !== this.state.selected_hfc_cd) {
            Alert.alert("Invalid Provider Code", "No provider code is selected. \nPlease select a symptom from the search result.")
            return
        }
        if (this.state.provider !== this.state.selected_provider) {
            Alert.alert("Invalid Provider", "This provider name does not correspond to its provider code.\nPlease select a provider from the search result.")
            return
        }

        // 2. Medication name and code exists, and are the same
        if (!this.state.drug_item_desc) {
            Alert.alert("Invalid Medication", "No medication is selected. \nPlease select a medication from the search result.")
            return
        }
        if (!this.state.drug_item_code || this.state.drug_item_code !== this.state.selected_drug_item_code) {
            Alert.alert("Invalid Medication Code", "No medication code is selected. \nPlease select a medication from the search result.")
            return
        }
        if (this.state.drug_item_desc !== this.state.selected_drug_item_desc) {
            Alert.alert("Invalid Medication", "This medication name does not correspond to its medication code.\nPlease select a medication from the search result.")
            return
        }

        // 3. Check dosage, duration and quantitiy are not empty
        if (!this.state.dosage || this.state.dosage.trim() === "") {
            Alert.alert("Invalid Dosage", "No dosage is specified.\nPlease enter a value for the dosage")
            return
        }
        if (!this.state.duration || this.state.duration.trim() === "") {
            Alert.alert("Invalid Duration", "No duration is specified.\nPlease enter a value for the duration")
            return
        }
        if (!this.state.qty_ordered || this.state.qty_ordered.trim() === "") {
            Alert.alert("Invalid Quantity", "No quantity is specified.\nPlease enter a value for the quantity")
            return
        }

        console.log("All data is valid!")

        // Check for order master duplicate, if no duplicate, insert pis order master
        var todayDate = getTodayDate()

        await this.saveMedicationMaster(todayDate)
    }

    toggleSearchProvider = async () => {
        if (this.state.provider.length < 1) {
            return Alert.alert("Empty Keyword", "Please enter a keyword to search.")
        }

        await this.searchProviders();

        this.toggleModalProvider();
    }

    toggleSearchMedication = async () => {
        if (this.state.drug_item_desc.length < 1) {
            return Alert.alert("Empty Keyword", "Please enter a keyword to search.")
        }

        // Check is provider selected
        if (!this.state.selected_hfc_cd || this.state.selected_hfc_cd == "" || !this.state.hfc_cd || this.state.hfc_cd == "") {
            return Alert.alert("Empty Provider", "Please select a provider before searching for medications.")
        }

        await this.searchMedications();

        this.toggleModalMedication();
    }

    toggleSelectProvider = async (item) => {
        // Extract the hfc_name and code from the item
        await this.setState({
            provider: item.hfc_name,
            hfc_cd: item.hfc_cd,
            selected_provider: item.hfc_name,
            selected_hfc_cd: item.hfc_cd
        })

        this.toggleModalProvider();
    }

    toggleSelectMedication = async (item) => {
        await this.getMedicationData(item);
        this.toggleModalMedication();
    }

    toggleModalProvider = () => {
        this.setState(prevState => ({
            isSearchProvider: !prevState.isSearchProvider
        }))
    };

    toggleModalMedication = () => {
        this.setState(prevState => ({
            isSearchMedication: !prevState.isSearchMedication
        }))
    };

    renderItemProvider = ({ item }) => (
        <ListItem
            title={item.hfc_name}
            onPress={() => {
                this.toggleSelectProvider(item)
            }}
            bottomDivider
        />
    )

    renderItemMedication = ({ item }) => (
        <ListItem
            title={item.d_name}
            onPress={() => {
                this.toggleSelectMedication(item)
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
                <Text style={styles.title}>Medication</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        {/* Search Drug Provider */}
                        <Text style={styles.labelText}>Medication Provider</Text>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: '75%', color: "#000000", backgroundColor: (this.state.isEdit) ? '#F0F0F0' : '#FFFFFF' }]}
                                value={this.state.provider}
                                onChangeText={(value) => this.setState({ provider: value })}
                                placeholder={"Medication Provider"}
                                editable={!this.state.isEdit}
                            />
                            <TouchableOpacity style={[styles.searchButton, { backgroundColor: (this.state.isEdit) ? '#EFEFEF' : '#fdaa26' }]}
                                onPress={this.toggleSearchProvider}
                                disabled={this.state.isEdit}
                            >
                                <Text style={styles.searchButtonText}>Search</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search Drug */}
                        <Text style={styles.labelText}>Medication</Text>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: '75%', color: "#000000", backgroundColor: (this.state.isEdit) ? '#F0F0F0' : '#FFFFFF' }]}
                                value={this.state.drug_item_desc}
                                onChangeText={(value) => this.setState({ drug_item_desc: value })}
                                placeholder={"Medication"}
                                editable={!this.state.isEdit}
                            />
                            <TouchableOpacity style={[styles.searchButton, { backgroundColor: (this.state.isEdit) ? '#EFEFEF' : '#fdaa26' }]}
                                onPress={this.toggleSearchMedication}
                                disabled={this.state.isEdit}
                            >
                                <Text style={styles.searchButtonText}>Search</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Dosage */}
                        <Text style={styles.labelText}>Dosage</Text>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: '55%' }]}
                                value={this.state.dosage}
                                onChangeText={(value) => this.setState({ dosage: value })}
                                keyboardType={"numeric"}
                                maxLength={100}
                                placeholder={"Dosage"}
                            />
                            <TextInput
                                style={[styles.textInputField, { width: '40%', color: '#000000', backgroundColor: '#F0F0F0' }]}
                                value={this.state.dosage_unit}
                                onChangeText={(value) => this.setState({ dosage_unit: value })}
                                editable={false}
                                placeholder={"Dosage Unit"}
                            />
                        </View>

                        {/* Duration */}
                        <Text style={styles.labelText}>Duration</Text>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: '55%' }]}
                                value={this.state.duration}
                                onChangeText={(value) => this.setState({ duration: value })}
                                keyboardType={"numeric"}
                                maxLength={13}
                                placeholder={"Duration"}
                            />
                            <TextInput
                                style={[styles.textInputField, { width: '40%', color: '#000000', backgroundColor: '#F0F0F0' }]}
                                value={this.state.durationt}
                                onChangeText={(value) => this.setState({ durationt: value })}
                                editable={false}
                                placeholder={"Duration Unit"}
                            />
                        </View>


                        {/* Quantity & Drug Frequency */}
                        <View style={styles.rowDisplayContainer}>
                            <Text style={styles.labelText}>Quantity</Text>
                            <Text style={styles.labelText}>Drug Frequency</Text>
                        </View>
                        <View style={styles.rowDisplayContainer}>
                            <TextInput
                                style={[styles.textInputField, { width: '55%' }]}
                                value={this.state.qty_ordered}
                                onChangeText={(value) => this.setState({ qty_ordered: value })}
                                keyboardType={"numeric"}
                                maxLength={7}
                                placeholder={"Quantity"}
                            />
                            <TextInput
                                style={[styles.textInputField, { width: '40%', color: '#000000', backgroundColor: '#F0F0F0' }]}
                                value={this.state.drug_frequency}
                                onChangeText={(value) => this.setState({ drug_frequency: value })}
                                editable={false}
                                placeholder={"Drug Frequency"}
                            />
                        </View>



                        <TextInput
                            style={[styles.textInputField, { marginTop: 20 }]}
                            value={this.state.comment}
                            onChangeText={(value) => this.setState({ comment: value })}
                            placeholder={"Note"}
                            maxLength={255}
                            multiline={true}
                        />
                    </View>
                </ScrollView>

                {/* Button View Area */}
                <View>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={this.handleSaveMedication}
                    >
                        <Text style={{ fontSize: 20, color: 'white', alignSelf: 'center', textAlign: "center" }}>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Provider Modal */}
                <Modal isVisible={this.state.isSearchProvider}>
                    <View style={styles.popUpContainer}>
                        {/*Patient Data View */}
                        <View style={styles.popUpContentContainer}>
                            <Text style={styles.popUpTitle}>Search Result</Text>
                            <Divider />
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={this.state.providerResults}
                                renderItem={this.renderItemProvider}
                            />
                        </View>

                        {/* Button View */}
                        <View style={styles.buttonBar}>
                            <TouchableOpacity
                                style={styles.buttonBack}
                                onPress={() => this.toggleModalProvider()}>
                                <Text style={{ fontSize: 18 }}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Search Drug Modal */}
                <Modal isVisible={this.state.isSearchMedication}>
                    <View style={styles.popUpContainer}>
                        {/*Patient Data View */}
                        <View style={styles.popUpContentContainer}>
                            <Text style={styles.popUpTitle}>Search Result</Text>
                            <Divider />
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={this.state.medicationResults}
                                renderItem={this.renderItemMedication}
                            />
                        </View>

                        {/* Button View */}
                        <View style={styles.buttonBar}>
                            <TouchableOpacity
                                style={styles.buttonBack}
                                onPress={() => this.toggleModalMedication()}>
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
        marginTop: 10,
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