import React, { Component } from 'react'
import { Text, TextInput, StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { Avatar } from 'react-native-elements'
import { Picker } from '@react-native-community/picker';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import Modal from "react-native-modal";

import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import Loader from './Loader'
import defaultAvatar from '../img/defaultAvatar.png'
import ImagePicker from 'react-native-image-crop-picker';


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
            address: '',
            city: '',
            state: '',

            // Radio Button Initalization, 0: Male, 1: Female
            radioBtnsData: ['Male', 'Female'],
            checked: 0,

            // Date Time Picker Data Initialization
            date: moment(),

            // Hold base64 image uris
            imageData: '',

        }
    }

    componentDidMount() {
        this.loadProfileData()
    }

    // Function to validate phone number syntax with RegEx 
    validatePhone = (phone) => {
        const regexp = /[^0-9]/;    // RegEx to Find any non numeric characters
        return !(regexp.test(phone));   // If there is non numeric characters, return false; else true
    }


    /*
     *  Data Processing Segments  
     */
    loadProfileData = () => {
        // Get the profile data from pervious screen
        let data = this.props.route.params.profileData

        this.setState({
            name: data.user_name,
            icPassport: data.id_number,
            phoneNo: data.mobile_no,
            gender: data.gender_cd,
            birthDay: moment(data.DOB).format("DD"),
            birthMonth: moment(data.DOB).format("MM"),
            birthYear: moment(data.DOB).format('YYYY'),
            address: data.home_address1,
            city: data.district,
            state: data.state,

            // For the Gender combo box, if MALE check 0, else check 1
            checked: data.gender_cd.toUpperCase() === "MALE" ? 0 : 1,

            // For DateTimePicker
            date: moment(data.DOB).format("YYYY-MM-DD"),

            // For avatar
            avatar: { uri: data.picture },
            imageData: data.picture,

        })

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

        if (!this.state.address || this.state.address.trim() === "") {
            Alert.alert("Empty Address", "Empty Address. Please enter your address.");
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

        // Check IC & phone no format
        // Check Invalid Phone No Input (Number characters Only)
        if (!this.validatePhone(this.state.phoneNo)) {
            Alert.alert("Invalid Phone Number", "Invalid phone number. Please ensure your phone number only contains number characters.");
            return;
        }

        // Update the user profile after all validation passed
        this.updateProfileData();
    }

    updateProfileData = async () => {
        this.setState({
            isLoading: true
        });

        // Get initial Data from route.params
        let initialData = this.props.route.params.profileData

        let dobString = this.state.birthYear + "-" + this.state.birthMonth + '-' + this.state.birthDay

        // Update User Profile sata (jlk_user_profile)
        let userProfileDatas = {
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
                home_address1: this.state.address,
                home_address2: initialData.home_address2,
                home_address3: initialData.home_address3,
                district: this.state.city,
                state: this.state.state,
                country: initialData.country,
                postcode: initialData.postcode,
                picture: this.state.imageData,
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
                body: JSON.stringify(userProfileDatas)

            });

            const json = await response.json()

            if (json.status === 'success' || json.status === "SUCCESS") {
                // Return to Account Settings
                console.log(json.status)
                this.props.navigation.goBack()
            } else {
                console.log('Update User Profile Error');
                console.log(json.status);

            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Update User Profile Error: " + error)
            this.setState({
                isLoading: false
            });
            handleNoInternet()
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
    toggleImagePickerModal = () => {
        this.setState(prevState => ({
            isImagePickerModalVisible: !prevState.isImagePickerModalVisible
        }))
    }

    ModalSelectFrom = () => {
        return (
            <Modal isVisible={this.state.isImagePickerModalVisible}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalInstructionText}>Select Image from</Text>
                    {/* Button View */}
                    <TouchableOpacity
                        style={[styles.modalButtons]}
                        onPress={() => this.pickSingleWithCamera()}
                    >
                        <Text style={styles.modalButtonTexts}>Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalButtons}
                        onPress={() => this.pickSingleBase64()}
                    >
                        <Text style={styles.modalButtonTexts}>Image Library</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalButtons}
                        onPress={() => this.toggleImagePickerModal()}
                    >
                        <Text style={styles.modalButtonTexts}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )
    }

    pickSingleBase64() {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
            includeBase64: true,
            includeExif: true,
            cropperCircleOverlay: true,
            sortOrder: 'none',
            compressImageMaxWidth: 1000,
            compressImageMaxHeight: 1000,
            compressImageQuality: 0.8,

        }).then(image => {
            this.setState({
                avatar: { uri: `data:${image.mime};base64,` + image.data, width: image.width, height: image.height },
                isImagePickerModalVisible: false,
                imageData: `data:${image.mime};base64,` + image.data,
            });

            // Flush the temp img caches
            this.cleanupImages();
        }).catch(error => console.log(error));
    }

    pickSingleWithCamera(mediaType = 'photo') {
        ImagePicker.openCamera({
            width: 300,
            height: 300,
            cropping: true,
            includeBase64: true,
            includeExif: true,
            mediaType,
            cropperCircleOverlay: true,
            compressImageQuality: 0.8,
        }).then(image => {
            this.setState({
                avatar: { uri: `data:${image.mime};base64,` + image.data, width: image.width, height: image.height },
                isImagePickerModalVisible: false,
                imageData: `data:${image.mime};base64,` + image.data,
            });

            // Flush the temnp img caches
            this.cleanupImages();
        }).catch(error => console.log(error));
    }

    cleanupImages() {
        ImagePicker.clean().then(() => {
            console.log('removed tmp images from tmp directory');
        }).catch(e => {
            alert(e);
        });
    }



    render() {
        // View Loading if it is loading
        if (this.state.isLoading) {
            <Loader isLoading={this.state.isLoading} />
        }

        return (
            <ScrollView style={styles.pageContainer}>
                <View style={styles.headerContainer}>
                    <Avatar rounded
                        size={100}
                        source={this.state.avatar} />
                    <TouchableOpacity style={styles.changePhotoButton}
                        onPress={() => this.toggleImagePickerModal()}
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

                    <Text style={styles.labelText}>Address</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.address}
                        maxLength={40}
                        onChangeText={(address) => this.setState({ address: address })} />

                    <Text style={styles.labelText}>City</Text>
                    <TextInput style={styles.inputStyle}
                        value={this.state.city}
                        maxLength={30}
                        onChangeText={(city) => this.setState({ city: city })} />

                    <Text style={styles.labelText}>State</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={styles.pickerStyle}
                            mode="dropdown"
                            selectedValue={this.state.state || "Johor"}
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
                            <Picker.Item label="W.P Kuala Lumpur" value={"W.P Kuala Lumpur"} />
                            <Picker.Item label="W.P Labuan" value={"W.P Labuan"} />
                            <Picker.Item label="W.P Putrajaya" value={"W.P Putrajaya"} />
                        </Picker>
                    </View>

                    <TouchableOpacity style={styles.buttonSave}
                        onPress={() => this.handleSave()}>
                        <Text style={styles.buttonSaveText}>Save</Text>
                    </TouchableOpacity>

                    <this.ModalSelectFrom />
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
        width: '75%',
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
