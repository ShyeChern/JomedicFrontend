import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, RefreshControl, SectionList, SafeAreaView } from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
// import { Agenda } from 'react-native-calendars';
import { format, add, sub, isWithinInterval } from 'date-fns';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';

// export default class Appointment extends Component {

//     constructor(props) {
//         super(props)

//         this.state = {
//             customerId: '',
//             appointmentList: [],
//             isRefreshing: true,
//             items: {},
//             minDate: format(new Date(), 'yyyy-MM-dd'),
//             maxDate: format(add(new Date(), { days: 60 }), 'yyyy-MM-dd'),
//         }
//     }

//     async componentDidMount() {
//         await getCustomerId().then(response => {
//             this.setState({ customerId: response });
//         });

//         this.getAppointmentData();
//     }

//     getAppointmentData = () => {
//         this.interval = setInterval(() => {
//             if (this.props.navigation.isFocused()) {
//                 let bodyData = {
//                     transactionCode: 'APPOINTMENT',
//                     timestamp: new Date(),
//                     data: {
//                         CustomerId: this.state.customerId,
//                     }
//                 };

//                 fetch(URL, {
//                     method: 'POST',
//                     headers: {
//                         Accept: 'application/json',
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(bodyData),
//                 }).then((response) => response.json())
//                     .then((responseJson) => {

//                         if (responseJson.result === true) {

//                             this.setState({
//                                 appointmentList: responseJson.data,
//                                 isRefreshing: false
//                             });

//                             this.loadItems();
//                         }

//                     })
//                     .catch((error) => {
//                         alert(error);
//                     });
//             }
//         }, 3000);

//     }

//     componentWillUnmount = () => {
//         clearInterval(this.interval);
//     }


//     loadItems(day) {

//         let newList = {};
//         for (let i = 0; i < 61; i++) {
//             const time = new Date(this.state.minDate).getTime() + i * 24 * 60 * 60 * 1000;
//             const date = new Date(time).toISOString().split('T')[0];

//             if (!newList[date]) {
//                 newList[date] = [];
//             }
//         }


//         this.state.appointmentList.forEach(function (item, index) {
//             item.appointment.forEach(function (item, index) {
//                 newList[item.date].push({
//                     appointment: item,
//                     doctorId: item.doctorId,
//                     date: item.date,
//                     orderNo: item.orderNo,
//                     doctorName: item.doctorName,
//                     startTime: item.startTime,
//                     address: item.address,
//                     latitude: item.latitude,
//                     longtitude: item.longtitude,
//                     doctorName: item.doctorName,
//                     startTime: item.startTime
//                 })
//             })
//         })

//         this.setState({
//             items: newList
//         });
//     }

//     render() {
//         return (
//             <View style={styles.container}>
//                 <Agenda
//                     items={this.state.items}
//                     loadItemsForMonth={this.loadItems.bind(this)}
//                     selected={this.state.minDate}
//                     minDate={this.state.minDate}
//                     maxDate={this.state.maxDate}
//                     futureScrollRange={2}
//                     renderKnob={() => { return (<View ><Text style={{ fontStyle: 'italic', color: '#4A4A4A', paddingVertical: 3 }}>View Calendar</Text></View>); }}
//                     renderItem={(item) => {
//                         return (
//                             <TouchableOpacity style={styles.item}
//                                 onPress={() => this.props.navigation.navigate('AppointmentDetail', {
//                                     customerId: this.state.customerId,
//                                     doctorId: item.doctorId,
//                                     date: item.date,
//                                     orderNo: item.orderNo,
//                                     doctorName: item.doctorName,
//                                     startTime: item.startTime,
//                                     address: item.address,
//                                     latitude: item.latitude,
//                                     longtitude: item.longtitude
//                                 })}>
//                                 <Text>Doctor Name: {item.doctorName}</Text>
//                                 <Text>Time: {item.startTime}</Text>
//                             </TouchableOpacity>
//                         );
//                     }}
//                     renderEmptyDate={() => {
//                         return (
//                             <View style={styles.emptyDate}>
//                                 <Text>No appointments booked</Text>
//                             </View>
//                         );
//                     }}
//                     rowHasChanged={(r1, r2) => { return r1.name !== r2.name; }}
//                     theme={{
//                         selectedDayBackgroundColor: '#FFD54E',
//                         selectedDotColor: '#FFFFFF',
//                         todayTextColor: '#FFD54E',
//                         dotColor: '#FDAA26',
//                         agendaTodayColor: '#FFD54E',
//                         agendaKnobColor: '#FFD54E',
//                     }}
//                     refreshControl={<RefreshControl refreshing={this.state.isRefreshing} />}
//                 />
//             </View>

