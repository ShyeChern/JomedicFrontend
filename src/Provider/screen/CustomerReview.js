import React, { Component } from 'react'
import { Text, StyleSheet, View, FlatList, Alert, TouchableOpacity } from 'react-native'
import { ListItem, Avatar, AirbnbRating, Rating } from 'react-native-elements'
import moment from 'moment'

import defaultAvatar from '../img/defaultAvatar.png'

import { getTenantId, getTenantType, getUserId } from '../util/Auth'
import { URL_Provider, URL_AuditTrail } from '../util/provider'
import { getTodayDate } from '../util/getDate'
import { handleNoInternet } from '../util/CheckConn'
import Loader from '../screen/Loader'

const sampleData = [
    {
        name: 'Mohd Ikram Bin Abu Bakar',
        rating: 5,
        date: '1/29/2020',
        comment: 'The response is very fast and doctor are very kind.',
        tags: ['Excellent', 'Helpful'],
        avatar: defaultAvatar,

    },
    {
        name: 'Abdul Syukur Bin Ali',
        rating: 5,
        date: '2/29/2020',
        comment: 'The response is very fast and doctor are very kind.',
        tags: ['Excellent', 'Kind'],
        avatar: defaultAvatar,
    },
    {
        name: 'Mohd Akmal Bin Abu Yashid Bakar',
        rating: 5,
        date: '3/29/2020',
        comment: 'The response is very fast and doctor are very kind.',
        tags: ['Excellent', 'Helpful', 'Fast Response'],
        avatar: defaultAvatar,
    },
]

export default class CustomerReview extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,

            tenant_id: '',
            customerRatings: [],
            totalScore: 0,
            averageScore: 0,
            totalReviews: 0
        }
    }

    async componentDidMount() {
        await this.initializeData();
        this.getCustomerReview()
    }

    initializeData = async () => {
        await getTenantId().then(response => {
            this.setState({ tenant_id: response });
        });
    }

    getCustomerReview = async () => {

        this.setState({
            isLoading: true
        })

        var tenant_id = this.state.tenant_id

        // Get the code for online chat
        let datas = {
            txn_cd: 'MEDORDER035',
            tstamp: getTodayDate(),
            data: {
                feedback_to: tenant_id,
            }
        }

        try {
            this.setState({ isLoading: true })

            const response = await fetch(URL_Provider, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datas)
            });

            const json = await response.json();

            if (json.status === 'fail' || json.status === 'duplicate' || json.status === 'emptyValue' || json.status === 'incompleteDataReceived' || json.status === 'ERROR901') {
                console.log('Get Customer Reviews Error');
                console.log(json.status);
                Alert.alert('Get Customer Reviews Error', 'Fail to get customer reviews, please try again.\n' + json.status);
            }
            else {
                var data = json.status
                var totalScore = 0
                var totalReviews = data.length
                var averageScore = 0

                data.forEach(element => {
                    totalScore = totalScore + element.rating

                    // Extract the tags from the comment string, and insert into element
                    element.tags = this.extractFeedbackSelected(element.comments);
                    element.comment = this.extractComments(element.comments);
                });

                averageScore = Math.round(totalScore / totalReviews)

                this.setState({
                    customerRatings: data,
                    totalScore: totalScore,
                    totalReviews: totalReviews,
                    averageScore: averageScore
                })
            };

            this.setState({
                isLoading: false
            });

        } catch (error) {
            console.log("Get Customer Reviews Error: " + error)
            this.setState({
                isLoading: false
            });
            Alert.alert('Get Customer Reviews Error', 'Fail to get customer reviews, please try again.\n' + error);
        }
    }

    extractFeedbackSelected = (comments) => {
        // Extract the tags as string
        var tagString = comments.split(';/*')[0]

        // Convert the tag string into array
        var tagArray = tagString.split(",")

        // Check if the array only contains empty string (no feedback is selected)
        if(tagArray[0] === ""){
            tagArray = []
        }

        // Return the tag Array
        return tagArray
    }

    extractComments = (comments) => {
        // Extract the comment
        var comment = comments.split(';/*')[1]
        return comment
    }

    keyExtractor = (item, index) => index.toString()

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
                            <Text>{moment(item.txn_date).format("DD MMM YYYY")}</Text>
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
                    source={{ uri: item.picture }}
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

        if (this.state.isLoading) {
            return (
                <Loader isLoading={this.state.isLoading} />
            )
        }
        return (
            <View style={styles.pageContainer}>
                <View style={styles.reviewContainer}>
                    <AirbnbRating
                        defaultRating={this.state.averageScore}
                        showRating={false}
                        isDisabled={true}
                        style={{ paddingVertical: 10, }}
                    />
                    <Text styles={styles.reviewsText}>{this.state.totalReviews} Reviews</Text>
                </View>
                {/* Flatlist View */}
                <View>
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        data={this.state.customerRatings}
                        renderItem={this.renderItem}
                        style={{marginBottom: 20}}
                    />
                </View>
                {/* <this.BottomButtonBar /> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    pageContainer: {
        paddingTop: '15%',
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
