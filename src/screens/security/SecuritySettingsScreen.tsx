import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useChangePasswordMutation } from '@/store/api/authApi';
import { clearState } from '@/store/mmkvStorage';
import { haptics } from '@/utils/haptics';

export default function SecuritySettingsScreen({ navigation }: any) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

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
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
    // TODO: Navigate to edit profile screen when created
    // navigation.navigate('EditProfile');
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
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to change password'
      );
    }
  };

  const handleEstateVendors = () => {
    haptics.light();
    Alert.alert('Estate Vendors', 'Estate vendors list coming soon!');
    // TODO: Navigate to estate vendors when ready
  };

  const handleComplaints = () => {
    haptics.light();
    Alert.alert('Complaints', 'Complaint system coming soon!');
  };

  const handleNotifications = () => {
    haptics.light();
    Alert.alert('Notifications', 'Notifications coming soon!');
  };

  const handleTerms = () => {
    haptics.light();
    Alert.alert('Terms & Conditions', 'Terms and conditions coming soon!');
  };

  const handlePrivacy = () => {
    haptics.light();
    Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
  };

  // Menu sections for security personnel
  const menuSections = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', title: 'Profile', onPress: handleEditProfile },
        {
          icon: 'lock-closed-outline',
          title: 'Change Password',
          onPress: handleChangePassword,
        },
      ],
    },
    {
      title: 'Estate Services',
      items: [
        {
          icon: 'storefront-outline',
          title: 'Estate Vendors',
          onPress: handleEstateVendors,
        },
        {
          icon: 'megaphone-outline',
          title: 'Complaints',
          onPress: handleComplaints,
        },
        {
          icon: 'notifications-outline',
          title: 'Notifications & Announcements',
          onPress: handleNotifications,
        },
      ],
    },
    {
      title: 'About Application',
      items: [
        {
          icon: 'document-outline',
          title: 'Terms & Conditions',
          onPress: handleTerms,
        },
        {
          icon: 'shield-checkmark-outline',
          title: 'Privacy Policy',
          onPress: handlePrivacy,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Profile Header - Section 1 */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={48} color="#007AFF" />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield" size={16} color="#fff" />
            <Text style={styles.roleText}>Security Personnel</Text>
          </View>
        </View>

        {/* Menu Sections - Sections 2, 3, 4 */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 32,
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
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#000',
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
