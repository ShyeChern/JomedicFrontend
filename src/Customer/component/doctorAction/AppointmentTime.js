import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { format, add } from 'date-fns';
import AntDesign from 'react-native-vector-icons/AntDesign';

const TimeData = [
    {
        id: '1',
        status: 'available',
        startTime: '11:00',
        endTime: '12:00',
        quota: 0,
    },
    {
        id: '2',
        status: 'not available',
        startTime: '',
        endTime: '',
        quota: 0,
    },
    {
        id: '3',
        status: 'available',
        startTime: '11:00',
        endTime: '12:00',
        quota: 2,
    },
    {
        id: '4',
        status: 'available',
        startTime: '11:00',
        endTime: '12:00',
        quota: 0,
    },
    {
        id: '5',
        status: 'not available',
        startTime: null,
        endTime: null,
        quota: 3,
    },
    {
        id: '6',
        status: 'available',
        startTime: '11:00',
        endTime: '12:00',
        quota: 3,
    },
    {
        id: '7',
        status: 'available',
        startTime: '11:00',
        endTime: '12:00',
        quota: 0,
    },

];

Time = ({ id, week, startDate, status, startTime, endTime, quota, that }) => {
    return (
        <TouchableOpacity style={{ flexDirection: 'row', flex: 1, borderBottomWidth: 1, borderColor: '#DBDBDB', padding: 4 }}
            onPress={() => that.props.requestChooseAppointmentTime(id)}
            disabled={status === 'not available' ? true : false}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text style={[styles.text, { textAlign: 'right' }]}>{week}</Text>
                <Text style={[styles.text, { textAlign: 'right' }]}>{startDate}</Text>
            </View>

            <View style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                {
                    status === 'not available' ?
                        <Text style={[styles.text]}>Not Available</Text>
                        :
                        <Text style={[styles.text, { color: '#6EB1E2' }]}>{startTime} - {endTime}</Text>
                }
            </View>

            <View style={{ flex: 0.8, justifyContent: 'center', }}>
                {
                    status === 'not available' ?
                        <View />
                        :
                        quota === 0 ?
                            <View style={[styles.infoColor, { backgroundColor: '#E56353' }]}></View>
                            :
                            <View style={[styles.infoColor, { backgroundColor: '#4BD948' }]}></View>
                }

            </View>
            <AntDesign style={{ position: 'absolute', right: 15, bottom: 15 }} name='doubleright' size={15} color={status === 'not available' ? '#A7A7A700' : '#A7A7A7'} />


        </TouchableOpacity >
    );

}

export default class AppointmentTime extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>

                <View style={{ flex: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 5, left: 10 }}
                            onPress={() => this.props.doctorActionChange('detail')}>
                            <AntDesign name='arrowleft' size={30} color='#4A4A4A' />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 16, lineHeight: 22, textAlign: 'center', margin: 5, marginTop: 30 }}>Choose Video Consultation Appointment Time</Text>

                    </View>

                    <SafeAreaView style={{ flex: 1 }}>
                        <FlatList
                            // data={TimeData}
                            data={this.props.appointmentTimeList}
                            renderItem={({ item, index }) =>
                                <Time id={item.id} week={item.week} startDate={item.startDate} status={item.status} startTime={item.startTime}
                                    endTime={item.endTime} quota={item.quota} that={this} />
                            }
                            ListEmptyComponent={() => {
                                return (<Text style={{ textAlign: 'center', justifyContent: 'center', marginTop: 30, fontStyle: 'italic' }}>Currently there are no booking available for this doctor</Text>)
                            }}
                            keyExtractor={item => item.id}
                        />
                    </SafeAreaView>
                </View>

                <View style={{ flex: 1 }}>
                    {/* <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <TouchableOpacity style={[styles.btn, { borderColor: '#FDAA26', borderWidth: 1 }]} onPress={() => this.props.doctorActionChange('detail')}>
                            <Text style={{ color: '#FDAA26' }}>Previous</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#FFD54E' }]} onPress={() => this.props.doctorActionChange('MakeAppointment')}>
                            <Text style={{ color: '#FFFFFF' }}>Next</Text>
                        </TouchableOpacity>
                    </View> */}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
                        <View style={[styles.infoView]}>
                            <View style={[styles.infoColor, { backgroundColor: '#4BD948' }]}></View>
                            <Text style={[styles.infoText]}>Available</Text>
                        </View>

                        <View style={[styles.infoView]}>
                            <View style={[styles.infoColor, { backgroundColor: '#E56353' }]}></View>
                            <Text style={[styles.infoText]}>Fully Booked</Text>
                        </View>
                    </View>
                </View>




            </View>
        )
    }
}

const styles = StyleSheet.create({
    btn: {
        width: '30%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    },
    btnText: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600'
    },
    infoView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoColor: {
        width: 26,
        height: 26,
        borderRadius: 5
    },
    infoText: {
        fontSize: 12,
        lineHeight: 16,
        marginLeft: 8
    },
    text: {
        fontSize: 14,
        lineHeight: 19,
    }
})
