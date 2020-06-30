import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native'

export default class topup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            topupAmount: '',

        };
    }

    onPressButton = (val) => {
        this.setState({
            amount: val.toString()
        })
    }


    render() {
        return (
            <View style={styles.container}>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 20, marginRight: 20, marginBottom: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}> Top Up Amount (RM) </Text>
                        <Text style={{ color: 'grey', textAlignVertical: 'bottom' }} > Minimum Amount:RM10 </Text>
                    </View>

                    <TextInput
                        style={{ height: 45, borderColor: "gray", borderWidth: 2, borderRadius: 10, marginLeft: 20, marginRight: 20 }}
                        // Adding hint in TextInput using Placeholder option.
                        placeholder=" Enter Top Up amount"
                        // Making the Under line Transparent.
                        underlineColorAndroid="transparent"
                        value={this.state.amount}
                    />
                </View>
                <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => this.setState({amount: '10' })}>
                            <View style={styles.button1}>
                                <Text style={styles.buttonText}>10</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.onPressButton(20)}>
                            <View style={styles.button1}>
                                <Text style={styles.buttonText}>20</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.onPressButton(30)}>
                            <View style={styles.button1}>
                                <Text style={styles.buttonText}>30</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => this.onPressButton(40)}>
                            <View style={styles.button1}>
                                <Text style={styles.buttonText}>40</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.onPressButton(50)}>
                            <View style={styles.button1}>
                                <Text style={styles.buttonText}>50</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.onPressButton(60)}>
                            <View style={styles.button1}>
                                <Text style={styles.buttonText}>60</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.containerContinue}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => this.props.navigation.navigate('OnlineBanking')}
                        style={styles.continueBtn}>
                        < Text style={styles.continueBtn}>Continue</Text>
                    </TouchableOpacity>
                </View>

            </View>

        )
    }
}

const styles = StyleSheet.create({

    container: {

        marginTop: 30


    },

    button1: {
        marginTop: 30,
        marginBottom: 15,
        width: 100,
        alignItems: 'center',
        backgroundColor: '#2196F3',
        borderRadius: 20,
        margin: 10
    },
    buttonText: {
        textAlign: 'center',
        padding: 20,
        color: 'white',

    },

    continueBtn: {
        paddingHorizontal: '30%',
        paddingVertical: 10,
        backgroundColor: '#F5A623',
        borderRadius: 50,
        

    },

    containerContinue: {
        alignItems: 'center',
        height: '100%',



    },








})
