import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

Specialty = ({ specialty, that }) => {
    return (
        <View>
            <TouchableOpacity style={[styles.modalItem]}
                onPress={() => that.props.filterSpecialty(specialty)}>
                <Text style={[styles.modalItemText]}>{specialty}</Text>
            </TouchableOpacity>
        </View>
    );
}

export default class SpecialtyPickerModal extends Component {

    render() {
        return (
            <View style={[styles.modalView]}>
                <View style={[styles.modalBox]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.modalTitle]}>Select Specialty Field</Text>
                        <TouchableOpacity onPress={() => this.props.closeModal()}>
                            <FontAwesomeIcon style={[styles.modalTitle, { fontSize: 22 }]} name='close' size={22} color='#FDAA26' />
                        </TouchableOpacity>
                    </View>

                    <SafeAreaView style={{ flex: 1 }}>
                        <FlatList
                            data={this.props.allSpecialty}
                            renderItem={({ item }) => <Specialty specialty={item} that={this} />}
                            keyExtractor={item => item}
                        />
                    </SafeAreaView>
                </View>
            </View>
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
        marginHorizontal: 22,
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
