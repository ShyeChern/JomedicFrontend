import React, { Component } from 'react'
import { Text, StyleSheet, View, Button, TouchableOpacity } from 'react-native'

import { Avatar } from 'react-native-elements'
import Modal from "react-native-modal";

export default class IncomingCallModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            name: "",
            avatarUri: "",
            isLoading: false,
            isModalVisible: false,
        }
    }

    toggleModal = (name, uri) => {
        this.setState(prevState => ({
            isModalVisible: !prevState.isModalVisible
        }))

        if (!this.state.isModalVisible) {
            this.setState({
                name: name,
                avatarUri: uri
            });
        }
    };


    render() {
        return (
            <View>
                <Button onPress={() => this.toggleModal(this.state.name, this.state.uri)} title='Toggle Incoming Call' />

                {/* Modal (Pop up) View */}
                <Modal isVisible={this.state.isModalVisible}>
                    <View style={styles.popUpContainer}>
                        {/*Patient Avatar View */}
                        <View style={styles.avatarIcon}>
                            <Avatar
                                rounded
                                size='large'
                                source={{
                                    uri: this.state.avatarUri,
                                }}
                            />
                        </View>

                        {/*Patient Data View */}
                        <View style={styles.popUpContentContainer}>
                            <Text style={styles.popUpTitle}>{this.state.name}</Text>
                            <Text style={styles.popUpBody}>You have an incoming patient!</Text>
                        </View>

                        {/* Button View */}
                        <View style={styles.buttonBar}>
                            <TouchableOpacity
                                style={styles.buttonDecline}
                                onPress={() => this.toggleModal()}>
                                <Text style={{ fontSize: 18 }}>Decline</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.buttonAccept}
                                onPress={() => this.toggleModal()}>
                                <Text style={{ fontSize: 18, color: 'white' }}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        )
    }
}

const styles = StyleSheet.create({
        // For the Pop Up
        avatarIcon: {
            alignItems: 'center'
        },
        
        popUpContainer: {
            backgroundColor: 'white',
            paddingTop: 22,
            borderRadius: 15,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            height: '40%',
            width: '80%',
            alignSelf: 'center',
        },
    
        popUpContentContainer: {
            flex: 1,
        },
    
        popUpTitle: {
            fontStyle: 'normal',
            fontFamily: 'Open Sans',
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 16,
            color: '#000000',
            alignSelf: 'center',
            textAlign: 'center',
            padding: 10,
        },
    
        popUpBody: {
            fontStyle: 'normal',
            fontFamily: 'Open Sans',
            fontWeight: '600',
            fontSize: 18,
            lineHeight: 16,
            color: '#000000',
            alignSelf: 'center',
            textAlign: 'center',
            padding: 5,
        },
        
        buttonBar: {
            flexDirection: 'row',
        },
    
        buttonDecline: {
            flex: 1,
            alignItems: "center",
            padding: 15,
            borderBottomLeftRadius: 15,
        },
    
        buttonAccept: {
            backgroundColor: '#FFD54E',
            flex: 1,
            alignItems: "center",
            padding: 15,
            borderBottomRightRadius: 15,
        },
    
})
