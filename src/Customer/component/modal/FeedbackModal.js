import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, TextInput } from 'react-native'
import { AirbnbRating } from 'react-native-elements';

export default class FeedbackModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            rating: '0',
            comment: '',
            commentRemaindingLength: 100,
            feedbackSelected: { Execellent: false, FastResponse: false, Helpful: false, Kind: false, Efficient: false },
        }
    }

    feedbackModal = () => {
        let feedback = { rating: this.state.rating, comment: this.state.comment, feedbackSelected: this.state.feedbackSelected };
        this.props.submitFeedbackModal(feedback);
    }

    render() {
        return (
            <View style={[styles.modalBackground, { height: 300 }]}>

                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontWeight: '600', fontSize: 14, lineHeight: 19, color: '#000000',
                        textAlign: 'center', margin: 10
                    }}>
                        How was your chat with the doctor?
                            </Text>
                    <AirbnbRating defaultRating={0} showRating={false} size={30}
                        onFinishRating={(rating) => this.setState({ rating })}
                    />

                    <View style={[styles.feedbackModalView]}>
                        {
                            Object.keys(this.state.feedbackSelected).map((key, index) => {
                                return (
                                    <TouchableOpacity key={index} style={[styles.feedbackModalBtn,
                                    { backgroundColor: this.state.feedbackSelected[key] ? '#FFD44E' : '#FFFFFF' }]}
                                        onPress={() => {
                                            let feedback = this.state.feedbackSelected;
                                            feedback[key] = !this.state.feedbackSelected[key]
                                            this.setState({
                                                feedbackSelected: feedback
                                            })
                                            
                                        }}
                                    >
                                        <Text style={[styles.feedBackModalText]}>{key}</Text>
                                    </TouchableOpacity>
                                )
                            })

                        }
                    </View>

                    <TextInput style={{ borderBottomWidth: 1, margin: 10, fontWeight: '600', fontSize: 12, lineHeight: 16 }}
                        maxLength={100}
                        value={this.state.comment}
                        onChangeText={(comment) => {
                            this.setState({
                                comment: comment,
                                commentRemaindingLength: 100 - comment.length
                            });
                        }}
                        placeholder={'Comment'}
                    />

                    <Text style={{ textAlign: 'right', marginHorizontal: 10, fontWeight: '600', fontSize: 9, lineHeight: 12 }}>
                        {this.state.commentRemaindingLength}
                    </Text>

                </View>


                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={[styles.modalBtn,
                    { backgroundColor: '#FFD54E', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }]}
                        onPress={() => this.feedbackModal()}
                    >
                        <Text style={[styles.modalText, { color: '#FFFFFF' }]}>Rate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modalBackground: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        width: '80%',
        height: '40%',
        alignSelf: 'center'
    },
    modalText: {
        fontWeight: '600',
        fontSize: 18,
        lineHeight: 25,
        textAlign: 'center',
        color: '#000000'
    },
    modalBtn: {
        flex: 1,
        alignItems: 'center',
        height: 44,
        justifyContent: 'center'
    },
    modalBtnText: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19
    },
    feedbackModalView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        marginHorizontal: 20
    },
    feedbackModalBtn: {
        borderRadius: 20,
        margin: 5,
        borderWidth: 1,
        height: 23,
        justifyContent: 'center'
    },
    feedBackModalText: {
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 14,
        color: '#000000',
        textAlign: 'center',
        marginHorizontal: 5,
    }
})
