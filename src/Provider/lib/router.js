import * as React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'

import { createStackNavigator, useHeaderHeight, HeaderBackButton } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ChatMenuScreen from '../screen/ChatMenuList';
import QueueScreen from '../screen/Queue';
import AppointmentScreen from '../screen/Appointment';
import AppointmentDetailScreen from '../screen/AppointmentDetail'
import PersonScreen from '../screen/Person'
import PatientChatHistorysScreen from '../screen/ChatHistory'
import PatientChatInfoScreen from '../screen/ChatInfoDetail'
import PatientLiveChatScreen from '../screen/LiveMessageChat'
import CallHistoryScreen from '../screen/CallHistory'
import CallInfoScreen from '../screen/CallInfoDetail'
import PatientProfileScreen from '../screen/PatientProfile'
import AccountScreen from '../screen/AccountSettings'
import EditProfileScreen from '../screen/EditProfile'
import ClinicScheduleScreen from '../screen/ClinicSchedule'
import ServiceChargeScreen from '../screen/ServiceCharge'
import CustomerReviewScreen from '../screen/CustomerReview'
import QueueModal from '../screen/QueueModal'
import ConsultationNoteModal from '../screen/ConsultationNoteModal'
import RateCustomerModal from '../screen/RateCustomerModal'
import VideoCallScreen from '../screen/VideoCall'
import MapScreen from '../screen/Map'
import BloodPressureScrren from '../screen/BloodPressure'
import BloodGlucoseScreen from '../screen/BloodGlucose'
import BodyTemperatureScreen from '../screen/BodyTemperature'
import CholesterolScreen from '../screen/Cholesterol'
import OxygenSaturationScreen from '../screen/OxygenSaturation'
import RespiratoryRateScreen from '../screen/RespiratoryRate'
import WeightHeightBmiScreen from '../screen/WeightHeightBmi'
import ComplaintScreen from '../screen/Complaint'
import ComplaintListScreen from '../screen/ComplaintList'
import DiagnosisScreen from '../screen/Diagnosis'
import DiagnosisListScreen from '../screen/DiagnosisList'
import MedicationScreen from '../screen/Medication'
import MedicationListScreen from '../screen/MedicationList'
import ChangePasswordScreen from '../screen/ChangePassword'
import FAQScreen from '../screen/FAQ'
import ContactUsScreen from '../screen/ContactUs'

import { AuthenticateNavigator } from '../../Customer/route/Navigator';
import { tr } from 'date-fns/locale';

const activeTintLabelColor = '#FFD54E';
const inactiveTintLabelColor = 'black';
const Tab = createBottomTabNavigator();
const ChatMenuStack = createStackNavigator();
const ChatHistoryStack = createStackNavigator();
const CallHistoryStack = createStackNavigator();
const ChatInfoTab = createMaterialTopTabNavigator();
const QueueStack = createStackNavigator();
const AppointmentStack = createStackNavigator();
const AccountStack = createStackNavigator();
const ModalStack = createStackNavigator();
const VitalSignTab = createMaterialTopTabNavigator();

const DummyScreen = ({ navigation, route }) => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Dummy Screen</Text>
        </View>
    )
}

function shouldHeaderBeShown(route) {
    const routeName = route.state ? route.state.routes[route.state.index].name : 'ChatHistory'
    switch (routeName) {
        case 'ChatHistory':
            return false
    }
}

