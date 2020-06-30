import React, { Component } from 'react';
import { Text, StyleSheet, View, Linking, Platform, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import Icon from 'react-native-vector-icons/MaterialIcons'

// using icons: "my-location" and "location-on"

import { requestLocationPermission } from '../util/permission';

export default class Map extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isUserLocationKnown: false,
            isFocusTarget: false,
            isFocusUser: true,

            // For map initialization
            userLocationCoordinate: {
                latitude: 0,
                longitude: 0
            },

            // To get address of customer
            targetAddress: '',
            targetCoordinate: {
                latitude: 0,
                longitude: 0
            },

            // To finalize the region of map view
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.09,
            longitudeDelta: 0.035
        }
    }

    componentDidMount() {
        this.getUserLocation()
        this.getTargetCoordinate()
    }

    getTargetCoordinate = () => {
        var targetAddress = this.props.route.params.address

        Geocoder.init("AIzaSyDXcD_2oUm9g9kerAE_yS-uPmRVEhCXviU")    // Change to biocore API later
        Geocoder.from(targetAddress)
            .then(json => {
                var location = json.results[0].geometry.location;

                var targetLocation = {
                    latitude: location.lat,
                    longitude: location.lng
                }

                this.setState({
                    targetCoordinate: targetLocation,
                    targetAddress: targetAddress
                })

                if (!this.state.isUserLocationKnown) {
                    this.setState({
                        latitude: targetLocation.latitude,
                        longitude: targetLocation.longitude
                    })
                }
            })
            .catch(error => console.log(error));
    }

    getUserLocation = () => {
        var locationPermission = requestLocationPermission()

        if (locationPermission) {
            Geolocation.getCurrentPosition(
                (position) => {
                    var userPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                    this.setState({
                        userLocationCoordinate: userPosition,
                        isUserLocationKnown: true,
                        latitude: userPosition.latitude,
                        longitude: userPosition.longitude,
                    })
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }
    }

    callMapApplicationDirections = () => {
        var target = this.state.targetCoordinate
        var user = this.state.userLocationCoordinate

        const scheme = Platform.select({
            ios: 'http://maps.apple.com/maps?',
            android: 'http://maps.google.com/maps?'
        });

        const saddr = "saddr=" + user.latitude + "," + user.longitude
        const daddr = "daddr=" + target.latitude + "," + target.longitude

        const url = Platform.select({
            ios: scheme + saddr + "&" + daddr,
            android: scheme + saddr + "&" + daddr
        })

        Linking.openURL(url)

        // Example link for directions: http://maps.google.com/maps?saddr=3.0873654,101.6827467&daddr=3.0890557,101.6815309
    }

    handleOnRegionChangeCompleted = (region) => {
        this.setState({
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta
        })

    }

    focusUser = () => {
        var user = this.state.userLocationCoordinate
        this.setState({
            latitude: user.latitude,
            longitude: user.longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta
        })

    }

    focusTarget = () => {
        var target = this.state.targetCoordinate
        this.setState({
            latitude: target.latitude,
            longitude: target.longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta
        })
    }


    render() {

        return (
            <View style={styles.overallViewContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true} // Need to ask user permission before obtaining user location
                    region={{
                        latitude: this.state.latitude,
                        longitude: this.state.longitude,
                        latitudeDelta: this.state.latitudeDelta,
                        longitudeDelta: this.state.longitudeDelta
                    }}
                    onRegionChangeComplete={region => this.handleOnRegionChangeCompleted(region)}
                >
                    {/* Set the marker (Target Address) */}
                    <Marker
                        coordinate={this.state.targetCoordinate}
                    >
                        <Callout onPress={this.callMapApplicationDirections}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>Customer's Address</Text>
                                <Text style={styles.calloutAddress}>{this.state.targetAddress}</Text>
                            </View>
                        </Callout>
                    </Marker>
                </MapView>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.focusUser}
                        disabled={!this.state.isUserLocationKnown}
                    >
                        <Icon name={"my-location"} size={30} color={'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.focusTarget}
                    >
                        <Icon name={"location-on"} size={30} color={'white'}/>
                    </TouchableOpacity>
                </View>
            </View >
        )
    }
}

const styles = StyleSheet.create({
    overallViewContainer: {
        position: 'relative',
        height: '100%',
        width: '100%',
    },

    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },

    calloutContainer: {
    },

    calloutTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
    },

    calloutAddress: {
        textAlign: 'center',
        alignSelf: 'center',
    },

    buttonContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        margin: 10,
    },

    button: {
        backgroundColor: '#FFD54E',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.75,
        shadowRadius: 1,
        shadowColor: 'gray',
        shadowOffset: { height: 0, width: 0 },
        padding: 15,
        margin: 5
    },
})
