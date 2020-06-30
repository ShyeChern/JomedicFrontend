import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { Avatar } from 'react-native-elements'

import { getTenantId, getTenantType, getUserId, logout } from '../util/Auth'
import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import Loader from './Loader'
import defaultAvatar from '../img/defaultAvatar.png'

export default class AccountSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            name: '',
            avatar: defaultAvatar,
            profileData: {},
            user_id: '',
            tenant_id: '',
            tenant_type: '',
        }
    }

    async componentDidMount() {
        // Load the data for the first time
        await this.initializeData();
        this.loadProfileData();

        // Add hook to refresh profile data when screen is Focus, and if reload is true
        this.props.navigation.addListener('focus',
            event => {
                this.loadProfileData();
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

    loadProfileData = async () => {
        this.setState({ isLoading: true })

        let user_id = this.state.user_id;

        // Get User Profile and its data
        let datas = {
            txn_cd: 'MEDORDER020',
            tstamp: getTodayDate(),
            data: {
                user_id: user_id,
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
                console.log('Get User Profile Error');
                console.log(json.status);
            }
            else {
                let data = json.status[0]
                this.setState({
                    name: data.name,
                    avatar: { uri: data.picture },
                    profileData: data,
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log(error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }
    }

    logOutProcess = async () => {

        // Set Tenant Status to Offline
        let tenant_id = this.state.tenant_id;

        // Get User Profile and its data
        let datas = {
            txn_cd: 'MEDORDER027',
            tstamp: getTodayDate(),
            data: {
                tenant_id: tenant_id,
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

            if (json.status === 'success' || json.status == "SUCCESS") {
                // Return to Account Settings
                console.log(json.status)

                await logout().then(response => {
                    this.props.navigation.navigate('WelcomePage');
                });

            } else {
                console.log('Logout Error');
                console.log(json.status);
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log(error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
        }
    }

    render() {
        // View Loading if it is loading
        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }

        return (
            <View style={{ backgroundColor: '#E5E5E5', flex: 1 }}>
                <View style={styles.headerContainer}>
                    <Avatar rounded
                        size={70}
                        source={this.state.avatar} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.nameText}>{this.state.name}</Text>
                        <TouchableOpacity style={styles.editProfileButton}
                            onPress={() => this.props.navigation.navigate('EditProfile', {
                                profileData: this.state.profileData,
                            })}>
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ backgroundColor: '#E5E5E5' }}>
                    <TouchableOpacity style={[styles.itemStyle, { borderTopWidth: 1, }]}
                        onPress={() => this.props.navigation.navigate("ClinicSchedule", {
                            page: 1
                        })}>
                        <Text style={styles.itemText}>Clinic Schedule</Text>
                        <Image style={styles.iconStyle} source={require("../img/Left_Chevron.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemStyle}
                        onPress={() => this.props.navigation.navigate("ServiceCharges")}>
                        <Text style={styles.itemText}>Service Charges</Text>
                        <Image style={styles.iconStyle} source={require("../img/Left_Chevron.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemStyle}
                        onPress={() => this.props.navigation.navigate("CustomerReview")}
                    >
                        <Text style={styles.itemText}>Customer Review</Text>
                        <Image style={styles.iconStyle} source={require("../img/Left_Chevron.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemStyle}
                        onPress={() => this.props.navigation.navigate("E-Wallet")}
                    >
                        <Text style={styles.itemText}>E-Wallet</Text>
                        <Image style={styles.iconStyle} source={require("../img/Left_Chevron.png")} />
                    </TouchableOpacity>


                    <View style={styles.titleStyle}>
                        <Text style={styles.titleText}>Help</Text>
                    </View>
                    <TouchableOpacity style={styles.itemStyle}
                        // onPress={() => this.props.navigation.navigate("ContactUs")}
                    >
                        <Text style={styles.itemText}>Contact Us</Text>
                        <Image style={styles.iconStyle} source={require("../img/Left_Chevron.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemStyle}
                        onPress={() => this.props.navigation.navigate("FAQ")}
                    >
                        <Text style={styles.itemText}>FAQ</Text>
                        <Image style={styles.iconStyle} source={require("../img/Left_Chevron.png")} />
                    </TouchableOpacity>
                    <View style={styles.titleStyle}>
                        <Text Text style={styles.titleText}>Logins</Text>
                    </View>
                    <TouchableOpacity style={styles.itemStyle}
                        onPress={() => this.props.navigation.navigate("ChangePassword")}
                    >
                        <Text style={styles.itemText}>Change Password</Text>
                        <Image style={styles.iconStyle} source={require("../img/Left_Chevron.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemStyle}
                        onPress={() => this.logOutProcess()}>
                        <Text style={styles.itemText}>Logout</Text>
                        <Image style={styles.iconStyle} source={require("../img/logout.png")} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E5E5',
        paddingLeft: '9%',
        paddingTop: '15%',
        paddingBottom: 30,
    },

    headerTextContainer: {
        height: 70,
        alignSelf: 'center',
        marginLeft: 15,
        marginTop: 20,
    },

    avatarStyle: {
    },

    editProfileButton: {
        marginTop: 10,
    },

    editProfileText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 12,
        lineHeight: 16,
        color: '#0019F5',
    },

    nameText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 20,
        color: '#000000',
    },

    titleStyle: {
        paddingTop: 30,
        backgroundColor: '#E5E5E5',
    },

    titleText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        color: '#4A4A4A',
        marginLeft: 15,
    },

    itemStyle: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(151, 151, 151, 0.248047)',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        justifyContent: "space-between",
        flexDirection: 'row',
    },

    itemText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 14,
        lineHeight: 19,
        color: '#4A4A4A',
        marginLeft: 50,
        marginTop: 10,
        marginBottom: 10,
    },

    iconStyle: {
        alignSelf: 'center',
        marginRight: 30,
    },
})
