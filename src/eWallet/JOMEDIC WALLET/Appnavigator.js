import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CardStyleInterpolators } from '@react-navigation/stack';

import LoginScreen from './login';
import VerificationScreen from './verify';
import BalanceScreen from './balance';
import AccountInfo from './accountInfo';
import PaymentMethod from './paymentMethod';
import PinReload from './pinReload';
import Topup from './topup';
import ActivateScreen from './activate';
import TransactionHistoryScreen from './transactionHistory';
import Details from './details';
import TransferMoneyScreen from './transferMoney';
import WithdrawMoneyScreen from './withdrawMoney';

// import { AsyncStorage } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

const AuthContext = React.createContext();

function SplashScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    // bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      signUp: async data => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
    }),
    []
  );

  return (
      <Stack.Navigator initialRouteName={"Balance"}
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false
          }} />
        <Stack.Screen
          name="Verify"
          component={VerificationScreen}
          options={{
            headerShown: false
          }} />
        <Stack.Screen
          name="Balance"
          component={BalanceScreen}
          options={{
            headerShown: false
          }} />
        
    
        <Stack.Screen name="AccountInfo" component={AccountInfo} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
        <Stack.Screen name="PinReload" component={PinReload} />
        <Stack.Screen name="Topup" component={Topup} />
        <Stack.Screen name="Activate" component={ActivateScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="TransferMoney" component={TransferMoneyScreen} />
        <Stack.Screen name="WithdrawMoney" component={WithdrawMoneyScreen} />
      </Stack.Navigator>
  );
}

