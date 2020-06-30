import React, { Component } from 'react';
import { Text, StyleSheet, View, Linking, Alert } from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import SystemSetting from 'react-native-system-setting';
import { requestLocationPermission } from '../util/permission/Permission';
import Geolocation from '@react-native-community/geolocation';
import { URL } from '../util/FetchURL';

export default class FindMap extends Component {

    constructor(props) {
        super(props)

        this.state = {
            currentLatitude: '',
            currentLongitude: '',
            region: {
                latitude: 4.2105,
                longitude: 101.9758,
                latitudeDelta: 4,
                longitudeDelta: 4,
            },
            markers: []
        }
    }

    componentDidMount() {
        this.checkPermission();
        this.getMarker();
    }

    checkPermission = async () => {
        if (Platform.OS === 'android') {
            await requestLocationPermission().then(response => {
                if (response === 'granted') {
                    SystemSetting.isLocationEnabled().then((enable) => {
                        const state = enable ? 'On' : 'Off';
                        if (state === 'Off') {
                            Alert.alert(
                                //title
                                'Enable Location Service',
                                //body
                                'Please enable location for better experience',
                                [
                                    { text: 'Cancel', onPress: () => { } },
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
                currentLatitude: JSON.stringify(position.coords.latitude),
                region: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }
            });

        },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });

    }

    getMarker = () => {
        let bodyData = {
            transactionCode: 'MAP',
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
                    let marker = [];
                    responseJson.data.forEach(element => {
                        let marketObject = {
                            name: element.hfc_name,
                            latlng: {
                                longitude: parseFloat(element.longitude),
                                latitude: parseFloat(element.latitude),
                            },
                            address: element.address,
                        };


                        marker.push(marketObject);

                    });

                    this.setState({
                        markers: marker,
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

    navigate = (latlng, label, address) => {
       
        var url = "geo:" + latlng.longitude + ", " + latlng.latitude + "?q=" + label + "+" + address;

        Linking.openURL(url);
    }


    render() {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', fontSize: 18, lineHeight: 25, fontWeight: '600', marginVertical: 15 }}> Map Location </Text>
                {/* <EntypoIcon name='map' size={30} color='#000000' /> */}
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={this.state.region}
                    showsUserLocation={true}
                >
                    {this.state.markers.map((marker, index) => (
                        <Marker
                            style={{ width: 50, height: 100 }}
                            key={index}
                            pinColor={'red'} //blue
                            coordinate={marker.latlng}
                            title={marker.name}
                            description={marker.address}
                            onCalloutPress={() => this.navigate(marker.latlng, marker.name, marker.address)}
                        />
                    ))}
                </MapView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1
    },
    map: {
        flex: 1
    },
})