export const ModalStackNavigator = ({ navigation, route }) => {

    return (
        <ModalStack.Navigator
            initialRouteName='Home'
            mode={"modal"}
        >
            <ModalStack.Screen name='WelcomePage' component={AuthenticateNavigator} options={{
                title: '',
                headerLeft: null,
                headerTransparent: true
            }} />

            <ModalStack.Screen name="Home" component={BottomButtonTabNavigatior}
                options={{
                    title: '',
                    headerLeft: null,
                    headerTransparent: true
                }}
            />
            <ModalStack.Screen name="LiveChat" component={PatientLiveChatScreen}
                options={{
                    headerShown: true
                }} />
            <ModalStack.Screen name="VideoCall" component={VideoCallScreen}
                options={{
                    headerShown: true
                }} />
            <ModalStack.Screen name="QueueModal" component={QueueModal}
                options={{
                    title: '',
                    headerLeft: null,
                    headerTransparent: true,
                    cardStyle: { backgroundColor: 'transparent' }
                }}
            />
            <ModalStack.Screen name="ConsultationNoteModal" component={ConsultationNoteModal}
                options={{
                    title: '',
                    headerLeft: null,
                    headerTransparent: true,
                    cardStyle: { backgroundColor: 'transparent' }
                }}
            />
            <ModalStack.Screen name="RateCustomerModal" component={RateCustomerModal}
                options={{
                    title: '',
                    headerLeft: null,
                    headerTransparent: true,
                    cardStyle: { backgroundColor: 'transparent' }
                }}
            />
            <ModalStack.Screen name="Map" component={MapScreen}
                options={{
                    title: 'Customer Location',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />
            <ModalStack.Screen name="ComplaintList" component={ComplaintListScreen}
                options={{
                    title: 'Complaint',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />
            <ModalStack.Screen name="Complaint" component={ComplaintScreen}
                options={{
                    title: 'Add Complaint',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />
            <ModalStack.Screen name="DiagnosisList" component={DiagnosisListScreen}
                options={{
                    title: 'Diagnosis',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />
            <ModalStack.Screen name="Diagnosis" component={DiagnosisScreen}
                options={{
                    title: 'Add Diagnosis',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />
            <ModalStack.Screen name="VitalSign" component={VitalSignTopTabNavigator}
                options={{
                    title: 'Vital Sign',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />
            <ModalStack.Screen name="MedicationList" component={MedicationListScreen}
                options={{
                    title: 'Medication',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />
            <ModalStack.Screen name="Medication" component={MedicationScreen}
                options={{
                    title: 'Add Medication',
                    headerStyle: {
                        backgroundColor: activeTintLabelColor,
                    },
                    headerTintColor: 'white',
                    headerShown: true
                }}
            />

        </ModalStack.Navigator>
    )
}

function BottomButtonTabNavigatior({ navigation, route }) {

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Chats') {
                        iconName = 'message-text-outline';
                    } else if (route.name === 'Appointment') {
                        iconName = 'calendar-month-outline';
                    } else if (route.name === 'Queue') {
                        iconName = 'account-group';
                    } else if (route.name === 'Account') {
                        iconName = 'account';
                    }


                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}
            tabBarOptions={{
                showIcon: true,
                activeTintColor: activeTintLabelColor,
                inactiveTintColor: inactiveTintLabelColor,
            }}
        >
            <Tab.Screen name="Chats" component={ChatMenuStackNavigator} />
            <Tab.Screen name="Appointment" component={AppointmentStackNavigator} />
            <Tab.Screen name="Queue" component={QueueStackNavigator} />
            <Tab.Screen name="Account" component={AccountStackNavigator} />
        </Tab.Navigator>
    );
}

const ChatMenuStackNavigator = ({ navigation, route }) => {
    if (route.state) {
        navigation.setOptions({
            tabBarVisible: route.state.index > 0 ? false : true
        });
    }

    return (
        <ChatMenuStack.Navigator initialRouteName="ChatMenu"
            screenOptions={{
                headerStyle: {
                    backgroundColor: activeTintLabelColor,
                },
                headerTintColor: 'white',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }} >
            <ChatMenuStack.Screen name="ChatMenu" component={ChatMenuScreen}
                options={{
                    title: 'JOMEDIC',
                    headerShown: true
                }}
            />
            <ChatMenuStack.Screen name="Person" component={PersonTabNavigator}
                options={{
                    headerTransparent: true,
                    headerTitle: '',
                    headerShown: true
                }}
            />
        </ChatMenuStack.Navigator>
    );
}


const PersonTabNavigator = ({ navigation, route }) => {

    const { name, picture } = route.params;

    return (
        <View style={{ flex: 1 }}>
            <PersonScreen personData={{ name: name, picture: picture }} />
            <ChatInfoTab.Navigator initialRouteName="PatientProfile"
                tabBarOptions={{
                    style: {
                        backgroundColor: activeTintLabelColor,
                    },
                    labelStyle: { color: 'white' },
                    indicatorStyle: { color: 'white' },
                }}>
                <ChatInfoTab.Screen name='PatientProfile' component={PatientProfileScreen}
                    options={{ title: 'Profile' }}
                    initialParams={
                        {
                            user_id: route.params.user_id,
                            name: route.params.name,
                            DOB: route.params.DOB,
                            mobile_no: route.params.mobile_no,
                            email: route.params.email,
                            nationality_cd: route.params.nationality_cd,
                            home_address1: route.params.home_address1,
                            home_address2: route.params.home_address2,
                            home_address3: route.params.home_address3,
                            district: route.params.district,
                            state: route.params.state,
                            country: route.params.country,
                            picture: route.params.picture,
                        }
                    }
                />
                <ChatInfoTab.Screen name="ChatHistory" component={ChatHistoryStackNavigator}
                    options={{ title: 'Chats' }}
                    initialParams={{
                        user_id: route.params.user_id,
                        name: route.params.name,
                        picture: route.params.picture,
                    }}
                />
                <ChatInfoTab.Screen name="CallHistory" component={CallHistoryStackNavigator}
                    options={{ title: 'Calls' }}
                    initialParams={{
                        user_id: route.params.user_id,
                        name: route.params.name,
                        picture: route.params.picture,
                    }}
                />
            </ChatInfoTab.Navigator>
        </View>
    )
}

const ChatHistoryStackNavigator = ({ navigation, route }) => {
    return (
        <ChatHistoryStack.Navigator initialRouteName="ChatHistory"
            screenOptions={{
                title: '',
                headerStyle: {
                    backgroundColor: 'white',
                },
                headerTintColor: 'black',
                headerShown: shouldHeaderBeShown(route)
            }} >
            <ChatHistoryStack.Screen name="ChatHistory" component={PatientChatHistorysScreen}
                options={{
                    title: '',
                }}
                initialParams={{
                    user_id: route.params.user_id,
                    tenant_id: route.params.tenant_id,
                    name: route.params.name,
                    picture: route.params.picture,
                }}
            />
            <ChatHistoryStack.Screen name="ChatInfo" component={PatientChatInfoScreen}
                options={{
                    title: '',
                    headerStyle: {
                        backgroundColor: 'white',
                    },
                    headerTintColor: 'black',
                    // headerShown: shouldHeaderBeShown(route),
                    headerTransparent: true,

                    // title: '',
                }}
            />
        </ChatHistoryStack.Navigator>
    );

}

const CallHistoryStackNavigator = ({ navigation, route }) => {
    return (
        <CallHistoryStack.Navigator initialRouteName="CallHistory"
            screenOptions={{
                title: '',
                headerStyle: {
                    backgroundColor: 'white',
                },
                headerTintColor: 'black',
                headerShown: shouldHeaderBeShown(route)
            }} >
            <CallHistoryStack.Screen name="ChatHistory" component={CallHistoryScreen}
                options={{
                    title: '',
                }}
                initialParams={{
                    user_id: route.params.user_id,
                    tenant_id: route.params.tenant_id,
                    name: route.params.name,
                    picture: route.params.picture,
                }}
            />
            <CallHistoryStack.Screen name="CallInfo" component={CallInfoScreen}
                options={{
                    title: '',
                    headerStyle: {
                        backgroundColor: 'white',
                    },
                    headerTintColor: 'black',
                    // headerShown: shouldHeaderBeShown(route),
                    headerTransparent: true,

                    // title: '',
                }}
            />
        </CallHistoryStack.Navigator>
    );

}



const AppointmentStackNavigator = ({ navigation, route }) => {
    if (route.state) {
        navigation.setOptions({
            tabBarVisible: route.state.index > 0 ? false : true
        });
    }

    return (
        <AppointmentStack.Navigator initialRouteName="Appointment"
            screenOptions={{
                headerStyle: {
                    backgroundColor: activeTintLabelColor,
                },
                headerTintColor: 'white',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown: true
            }} >
            <AppointmentStack.Screen name="Appointment" component={AppointmentScreen}
                options={{
                    headerTransparent: false,
                    headerTitle: 'Appointment',
                    headerShown: true
                }}
            />
            <AppointmentStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen}
                options={{
                    headerTransparent: false,
                    headerTitle: 'Appointment Detail',
                    headerShown: true
                }}
            />

        </AppointmentStack.Navigator>

    )
}

const QueueStackNavigator = ({ navigation, route }) => {
    return (
        <QueueStack.Navigator initialRouteName="Queue"
            screenOptions={{
                headerStyle: {
                    backgroundColor: activeTintLabelColor,
                },
                headerTintColor: 'white',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown: true
            }} >
            <QueueStack.Screen name="Queue" component={QueueScreen}
                options={{
                    headerTransparent: false,
                    headerTitle: 'Queue',
                }}
                initialParams={{
                    onRefresh: true,
                }}
            //options={({ route }) => ({ title: route.params.name })}
            />
        </QueueStack.Navigator>

    )
}

const AccountStackNavigator = ({ navigation, route }) => {
    if (route.state) {
        navigation.setOptions({
            tabBarVisible: route.state.index > 0 ? false : true
        });
    }

    return (
        <AccountStack.Navigator initialRouteName="Account"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#E5E5E5',
                },
                headerTintColor: 'white',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontFamily: 'Open Sans',
                    fontStyle: 'normal',
                    fontWeight: '600',
                    fontSize: 18,
                    lineHeight: 25,
                    textAlign: 'center',
                    color: '#4A4A4A',
                },

            }}
        >
            <AccountStack.Screen name="Account" component={AccountScreen}
                options={{
                    headerTransparent: true,
                    headerTitle: 'Account',
                    headerShown: true
                }}
            />
            <AccountStack.Screen name="EditProfile" component={EditProfileScreen}
                options={{
                    headerTransparent: true,
                    headerTitle: 'Edit Profile',
                    headerTitleStyle: {
                        fontFamily: 'Open Sans',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        fontSize: 16,
                        lineHeight: 22,
                        textAlign: 'center',
                        color: '#000000',
                    },
                    headerTintColor: '#000000',
                    headerShown: true
                }}
            />
            <AccountStack.Screen name="ClinicSchedule" component={ClinicScheduleScreen}
                options={{
                    headerTransparent: true,
                    headerTitle: 'Clinic Schedule',
                    headerTitleStyle: {
                        fontFamily: 'Open Sans',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        fontSize: 18,
                        lineHeight: 25,
                        textAlign: 'center',
                        color: '#4A4A4A',
                    },
                    headerTintColor: '#000000',
                    headerShown: true

                }}
            />
            <AccountStack.Screen name="ServiceCharges" component={ServiceChargeScreen}
                options={{
                    headerTransparent: true,
                    headerTitle: 'Service Charges',
                    headerTitleStyle: {
                        fontFamily: 'Open Sans',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        fontSize: 18,
                        lineHeight: 25,
                        textAlign: 'center',
                        color: '#4A4A4A',
                    },
                    headerTintColor: '#000000',
                    headerShown: true

                }}
            />
            <AccountStack.Screen name="CustomerReview" component={CustomerReviewScreen}
                options={{
                    headerTransparent: true,
                    headerTitle: 'Customer Review',
                    headerTitleStyle: {
                        fontFamily: 'Open Sans',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        fontSize: 18,
                        lineHeight: 25,
                        textAlign: 'center',
                        color: '#4A4A4A',
                    },
                    headerTintColor: '#000000',
                    headerShown: true
                }}
            />
            <AccountStack.Screen name="E-Wallet" component={DummyScreen}
                options={{
                    headerTintColor: '#000000',
                    headerShown: true,
                }}
            />
            <AccountStack.Screen name="FAQ" component={FAQScreen}
                options={{
                    headerTitle: 'Frequently Asked Questions',
                    headerTitleStyle: {
                        fontFamily: 'Open Sans',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        fontSize: 18,
                        lineHeight: 25,
                        textAlign: 'center',
                        color: '#4A4A4A',
                    },

                    headerTintColor: '#000000',
                    headerTransparent: false,
                    headerShown: true
                }}
            />
            <AccountStack.Screen name="ContactUs" component={ContactUsScreen}
                options={{
                    headerTitle: 'Contact Us',
                    headerTitleStyle: {
                        fontFamily: 'Open Sans',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        fontSize: 18,
                        lineHeight: 25,
                        textAlign: 'center',
                        color: '#4A4A4A',
                    },
                    headerTintColor: '#000000',
                    headerTransparent: false,
                    headerShown: true
                }}
            />
            <AccountStack.Screen name="ChangePassword" component={ChangePasswordScreen}
                options={{
                    headerTitle: 'Change Password',
                    headerTitleStyle: {
                        fontFamily: 'Open Sans',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        fontSize: 18,
                        lineHeight: 25,
                        textAlign: 'center',
                        color: '#4A4A4A',
                    },
                    headerTintColor: '#000000',
                    headerTransparent: false,
                    headerShown: true
                }}
            />
        </AccountStack.Navigator>
    )
}

const VitalSignTopTabNavigator = ({ navigation, route }) => {
    const { order_no, user_id, tenant_id, episode_date, encounter_date, id_number } = route.params;

    return (
        <VitalSignTab.Navigator initialRouteName="BloodPressure"
            tabBarOptions={{
                style: {
                    backgroundColor: activeTintLabelColor,
                },
                labelStyle: { color: 'white' },
                indicatorStyle: { color: 'white' },
                scrollEnabled: true,
            }}>
            <VitalSignTab.Screen name='BloodPressure' component={BloodPressureScrren}
                options={{ title: 'Blood Pressure' }}
                initialParams={
                    {
                        order_no: order_no,
                        user_id: user_id,
                        tenant_id: tenant_id,
                        episode_date: episode_date,
                        encounter_date: encounter_date,
                        id_number: id_number
                    }
                }
            />
            <VitalSignTab.Screen name='BloodGlucose' component={BloodGlucoseScreen}
                options={{ title: 'Blood Glucose' }}
                initialParams={
                    {
                        order_no: order_no,
                        user_id: user_id,
                        tenant_id: tenant_id,
                        episode_date: episode_date,
                        encounter_date: encounter_date,
                        id_number: id_number
                    }
                }
            />
            <VitalSignTab.Screen name='BodyTemperature' component={BodyTemperatureScreen}
                options={{ title: 'Body Temperature' }}
                initialParams={
                    {
                        order_no: order_no,
                        user_id: user_id,
                        tenant_id: tenant_id,
                        episode_date: episode_date,
                        encounter_date: encounter_date,
                        id_number: id_number
                    }
                }
            />
             <VitalSignTab.Screen name='Cholesterol' component={CholesterolScreen}
                options={{ title: 'Cholesterol' }}
                initialParams={
                    {
                        order_no: order_no,
                        user_id: user_id,
                        tenant_id: tenant_id,
                        episode_date: episode_date,
                        encounter_date: encounter_date,
                        id_number: id_number
                    }
                }
            />
            <VitalSignTab.Screen name='OxygenSaturation' component={OxygenSaturationScreen}
                options={{ title: 'Oxygen Saturation' }}
                initialParams={
                    {
                        order_no: order_no,
                        user_id: user_id,
                        tenant_id: tenant_id,
                        episode_date: episode_date,
                        encounter_date: encounter_date,
                        id_number: id_number
                    }
                }
            />
            <VitalSignTab.Screen name='RespiratoryRate' component={RespiratoryRateScreen}
                options={{ title: 'Respiratory Rate' }}
                initialParams={
                    {
                        order_no: order_no,
                        user_id: user_id,
                        tenant_id: tenant_id,
                        episode_date: episode_date,
                        encounter_date: encounter_date,
                        id_number: id_number
                    }
                }
            />
            <VitalSignTab.Screen name='WeightHeight' component={WeightHeightBmiScreen}
                options={{ title: 'Others' }}
                initialParams={
                    {
                        order_no: order_no,
                        user_id: user_id,
                        tenant_id: tenant_id,
                        episode_date: episode_date,
                        encounter_date: encounter_date,
                        id_number: id_number
                    }
                }
            />
        </VitalSignTab.Navigator>
    )
}

// export default LoginStackNavigator

// export function Authenticate() {
//     return (
//         <NavigationContainer>
//             <LoginStackNavigator />
//         </NavigationContainer>
//     );
// }

export function HomeDoctor() {
    return (
        <NavigationContainer>
            <ModalStackNavigator />
        </NavigationContainer>
    );
}

