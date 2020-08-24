import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, TextInput, FlatList, Image, SafeAreaView, Alert, RefreshControl, Platform } from 'react-native';
import Modal from "react-native-modal";
import StatePickerModal from '../component/modal/StatePickerModal';
import SpecialtyPickerModal from '../component/modal/SpecialtyPickerModal';
import DistrictPickerModal from '../component/modal/DistrictPickerModal';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import SystemSetting from 'react-native-system-setting';
import { requestLocationPermission } from '../util/permission/Permission';
import { getPreciseDistance } from 'geolib';
import Geolocation from '@react-native-community/geolocation';
import RNFetchBlob from 'rn-fetch-blob';
import FastImage from 'react-native-fast-image';
import { DISTRICT } from '../util/District';
import { URL } from '../util/FetchURL';

// receive as object base on the declared variable
Doctor = ({ id, name, specialist, distance, picture, status, navigation }) => {
    return (
        <View style={[styles.doctorItemList]}>
            <FastImage
                style={[styles.doctorItemImage]}
                source={{
                    uri: 'data:image/jpg;base64,' + picture,
                    priority: FastImage.priority.low,
                }}
            />
            {/* <Image style={[styles.doctorItemImage]} source={{ uri: 'data:image/jpg;base64,' + picture }} /> */}
            <TouchableOpacity style={[styles.doctorItemTextView]}
                onPress={() => navigation.navigate('Doctor', { doctorId: id, picture: picture })}
            >
                <Text style={{ fontSize: 16, lineHeight: 22, color: '#4A4A4A' }}>{name}</Text>
                <Text style={{ fontSize: 12, lineHeight: 16, color: '#4A4A4A' }}>{specialist}</Text>
                <Text style={{ fontSize: 12, lineHeight: 16, color: '#979797' }}>{status}</Text>
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
            district: 'All',
            districtModal: false,
            flatListLoading: true,
            endFlatList: false,
            firstTime: true,
        };
    }

    componentDidMount() {
        Promise.all([this.getDoctor(), this.checkPermission()]).then((value) => {

            if (value[1]) {
                this.sortByLocation();
            }

            this.setState({
                flatListLoading: false,
                doctorList: this.state.doctorListHolder
            });

            this.updateDoctorImage();
        });


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
                        if (element.Description != 'Luar Negara') {
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

            })
            .catch((error) => {
                alert(error);
            });
    }

    checkPermission = () => {

        return new Promise(async (resolve, reject) => {
            const getCurrentLocation = () => {
                Geolocation.getCurrentPosition((position) => {
                    this.setState({
                        currentLongitude: JSON.stringify(position.coords.longitude),
                        currentLatitude: JSON.stringify(position.coords.latitude)
                    });
                    resolve(true);
                },
                    (error) => {
                        alert(error.message);
                        resolve(false);
                    },
                    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });

            }

            if (Platform.OS === 'android') {
                await requestLocationPermission().then(response => {
                    if (response !== 'granted') {
                        resolve(false);
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
                                        { text: 'Cancel', onPress: () => { resolve(false); } },
                                        { text: 'Okay', onPress: () => { SystemSetting.switchLocation(() => { getCurrentLocation(); }) } },

                                    ],
                                    { cancelable: false }
                                    //clicking out side of alert will  cancel
                                );
                            }
                            else {
                                getCurrentLocation();
                            }
                        });
                    }
                });
            }
        })

    }

    getDoctor = () => {
        return new Promise((resolve, reject) => {
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
                                district: element.tenant_district_cd,
                                longitude: element.longtitude,
                                latitude: element.latitude,
                                picture: element.picture,
                                status: element.status,
                            };

                            doctor.push(doctorObject);
                            specialty.push(element.specialty_cd);

                        });

                        this.setState({
                            doctorListHolder: doctor,
                            allSpecialty: Array.from(new Set(specialty)),

                        });

                        resolve(true);
                    }
                    else {
                        alert(responseJson);
                        resolve(false);
                    }

                })
                .catch((error) => {
                    alert(error);
                    resolve(false);
                });
        })
    }

    updateDoctorImage = () => {
        let doctor = this.state.doctorListHolder;
        doctor.forEach(element => {
            if (element.picture !== null) {
                let unitArray = new Uint8Array(element.picture.data);

                const stringChar = unitArray.reduce((data, byte) => {
                    return data + String.fromCharCode(byte);
                }, '');

                element.picture = RNFetchBlob.base64.encode(stringChar);
            }
        });
        this.setState({
            doctorListHolder: doctor,
            doctorList: doctor,
        });
    }

    sortByLocation = () => {
        let doctor = this.state.doctorListHolder;
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

        this.setState({
            doctorListHolder: doctor,
            doctorList: doctor,
        });
    }

    filterDoctorState = (state) => {

        const newData = this.state.doctorListHolder.filter(item => {
            if ((state === item.state || state == 'Malaysia') && (this.state.specialty === item.specialist || this.state.specialty === 'All')
                && (this.state.district === item.district || this.state.district === 'All')) {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = this.state.doctor.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            doctorList: newData,
            stateModal: false,
            state: state,
        });


        if (DISTRICT[state.replace(/\s+/g, '')].length != 1) {
            this.setState({
                districtModal: true,
            })
        }
        else {
            this.setState({
                district: 'All',
            })
        }

        if (newData.length == 0) {
            this.setState({ endFlatList: true })
        }
    }

    filterDoctorDistrict = (district) => {
        const newData = this.state.doctorListHolder.filter(item => {
            if ((this.state.state === item.state || this.state.state == 'Malaysia') && (this.state.specialty === item.specialist || this.state.specialty === 'All')
                && (district === item.district || district === 'All')) {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = this.state.doctor.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            doctorList: newData,
            district: district,
            districtModal: false,
        });

        if (newData.length == 0) {
            this.setState({ endFlatList: true })
        }
    }

    filterDoctorSpecialty = (specialty) => {
        const newData = this.state.doctorListHolder.filter(item => {
            if ((specialty === item.specialist || specialty == 'All') && (this.state.state === item.state || this.state.state === 'Malaysia')
                && (this.state.district === item.district || this.state.district === 'All')) {
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

        if (newData.length == 0) {
            this.setState({ endFlatList: true })
        }
    }

    filterDoctorSearch = (doctor) => {
        const newData = this.state.doctorListHolder.filter(item => {
            if ((this.state.state === item.state || this.state.state === 'Malaysia') && (this.state.specialty === item.specialist || this.state.specialty === 'All')
                && (this.state.district === item.district || this.state.district === 'All')) {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = doctor.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            doctorList: newData,
            doctor: doctor
        });

        if (newData.length == 0) {
            this.setState({ endFlatList: true })
        }
    }

    backStateModal = () => {
        this.setState({
            stateModal: true,
            districtModal: false
        });
    }

    closeModal = () => {
        this.setState({
            stateModal: false,
            specialtyModal: false,
            districtModal: false
        });
    }


    render() {
        if (this.state.specialty !== 'All' || this.state.state !== 'Malaysia' || this.state.doctor !== '') {
            this.props.navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity style={{ marginRight: 10 }}
                        onPress={() => {
                            this.setState({
                                doctor: '',
                                state: 'Malaysia',
                                specialty: 'All',
                                district: 'All',
                                doctorList: this.state.doctorListHolder
                            })
                        }}
                    >
                        <MaterialCommunityIcon name={'filter-remove'} size={25} />
                    </TouchableOpacity>
                ),
            });
        }
        else {
            this.props.navigation.setOptions({
                headerRight: () => null
            });
        }

        return (
            <View style={[styles.container]}>
                <Text style={{ fontSize: 18, lineHeight: 25, fontWeight: '600', textAlign: 'center', marginVertical: 20 }}> Find Doctor </Text>

                <Modal isVisible={this.state.stateModal}>
                    <StatePickerModal filterState={this.filterDoctorState} allState={this.state.allState} closeModal={this.closeModal} />
                </Modal>

                <Modal isVisible={this.state.specialtyModal}>
                    <SpecialtyPickerModal filterSpecialty={this.filterDoctorSpecialty} allSpecialty={this.state.allSpecialty} closeModal={this.closeModal} />
                </Modal>

                <Modal isVisible={this.state.districtModal}>
                    <DistrictPickerModal filterDistrict={this.filterDoctorDistrict} state={this.state.state} district={DISTRICT[this.state.state.replace(/\s+/g, '')]}
                        backStateModal={this.backStateModal} closeModal={this.closeModal} />
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
                        placeholder={'Enter Doctor Name'}
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

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 15, marginHorizontal: 12, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#555555' }]}>Location: </Text>
                        <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#000000' }]}>{this.state.district === 'All' ? this.state.state : this.state.district + ', ' + this.state.state}</Text>
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
                    {
                        this.state.firstTime ?
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                {/* <Text style={[styles.setButtonText, { color: '#000000' }]}>Current Location : {this.state.district === 'All' ? this.state.state : this.state.district + ', ' + this.state.state}</Text>
                                <TouchableOpacity style={styles.setButton}
                                    onPress={() => this.setState({ stateModal: true })}>
                                    <Text style={styles.setButtonText}>Set Location</Text>
                                </TouchableOpacity>
                                <Text style={[styles.setButtonText, { color: '#000000' }]}>Current Specialty : {this.state.specialty}</Text>
                                <TouchableOpacity style={styles.setButton}
                                    onPress={() => this.setState({ specialtyModal: true })}>
                                    <Text style={styles.setButtonText}>Set Specialty</Text>
                                </TouchableOpacity> */}
                                <Text style={[styles.setButtonText, { color: '#000000' }]}>You may search doctor by enter their name or select the location and specialty</Text>
                                <TouchableOpacity style={[styles.setButton, { borderRadius: 50, marginTop: 20, width: '40%' }]}
                                    onPress={() => this.setState({ firstTime: false })}>
                                    <Text style={styles.setButtonText}>Search</Text>
                                </TouchableOpacity>
                            </View>

                            :

                            <FlatList
                                data={this.state.doctorList}
                                refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                                renderItem={({ item }) =>
                                    <Doctor id={item.id} name={item.name} specialist={item.specialist} distance={item.distance} picture={item.picture} status={item.status} navigation={this.props.navigation} />}
                                keyExtractor={item => item.id}
                                extraData={this.state}
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                onEndReached={() => this.setState({ endFlatList: true })}
                                onEndReachedThreshold={0.1}
                                ListFooterComponent={() => <Text style={styles.flatListFooter}>{this.state.endFlatList ? 'End of List' : this.state.flatListLoading ? '' : 'Loading...'}</Text>}
                            />
                    }

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
        height: 100,
        backgroundColor: '#D8D8D8'
    },
    doctorItemTextView: {
        flex: 1,
        justifyContent: 'space-evenly',
        marginLeft: 15
    },
    flatListFooter: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 7,
        color: '#979797'
    },
    setButton: {
        backgroundColor: '#FFD44E',
        width: '35%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10
    },
    setButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        textAlign:'center'
    }

})
