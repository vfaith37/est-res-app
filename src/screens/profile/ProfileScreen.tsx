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

  // About Modal State
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          haptics.medium();
          
          // Clear saved auth data
          clearState('auth');
          
          // Dispatch logout action
          dispatch(logout());
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    haptics.light();
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
    // TODO: Navigate to Edit Profile screen when ready
  };

  const handleNotificationSettings = () => {
    haptics.light();
    navigation.navigate('Notifications');
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

  const handlePrivacySecurity = () => {
    haptics.light();
    Alert.alert('Privacy & Security', 'Privacy settings coming soon!');
    // TODO: Navigate to Privacy & Security screen when ready
  };

  const handleHelp = () => {
    haptics.light();
    Alert.alert(
      'Help & Support',
      'Need help?\n\nEmail: support@estatemanager.com\nPhone: +234 XXX XXX XXXX\n\nOr visit our FAQ section.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    haptics.light();
    setShowAboutModal(true);
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

  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profile', onPress: handleEditProfile },
    { icon: 'notifications-outline', title: 'Notifications', onPress: handleNotificationSettings },
    { icon: 'lock-closed-outline', title: 'Change Password', onPress: handleChangePassword },
    { icon: 'shield-checkmark-outline', title: 'Privacy & Security', onPress: handlePrivacySecurity },
    { icon: 'help-circle-outline', title: 'Help & Support', onPress: handleHelp },
    { icon: 'information-circle-outline', title: 'About', onPress: handleAbout },
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

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => {
                haptics.light();
                item.onPress();
              }}
            >
              <Ionicons name={item.icon as any} size={24} color="#000" />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

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

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About</Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowAboutModal(false);
                }}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.aboutLogoContainer}>
                <Ionicons name="home" size={60} color="#007AFF" />
              </View>
              
              <Text style={styles.aboutTitle}>Estate Manager</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
              
              <Text style={styles.aboutDescription}>
                Comprehensive estate and residence management solution for modern communities.
              </Text>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Features</Text>
                <Text style={styles.aboutText}>• Visitor Management</Text>
                <Text style={styles.aboutText}>• Maintenance Requests</Text>
                <Text style={styles.aboutText}>• Payment Tracking</Text>
                <Text style={styles.aboutText}>• Emergency Reporting</Text>
                <Text style={styles.aboutText}>• Family & Staff Management</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Contact</Text>
                <Text style={styles.aboutText}>Email: support@estatemanager.com</Text>
                <Text style={styles.aboutText}>Website: www.estatemanager.com</Text>
              </View>

              <Text style={styles.aboutCopyright}>
                © 2025 Estate Manager. All rights reserved.
              </Text>
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
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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
    marginLeft: 16,
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
  aboutLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  aboutCopyright: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
  },
});