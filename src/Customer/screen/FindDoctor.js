import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList, Image, SafeAreaView, Alert, RefreshControl } from 'react-native';
import Modal from "react-native-modal";
import StatePickerModal from '../component/modal/StatePickerModal';
import SpecialtyPickerModal from '../component/modal/SpecialtyPickerModal';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import SystemSetting from 'react-native-system-setting';
import { requestLocationPermission } from '../util/permission/Permission';
import { getPreciseDistance } from 'geolib';
import Geolocation from '@react-native-community/geolocation';
import RNFetchBlob from 'rn-fetch-blob';
import { URL } from '../util/FetchURL';


// receive as object base on the declared variable
Doctor = ({ id, name, specialist, distance, picture, navigation }) => {
    return (
        <View style={[styles.doctorItemList]}>
            <Image style={[styles.doctorItemImage]} source={{ uri: 'data:image/jpg;base64,' + picture }} />
            <TouchableOpacity style={[styles.doctorItemTextView]}
                onPress={() => navigation.navigate('Doctor', { doctorId: id, picture: picture })}
            >
                <Text style={{ fontSize: 16, lineHeight: 22, color: '#4A4A4A' }}>{name}</Text>
                <Text style={{ fontSize: 12, lineHeight: 16, color: '#4A4A4A' }}>{specialist}</Text>
            </TouchableOpacity>
            {
                distance ?
                    <Text style={{ fontSize: 10, lineHeight: 12, color: '#4A4A4A', textAlign: 'right', margin: 10, alignSelf: 'flex-end' }}>
                        {distance} km
                    </Text>
                    :
                    <View />
            }
        </View >
    );
}