//         )
//     }
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     item: {
//         backgroundColor: '#FFFFFF',
//         flex: 1,
//         borderRadius: 5,
//         padding: 10,
//         marginRight: 10,
//         marginTop: 17,
//         height: 60,
//         justifyContent: 'center'
//     },
//     emptyDate: {
//         height: 15,
//         flex: 1,
//         paddingTop: 30,
//         justifyContent: 'center',
//     }
// })

AppointmentItem = ({ appointment, that }) => {

    return (
        <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
            {
                appointment === 'No appointment booked' ?
                    <View style={{ margin: 10, padding: 10, backgroundColor: '#F8F8F8' }}>
                        <Text>No appointment booked</Text>
                    </View>
                    :
                    <TouchableOpacity style={{ margin: 10, padding: 10, backgroundColor: '#F8F8F8' }}
                        onPress={() => that.props.navigation.navigate('AppointmentDetail', {
                            customerId: that.state.customerId,
                            doctorId: appointment.doctorId,
                            date: appointment.date,
                            orderNo: appointment.orderNo,
                            doctorName: appointment.doctorName,
                            startTime: appointment.startTime,
                            address: appointment.address,
                            latitude: appointment.latitude,
                            longtitude: appointment.longtitude
                        })}>
                        <Text>Doctor Name: {appointment.doctorName}</Text>
                        <Text>Time: {appointment.startTime}</Text>
                    </TouchableOpacity>

            }

        </View>
    );
}

export default class Appointment extends Component {

    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
            appointmentList: [{
                date: '',
                data: []
            }],
            appointmentInBatch: [],
            flatListLoading: true,
            selectedDate: new Date(),
            dateShown: new Date(),
            showDatePicker: false,
            currentBatchIndex: 0,
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });
        let appointment = [];
        // 7 days = 1 batch
        let appointmentInBatch = [];
        let currentDate = new Date();
        for (let i = 0; i < 56; i++) {
            let appointmentListItem = {};
            appointmentListItem.date = format(add(currentDate, { days: i }), 'MMM dd (E)');
            appointmentListItem.data = ['No appointment booked'];
            appointment.push(appointmentListItem);
            if ((i + 1) % 7 == 0) {
                appointmentInBatch.push(appointment);
                appointment = [];
            }
        }
        this.setState({
            appointmentList: appointmentInBatch[this.state.currentBatchIndex],
            appointmentInBatch: appointmentInBatch
        })
        this.getAppointmentData();
    }

    getAppointmentData = () => {
        this.interval = setInterval(() => {
            if (this.props.navigation.isFocused() && !this.state.showDatePicker) {
                let bodyData = {
                    transactionCode: 'APPOINTMENT',
                    timestamp: new Date(),
                    data: {
                        CustomerId: this.state.customerId,
                    }
                };

                fetch(URL, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bodyData),
                }).then((response) => response.json())
                    .then((responseJson) => {

                        if (responseJson.result === true) {
                            let appointment = [];
                            // 7 days = 1 batch
                            let appointmentInBatch = [];
                            let currentDate = new Date();
                            for (let i = 0; i < 56; i++) {
                                let appointmentListItem = {};
                                appointmentListItem.date = format(add(currentDate, { days: i }), 'MMM dd (E)');
                                appointmentListItem.data = ['No appointment booked'];
                                appointment.push(appointmentListItem);
                                if ((i + 1) % 7 == 0) {
                                    appointmentInBatch.push(appointment);
                                    appointment = [];
                                }
                            }

                            responseJson.data.forEach(element => {
                                element.date = format(new Date(element.date), "MMM dd (E)");
                                let index = this.getIndexAppointment(appointmentInBatch, element.date);
                                appointmentInBatch[index.batchIndex][index.dateIndex].data = element.appointment;
                            });

                            this.setState({
                                appointmentList: appointmentInBatch[this.state.currentBatchIndex],
                                appointmentInBatch: appointmentInBatch,
                                flatListLoading: false,
                            })
                        }

                    })
                    .catch((error) => {
                        alert(error);
                    });
            }
        }, 3000);
    }

    componentWillUnmount = () => {
        clearInterval(this.interval);
    }

    getIndexAppointment = (array, date) => {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < 7; j++) {
                if (array[i][j].date === date) {
                    return { batchIndex: i, dateIndex: j };
                }
            }
        }
    }

    datePicker = () => {
        if (this.state.showDatePicker) {
            return (
                <DateTimePicker
                    value={this.state.selectedDate}
                    mode={'date'}
                    minimumDate={new Date()}
                    maximumDate={add(new Date(), { days: 55 })}
                    display='default'
                    onChange={(event, date) => {
                        if (event.type === 'set') {
                            this.setState({ showDatePicker: false });
                            this.updateSelectedDate(date);
                        }
                        else {
                            this.setState({ showDatePicker: false });
                        }

                    }}
                />
            )
        }
    }

    updateSelectedDate = (date) => {
        let todayDate = new Date();
        let batchMaxDate = add(todayDate, { days: 6 });
        for (let i = 0; i < 8; i++) {
            // start -> make the time 00:00:00 to avoid comparing time
            if (isWithinInterval(date, { start: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()), end: batchMaxDate })) {
                //pass batch index
                this.updateAppointmentBatch(i);
                break;
            }
            todayDate = add(todayDate, { days: 7 });
            batchMaxDate = add(batchMaxDate, { days: 7 });
        }

        this.setState({ selectedDate: date, dateShown: todayDate });
    }

    updateAppointmentBatch = (i) => {

        this.setState({
            currentBatchIndex: i,
            appointmentList: this.state.appointmentInBatch[i]
        });
    }

    render() {
        return (
            <View style={[styles.container]}>

                <View style={{ flex: 1 }}>
                    <SafeAreaView style={styles.container}>
                        <SectionList
                            sections={this.state.appointmentList}
                            refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                            keyExtractor={(item, index) => item + index}
                            renderItem={({ item }) => <AppointmentItem appointment={item} that={this} />}
                            renderSectionHeader={({ section: { date } }) => (
                                <View style={{ backgroundColor: '#ECECEC' }}>
                                    <Text style={{ fontSize: 14, lineHeight: 19, marginHorizontal: 10 }}>{date}</Text>
                                </View>
                            )}
                            ListHeaderComponent={() => {
                                return (
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', margin: 5 }}>
                                        <TouchableOpacity onPress={() => {
                                            this.updateAppointmentBatch(this.state.currentBatchIndex - 1);
                                            this.setState({
                                                dateShown: sub(this.state.dateShown, { days: 7 }),
                                                selectedDate: sub(this.state.selectedDate, { days: 7 }),
                                            });
                                        }}
                                            disabled={this.state.currentBatchIndex == 0 ? true : false}>
                                            <AntDesignIcon name="caretleft" size={25} color={this.state.currentBatchIndex == 0 ? "#EFEFEF" : "#FDAA26"} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.setState({ showDatePicker: true })}>
                                            <Text>{format(this.state.dateShown, "dd MMM")} - {format(add(this.state.dateShown, { days: 6 }), "dd MMM")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            this.updateAppointmentBatch(this.state.currentBatchIndex + 1);
                                            this.setState({
                                                dateShown: add(this.state.dateShown, { days: 7 }),
                                                selectedDate: add(this.state.selectedDate, { days: 7 })
                                            });
                                        }}
                                            disabled={this.state.currentBatchIndex == 7 ? true : false}
                                        >
                                            <AntDesignIcon name="caretright" size={25} color={this.state.currentBatchIndex == 7 ? "#EFEFEF" : "#FDAA26"} />
                                        </TouchableOpacity>
                                    </View>
                                )

                            }}
                        />
                        {this.datePicker()}
                    </SafeAreaView>
                </View>

            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    title: {
        marginVertical: 5,
        flexDirection: 'row'
    },
    textTitle: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 16,
        color: '#FDAA26'
    }
})

