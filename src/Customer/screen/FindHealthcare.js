import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Image, SafeAreaView, TextInput, Alert, RefreshControl } from 'react-native';
import Modal from 'react-native-modal';
import StatePickerModal from '../component/modal/StatePickerModal';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import SystemSetting from 'react-native-system-setting';
import { requestLocationPermission } from '../util/permission/Permission';
import { getPreciseDistance } from 'geolib';
import Geolocation from '@react-native-community/geolocation';
import RNFetchBlob from 'rn-fetch-blob';
import { URL } from '../util/FetchURL';


// receive as object base on the declared variable
Healthcare = ({ id, name, state, distance, photo, that }) => {
    return (
        <View style={[styles.healthcareItemList]}>
            <Image style={[styles.healthcareItemImage]} source={{ uri: 'data:image/jpg;base64,' + photo }} />
            <TouchableOpacity style={[styles.healthcareItemTextView]}
                onPress={() => that.props.navigation.navigate('Healthcare', { healthcareId: id, photo: photo })}>
                <Text style={{ fontSize: 16, lineHeight: 22, color: '#4A4A4A' }}>{name}</Text>
                <Text style={{ fontSize: 12, lineHeight: 16, color: '#4A4A4A' }}>{state}</Text>
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

export default class FindHealthcare extends Component {

    constructor(props) {
        super(props);
        this.state = {
            state: 'Malaysia',
            allState: [],
            healthcare: '',
            stateModal: false,
            healthcareListHolder: [], //id name state
            healthcareList: [],
            currentLongitude: '',
            currentLatitude: '',
            flatListLoading: true,
        };

    }

    componentDidMount() {
        this.checkPermission();

        // database call to get state in lookup table
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
                    this.getHealthcare();
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
                                    { text: 'Cancel', onPress: () => { this.getHealthcare() } },
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
            this.getHealthcare();
        },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });

    }

    getHealthcare = () => {
        // db call to display healthcare
        let bodyData = {
            transactionCode: 'HEALTHCARE',
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
                    let healthcare = [];
                    responseJson.data.forEach(element => {
                        let healthcareObject = {
                            id: element.hfc_cd,
                            name: element.hfc_name,
                            state: element.state_cd,
                            longitude: element.longitude,
                            latitude: element.latitude
                        };

                        if (element.logo !== null) {
                            let unitArray = new Uint8Array(element.logo.data);

                            const stringChar = unitArray.reduce((data, byte) => {
                                return data + String.fromCharCode(byte);
                            }, '');

                            healthcareObject.photo = RNFetchBlob.base64.encode(stringChar);
                        }

                        healthcare.push(healthcareObject);
                    });

                    if (this.state.currentLongitude !== '' && this.state.currentLatitude !== '') {
                        healthcare.sort((a, b) => {
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
                        healthcareListHolder: healthcare,
                        healthcareList: healthcare,
                        flatListLoading: false
                    });

                }
                else {
                    alert(responseJson);
                }

            })
            .catch((error) => {
                alert(error);
            });
    }

    filterHealthcareState = (state) => {
        const newData = this.state.healthcareListHolder.filter(item => {
            if (state === item.state || state === 'Malaysia') {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = this.state.healthcare.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            healthcareList: newData,
            stateModal: !this.state.stateModal,
            state: state
        });
    }

    filterHealthcareSearch = (healthcare) => {
        const newData = this.state.healthcareListHolder.filter(item => {
            if (this.state.state === item.state || this.state.state == 'Malaysia') {
                const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const textData = healthcare.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }
        });

        this.setState({
            healthcareList: newData,
            healthcare: healthcare
        });
    }

    render() {

        return (
            <View style={[styles.container]}>

                <Text style={{ fontSize: 18, lineHeight: 25, fontWeight: '600', textAlign: 'center', marginVertical: 20 }}> Find Healthcare Facility </Text>

                <Modal isVisible={this.state.stateModal}>
                    <StatePickerModal filterState={this.filterHealthcareState} allState={this.state.allState} />
                </Modal>

                <View style={[styles.searchBox]}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity style={[styles.searchBoxIcon]}
                            onPress={() => this.healthcare.focus()}
                        >
                            <FeatherIcon name='search' size={30} color='#000000' />
                        </TouchableOpacity>
                    </View>

                    <TextInput style={{ flex: 4, fontWeight: '300', fontSize: 14, lineHeight: 19 }}
                        value={this.state.healthcare}
                        onChangeText={(healthcare) => this.filterHealthcareSearch(healthcare)}
                        placeholder={'Enter Search Queries'}
                        ref={(healthcare) => { this.healthcare = healthcare; }}
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

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 20, marginHorizontal: 12 }}>
                    <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#555555' }]}>Location: </Text>
                    <Text style={[{ fontWeight: '600', fontSize: 16, lineHeight: 22, color: '#000000' }]}>{this.state.state}</Text>
                </View>


                <SafeAreaView style={[styles.healthcareItemListView]}>
                    <FlatList
                        data={this.state.healthcareList}
                        refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                        renderItem={({ item }) =>
                            <Healthcare id={item.id} name={item.name} state={item.state} distance={item.distance} photo={item.photo} that={this} />}
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
        flex: 1,
        backgroundColor: '#F5F5F5'
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
    healthcareItemListView: {
        flex: 1,
    },
    healthcareItemList: {
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
    healthcareItemImage: {
        width: '30%',
        height: 100
    },
    healthcareItemTextView: {
        flex: 1,
        justifyContent: 'space-evenly',
        marginLeft: 15
    }

})
