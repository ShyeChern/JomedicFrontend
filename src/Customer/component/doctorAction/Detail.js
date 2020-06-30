import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default class Detail extends Component {
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={[styles.text, styles.textLabel]}>Graduate From</Text>
                        <Text style={[styles.text, styles.textDescription]}>{this.props.graduateFrom}</Text>
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={[styles.text, styles.textLabel]}>Place of Training</Text>
                        <Text style={[styles.text, styles.textDescription]}>{this.props.practicePlace}</Text>
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={[styles.text, styles.textLabel]}>Preferred Language</Text>
                        <Text style={[styles.text, styles.textDescription]}>{this.props.preferredLanguage}</Text>
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={[styles.text, styles.textLabel]}>Experience</Text>
                        <Text style={[styles.text, styles.textDescription]}>{this.props.experience}</Text>
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <Text style={[styles.text, styles.textLabel]}>Work Location</Text>
                        <TouchableOpacity onPress={() => Linking.openURL(this.props.address)}>
                            <View style={{ flexDirection: 'row', alignItems:'center' }}>
                                <Text style={[styles.text, styles.textDescription]}>{this.props.workLocation}</Text>
                                <FeatherIcon style={{ marginLeft: 10 }} name='navigation' size={14} color='#000000' />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.bottomActionBtnBar]}>
                    <View style={[styles.bottomActionBtnView]}>
                        <TouchableOpacity style={[styles.bottomActionBtn]}
                            onPress={() => this.props.doctorActionChange('LiveChatInfo')}
                        >
                            <MaterialIcons name='chat' size={30} color='#FFFFFF' />
                        </TouchableOpacity>
                        <Text style={[styles.bottomBtnText]}>Live Chat</Text>
                    </View>

                    <View style={[styles.bottomActionBtnView]}>
                        <TouchableOpacity style={[styles.bottomActionBtn]}
                            onPress={() => this.props.doctorActionChange('VideoConsultation')}
                        >
                            <MaterialIcons name='video-call' size={30} color='#FFFFFF' />
                        </TouchableOpacity>
                        <Text style={[styles.bottomBtnText]}>Video Consultation</Text>
                    </View>

                    <View style={[styles.bottomActionBtnView]}>
                        <TouchableOpacity style={[styles.bottomActionBtn]}
                            onPress={() => this.props.doctorActionChange('AppointmentTime')}
                        >
                            <FontAwesome name='calendar' size={30} color='#FFFFFF' />
                        </TouchableOpacity>
                        <Text style={[styles.bottomBtnText]}>Appointment</Text>
                    </View>
                </View>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    text: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19
    },
    bottomActionBtnBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10
    },
    bottomActionBtnView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomActionBtn: {
        width: 51,
        height: 51,
        backgroundColor: '#FBB03B',
        borderRadius: 51 / 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomBtnText: {
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 14,
        color: '#000000'
    },
    text: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19
    },
    textLabel: {
        marginLeft: 40,
        marginVertical: 5,
        color: '#000000'
    },
    textDescription: {
        marginLeft: 50,
        color: '#595959'
    }
})
