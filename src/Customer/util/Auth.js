import AsyncStorage from '@react-native-community/async-storage';

export const isLogin = async () => {

    try {
        const loginStatus = await AsyncStorage.getItem('loginStatus')
        // const customerId = await AsyncStorage.getItem('customerId')
        if (loginStatus === 'true') {
            return true;
        }
        else {
            return false;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const getCustomerId = async () => {
    try {
        const customerId = await AsyncStorage.getItem('customerId')
        if (customerId !== null) {
            return customerId;
        }
        else {
            return '';
        }
    }
    catch (e) {
        console.log(e);
        return '';
    }
}

export const getUserType = async () => {
    try {
        const userType = await AsyncStorage.getItem('userType')
        if (userType !== null) {
            return userType.toString();
        }
        else {
            return '';
        }
    }
    catch (e) {
        console.log(e);
        return '';
    }
}

export const getUserId = async () => {
    try {
        const userId = await AsyncStorage.getItem('userId')
        if (userId !== null) {
            return userId;
        }
        else {
            return '';
        }
    }
    catch (e) {
        console.log(e);
        return '';
    }
}

export const logout = async () => {

    try {
        await AsyncStorage.clear()
        // await AsyncStorage.multiRemove(['customerId', 'userType', 'loginStatus', 'userId']);
    }
    catch (e) {
        console.log(e);
    }

}
