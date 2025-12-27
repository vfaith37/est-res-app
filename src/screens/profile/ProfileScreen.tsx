import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useChangePasswordMutation } from "@/store/api/authApi";
import { useGetResidentQuery } from "@/store/api/residentApi";
import { clearState } from "@/store/mmkvStorage";
import { haptics } from "@/utils/haptics";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
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
    navigation.navigate("EditProfile");
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

  const handleFamilyMembers = () => {
    haptics.light();
    navigation.navigate("FamilyMembersList");
  };

  const handleDomesticStaff = () => {
    haptics.light();
    navigation.navigate("DomesticStaffList");
  };

  const handleEstateVendors = () => {
    haptics.light();
    navigation.navigate("EstateVendors");
  };

  const handleEstateDrivers = () => {
    haptics.light();
    Alert.alert("Estate Drivers", "Estate drivers list coming soon!");
  };

  const handleEmergencies = () => {
    haptics.light();
    navigation.navigate("EmergencyList");
  };

  const handleComplaints = () => {
    haptics.light();
    navigation.navigate("Complaints");
  };

  const handleNotifications = () => {
    haptics.light();
    navigation.navigate("Notifications");
  };

  const handleGenerateReport = () => {
    haptics.light();
    Alert.alert("Generate Report", "Report generation coming soon!");
  };

  const handleTerms = () => {
    haptics.light();
    navigation.navigate("Terms");
  };

  const handlePrivacy = () => {
    haptics.light();
    navigation.navigate("Privacy");
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "security":
        return "Security Personnel";
      case "home_head":
        return "Home Head";
      case "family_member":
        return "Family Member";
      default:
        return role;
    }
  };

  // Menu sections structure
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
      title: "HOUSEHOLD & VENDORS",
      items: [
        {
          icon: "people-outline",
          title: "Family Member List",
          onPress: handleFamilyMembers,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
        {
          icon: "home-outline",
          title: "Domestic Staff List",
          onPress: handleDomesticStaff,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
        {
          icon: "storefront-outline",
          title: "Estate Vendors",
          onPress: handleEstateVendors,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
        {
          icon: "car-outline",
          title: "Estate Drivers",
          onPress: handleEstateDrivers,
          iconBg: "#E8F1FF",
          iconColor: "#007AFF",
        },
      ],
    },
    {
      title: "ESTATE SERVICES",
      items: [
        {
          icon: "alert-circle-outline",
          title: "Emergencies",
          onPress: handleEmergencies,
          iconBg: "#FFE8E8",
          iconColor: "#FF3B30",
        },
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
      title: "REPORTS",
      items: [
        {
          icon: "document-text-outline",
          title: "Generate Report",
          onPress: handleGenerateReport,
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
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {getRoleName(user?.role || "")}
              </Text>
            </View>
            {user?.unit && (
              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>Unit {user.unit}</Text>
              </View>
            )}
          </View>
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
    backgroundColor: "#F2F2F7",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 0,
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
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "#34C75920",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: "#34C759",
    fontSize: 14,
    fontWeight: "600",
  },
  unitBadge: {
    backgroundColor: "#007AFF20",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  unitText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
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
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 12,
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
