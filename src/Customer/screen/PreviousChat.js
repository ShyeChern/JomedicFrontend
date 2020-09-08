import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList, SafeAreaView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { getCustomerId } from "../util/Auth";
import { format } from "date-fns";
import RNFetchBlob from 'rn-fetch-blob';
import { URL } from '../util/FetchURL';

PreviousChatData = ({ orderNo, doctorName, specialty, doctorImage, date, that }) => {
    return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', paddingVertical: 15 }}
                onPress={() => that.props.navigation.navigate('PreviousChatDetail', {
                    DoctorName: doctorName,
                    DoctorSpecialist: specialty,
                    OrderNo: orderNo,
                    DoctorImage: doctorImage,
                    OrderDate:date
                })}
            >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image
                        source={{
                            uri: 'data:image/jpg;base64,' + doctorImage,
                        }}
                        style={{ width: 50, height: 50, borderRadius: 50 / 2, borderWidth: .5, borderColor: '#000000', marginLeft: 15 }}
                    />
                </View>

                <View style={{ flex: 3, justifyContent: 'space-around' }}>
                    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold' }}>{orderNo}</Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{doctorName}</Text>
                    <Text style={{ fontSize: 10, lineHeight: 20, fontWeight: '600' }}>{specialty}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'space-around' }}>
                    <Text style={{ fontSize: 14, lineHeight: 16, fontWeight: '600' }}>{date}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export default class PreviousChat extends Component {
    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
            previousChat: [],
            flatListLoading: true,
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

        let bodyData = {
            transactionCode: 'PREVIOUSCHAT',
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
                    let previousChat = [];
                    responseJson.data.forEach(function (element, index) {
                        if (element.picture !== null) {
                            let unitArray = new Uint8Array(element.picture.data);

                            const stringChar = unitArray.reduce((data, byte) => {
                                return data + String.fromCharCode(byte);
                            }, '');

                            element.picture = RNFetchBlob.base64.encode(stringChar);
                        }

                        let previousChatObject = {
                            orderNo: element.order_no,
                            doctorName: element.name,
                            specialty: element.specialty_cd,
                            date: format(new Date(element.txn_date), "d/MM/yyyy "),
                            doctorImage: element.picture,
                        };

                        previousChat.push(previousChatObject);


                    });

                    this.setState({
                        previousChat: previousChat,
                        flatListLoading: false
                    })

                }
                else {
                    alert(responseJson.value);
                }
            })
            .catch((error) => {
                alert(error);
            });
    }

    render() {
        return (
            <View style={styles.container}>
                <SafeAreaView style={{ flex: 1 }}>
                    <FlatList
                        data={this.state.previousChat}
                        refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                        renderItem={({ item }) =>
                            <PreviousChatData orderNo={item.orderNo} doctorName={item.doctorName} specialty={item.specialty}
                                doctorImage={item.doctorImage} date={item.date} that={this} />}
                        keyExtractor={item => item.orderNo}
                        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#000000' }}></View>}
                        ListEmptyComponent={() => {
                            return (
                                <Text style={{ textAlign: 'center', fontStyle: 'italic', marginTop: 10 }}>No chat have been made in your account</Text>
                            )
                        }}
                        ListFooterComponent={() => this.state.flatListLoading ? <View /> : <View style={{ height: 1, backgroundColor: '#000000' }}></View>}
                    />
                </SafeAreaView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC'
    },
})
