import React, { Component } from 'react';
import { Text, StyleSheet, View, Image, SafeAreaView, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCustomerId, logout } from "../util/Auth";
import { URL } from '../util/FetchURL';
import RNFetchBlob from 'rn-fetch-blob';

const SETTING = [
    {
        section: 'Help',
        data: [
            {
                Name: 'Contact Us',
                Navigate: 'ContactUs'
            },
            {
                Name: 'FAQ',
                Navigate: 'Faq'
            },
            {
                Name: 'User Manual',
                Navigate: 'UserManual'
            },
            
        ],
    },
    {
        section: 'Service',
        data: [
            {
                Name: 'Service History',
                Navigate: 'History'
            },
            {
                Name: 'Previous Chat',
                Navigate: 'PreviousChat'
            },
            {
                Name: 'Review',
                Navigate: 'Review'
            },
        ],
    },
    {
        section: 'Security & Login',
        data: [
            {
                Name: 'Change Password',
                Navigate: 'ChangePassword'
            },
            {
                Name: 'Logout',
                Navigate: 'WelcomePage'
            },
        ],
    },
];

SectionItem = ({ name, navigate, that }) => {
    let iconName = 'chevron-right';
    if (name === 'Logout') {
        iconName = 'logout';
    }

    return (
        <View style={[styles.itemView]}>
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center' }} onPress={() => {
                // or use name
                if (navigate === 'WelcomePage') {
                    that.logout();
                }
                else {
                    that.props.navigation.navigate(navigate);
                }
            }}>
                <Text style={[styles.sectionText, { marginLeft: 50 }]}>{name}</Text>
            </TouchableOpacity>
            <MaterialCommunityIcons style={{ alignSelf: 'center', marginRight: 20 }} name={iconName} size={30} color='#000000' />
        </View>
    )

}

export default class Profile extends Component {

    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
            name: '',
            picture: '',
            rating: 0,
            isLoading: false,
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });


        let bodyData = {
            transactionCode: 'SELFINFO',
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
                        rating: responseJson.data[0].rating,
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

    logout = async () => {
        this.setState({
            isLoading: true
        });

        let bodyData = {
            transactionCode: 'LOGOUT',
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
                this.setState({
                    isLoading: false
                });

                if (responseJson.result === true) {
                    logout()
                        .then(this.props.navigation.navigate('WelcomePage'))
                        .catch(error => alert(error));
                }
                else {
                    alert(responseJson.value);
                }

            })
            .catch((error) => {

                this.setState({
                    isLoading: false
                });

                alert(error);
            });
    }

    render() {
        if (this.state.isLoading) {

            return (
                <View>
                    <ActivityIndicator size='large' style={{ marginTop: 50 }}></ActivityIndicator>
                </View>
            )
        }
        else {

            return (
                <View style={[styles.container]}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItem: 'center', marginHorizontal: 30, marginTop: 30 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                {
                                    this.state.picture === '' ?
                                        <Image style={[styles.accountImage]}
                                        />
                                        //  source={require('../asset/img/welcome.png')}
                                        :
                                        <Image
                                            style={[styles.accountImage]}
                                            source={{
                                                uri: 'data:image/jpg;base64,' + this.state.picture,
                                            }}
                                        />
                                }

                            </View>
                            <View style={{ justifyContent: 'center', marginLeft: 15, marginRight: 30 }}>
                                <Text style={styles.labelText}>{this.state.name}</Text>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProfile')}>
                                    <Text style={{ fontSize: 12, lineHeight: 16, color: '#0019F5' }}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                            {/* <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name={'star'} size={30} color='#000000' />
                                <Text style={[styles.labelText, { marginLeft: 10 }]}>{this.state.rating === null ? '0' : (this.state.rating).toFixed(2)}</Text>
                            </View> */}
                        </View>
                    </View>
                    <View style={{ flex: 4, marginBottom: 20 }}>
                        <SafeAreaView style={{}}>
                            <SectionList
                                sections={SETTING}
                                keyExtractor={(item, index) => item + index}
                                renderItem={({ item }) => <SectionItem name={item.Name} navigate={item.Navigate} that={this} />}
                                renderSectionHeader={({ section: { section } }) => (
                                    <Text style={[styles.sectionText, { fontWeight: '600', marginVertical: 8, marginLeft: 15 }]}>{section}</Text>
                                )}
                            />
                        </SafeAreaView>
                    </View>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC'
    },
    accountImage: {
        width: 69,
        height: 69,
        borderRadius: 69 / 2,
        borderWidth: 1,
        borderColor: '#555555'
    },
    sectionText: {
        fontSize: 14,
        lineHeight: 19,
        color: '#4A4A4A'
    },
    itemView: {
        backgroundColor: '#FFFFFF',
        borderWidth: 0.5,
        borderColor: 'rgba(151, 151, 151, 0.248047)',
        height: 43,
        width: '100%',
        flexDirection: 'row'
    },
    labelText: {
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22
    },
    sectionItem: {

    }
})
