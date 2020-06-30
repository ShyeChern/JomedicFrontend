import React, { Component } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Keyboard, TouchableWithoutFeedback, TextInput, ScrollView, Image, YellowBox } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Picker } from '@react-native-community/picker';
import { requestImagePickerPermission } from '../util/permission/Permission';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { URL } from '../util/FetchURL';
// Sign Up Screen

YellowBox.ignoreWarnings(['Animated']);


export default class SignUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            icPassportNo: '',
            phoneNo: '',
            question: '',
            answer: '',
            filePath: {},
            errors: {
                name: '', email: '', password: '', confirmPassword: '', icPassportNo: '', phoneNo: '', answer: ''
            },
            submitError: '',
            isLoading: false,
        };
    }

    uploadPhoto = async () => {

        if (Platform.OS === 'android') {
            await requestImagePickerPermission().then(response => {
                if (response["android.permission.CAMERA"] === 'granted' && response["android.permission.WRITE_EXTERNAL_STORAGE"] === 'granted') {
                    var options = {
                        title: 'Select Image',
                        mediaType: 'photo',
                        maxWidth: 300,
                        maxHeight: 300,
                        storageOptions: {
                            skipBackup: true,
                            path: 'images',
                        },
                    };
                    ImagePicker.showImagePicker(options, response => {
                        //upload to db
                        if (response.didCancel) {
                            // console.log('User cancelled image picker');
                        } else if (response.error) {
                            // console.log('ImagePicker Error: ', response.error);
                        } else if (response.customButton) {
                            // console.log('User tapped custom button: ', response.customButton);
                        } else {
                            let source = response;

                            this.setState({
                                filePath: source,
                            });

                        }
                    });
                }
            });

        }

    }

    signUp = () => {

        Keyboard.dismiss();

        let errors = {
            name: '', email: '', password: '', confirmPassword: '', icPassportNo: '', phoneNo: '', answer: ''
        };

        let inputValid = true;

        if (this.state.name == '') {
            errors.name = 'Please enter this field';
            inputValid = false;
        }
        if (this.state.email == '') {
            errors.email = 'Please enter this field';
            inputValid = false;
        }
        if (this.state.password == '') {
            errors.password = 'Please enter this field';
            inputValid = false;
        }
        if (this.state.confirmPassword == '') {
            errors.confirmPassword = 'Please enter this field';
            inputValid = false;
        }
        if (this.state.icPassportNo == '') {
            errors.icPassportNo = 'Please enter this field';
            inputValid = false;
        }
        if (this.state.phoneNo == '') {
            errors.phoneNo = 'Please enter this field';
            inputValid = false;
        }
        if (this.state.question == '') {
            alert('Please choose your secret question');
            inputValid = false;
        }
        if (this.state.answer == '') {
            errors.answer = 'Please enter this field';
            inputValid = false;
        }
        if (Object.entries(this.state.filePath).length === 0) {
            alert('Please upload your image');
            inputValid = false;
        }

        if (inputValid) {
            this.setState({
                isLoading: true
            });

            let data = {
                Name: this.state.name,
                Email: this.state.email,
                Password: this.state.password,
                ConfirmPassword: this.state.confirmPassword,
                IcPassportNo: this.state.icPassportNo,
                PhoneNo: this.state.phoneNo,
                Question: this.state.question,
                Answer: this.state.answer,
            }

            let fileData = this.state.filePath.data;

            RNFetchBlob.fetch('POST', URL, {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            }, [
                // element with property `filename` will be transformed into `file` in form data
                { name: 'file', filename: 'picture', data: fileData },
                // elements without property `filename` will be sent as plain text
                { name: 'transactionCode', data: 'SIGNUP' },
                { name: 'timestamp', data: JSON.stringify(new Date()) },
                { name: 'data', data: JSON.stringify(data) },
            ]).then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        isLoading: false
                    });

                    if (responseJson.result === true) {
                        alert(responseJson.value);
                        this.props.navigation.navigate('WelcomePage');

                    }
                    else {
                        this.setState({ submitError: responseJson.value });
                    }
                }).catch((error) => {
                    this.setState({
                        isLoading: false,
                        submitError: error
                    });
                })


            // fetch(URL, {
            //     method: 'POST',
            //     headers: {
            //         Accept: 'application/json',
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(bodyData),
            // }).then((response) => response.json())
            //     .then((responseJson) => {
            //         this.setState({
            //             isLoading: false
            //         });

            //         if (responseJson.result === true) {
            //             alert(responseJson.value);
            //             this.props.navigation.navigate('WelcomePage');

            //         }
            //         else {
            //             this.setState({ submitError: responseJson.value });
            //         }

            //     })
            //     .catch((error) => {

            //         this.setState({
            //             isLoading: false,
            //             submitError: error
            //         });
            //     });

        }
        else {
            this.setState({ errors: errors });
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

        if (this.state.isLoading) {
            return (
                <View>
                    <ActivityIndicator size='large'></ActivityIndicator>
                </View>
            )
        }

        return (
            <ScrollView style={[styles.container]}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View>
                        <Text style={[styles.title]}>Create Account </Text>

                        <Text style={[styles.signUpInput, { color: 'red', marginVertical: 5, textAlign: 'center' }]}>{this.state.submitError}</Text>

                        <View style={[styles.imageView]}>
                            <TouchableOpacity style={[styles.imageBorder]} onPress={() => this.uploadPhoto()} >
                                {
                                    Object.entries(this.state.filePath).length === 0 ?
                                        <Text style={{ fontSize: 24, lineHeight: 33, color: '#FFFFFF' }}>+</Text>
                                        :
                                        <Image
                                            source={{ uri: this.state.filePath.uri }}
                                            style={{ width: 100, height: 100, borderRadius: 100 / 2 }}
                                        />
                                }
                            </TouchableOpacity>

                            <TouchableOpacity style={{ alignItems: 'center', marginTop: 5 }} onPress={() => this.uploadPhoto()}>
                                <Text style={[styles.signUpInputText, { borderBottomWidth: 0, color: '#00A8F0' }]}>Upload Photo</Text>
                            </TouchableOpacity>

                        </View>

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signUpInput}
                            ref={(name) => { this.name = name; }}
                            value={this.state.name}
                            label='Name'
                            autoCapitalize='none'
                            onChangeText={(name) => this.setState({ name })}
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.email.focus(); }}
                            error={this.state.errors.name}
                        />

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signUpInput}
                            ref={(email) => { this.email = email; }}
                            value={this.state.email}
                            label='Email'
                            autoCapitalize='none'
                            onChangeText={(email) => this.setState({ email })}
                            keyboardType='email-address'
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.password.focus(); }}
                            error={this.state.errors.email}
                        />

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signUpInput}
                            ref={(password) => { this.password = password; }}
                            value={this.state.password}
                            secureTextEntry={true}
                            label='Password'
                            autoCapitalize='none'
                            onChangeText={(password) => this.setState({ password })}
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.confirmPassword.focus(); }}
                            maxLength={20}
                            error={this.state.errors.password}
                        />

                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signUpInput}
                            ref={(confirmPassword) => { this.confirmPassword = confirmPassword; }}
                            value={this.state.confirmPassword}
                            secureTextEntry={true}
                            label='Confirm Password'
                            autoCapitalize='none'
                            onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.icPassportNo.focus(); }}
                            maxLength={20}
                            error={this.state.errors.confirmPassword}
                        />
                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signUpInput}
                            ref={(icPassportNo) => { this.icPassportNo = icPassportNo; }}
                            value={this.state.icPassportNo}
                            label='IC/Passport No'
                            autoCapitalize='none'
                            onChangeText={(icPassportNo) => this.setState({ icPassportNo })}
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.phoneNo.focus(); }}
                            maxLength={20}
                            error={this.state.errors.icPassportNo}
                        />
                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signUpInput}
                            ref={(phoneNo) => { this.phoneNo = phoneNo; }}
                            value={this.state.phoneNo}
                            label='Phone No'
                            autoCapitalize='none'
                            onChangeText={(phoneNo) => this.setState({ phoneNo })}
                            returnKeyType={"next"}
                            onFocus={this.onFocus}
                            onSubmitEditing={() => { this.answer.focus(); }}
                            maxLength={20}
                            error={this.state.errors.phoneNo}
                        />
                        <Picker style={styles.signUpInput}
                            selectedValue={this.state.question}
                            onValueChange={(itemValue, itemIndex) => this.setState({question:itemValue})}
                        >
                            <Picker.Item label='Pick Your Secret Question' value='' color="grey" />
                            <Picker.Item label='What was your mother middle name?' value='What is your mother middle name?' color="#000000" />
                            <Picker.Item label='What was your first pet?' value='What was your first pet?' color="#000000" />
                            <Picker.Item label='What was the model of your first car?' value='What was the model of your first car?' color="#000000" />
                            <Picker.Item label='In what city were you born?' value='In what city were you born?' color="#000000" />
                            <Picker.Item label='What was your childhood nickname?' value='What was your childhood nickname?' color="#000000" />
                            
                        </Picker>
                        
                        <TextField tintColor='#FFD44E'
                            containerStyle={styles.signUpInput}
                            ref={(answer) => { this.answer = answer; }}
                            value={this.state.answer}
                            label='Secret Answer'
                            autoCapitalize='none'
                            onChangeText={(answer) => this.setState({ answer })}
                            returnKeyType={'done'}
                            onFocus={this.onFocus}
                            maxLength={20}
                            error={this.state.errors.answer}
                        />

                        <TouchableOpacity style={[styles.signUpBtn]}
                            onPress={() => this.signUp()}>
                            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, lineHeight: 22 }}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                </TouchableWithoutFeedback>

            </ScrollView>
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
        marginHorizontal: 58,
        lineHeight: 33,
        marginTop: 17,
        textAlign: 'center'
    },
    imageView: {
        alignItems: 'center'
    },
    imageBorder: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
        borderWidth: 5,
        borderColor: '#ECECEC',
        backgroundColor: '#9B9B9B',
        justifyContent: 'center',
        alignItems: 'center'
    },
    signUpInput: {
        width: '70%',
        alignSelf: 'center',
    },
    signUpBtn: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD44E',
        borderRadius: 50,
        width: '70%',
        marginVertical: 38,
        height: 50
    },

})
