import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types/navigation";
import { haptics } from "@/utils/haptics";

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "ResetPassword"
>;

type Props = {
  navigation: ResetPasswordScreenNavigationProp;
  route: { params: { email: string; otp?: string } };
};

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email, otp } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    validatePassword(password);
  };

  const isPasswordValid = () => {
    return (
      passwordStrength.hasMinLength &&
      passwordStrength.hasUpperCase &&
      passwordStrength.hasLowerCase &&
      passwordStrength.hasNumber &&
      passwordStrength.hasSpecialChar
    );
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      haptics.error();
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isPasswordValid()) {
      haptics.error();
      Alert.alert(
        "Weak Password",
        "Please ensure your password meets all the requirements"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      haptics.error();
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      haptics.light();

      // TODO: Call your reset password API here
      // const result = await resetPassword({
      //   email,
      //   otp,
      //   newPassword
      // }).unwrap();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      haptics.success();
      Alert.alert("Success", "Your password has been reset successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to login
            navigation.navigate("Login");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Reset password error:", error);
      haptics.error();

      let errorMessage = "Failed to reset password";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      Alert.alert("Reset Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    haptics.light();
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    haptics.light();
    setShowConfirmPassword(!showConfirmPassword);
  };

  const PasswordRequirement = ({
    met,
    text,
  }: {
    met: boolean;
    text: string;
  }) => (
    <View style={styles.requirementRow}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={met ? "#34C759" : "#8E8E93"}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              haptics.light();
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Image
            source={require("@/assets/images/forgot-password.png")}
            style={styles.authImage}
          />

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>New Password?</Text>
              <Text style={styles.subtitle}>
                Your new password must be different from previously used
                passwords and meet all the requirements below.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* New Password Input */}
              <View>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="enter your new password"
                    placeholderTextColor="#C7C7CC"
                    value={newPassword}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showNewPassword}
                    editable={!isLoading}
                    returnKeyType="next"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={toggleNewPasswordVisibility}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Requirements */}
              {newPassword.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>
                    Password Requirements:
                  </Text>
                  <PasswordRequirement
                    met={passwordStrength.hasMinLength}
                    text="At least 8 characters"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasUpperCase}
                    text="One uppercase letter"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasLowerCase}
                    text="One lowercase letter"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasNumber}
                    text="One number"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasSpecialChar}
                    text="One special character (!@#$%^&*)"
                  />
                </View>
              )}

              {/* Confirm Password Input */}
              <View>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="re-enter your new password"
                    placeholderTextColor="#C7C7CC"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                    returnKeyType="done"
                    autoCapitalize="none"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={toggleConfirmPasswordVisibility}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 &&
                  newPassword !== confirmPassword && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                  )}
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  isLoading && styles.resetButtonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.resetButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Copyright section */}
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © 2025 Estate Resident Management App (ERMA). All Rights Reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingTop: 32,
    paddingBottom: 24,
    marginTop: -30,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
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
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  eyeIcon: {
    padding: 4,
  },
  requirementsContainer: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  requirementMet: {
    color: "#34C759",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: "#0047FF",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  copyrightContainer: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  copyrightText: {
    color: "#808188",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    fontWeight: "400",
  },
});
