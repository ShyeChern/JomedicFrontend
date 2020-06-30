import React, { useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './login';
import VerificationScreen from './verify';
import BalanceScreen from './balance';
import TopupScreen from './topup';
import TopupWalletScreen from './onlineBanking';
import ActivateScreen from './activate';
import TransactionHistoryScreen from './transactionHistory';
import ReceiptScreen from './balance';
import SendMoneyScreen from './sendMoney';
import ReceiveMoneyScreen from './receiveMoney';
import AccountScreen from './account';


import AsyncStorage from '@react-native-community/async-storage';

import { AuthContext } from './context';

const AuthStack = createStackNavigator();
const Stack = createStackNavigator();

const AuthStackScreen = () => (
    <AuthStack.Navigator>
        <AuthStack.Screen name="Login"
            component={LoginScreen}
            options={{
                headerShown: false
            }} />
        <AuthStack.Screen name="Verify"
            component={VerificationScreen}
            options={{
                headerShown: false,
            }} />
    </AuthStack.Navigator>
);

const StackScreen = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Balance"
            component={BalanceScreen}
            options={{
                headerShown: false
            }} />
        <Stack.Screen name="Topup" component={TopupScreen} />
        <Stack.Screen name="TopupWallet" component={TopupWalletScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
        <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
        <Stack.Screen name="ReceiveMoney" component={ReceiveMoneyScreen} />
    </Stack.Navigator>
)

export default function App() {

    // const [userToken, setUserToken] = useState('');
    // const [isLoading, setIsLoading] = useState(true);

    const initialLoginState = {
        isLoading: true,
        userName: null,
        userToken: null,
    };

    const loginReducer = (prevState, action) => {
        switch (action.type) {
            case 'RETRIEVE_TOKEN':
                return {
                    ...prevState,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGIN':
                return {
                    ...prevState,
                    userName: action.id,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGOUT':
                return {
                    ...prevState,
                    userName: null,
                    userToken: 'null',
                    isLoading: false,
                };
        }
    };

    const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

    const authContext = React.useMemo(() => ({
        signIn: async (foundUser) => {
            const userToken = String(foundUser); 
            const userName = foundUser;

            try {
                await AsyncStorage.setItem('userToken', userToken);
            } catch (e) {
                console.log(e);
            }
            dispatch({ type: 'LOGIN', id: userName, token: userToken });
        },
        signOut: async () => {
            try {
                await AsyncStorage.setItem('userToken', 'null');
            } catch (e) {
                console.log(e);
            }
            dispatch({ type: 'LOGOUT' });
        },
    }), []);


    useEffect(() => {
        setTimeout(async () => {
            let userToken;
            userToken = null;
            try {
                userToken = await AsyncStorage.getItem('userToken');
            } catch (e) {
                console.log(e);
            }
            dispatch({ type: 'RETRIEVE_TOKEN', token: userToken });
        }, 1000);
    }, []);

    if (loginState.isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color='#F5A623' />
            </View>
        );
    }


    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
                {loginState.userToken === 'null' ? (
                    < AuthStackScreen />
                ) : (
                        < StackScreen />
                    )}
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
