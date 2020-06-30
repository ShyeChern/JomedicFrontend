import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { Divider } from 'react-native-elements'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { URL_Provider, URL_AuditTrail } from '../util/provider'
import Loader from '../screen/Loader'

export default class RespiratoryRate extends Component {
    constructor(props){
        super(props)
        this.state={
            order_no: '',
            user_id: '',
            tenant_id: '',
            episode_date: '',
            encounter_date: '',
            id_number: '',

            rate: '',   // decimal(3,0)
        }
    }

    componentDidMount(){
        this.initializeData();
    }

    initializeData = () => {
        var params = this.props.route.params;
    
        this.setState({
          order_no: params.order_no,
          user_id: params.user_id,
          tenant_id: params.tenant_id,
          episode_date: params.episode_date,
          encounter_date: params.encounter_date,
          id_number: params.id_number,
        })
      }
    
      render() {
        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <Text style={styles.title}>Respiratory Rate</Text>
                <Divider style={styles.divider} />
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.dataDisplayArea}>
                        <TextInput
                            style={styles.textInputField}
                            value={this.state.rate}
                            onChangeText={(value) => this.setState({ rate: value })}
                            keyboardType={"numeric"}
                            placeholder={"Respiratory Rate"}
                            maxLength={3}
                        />
                        <Text style={styles.unitLabelFont}>breaths / min</Text>
                    </View>
                </ScrollView>

                {/* Button View Area */}
                <View>
                    <TouchableOpacity
                        style={styles.saveButton}
                    >
                        <Text style={{ fontSize: 20, color: 'white', alignSelf: 'center', textAlign: "center" }}>Save</Text>
                    </TouchableOpacity>
                </View>

            </View >
        )
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginHorizontal: '8%',
        marginVertical: 10,
    },

    divider: {
        marginHorizontal: '8%',
        backgroundColor: '#000000'
    },

    textInputField: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#000000',
        fontSize: 14,
        width: '65%'
    },

    unitLabelFont: {
        fontSize: 14,
        color: '#000000',
        alignSelf: "center",
        fontWeight: 'bold'
    },

    scrollViewStyle: {
        backgroundColor: 'white',
    },

    dataDisplayArea: {
        marginHorizontal: '8%',
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between"
    },

    saveButton: {
        paddingHorizontal: '28%',
        paddingVertical: 15,
        backgroundColor: '#fdaa26',
        borderRadius: 50,
        marginHorizontal: '8%',
        marginVertical: 20,
    },
})
