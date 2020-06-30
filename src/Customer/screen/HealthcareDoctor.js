import React, { Component } from 'react';
import { Text, StyleSheet, View, SafeAreaView, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Picker } from '@react-native-community/picker';
import RNFetchBlob from 'rn-fetch-blob';
import { URL } from '../util/FetchURL';

Healthcaredoctor = ({ id, name, specialist, picture, navigation }) => {
    return (
        <View style={[styles.healthcareDoctorList]}>
            <Image style={[styles.healthcareDoctorImage]} source={{ uri: 'data:image/jpg;base64,' + picture }} />
            <TouchableOpacity style={[styles.healthcareDoctorTextView]}
                onPress={() => navigation.navigate('Doctor', { doctorId: id, picture: picture })}>
                <Text style={{ fontWeight: '600', fontSize: 16, lineHeight: 22 }}>{name}</Text>
                <Text style={{ fontSize: 12, lineHeight: 16 }}>{specialist}</Text>
            </TouchableOpacity>
        </View >
    );
}

export default class HealthcareDoctor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            healthcare:this.props.route.params.healthcare,
            specialist: '',
            allSpecialist: [],
            doctorListHolder: [],
            doctorList: [],
            flatListLoading: true
        }

    }

    componentDidMount() {
        let bodyData = {
            transactionCode: 'HEALTHCAREDOCTOR',
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
                    let doctor = [];
                    let allSpecialist = [];
                    responseJson.data.forEach(element => {

                        let doctorObject = {
                            id: element.tenant_id,
                            name: element.tenant_name,
                            specialist: element.specialty_cd
                        };

                        if (element.picture !== null) {
                            let unitArray = new Uint8Array(element.picture.data);

                            const stringChar = unitArray.reduce((data, byte) => {
                                return data + String.fromCharCode(byte);
                            }, '');

                            doctorObject.picture = RNFetchBlob.base64.encode(stringChar);
                        }

                        doctor.push(doctorObject);
                        allSpecialist.push(element.specialty_cd);

                    });

                    this.setState({
                        doctorListHolder: doctor,
                        doctorList: doctor,
                        allSpecialist: allSpecialist,
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

    filterDoctor = (specialist) => {
        if (specialist == 'All') {
            this.setState({
                specialist: specialist,
                doctorList: this.state.doctorListHolder
            });
        }
        else {
            const newData = this.state.doctorListHolder.filter(item => {
                if (specialist === item.specialist) {
                    const itemData = item.specialist ? item.specialist.toUpperCase() : ''.toUpperCase();
                    const textData = specialist.toUpperCase();
                    return itemData.indexOf(textData) > -1;
                }
            });
            this.setState({
                specialist: specialist,
                doctorList: newData
            });
        }
    }

    render() {
        let allSpecialist = this.state.allSpecialist.map((value, index) => {
            return <Picker.Item key={index} label={value} value={value} />
        });

        return (
            <View style={[styles.container]}>

                <Text style={{ fontWeight: '600', fontSize: 18, lineHeight: 25, alignSelf: 'center', marginVertical: 20 }}> {this.state.healthcare} </Text>

                <View style={[styles.specialistPickerView]}>
                    <Picker style={{ width: '70%' }}
                        selectedValue={this.state.specialist}
                        onValueChange={(itemValue, itemIndex) => this.filterDoctor(itemValue)}
                    >
                        <Picker.Item label='Select Specialist' value='All' color="grey" />
                        {allSpecialist}
                    </Picker>
                </View>

                <SafeAreaView style={[styles.healthcareDoctorListView]}>
                    <FlatList
                        data={this.state.doctorList}
                        refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                        renderItem={({ item }) => 
                        <Healthcaredoctor id={item.id} name={item.name} specialist={item.specialist} picture={item.picture} navigation={this.props.navigation} />}
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
        backgroundColor: '#FCFCFC'
    },
    specialistPickerView: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        width: '70%',
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderRadius: 40,
        marginBottom: 30
    },
    healthcareDoctorListView: {
        flex: 1,
        marginTop: 5
    },
    healthcareDoctorList: {
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
    healthcareDoctorImage: {
        width: '30%',
        height: 100
    },
    healthcareDoctorTextView: {
        flex: 1,
        justifyContent: 'space-evenly',
        marginLeft: 15
    }
})
