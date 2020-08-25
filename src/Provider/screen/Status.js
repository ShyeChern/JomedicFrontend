import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native'

import { getTenantId, getTenantType, getUserId } from '../util/Auth'
import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import Loader from './Loader'


export default class Status extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,

            user_id: '',
            tenant_id: '',
            tenant_type: '',
            status: '',

            // Radio Button Initalization, 0: Available, 1: Busy, 2: 'Not Available', 3: 'Offline'
            radioBtnsData: ['Available', 'Busy', 'Not Available', 'Offline'],
            checked: 0,

        }
    }

    async componentDidMount() {
        await this.initalizeData();
        await this.getTenantData();
    }

    initalizeData = async () => {
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

    // Functions to set status
    setTenantState = async (key, data) => {

        if (key === 0) {
            await this.setAvailable();
        } else if (key === 1) {
            await this.setBusy();
        } else if (key === 2) {
            await this.setNotAvailable();
        } else if (key === 3) {
            await this.setOffline();
        } else {
            return Alert('Invalid status')
        }

        this.setState({ checked: key, status: data })
    }

    setAvailable = async () => {
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

            if (json.status == 'success' || json.status == "SUCCESS") {
                console.log("Tenant Status Updated to Available.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                console.log("Tenant Status Update Available Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Tenant Status Update Available Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false
        }

    }

    getTenantData = async () => {
        this.setState({
            isLoading: true
        })

        let datas = {
            txn_cd: "MEDORDER011",
            tstamp: getTodayDate(),
            data: {
                user_id: this.state.user_id,
                tenant_type: this.state.tenant_type,
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

            var status = "";
            var checked = 0;

            if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                console.log('Get Tenant Status Error');
                console.log(json.status);
            }
            else {
                let data = json.status[0]
                status = data.status

                // Determine which raduio button to select with the status
                if (status) {
                    if (status === "Available") {
                        checked = 0;
                    } else if (status === "Busy") {
                        checked = 1;
                    } else if (status === "Not Available") {
                        checked = 2;
                    } else if (status === "Offline") {
                        checked = 3;
                    } else {
                        // Check default value as available
                        checked = 0;
                    }
                } else {
                    checked = 0;
                }

                console.log("Get Tenant Status succcess")
            }

            this.setState({
                status: status,
                checked: checked,
                isLoading: false
            })
        }
        catch (error) {
            console.log("Get Tenant Status Error")
            this.setState({
                isLoading: false
            })
            handleNoInternet()
            return false
        }


    }

    setNotAvailable = async () => {
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

            if (json.status == 'success' || json.status == "SUCCESS") {
                console.log("Tenant Status Updated to Not Available.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                console.log("Tenant Status Update Not Available Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Tenant Status Update Not Available Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false
        }

    }

    setBusy = async () => {
        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER026',
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

            if (json.status == 'success' || json.status == "SUCCESS") {
                console.log("Tenant Status Updated to Busy.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                console.log("Tenant Status Update Busy Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Tenant Status Update Busy Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
            return false
        }
    }

    setOffline = async () => {
        // Get the tenant id
        let datas = {
            txn_cd: 'MEDORDER027',
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

            if (json.status == 'success' || json.status == "SUCCESS") {
                console.log("Tenant Status Updated to Offline.")
                this.setState({
                    isLoading: false
                })
                return true;
            } else {
                console.log("Tenant Status Update Offline Error: " + error)
                this.setState({
                    isLoading: false
                });
                return false
            };
        } catch (error) {
            console.log("Tenant Status Update Offline Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
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
            <View style={{ backgroundColor: '#E5E5E5', flex: 1 }}>
                <View style={{ backgroundColor: '#E5E5E5' }}>
                    <View style={styles.radioContainer}>
                        {
                            this.state.radioBtnsData.map((data, key) => {
                                return (
                                    <View key={key} style={styles.itemStyle}>
                                        {this.state.checked == key ?
                                            <TouchableOpacity style={styles.radioButton}>
                                                <Image style={styles.radioImage} source={require("../img/radio_selected.png")} />
                                                <Text style={styles.radioLabel}>{data}</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => this.setTenantState(key, data)} style={styles.radioButton}>
                                                <Image style={styles.radioImage} source={require("../img/radio_unselected.png")} />
                                                <Text style={styles.radioLabel}>{data}</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>)
                            })
                        }
                    </View>

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    itemStyle: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(151, 151, 151, 0.248047)',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        justifyContent: "space-between",
        flexDirection: 'row',
    },

    radioContainer: {
        marginTop: 10,
        marginBottom: 20,
    },

    radioImage: {
        height: 20,
        width: 20,
        marginRight: 3,
        alignSelf: "center"
    },

    radioButton: {
        flexDirection: 'row',
        marginRight: 20,
        marginLeft: 20,
        width: '95%',
    },

    radioLabel: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 14,
        lineHeight: 19,
        color: '#4A4A4A',
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center'
    },

    radioLabel2: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        color: '#4A4A4A',
    },

})