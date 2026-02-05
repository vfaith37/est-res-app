import { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types/navigation";
import { haptics } from "@/utils/haptics";
import { StatusBar } from "expo-status-bar";
import { useRequestPasswordResetMutation } from "@/store/api/authApi";

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "ForgotPassword"
>;

type Props = {
  navigation: ForgotPasswordScreenNavigationProp;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // API hook
  const [requestPasswordReset, { isLoading }] =
    useRequestPasswordResetMutation();

  const handleResetPassword = async () => {
    if (!email) {
      haptics.error();
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      haptics.error();
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      haptics.light();

      // Call password reset API
      await requestPasswordReset({ email }).unwrap();

      haptics.success();
      setEmailSent(true);

      // Navigate to OTP screen after a short delay
      setTimeout(() => {
        navigation.navigate("OTP", { email });
      }, 1500);
    } catch (error: any) {
      if (__DEV__) {
        console.error("Password reset request error:", error);
      }
      haptics.error();

      let errorMessage = "Failed to send reset email";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Image
          source={require("@/assets/images/forgot-password.png")}
          style={styles.authImage}
        />
        <View style={styles.content}>
          {emailSent ? (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={80}
                color="#34AA63"
                style={{ alignSelf: "center", marginBottom: 12 }}
              />
              <Text style={styles.title}>
                Successfully sent a reset link to your email
              </Text>
              <Text style={styles.subtitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Check {email}
              </Text>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                  { backgroundColor: "#002EE5", marginBottom: 20 },
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Resend Link</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                  {
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#E8E8EB",
                  },
                ]}
                onPress={() => navigation.navigate("OTP", { email })}
                disabled={isLoading}
              >
                <Text style={[styles.loginButtonText, { color: "#002EE5" }]}>
                  Enter OTP
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to
                reset your password
              </Text>

              <View style={{}}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="enter your email"
                    placeholderTextColor={"#C7C7CC"}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              {/* <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity> */}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  authImage: {
    width: "100%",
    height: "45%",
    alignSelf: "center",
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    marginTop: -30,
  },
  // content: {
  //   flex: 1,
  //   justifyContent: "center",
  //   paddingHorizontal: 24,
  // },
  iconContainer: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#002EE520",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    fontStyle: "italic",
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#002EE5",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#002EE5",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    // backgroundColor: "#0047FF",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

