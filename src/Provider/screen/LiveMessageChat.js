import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Avatar } from 'react-native-elements'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'
import BackgroundTimer from 'react-native-background-timer'
import { HeaderBackButton } from '@react-navigation/stack';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

import { URL_Provider, URL_AuditTrail, CODE_JomedicOnlineChat } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'

const MY_USER_TYPE = 'tenant'

export default class PatientLiveChat extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // The booleans
            isLoading: false,
            isReadOnly: false,

            // The data for display / search
            name: '',
            id_number: '',
            email: '',
            mobile_no: '',
            picture: '',
            order_no: '',
            user_id: '',        // User_id of Customer
            tenant_id: '',
            tenant_type: '',
            messages: [],
            newMessage: '',
            servicePrice: '',

            // Data for database updates
            orderMaster: {},
            orderDetail: {},
            messageQueue: {},

            // Data Required for Consultations
            encounter_date: '',
            episode_date: '',

        }
    }

    async componentDidMount() {
        await this.initialzeData()
        this.customizeHeader()

        // Start the time depending if it is live chat
        if (!this.props.route.params.isReadOnly) {

            // Get the full data for Message Queue Detail
            this.getMessageQueueData();

            // Get the price of Jomedic Live Chat Service
            this.getServicePrice();

            this.startTimer();
        } else {
            // Get the Chat History Data if it is not live chat
            this.getChatMessages();
        }
    }

    timer = null

    startTimer = () => {
        this.timer = BackgroundTimer.setInterval(() => {
            // this will be executed every 1000 ms (1s)
            // even when app is the the background
            this.getChatMessages();
            this.checkOrderStatus();

            console.log("Chat Timer Running...")
        }, 2000);
    }

    endTimer = () => {
        // End the timer
        BackgroundTimer.clearInterval(this.timer);
        console.log("Chat Timer ends.")
    }

    menu = null;

    setMenuReference = (ref) => {
        this.menu = ref;
    }

    hideMenu = () => {
        this.menu.hide();
    }

    showMenu = () => {
        this.menu.show();
    }

    initialzeData = () => {
        var params = this.props.route.params

        this.setState({
            name: params.name,
            id_number: params.id_number,
            email: params.email,
            mobile_no: params.mobile_no,
            picture: params.picture,
            isReadOnly: params.isReadOnly,
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            tenant_type: params.tenant_type,
            episode_date: params.episode_date,
            encounter_date: params.encounter_date,
        })
    }

    getMessageQueueData = async () => {
        var params = this.props.route.params

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER021',
            tstamp: getTodayDate(),
            data: {
                order_no: params.order_no,
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
                console.log('Get Message Queue Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]
                this.setState({
                    messageQueue: data
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Message Queue Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    getChatMessages = async () => {
        var params = this.props.route.params

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER022',
            tstamp: getTodayDate(),
            data: {
                order_no: params.order_no,
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

            if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                console.log('Get Chat History Error');
                console.log(json.status);
            }
            else {
                var data = json.status
                this.setState({
                    messages: data
                })

            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Chat History Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    checkOrderStatus() {
        this.getMessageQueueData()
        var queueData = this.state.messageQueue

        // End the timer if order status is ended
        if (queueData.order_status === 'end') {
            this.endTimer()

            Alert.alert(
                'Chat Ended', // Alert Title
                'The chat has ended as the customer leaves the chat.', // Alert Message
                [
                    {
                        text: "OK", // No Button
                    }
                ],
                { cancelable: false }   // Set the alert to must be answered
            )

            this.setState({
                isReadOnly: true,
            })
        }
    }

    getServicePrice = async () => {

        // Get the code for online chat
        let datas = {
            txn_cd: 'MEDORDER033',
            tstamp: getTodayDate(),
            data: {
                service_type: CODE_JomedicOnlineChat,
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
                console.log('Get Message Queue Error');
                console.log(json.status);
            }
            else {
                var data = json.status[0]
                this.setState({
                    servicePrice: data.price
                })

            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Message Queue: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }
    }

    updateMessageStatusEnd = async () => {
        // Get the order no
        let datas = {
            txn_cd: 'MEDORDER014',
            tstamp: getTodayDate(),
            data: {
                order_no: this.props.route.params.order_no,
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
                this.setState({
                    isLoading: false
                });

                return true;
            } else {
                console.log('End Order Error (Update Message Queue)');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };


        } catch (error) {
            console.log("End Order Error (Update Message Queue): " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }
    }

    saveOrderMaster = async (todayDate) => {

        // Get the required datas
        let datas = {
            txn_cd: 'MEDORDER001',
            tstamp: todayDate,
            data: {
                user_id: this.state.user_id,
                order_no: this.state.order_no,
                txn_code: this.state.messageQueue.txn_code,
                status: "done",
                created_by: this.state.tenant_id
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
                this.setState({
                    isLoading: false
                });

                return true;
            } else {
                console.log('End Order Error (Save Order Master)');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };


        } catch (error) {
            console.log("End Order Error (Save Order Master): " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }
    }

    saveOrderDetail = async (todayDate) => {
        // Get the required datas
        let datas = {
            txn_cd: 'MEDORDER005',
            tstamp: todayDate,
            data: {
                order_no: this.state.order_no,
                item_cd: "",
                item_desc: "",
                amount: this.state.servicePrice,           // Price for service J12101
                quantity: 0,
                deposit: 0,
                discount: 0,
                service_type: CODE_JomedicOnlineChat,  // Jomedic Chat is J12101
                status: "done",          // done: This was only inserted when chat service ends
                created_by: this.state.tenant_id
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
                this.setState({
                    isLoading: false
                });

                return true;
            } else {
                console.log('Reject Order Error (Message Queue)');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };


        } catch (error) {
            console.log("Reject Order Error (Message Queue): " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }
    }

    customizeHeader = () => {
        this.props.navigation.setOptions({
            headerTintColor: 'white',
            headerTransparent: false,
            headerTitle: () => (
                <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                    <Avatar rounded
                        size={40}
                        source={{ uri: this.state.picture }} />
                    <Text style={{
                        fontSize: 16,
                        color: '#FFFFFF',
                        alignSelf: 'center',
                        marginLeft: 10,
                    }}>{this.state.name}</Text>
                </View>
            ),
            headerStyle: {
                backgroundColor: '#FFD54E',
            },
            headerLeft: () => <HeaderBackButton
                tintColor={"white"}
                onPress={() => {
                    this.handleEndChat()
                }}
            />,
            headerShown: true
        })

        if (!this.state.isReadOnly) {
            this.props.navigation.setOptions({
                headerRight: () => (
                    <Menu
                        ref={this.setMenuReference}
                        button={
                            <TouchableOpacity
                                onPress={this.showMenu}>
                                <MaterialCommunityIcon name="dots-vertical" size={35} color={"white"} />
                            </TouchableOpacity>
                        }
                    >
                        <MenuItem
                            onPress={() => {
                                this.hideMenu();
                                this.props.navigation.navigate("ComplaintList", {
                                    order_no: this.props.route.params.order_no,
                                    user_id: this.props.route.params.user_id,
                                    tenant_id: this.props.route.params.tenant_id,
                                    encounter_date: this.props.route.params.encounter_date,
                                    episode_date: this.props.route.params.episode_date,
                                    id_number: this.props.route.params.id_number,
                                });
                            }}>
                            Complaint
                    </MenuItem>
                        <MenuItem
                            onPress={() => {
                                this.hideMenu()
                                this.props.navigation.navigate("DiagnosisList", {
                                    order_no: this.props.route.params.order_no,
                                    user_id: this.props.route.params.user_id,
                                    tenant_id: this.props.route.params.tenant_id,
                                    encounter_date: this.props.route.params.encounter_date,
                                    episode_date: this.props.route.params.episode_date,
                                    id_number: this.props.route.params.id_number
                                });
                            }}>
                            Diagnosis
                    </MenuItem>
                        <MenuItem
                            onPress={() => {
                                this.hideMenu();
                                this.props.navigation.navigate("VitalSign", {
                                    order_no: this.props.route.params.order_no,
                                    user_id: this.props.route.params.user_id,
                                    tenant_id: this.props.route.params.tenant_id,
                                    encounter_date: this.props.route.params.encounter_date,
                                    episode_date: this.props.route.params.episode_date,
                                    id_number: this.props.route.params.id_number
                                });
                            }}>
                            Vital Signs
                    </MenuItem>
                        <MenuItem
                            onPress={() => {
                                this.hideMenu();
                                this.props.navigation.navigate("MedicationList", {
                                    order_no: this.props.route.params.order_no,
                                    user_id: this.props.route.params.user_id,
                                    tenant_id: this.props.route.params.tenant_id,
                                    encounter_date: this.props.route.params.encounter_date,
                                    episode_date: this.props.route.params.episode_date,
                                    id_number: this.props.route.params.id_number
                                });
                            }}>
                            Medication
                    </MenuItem>
                    </Menu>
                )
            })
        }
    }

    handleEndChat = () => {
        if (!this.props.route.params.isReadOnly) {
            Alert.alert(
                'Leave Chat Session', // Alert Title
                "Do you want to leave the chat session?" + "\nThe chat will end once you leave." +
                "\n\nPlease ensure that you have saved all consultation notes before leaving the chat.", // Alert Message
                [
                    {
                        text: "No", // No Button
                        onPress: () => {
                            console.log("No Pressed")    // Do nothing~~~XD
                        }
                    },
                    {
                        text: "Yes", // Yes Button
                        onPress: () => {
                            console.log("Yes pressed")
                            this.endTimer();
                            this.endChat();
                        }
                    }
                ],
                { cancelable: false }   // Set the alert to must be answered
            )
        } else {
            this.props.navigation.goBack()
        }
    }

    endChat = async () => {

        // Get the today date for consistency, as txn_date for Order Detail (PK) is linked to Order Master
        var todayDate = getTodayDate()

        // Update Message Queue status to End
        var isMessageQueueUpdate = this.updateMessageStatusEnd()

        // Save Order Master
        var isOrderMasterSave = this.saveOrderMaster(todayDate)

        // Save Order Detail
        var isOrderDetailSave = this.saveOrderDetail(todayDate)

        // Send the prescription slip
        // Get the health_facility_code from medicationmaster
        var medicationMaster = await this.loadMedicationMaster()
        var isPrescriptionSlipSent = await this.sendPrescriptionSlip(this.state.tenant_id, this.state.id_number, this.state.order_no, medicationMaster.HEALTH_FACILITY_CODE);

        if (isMessageQueueUpdate && isOrderMasterSave && isOrderDetailSave && isPrescriptionSlipSent) {
            this.props.navigation.navigate("RateCustomerModal", {
                tenant_id: this.state.tenant_id,
                tenant_type: this.state.tenant_type,
                user_id: this.state.user_id,
                order_no: this.state.order_no
            })
        }
        else {
            Alert.alert("End Order Fail", "Fail to end this order, please try again.")
        }
    }

    sendMessage = async () => {
        // Check is the message empty or whitespace
        if (!this.state.newMessage.trim()) {
            console.log("Empty string ignored...")
            this.clearMessage()
            return;
        }

        var params = this.props.route.params

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER023',
            tstamp: getTodayDate(),
            data: {
                order_no: params.order_no,
                order_date: moment(this.state.messageQueue.order_date).format("YYYY-MM-DD HH:mm:ss"),
                sender_id: params.user_id,
                receiver_id: params.tenant_id,
                message: this.state.newMessage,
                user_type: MY_USER_TYPE,
                created_by: params.tenant_id
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
                // Clear the message
                this.clearMessage();

                // Refresh the chat message
                this.getChatMessages();

            } else {
                console.log('Insert Chat History Error');
                console.log(json.status);
            }

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Insert Chat History Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }

    }

    clearMessage = () => {
        this.setState({
            newMessage: ''
        })
    }

    sendPrescriptionSlip = (tenant_id, pmi_no, order_no, health_facility_code) => {
        let datas = {
            txn_cd: "MEDORDER073",
            tstamp: getTodayDate(),
            data: {
                order_no: order_no,
                pmi_no: pmi_no,
                hfc_cd: tenant_id,
                health_facility_code: health_facility_code
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

            if (json.result === 'true') {
                this.setState({
                    isLoading: false
                });

                return true;
            } else {
                console.log('Send Prescription Error: ');
                console.log(json.status);
                this.setState({
                    isLoading: false
                });

                return false;
            };

        } catch (error) {
            console.log("Send Prescription Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false;
        }

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

    Message = (props) => {
        return (
            <View style={[styles.messageContainer,
            {
                alignSelf: (props.user_type === MY_USER_TYPE) ? 'flex-end' : 'flex-start',
                borderBottomLeftRadius: (props.user_type === MY_USER_TYPE) ? 4 : 0,
                borderBottomRightRadius: (props.user_type === MY_USER_TYPE) ? 0 : 4,
                // backgroundColor: (props.user_type === MY_USER_TYPE) ? 0 : 4,
            }]}>
                <Text style={styles.messageContentText}>
                    {props.message}
                </Text>
                <Text style={styles.messageDateText}>
                    {moment(props.message_id).format("hh:mm A")}
                </Text>
            </View >
        )
    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.bodyContainer}
                    ref={(view) => {
                        this.scrollView = view;
                    }}
                    onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })} // Automatic scroll to end of list when new message added
                    onLayout={() => this.scrollView.scrollToEnd({ animated: true })}    // Automatic scroll to end of list when keyboard clicked
                >
                    {
                        this.state.messages.map((message, index) =>
                            <this.Message
                                key={index.toString()}
                                {...message} />
                        )
                    }
                </ScrollView>

                <View style={styles.footerContainer}>
                    <TextInput
                        style={styles.textInputField}
                        value={this.state.newMessage}
                        editable={!this.state.isReadOnly}
                        maxLength={500}
                        onChangeText={(newMessage) => {
                            this.setState({ newMessage: newMessage })
                        }}
                        placeholder={'Message'}
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        disabled={this.state.isReadOnly}
                        onPress={() => this.sendMessage()}>
                        <MaterialCommunityIcon
                            name={this.state.isReadOnly ? 'cancel' : 'send'}
                            size={25}
                            color={this.state.isReadOnly ? '#E50027' : '#494949'} />
                    </TouchableOpacity>
                </View>
            </View >

        )
    }
}

const styles = StyleSheet.create({

    bodyContainer: {
        margin: 10,
    },

    messageContainer: {
        margin: 10,
        marginTop: 5,
        marginBottom: 5,
        padding: 10,
        flexDirection: 'row',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        maxWidth: '85%',
        flexWrap: 'wrap',
        backgroundColor: '#FFFFFF',
    },

    messageContentText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 15,
        alignItems: 'center',
        color: '#4F4F4F',
        paddingRight: 25,
    },

    messageDateText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 14,
        // color: '#D6D6D6',
        alignSelf: 'flex-end',
        marginTop: 5,
    },

    footerContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingLeft: '5%',
        paddingRight: '5%',
        justifyContent: 'space-between'
    },

    textInputField: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        alignItems: 'center',
        flexGrow: 1,
        maxWidth: '90%',
    },

    sendButton: {
        alignItems: 'center',
        alignSelf: 'center'
    },
})
