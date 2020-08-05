import React, { Component, useState } from 'react'
import { Text, StyleSheet, View, FlatList, Switch, Image } from 'react-native'
import { ListItem, Avatar } from 'react-native-elements'
import BackgroundTimer from 'react-native-background-timer'

import { getTenantId, getTenantType, getUserId } from '../util/Auth'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import NotificationService from "../util/NotificationService";

const defaultAvatar = require('../img/defaultAvatar.png')

const EMPTY_MESSSAGE_QUEUE_DATA = {
    name: '',
    DOB: '',
    district: '',
    state: '',
    nationality_cd: '',
    txn_code: '',
    picture: '',
    order_no: '',
    user_id: '',
    tenant_id: '',
}

export default class Queue extends Component {

    constructor(props) {
        super(props);

        // global variables
        this.state = {
            isLoading: false,
            isTenantAvailable: false,
            isTimerStart: false,

            user_id: '',
            tenant_id: '',
            tenant_type: '',

            queue: [],
        };

        // Declare the queue notification
        this.notification = new NotificationService(this.onNotification);
    }

    componentDidMount() {
        this.initializeData()

        // Add hook to refresh profile data when screen is Focus
        this.props.navigation.addListener('focus',
            event => {
                // this.loadQueueData()
                // Start the short poll timer, load the Queue Data inside the timer
                if (this.state.isTenantAvailable) {
                    this.startTimer()
                }
            }
        )
    }

    initializeData = async () => {
        await getUserId().then(response => {
            this.setState({ user_id: response });
        });

        await getTenantType().then(response => {
            this.setState({ tenant_type: response });
        });

        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });
    }

    customizeHeader = () => {
        this.props.navigation.setOptions({
            headerRight: () => <Switch
                trackColor={{ false: 'white', true: '#32CD32' }}
                value={this.state.isTenantAvailable}
                onValueChange={(value) => this.toggleStatusSwitch(value)}
            />
        })
    }

    onNotification = () => {
        // Navigate to the queue if notification clicked
        this.props.navigation.navigate("Queue")
    }

    toggleStatusSwitch = (value) => {
        var isAvailable = value

        if (isAvailable) {
            if (this.updateTenantAvailable()) {
                // Start Timer if tenant status is set to available
                this.startTimer()

                // Set the value of switch
                this.setState({
                    isTenantAvailable: isAvailable,
                })
            }
        } else {
            // Set Tenant Status to Not Available
            if (this.updateTenantNotAvailable()) {
                // End Timer if tenant status is set to not available
                this.endTimer()

                // Set the value of switch
                this.setState({
                    isTenantAvailable: isAvailable,
                })
            }

        }
    }

    timer = null

    startTimer = () => {
        if (!this.state.isTimerStart) {
            this.timer = BackgroundTimer.setInterval(() => {
                // this will be executed every 2000 ms (2s)
                // even when app is the the background
                this.loadQueueData();
            }, 1500);

            this.setState({
                isTimerStart: !this.state.isTimerStart
            })
        }
    }

    endTimer = () => {
        BackgroundTimer.clearInterval(this.timer);
        this.setState({
            isTimerStart: false
        })
    }

    loadQueueData = async () => {
        let tenant_id = this.state.tenant_id

        let datas = {
            txn_cd: "MEDORDER009",
            tstamp: getTodayDate(),
            data: {
                tenant_id: tenant_id,
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
                console.log('Get Queue Data Error');
                console.log(json.status);
                return json.status
            }
            else {
                let data = json.status

                console.log("Data obtained!")

                if (data.length > this.state.queue.length) {
                    // Extract the newest order
                    var newData = data[data.length - 1]
                    var title = ''
                    var message = ''
                    if (newData.txn_code === "VIDEO") {
                        title = "New Video Consultation"
                        message = "A new video consultation order is added into the queue. Click here to view the queue."
                    } else {
                        title = "New Chat Consultation"
                        message = "A new chat consultation order is added into the queue. Click here to view the queue."
                    }

                    // Set the title and message of notification and 
                    this.notification.localNotification(title, message)
                }

                this.setState({
                    queue: data,
                    isLoading: false,
                })

            }
        }
        catch (error) {
            console.log('Get Queue Data Error: ' + error);
            this.setState({
                isLoading: false,
            })
            handleNoInternet()
        }

    }

    updateTenantAvailable = async () => {
        this.setState({
            isLoading: true
        })

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER024',
            tstamp: getTodayDate(),
            data: {
                tenant_id: this.state.tenant_id,
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

            if (json.status == 'success' || json.status == 'SUCCESS') {
                console.log("Tenant Status Updated to Available.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                var error = json.status
                console.log("Tenant Status Update (A) Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Tenant Status Update (A) Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false
        }

    }

    updateTenantNotAvailable = async () => {

        this.setState({
            isLoading: true
        })

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER025',
            tstamp: getTodayDate(),
            data: {
                tenant_id: this.state.tenant_id,
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

            if (json.status == 'success' || json.status == 'SUCCESS') {
                console.log("Tenant Status Updated to Not Available.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                var error = json.status
                console.log("Tenant Status Update (N/A) Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Tenant Status Update (N/A) Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false
        }
    }

    toggleQueueModal(item) {
        this.endTimer();
        this.props.navigation.navigate("QueueModal", {
            name: item.name,
            id_number: item.id_number,
            email: item.email,
            mobile_no: item.mobile_no,
            picture: item.picture,
            district: item.district,
            state: item.state,
            txn_code: item.txn_code,
            DOB: item.DOB,
            nationality_cd: item.nationality_cd,
            country: item.country,
            order_no: item.order_no,
            user_id: item.user_id,
            tenant_id: this.state.tenant_id,
            tenant_type: this.state.tenant_type,
            txn_date: item.txn_date
        })
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <ListItem
            title={item.name}
            subtitle={item.district + ", " + item.state}
            leftAvatar={<Avatar
                rounded
                size='large'
                source={{ uri: item.picture }} />
            }
            rightIcon={() => {
                let image = null;

                if (item.txn_code.toUpperCase() === 'CHAT') {
                    image = require('../img/liveChat.png');
                } else if (item.txn_code.toUpperCase() === 'VIDEO') {
                    image = require('../img/videoChat.png');
                }
                return <Image source={image} />;
            }
            }

            bottomDivider
            onPress={() => this.toggleQueueModal(item)}
        />
    )

    render() {

        this.customizeHeader();

        if (!this.state.isTenantAvailable) {
            return (
                <View style={styles.inactiveQueueContainer}>
                    <Text style={styles.inactiveQueueTitle}>The Queue is turn OFF.</Text>
                    <Text style={styles.inactiveQueueMessage}>Please turn ON the queue by toggle on the switch in the top right corner.</Text>
                </View>
            )
        } else {
            return (
                <View>
                    {/* Flatlist View */}
                    <View>
                        <FlatList
                            keyExtractor={this.keyExtractor}
                            data={this.state.queue}
                            renderItem={this.renderItem}
                        />
                    </View>

                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    inactiveQueueContainer: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 30,
        marginRight: 30,
    },

    inactiveQueueTitle: {
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: 18,
        alignSelf: "center",
        textAlign: 'center',
        marginBottom: 10
    },

    inactiveQueueMessage: {
        fontStyle: 'normal',
        fontWeight: 'normal',
        alignSelf: 'center',
        textAlign: 'center',
    },
})
