import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { URL } from '../util/FetchURL';
import { TextField } from 'react-native-material-textfield';
import { getCustomerId } from "../util/Auth";



export default class ChangePassword extends Component {
    constructor(props) {
        super(props)

        this.state = {
            customerId:'',
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            submitError: '',
            errors: { oldPassword: '', newPassword: '', confirmPassword: '' },
        }
    }

    async componentDidMount(){
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });
    }

    changePassword = () => {

        Keyboard.dismiss();

        let errors = { oldPassword: '', newPassword: '', confirmPassword: '' };
        let inputValid = true;

        if (this.state.oldPassword == '') {
            errors.oldPassword = 'Please enter this field';
            inputValid = false;
        }

        if (this.state.newPassword == '') {
            errors.newPassword = 'Please enter this field';
            inputValid = false;
        }

        if (this.state.confirmPassword == '') {
            errors.confirmPassword = 'Please enter this field';
            inputValid = false;
        }

        if (inputValid) {

            let bodyData = {
                transactionCode: 'CHGPASS',
                timestamp: new Date(),
                data: {
                    CustomerId:this.state.customerId,
                    OldPassword:this.state.oldPassword,
                    NewPassword:this.state.newPassword,
                    ConfirmPassword:this.state.confirmPassword
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
                    this.setState({
                        isLoading: false
                    });

                    if (responseJson.result === true) {
                        alert('Change Password Success');
                        this.props.navigation.navigate('Jomedic');

                    }
                    else {
                        this.setState({ submitError: responseJson.value });
                    }

                })
                .catch((error) => {

                    alert(error);
                });
        }

        else {
            this.setState({ 
                errors: errors ,
                submitError:'Please input all the field'
            });
        }
    }

    onFocus = () => {

        let errors = this.state.errors;
        for (let field in errors) {

            if (this[field] && this[field].isFocused()) {
                errors[field] = '';
            }
        }

        this.setState({
            errors: errors,
            submitError: '',
        });
    }

    render() {

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View>
                        <Text style={[styles.title]}> Change Password </Text>

                        <Text style={[styles.input, { color: 'red', textAlign:'center' }]}>{this.state.submitError}</Text>

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.input}
                            ref={(oldPassword) => { this.oldPassword = oldPassword; }}
                            value={this.state.oldPassword}
                            secureTextEntry={true}
                            label='Old Password'
                            autoCapitalize='none'
                            onChangeText={(oldPassword) => this.setState({ oldPassword })}
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.newPassword.focus(); }}
                            error={this.state.errors.oldPassword}
                        />

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.input}
                            ref={(newPassword) => { this.newPassword = newPassword; }}
                            value={this.state.newPassword}
                            secureTextEntry={true}
                            label='New Password'
                            autoCapitalize='none'
                            onChangeText={(newPassword) => this.setState({ newPassword })}
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.confirmPassword.focus(); }}
                            error={this.state.errors.newPassword}
                        />

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.input}
                            ref={(confirmPassword) => { this.confirmPassword = confirmPassword; }}
                            value={this.state.confirmPassword}
                            secureTextEntry={true}
                            label='Confirm Password'
                            autoCapitalize='none'
                            onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                            returnKeyType={'done'}
                            onFocus={this.onFocus}
                            error={this.state.errors.confirmPassword}
                        />

                        <TouchableOpacity style={[styles.btn]}
                            onPress={() => this.changePassword()}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', lineHeight: 22 }}>Change Password</Text>
                        </TouchableOpacity>

                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign:'center',
        lineHeight: 33,
        marginVertical: 17
    },
    input: {
        width: '70%',
        alignSelf: 'center',
    },
    btn: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD44E',
        borderRadius: 50,
        width: '70%',
        marginTop: 38,
        marginBottom: 10,
        height: 50
    }
})
