import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Image, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { URL } from '../util/FetchURL';
import { getCustomerId } from "../util/Auth";
import RNFetchBlob from 'rn-fetch-blob';

Chat = ({ orderNo, doctorId, doctorName, doctorImage, specialist, that }) => {
    return (
        <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1 }}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', paddingVertical: 15 }}
                onPress={() => that.props.navigation.navigate('LiveChat', {
                    DoctorId: doctorId,
                    DoctorName: doctorName,
                    DoctorSpecialist: specialist,
                    OrderNo: orderNo,
                    DoctorImage: doctorImage,
                })}
            >
                <View style={{ flex: 1 }}>
                    <Image
                        source={{
                            uri: 'data:image/jpg;base64,' + doctorImage,
                        }}
                        style={{ width: 48, height: 48, borderRadius: 48 / 2, borderWidth: .5, borderColor: '#000000', marginLeft: 15 }}
                    />
                </View>

                <View style={{ flex: 3, justifyContent: 'space-around' }}>
                    <Text style={{ fontSize: 14, lineHeight: 16, fontWeight: '600' }}>{doctorName}</Text>
                    <Text style={{ fontSize: 10, lineHeight: 16, fontWeight: '600' }}>{specialist}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export default class CurrentChat extends Component {
    constructor(props) {
        super(props)

        this.state = {
            chatList: [],
            customerId: '',
            flatListLoading: true,
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

        let bodyData = {
            transactionCode: 'CURRENTCHAT',
            timestamp: new Date(),
            data: {
                CustomerId: this.state.customerId
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

                    let chat = [];

                    responseJson.data.forEach(element => {

                        let chatObject = {
                            orderNo: element.order_no,
                            doctorId: element.tenant_id,
                            doctorName: element.tenant_name,
                            specialist: element.specialty_cd,
                        }

                        if (element.picture !== null) {
                            let unitArray = new Uint8Array(element.picture.data);

                            const stringChar = unitArray.reduce((data, byte) => {
                                return data + String.fromCharCode(byte);
                            }, '');

                            chatObject.doctorImage = RNFetchBlob.base64.encode(stringChar);
                        }

                        chat.push(chatObject)
                    });

                    this.setState({
                        chatList: chat,
                        flatListLoading: false
                    });

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
                        data={this.state.chatList}
                        refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                        renderItem={({ item }) =>
                            <Chat orderNo={item.orderNo} doctorId={item.doctorId} doctorName={item.doctorName} specialist={item.specialist}
                                doctorImage={item.doctorImage} that={this} />}
                        keyExtractor={item => item.orderNo}
                        ListEmptyComponent={() => {
                            return (
                            <Text style={{ textAlign: 'center', fontStyle: 'italic', marginTop: 10 }}>No active chat right now.{'\n'}Request chat service from doctor to start a chat.</Text>)
                        }}
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
