import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetResidentQuery, useEditResidentMutation } from '@/store/api/residentApi';
import { haptics } from '@/utils/haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId;

  if (__DEV__) {
    console.log('EditProfileScreen - user:', user);
    console.log('EditProfileScreen - residentId:', residentId);
  }

  // Fetch resident data
  const { data: resident, isLoading, isError, error } = useGetResidentQuery(residentId!, {
    skip: !residentId,
  });

  if (__DEV__) {
    console.log('useGetResidentQuery result:', {
      resident,
      isLoading,
      isError,
      error,
      hasData: !!resident
    });
  }

  // Edit mutation
  const [editResident, { isLoading: isSaving }] = useEditResidentMutation();

  // Form state - Personal Information
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappfone, setWhatsappfone] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');

  // Form state - Work Information
  const [workplacename, setWorkplacename] = useState('');
  const [workplacepost, setWorkplacepost] = useState('');
  const [workplaceaddr, setWorkplaceaddr] = useState('');

  // Initialize form with resident data
  useEffect(() => {
    if (resident) {
      setFirstname(resident.firstname || '');
      setLastname(resident.lastname || '');
      setMiddlename(resident.middlename || '');
      setPhone(resident.phone || '');
      setEmail(resident.email || '');
      setWhatsappfone(resident.whatsappfone || '');
      setDob(resident.dob ? new Date(resident.dob) : null);
      setGender(resident.gender || 'Male');
      setMaritalStatus(resident.maritalstatus || 'Single');
      setWorkplacename(resident.workplacename || '');
      setWorkplacepost(resident.workplacepost || '');
      setWorkplaceaddr(resident.workplaceaddr || '');
    }
  }, [resident]);

  const handleSave = async () => {
    if (!firstname || !lastname || !phone || !email) {
      haptics.error();
      Alert.alert('Error', 'Please fill in all required fields (First Name, Last Name, Phone, Email)');
      return;
    }

    try {
      haptics.light();
      await editResident({
        residentId: residentId!,
        data: {
          firstname,
          lastname,
          middlename,
          phone,
          email,
          whatsappfone,
          dob: dob?.toISOString(),
          gender,
          maritalstatus: maritalStatus,
          workplacename,
          workplacepost,
          workplaceaddr,
        },
      }).unwrap();

      haptics.success();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      haptics.error();
      Alert.alert('Error', error?.data?.message || 'Failed to update profile');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date of Birth';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !resident) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Failed to load profile data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {resident.signedUrl ? (
                <Image source={{ uri: resident.signedUrl }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={60} color="#C7C7CC" />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.changePhotoButton} onPress={() => {
              haptics.light();
              Alert.alert('Change Photo', 'Photo upload feature coming soon!');
            }}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter first name"
                  value={firstname}
                  onChangeText={setFirstname}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter last name"
                  value={lastname}
                  onChangeText={setLastname}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Middle Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter middle name"
                  value={middlename}
                  onChangeText={setMiddlename}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Phone Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>WhatsApp Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter WhatsApp number"
                  value={whatsappfone}
                  onChangeText={setWhatsappfone}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    haptics.light();
                    setShowDatePicker(true);
                  }}
                  disabled={isSaving}
                >
                  <Text style={[styles.dateButtonText, !dob && styles.dateButtonPlaceholder]}>
                    {formatDate(dob)}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      gender === 'Male' && styles.selectButtonActive,
                    ]}
                    onPress={() => {
                      haptics.light();
                      setGender('Male');
                    }}
                    disabled={isSaving}
                  >
                    <Text
                      style={[
                        styles.selectButtonText,
                        gender === 'Male' && styles.selectButtonTextActive,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      gender === 'Female' && styles.selectButtonActive,
                    ]}
                    onPress={() => {
                      haptics.light();
                      setGender('Female');
                    }}
                    disabled={isSaving}
                  >
                    <Text
                      style={[
                        styles.selectButtonText,
                        gender === 'Female' && styles.selectButtonTextActive,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Marital Status</Text>
                <View style={styles.buttonGroup}>
                  {['Single', 'Married', 'Divorced', 'Widowed'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.selectButton,
                        maritalStatus === status && styles.selectButtonActive,
                      ]}
                      onPress={() => {
                        haptics.light();
                        setMaritalStatus(status as any);
                      }}
                      disabled={isSaving}
                    >
                      <Text
                        style={[
                          styles.selectButtonText,
                          maritalStatus === status && styles.selectButtonTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Additional Information Section (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDITIONAL INFORMATION</Text>
            <View style={styles.sectionContent}>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>Resident ID</Text>
                <Text style={styles.readOnlyValue}>{resident.residentid}</Text>
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>Current Residential Address</Text>
                <Text style={styles.readOnlyValue}>{resident.estateaddr || 'N/A'}</Text>
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>Former Address</Text>
                <Text style={styles.readOnlyValue}>{resident.formeraddr || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Work Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WORK INFORMATION</Text>
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name of Workplace</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter workplace name"
                  value={workplacename}
                  onChangeText={setWorkplacename}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Post at Place of Work</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your position"
                  value={workplacepost}
                  onChangeText={setWorkplacepost}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Workplace Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter workplace address"
                  value={workplaceaddr}
                  onChangeText={setWorkplaceaddr}
                  multiline
                  numberOfLines={3}
                  editable={!isSaving}
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#E5E5EA',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dateButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  dateButtonPlaceholder: {
    color: '#8E8E93',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },
  selectButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  selectButtonTextActive: {
    color: '#fff',
  },
  readOnlyField: {
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  readOnlyValue: {
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
