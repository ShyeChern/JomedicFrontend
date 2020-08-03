import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { Divider } from 'react-native-elements';
import Modal from "react-native-modal";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import { format } from 'date-fns';
import FeedbackModal from '../component/modal/FeedbackModal';
import { getCustomerId } from "../util/Auth";
import { URL } from '../util/FetchURL';
import { requestWritePdfPermission } from '../util/permission/Permission';
import { logo } from '../util/Base64Logo';



export default class ConsultationReceipt extends Component {

    constructor(props) {
        super(props)
        this.state = {
            customerId: '',
            doctorId: this.props.route.params.doctorId,
            doctorName:this.props.route.params.doctorName,
            consultationFee: this.props.route.params.consultationFee,
            referenceId: this.props.route.params.orderNo,
            chatDuration: this.props.route.params.chatDuration,
            service: this.props.route.params.service,
            dateTime: this.props.route.params.dateTime,
            total: this.props.route.params.totalFee,
            feedbackModal: this.props.route.params.feedbackModal,

        }
    }

    async componentDidMount() {
        await getCustomerId()
            .then(response => this.setState({ customerId: response }))
            .catch(error => alert(error));

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    handleBackPress = () => {
        this.props.navigation.navigate('Jomedic');
    }

    submitFeedbackModal = (feedback) => {

        let bodyData = {
            transactionCode: 'RATE',
            timestamp: new Date(),
            data: {
                CustomerId: this.state.customerId,
                DoctorId: this.state.doctorId,
                OrderNo: this.state.referenceId,
                Rating: feedback.rating,
                Comment: feedback.comment,
                Feedback: feedback.feedbackSelected,
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
                    this.setState({
                        feedbackModal: false
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

    checkPermission = async () => {
        if (Platform.OS === 'android') {
            await requestWritePdfPermission().then(response => {
                if (response === 'granted') {
                    this.createPDF();
                }
                else {
                    alert('Please enable permission to save the receipt');
                }
            });
        }
    }

    createPDF = async () => {

        let html = '<center><img src=' + logo + ' ><h1>Jomedic Consultation Receipt</h1><hr/></center>' +
            '<div style="width:70%; margin:auto;">' +
            '<p style="font-size:20px;"><b>Reference Id:</b> ' + this.state.referenceId + '</p>' +
            '<p style="font-size:20px;"><b>Date:</b> ' + this.state.dateTime + '</p>' +
            '<p style="font-size:20px;"><b>Consult by:</b> ' + this.state.doctorName + '</p>' +
            '<p style="font-size:20px;"><b>Service:</b> ' + this.state.service + '</p>' +
            '<table border="1" align="center" style="margin-top: 50px;">' +
            '<tr><td style="padding: 10px;"><p style="font-size:20px;">Consultation Fee: </p></td><td style="padding: 10px;"><p style="font-size:20px;">RM ' + (this.state.consultationFee).toFixed(2) + '</p></td></tr>' +
            '<tr><td style="text-align: right;padding: 10px;"><p style="font-size:20px;"><b>Total: </b></p></td><td style="padding: 10px;"><p style="font-size:20px;">RM ' + (this.state.total).toFixed(2) + '</p></td></tr>' +
            '</table>' +
            '</div>';

        let options = {
            html: html,
            fileName: this.state.referenceId,
            directory: 'Download',
        };

        let file = await RNHTMLtoPDF.convert(options);
        alert('Your Receipt is Saved in Download as ' + this.state.referenceId);

    }

    chatDuration = () => {
        if (this.state.service === 'JOMEDIC-VIDEO') {
            return (
                <View style={[styles.receiptDetailText]}>
                    <Text style={[styles.infoText]}>CHAT DURATION</Text>
                    <Text style={[styles.detailText]}>{Math.floor(this.state.chatDuration / 1000 / 60)} min(s)</Text>
                </View>
            )

        }
    }

    render() {
        this.props.navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity style={{ marginLeft: 10 }}
                    onPress={() => this.props.navigation.navigate('Jomedic')}
                >
                    <IconAntDesign name='close' size={30} color='#4A4A4A' />
                </TouchableOpacity>
            ),
        });

        return (
            <View style={[styles.container]}>
                <Modal isVisible={this.state.feedbackModal}>
                    <FeedbackModal submitFeedbackModal={this.submitFeedbackModal} />
                </Modal>

                <View style={[styles.receiptImageView]}>
                    <Image style={[styles.receiptImage]}
                        source={require('../asset/img/logo.png')} />
                    <Text style={{ fontWeight: '600', fontSize: 18, lineHeight: 25 }}>Consultation Receipt</Text>
                </View>
                <View style={[styles.receiptView]}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.infoText]}>CONSULTATION FEE</Text>
                        <Text style={{ fontWeight: '600', fontSize: 24, lineHeight: 33 }}>RM {(this.state.total).toFixed(2)}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.infoText]}>REFERENCE ID</Text>
                        <Text style={[styles.detailText, { lineHeight: 33 }]}>{this.state.referenceId}</Text>
                    </View>
                </View>

                <Divider style={{ backgroundColor: '#595959', height: 1, marginVertical: 15 }} />

                <View style={{ flex: 7 }}>
                    <View style={[styles.receiptDetailTextView]}>

                        <View style={[styles.receiptDetailText]}>
                            <Text style={[styles.infoText]}>DOCTOR</Text>
                            <Text style={[styles.detailText]}>{this.state.doctorName}</Text>
                        </View>

                        <View style={[styles.receiptDetailText]}>
                            <Text style={[styles.infoText]}>SERVICE</Text>
                            <Text style={[styles.detailText]}>{this.state.service}</Text>
                        </View>
                        <View style={[styles.receiptDetailText]}>
                            <Text style={[styles.infoText]}>DATE/TIME</Text>
                            <Text style={[styles.detailText]}>{this.state.dateTime}</Text>
                        </View>

                        {this.chatDuration()}

                    </View>
                    <View style={{ flex: 2, marginHorizontal: 50 }}>
                        <Text style={[styles.infoText, { alignSelf: 'center' }]}>FEE BREAKDOWN</Text>
                        <View style={[styles.feeBreakdownTextView]}>
                            <View>
                                <Text style={[styles.infoText, { color: '#1F1F1F' }]}>Base Fee</Text>
                            </View>
                            <View>
                                <Text style={[styles.infoText, { color: '#1F1F1F' }]}>RM {(this.state.consultationFee).toFixed(2)}</Text>
                            </View>
                        </View>
                        <Divider style={{ backgroundColor: 'black', height: 1, marginVertical: 5 }} />
                        <View style={[styles.feeBreakdownTextView]}>
                            <View>
                                <Text style={[styles.infoText, { color: '#1F1F1F' }]}>TOTAL</Text>
                                <Text>(Inclusive of 6% SST)</Text>
                            </View>
                            <View>
                                <Text style={[styles.infoText, { color: '#1F1F1F' }]}>RM {(this.state.total).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.receiptBtnView]}>
                        <TouchableOpacity style={{
                            borderRadius: 45, backgroundColor: '#FFD44E', width: '70%', height: 50,
                            alignItems: 'center', justifyContent: 'center'
                        }}
                            onPress={() => this.checkPermission()}>
                            <Text style={{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#FFFFFF' }}>Save Receipt</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    receiptImageView: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    receiptImage: {
        margin: 10,
        width: 100,
        height: 100
    },
    receiptView: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    infoText: {
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#979797'
    },
    detailText: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        color: '#181818'
    },
    receiptDetailTextView: {
        flex: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginHorizontal: 5
    },
    receiptDetailText: {
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 15
    },
    feeBreakdownTextView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    receiptBtnView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap'
    },
})
