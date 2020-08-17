import React, { Component } from 'react';
import { Text, StyleSheet, View, Platform, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import RNFetchBlob from 'rn-fetch-blob';

const MANUALDATA = [
    {
        id: '1',
        manual: 'Sign Up as Jomedic User',
        step: 'Step 1: Go to sign up screen, enter all the detail and click sign up button.\n\nStep 2: If all the detail entered correctly, you will be redirect back to the welcome page. Else, you will be prompt which input field is error ',
    },
    {
        id: '2',
        manual: 'Reset Password',
        step: "Step 1: Go to forget password screen enter your email address and tap submit button.\n\nStep 2: Answer your account secret question that you set during the account registration.\n\nStep 3: If your secret answer is correct, check your email for new password.",
    },
    {
        id: '3',
        manual: 'Make Live Chat Request',
        step: 'Step 1: Go to doctor screen, tap on live chat button and tap confirm.\n\nStep 2: After doctor confirm your request, a notification will pop out in your phone.\n\nStep 3: Go to Jomedic tab’s current chat service and tap the doctor in the list.\n\nStep 4: You may start to chat with doctor now.',
    },
    {
        id: '4',
        manual: 'Make Video Consultation Request',
        step: 'Step 1: Go to doctor screen, tap on video consultation button and tap confirm.\n\nStep 2: Wait for doctor to connect and chat with you.',
    },
    {
        id: '5',
        manual: 'Make Appointment',
        step: 'Step 1: Go to doctor screen, tap on appointment button and tap confirm.\n\nStep 2: Choose your appointment date and time and tap make appointment.\n\nStep 3: You will be redirect to Jomedic appointment tab and your appointment will be listed in the appointment list.\n\nStep 4: You can connect to the doctor once the appointment time reached.',
    }
]

UM = ({ id, manual, step, that }) => {
    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50 }}
                onPress={() => {
                    let show = that.state.manualShow;
                    show[id] = !show[id];
                    that.setState({
                        manualShow: show
                    });
                }}
            >
                <Text style={[styles.text, { marginLeft: 10 }]}>{manual}</Text>
                <EntypoIcon style={{ marginRight: 10 }} name={that.state.manualShow[id] ? 'chevron-up' : 'chevron-down'} color={'#000000'} size={25} />
            </TouchableOpacity>

            {
                that.state.manualShow[id] ?
                    <View style={{ backgroundColor: '#FCFCFC' }}>
                        <Text style={[styles.text, { marginLeft: 10 }]}>{step}</Text>
                    </View>
                    :
                    <View />
            }

        </View >
    );
}

export default class UserManual extends Component {
    constructor(props) {
        super(props)

        this.state = {
            url: 'https://jomedic.000webhostapp.com/JomedicUserManual.pdf',
            manualShow: {},
        }
    }

    componentDidMount() {
        let manual = {}

        MANUALDATA.forEach((value, index) => {
            manual[index + 1] = false;
        });

        this.setState({
            manualShow: manual
        });
    }

    download = () => {
        const dirs = RNFetchBlob.fs.dirs;
        const android = RNFetchBlob.android;
        RNFetchBlob.config({
            fileCache: true,
            addAndroidDownloads: {
                useDownloadManager: true,
                mime: 'application/pdf',
                notification: true,
                mediaScannable: true,
                title: 'Jomedic User Manual',
                description: 'Downloading User Manual',
                path:dirs.DownloadDir+'/usermanual.pdf'
            },
        })
            .fetch('GET', this.state.url, { 'Cache-Control': 'no-store' })
            .then((res) => {
                // to be test on other device
                // if (Platform.OS = 'android') {
                //     android.actionViewIntent(res.path(), 'application/pdf')
                // }
            })
            .catch((e) => {
                console.log(e);
            });
    }


    render() {

        return (
            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, lineHeight: 22, margin: 10 }}> User Manual </Text>
                <SafeAreaView style={{ flex: 1, marginVertical: 15 }}>
                    <FlatList
                        data={MANUALDATA}
                        renderItem={({ item }) => <UM id={item.id} manual={item.manual} step={item.step} that={this} />}
                        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#000000' }}></View>}
                        keyExtractor={item => item.id}
                        ListFooterComponent={
                            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => this.download()}>
                                <Text style={{ color: '#0000FF', textDecorationLine: 'underline', fontStyle: 'italic' }}>Download Jomedic User Manual (with diagrams)</Text>
                            </TouchableOpacity>
                        }
                        ListFooterComponentStyle={{ marginTop: 10 }}
                    />
                </SafeAreaView>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    text: {
        fontSize: 16,
        lineHeight: 22
    }
})
