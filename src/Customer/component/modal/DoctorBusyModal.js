import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';

export default class DoctorBusyModal extends Component {

    render() {
        return (
            <View style={[styles.modalBackground]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.modalText, { flex: 1, marginHorizontal: 20, marginTop: 20 }]}>
                        Sorry, your doctor is consulting another patient.
                        Would you like to wait for your turn or try again later?
                            </Text>

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 15 }]}
                            onPress={() => this.props.submitDoctorBusyModal(false)} >
                            <Text style={[styles.modalBtnText, { color: '#4A4A4A' }]}>Later</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#FFD44E', borderBottomRightRadius: 15 }]}
                            onPress={() => this.props.submitDoctorBusyModal(true)}
                        >
                            <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Wait</Text>
                        </TouchableOpacity>
                    </View>
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
