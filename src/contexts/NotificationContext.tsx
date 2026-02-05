import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { 
  registerForPushNotificationsAsync, 
  setupNotificationListeners,
  clearBadge 
} from '@/services/notifications';
import { useRegisterPushTokenMutation } from '@/store/api/notificationsApi';

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  lastNotificationResponse: Notifications.NotificationResponse | undefined;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: undefined,
  notification: undefined,
  lastNotificationResponse: undefined,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const [lastNotificationResponse, setLastNotificationResponse] = useState<
    Notifications.NotificationResponse
  >();
  
  const [registerToken] = useRegisterPushTokenMutation();
  const notificationListener = useRef<Notifications.Subscription>(null);
  const responseListener = useRef<Notifications.Subscription>(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Register token with backend
        registerToken({ token, platform: Platform.OS })
          .unwrap()
          .then(() => console.log('Push token registered'))
          .catch((error) => console.error('Failed to register push token:', error));
      }
    });

    // Setup listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('ðŸ“¬ Notification received:', notification);
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('ðŸ‘† Notification tapped:', response);
        setLastNotificationResponse(response);
        
        // Clear badge when notification is tapped
        clearBadge();
      }
    );

    return () => {
      if (notificationListener.current) {
        // Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        // Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        expoPushToken, 
        notification,
        lastNotificationResponse 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
