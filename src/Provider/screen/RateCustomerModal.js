import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, TextInput, Alert } from 'react-native'
import { AirbnbRating } from 'react-native-elements';
import { AndroidBackHandler } from "react-navigation-backhandler";

import Loader from '../screen/Loader'
import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'

export default class RateCustomerModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,

            // Variable from previous screen
            order_no: '',   // PK
            user_id: '',
            tenant_id: '',
            tenant_type: '',
            isAppointment: false,
            isBlock: true,

            // Variables for this screen
            txn_date: '',       // PK (use tstamp)
            rating: '0',
            comments: '',
            commentRemainingLength: 100,
            feedbackSelected: { Execellent: false, FastResponse: false, Helpful: false, Kind: false, Efficient: false },
        }
    }

    componentDidMount() {
        this.initializeData()
    }

    onBackButtonPressAndroid = () => {
        if(this.state.isBlock){
            console.log("Hardware back button blocked in Rate Customer")
            return true
        }
        return false;
    };

    initializeData = () => {
        // Get the params data
        var params = this.props.route.params;

        this.setState({
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            tenant_type: params.tenant_type,
            isAppointment: params.isAppointment
        })
    }

    updateTenantAvailable = async () => {
        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER024',
            tstamp: getTodayDate(),
            data: {
                tenant_id: this.props.route.params.tenant_id,
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
                console.log("Tenant Status Updated.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                var error = json.status
                console.log("Update Tenant Status Error: " + error)
                Alert.alert("Update Tenant Status Error", "Fail to update tenant status, please try again.\n" + error)

                return false
            };

        } catch (error) {
            console.log("Update Tenant Status Error: " + error)
            Alert.alert("Update Tenant Status Error", "Fail to update tenant status, please try again.\n" + error)
            // handleNoInternet()
            return false
        }
    }

    // updateTenantNotAvailable = async () => {
    //     // Get the tenant id
    //     let datas = {
    //         txn_cd: 'MEDORDER025',
    //         tstamp: getTodayDate(),
    //         data: {
    //             tenant_id: this.props.route.params.tenant_id,
    //         }
    //     }

    //     try {
    //         const response = await fetch(URL_Provider, {
    //             method: 'POST',
    //             headers: {
    //                 Accept: 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(datas)
    //         });

    //         const json = await response.json();

    //         if (json.status == 'success' || json.status == "SUCCESS") {
    //             console.log("Tenant Status Updated.")
    //             this.setState({
    //                 isLoading: false
    //             })
    //             return true;
    //         } else {
    //             var error = json.status
    //             console.log("End Order Error: " + error)

    //             return false
    //         };

    //     } catch (error) {
    //         console.log("End Order Error: " + error)

    //         handleNoInternet()
    //         return false
    //     }
    // }


    rateCustomer = () => {
        this.setState({
            isLoading: true
        })

        // Extract the feedback selected (Convert boolean to string array)
        var tagString = this.compileFeedbackSelected();

        var tenantStatusUpdate = false;
        tenantStatusUpdate = this.updateTenantAvailable()

        // Save the feedback into jlk_feedback
        if (this.saveRateCustomer(tagString) && tenantStatusUpdate) {

            // Go back to queue
            if (this.state.isAppointment) {
                this.props.navigation.navigate("Appointment")
            } else {
                this.props.navigation.navigate("Queue")
            }

        } else {
            Alert.alert("Rate Customer Fail", "Fail to rate customer, please try again.\n")
        }

        this.setState({
            isLoading: false
        })

    }

    compileFeedbackSelected = () => {
        // Get the selected feedback
        var feedbackSelected = this.state.feedbackSelected
        var tagArray = []

        // Loop the key value pair in the Object
        Object.keys(feedbackSelected).forEach(function (key) {

            // If the value of tag is true
            if (feedbackSelected[key]) {
                // Add the tag into the tagArray
                tagArray.push(key)
            }
        });

        tagString = tagArray.toString()

        return tagString
    }

    saveRateCustomer = async (tagString) => {

        var combinedComment = tagString + ";/*" + this.state.comments;

        // Combine the tag with the comment

        // Collect the data for insert
        let datas = {
            txn_cd: 'MEDORDER028',
            tstamp: getTodayDate(),
            data: {
                order_no: this.state.order_no,
                feedback_by: this.state.tenant_id,
                feedback_to: this.state.user_id,
                tenant_type: this.state.tenant_type,
                rating: this.state.rating,
                comments: combinedComment,
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
                console.log("Feedback Inserted.")
                return true;

            } else {
                console.log("Insert Feedback Error: " + json.status)
                Alert.alert("Insert Feedback Error", "Fail to insert feedback, please try again.\n" + json.status)

                return false
            };
        } catch (error) {
            console.log("Insert Feedback Error: " + error)
            Alert.alert("Insert Feedback Error", "Fail to insert feedback, please try again.\n" + error)

            // handleNoInternet()
            return false
        }
    }

    render() {
        if (this.state.isLoading) {
            return (
                    <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
                <View style={[styles.modalBackground, { height: 300 }]}>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>How was your chat with the customer?</Text>
                        <AirbnbRating
                            defaultRating={0}
                            showRating={false}
                            size={30}
                            onFinishRating={(rating) => this.setState({ rating })}
                        />

                        <View style={[styles.feedbackModalView]}>
                            {
                                Object.keys(this.state.feedbackSelected).map((key, index) => {
                                    return (
                                        <TouchableOpacity key={index} style={[styles.feedbackModalBtn,
                                        { backgroundColor: this.state.feedbackSelected[key] ? '#FFD44E' : '#FFFFFF' }]}
                                            onPress={() => {
                                                let feedback = this.state.feedbackSelected;
                                                feedback[key] = !this.state.feedbackSelected[key]
                                                this.setState({
                                                    feedbackSelected: feedback
                                                })
                                            }}
                                        >
                                            <Text style={[styles.feedBackModalText]}>{key}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }

                        </View>

                        <TextInput style={{ borderBottomWidth: 1, margin: 10, fontWeight: '600', fontSize: 12, lineHeight: 16 }}
                            maxLength={100}
                            value={this.state.comments}
                            onChangeText={(comments) => {
                                this.setState({
                                    comments: comments,
                                    commentRemainingLength: 100 - comments.length
                                });
                            }}
                            placeholder={'Comment'}
                        />

                        <Text style={{ textAlign: 'right', marginHorizontal: 10, fontWeight: '600', fontSize: 9, lineHeight: 12 }}>
                            {this.state.commentRemainingLength}
                        </Text>

                    </View>


                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={this.rateCustomer}
                        >
                            <Text style={[styles.modalText, { color: '#FFFFFF' }]}>Rate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AndroidBackHandler>

        )
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        marginTop: 'auto',
        marginBottom: 'auto',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        width: '80%',
        height: '40%',
        alignSelf: 'center'
    },

    modalTitle: {
        fontWeight: '600', fontSize: 14,
        lineHeight: 19,
        color: '#000000',
        textAlign: 'center',
        margin: 10
    },

    modalText: {
        fontWeight: '600',
        fontSize: 18,
        lineHeight: 25,
        textAlign: 'center',
        color: '#000000'
    },

    modalBtn: {
        flex: 1,
        alignItems: 'center',
        height: 44,
        justifyContent: 'center',
        backgroundColor: '#FFD54E',
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18
    },

    modalBtnText: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19
    },

    feedbackModalView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        marginHorizontal: 20
    },

    feedbackModalBtn: {
        borderRadius: 20,
        margin: 5,
        borderWidth: 1,
        height: 23,
        justifyContent: 'center'
    },

    feedBackModalText: {
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 14,
        color: '#000000',
        textAlign: 'center',
        marginHorizontal: 5,
    }
})
