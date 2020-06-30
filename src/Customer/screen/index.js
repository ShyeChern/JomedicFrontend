import React, { Component } from 'react';
import { Main, Authenticate } from "../route/Navigator";
import { HomeDoctor } from "../../Provider/lib/router";
import { View, ActivityIndicator } from 'react-native';
import { isLogin, getUserType } from "../util/Auth";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            isLoading: true,
            userType: 0,
        };
    }

    componentDidMount() {
        this.checkIsLogin();
    }

    componentWillUnmount() {

    }

    checkIsLogin = () => {

        isLogin()
            .then(response => {
                if (response == true) {
                    
                    getUserType().then(response => {
                        this.setState({ isLogin: true, userType: response, isLoading: false })
                    })
                }
                else {
                    this.setState({ isLogin: false, isLoading: false })
                }
            })
            .catch(error => alert(error));
    }


    render() {
        if (this.state.isLoading) {
            return (
                // Make a splash screen?
                <View>
                    <ActivityIndicator size='large'></ActivityIndicator>
                </View>
            )
        }
        else {

            if (this.state.isLogin && this.state.userType == '6') {
                return (
                    <Main />
                );
            }
            else if (this.state.isLogin && this.state.userType == '4') {
                return (
                    <HomeDoctor />
                )
            }
            else {
                return <Authenticate />
            }
        }
    }
}