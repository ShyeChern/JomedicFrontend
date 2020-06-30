import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AirbnbRating } from 'react-native-elements';
import { URL } from '../util/FetchURL';

export default class Healthcare extends Component {

    constructor(props) {
        super(props);
        this.state = {
            healthcare: '',
            address: '',
            infoView: false,
            rating: 0,
            reviewsCount: 0,
            phoneNumber: '',
            contactPerson: '',
            longtitude: '',
            latitude: '',
            about: '',
            establishedDate: '',
            directorName: '',
            email: '',
            faxNo: '',
            photo: this.props.route.params.photo,
        }


    }

    componentDidMount() {
        let bodyData = {
            transactionCode: 'HEALTHCAREDETAIL',
            timestamp: new Date(),
            data: {
                HealthcareId: this.props.route.params.healthcareId
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

                    this.setState({
                        healthcare: responseJson.data[0].hfc_name,
                        address: responseJson.data[0].address,
                        phoneNumber: responseJson.data[0].telephone_no,
                        contactPerson: responseJson.data[0].contact_person,
                        establishedDate: responseJson.data[0].established_date,
                        directorName: responseJson.data[0].director_name,
                        email: responseJson.data[0].email,
                        faxNo: responseJson.data[0].fax_no,
                        longtitude: responseJson.data[0].longitude,
                        latitude: responseJson.data[0].latitude,
                        rating: Math.round(responseJson.data[0].rating),
                        reviewsCount: responseJson.data[0].review_count
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

    navigate = () => {
        const longtitude = this.state.longtitude;
        const latitude = this.state.latitude;
        const label = this.state.healthcare;
        const address = this.state.address;

        var url = "geo:" + longtitude + ", " + latitude + "?q=" + label + "+" + address;

        Linking.openURL(url);
    }

    infoView = () => {
        if (!this.state.infoView) {
            return (
                <View style={{ flex: 7 }}>
                    <View style={[styles.contentView]}>

                        <TouchableOpacity style={{ alignSelf: 'flex-end', marginHorizontal: 20 }}
                            onPress={() => this.setState({ infoView: !this.setState.infoView })}>
                            <IconMaterialCommunityIcons name='information-outline' size={35} color='#FBB03B' />
                        </TouchableOpacity>

                        <Text style={[styles.textInfo, { color: '#000000' }]}>Rating</Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <AirbnbRating isDisabled={true} defaultRating={this.state.rating} showRating={false}
                                onFinishRating={(rating) => this.setState({ rating })} size={30} />
                            <Text style={[styles.textInfo, { color: '#4A4A4A', marginHorizontal: 10, marginVertical: 5 }]}>{this.state.reviewsCount} Reviews</Text>
                        </View>

                        <Text style={[styles.textInfo, { color: '#000000' }]}>Contact Person</Text>
                        <Text style={[styles.textInfo, { color: '#595959' }]}>{this.state.contactPerson}</Text>
                        <Text style={[styles.textInfo, { color: '#000000' }]}>Phone Number</Text>
                        <Text style={[styles.textInfo, { color: '#595959' }]}>{this.state.phoneNumber}</Text>
                    </View>

                    <View style={[styles.actionBtnView]}>
                        <TouchableOpacity style={[styles.actionBtn]}
                            onPress={() =>
                                this.props.navigation.navigate('HealthcareDoctor', {
                                    healthcareId: this.props.route.params.healthcareId,
                                    healthcare: this.state.healthcare
                                })
                            }
                        >
                            <Text style={[styles.textInfo, { color: '#FFFEFE' }]}>DOCTOR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        else {
            return (
                <View style={{ flex: 7, marginHorizontal: 20 }}>
                    <TouchableOpacity style={{ marginTop: 5 }}
                        onPress={() => this.setState({ infoView: !this.state.infoView })}>
                        <IconAntDesign name='arrowleft' size={30} color='#4A4A4A' />
                    </TouchableOpacity>

                    <ScrollView>

                        <Text style={[styles.textInfo, styles.textLabel]}>Established Date</Text>
                        <Text style={[styles.textInfo, styles.textDescription]}>{this.state.establishedDate}</Text>
                        <Text style={[styles.textInfo, styles.textLabel]}>Director Name</Text>
                        <Text style={[styles.textInfo, styles.textDescription]}>{this.state.directorName}</Text>
                        <Text style={[styles.textInfo, styles.textLabel]}>Healthcare Email</Text>
                        <Text style={[styles.textInfo, styles.textDescription]}>{this.state.email}</Text>
                        <Text style={[styles.textInfo, styles.textLabel]}>Fax No</Text>
                        <Text style={[styles.textInfo, styles.textDescription]}>{this.state.faxNo}</Text>
                    </ScrollView>
                </View>
            )
        }
    }

    render() {

        return (
            <View style={[styles.container]}>
                <View style={[styles.imageView]}>
                    <Image style={[styles.mainMenuImage]} source={{ uri: 'data:image/jpg;base64,' + this.state.photo }} />
                </View>
                <View style={[styles.locationView]}>
                    <View style={[styles.locationTextView]}>
                        <Text style={{ fontWeight: '600', fontSize: 18, lineHeight: 25, textAlign: 'center', color: '#FFFFFF' }}>{this.state.healthcare}</Text>
                        <Text style={{ fontSize: 12, lineHeight: 16, textAlign: 'center', color: '#FFFFFF' }}>{this.state.address}</Text>
                    </View>
                    <View style={[styles.locationNavigateBtnView]}>
                        <TouchableOpacity style={[styles.locationNavigateBtn]}
                            onPress={() => this.navigate()}>
                            <IconFontisto name='navigate' size={40} color='#FFFFFF' />
                        </TouchableOpacity>
                    </View>
                </View>

                {this.infoView()}

            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        flex: 1,
        backgroundColor: '#FCFCFC'
    },
    imageView: {
        flex: 3,
        alignItems: 'center'
    },
    mainMenuImage: {
        width: '100%',
        height: '100%'
    },
    locationView: {
        flex: 2,
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#FBB03B'
    },
    locationTextView: {
        flex: 3,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginLeft: 15
    },
    locationNavigateBtnView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    locationNavigateBtn: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentView: {
        flex: 5,
        marginLeft: 45,
        justifyContent: "space-around"
    },
    textInfo: {
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '600'
    },
    textLabel: {
        color: '#000000',
        marginLeft: 40,
        marginVertical: 5
    },
    textDescription: {
        color: '#595959',
        marginLeft: 50,
        marginVertical: 5
    },
    actionBtnView: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionBtn: {
        backgroundColor: '#FFD54E',
        borderRadius: 50,
        width: '70%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
