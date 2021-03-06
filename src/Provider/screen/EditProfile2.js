import React, { Component } from 'react'
import { Text, TextInput, StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { Picker } from '@react-native-community/picker';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTenantId, getTenantType, getUserId } from '../util/Auth'

import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import { requestImagePickerPermission } from '../util/permission'
import Loader from './Loader'
import defaultAvatar from '../img/defaultAvatar.png'
import { DISTRICT } from '"../../../Customer/util/District';

// import ImagePicker from 'react-native-image-crop-picker';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';


export default class EditProfile extends Component {

    constructor(props) {
        super(props)
        this.state = {
            // Boolean Initalization
            isLoading: false,
            isVisiblePicker: false,
            isImagePickerModalVisible: false,

            // Data Initialization
            avatar: defaultAvatar,
            name: '',
            icPassport: '',
            phoneNo: '',
            gender: 'Male',
            birthDay: 'DD',
            birthMonth: 'MM',
            birthYear: 'YYYY',
            address1: '',
            address2: '',
            address3: '',
            postcode: '',
            city: '',
            state: 'Johor',

            // Radio Button Initalization, 0: Male, 1: Female
            radioBtnsData: ['Male', 'Female', 'Others'],
            checked: 0,

            // Date Time Picker Data Initialization
            date: moment(),

            // Hold base64 image uris
            imageData: '',
            filePath: {},
        }
    }

    async componentDidMount() {
        await this.initializeData();
        await this.getProfileData();
        // this.loadProfileData()
    }

