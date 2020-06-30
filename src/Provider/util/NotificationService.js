import PushNotification from 'react-native-push-notification';
import { Alert } from 'react-native';

export default class NotificationService {
  //onNotificaiton is a function passed in that is to be called when a notification is to be emitted.
  constructor(onNotification) {
    this.configure(onNotification);
    this.lastId = 0;

  }

  configure(onNotification) {
    PushNotification.configure({
      onNotification: onNotification,

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  //Appears right away 
  localNotification(title, message) {
    this.lastId++;
    PushNotification.localNotification({
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      // actions: '["OK"]'
    });
  }

  //Appears after a specified time. App does not have to be open.
  scheduleNotification() {
    this.lastId++;
    PushNotification.localNotificationSchedule({
      date: new Date(Date.now() + (30 * 1000)), //30 seconds
      title: "Scheduled Notification",
      message: "My Notification Message",
      playSound: true,
      soundName: 'default',
      actions: '["Ok"]'
    });
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif() {
    PushNotification.cancelLocalNotifications({ id: '' + this.lastId });
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}
