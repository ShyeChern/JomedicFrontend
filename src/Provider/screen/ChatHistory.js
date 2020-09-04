import React, { Component } from 'react'
import { Text, StyleSheet, View, FlatList, Button, Alert } from 'react-native'
import { ListItem } from 'react-native-elements'
import moment from 'moment'

import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { getTenantId, getTenantType, getUserId } from '../util/Auth'

const list = [
    {
        name: 'High Fever',
        subtitle: 'Thank you Dr for the chat...',
        date: '1/29/2020',
    },
    {
        name: 'Headache',
        subtitle: 'Thank you Dr for the chat...',
        date: '1/20/2020',
    },

]


export default class ChatHistory extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            onRefresh: false,
            chatHistoryList: [],
            finalMessages: [],

            user_id: '',
            tenant_id: '',
            tenant_type: '',
            order_no: '',
            name: '',
            picture: '',
        }
    }

    async componentDidMount() {
        await this.initializeData()
        this.getChatHistory()
    }

    initializeData = async () => {
        await getTenantType().then(response => {
            this.setState({ tenant_type: response });
        });

        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });

        var params = this.props.route.params

        this.setState({
            user_id: params.user_id,
            name: params.name,
            picture: params.picture,
        })
    }

    getChatHistory = async () => {
        // Get the User id of patient and Tenant id
        var user_id = this.props.route.params.user_id
        var tenant_id = this.state.tenant_id

        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER034',
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
                console.log('Get Chat History Error');
                console.log(json.status);
                Alert.alert('Get Chat History Error','Fail to get chat history, please try again.' + json.status)
            }
            else {
                var data = json.status

                this.setState({
                    chatHistoryList: data
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Chat History Error: " + error)
            Alert.alert('Get Chat History Error','Fail to get chat history, please try again.' + error)

            this.setState({
                isLoading: false
            });
        }
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <ListItem
            title={item.order_no}
            subtitle={item.message}
            rightTitle={moment(item.txn_date).format("DD/MM/YYYY")}
            bottomDivider
            // onPress={() => this.props.navigation.navigate('ChatInfo', {
            //     user_id: this.state.user_id,
            //     tenant_id: this.state.tenant_id,
            //     tenant_type: this.state.tenant_type,
            //     name: this.state.name,
            //     picture: this.state.picture,
            //     order_no: item.order_no,
            //     txn_date: item.txn_date
            // })}
            onPress={() => this.props.navigation.navigate('LiveChat', {
                isReadOnly: true,
                name: this.state.name,
                picture: this.state.picture,
                order_no: item.order_no,
                user_id: this.state.user_id,
                tenant_id: this.state.tenant_id,
                tenant_type: this.state.tenant_type
            })}
        />
    )

    render() {
        return (
            <View>
                <View>
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        data={this.state.chatHistoryList}
                        renderItem={this.renderItem}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({})
