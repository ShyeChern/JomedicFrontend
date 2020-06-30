import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native'
import moment from 'moment'

const ChatInfoData = {
    date: '29 January 2020',
    complaint: 'Headache and runny nose',
    diagnosis: 'High Fever',
    vitalSign: 'Vital Sign',
    medication: 'Paracetamol'
}

export default class CallInfoDetail extends Component {

    constructor(props) {
        super(props)
        this.state = {
            // Data from previous screen
            name: '',
            picture: '',
            order_no: '',
            user_id: '',
            tenant_id: '',
            tenant_type: '',
            txn_date: '',

            // Data needed in this screen
            complaint: '',
            diagnosis: '',
            vitalSign: '',
            medication: ''
        }
    }

    componentDidMount() {
        this.initializeData()
        this.getChatInfoData()
    }

    initializeData = () => {
        var params = this.props.route.params

        this.setState({
            name: params.name,
            picture: params.picture,
            order_no: params.order_no,
            user_id: params.user_id,
            tenant_id: params.tenant_id,
            tenant_type: params.tenant_type,
            txn_date: params.txn_date
        })
    }

    getChatInfoData = () => {
        this.setState({
            chatDetails: ChatInfoData,
        })
    }

    render() {
        return (
            <ScrollView style={styles.scrollViewStyle}>
                <View style={styles.dataDisplayArea}>
                    <Text style={styles.detailHeaderFont}>Date</Text>
                    <Text style={styles.detailDataFont}>    {moment(this.state.txn_date).format("DD MMMM YYYY")}</Text>

                    <Text style={styles.detailHeaderFont}>Complaint</Text>
                    <Text style={styles.detailDataFont}>    {this.state.complaint}</Text>

                    <Text style={styles.detailHeaderFont}>Diagnosis</Text>
                    <Text style={styles.detailDataFont}>    {this.state.diagnosis}</Text>

                    <Text style={styles.detailHeaderFont}>Vital Sign</Text>
                    <Text style={styles.detailDataFont}>    {this.state.vitalSign}</Text>

                    <Text style={styles.detailHeaderFont}>Suggested Medication</Text>
                    <Text style={styles.detailDataFont}>    {this.state.medication}</Text>
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
        marginBottom: 5,
    },

    scrollViewStyle: {
        backgroundColor: 'white',
    },

    dataDisplayArea: {
        marginLeft: '13%',
        marginRight: '8%',
        marginTop: 45,
    },

})
