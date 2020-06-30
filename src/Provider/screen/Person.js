import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { ListItem, Avatar } from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient'
import { TouchableOpacity } from 'react-native-gesture-handler'

const GradientHeader = (props) => (
    <View style={{ backgroundColor: '#eee' }}>
        <LinearGradient
            colors={['#ffd54e', '#fdaa26']}
            style={[StyleSheet.absoluteFill, { height: Header.HEIGHT }]}
        >
            <Header {...props} />
        </LinearGradient>
    </View>
)

export default class Person extends Component {

    constructor(props) {
        super(props)
        this.state= {
            personData: this.props.personData,
        }
    }
    //     // Set the state directly. Use props if necessary.
    //     this.state = {
    //       loggedIn: false,
    //       currentState: "not-panic",

    //       // Note: think carefully before initializing
    //       // state based on props!
    //       someInitialValue: this.props.initialValue
    //     }

    render() {
        return (
            <View>
                {/* Header View */}
                <View style={styles.header}>
                    <Avatar rounded
                        size='large'
                        source={{uri: this.state.personData.picture}} />
                    <Text style={styles.textStyle}>
                        {this.state.personData.name}</Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        backgroundColor: '#ffd54e',
        paddingTop: 40,
        paddingBottom: 10,
    },

    textStyle: {
        color: 'white',
        fontSize: 20,
        // fontWeight: "bold",
        marginTop: 10,
        marginBottom: 10
    }
})
