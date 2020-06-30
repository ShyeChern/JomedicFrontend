import { PermissionsAndroid } from 'react-native';

export async function requestVideoCallPermission() {
    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return granted;
    } catch (err) {
        console.warn(err);
    }
}

export async function requestImagePickerPermission() {
    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return granted;
    } catch (err) {
        console.warn(err);
    }
}

export async function requestLocationPermission() {
    try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted;
    } catch (err) {
        console.warn(err);
    }
}

export async function requestWritePdfPermission() {
    try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        return granted;
    } catch (err) {
        console.warn(err);
    }
}
