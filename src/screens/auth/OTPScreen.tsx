import { useState, useRef, useEffect } from "react";
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
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types/navigation";
import { haptics } from "@/utils/haptics";
import { useVerifyOTPMutation, useResendOTPMutation } from "@/store/api/authApi";

// Constants
const OTP_CONFIG = {
  CODE_LENGTH: 6,
  TIMER_SECONDS: 60,
  AUTO_VERIFY_DELAY_MS: 500,
} as const;

type OTPScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "OTP"
>;

type Props = {
  navigation: OTPScreenNavigationProp;
  route: { params: { email: string } };
};

export default function OTPScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState(Array(OTP_CONFIG.CODE_LENGTH).fill(""));
  const [timer, setTimer] = useState(OTP_CONFIG.TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // API hooks
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  // Refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Check clipboard on mount
  useEffect(() => {
    checkClipboard();
  }, []);

  const checkClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      // Check if clipboard contains a 6-digit number
      const pattern = new RegExp(`^\\d{${OTP_CONFIG.CODE_LENGTH}}$`);
      if (pattern.test(clipboardContent.trim())) {
        Alert.alert(
          "Code Detected",
          `Would you like to use the code ${clipboardContent} from your clipboard?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Use Code",
              onPress: () => pasteFromClipboard(clipboardContent),
            },
          ]
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error reading clipboard:", error);
      }
    }
  };

  const pasteFromClipboard = async (code?: string) => {
    try {
      haptics.light();
      const clipboardContent = code || (await Clipboard.getStringAsync());

      // Extract only digits and take first OTP_CONFIG.CODE_LENGTH
      const digits = clipboardContent
        .replace(/\D/g, "")
        .slice(0, OTP_CONFIG.CODE_LENGTH);

      if (digits.length === OTP_CONFIG.CODE_LENGTH) {
        const newOtp = digits.split("");
        setOtp(newOtp);
        haptics.success();

        // Auto-verify after pasting
        setTimeout(() => {
          handleVerifyOTP(newOtp);
        }, OTP_CONFIG.AUTO_VERIFY_DELAY_MS);
      } else {
        Alert.alert(
          "Invalid Code",
          `Clipboard doesn't contain a valid ${OTP_CONFIG.CODE_LENGTH}-digit code`
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error pasting from clipboard:", error);
      }
      Alert.alert("Error", "Failed to paste from clipboard");
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste event (when multiple digits are entered at once)
    if (value.length > 1) {
      const digits = value
        .replace(/\D/g, "")
        .slice(0, OTP_CONFIG.CODE_LENGTH);
      const pastedOtp = digits.split("");

      for (
        let i = 0;
        i < pastedOtp.length && index + i < OTP_CONFIG.CODE_LENGTH;
        i++
      ) {
        newOtp[index + i] = pastedOtp[i];
      }

      setOtp(newOtp);

      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(
        index + pastedOtp.length,
        OTP_CONFIG.CODE_LENGTH - 1
      );
      inputRefs.current[nextIndex]?.focus();

      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_CONFIG.CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpArray?: string[]) => {
    const otpCode = (otpArray || otp).join("");

    if (otpCode.length !== OTP_CONFIG.CODE_LENGTH) {
      haptics.error();
      Alert.alert(
        "Error",
        `Please enter the complete ${OTP_CONFIG.CODE_LENGTH}-digit code`
      );
      return;
    }

    try {
      haptics.light();

      // Call OTP verification API
      await verifyOTP({ email, otp: otpCode }).unwrap();

      haptics.success();
      Alert.alert("Success", "OTP verified successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate to reset password screen
            navigation.navigate("ResetPassword", { email, otp: otpCode });
          },
        },
      ]);
    } catch (error: any) {
      if (__DEV__) {
        console.error("OTP verification error:", error);
      }
      haptics.error();

      let errorMessage = "Invalid OTP code";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Verification Failed", errorMessage);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    try {
      haptics.light();

      // Call resend OTP API
      await resendOTP({ email }).unwrap();

      haptics.success();
      Alert.alert("Success", "A new code has been sent to your email");

      // Reset timer and OTP
      setTimer(OTP_CONFIG.TIMER_SECONDS);
      setCanResend(false);
      setOtp(Array(OTP_CONFIG.CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      if (__DEV__) {
        console.error("Resend OTP error:", error);
      }
      haptics.error();

      let errorMessage = "Failed to resend code. Please try again.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
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
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a {OTP_CONFIG.CODE_LENGTH}-digit verification code to{" "}
              {email}. Please enter it below to continue.
            </Text>
          </View>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  (isLoading || isResending) && styles.otpInputDisabled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent: { key } }) =>
                  handleKeyPress(key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading && !isResending}
                returnKeyType={
                  index === OTP_CONFIG.CODE_LENGTH - 1 ? "done" : "next"
                }
                onSubmitEditing={
                  index === OTP_CONFIG.CODE_LENGTH - 1
                    ? () => handleVerifyOTP()
                    : undefined
                }
              />
            ))}
          </View>

          {/* Timer & Resend */}
          <View style={styles.resendContainer}>
            <Text style={styles.timerText}>
              {canResend
                ? "Didn't receive the code?"
                : `Resend code in ${formatTime(timer)}`}
            </Text>
            {canResend && (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendButton}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isLoading || isResending) && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerifyOTP()}
            disabled={isLoading || isResending}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
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
    marginTop: -30, // This makes the content overlap the image
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#F5F5F5",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  otpInputFilled: {
    borderColor: "#0047FF",
    backgroundColor: "#F0F5FF",
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  pasteButtonText: {
    fontSize: 14,
    color: "#0047FF",
    fontWeight: "600",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
  },
  resendButton: {
    fontSize: 14,
    color: "#0047FF",
    fontWeight: "600",
  },
  verifyButton: {
    backgroundColor: "#0047FF",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
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
