import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, RefreshControl, SafeAreaView, SectionList } from 'react-native';
import { URL } from '../util/FetchURL';
import { getCustomerId } from "../util/Auth";
import { format, parseISO } from "date-fns";

HistoryItem = ({ orderNo, service, dateTime, that }) => {
    return (
        <View style={styles.HistoryItem}>
            <TouchableOpacity style={styles.historyBtn}
                onPress={() => that.historyDetail(orderNo)}
            >
                <Text style={{ fontSize: 16, lineHeight: 22, color: '#4A4A4A', fontWeight: 'bold' }}>Order No: {orderNo}</Text>

                <View style={{ marginTop: 10, alignItems: 'center' }}>
                    <Text style={styles.text}>Date/Time: {dateTime}</Text>
                    <Text style={styles.text}>Service: {service}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export default class History extends Component {

    constructor(props) {
        super(props)

        this.state = {
            historyList: [],
            customerId: '',
            flatListLoading: true,
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

        let bodyData = {
            transactionCode: 'HISTORY',
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
                    let history = [];
                    let lastSectionName = '';
                    let sectionData = [];
                    let dataMaxIndex = responseJson.data.length - 1;

                    responseJson.data.forEach(function (element, index) {
                        let date = parseISO(element.txn_date);
                        let sectionName = format(date, "MMM yyyy");
                        let sectionDataObject = {
                            orderNo: element.order_no,
                            service: element.service_name,
                            dateTime: format(date, "d/MM/yy HH:mm"),
                        }

                        if (lastSectionName === '') {
                            lastSectionName = sectionName;
                        }
                        else if (lastSectionName !== sectionName) {
                            history.push({ section: lastSectionName, data: sectionData });
                            sectionData = [];
                            lastSectionName = sectionName;
                        }

                        sectionData.push(sectionDataObject);

                        if (index === dataMaxIndex) {
                            history.push({ section: sectionName, data: sectionData });
                        }

                    });

                    this.setState({
                        historyList: history,
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

    historyDetail = (orderNo) => {

        let bodyData = {
            transactionCode: 'HISTORYDETAIL',
            timestamp: new Date(),
            data: {
                OrderNo: orderNo,
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
                    this.props.navigation.navigate('ConsultationReceipt', {
                        orderNo: responseJson.data[0].order_no,
                        service: responseJson.data[0].service_name,
                        consultationFee: responseJson.data[0].amount,
                        totalFee: responseJson.data[0].amount,
                        doctorName: responseJson.data[0].tenant_name,
                        dateTime: responseJson.data[0].txn_date,
                        chatDuration: responseJson.data[0].item_desc,
                        feedbackModal: false,
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
                <View style={{}}></View>
                <SafeAreaView style={{ flex: 1 }}>
                    <SectionList
                        sections={this.state.historyList}
                        refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                        renderItem={({ item }) =>
                            <HistoryItem orderNo={item.orderNo} service={item.service} dateTime={item.dateTime} that={this} />}
                        keyExtractor={item => item.orderNo}
                        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#000000' }}></View>}
                        renderSectionHeader={({ section: { section } }) => (
                            <View style={styles.sectionHeader}><Text style={styles.sectionHeaderText}>{section.toUpperCase()}</Text></View>
                        )}
                    />
                </SafeAreaView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    sectionHeader: {
        flex: 1,
        backgroundColor: '#ECECEC'
    },
    sectionHeaderText: {
        fontSize: 14,
        lineHeight: 19,
        marginLeft: 20,
        marginVertical: 4,
    },
    HistoryItem: {
        backgroundColor: '#FCFCFC',
        flexDirection: 'row',
        flex: 1,
    },
    historyBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    text: {
        fontSize: 12,
        lineHeight: 16,
        color: '#4A4A4A'
    }
})
