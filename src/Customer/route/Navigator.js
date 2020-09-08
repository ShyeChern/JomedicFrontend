import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { navigatorScreenSetting, bottomTabBarSetting } from '../util/NavigatorSetting';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import HeaderMenuBlack from '../util/HeaderMenuBlack';
import HeaderMenuWhite from '../util/HeaderMenuWhite';

import WelcomePage from '../screen/WelcomePage';
import Login from '../screen/Login';
import SignUp from '../screen/SignUp';
import ForgetPassword from '../screen/ForgetPassword';
import Home from '../screen/Home';
import FindMap from '../screen/FindMap';
import FindHealthcare from '../screen/FindHealthcare';
import FindDoctor from '../screen/FindDoctor';
import Healthcare from '../screen/Healthcare';
import Appointment from '../screen/Appointment';
import Wallet from '../screen/Wallet';
import Account from '../screen/Account';
import HealthcareDoctor from '../screen/HealthcareDoctor';
import Doctor from '../screen/Doctor';
import VideoConsultation from '../screen/VideoConsultation';
import LiveChat from '../screen/LiveChat';
import ConsultationReceipt from '../screen/ConsultationReceipt';
import EditProfile from '../screen/EditProfile';
import CurrentChat from '../screen/CurrentChat';
import History from '../screen/History';
import ChangePassword from '../screen/ChangePassword';
import Faq from '../screen/Faq';
import ContactUs from '../screen/ContactUs';
import UserManual from '../screen/UserManual';
import AppointmentDetail from '../screen/AppointmentDetail';
import Review from '../screen/Review';
import PreviousChat from '../screen/PreviousChat';
import PreviousChatDetail from '../screen/PreviousChatDetail';


import { ModalStackNavigator } from '../../Provider/lib/router';
import eWallet from '../../eWallet/JOMEDIC WALLET/Appnavigator';

const Stack = createStackNavigator();
const BottomTab = createBottomTabNavigator();

function getBottomTabTitle(route) {
    // Access the tab navigator's state using `route.state`
    const routeName = route.state
        ? // Get the currently active route name in the tab navigator
        route.state.routes[route.state.index].name
        : // If state doesn't exist, we need to default to `screen` param if available, or the initial screen
        // In our case, it's "Home" as that's the first screen inside the navigator
        route.params?.screen || 'Jomedic';

    return routeName;
}

function getHeaderShownOption(route) {
    switch (getBottomTabTitle(route)) {
        case 'Wallet':
            return false;
            break;

        default:
            return true;
    }
}

function getHeaderTransparentOption(route) {
    switch (getBottomTabTitle(route)) {
        case 'Jomedic':
            return true;
            break;
        case 'Appointment':
            return false;
            break;
        case 'Wallet':
            return false;
            break;
        case 'Account':
            return true;
            break;
        default:
            return false;
    }
}

function getHeaderTintColorOption(route) {
    switch (getBottomTabTitle(route)) {
        case 'Jomedic':
            return "#000000";
            break;
        case 'Appointment':
            return "#FFFFFF";
            break;
        case 'Wallet':
            return "#FFFFFF";
            break;
        case 'Account':
            return "#4A4A4A";
            break;
        default:
            return "#FFFFFF";
    }
}

function getHeaderTitleStyleOption(route) {
    switch (getBottomTabTitle(route)) {
        case 'Jomedic':
            return {
                fontWeight: '600',
                fontSize: 24,
                lineHeight: 33
            };
            break;
        case 'Appointment':
            return {
                fontWeight: '600',
                fontSize: 18,
                lineHeight: 25
            };
            break;
        case 'Wallet':
            return {
                fontWeight: '600',
                fontSize: 18,
                lineHeight: 25
            };
            break;
        case 'Account':
            return {
                fontWeight: '600',
                fontSize: 18,
                lineHeight: 25
            };
            break;
        default:
            return {
                fontWeight: '600',
                fontSize: 18,
                lineHeight: 25
            };
    }

}

export function AuthenticateNavigator({ navigation }) {
    return (
        <Stack.Navigator initialRouteName='WelcomePage' screenOptions={navigatorScreenSetting}>

            <Stack.Screen name='WelcomePage' component={WelcomePage} options={{
                title: '',
            }} />

            <Stack.Screen name='Login' component={Login} options={{
                title: '',
                headerTintColor: '#000000',

            }} />

            <Stack.Screen name='SignUp' component={SignUp} options={{
                title: '',
                headerTintColor: '#000000',
            }} />

            <Stack.Screen name='ForgetPassword' component={ForgetPassword} options={{
                title: 'Forget Password',
                headerTintColor: '#FFFFFF',
                headerTransparent: false
            }} />

            <Stack.Screen name='Jomedic' component={MainNavigator} options={{
                title: '',
                headerLeft: null,
            }} />

            <Stack.Screen name='Home' component={ModalStackNavigator} options={{
                title: '',
                headerLeft: null,
            }} />
        </Stack.Navigator>
    );
}

