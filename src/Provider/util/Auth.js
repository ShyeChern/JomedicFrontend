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

export const getTenantId = async () => {
    try {
        const tenantId = await AsyncStorage.getItem('tenantId')
        if (tenantId !== null) {
            return tenantId;
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

export const getTenantType = async () => {
    try {
        const tenantType = await AsyncStorage.getItem('tenantType')
        if (tenantType !== null) {
            return tenantType;
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
    }
    catch (e) {
        console.log(e);
    }

}
