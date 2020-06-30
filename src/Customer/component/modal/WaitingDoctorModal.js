import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native'

export default class WaitingDoctorModal extends Component {
    render() {
        return (
            <View style={[styles.modalBackground]}>

                <Text style={[styles.modalText, { flex: 1, marginHorizontal: 20, marginTop: 20 }]}>
                    Thank you for your patience. The doctor will call once available
                        </Text>

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={[styles.modalBtn, {
                        backgroundColor: '#FFD44E', borderBottomLeftRadius: 15, borderBottomRightRadius: 15
                    }]}
                        onPress={() => this.props.submitWaitingDoctorModal()} >
                        <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Close</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        width: '80%',
        height: '40%',
        alignSelf: 'center'
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
        justifyContent: 'center'
    },
    modalBtnText: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19
    },
})
