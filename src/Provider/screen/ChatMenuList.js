import React, { Component } from 'react'
import { Text, StyleSheet, View, FlatList, RefreshControl, BackHandler, Alert } from 'react-native'
import { ListItem, Avatar } from 'react-native-elements'
import { handleNoInternet } from '../util/CheckConn'
import { getTodayDate } from '../util/getDate'
import { URL_AuditTrail, URL_Provider } from '../util/provider'
import { getTenantId, getTenantType, getUserId } from '../util/Auth'
import defaultAvatar from '../img/defaultAvatar.png'

const EMPTY_CUSTOMER_PROFILE_DATA = {
    user_id: "",
    name: "",
    DOB: "",
    mobile_no: "",
    email: "",
    nationality_cd: "",
    home_address1: "",
    home_address2: "",
    home_address3: "",
    district: "",
    state: "",
    country: '',
    picture: "",
}

export default class PatientChatList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            patientList: [],
            onRefresh: false,
            user_id: '',
            tenant_id: '',
            tenant_type: '',
        }
    }

    async componentDidMount() {
        await getUserId().then(response => {
            this.setState({ user_id: response });
        });

        await getTenantType().then(response => {
            this.setState({ tenant_type: response });
        });

        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });

        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        this.loadChatListData()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        if (this.props.navigation.isFocused()) {
            return true;
        }
    }

    loadChatListData = async () => {
        let tenant_id = this.state.tenant_id
        // let tenant_id = this.props.route.params.tenant_id

        let datas = {
            txn_cd: "MEDORDER010",
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
                console.log('Get Chats Data Error');
                console.log(json.status);
                Alert.alert('Get Chats Data Error', 'Fail to get chats data, please try again.\n' + json.status);

                return json.status
            }
            else {
                let data = json.status

                console.log("Data obtained!")

                this.setState({
                    patientList: data,
                    onRefresh: false
                })

            }
        }
        catch (error) {
            console.log('Get Chats Data Error');
            console.log(error)
            this.setState({
                onRefresh: false
            })
            Alert.alert('Get Chats Data Error', 'Fail to get chats data, please try again.\n' + error);
        }
    }

    refreshChatList = (refresh) => {
        this.setState({
            onRefresh: refresh
        })
        this.loadChatListData()
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <ListItem
            title={item.name}
            subtitle={item.district + ", " + item.state}
            leftAvatar={<Avatar
                rounded
                size='large'
                source={{ uri: item.picture }}
            />
            }
            bottomDivider
            onPress={() => this.props.navigation.navigate('Person', {
                user_id: item.user_id,
                name: item.name,
                DOB: item.DOB,
                mobile_no: item.mobile_no,
                email: item.email,
                nationality_cd: item.nationality_cd,
                home_address1: item.home_address1,
                home_address2: item.home_address2,
                home_address3: item.home_address3,
                district: item.district,
                state: item.state,
                country: item.country,
                picture: item.picture,
                tenant_id: this.state.tenantId,
                tenant_type: this.state.tenantType
            }
            )} />
    )

    render() {
        return (
            <View>
                {/* Flatlist View */}
                <View>
                    <FlatList
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.onRefresh}
                                onRefresh={() => this.refreshChatList(true)}
                            />}
                        keyExtractor={this.keyExtractor}
                        data={this.state.patientList}
                        renderItem={this.renderItem}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    Header: {
        alignItems: 'center',
        backgroundColor: 'yellow',
        paddingTop: 10,
        paddingBottom: 10,
    },

    CenterFlatList: {

    },
})
