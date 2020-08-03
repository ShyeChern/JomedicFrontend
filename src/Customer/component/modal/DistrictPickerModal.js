import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, SafeAreaView, FlatList, ScrollView } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

export default class DistrictPickerModal extends Component {

    render() {

        return (
            <View style={[styles.modalView]}>
                <View style={[styles.modalBox]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => this.props.backStateModal()}>
                            <FontAwesomeIcon style={[styles.modalTitle, { fontSize: 18 }]} name='arrow-left' size={22} color='#FDAA26' />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle]}>Select District</Text>
                        <TouchableOpacity onPress={() => this.props.closeModal()}>
                            <FontAwesomeIcon style={[styles.modalTitle, { fontSize: 22 }]} name='close' size={22} color='#FDAA26' />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.modalTitle, { marginVertical: 0, color: '#000000', textAlign: 'center' }]}>{this.props.state}</Text>

                    <ScrollView style={{ flex: 1 }}>

                        {
                            this.props.district.map((item, index) => {
                                return (
                                    <View>
                                        <TouchableOpacity style={[styles.modalItem]}
                                            onPress={() => this.props.filterDistrict(item)}>
                                            <Text style={[styles.modalItemText]}>{item}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })

                        }
                    </ScrollView>

                </View>
            </View >
        )
    }
}

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30
    },
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: '80%',
        flex: 1
    },
    modalTitle: {
        color: '#FDAA26',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 25,
        marginVertical: 12,
        marginHorizontal: 15,
    },
    modalItem: {
        marginVertical: 11,
        marginHorizontal: 22
    },
    modalItemText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 19
    },
})
