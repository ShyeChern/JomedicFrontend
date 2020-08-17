import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AntDesign from 'react-native-vector-icons/AntDesign';

export default class VideoConsultationInfo extends Component {

    constructor(props) {
        super(props)

        this.state = {
            acceptTC: false,
            warning: ''
        }
    }

    videoConsult = () => {
        if (this.state.acceptTC === false) {
            this.setState({
                warning: '*Please tick to accept the term & condition to continue'
            });
        }
        else {
            this.setState({
                warning: ''
            });

            this.props.requestVideoConsultation();
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={{ marginLeft: 10, marginTop: 5 }}
                    onPress={() => this.props.doctorActionChange('detail')}>
                    <AntDesign name='arrowleft' size={30} color='#4A4A4A' />
                </TouchableOpacity>
                <View style={[{ flex: 1, justifyContent: 'space-around', marginVertical: 10 }]}>
                    <Text style={[styles.text, styles.textLabel, { color: 'red' }]}>{this.state.warning}</Text>

                    <Text style={[styles.text, styles.textLabel]}>Video Consultation Fee</Text>
                    <Text style={[styles.text, styles.textDescription]}>RM {(this.props.videoConsultationFee).toFixed(2)}</Text>

                    <Text style={[styles.text, styles.textLabel]}>eWallet Balance</Text>
                    <Text style={[styles.text, styles.textDescription]}>RM {(this.props.walletBalance).toFixed(2)}</Text>
                    {
                        this.props.doctorStatus === 'Available' ?
                            <View style={[styles.tcCheckBoxView]}>
                                <CheckBox value={this.state.acceptTC}
                                    onValueChange={() => this.setState({ acceptTC: !this.state.acceptTC })}
                                    tintColors={{ true: '#FFD44E', false: '#808080' }}
                                />

                                <Text style={[styles.text]}>I accept terms & conditions</Text>
                            </View>
                            :
                            <View />
                    }


                    <TouchableOpacity style={[styles.btn, { backgroundColor: this.props.doctorStatus === 'Available' ? '#FFD44E' : '#EFEFEF' }]} disabled={this.props.doctorStatus === 'Available' ? false : true}
                        onPress={() => this.videoConsult()}>
                        <Text style={[styles.btnText]}>Video Consultation</Text>
                    </TouchableOpacity>
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
    textLabel: {
        color: '#000000',
        marginLeft: 45,
        marginVertical: 10
    },
    textDescription: {
        color: '#595959',
        marginLeft: 55,
        marginVertical: 10
    },
    tcCheckBoxView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    btn: {
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
})
