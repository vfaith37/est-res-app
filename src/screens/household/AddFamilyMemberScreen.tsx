import { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useCreateFamilyMemberMutation } from '@/store/api/householdApi';
import { haptics } from '@/utils/haptics';

export default function AddFamilyMemberScreen() {
  const navigation = useNavigation<any>();

  // Multi-step form state
  const [currentSection, setCurrentSection] = useState(1); // 1 or 2

  // Section 1: Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // Section 2: Employment Information
  const [employmentStatus, setEmploymentStatus] = useState<'Employed' | 'Unemployed' | 'Self-employed' | 'Student' | ''>('');
  const [jobTitle, setJobTitle] = useState('');
  const [employerName, setEmployerName] = useState('');

  const [createMember, { isLoading }] = useCreateFamilyMemberMutation();

  const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'Guardian', 'Dependent', 'Other'];

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        haptics.success();
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleChoosePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Photo library permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        haptics.success();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert(
      'Passport Photograph',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Device', onPress: handleChoosePhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateSection1 = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter last name');
      return false;
    }
    if (!gender) {
      Alert.alert('Error', 'Please select gender');
      return false;
    }
    if (!dob) {
      Alert.alert('Error', 'Please select date of birth');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return false;
    }
    if (!relationship) {
      Alert.alert('Error', 'Please select relationship');
      return false;
    }
    return true;
  };

  const validateSection2 = () => {
    if (!employmentStatus) {
      Alert.alert('Error', 'Please select employment status');
      return false;
    }
    // Job title and employer name are optional
    return true;
  };

  const handleNext = () => {
    if (validateSection1()) {
      haptics.light();
      setCurrentSection(2);
    } else {
      haptics.error();
    }
  };

  const handlePrevious = () => {
    haptics.light();
    setCurrentSection(1);
  };

  const handleSubmit = async () => {
    if (!validateSection2()) {
      haptics.error();
      return;
    }

    try {
      haptics.light();
      // After validation, we know these values are not empty strings
      await createMember({
        firstName,
        lastName,
        gender: gender as 'Male' | 'Female', // Validated to not be empty
        dateOfBirth: dob?.toISOString(),
        phone,
        email,
        relationship,
        photo: photo || undefined, // Convert null to undefined
        employmentStatus: employmentStatus as 'Employed' | 'Unemployed' | 'Self-employed' | 'Student', // Validated
        jobTitle: jobTitle.trim() || undefined,
        employerName: employerName.trim() || undefined,
      }).unwrap();

      haptics.success();
      Alert.alert('Success', 'Family member added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      haptics.error();
      Alert.alert('Error', error?.data?.message || 'Failed to add family member');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, currentSection >= 1 && styles.progressStepActive]}>
              <Text style={[styles.progressStepNumber, currentSection >= 1 && styles.progressStepNumberActive]}>1</Text>
            </View>
            <View style={[styles.progressLine, currentSection >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressStep, currentSection >= 2 && styles.progressStepActive]}>
              <Text style={[styles.progressStepNumber, currentSection >= 2 && styles.progressStepNumberActive]}>2</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, currentSection === 1 && styles.progressLabelActive]}>Personal</Text>
            <Text style={[styles.progressLabel, currentSection === 2 && styles.progressLabelActive]}>Employment</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Section 1: Personal Information */}
          {currentSection === 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              {/* Photo Upload */}
              <View style={styles.photoContainer}>
                {photo ? (
                  <TouchableOpacity onPress={handlePhotoOptions} style={styles.photoWrapper}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <View style={styles.photoOverlay}>
                      <Ionicons name="camera" size={24} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.photoPlaceholder} onPress={handlePhotoOptions}>
                    <Ionicons name="camera-outline" size={40} color="#8E8E93" />
                    <Text style={styles.photoPlaceholderText}>Add Passport Photo</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter first name"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter last name"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.selectButton, gender === 'Male' && styles.selectButtonActive]}
                    onPress={() => { haptics.light(); setGender('Male'); }}
                    disabled={isLoading}
                  >
                    <Text style={[styles.selectButtonText, gender === 'Male' && styles.selectButtonTextActive]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectButton, gender === 'Female' && styles.selectButtonActive]}
                    onPress={() => { haptics.light(); setGender('Female'); }}
                    disabled={isLoading}
                  >
                    <Text style={[styles.selectButtonText, gender === 'Female' && styles.selectButtonTextActive]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => { haptics.light(); setShowDobPicker(true); }}
                  disabled={isLoading}
                >
                  <Text style={[styles.dateButtonText, !dob && styles.dateButtonPlaceholder]}>{formatDate(dob)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {showDobPicker && (
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDobPicker(false);
                    if (selectedDate) setDob(selectedDate);
                  }}
                  maximumDate={new Date()}
                />
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship <Text style={styles.required}>*</Text></Text>
                <View style={styles.roleContainer}>
                  {relationships.map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={[styles.roleButton, relationship === rel && styles.roleButtonActive]}
                      onPress={() => { haptics.light(); setRelationship(rel); }}
                      disabled={isLoading}
                    >
                      <Text style={[styles.roleText, relationship === rel && styles.roleTextActive]}>{rel}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Section 2: Employment Information */}
          {currentSection === 2 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Employment Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employment Status <Text style={styles.required}>*</Text></Text>
                <View style={styles.roleContainer}>
                  {['Employed', 'Unemployed', 'Self-employed', 'Student'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.roleButton, employmentStatus === status && styles.roleButtonActive]}
                      onPress={() => { haptics.light(); setEmploymentStatus(status as any); }}
                      disabled={isLoading}
                    >
                      <Text style={[styles.roleText, employmentStatus === status && styles.roleTextActive]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter job title"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employer Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter employer name"
                  value={employerName}
                  onChangeText={setEmployerName}
                  editable={!isLoading}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer with Navigation Buttons */}
        <View style={styles.footer}>
          {currentSection === 1 ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handlePrevious}
                disabled={isLoading}
              >
                <Ionicons name="arrow-back" size={20} color="#007AFF" />
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Add Member</Text>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  progressContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#007AFF',
  },
  progressStepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  progressStepNumberActive: {
    color: '#fff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#007AFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  progressLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 160,
    borderRadius: 12,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'center',
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  dateButtonPlaceholder: {
    color: '#8E8E93',
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleText: {
    fontSize: 14,
    color: '#000',
  },
  roleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#007AFF',
  },
});
