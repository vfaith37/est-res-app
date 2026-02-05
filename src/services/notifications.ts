import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });

    // Create channels for different notification types
    await Notifications.setNotificationChannelAsync("emergency", {
      name: "Emergency Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "emergency.wav",
    });

    await Notifications.setNotificationChannelAsync("visitors", {
      name: "Visitor Notifications",
      importance: Notifications.AndroidImportance.HIGH,
    });

    await Notifications.setNotificationChannelAsync("maintenance", {
      name: "Maintenance Updates",
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync("payments", {
      name: "Payment Reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;

      console.log("Push token:", token);
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

  return () => {
    // Notifications.removeNotificationSubscription(notificationListener);
    // Notifications.removeNotificationSubscription(responseListener);
  };
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: trigger || null,
  });
}

// Helper function to send different types of notifications
export async function sendVisitorNotification(
  visitorName: string,
  time: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Visitor Arrived",
      body: `${visitorName} has arrived. Expected time: ${time}`,
      data: { type: "visitor", visitorName },
      sound: true,
    },
    trigger: null,
  });
}

export async function sendMaintenanceNotification(
  title: string,
  status: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Maintenance Update",
      body: `${title} - Status: ${status}`,
      data: { type: "maintenance", title, status },
      sound: true,
    },
    trigger: null,
  });
}

export async function sendPaymentNotification(amount: number, dueDate: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Payment Reminder",
      body: `Payment of â‚¦${amount.toLocaleString()} is due on ${dueDate}`,
      data: { type: "payment", amount, dueDate },
      sound: true,
    },
    trigger: null,
  });
}

export async function sendEmergencyNotification(message: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ðŸš¨ EMERGENCY ALERT",
      body: message,
      data: { type: "emergency", message },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancel specific notification
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

// Clear badge
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

