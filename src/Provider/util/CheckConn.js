import {Alert} from 'react-native';

export const handleNoInternetSignin = () =>
  Alert.alert(
    'Sign-in failed',
    'Sorry, unable to sign in. Please check your internet connection.',
  );

export const handleNoInternetSignup = () =>
  Alert.alert(
    'Sign-up failed',
    'Sorry, unable to sign up. Please check your internet connection.',
  );

export const handleNoInternet = () =>
  Alert.alert(
    'Failed',
    'Sorry, unable to proceed. Please check your internet connection.',
  );
