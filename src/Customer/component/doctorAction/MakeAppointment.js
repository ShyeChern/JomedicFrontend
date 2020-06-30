import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { format, parse, compareAsc } from 'date-fns';

// Time = ({ id, time, that }) => {

//     let selected = false;
//     if (that.state.selectedTimeId === id) {
//         selected = true;
//     }
//     return (
//         <View>
//             <TouchableOpacity style={[styles.timeListItem, { borderColor: selected ? '#FDAA26' : '#000000' }]}
//                 onPress={() => {
//                     that.setState({
//                         time: time,
//                         selectedTimeId: id
//                     });
//                 }}
//             >
//                 <Text style={[styles.text, { marginVertical: 10, marginHorizontal: 15, color: selected ? '#FDAA26' : '#000000' }]}>{time}</Text>
//             </TouchableOpacity>
//         </View>

//     );

// }

export default class MakeAppointment extends Component {
    constructor(props) {
        super(props)

        this.state = {
            date: new Date(),
            startTime: new Date(),
            endTime: new Date(),
            time: new Date(),
            acceptTC: false,
            showDatePicker: false,
            showTimePicker: false,
        }
    }

    componentDidMount() {
        // console.log(this.props.selectedAppointment);
        // console.log(parse(this.props.selectedAppointment.startDate, 'dd / MM / yyyy', new Date()));
        // console.log(parse(this.props.selectedAppointment.startTime, 'HH:mm', new Date()));
        // console.log(parse(this.props.selectedAppointment.endTime, 'HH:mm', new Date()));

        this.setState({
            date: parse(this.props.selectedAppointment.startDate, 'dd / MM / yyyy', new Date()),
            startTime: parse(this.props.selectedAppointment.startTime, 'HH:mm', new Date()),
            endTime: parse(this.props.selectedAppointment.endTime, 'HH:mm', new Date()),
            time: parse(this.props.selectedAppointment.startTime, 'HH:mm', new Date()),
        })
    }

    datePicker = () => {
        if (this.state.showDatePicker) {
            let date = new Date().getDate();
            let month = new Date().getMonth();
            let year = new Date().getFullYear();
            return (
                <DateTimePicker
                    value={this.state.date}
                    mode={'date'}
                    minimumDate={this.state.date}
                    maximumDate={this.state.date}
                    display='spinner'
                    onChange={(event, date) => {
                        if (event.type === 'set') {
                            this.setState({ date: date });
                        }
                        this.setState({ showDatePicker: false })
                    }}
                />
            )
        }
    }

    timePicker = () => {

        if (this.state.showTimePicker) {
            return (
                <DateTimePicker
                    value={this.state.time}
                    minimumDate={this.state.startTime}
                    maximumDate={this.state.endTime}
                    mode={'time'}
                    is24Hour={true}
                    display='spinner'
                    onChange={(event, date) => {
                        if (event.type === 'set') {
                            if (compareAsc(date, this.state.startTime) >= 0 && compareAsc(date, this.state.endTime) <= 0) {
                                this.setState({ time: date });
                            }
                            else {
                                alert('Doctor is only available from ' + format(this.state.startTime,'HH:mm') + ' to ' + format(this.state.endTime,'HH:mm'));
                            }

                        }
                        this.setState({ showTimePicker: false })
                    }}
                />
            )
        }

    }

    makeAppointment = () => {
        if (this.state.acceptTC === false) {
            this.setState({
                warning: '*Please tick to accept the term & condition to continue'
            });
        }
        else if(compareAsc(this.state.time, this.state.startTime) == -1 && compareAsc(this.state.time, this.state.endTime) == 1){
            this.setState({
                warning: 'Doctor is only available from ' + format(this.state.startTime,'HH:mm') + ' to ' + format(this.state.endTime,'HH:mm')
            })
        }
        else {
            this.setState({
                warning: ''
            })
            let appointment = { date: this.state.date, time: this.state.time }
            this.props.requestMakeAppointment(appointment);
        }

    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ marginLeft: 10, marginTop: 5 }}
                    onPress={() => this.props.doctorActionChange('AppointmentTime')}>
                    <AntDesign name='arrowleft' size={30} color='#4A4A4A' />
                </TouchableOpacity>

                <Text style={[styles.text, { color: 'red', marginBottom: 5, textAlign: 'center' }]}>{this.state.warning}</Text>

                <View style={{ flex: 5, justifyContent: 'space-around' }}>

                    <View style={{ marginLeft: 45 }}>
                        <Text style={[styles.text]}>Selected Date</Text>
                        <View style={[styles.dateTimeView]}>
                            <View style={{ justifyContent: 'center' }}>
                                <AntDesign name='calendar' size={35} color='#000000' />
                            </View>

                            <TouchableOpacity style={[styles.pickerStyle]}
                                onPress={() => this.setState({ showDatePicker: true })}
                                disabled={true}
                            >
                                <Text style={[styles.text, { color: '#4A4A4A' }]}>
                                    {format(this.state.date, 'dd / MM / yyyy')}
                                </Text>
                            </TouchableOpacity>

                            {/* {this.datePicker()} */}
                        </View>
                    </View>

                    <View style={{ marginLeft: 45 }}>
                        <Text style={[styles.text]}>Select Time</Text>
                        <View style={[styles.dateTimeView]}>
                            <View style={{ justifyContent: 'center' }}>
                                <AntDesign name='clockcircleo' size={35} color='#000000' />
                            </View>

                            <TouchableOpacity style={[styles.pickerStyle]}
                                onPress={() => this.setState({ showTimePicker: true })}>
                                <Text style={[styles.text, { color: '#4A4A4A' }]}>
                                    {format(this.state.time, 'HH : mm')}
                                </Text>
                            </TouchableOpacity>

                            {this.timePicker()}

                        </View>
                    </View>

                    <View>
                        <View style={[styles.tcCheckBoxView]}>
                            <CheckBox value={this.state.acceptTC}
                                onValueChange={() => this.setState({ acceptTC: !this.state.acceptTC })}
                                tintColors={{ true: '#FFD44E', false: '#808080' }}
                            />
                            {/* Modal View TC */}
                            <Text style={[styles.text]}>I accept terms & conditions</Text>
                        </View>

                        <View style={[styles.appointmentBtnView]}>
                            <TouchableOpacity style={[styles.btn]}
                                onPress={() => this.makeAppointment()}>
                                <Text style={[styles.btnText]}>Make Appointment</Text>
                            </TouchableOpacity>
                        </View>
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
    tcCheckBoxView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    btn: {
        backgroundColor: '#FFD44E',
        borderRadius: 50,
        width: '70%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 10
    },
    btnText: {
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
        color: '#FEFEFE'
    },
    dateTimeView: {
        flexDirection: 'row',
        marginVertical: 15,
    },
    appointmentBtnView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5
    },
    pickerStyle: {
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '60 %',
        marginHorizontal: 20,
        height: 40,
    }
    // timeListItem: {
    //     borderWidth: 1,
    //     borderRadius: 5,
    //     borderColor: '#434343',
    //     marginHorizontal: 10,
    //     marginVertical: 5,
    // }
})
