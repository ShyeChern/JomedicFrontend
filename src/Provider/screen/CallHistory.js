import React, { Component } from 'react'
import { Text, StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native'
import { ListItem, Avatar, Divider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment'

import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { getTenantId, getTenantType, getUserId } from '../util/Auth'

const list = [
    {
        name: 'Flu',
        subtitle: 'December 22, 14.30 PM',
    },
    {
        name: 'Stomach ache',
        subtitle: 'November 8, 10.00 AM',
    },

]


export default class CallHistory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            onRefresh: false,
            callHistoryList: [],

            user_id: '',
            tenant_id: '',
        }
    }

    async componentDidMount(){
        await this.initializeData();
        this.getCallHistory();
    }

    initializeData = async () => {    
        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });
    
        var params = this.props.route.params

        this.setState({
            user_id: params.user_id,
        })
    }

    getCallHistory = async () => {
        // Get the User id of patient and Tenant id
        var user_id = this.props.route.params.user_id
        var tenant_id = this.state.tenant_id

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER031',
            tstamp: getTodayDate(),
            data: {
                user_id: user_id,
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
                console.log('Get Call History Error');
                console.log(json.status);
                Alert.alert("Get Call History Error", 'Fail to get call history, please try again.\n' + json.status)
            }
            else {
                var data = json.status
                this.setState({
                    callHistoryList: data
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Call History Error: " + error)
            Alert.alert("Get Call History Error", 'Fail to get call history, please try again.\n' + error)
            this.setState({
                isLoading: false
            });
        }
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <ListItem
            title={item.order_no}
            subtitle={moment(item.txn_date).format("MMMM DD, hh.mm A")}   // November 8, 10.00 AM
            // rightIcon={() => <Icon name={'phone'} size={30} color={'black'} />}
            // // onPress={() => this.props.navigation.navigate('CallInfo', {
            // //     user_id: this.state.user_id,
            // //     tenant_id: this.state.tenant_id,
            // //     tenant_type: this.state.tenant_type,
            // //     name: this.state.name,
            // //     picture: this.state.picture,
            // //     order_no: item.order_no,
            // //     txn_date: item.txn_date
            // // })}

            bottomDivider
        />
    )

    render() {
        return (
            <View>
                {/* Flatlist View */}
                <View>
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        data={this.state.callHistoryList}
                        renderItem={this.renderItem}            
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    // For the Pop Up
    avatarIcon: {
        alignItems: 'center'
    },
    
    popUpContainer: {
        backgroundColor: 'white',
        paddingTop: 22,
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        height: '40%',
        width: '80%',
        alignSelf: 'center',
    },

    popUpContentContainer: {
        flex: 1,
    },

    popUpTitle: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 14,
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

    buttonDecline: {
        flex: 1,
        alignItems: "center",
        padding: 15,
        borderBottomLeftRadius: 15,
    },

    buttonAccept: {
        backgroundColor: '#FFD54E',
        flex: 1,
        alignItems: "center",
        padding: 15,
        borderBottomRightRadius: 15,
    },

})
