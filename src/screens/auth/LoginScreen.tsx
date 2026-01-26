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
  ScrollView,
} from "react-native";
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types/navigation";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { haptics } from "@/utils/haptics";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      haptics.error();
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      haptics.light();

      // Call login API
      const result = await login({
        email: emailOrPhone,
        password,
      }).unwrap();

      if (__DEV__) {
        console.log("Login successful:", result.user.fullname);
        console.log("Account type:", result.user.accountType);
        console.log("Role mapped to:", result.user.role);
        console.log("Resident ID:", result.user.residentId);
        console.log("Company:", result.user.companyName);
      }

      // Store credentials in Redux (with refresh token)
      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
          rememberMe,
        })
      );

      haptics.success();

      // Navigation will happen automatically via AppNavigator
      // based on isAuthenticated state
    } catch (error: any) {
      if (__DEV__) {
        console.error("Login error:", error);
      }

      haptics.error();

      // Handle different error types
      let errorMessage = "Invalid credentials";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === "FETCH_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      Alert.alert("Login Failed", errorMessage);
    }
  };

  const toggleRememberMe = () => {
    haptics.light();
    setRememberMe(!rememberMe);
  };

  const togglePasswordVisibility = () => {
    haptics.light();
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "height" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Image
            source={require("@/assets/images/auth.png")}
            style={styles.authImage}
            resizeMode="contain"
          />
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to access your estate management dashboard and stay
                connected with your community.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email/Phone Input */}
              <View>
                <Text style={styles.label}>Email / Telephone Number</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="enter your email or telephone number."
                    placeholderTextColor="#C7C7CC"
                    value={emailOrPhone}
                    onChangeText={setEmailOrPhone}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="enter your password"
                    placeholderTextColor="#C7C7CC"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={togglePasswordVisibility}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={toggleRememberMe}
                  disabled={isLoading}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    navigation.navigate("ForgotPassword");
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Copyright section */}
            <View style={styles.copyrightContainer}>
              <Text style={styles.copyrightText}>
                © 2025 Estate Resident Management App (ERMA). All Rights Reserved.
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  authImage: {
    width: "100%",
    height: 300,
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
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    fontStyle: "italic",
    paddingHorizontal: 0,
  },
  form: {
    gap: 20,
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
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C7C7CC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  rememberMeText: {
    fontSize: 13,
    color: "#000",
  },
  forgotPasswordText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "400",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    height: 56,
    borderRadius: 12,
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
  copyrightContainer: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  copyrightText: {
    color: "#8E8E93",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
  },
});
