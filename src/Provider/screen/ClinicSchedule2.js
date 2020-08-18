import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Switch, Alert } from 'react-native'
import { ScrollView, FlatList } from 'react-native-gesture-handler'
import { Picker } from '@react-native-community/picker';
import { HeaderBackButton } from '@react-navigation/stack';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'moment';
import { extendMoment } from 'moment-range';

import Loader from '../screen/Loader'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import { getTodayDate, getStartOfCurrentWeek, getEndOfCurrentWeek, getDatesForCurrentWeek } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { getTenantId, getUserId } from '../util/Auth'
import { isThisHour } from 'date-fns';

const moment = extendMoment(Moment);


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

// Empty session place holder
const EMPTY_SESSION = {
    start_time: '',
    end_time: '',
    quota: 0,
    session: 0
}

// Empty formatted schedule place holder
const EMPTY_SCHEDULE_UI = {
    start_date: '',
    status: '',
    sessions: []
}

const MAX_PAGE = 5

// First color for odd row, another for even rows
const rowColors = ['#E5E5E5', '#FFFFFF']

// Function to return formatted date
const formatDate = (date) => {
    return moment(date).format("DD/MM/YYYY");
}

const formatDay = (date) => {
    return moment(date).format("dddd");
}

export default class ClinicSchedule2 extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isVisible: false,
            isVisible2: false,
            user_id: '',
            tenant_id: '',
            startTime: "",
            endTime: "",
            quota: 0,
            dataSource: [],
            schedulesFromDb: [],
            schedulesToDb: [],

            index: '',
            item_index: '',
            session_index: '',
            checked: false,

            // For Page Navigation
            pageIndex: 0,
            selectedDay: new moment(),
            startOfWeek: '',
            endOfWeek: '',
        }
    }

    async componentDidMount() {
        this.customizeHeader();
        await this.initializeData();
        this.loadSchedule();
    }


    loadSchedule = async () => {
        let daysToAdd = 7 * (this.props.route.params.page - 1);
        let date = moment().add(daysToAdd, 'd')

        // Get the start date and end date using date supplied
        let start_date = getStartOfCurrentWeek(date)
        let end_date = getEndOfCurrentWeek(date)

        // Set the state
        this.setState({
            startOfWeek: start_date,
            endOfWeek: end_date,
        })

        let data = []

        // Get Schedule from database
        data = await this.getSchedule(start_date, end_date);

        // Check if data is empty, generate default schedule if yes
        if (data.length < 1) {
            data = this.createNewSchedule(this.state.tenant_id, this.state.user_id, date)
        }

        // Filter the data with the date
        var filteredSchedules = this.sortSchedules(data, getDatesForCurrentWeek(date));

        // Reconstruct the data to UI suitable foramt
        var formattedData = this.formatSchedules(filteredSchedules, "ui", date);

        // bind the data to source
        this.setState({
            dataSource: formattedData,
            schedulesFromDb: filteredSchedules
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

    // Add Button to header (Modify Header Right)
    customizeHeader = () => {
        this.props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.saveButton}
                    onPress={() => this.handleSave()}
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

    // Load Schedule from database
    getSchedule = async (start_date, end_date) => {
        let user_id = this.state.user_id;
        let tenant_id = this.state.tenant_id;

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
                this.setState({
                    isLoading: false
                });
                return [];
            }
            else {
                let data = json.status
                this.setState({
                    isLoading: false
                });
                return data;
            };

        } catch (error) {
            console.log("Get Clinic Schedule Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return [];
        }
    }

    // Create Default Schedule
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

    // Save Schedule to database
    saveSchedule = async (schedules) => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: "MEDORDER017",
            tstamp: getTodayDate(),
            data: schedules
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

        } catch (error) {
            console.log("Save Clinic Schedule Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet();
        }
    }

    // Format the schedule data for UI / json
    formatSchedules = (data, type) => {
        var formattedArray = []

        // Format Data to UI format
        if (type === 'ui') {

            // Data format:
            // data = [
            //     {
            //         start_date: '2020-08-03 00:00:00',
            //         status: 'available',
            //         sessions: [
            //             { start_time: '2020-08-03 08:00:00', end_time: '2020-08-03 13:00:00', quota: 5, session: '1' },
            //             { start_time: '2020-08-03 08:00:00', end_time: '2020-08-03 19:00:00', quota: 5, session: '2' },
            //         ]
            //     }, 
            // ]

            // Construct the data
            for (let index = 0; index < data.length; index++) {
                var theData = data[index];

                // Declare new data chunk
                var dataChunk = { ...EMPTY_SCHEDULE_UI };

                // Set the variables
                dataChunk.start_date = theData[0].start_date;
                dataChunk.status = theData[0].status;

                // Set session data
                var sessions = [];
                for (let sessionIndex = 0; sessionIndex < theData.length; sessionIndex++) {
                    var session = { ...EMPTY_SESSION };
                    session.start_time = theData[sessionIndex].start_time;
                    session.end_time = theData[sessionIndex].end_time;
                    session.quota = theData[sessionIndex].quota;
                    session.session = theData[sessionIndex].session | 0;
                    sessions.push(session);
                }

                // Insert sessions data into datachunk
                dataChunk.sessions = sessions

                // Insert the data chunk into formattedArray
                formattedArray.push({ ...dataChunk })
            }

            return formattedArray;
        }
        // Format Data to JSON / database format
        else if (type === 'json') {
            // Construct the json data placeholder
            for (let index = 0; index < data.length; index++) {
                var theData = data[index];

                for (let sessionIndex = 0; sessionIndex < theData.sessions.length; sessionIndex++) {
                    var scheduleChunk = { ...EMPTY_SCHEDULE };

                    // Set the variables
                    scheduleChunk.hfc_cd = this.state.tenant_id;
                    scheduleChunk.user_id = this.state.user_id;
                    scheduleChunk.start_date = theData.start_date;
                    scheduleChunk.status = theData.status;
                    scheduleChunk.start_time = theData.sessions[sessionIndex].start_time;
                    scheduleChunk.end_time = theData.sessions[sessionIndex].end_time;
                    scheduleChunk.quota = theData.sessions[sessionIndex].quota;
                    scheduleChunk.created_by = this.state.tenant_id;
                    // scheduleChunk.session = theData.session;

                    // Insert into formattedArray
                    formattedArray.push({ ...scheduleChunk });
                }
            }

            return formattedArray
        }
        else {
            return formattedArray;
        }
    }

    // Sort and Filter data base on date
    sortSchedules = (schedules, dates) => {
        var sortedSchedules = [];

        // For each of the dates, filter the appointment to remain the day only
        for (let index = 0; index < dates.length; index++) {
            // Create a new array to filter the data
            var filteredSchedules = [];

            // Clone the data to retain the original data
            var dataClone = [...schedules];

            // Filter the data array
            filteredSchedules = dataClone.filter((element) => {
                return moment(element.start_date).format("YYYY-MM-DD") === dates[index]
            })

            // Add the filtered Appointment into the appointment list
            if (filteredSchedules.length <= 0) {
                sortedSchedules.push([])
            } else {
                sortedSchedules.push(filteredSchedules);
            }
        }

        return sortedSchedules;
    }

    // Validate the clinic schedules
    validateSchedules = (schedules) => {
        // Loop for all days (7 days)
        for (let index = 0; index < schedules.length; index++) {
            var schedule = schedules[index];
            var scheduleSessions = schedule.sessions;

            // Loop all sessions for a day
            for (let sessionIndex = 0; sessionIndex < scheduleSessions.length; sessionIndex++) {
                var session = scheduleSessions[sessionIndex];
                var start_time = session.start_time;
                var end_time = session.end_time;

                // Check if any start_time and end_time the same (E.g. start from 07/08/2020 10:00 am until 07/08/2020 10:00 am)
                if (moment(start_time).isSame(end_time)) {
                    // Show error
                    Alert.alert("Invalid Time Range", "Invalid time range, same time detected. " +
                        "\nYou cannot set the time from \n" + moment(start_time).format("dddd DD/MM/YYYY HH:mm") + " until \n" + moment(end_time).format("dddd DD/MM/YYYY HH:mm") +
                        ". \nPlease change the time.")
                    return false;
                }

                // Check if any negative time ranges exists (E.g. start from 07/08/2020 11:00 am until 07/08/2020 08:00 am)
                if (moment(end_time).isBefore(start_time, 'second')) {
                    // Show error
                    Alert.alert("Invalid Time Range", "Invalid time range, negative time range detected. " +
                        "\nYou cannot set the time from \n" + moment(start_time).format("dddd DD/MM/YYYY HH:mm") + " until \n" + moment(end_time).format("dddd DD/MM/YYYY HH:mm") +
                        ". \nPlease change the time.")
                    return false;
                }

                // // Loop all sessions to check if current session overlap with other sessions
                // for (let sessionIndex2 = 0; sessionIndex2 < scheduleSessions.length; sessionIndex2++) {
                //     var sessionToCompare = scheduleSessions[sessionIndex2];

                //     // Ignore for same session
                //     if (session.session === sessionToCompare.session) {
                //         continue;
                //     }

                //     const range1 = moment.range(moment(session.start_time), moment(session.end_time));
                //     const range2 = moment.range(moment(sessionToCompare.start_time), moment(sessionToCompare.end_time));

                //     if (range1.overlaps(range2, { adjacent: true })) {
                //         // Show Error Message
                //         Alert.alert("Invalid Time Range", "Invalid time range, overlap time range detected. " +
                //             "\nThe following time range overlaps:\n" + moment(session.start_time).format("dddd DD/MM/YYYY") +
                //             "\nSession#" + session.session + " " + moment(session.start_time).format("HH:mm") + " ~ " + moment(session.end_time).format("HH:mm") +
                //             "\nSession#" + sessionToCompare.session + " " + moment(sessionToCompare.start_time).format("HH:mm") + " ~ " + moment(sessionToCompare.end_time).format("HH:mm") +
                //             "\nPlease ensure the time ranges does not overlap.")

                //         return false;
                //     }
                // }
            }
        }
        return true;
    }

    // Save button event handler
    handleSave = async () => {
        var schedules = this.state.dataSource
        var isScheduleValid = this.validateSchedules(schedules);
        if (isScheduleValid) {
            // Format the schedule from UI format to Json format
            var jsonSchedules = this.formatSchedules(schedules, "json")

            await this.saveSchedule(jsonSchedules);
        }
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
    onUpdateComboBox = (item_index, session_index, quota) => {
        var newData = [...this.state.dataSource]
        newData[item_index].sessions[session_index].quota = quota

        this.setState({
            dataSource: newData
        })
    }

    // Handle Start Time picker
    handlePicker = (datetime) => {
        let start_time = moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        let item_index = this.state.item_index
        let session_index = this.state.session_index

        this.setState({
            isVisible: false,
        })

        var newData = [...this.state.dataSource]
        newData[item_index].sessions[session_index].start_time = start_time

        this.setState({
            dataSource: newData
        })
    }

    // Handle End Time Picker
    handlePicker2 = (datetime) => {
        let end_time = moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        let item_index = this.state.item_index
        let session_index = this.state.session_index

        this.setState({
            isVisible2: false,
        })

        var newData = [...this.state.dataSource]
        newData[item_index].sessions[session_index].end_time = end_time

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
    showPicker = (item_index, session_index, time) => {
        this.setState({
            isVisible: true,
            item_index: item_index,
            session_index: session_index,
            startTime: time
        })
    }

    // Show the end time picker
    showPicker2 = (item_index, session_index, time) => {
        this.setState({
            isVisible2: true,
            item_index: item_index,
            session_index: session_index,
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
            // Alert.alert("First Page", "This is the first page.")
            return
        } else {
            this.props.navigation.goBack()
        }
    }


    ColumnHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <Text style={[styles.headerText]}>Day/Date</Text>
                <Text style={[styles.headerText]}>Available</Text>
                <Text style={[styles.headerText]}>Start Time</Text>
                <Text style={[styles.headerText]}>End Time</Text>
                <Text style={[styles.headerText]}>Quota</Text>
                {/* <Text style={[styles.headerText, { width: 25 }]}></Text> */}
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

    // Add new session into the list
    insertNewSession = (item_index) => {
        // Clone the item data and sessions data
        var newData = [...this.state.dataSource]
        var newSessions = [...newData[item_index].sessions]

        // Get the start date, and remove the time
        var start_date = moment(newData[item_index].start_date).format("YYYY-MM-DD");

        // Push a new session into the sessions array
        var newSession = { ...EMPTY_SESSION }
        newSession.start_time = start_date + " 08:00";
        newSession.end_time = start_date + " 22:00";
        newSession.session = newSessions.length + 1;
        newSessions.push(newSession)

        // Set the new Session into new data
        newData[item_index].sessions = newSessions;

        this.setState({
            dataSource: newData
        })
    }

    // Remove the selected session form the list
    removeCurrentSession = (item_index, session_index) => {
        // Clone the item data and sessions data
        var newData = [...this.state.dataSource]
        var newSessions = [...newData[item_index].sessions]

        // Get the data with the index
        var delSession = { ...newSessions[session_index] }

        // Filter the data out from the sessions array
        newSessions = newSessions.filter(session => session.session != delSession.session)

        // Set the new Session into new data
        newData[item_index].sessions = newSessions;

        this.setState({
            dataSource: newData
        })
    }

    // Item index is the index of the item, while session index is the index of session Eg: (items[item_index].sessions[session_index])
    renderSessions = (item_index, item_sessions) => {
        // Reset the session value in sessions with index (for database purposes)
        for (let index = 0; index < item_sessions.length; index++) {
            item_sessions[index].session = index + 1
        }

        // session_index = session.session - 1
        var sessionArrViews = item_sessions.map(
            session =>
                (<View style={[styles.sessionContainer]}>
                    {/* Time Pickers */}
                    <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: this.state.dataSource[item_index].status === 'available' ? '#FFFFFF' : '#EBEBE4' }]}
                        onPress={() => { this.showPicker(item_index, (session.session) - 1, session.start_time) }}
                        disabled={this.state.dataSource[item_index].status === 'not available'}

                    >
                        <Text style={[styles.timeText]}>
                            {moment(session.start_time).format("HH:mm")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: this.state.dataSource[item_index].status === 'available' ? '#FFFFFF' : '#EBEBE4' }]}
                        onPress={() => { this.showPicker2(item_index, (session.session) - 1, session.end_time) }}
                        disabled={this.state.dataSource[item_index].status === 'not available'}
                    >
                        <Text style={styles.timeText}>
                            {moment(session.end_time).format("HH:mm")}
                        </Text>
                    </TouchableOpacity>

                    {/* Drop Down box */}
                    <Picker
                        selectedValue={session.quota}
                        style={pickerSelectStyles.inputAndroid}
                        enabled={this.state.dataSource[item_index].status === 'available'}
                        onValueChange={(itemValue, itemIndex) => {
                            this.onUpdateComboBox(item_index, (session.session) - 1, itemValue)
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


                    {/* Little Button */}
                    {/* {

                        session.session <= 1 ?
                            <TouchableOpacity style={[styles.buttonSmall, { 
                                backgroundColor: this.state.dataSource[item_index].status === 'available' ? '#FFD54E' : '#EBEBE4',
                                borderColor: this.state.dataSource[item_index].status === 'available' ? '#FFD54E' : "#ABABAB",
                            }]}
                                onPress={() => this.insertNewSession(item_index)}
                                disabled={this.state.dataSource[item_index].status === 'not available'}
                            >
                                <MaterialCommunityIcons name={'plus'} size={30} color={'white'} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={[styles.buttonSmall, { backgroundColor: '#FFD54E', borderColor: '#FFD54E' }]}
                                onPress={() => this.removeCurrentSession(item_index, (session.session) - 1)}
                            >
                                <MaterialCommunityIcons name={'minus'} size={30} color={'white'} />
                            </TouchableOpacity>
                    } */}

                    {/* DB Session Index for Debugging Purposes */}
                    {/* <Text>{session.session}</Text> */}
                </View>)
        )

        return sessionArrViews;
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
                            <View style={[styles.elementContainer, { flexDirection: 'row' }]}>
                                <View style={styles.dateContainer}>
                                    <Text style={styles.dateText}>
                                        {formatDay(item.start_date)}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {formatDate(item.start_date)}
                                    </Text>
                                </View>

                                {/* Radio Button */}
                                <View style={styles.checkBoxContainer}>
                                    <Switch
                                        trackColor={{ false: '#D81616', true: '#4BD948' }}
                                        value={item.status === 'available'}
                                        onValueChange={(value) => this.onUpdateChangeSwitch(index, value)}
                                    />
                                </View>

                                <View>
                                    {/* Sessions */}
                                    {this.renderSessions(index, item.sessions)}
                                </View>
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
        justifyContent: "space-evenly",
        padding: 10,
    },

    sessionContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 2,
        marginBottom: 2,
    },

    dateContainer: {
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
        marginLeft: 10,
        marginRight: 20,
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
        paddingTop: 10,
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
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 10,
        marginRight: 10,
    },

    saveButtonText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 16,
        color: '#FFFFFF',
    },

    buttonSmall: {
        // backgroundColor: '#FFD54E',
        alignItems: "center",
        alignSelf: 'center',
        alignContent: 'center',
        padding: 0,
        borderRadius: 5,
        marginLeft: 10,
        borderStyle: "solid",
        borderWidth: 1,
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
