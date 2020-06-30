import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';

const FAQDATA = [
    {
        id: '1',
        question: 'Where can I download Jomedic?',
        answer: 'Jomedic can be download in Google Play Store on Android and App Store on iOS',
    },
    {
        id: '2',
        question: 'What is Jomedic?',
        answer: 'Jomedic is a mobile application which allow customer to make appointment or request consultation from doctor online.',
    },
    {
        id: '3',
        question: 'Does Jomedic can be used in the website?',
        answer: 'Currently Jomedic support on;y for mobile user. Website will be develop in the future.',
    }
]

QA = ({ id, question, answer, that }) => {
    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50 }}
                onPress={() => {
                    let show = that.state.faqShow;
                    show[id] = !show[id];
                    that.setState({
                        faqShow: show
                    });
                }}
            >
                <Text style={[styles.text, { marginLeft: 10 }]}>{question}</Text>
                <EntypoIcon style={{ marginRight: 10 }} name={that.state.faqShow[id] ? 'chevron-up' : 'chevron-down'} color={'#000000'} size={25} />
            </TouchableOpacity>

            {
                that.state.faqShow[id] ?
                    <View style={{ backgroundColor: '#FCFCFC' }}>
                        <Text style={[styles.text, { marginLeft: 10 }]}>{answer}</Text>
                    </View>
                    :
                    <View />
            }

        </View >
    );

}

export default class Faq extends Component {
    constructor(props) {
        super(props)

        this.state = {
            show: false,
            faqShow: {},
        }
    }

    componentDidMount() {
        let faq = {}

        FAQDATA.forEach((value, index) => {
            faq[index + 1] = false;
        });

        this.setState({
            faqShow: faq
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, lineHeight: 22, margin: 10 }}> Frequently Asked Questions </Text>
                <SafeAreaView style={{ flex: 1, marginVertical: 15 }}>
                    <FlatList
                        data={FAQDATA}
                        renderItem={({ item }) => <QA id={item.id} question={item.question} answer={item.answer} that={this} />}
                        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#000000' }}></View>}
                        keyExtractor={item => item.id}
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
