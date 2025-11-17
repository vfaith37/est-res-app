import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useChangePasswordMutation } from '@/store/api/authApi';
import { clearState } from '@/store/mmkvStorage';
import { haptics } from '@/utils/haptics';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          haptics.medium();
          clearState('auth');
          dispatch(logout());
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    haptics.light();
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    haptics.light();
    setShowPasswordModal(true);
  };

  const handleSubmitPasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      haptics.error();
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      haptics.error();
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      haptics.error();
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    try {
      haptics.light();
      await changePassword({ currentPassword, newPassword }).unwrap();
      haptics.success();
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      haptics.error();
      Alert.alert('Error', error?.data?.message || 'Failed to change password');
    }
  };

  const handleFamilyMembers = () => {
    haptics.light();
    navigation.navigate('FamilyMembersList');
  };

  const handleDomesticStaff = () => {
    haptics.light();
    navigation.navigate('DomesticStaffList');
  };

  const handleEstateVendors = () => {
    haptics.light();
    navigation.navigate('EstateVendors');
  };

  const handleEstateDrivers = () => {
    haptics.light();
    Alert.alert('Estate Drivers', 'Estate drivers list coming soon!');
  };

  const handleEmergencies = () => {
    haptics.light();
    navigation.navigate('EmergencyList');
  };

  const handleComplaints = () => {
    haptics.light();
    Alert.alert('Complaints', 'Complaint system coming soon!');
  };

  const handleNotifications = () => {
    haptics.light();
    navigation.navigate('Notifications');
  };

  const handleGenerateReport = () => {
    haptics.light();
    Alert.alert('Generate Report', 'Report generation coming soon!');
  };

  const handleTerms = () => {
    haptics.light();
    Alert.alert('Terms & Conditions', 'Terms and conditions coming soon!');
  };

  const handlePrivacy = () => {
    haptics.light();
    Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'security':
        return 'Security Personnel';
      case 'home_head':
        return 'Home Head';
      case 'family_member':
        return 'Family Member';
      default:
        return role;
    }
  };

  // Menu sections structure
  const menuSections = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', title: 'Profile', onPress: handleEditProfile },
        { icon: 'lock-closed-outline', title: 'Change Password', onPress: handleChangePassword },
      ],
    },
    {
      title: 'Household & Vendors',
      items: [
        { icon: 'people-outline', title: 'Family Member List', onPress: handleFamilyMembers },
        { icon: 'home-outline', title: 'Domestic Staff List', onPress: handleDomesticStaff },
        { icon: 'storefront-outline', title: 'Estate Vendors', onPress: handleEstateVendors },
        { icon: 'car-outline', title: 'Estate Drivers', onPress: handleEstateDrivers },
      ],
    },
    {
      title: 'Estate Services',
      items: [
        { icon: 'alert-circle-outline', title: 'Emergencies', onPress: handleEmergencies },
        { icon: 'megaphone-outline', title: 'Complaints', onPress: handleComplaints },
        { icon: 'notifications-outline', title: 'Notifications & Announcements', onPress: handleNotifications },
      ],
    },
    {
      title: 'Reports',
      items: [
        { icon: 'document-text-outline', title: 'Generate Report', onPress: handleGenerateReport },
      ],
    },
    {
      title: 'About Application',
      items: [
        { icon: 'document-outline', title: 'Terms & Conditions', onPress: handleTerms },
        { icon: 'shield-checkmark-outline', title: 'Privacy Policy', onPress: handlePrivacy },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{getRoleName(user?.role || '')}</Text>
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
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => {
                    haptics.light();
                    item.onPress();
                  }}
                >
                  <Ionicons name={item.icon as any} size={22} color="#007AFF" />
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
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
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
                style={[styles.submitButton, isChangingPassword && styles.submitButtonDisabled]}
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#34C75920',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  unitBadge: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  unitText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