    initializeData = async () => {
        await getUserId().then(response => {
            this.setState({ user_id: response });
        });

        await getTenantType().then(response => {
            this.setState({ tenant_type: response });
        });

        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });
    }

    // Function to validate is given string numeric only with RegEx 
    validateNumberOnly = (string) => {
        const regexp = /[^0-9]/;    // RegEx to Find any non numeric characters
        return !(regexp.test(string));   // If there is non numeric characters, return false; else true
    }

    /*
     *  Data Processing Segments  
     */
    getProfileData = async () => {
        this.setState({ isLoading: true })

        let user_id = this.state.user_id;

        // Get User Profile and its data
        let datas = {
            txn_cd: 'MEDORDER020-2',
            tstamp: getTodayDate(),
            data: {
                user_id: user_id,
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                console.log('Get User Profile Error');
                console.log(json.status);
                Alert.alert("Get User Profile Error", "Fail to get user profile, please try again.\n" + json.status)
            }
            else {
                let data = json.status[0]
                if (data) {
                    if (data.picture !== null) {
                        let unitArray = new Uint8Array(data.picture.data);

                        const stringChar = unitArray.reduce((data, byte) => {
                            return data + String.fromCharCode(byte);
                        }, '');

                        this.setState({ picture: RNFetchBlob.base64.encode(stringChar) });
                    }

                    // Gender Condition Checking
                    if (data.gender_cd.toUpperCase() === "MALE") {
                        this.setState({
                            checked: 0
                        })
                    } else if (data.gender_cd.toUpperCase() === "FEMALE") {
                        this.setState({
                            checked: 1
                        })
                    } else {
                        this.setState({
                            checked: 2
                        })
                    }

                    this.setState({
                        name: data.name,
                        icPassport: data.id_number,
                        phoneNo: data.mobile_no,
                        gender: data.gender_cd,
                        birthDay: moment(data.DOB).format("DD"),
                        birthMonth: moment(data.DOB).format("MM"),
                        birthYear: moment(data.DOB).format('YYYY'),
                        address1: data.home_address1,
                        address2: data.home_address2,
                        address3: data.home_address3,
                        postcode: data.postcode,
                        city: data.district,
                        state: data.state,

                        // For DateTimePicker
                        date: moment(data.DOB).format("YYYY-MM-DD"),

                        // For avatar
                        profileData: data,
                    })

                }
            };

            this.setState({
                isLoading: false,
                isProfileUpdated: false
            });

        } catch (error) {
            console.log('Get User Profile Error');
            console.log(error)
            this.setState({
                isLoading: false,
                isProfileUpdated: false
            });
            // handleNoInternet()
            Alert.alert("Get User Profile Error", "Fail to get user profile, please try again.\n" + error)
        }
    }

    // handle Save Profile Data
    handleSave = async () => {
        // Validate the fields
        // Check for empty or white spaces
        if (!this.state.name || this.state.name.trim() === "") {
            Alert.alert("Empty Name", "Empty name. Please enter your name.");
            return;
        }
        if (!this.state.icPassport || this.state.icPassport.trim() === "") {
            Alert.alert("Empty Ic or Passport Number", "Empty Ic or Passport Number. Please enter your ic or passport number.");
            return;
        }

        if (!this.state.phoneNo || this.state.phoneNo.trim() === "") {
            Alert.alert("Empty Phone Number", "Empty Phone Number. Please enter your phone number.");
            return;
        }

        let dobString = this.state.birthYear + "-" + this.state.birthMonth + '-' + this.state.birthDay
        if (dobString === "YYYY-MM-DD") {
            Alert.alert("Empty Date Of Birth", "Empty Date Of Birth. Please enter your date of birth.");
            return;
        }

        if (!this.state.address1 || this.state.address1.trim() === "") {
            Alert.alert("Empty Address", "Empty Address. Please enter your address.");
            return;
        }

        if (!this.state.postcode || this.state.postcode.trim() === "") {
            Alert.alert("Empty Postcode", "Empty Postcode. Please enter your postcode.");
            return;
        }

        if (!this.state.city || this.state.city.trim() === "") {
            Alert.alert("Empty City", "Empty City. Please enter your district.");
            return;
        }

        if (!this.state.state || this.state.state.trim() === "") {
            Alert.alert("Empty State", "Empty State. Please enter your state.");
            return;
        }

        if (Object.keys(this.state.filePath).length === 0 && this.state.picture === '') {
            alert("Empty Profile Picture", 'Empty Profile Picture. Please upload your photo.');
        }

        // Check IC & phone no format
        // Check Invalid Phone No Input (Number characters Only)
        if (!this.validateNumberOnly(this.state.phoneNo)) {
            Alert.alert("Invalid Phone Number", "Invalid phone number. Please ensure your phone number only contains number characters.");
            return;
        }

        if (!this.validateNumberOnly(this.state.postcode)) {
            Alert.alert("Invalid Postcode", "Invalid postcode. Please ensure your postcode only contains number characters.");
            return;
        }

        // Update the user profile after all validation passed
        this.updateProfileData2();
    }

    updateProfileData = async () => {
        this.setState({
            isLoading: true
        });

        // Get initial Data from route.params
        let initialData = this.state.profileData

        let dobString = this.state.birthYear + "-" + this.state.birthMonth + '-' + this.state.birthDay
        let data = {
            user_id: initialData.user_id,
            name: this.state.name,
            title: initialData.title,
            id_type: initialData.id_type,
            id_number: this.state.icPassport,
            gender: this.state.gender,
            DOB: dobString,
            occupation_cd: initialData.occupation_cd,
            mobile_no: this.state.phoneNo,
            email: initialData.email,
            home_address1: this.state.address1,
            home_address2: this.state.address2,
            home_address3: this.state.address3,
            district: this.state.city,
            state: this.state.state,
            country: initialData.country,
            postcode: this.state.postcode,
            id_img: initialData.id_img,
            nationality_cd: initialData.nationality_cd
        }

        let fileData = Object.entries(this.state.filePath).length === 0 ? this.state.picture : this.state.filePath.data;

        let body = [
            // element with property `filename` will be transformed into `file` in form data
            { name: 'file', filename: 'picture', data: fileData },
            // elements without property `filename` will be sent as plain text
            { name: 'txn_cd', data: 'MEDORDER019-2' },
            { name: 'tstamp', data: getTodayDate() },
            { name: 'data', data: JSON.stringify(data) },
        ]

        RNFetchBlob.fetch('POST', URL_Provider, {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
        }, body).then((response) => response.json()).
            then((responseJson) => {
                if (responseJson.status === "SUCCESS" || responseJson.status === "success") {
                    console.log(responseJson.status)
                    this.props.navigation.navigate("Account", { isProfileUpdated: true })
                } else {
                    console.log('Update User Profile Error: ', responseJson.status);
                    Alert.alert("Update User Profile Error", "Fail to update user profile, please try again.\n" + responseJson.status)
                }

            }).catch((error) => {
                console.log('Update User Profile Error: ', error);
                Alert.alert("Update User Profile Error", "Fail to update user profile, please try again.\n" + error)
                this.setState({
                    isLoading: false
                });
            })
    }

    updateProfileData2 = async () => {
        this.setState({
            isLoading: true
        });

        // Get initial Data from route.params
        let initialData = this.state.profileData

        let dobString = this.state.birthYear + "-" + this.state.birthMonth + '-' + this.state.birthDay

        // Update User Profile data (jlk_user_profile)
        let datas = {
            txn_cd: 'MEDORDER019',
            tstamp: getTodayDate(),
            data: {
                user_id: initialData.user_id,
                name: this.state.name,
                title: initialData.title,
                id_type: initialData.id_type,
                id_number: this.state.icPassport,
                gender: this.state.gender,
                DOB: dobString,
                occupation_cd: initialData.occupation_cd,
                mobile_no: this.state.phoneNo,
                email: initialData.email,
                home_address1: this.state.address1,
                home_address2: this.state.address2,
                home_address3: this.state.address3,
                district: this.state.city,
                state: this.state.state,
                country: initialData.country,
                postcode: this.state.postcode,
                picture: 'data:image/jpeg;base64,' + this.state.picture,
                id_img: initialData.id_img,
                nationality_cd: initialData.nationality_cd
            }
        }

        try {
            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json()

            if (json.status === 'success' || json.status === "SUCCESS") {
                // Return to Account Settings
                console.log(json.status)
                this.props.navigation.navigate("Account", { isProfileUpdated: true })
            } else {
                console.log('Update User Profile Error');
                console.log(json.status);
                Alert.alert("Update User Profile Error", "Fail to update user profile, please try again.\n" + json.status)
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Update User Profile Error: " + error)
            this.setState({
                isLoading: false
            });
            // handleNoInternet()
            Alert.alert("Update User Profile Error", "Fail to update user profile, please try again.\n" + error)
        }
    }

    /*
     *  Date Time Picker Handler  
     */
    handlePicker = (datetime) => {
        this.setState({
            isVisible: false,
            birthDay: moment(datetime).format('DD'),
            birthMonth: moment(datetime).format('MM'),
            birthYear: moment(datetime).format('YYYY'),
            date: moment(datetime).format("YYYY-MM-DD"), // undefined
        })
    }

    hidePicker = () => {
        this.setState({
            isVisible: false,
        })
    }

    showPicker = () => {
        this.setState({
            isVisible: true,
        })
    }

    formatTime = (time) => {
        return new Date(
            parseInt(moment(time).format("YYYY")),
            parseInt(moment(time).format("MM")) - 1,
            parseInt(moment(time).format("DD")),
        )
    }

    /*
     *  Image Picker Section  
     */
    changePhoto = async () => {
        if (Platform.OS === 'android') {
            var response = requestImagePickerPermission()
            if (response) {
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
                            picture: source.data
                        });

                    }
                });
            }
        }
    }

    render() {
        // View Loading if it is loading
        if (this.state.isLoading) {
            <Loader isLoading={this.state.isLoading} />
        }

        return (
            <ScrollView style={styles.pageContainer}>
                <View style={styles.headerContainer}>
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
                    <TouchableOpacity style={styles.changePhotoButton}
                        onPress={() => this.changePhoto()}
                    >
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.labelText}>Name</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.name}
                        maxLength={200}
                        onChangeText={(name) => this.setState({ name: name })} />

                    <Text style={styles.labelText}>IC/Passport Number</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.icPassport}
                        maxLength={30}
                        onChangeText={(icPassport) => this.setState({ icPassport: icPassport })} />

                    <Text style={styles.labelText}>Phone No</Text>
                    <TextInput style={styles.inputStyle}
                        keyboardType="numeric"
                        value={this.state.phoneNo}
                        maxLength={30}
                        onChangeText={(phoneNo) => this.setState({ phoneNo: phoneNo })} />

                    <Text style={styles.labelText}>Gender</Text>
                    <View style={styles.radioContainer}>
                        {
                            this.state.radioBtnsData.map((data, key) => {
                                return (
                                    <View key={key}>
                                        {this.state.checked == key ?
                                            <TouchableOpacity style={styles.radioButton}>
                                                <Image style={styles.radioImage} source={require("../img/radio_selected.png")} />
                                                <Text style={styles.radioLabel}>{data}</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => { this.setState({ checked: key, gender: data }) }} style={styles.radioButton}>
                                                <Image style={styles.radioImage} source={require("../img/radio_unselected.png")} />
                                                <Text style={styles.radioLabel}>{data}</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>)
                            })
                        }
                    </View>

                    <Text style={styles.labelText}>Date of Birth</Text>
                    <TouchableOpacity style={styles.bodPickerButton}
                        onPress={this.showPicker}>
                        <Text style={[styles.inputStyle, { marginRight: 11 }]}>{this.state.birthDay}</Text>
                        <Text style={[styles.inputStyle, { marginRight: 11 }]}>{this.state.birthMonth}</Text>
                        <Text style={[styles.inputStyle, { marginRight: 11 }]}>{this.state.birthYear}</Text>
                    </TouchableOpacity>

                    <DateTimePicker
                        isVisible={this.state.isVisible}
                        onConfirm={this.handlePicker}
                        onCancel={this.hidePicker}
                        mode={'date'}
                        date={this.formatTime(this.state.date)}
                        is24Hour={true}
                        datePickerModeAndroid={'spinner'}
                    />

                    <Text style={styles.labelText}>Address 1</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.address1}
                        maxLength={40}
                        onChangeText={(address) => this.setState({ address1: address })} />

                    <Text style={styles.labelText}>Address 2</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.address2}
                        maxLength={40}
                        onChangeText={(address) => this.setState({ address2: address })} />

                    <Text style={styles.labelText}>Address 3</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.address3}
                        maxLength={40}
                        onChangeText={(address) => this.setState({ address3: address })} />

                    <Text style={styles.labelText}>State</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={styles.pickerStyle}
                            // mode="dropdown"
                            label="Select State"
                            selectedValue={this.state.state}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ state: itemValue })
                            }
                            }>
                            <Picker.Item label="Johor" value={"Johor"} />
                            <Picker.Item label="Kedah" value={"Kedah"} />
                            <Picker.Item label="Kelantan" value={"Kelantan"} />
                            <Picker.Item label="Melaka" value={"Melaka"} />
                            <Picker.Item label="Negeri Sembilan" value={"Negeri Sembilan"} />
                            <Picker.Item label="Pahang" value={"Pahang"} />
                            <Picker.Item label="Pulau Pinang" value={"Pulau Pinang"} />
                            <Picker.Item label="Perak" value={"Perak"} />
                            <Picker.Item label="Perlis" value={"Perlis"} />
                            <Picker.Item label="Sabah" value={"Sabah"} />
                            <Picker.Item label="Sarawak" value={"Sarawak"} />
                            <Picker.Item label="Selangor" value={"Selangor"} />
                            <Picker.Item label="Terengganu" value={"Terengganu"} />
                            <Picker.Item label="Wilayah Persekutuan Kuala Lumpur" value={"Wilayah Persekutuan Kuala Lumpur"} />
                            <Picker.Item label="Wilayah Persekutuan Labuan" value={"Wilayah Persekutuan Labuan"} />
                            <Picker.Item label="Wilayah Persekutuan Putrajaya" value={"Wilayah Persekutuan Putrajaya"} />
                        </Picker>
                    </View>

                    <Text style={styles.labelText}>City</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={styles.pickerStyle}
                            // mode="dropdown"
                            label="Select City"
                            selectedValue={this.state.city}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ city: itemValue })
                            }
                            }>
                            { 
                                DISTRICT[this.state.state.replace(/\s+/g, '')].filter(function (value) {
                                    if (value === "All") {
                                        return false; // skip
                                    }
                                    return true;
                                }).map((district, index) => {
                                    return (
                                        <Picker.Item label={district} value={district} />
                                    )
                                })
                            }
                            <Picker.Item label='Others' value='Others' />
                        </Picker>
                    </View>

                    <Text style={styles.labelText}>Postcode</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.postcode}
                        maxLength={5}
                        onChangeText={(postcode) => this.setState({ postcode: postcode })} />

                    <TouchableOpacity style={styles.buttonSave}
                        onPress={() => this.handleSave()}>
                        <Text style={styles.buttonSaveText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({

    pageContainer: {
        marginLeft: 40,
        marginRight: 40,
        marginBottom: 20,
        marginTop: '15%',

    },

    headerContainer: {
        alignItems: "center",
    },

    inputContainer: {
        marginTop: 15,
    },

    changePhotoButton: {
        marginTop: 7,
    },

    changePhotoText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
        color: '#00A8F0',
    },

    labelText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#000000',
    },

    inputStyle: {
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 14,
        lineHeight: 16,
        color: '#7A7A7A',
        borderBottomWidth: 1,
        marginBottom: 20,
    },

    buttonSave: {
        paddingHorizontal: '40%',
        paddingVertical: 15,
        alignSelf: "center",
        borderRadius: 53,
        backgroundColor: '#FFD44E',
    },

    buttonSaveText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
        textAlign: "center",
        textAlignVertical: "center",
        color: '#FFFEFE',
    },

    radioContainer: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 20,
    },

    radioImage: {
        height: 20,
        width: 20,
        marginRight: 3,
    },

    radioButton: {
        flexDirection: 'row',
        marginRight: 20,
    },

    radioLabel: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        color: '#4A4A4A',
    },

    bodPickerButton: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 20,
    },

    bodText: {
        marginLeft: 5,
        marginRight: 5,
    },

    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        height: '30%',
        width: '80%',
        alignSelf: 'center',
        justifyContent: "center"
    },

    modalButtons: {
        borderTopWidth: 1,
    },

    modalInstructionText: {
        fontSize: 18,
        alignSelf: 'center',
        textAlign: 'center',
        padding: 10,
    },

    modalButtonTexts: {
        fontSize: 18,
        alignSelf: 'center',
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#00A8F0',
        padding: 10,
    },

    pickerContainer: {
        borderBottomWidth: 1,
        marginBottom: 20,
    },

    pickerStyle: {
        width: '100%',
        borderStyle: "solid",
        borderColor: "#ABABAB",
        // alignSelf: "center",
        // alignItems: 'center',
        // alignContent: 'center',
        // justifyContent: 'center',
        // textAlign: "center",
        // textAlignVertical: "center",

        color: '#000000',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 12,
        alignItems: 'center',
    },

})
