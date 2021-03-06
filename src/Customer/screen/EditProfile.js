import React, { Component } from 'react';
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { requestImagePickerPermission } from '../util/permission/Permission';
import { Picker } from '@react-native-community/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { getCustomerId } from "../util/Auth";
import { DISTRICT } from '../util/District';
import { URL } from '../util/FetchURL';

var gender = [];

export default class EditProfile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,
            customerId: '',
            image: '',
            name: '',
            icPassportNo: '',
            phoneNo: '',
            gender: '',
            dateOfBirth: new Date(),
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            city: '',
            state: 'Johor',
            showDatePicker: false,
            filePath: {},  // gt data, fileSize, height, fileName, path, type, uri, content, width
            picture: '',
            allState: [],
        }


    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });


        let bodyData = {
            transactionCode: 'GETGENDER',
            timestamp: new Date(),
            data: {
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
                    gender = [];
                    responseJson.data.forEach(element => {
                        gender.push({ label: element.Description, value: element.Description });
                    });
                }
                else {
                    alert(responseJson.value);
                }

            })
            .catch((error) => {

                alert(error);
            });

        bodyData = {
            transactionCode: 'GETSTATE',
            timestamp: new Date(),
            data: {
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
                    let allState = [];

                    responseJson.data.forEach(element => {
                        if (element.Description !== "National" && element.Description !== "Luar Negara") {
                            allState.push(element.Description);
                        }
                    });

                    this.setState({
                        allState: allState
                    });

                }
                else {
                    alert(responseJson.value);
                }
                this.getProfileData();
            })
            .catch((error) => {
                alert(error);
            });
    }

    getProfileData = () => {
        // get profile data
        let bodyData = {
            transactionCode: 'PROFILE',
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
                    if (responseJson.data[0].picture !== null) {
                        let unitArray = new Uint8Array(responseJson.data[0].picture.data);

                        const stringChar = unitArray.reduce((data, byte) => {
                            return data + String.fromCharCode(byte);
                        }, '');

                        this.setState({ picture: RNFetchBlob.base64.encode(stringChar) });
                    }

                    this.setState({
                        name: responseJson.data[0].name,
                        icPassportNo: responseJson.data[0].id_number,
                        phoneNo: responseJson.data[0].mobile_no,
                        gender: responseJson.data[0].gender_cd === null ? '' : responseJson.data[0].gender_cd,
                        dateOfBirth: new Date(responseJson.data[0].DOB),
                        addressLine1: responseJson.data[0].home_address1 === null ? '' : responseJson.data[0].home_address1,
                        addressLine2: responseJson.data[0].home_address2 === null ? '' :  responseJson.data[0].home_address2,
                        addressLine3: responseJson.data[0].home_address3 === null ? '' : responseJson.data[0].home_address3,
                        city: responseJson.data[0].district === null ? '' : responseJson.data[0].district,
                        state: responseJson.data[0].state === null ? 'Johor' : responseJson.data[0].state,
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

    changePhoto = async () => {

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

    datePicker = () => {
        if (this.state.showDatePicker) {
            return (
                <DateTimePicker
                    value={this.state.dateOfBirth}
                    mode={'date'}
                    display='spinner'
                    onChange={(event, date) => { if (event.type === 'set') { this.setState({ dateOfBirth: date, showDatePicker: false }); } }}
                />
            )
        }
    }

    editProfile = () => {
        if (this.state.customerId == '' || this.state.name == '' || this.state.icPassportNo == '' || this.state.phoneNo == '' ||
            this.state.gender == '' || this.state.dateOfBirth == '' || this.state.addressLine1 == '' || this.state.addressLine2 == '' ||
            this.state.addressLine3 == '' || this.state.city == '' || this.state.state == '') {
            alert('Please fill in all the field');
        }
        else if (Object.keys(this.state.filePath).length === 0 && this.state.picture === '') {
            alert('Please upload your photo');
        }
        else {
            let data = {
                CustomerId: this.state.customerId,
                Name: this.state.name,
                IcPassportNo: this.state.icPassportNo,
                PhoneNo: this.state.phoneNo,
                Gender: this.state.gender,
                DateOfBirth: this.state.dateOfBirth,
                AddressLine1: this.state.addressLine1,
                AddressLine2: this.state.addressLine2,
                AddressLine3: this.state.addressLine3,
                City: this.state.city,
                State: this.state.state
            }

            let fileData = Object.entries(this.state.filePath).length === 0 ? this.state.picture : this.state.filePath.data;

            RNFetchBlob.fetch('POST', URL, {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            }, [
                // element with property `filename` will be transformed into `file` in form data
                { name: 'file', filename: 'picture', data: fileData },
                // elements without property `filename` will be sent as plain text
                { name: 'transactionCode', data: 'UPDATEPROFILE' },
                { name: 'timestamp', data: JSON.stringify(new Date()) },
                { name: 'data', data: JSON.stringify(data) },
            ]).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result === true) {
                        alert('Update Profile Succesfully');
                        this.props.navigation.navigate('Jomedic');
                    }
                    else {
                        alert(responseJson.value);
                    }
                }).catch((error) => {
                    alert(error);
                })
        }

    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={{}}>

                    <View style={[styles.imageView]}>
                        <TouchableOpacity style={[styles.imageBorder]} onPress={() => this.changePhoto()} >
                            {
                                Object.entries(this.state.filePath).length === 0 ?
                                    this.state.picture === '' ?
                                        <Text style={{ fontSize: 24, lineHeight: 33, color: '#FFFFFF' }}>+</Text>
                                        :
                                        <Image
                                            source={{
                                                uri: 'data:image/jpg;base64,' + this.state.picture,
                                            }}
                                            style={{ width: 100, height: 100, borderRadius: 100 / 2 }}
                                        />
                                    :
                                    <Image
                                        source={{ uri: this.state.filePath.uri }}
                                        style={{ width: 100, height: 100, borderRadius: 100 / 2 }}
                                    />
                            }


                        </TouchableOpacity>

                        <TouchableOpacity style={{ alignItems: 'center', marginTop: 5 }} onPress={() => this.changePhoto()}>
                            <Text style={[styles.selfInfoInputText, { borderBottomWidth: 0, color: '#00A8F0' }]}>Change Photo</Text>
                        </TouchableOpacity>

                    </View>

                    <View style={[styles.selfInfo]}>
                        <Text style={[styles.selfInfoLabelText]}>Name</Text>
                        <TextInput style={styles.selfInfoInputText}
                            value={this.state.name}
                            onChangeText={(name) => this.setState({ name })}
                            placeholder={'Name'}
                        />

                        <Text style={[styles.selfInfoLabelText]}>IC/Passport Number</Text>
                        <TextInput style={styles.selfInfoInputText}
                            value={this.state.icPassportNo}
                            onChangeText={(icPassportNo) => this.setState({ icPassportNo })}
                            placeholder={'IC or Passport Number'}
                        />

                        <Text style={[styles.selfInfoLabelText]}>Phone No</Text>
                        <TextInput style={styles.selfInfoInputText}
                            value={this.state.phoneNo}
                            onChangeText={(phoneNo) => this.setState({ phoneNo })}
                            placeholder={'Phone Number'}
                            keyboardType={'phone-pad'}
                        />

                        <Text style={[styles.selfInfoLabelText]}>Gender</Text>

                        <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' }}>
                            {gender.map((data, key) => {
                                return (
                                    <View key={key}>
                                        <TouchableOpacity style={{ flexDirection: 'row', marginRight: 20 }}
                                            onPress={() => this.setState({ gender: data.value })}>
                                            {this.state.gender == data.value ?
                                                <FontistoIcon name='radio-btn-active' size={20} color={'#FFD44E'} />
                                                :
                                                <FontistoIcon name='radio-btn-passive' size={20} color={'#979797'} />
                                            }
                                            <Text style={[styles.selfInfoInputText, { borderBottomWidth: 0, marginLeft: 5 }]}>{data.label}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>

                        <Text style={[styles.selfInfoLabelText]}>Date of Birth</Text>
                        <TouchableOpacity style={{ flexDirection: 'row' }}
                            onPress={() => this.setState({ showDatePicker: !this.state.showDatePicker })}>
                            <TextInput style={[styles.selfInfoInputText, { marginRight: 10, textAlign: 'center' }]} editable={false}>{this.state.dateOfBirth.getDate().toString()}</TextInput>
                            <TextInput style={[styles.selfInfoInputText, { marginRight: 10, textAlign: 'center', borderBottomWidth: 0 }]} editable={false}>/</TextInput>
                            <TextInput style={[styles.selfInfoInputText, { marginRight: 10, textAlign: 'center' }]} editable={false}>{(this.state.dateOfBirth.getMonth() + 1).toString()}</TextInput>
                            <TextInput style={[styles.selfInfoInputText, { marginRight: 10, textAlign: 'center', borderBottomWidth: 0 }]} editable={false}>/</TextInput>
                            <TextInput style={[styles.selfInfoInputText, { marginRight: 10, textAlign: 'center' }]} editable={false}>{this.state.dateOfBirth.getFullYear().toString()}</TextInput>
                        </TouchableOpacity>
                        {this.datePicker()}

                        <Text style={[styles.selfInfoLabelText]}>Address Line 1</Text>
                        <TextInput style={styles.selfInfoInputText}
                            value={this.state.addressLine1}
                            onChangeText={(addressLine1) => this.setState({ addressLine1 })}
                            placeholder={'address Line 1'}
                        />

                        <Text style={[styles.selfInfoLabelText]}>Address Line 2</Text>
                        <TextInput style={styles.selfInfoInputText}
                            value={this.state.addressLine2}
                            onChangeText={(addressLine2) => this.setState({ addressLine2 })}
                            placeholder={'address Line 2'}
                        />

                        <Text style={[styles.selfInfoLabelText]}>Address Line 3</Text>
                        <TextInput style={styles.selfInfoInputText}
                            value={this.state.addressLine3}
                            onChangeText={(addressLine3) => this.setState({ addressLine3 })}
                            placeholder={'address Line 3'}
                        />

                        <Text style={[styles.selfInfoLabelText]}>State</Text>

                        <Picker style={styles.selfInfoInputText, { borderColor: 'blue' }}
                            selectedValue={this.state.state}
                            onValueChange={(itemValue, itemIndex) => this.setState({ state: itemValue })}
                        >
                            <Picker.Item label='Select State' value='' color="grey" />
                            {
                                this.state.allState.map((state, index) => {
                                    return (
                                        <Picker.Item label={state} value={state} color="#000000" />
                                    )
                                })
                            }
                        </Picker>

                        <Text style={[styles.selfInfoLabelText]}>City</Text>
                        <Picker style={styles.selfInfoInputText, { borderColor: 'blue' }}
                            selectedValue={this.state.city}
                            onValueChange={(itemValue, itemIndex) => this.setState({ city: itemValue })}
                        >
                            <Picker.Item label='Select City' value='' color="grey" />
                            {
                                DISTRICT[this.state.state.replace(/\s+/g, '')].filter(function (value) {
                                    if (value === "All") {
                                        return false; // skip
                                    }
                                    return true;
                                }).map((district, index) => {
                                    return (
                                        <Picker.Item label={district} value={district} color="#000000" />
                                    )
                                })
                            }
                            <Picker.Item label='Others' value='Others' color="#000000" />
                        </Picker>

                    </View>
                    <TouchableOpacity style={[styles.btn]}
                        onPress={() => this.editProfile()}>
                        <Text style={[styles.btnText]}>Save</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    imageView: {
        marginTop: 10,
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
    selfInfo: {
        marginHorizontal: 45,
    },
    selfInfoLabelText: {
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#000000',
        marginTop: 15,
    },
    selfInfoInputText: {
        fontSize: 14,
        lineHeight: 19,
        color: '#7A7A7A',
        borderBottomWidth: 1,
        borderColor: '#ACACAC'
    },
    btn: {
        height: 50,
        width: '70%',
        marginVertical: 40,
        backgroundColor: '#FFD44E',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        justifyContent: 'center'
    },
    btnText: {
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
        color: '#FFFEFE'
    }
})
