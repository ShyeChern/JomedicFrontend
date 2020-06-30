import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView } from 'react-native'
import { BaseRouter } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import moment from 'moment'

import { getTenantId, getTenantType, getUserId } from '../util/Auth'

const tempData = {
    dob: '29 January 1990',
    age: 30,
    phoneNo: '012-284849299',
    email: 'ikram@hotmail.com',
    nationality: 'Malaysian',
    address: 'Lot 123, Kg Albion, 42000 Selangor'
}

export default class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            profileData: {},
            age: '',
            tenant_id: '',
            tenant_type: '',
        }
    }

    async componentDidMount() {
        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });

        this.getProfileData();
    }


    getProfileData = () => {
        var params = this.props.route.params

        // Calculate the age 
        var age = moment().diff(params.DOB, 'year')

        // Set the state using Patient Profile from Previous Screen
        this.setState({
            profileData: {
                user_id: params.user_id,
                name: params.name,
                DOB: params.DOB,
                mobile_no: params.mobile_no,
                email: params.email,
                nationality_cd: params.nationality_cd,
                home_address1: params.home_address1,
                home_address2: params.home_address2,
                home_address3: params.home_address3,
                district: params.district,
                state: params.state,
                country: params.country,
                picture: params.picture,
            },
            age: age
        })

    }

    

    render() {
        return (
            <ScrollView style={styles.scrollViewStyle}>
                <View style={styles.dataDisplayArea}>
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailHeaderFont}>Date of Birth</Text>
                        <Text style={styles.detailDataFont}>{moment(this.state.profileData.DOB).format("DD MMMM YYYY")}</Text>
                    </View>

                    <View style={styles.detailContainer}>
                        <Text style={styles.detailHeaderFont}>Age</Text>
                        <Text style={styles.detailDataFont}>{this.state.age}</Text>
                    </View>

                    <View style={styles.detailContainer}>
                        <Text style={styles.detailHeaderFont}>Phone Number</Text>
                        <Text style={styles.detailDataFont}>{this.state.profileData.mobile_no}</Text>
                    </View>

                    <View style={styles.detailContainer}>
                        <Text style={styles.detailHeaderFont}>Email</Text>
                        <Text style={styles.detailDataFont}>{this.state.profileData.email}</Text>
                    </View>

                    <View style={styles.detailContainer}>
                        <Text style={styles.detailHeaderFont}>Nationality</Text>
                        <Text style={styles.detailDataFont}>{this.state.profileData.nationality_cd}</Text>
                    </View>

                    <View style={styles.detailContainer}>
                        <Text style={styles.detailHeaderFont}>Address</Text>
                        <Text style={styles.detailDataFont}>{this.state.profileData.home_address1 + " " + this.state.profileData.home_address2 + " " + this.state.profileData.home_address3}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.navigate("Map", {
                                    address: this.state.profileData.home_address1 + " " + this.state.profileData.home_address2 + " " + this.state.profileData.home_address3
                                });
                            }}
                        >
                            <Text style={styles.viewLocationText}>View Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    detailHeaderFont: {
        fontSize: 20,
        // fontWeight: 'bold',
        color: '#000000',
    },

    detailDataFont: {
        fontSize: 18,
        color: '#595959',
        marginLeft: 15,
    },

    scrollViewStyle: {
        backgroundColor: 'white',
    },

    dataDisplayArea: {
        marginLeft: '13%',
        marginRight: '8%',
        marginTop: 30,
    },

    detailContainer: {
        marginBottom: 5,
    },

    viewLocationText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        alignItems: 'center',
        color: '#6EB1E2',
        marginLeft: 15,
    },

})