export default class FindDoctor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            state: 'Malaysia',
            allState: [],
            doctor: '',
            stateModal: false,
            doctorListHolder: [],
            doctorList: [],
            currentLongitude: '',
            currentLatitude: '',
            specialty: 'All',
            allSpecialty: [],
            specialtyModal: false,
            flatListLoading: true
        };
    }

    componentDidMount() {

        this.checkPermission();
        // db call to show doctor

        // 2nd database call to get state in lookup table
        let bodyData = {
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
                        allState.push(element.Description);
                    });

                    this.setState({
                        allState: allState
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
            await requestLocationPermission().then(response => {
                if (response !== 'granted') {
                    this.getDoctor();
                }
                else {
                    SystemSetting.isLocationEnabled().then((enable) => {
                        const state = enable ? 'On' : 'Off';
                        if (state === 'Off') {
                            Alert.alert(
                                //title
                                'Enable Location Service',
                                //body
                                'For better experience, you may enable the location service',
                                [
                                    { text: 'Cancel', onPress: () => { this.getDoctor() } },
                                    { text: 'Okay', onPress: () => { SystemSetting.switchLocation(() => { this.getCurrentLocation(); }) } },

                                ],
                                { cancelable: false }
                                //clicking out side of alert will  cancel
                            );
                        }
                        else {
                            this.getCurrentLocation();
                        }
                    });
                }
            });
        }
    }

    getCurrentLocation = () => {
        Geolocation.getCurrentPosition((position) => {
            this.setState({
                currentLongitude: JSON.stringify(position.coords.longitude),
                currentLatitude: JSON.stringify(position.coords.latitude)
            });
            this.getDoctor();
        },
            (error) => alert(error.message),
            // (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });

    }

    getDoctor = () => {

        let bodyData = {
            transactionCode: 'DOCTOR',
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
                    let doctor = [];
                    let specialty = ['All'];
                    responseJson.data.forEach(element => {
                        let doctorObject = {
                            id: element.tenant_id,
                            name: element.tenant_name,
                            specialist: element.specialty_cd,
                            state: element.tenant_state_cd,
                            longitude: element.longtitude,
                            latitude: element.latitude
                        };

                        if (element.picture !== null) {
                            let unitArray = new Uint8Array(element.picture.data);

                            const stringChar = unitArray.reduce((data, byte) => {
                                return data + String.fromCharCode(byte);
                            }, '');

                            doctorObject.picture = RNFetchBlob.base64.encode(stringChar);
                        }

                        doctor.push(doctorObject);
                        specialty.push(element.specialty_cd);

                    });

                    if (this.state.currentLongitude !== '' && this.state.currentLatitude !== '') {
                        doctor.sort((a, b) => {
                            const aDist = getPreciseDistance({
                                latitude: a.latitude,
                                longitude: a.longitude
                            }, {
                                latitude: this.state.currentLatitude,
                                longitude: this.state.currentLongitude,
                            })
                            a['distance'] = (aDist / 1000).toFixed(1);
                            const bDist = getPreciseDistance({
                                latitude: b.latitude,
                                longitude: b.longitude
                            }, {
                                latitude: this.state.currentLatitude,
                                longitude: this.state.currentLongitude,
                            })
                            b['distance'] = (bDist / 1000).toFixed(1);
                            return aDist - bDist;
                        });
                    }

                    this.setState({
                        doctorListHolder: doctor,
                        doctorList: doctor,
                        allSpecialty: Array.from(new Set(specialty)),
                        flatListLoading: false
                    });

                }
                else {
                    console.log(responseJson);
                }

            })
            .catch((error) => {
                alert(error);
            });
    }

    filterDoctorState = (state) => {
        const newData = this.state.doctorListHolder.filter(item => {
            if ((state === item.state || state == 'Malaysia') && (this.state.specialty === item.specialist || this.state.specialty === 'All')) {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = this.state.doctor.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            doctorList: newData,
            stateModal: !this.state.stateModal,
            state: state
        });
    }

    filterDoctorSpecialty = (specialty) => {
        const newData = this.state.doctorListHolder.filter(item => {
            if ((specialty === item.specialist || specialty == 'All') && (this.state.state === item.state || this.state.state === 'Malaysia')) {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = this.state.doctor.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            doctorList: newData,
            specialtyModal: false,
            specialty: specialty
        });
    }

    filterDoctorSearch = (doctor) => {
        const newData = this.state.doctorListHolder.filter(item => {
            if ((this.state.state === item.state || this.state.state === 'Malaysia') && (this.state.specialty === item.specialist || this.state.specialty === 'All')) {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = doctor.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            doctorList: newData,
            doctor: doctor
        });
    }


    render() {

        return (
            <View style={[styles.container]}>
                <Text style={{ fontSize: 18, lineHeight: 25, fontWeight: '600', textAlign: 'center', marginVertical: 20 }}> Find Doctor </Text>

                <Modal isVisible={this.state.stateModal}>
                    <StatePickerModal filterState={this.filterDoctorState} allState={this.state.allState} />
                </Modal>

                <Modal isVisible={this.state.specialtyModal}>
                    <SpecialtyPickerModal filterSpecialty={this.filterDoctorSpecialty} allSpecialty={this.state.allSpecialty} />
                </Modal>

                <View style={[styles.searchBox]}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity style={[styles.searchBoxIcon]}
                            onPress={() => this.doctor.focus()}
                        >
                            <FeatherIcon name='search' size={30} color='#000000' />
                        </TouchableOpacity>
                    </View>

                    <TextInput style={{ flex: 4, fontWeight: '300', fontSize: 14, lineHeight: 19 }}
                        value={this.state.doctor}
                        onChangeText={(doctor) => this.filterDoctorSearch(doctor)}
                        placeholder={'Enter Search Queries'}
                        ref={(doctor) => { this.doctor = doctor; }}
                    />

                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#A08A8A' }}>
                        <TouchableOpacity style={[styles.searchBoxIcon]}
                            onPress={() => this.setState({
                                stateModal: !this.state.stateModal
                            })}
                        >
                            <EntypoIcon name='location-pin' size={30} color='red' />
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 20, marginHorizontal: 12, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#555555' }]}>Location: </Text>
                        <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#000000' }]}>{this.state.state}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#555555' }]}>Specialty: </Text>
                        <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#000000' }]}>{this.state.specialty}</Text>
                    </View>

                    <TouchableOpacity style={{ justifyContent: 'center', marginRight: 10 }}
                        onPress={() => this.setState({
                            specialtyModal: !this.state.specialtyModal
                        })}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <MaterialCommunityIcon name={this.state.specialty === 'All' ? 'filter-outline' : 'filter'} size={25} />
                        </View>

                    </TouchableOpacity>
                </View>

                <SafeAreaView style={[styles.doctorItemListView]}>
                    <FlatList
                        data={this.state.doctorList}
                        refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                        renderItem={({ item }) =>
                            <Doctor id={item.id} name={item.name} specialist={item.specialist} distance={item.distance} picture={item.picture} navigation={this.props.navigation} />}
                        keyExtractor={item => item.id}
                    />
                </SafeAreaView>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1
    },
    searchBox: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#979797',
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center'
    },
    searchBoxIcon: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    doctorItemListView: {
        flex: 1
    },
    doctorItemList: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        flex: 1,
        marginVertical: 6,
        marginHorizontal: 12,
        borderTopWidth: 0.5,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderBottomWidth: 0.8
    },
    doctorItemImage: {
        width: '30%',
        height: 100
    },
    doctorItemTextView: {
        flex: 1,
        justifyContent: 'space-evenly',
        marginLeft: 15
    }

})