// swipe in bottom navigation bar?
function MainNavigator({ navigation }) {
    return (

        <Stack.Navigator initialRouteName='Jomedic' screenOptions={navigatorScreenSetting}>

            <Stack.Screen name='WelcomePage' component={AuthenticateNavigator} options={{
                title: '',
                headerLeft: null,
            }} />

            <Stack.Screen name='Jomedic' component={BottomHomeTab}
                options={({ route }) => ({
                    title: getBottomTabTitle(route),
                    headerTransparent: getHeaderTransparentOption(route),
                    headerLeft: null,
                    headerTintColor: getHeaderTintColorOption(route),
                    headerTitleStyle: getHeaderTitleStyleOption(route),
                    headerShown: getHeaderShownOption(route)
                })}
            />

            <Stack.Screen name='FindHealthcare' component={FindHealthcare} options={{
                title: '',
                headerTintColor: '#000000',

            }} />
            <Stack.Screen name='FindDoctor' component={FindDoctor} options={{
                title: '',
                headerTintColor: '#000000',

            }} />
            <Stack.Screen name='FindMap' component={FindMap} options={{
                title: '',
                headerTintColor: '#000000',
                headerRight: () => (
                    <HeaderMenuBlack />
                ),
            }} />
            <Stack.Screen name='Healthcare' component={Healthcare} options={{
                title: '',
                headerTintColor: '#FFFFFF',
            }} />
            <Stack.Screen name='HealthcareDoctor' component={HealthcareDoctor} options={{
                title: '',
                headerTintColor: '#000000',
                headerRight: () => (
                    <HeaderMenuBlack />
                ),
            }} />
            <Stack.Screen name='Doctor' component={Doctor} options={{
                title: '',
                headerTintColor: '#000000',
                headerRight: () => (
                    <HeaderMenuBlack />
                ),
            }} />
            <Stack.Screen name='VideoConsultation' component={VideoConsultation} options={{
                title: '',
                headerTintColor: '#FFFFFF',
                headerLeft: null,
            }} />

            <Stack.Screen name='LiveChat' component={LiveChat} options={{
                title: '',
                headerTintColor: '#FFFFFF',
                headerRight: () => (
                    <HeaderMenuWhite />
                ),
            }} />
            <Stack.Screen name='ConsultationReceipt' component={ConsultationReceipt} options={{
                title: '',
                headerTintColor: '#000000',
                headerLeft: null,
                headerRight: () => (
                    <HeaderMenuBlack />
                ),
            }} />

            <Stack.Screen name='AppointmentDetail' component={AppointmentDetail} options={{
                title: '',
                headerTintColor: '#000000',
                headerRight: () => (
                    <HeaderMenuBlack />
                ),
            }} />

            <Stack.Screen name='EditProfile' component={EditProfile} options={{
                title: 'Edit Profile',
                headerTintColor: '#000000',
                headerTransparent: false,
                headerStyle: {
                    backgroundColor: '#FFFFFF'
                }
            }} />

            <Stack.Screen name='CurrentChat' component={CurrentChat} options={{
                title: 'Current Chat',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />

            <Stack.Screen name='History' component={History} options={{
                title: 'History',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />

            <Stack.Screen name='ChangePassword' component={ChangePassword} options={{
                title: 'Change Password',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />

            <Stack.Screen name='Faq' component={Faq} options={{
                title: 'Frequently Asked Questions',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />

            <Stack.Screen name='ContactUs' component={ContactUs} options={{
                title: 'Contact Us',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />

            <Stack.Screen name='UserManual' component={UserManual} options={{
                title: 'User Manual',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />
            <Stack.Screen name='Review' component={Review} options={{
                title: 'Review',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />
            <Stack.Screen name='PreviousChat' component={PreviousChat} options={{
                title: 'Previous Chat',
                headerTintColor: '#FFFFFF',
                headerTransparent: false,
            }} />
            <Stack.Screen name='PreviousChatDetail' component={PreviousChatDetail} options={{
                title: '',
                headerTintColor: '#FFFFFF',
            }} />
        </Stack.Navigator>
    );
}

function BottomHomeTab() {

    return (
        <BottomTab.Navigator initialRouteName='Home'
            tabBarOptions={bottomTabBarSetting}
        >
            <BottomTab.Screen name='Jomedic'
                component={Home}
                options={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        return (
                            // focused ? require('../asset/icon/profile.png') : require('../asset/icon/cancel.png')
                            focused ? <SimpleLineIcons name='home' size={30} color='#FFD54E' /> : <SimpleLineIcons name='home' size={30} />

                        )
                    },
                    tabBarLabel: 'Jomedic'
                })}
            />
            <BottomTab.Screen name='Appointment'
                component={Appointment}
                options={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        return (
                            focused ? <SimpleLineIcons name='calendar' size={30} color='#FFD54E' /> : <SimpleLineIcons name='calendar' size={30} />
                        )
                    },
                    tabBarLabel: 'Appointment'
                })}
            />
            <BottomTab.Screen name='Wallet'
                // component={Wallet}
                component={eWallet}
                options={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        return (
                            focused ? <SimpleLineIcons name='wallet' size={30} color='#FFD54E' /> : <SimpleLineIcons name='wallet' size={30} />
                        )
                    },
                    tabBarLabel: 'Wallet'
                })}
            />
            <BottomTab.Screen name='Account'
                component={Account}
                options={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        return (
                            focused ? <FontAwesome name='user-o' size={30} color='#FFD54E' /> : <FontAwesome name='user-o' size={30} />
                        )
                    },
                    tabBarLabel: 'Account'
                })}
            />
        </BottomTab.Navigator>
    );
}

export function Authenticate() {
    return (
        <NavigationContainer>
            <AuthenticateNavigator />
        </NavigationContainer>
    );
}

export function Main() {
    return (
        <NavigationContainer>
            <MainNavigator />
        </NavigationContainer>
    );
}



