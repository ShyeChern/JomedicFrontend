import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Switch, Alert } from 'react-native'
import { ScrollView, FlatList } from 'react-native-gesture-handler'
import { Picker } from '@react-native-community/picker';
import { HeaderBackButton } from '@react-navigation/stack';

import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

import Loader from '../screen/Loader'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import { getTodayDate, getStartOfCurrentWeek, getEndOfCurrentWeek, getDatesForCurrentWeek } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { getTenantId, getUserId } from '../util/Auth'

// Empty schedule placeholder
const EMPTY_SCHEDULE = {
    hfc_cd: '', // tenant_id, but named as hfc_cd in pms_duty_roster
    user_id: '',
    start_date: null,
    start_time: null,
    end_time: null,
    status: 'not available',
    quota: 0,
    created_by: '',
}

const MAX_PAGE = 5

// First color for odd row, another for even rows
const rowColors = ['#E5E5E5', '#FFFFFF']

export default class ClinicSchedule extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isVisible: false,
            isVisible2: false,
            startTime: "",
            endTime: "",
            quantity: 0,
            dataSource: [],

            index: '',
            checked: false,

            // For Page Navigation
            pageIndex: 0,
            selectedDay: new moment(),
            startOfWeek: '',
            endOfWeek: '',
        }
    }

    // Load data from database when view loads
    async componentDidMount() {
        await this.initializeData()
        this.customizeHeader()      // Add Save button
        this.loadSchedule()
    }

    // Add Button to header (Modify Header Right)
    customizeHeader = () => {
        this.props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.saveButton}
                    onPress={() => this.saveSchedule()}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            ),
            headerLeft: () => <HeaderBackButton
                onPress={() => {
                    this.props.navigation.navigate("Account")
                }}
            />,
            headerShown: true
        })
    }

    // Get data from async storage
    initializeData = async () => {
        await getUserId().then(response => {
            this.setState({ user_id: response });
        });

        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });
    }

    // Load Clinic Schedule 
    loadSchedule = async () => {
        let user_id = this.state.user_id;
        let tenant_id = this.state.tenant_id;

        let daysToAdd = 7 * (this.props.route.params.page - 1);
        let date = moment().add(daysToAdd, 'd')

        // Get the start date and end date using date supplied
        let start_date = getStartOfCurrentWeek(date)
        let end_date = getEndOfCurrentWeek(date)

        // Set the state
        this.setState({
            startOfWeek: start_date,
            endOfWeek: end_date,
            isLoading: true
        })

        // Get User Profile and its data
        let datas = {
            txn_cd: 'MEDORDER016',
            tstamp: getTodayDate(),
            data: {
                user_id: user_id,
                hfc_cd: tenant_id,
                start_date: start_date,
                end_date: end_date,
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
                console.log('Get Clinic Schedule Error');
                console.log(json.status);
            }
            else {
                let data = json.status
                if (data.length < 1) {
                    data = this.createNewSchedule(tenant_id, user_id, date)
                }

                // bind the data to source
                this.setState({
                    dataSource: data
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Clinic Schedule Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    createNewSchedule = (tenant_id, user_id, date) => {
        let dates = getDatesForCurrentWeek(date);
        let initialDataArray = []

        // Add Seven Empty Schedule clones into the Initial Data Array
        for (let i = 0; i < 7; i++) {
            initialDataArray.push({ ...EMPTY_SCHEDULE })
        }

        // Assign the datas into the array
        let index = 0;
        while (index < 7) {
            initialDataArray[index].hfc_cd = tenant_id;
            initialDataArray[index].user_id = user_id;
            initialDataArray[index].start_date = dates[index] + " 00:00:00";
            initialDataArray[index].start_time = dates[index] + " 08:00:00";
            initialDataArray[index].end_time = dates[index] + " 22:00:00";
            initialDataArray[index].created_by = tenant_id;
            index++;
        }

        return initialDataArray
    }

    saveSchedule = async () => {
        this.setState({
            isLoading: true
        })

        // Prepare data for Insert
        var dataSourceArray = [...this.state.dataSource]  // Array that holds the data source
        var jsonedArray = []                        // Array the holds the datas

        dataSourceArray.forEach((element) => {
            let dataChunks = {
                hfc_cd: element.hfc_cd,
                user_id: element.user_id,
                start_date: moment(element.start_date).format("YYYY-MM-DD HH:mm"),
                start_time: moment(element.start_time).format("YYYY-MM-DD HH:mm"),
                end_time: moment(element.end_time).format("YYYY-MM-DD HH:mm"),
                status: element.status,
                quota: element.quota,
                created_by: element.created_by,
            }
            jsonedArray.push(dataChunks)
        })

        let datas = {
            txn_cd: "MEDORDER017",
            tstamp: getTodayDate(),
            data: jsonedArray
        }

        const response = await fetch(URL_Provider, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datas)
        });

        const json = await response.json();

        if (json.status === 'success' || json.status == "SUCCESS") {
            console.log('All Clinic Schedule saved!', json.status);
            alert('All Clinic Schedules Saved!')
        } else {
            console.log('Save Clinic Schedule Error');
            console.log(json.status);
        }
        this.setState({
            isLoading: false
        });
    }

    // Update the switch
    onUpdateChangeSwitch = (index, value) => {
        var newData = [...this.state.dataSource]
        newData[index].status = value ? "available" : "not available"

        this.setState({
            dataSource: newData
        })

    }

    // Update ComboBox data to the item
    onUpdateComboBox = (index, quota) => {
        var newData = [...this.state.dataSource]
        newData[index].quota = quota

        this.setState({
            dataSource: newData
        })
    }

    // Handle Start Time picker
    handlePicker = (datetime) => {
        let start_time = moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        let index = this.state.index

        this.setState({
            isVisible: false,
        })

        var newData = [...this.state.dataSource]
        newData[index].start_time = start_time

        this.setState({
            dataSource: newData
        })
    }

    // Handle End Time Picker
    handlePicker2 = (datetime) => {
        let end_time = moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        let index = this.state.index

        this.setState({
            isVisible2: false,
        })

        var newData = [...this.state.dataSource]
        newData[index].end_time = end_time

        this.setState({
            dataSource: newData
        })
    }

    // Hide all start time and end time picker
    hidePicker = () => {
        this.setState({
            isVisible: false,
            isVisible2: false,
        })
    }

    // Show The start time picker
    showPicker = (index, time) => {
        this.setState({
            isVisible: true,
            index: index,
            startTime: time
        })
    }

    // Show the end time picker
    showPicker2 = (index, time) => {
        this.setState({
            isVisible2: true,
            index: index,
            endTime: time
        })
    }

    // Page event handler
    nextPage = () => {
        var params = this.props.route.params

        if (params.page >= MAX_PAGE) {
            Alert.alert("Last Page", "This is the last page. You can only preset clinic schedule for 5 weeks.")
            return
        } else {
            this.props.navigation.push("ClinicSchedule", {
                user_id: params.user_id,
                tenant_id: params.tenant_id,
                page: params.page + 1
            })
        }

    }

    previousPage = () => {
        var params = this.props.route.params

        // Ignore the operation if this is the first page
        if (params.page <= 1) {
            Alert.alert("First Page", "This is the first page.")
            return
        } else {
            this.props.navigation.goBack()
        }
    }


    ColumnHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Day/Date</Text>
                <Text style={styles.headerText}>Start Time</Text>
                <Text style={styles.headerText}>End Time</Text>
                <Text style={styles.headerText}>Available</Text>
                <Text style={styles.headerText}>Quota</Text>
            </View>
        )
    }

    BottomButtonBar = () => {
        return (
            <View style={styles.bottomButtonBar}>
                <TouchableOpacity
                    style={[styles.buttonLayoutSize, styles.previousButton]}
                    onPress={() => this.previousPage(0)}
                >
                    <Text style={styles.previousText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buttonLayoutSize, styles.nextButton]}
                    onPress={() => this.nextPage()}
                >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>
        )
    }

    formatTime = (time) => {
        return new Date(
            moment(time).format("YYYY-MM-DDTHH:mm:ss") + "+08:00"
        )
    }

    render() {

        // View Loading if it is loading
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ flex: 1, paddingTop: '15%' }}>
                <this.ColumnHeader />
                <FlatList
                    data={this.state.dataSource}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={{ backgroundColor: rowColors[index % rowColors.length] }}>
                            <View style={[styles.elementContainer]}>
                                {/* Day/Date  */}
                                <View style={styles.date}>
                                    <Text style={styles.dateText}>
                                        {moment(item.start_date).format("dddd")}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {moment(item.start_date).format("DD/MM/YYYY")}
                                    </Text>
                                </View>

                                {/* Time Pickers */}
                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => { this.showPicker(index, item.start_time) }}
                                >
                                    <Text style={styles.timeText}>
                                        {moment(item.start_time).format("HH:mm")}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => { this.showPicker2(index, item.end_time) }}
                                >
                                    <Text style={styles.timeText}>
                                        {moment(item.end_time).format("HH:mm")}
                                    </Text>
                                </TouchableOpacity>

                                {/* Radio Button */}
                                <View style={styles.checkBoxContainer}>
                                    <Switch
                                        trackColor={{ false: '#D81616', true: '#4BD948' }}
                                        value={item.status === 'available'}
                                        onValueChange={(value) => this.onUpdateChangeSwitch(index, value)}
                                    />
                                </View>

                                {/* Drop Down box */}
                                <Picker
                                    selectedValue={item.quota}
                                    style={pickerSelectStyles.inputAndroid}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.onUpdateComboBox(index, itemValue)
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
                                </Picker>


                            </View>
                        </View>
                    )}
                />
                <View>
                    <DateTimePicker
                        isVisible={this.state.isVisible}
                        onConfirm={(datetime) => this.handlePicker(datetime)}
                        onCancel={this.hidePicker}
                        mode={'time'}
                        date={this.formatTime(this.state.startTime)}
                        is24Hour={true}
                    // display={'spinner'} // 'spinner' or 'clock' for time, default is clock
                    />
                    <DateTimePicker
                        isVisible={this.state.isVisible2}
                        onConfirm={(datetime) => {
                            this.handlePicker2(datetime)
                        }}
                        onCancel={this.hidePicker}
                        mode={'time'}
                        date={this.formatTime(this.state.endTime)}
                        is24Hour={true}
                    // display={'spinner'}
                    />
                </View>
                <View>
                    <this.BottomButtonBar />
                </View>
            </View>

        )

    }
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        padding: 10,
        borderBottomColor: "#848181",
        borderBottomWidth: 1,
    },

    headerText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#000000',
        alignSelf: 'center',
        textAlign: 'center',
    },

    elementContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        padding: 10,
    },

    date: {
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
    },

    dateText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#000000',
        alignSelf: 'center',
        textAlign: 'center',
    },

    timeButton: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: '#FFFFFF',
        borderStyle: "solid",
        borderColor: "#ABABAB",
        borderRadius: 5,
        borderWidth: 1,
        paddingTop: 5,
        paddingBottom: 5,
        paddingStart: 10,
        paddingEnd: 10,
        marginLeft: 6,
        marginRight: 6,
    },

    timeText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#000000',
        alignSelf: 'center',
        textAlign: 'center',
    },

    bottomButtonBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 20,
    },

    buttonLayoutSize: {
        borderRadius: 30,
        width: 126,
        height: 30,
        alignSelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: "center",
    },

    previousButton: {
        borderColor: "#FDAA26",
        borderStyle: "solid",
        borderWidth: 1,
    },

    previousText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#FDAA26',
    },

    nextButton: {
        backgroundColor: "#FDAA26",
    },

    nextText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#FFFFFF',
    },

    checkBoxContainer: {
        alignSelf: 'center',
    },

    checkBoxImage: {
        height: 16,
        width: 16,
    },

    saveButton: {
        backgroundColor: "#FDAA26",
        padding: 8,
        borderRadius: 10,
        marginRight: 10,
    },

    saveButtonText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#FFFFFF',
    },
})

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        color: 'black',
        backgroundColor: '#FFFFFF',
        borderStyle: "solid",
        borderColor: "#ABABAB",
        borderRadius: 5,
        borderWidth: 1,
        alignSelf: "center",
        alignItems: 'center',
        alignContent: 'center',
        textAlign: "center",

        color: '#000000',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 12,
        alignItems: 'center',

    },
    inputAndroid: {
        width: 43,
        height: 28,
        // top: 2,
        // right: 0,

        backgroundColor: '#FFFFFF',
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
    iconContainer: {
        top: 15,
        right: 0,
    },

});
