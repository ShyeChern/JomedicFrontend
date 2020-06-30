import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, BackHandler } from 'react-native';


export default class WelcomePage extends Component {

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        BackHandler.exitApp();
    }

    // do permission
    render() {
        return (
            <View style={[styles.container]}>
                <View style={[styles.welcomePageImageView]}>
                    <Image style={[styles.welcomePageImage]}
                        source={require('../asset/img/logo.png')}
                    />
                    <Text style={{ fontWeight: '600', fontSize: 18, textAlign: 'center', lineHeight: 25 }}>Welcome to Jomedic</Text>
                    <Text style={{ color: '#4A4A4A', fontSize: 16, textAlign: 'center', lineHeight: 22 }}>An online medical consultation platform</Text>
                </View>

                <View style={[styles.actionBtnView]}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFD44E' }]}
                        onPress={() => this.props.navigation.navigate('SignUp')}>
                        <Text style={{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#FFFFFF' }}>Sign Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn]}
                        onPress={() => this.props.navigation.navigate('Login')}>
                        <Text style={{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#FFD44E' }}>Log in</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    welcomePageImageView: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 5,
        margin: 20
    },
    welcomePageImage: {
        width: 115,
        height: 115,
        margin: 31
    },
    actionBtnView: {
        flex: 3,
        alignItems: 'center'
    },
    actionBtn: {
        width: '70%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 50,
        margin: 13,
        borderColor: '#FFD44E'
    }
})
