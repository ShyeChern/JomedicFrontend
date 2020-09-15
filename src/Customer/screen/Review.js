import React, { Component } from 'react';
import { Text, StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { ListItem, Avatar, AirbnbRating } from 'react-native-elements';
import { getCustomerId } from "../util/Auth";
import { format, parseISO } from "date-fns";
import RNFetchBlob from 'rn-fetch-blob';
import { URL } from '../util/FetchURL';

export default class Review extends Component {
    constructor(props) {
        super(props)

        this.state = {
            customerId: '',
            feedback: [],
            totalRating: 0,
            averageRating: 0,
            totalReviews: 0,
            flatListLoading: true,
        }
    }

    async componentDidMount() {
        await getCustomerId().then(response => {
            this.setState({ customerId: response });
        });

        let bodyData = {
            transactionCode: 'VIEWRATING',
            timestamp: new Date(),
            data: {
                CustomerId: this.state.customerId,
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
                    let feedback = [];
                    let totalRating = 0;
                    responseJson.data.forEach(function (element, index) {
                        totalRating += element.rating;
                        if (element.picture !== null) {
                            let unitArray = new Uint8Array(element.picture.data);

                            const stringChar = unitArray.reduce((data, byte) => {
                                return data + String.fromCharCode(byte);
                            }, '');

                            element.picture = RNFetchBlob.base64.encode(stringChar);
                        }

                        // Extract the tags as string
                        let tagString = element.comments.split(';/*')[0]

                        // Convert the tag string into array
                        let tagArray = tagString.split(",")

                        // Check if the array only contains empty string (no feedback is selected)
                        if (tagArray[0] === "") {
                            tagArray = []
                        }

                        let tags = tagArray;

                        // Extract the comment
                        let comment = element.comments.split(';/*')[1]


                        let feedbackObject = {
                            name: element.name,
                            rating: element.rating,
                            date: format(parseISO(element.txn_date), "d/MM/yyyy "),
                            comment: comment,
                            tags: tags,
                            avatar: element.picture,
                        };
                        feedback.push(feedbackObject);


                    });

                    this.setState({
                        feedback: feedback,
                        totalRating: totalRating,
                        totalReviews: responseJson.data.length,
                        averageRating: Math.round(totalRating / responseJson.data.length),
                        flatListLoading: false
                    })

                }
                else {
                    alert(responseJson.value);
                }
            })
            .catch((error) => {
                alert(error);
            });
    }

    renderItem = ({ item }) => (
        <View>
            <ListItem
                title={item.name}
                titleStyle={styles.nameText}
                subtitle={
                    <View style={styles.itemContainer}>
                        <View style={styles.itemSubtitleContainer}>
                            <AirbnbRating
                                defaultRating={item.rating}
                                showRating={false}
                                isDisabled={true}
                                size={20}
                            />
                            <Text>{item.date}</Text>
                        </View>
                        <Text style={styles.commentText}>{item.comment}</Text>
                        <View style={styles.tagContainer}>
                            {
                                item.tags.map((tag, index) => {
                                    return (
                                        <Text key={index.toString()} style={[styles.tagText, styles.tagButton]}>{tag}</Text>
                                    )
                                })
                            }
                        </View>
                    </View>
                }
                leftAvatar={<Avatar
                    rounded
                    size='medium'
                    source={{ uri: 'data:image/png;base64,' + item.avatar }}
                    avatarStyle={styles.avatarStyle}
                />}
                bottomDivider={true}
            />
        </View>
    )

    BottomButtonBar = () => {
        return (
            <View style={styles.bottomButtonBar}>
                <TouchableOpacity
                    style={[styles.buttonLayoutSize, styles.previousButton]}>
                    <Text style={styles.previousText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buttonLayoutSize, styles.nextButton]}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.pageContainer}>

                {/* Flatlist View */}
                <View>
                    <FlatList
                        refreshControl={<RefreshControl refreshing={this.state.flatListLoading} />}
                        keyExtractor={(item, index) => index + index}
                        data={this.state.feedback}
                        renderItem={this.renderItem}
                        ListEmptyComponent={() => {
                            return (
                                <Text style={{ textAlign: 'center', fontStyle: 'italic', marginTop: 10 }}>No review has been given to you</Text>
                            )
                        }}
                        ListHeaderComponent={() =>
                            this.state.flatListLoading?
                            <View/>
                            :
                            <View style={styles.reviewContainer}>
                                <AirbnbRating
                                    defaultRating={this.state.averageRating}
                                    showRating={false}
                                    isDisabled={true}
                                    style={{ paddingVertical: 10, }}
                                />
                                <Text styles={styles.reviewsText}>{this.state.totalReviews} Reviews</Text>
                            </View>
                        }
                        ListFooterComponent={() => <Text style={{ fontStyle: 'italic', marginVertical: 7, textAlign: 'center' }}>{this.state.flatListLoading ? '' : 'End of Review'}</Text>}
                    />
                </View>
                {/* <this.BottomButtonBar /> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    pageContainer: {
        paddingTop: 10,
        flex: 1,
    },

    reviewContainer: {
        alignItems: 'center',
    },

    reviewsText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
        alignSelf: "center",
        alignItems: 'center',
        alignContent: 'center',
        color: '#4A4A4A',
    },

    itemContainer: {

    },

    itemSubtitleContainer: {
        flexDirection: 'row',
        justifyContent: "space-between",
        marginTop: 5,
    },

    nameText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 16,
        color: '#000000',
    },

    dateText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 19,
        color: '#000000',
    },

    commentText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 19,
        color: '#555555',
    },

    tagContainer: {
        flexDirection: 'row',
    },

    tagButton: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#979797',
        borderRadius: 20,
        alignItems: 'center',
        margin: 2,
    },

    tagText: {
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 14,
        color: '#979797',
        alignSelf: 'center',
        textAlign: 'center',
        padding: 5,
    },

    avatarStyle: {
        alignSelf: "flex-start",
    },

    bottomButtonBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 20,
        flex: 1,
    },

    buttonLayoutSize: {
        borderRadius: 30,
        width: 126,
        height: 30,
        alignSelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: "center",
    },

    previousButton: {
        borderColor: "#FDAA26",
        borderStyle: "solid",
        borderWidth: 1,
    },

    previousText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#FDAA26',
    },

    nextButton: {
        backgroundColor: "#FDAA26",
    },

    nextText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 16,
        color: '#FFFFFF',
    },
})
