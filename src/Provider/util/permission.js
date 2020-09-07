import { Platform } from "react-native";
import { request, requestMultiple, PERMISSIONS } from 'react-native-permissions';

export async function requestCameraAndAudioPermission() {
	try {
		if (Platform.OS === 'ios') {
			// Do nothing at the moment
		} else {
			var responses = await requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO])

			var androidCamera = responses[PERMISSIONS.ANDROID.CAMERA]
			var androidAudio = responses[PERMISSIONS.ANDROID.RECORD_AUDIO]

			if (androidCamera === 'granted' && androidAudio == 'granted') {
				return true;
			} else if (
				androidCamera === "blocked" || androidCamera === "unavailable" ||
				androidAudio === "blocked" || androidAudio === "unavailable") {
				return false;
			}
		}
		// const granted = await PermissionsAndroid.requestMultiple([
		// 	PermissionsAndroid.PERMISSIONS.CAMERA,
		// 	PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
		// ]);
		// if (
		// 	granted["android.permission.RECORD_AUDIO"] ===
		// 	PermissionsAndroid.RESULTS.GRANTED &&
		// 	granted["android.permission.CAMERA"] ===
		// 	PermissionsAndroid.RESULTS.GRANTED
		// ) {
		// 	console.log("You can use the cameras & mic");
		// 	return true
		// } else {
		// 	console.log("Permission denied");
		// 	return false
		// }
	} catch (err) {
		console.log("Fail to get camera and audio permission: ")
		console.log(err);
		return false
	}
}

export async function requestLocationPermission() {
	try {
		if (Platform.OS === 'ios') {
			var response = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
			console.log('iPhone location permission: ' + response);

			if (response === 'granted') {
				return true;
			} else if (response === 'unavailable' || response === 'blocked') {
				return false;
			}
		} else {

			var responses = await requestMultiple([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION])

			var fineLocation = responses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
			var coarseLocation = responses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION]

			if (fineLocation === 'granted' && coarseLocation == 'granted') {
				return true;
			} else if (
				fineLocation === "blocked" || fineLocation === "unavailable" ||
				coarseLocation === "blocked" || coarseLocation === "unavailable") {
				return false;
			}
			// var response = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
			// console.log('Android location permission: ' + response);

			// if (response === 'granted') {
			// 	return true;
			// } else if (response === 'unavailable' || response === 'blocked') {
			// 	return false;
			// }
		}

	} catch (err) {
		console.log("Fail to get location permission: ")
		console.log(err);
		return false
	}
}

export async function requestImagePickerPermission() {
	try {
		if (Platform.OS === 'ios') {
			// Do nothing at the moment
			return true;
		} else {
			var responses = await requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE])

			var androidCamera = responses[PERMISSIONS.ANDROID.CAMERA]
			var androidExternalStorage = responses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]

			if (androidCamera === 'granted' && androidExternalStorage == 'granted') {
				return true;
			} else if (
				androidCamera === "blocked" || androidCamera === "unavailable" ||
				androidExternalStorage === "blocked" || androidExternalStorage === "unavailable") {
				return false;
			}
		}
	} catch (err) {
		console.log("Fail to get camera and external storage permission: ")
		console.log(err);
		return false
	}
}
