import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useChangePasswordMutation } from "@/store/api/authApi";
import { useGetResidentQuery } from "@/store/api/residentApi";
import { clearState } from "@/store/mmkvStorage";
import { haptics } from "@/utils/haptics";

export default function SecuritySettingsScreen({ navigation }: any) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const residentId = user?.residentId;

  // Fetch resident data for profile photo
  const { data: resident } = useGetResidentQuery(residentId!, {
    skip: !residentId,
  });

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          haptics.medium();
          clearState("auth");
          dispatch(logout());
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    haptics.light();
    navigation.navigate("SecurityEditProfile");
  };

  const handleChangePassword = () => {
    haptics.light();
    setShowPasswordModal(true);
  };

  const handleSubmitPasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      haptics.error();
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      haptics.error();
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      haptics.error();
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    try {
      haptics.light();
      await changePassword({ currentPassword, newPassword }).unwrap();
      haptics.success();
      Alert.alert("Success", "Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      haptics.error();
      Alert.alert("Error", error?.data?.message || "Failed to change password");
    }
  };

  const handleComplaints = () => {
    haptics.light();
    navigation.navigate("Complaints");
  };

  const handleNotifications = () => {
    haptics.light();
    navigation.navigate("Notifications");
  };

  const handleTerms = () => {
    haptics.light();
    navigation.navigate("Terms");
  };

  const handlePrivacy = () => {
    haptics.light();
    navigation.navigate("Privacy");
  };

  // Menu sections for security personnel
  const menuSections = [
    {
      title: "ACCOUNT SETTINGS",
      items: [
        {
          icon: "person-outline",
          title: "Profile",
          onPress: handleEditProfile,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
        {
          icon: "key-outline",
          title: "Change Password",
          onPress: handleChangePassword,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
      ],
    },
    {
      title: "ESTATE SERVICES",
      items: [
        {
          icon: "chatbox-ellipses-outline",
          title: "Complaints",
          onPress: handleComplaints,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
        {
          icon: "megaphone-outline",
          title: "Notifications & Announcements",
          onPress: handleNotifications,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
      ],
    },
    {
      title: "ABOUT APPLICATION",
      items: [
        {
          icon: "document-text-outline",
          title: "Terms & Conditions",
          onPress: handleTerms,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
        {
          icon: "document-text-outline",
          title: "Privacy Policy",
          onPress: handlePrivacy,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {resident?.signedUrl ? (
              <Image
                source={{ uri: resident.signedUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="shield-checkmark" size={48} color="#007AFF" />
              </View>
            )}
          </View>
          <Text style={styles.name}>{user?.name || "James Myles"}</Text>
          <Text style={styles.role}>Security Personnel</Text>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 &&
                    styles.menuItemLast,
                  ]}
                  onPress={() => {
                    haptics.light();
                    item.onPress();
                  }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.iconBg },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.iconColor}
                    />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  editable={!isChangingPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  editable={!isChangingPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isChangingPassword}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isChangingPassword && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitPasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 16,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8F1FF",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#8E8E93",
  },
  sectionHeader: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#fff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 16,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
