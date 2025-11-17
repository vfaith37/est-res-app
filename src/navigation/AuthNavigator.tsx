import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "@/screens/auth/LoginScreen";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import type { AuthStackParamList } from "@/types/navigation";
import OTPScreen from "@/screens/auth/OTPScreen";
import ResetPasswordScreen from "@/screens/auth/ResetPasswordScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: "Reset Password",
          headerShown: false,
          headerBackButtonDisplayMode: "default",
          headerBackButtonMenuEnabled: true,
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{
          title: "Enter OTP",
          headerShown: false,
          headerBackButtonDisplayMode: "default",
          headerBackButtonMenuEnabled: true,
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: "Set New Password",
          headerShown: false,
          headerBackButtonDisplayMode: "default",
          headerBackButtonMenuEnabled: true,
          headerBackVisible: true,
        }}
      />
    </Stack.Navigator>
  );
}
