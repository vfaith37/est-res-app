import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useNotifications } from "@/contexts/NotificationContext";
import { storage } from "@/store/mmkvStorage";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";
import type { RootStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const rememberMe = useAppSelector((state) => state.auth.rememberMe);
  const dispatch = useAppDispatch();
  const { lastNotificationResponse } = useNotifications();
  const navigationRef = React.useRef<any>(null);

  // Check for saved credentials on app start
  useEffect(() => {
    const checkSavedCredentials = async () => {
      try {
        // Load auth state from MMKV
        const savedAuthString = storage.getString("auth");

        if (savedAuthString) {
          const savedAuth = JSON.parse(savedAuthString);

          // Only restore session if rememberMe was true
          if (savedAuth.rememberMe && savedAuth.token && savedAuth.user) {
            dispatch(
              setCredentials({
                user: savedAuth.user,
                token: savedAuth.token,
                rememberMe: true,
              })
            );
          }
        }
      } catch (error) {
        console.error("Error checking saved credentials:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSavedCredentials();
  }, [dispatch]);

  // Handle notification navigation
  useEffect(() => {
    if (lastNotificationResponse && navigationRef.current && isAuthenticated) {
      const data = lastNotificationResponse.notification.request.content.data;

      // Handle navigation based on notification type
      switch (data.type) {
        case "visitor":
          navigationRef.current?.navigate("Main", {
            screen: "Visitors",
            params: {
              screen: "VisitorsList",
            },
          });
          break;

        case "maintenance":
          navigationRef.current?.navigate("Main", {
            screen: "Maintenance",
            params: {
              screen: "MaintenanceList",
            },
          });
          break;

        case "payment":
          navigationRef.current?.navigate("Main", {
            screen: "Payments",
            params: {
              screen: "PaymentsList",
            },
          });
          break;

        case "emergency":
          console.log("Emergency notification:", data);
          break;

        default:
          navigationRef.current?.navigate("Main", {
            screen: "Home",
          });
      }
    }
  }, [lastNotificationResponse, isAuthenticated]);

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return null; // You can return a splash screen component here
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
