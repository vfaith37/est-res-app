import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useCreateFamilyMemberMutation } from '@/store/api/householdApi';
import { useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';
import SuccessModal from '@/components/SuccessModal';

export default function AddFamilyMemberScreen() {
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);

  // Steps: 1 = Personal, 2 = Employment
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [lastName, setLastName] = useState('');
  // Date Dropdown States
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const [employmentStatus, setEmploymentStatus] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employerName, setEmployerName] = useState('');

  // Dropdown States
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [createMember, { isLoading, error }] = useCreateFamilyMemberMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  const genderOptions = ['Male', 'Female'];
  const relationshipOptions = [
    { label: 'Self', value: 'Self' },
    { label: 'Spouse', value: 'Spouse' },
    { label: 'Parent', value: 'Parent' },
    { label: 'Child', value: 'Child' },
    { label: 'Sibling', value: 'Sibling' },
    { label: 'Partner', value: 'Partner' },
    { label: 'Fiance', value: 'Fiance' },
    { label: 'Grandparent', value: 'Grandparent' },
    { label: 'Grandchild', value: 'Grandchild' },
    { label: 'Uncle/Aunt', value: 'Uncle_Aunt' },
    { label: 'Nephew/Niece', value: 'Nephew_Niece' },
    { label: 'Cousin', value: 'Cousin' },
    { label: 'Friend', value: 'Friend' },
    { label: 'Colleague', value: 'Colleague' },
    { label: 'Legal Guardian', value: 'Legal_Guardian' },
    { label: 'Caregiver', value: 'Caregiver' },
    { label: 'In-Law', value: 'In_Law' },
    { label: 'Step Family', value: 'Step_Family' },
    { label: 'Other', value: 'Other' }
  ];
  const employmentOptions = ['Employed', 'Self-Employed', 'Student', 'Retired', 'Unemployed'];

  // Date Arrays
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleTakePhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) return Alert.alert('Permission Required', 'Camera access is needed.');
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        haptics.success();
      }
    } catch { Alert.alert('Error', 'Failed to take photo'); }
  };

  const handleChoosePhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return Alert.alert('Permission Required', 'Gallery access is needed.');
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        haptics.success();
      }
    } catch { Alert.alert('Error', 'Failed to pick photo'); }
  };

  const validateStep1 = () => {
    if (!firstName || !lastName || !dobDay || !dobMonth || !phone || !email || !gender || !relationship) {
      Alert.alert('Missing Fields', 'Please fill all required fields in this section.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!employmentStatus) {
      Alert.alert('Missing Fields', 'Please select employment status.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      haptics.light();
      setCurrentStep(2);
    } else {
      haptics.error();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    try {
      haptics.medium();

      const monthIndex = months.indexOf(dobMonth) + 1;
      // Format as MM-DD (removing year based on user request)
      const formattedDate = `${monthIndex.toString().padStart(2, '0')}-${dobDay}`;

      console.log({
        residentId: user?.residentId || 'RES-123',
        firstName,
        othernames: otherNames,
        surname: lastName,
        gender: gender as any,
        DoB: formattedDate,
        phoneNo: phone,
        email,
        relationship,
        photo: photo || undefined,
        employmentStatus: employmentStatus as any,
        jobTitle: jobTitle || "",
        employerName: employerName || "",
      });
      await createMember({
        residentId: user?.residentId || 'RES-123',
        firstName,
        othernames: otherNames,
        surname: lastName,
        gender: gender as any,
        DoB: formattedDate,
        phoneNo: phone,
        email,
        relationship,
        photo: photo || undefined,
        employmentStatus: employmentStatus as any,
        jobTitle: jobTitle || "",
        employerName: employerName || "",
      }).unwrap();

      haptics.success();
      setShowSuccess(true);
    } catch (err: any) {
      console.log(err);
      haptics.error();
      Alert.alert('Error', err?.data?.message || 'Failed to add member');
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setCurrentStep(1);
    setFirstName('');
    setOtherNames('');
    setLastName('');
    setDobDay('');
    setDobMonth('');
    setPhone('');
    setEmail('');
    setGender('');
    setRelationship('');
    setPhoto(null);
    setEmploymentStatus('');
    setJobTitle('');
    setEmployerName('');
  };

  const renderDropdown = (title: string, options: any[], value: string, setValue: (val: string) => void) => (
    <Modal visible={activeDropdown === title} transparent animationType="fade">
      <TouchableOpacity style={styles.dropdownOverlay} onPress={() => setActiveDropdown(null)}>
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownHeader}>{title}</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {options.map((opt, index) => {
              const label = typeof opt === 'object' ? opt.label : opt;
              const val = typeof opt === 'object' ? opt.value : opt;
              const isSelected = value === val;

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => {
                    setValue(val);
                    setActiveDropdown(null);
                  }}
                >
                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>{label}</Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color="#002EE5" />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Family Member</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar (Tabs style) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', padding: 12, paddingHorizontal: 20, width: '100%' }}>
        <View style={{ borderBottomWidth: 3, borderBottomColor: currentStep === 1 ? '#002EE5' : '#B0BEF7', paddingVertical: currentStep === 2 ? 4 : 8, width: currentStep === 1 ? '85%' : '15%', alignItems: 'center' }}>
          {currentStep === 1 && <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: "#002EE5" }}>Personal Information</Text>}
          {currentStep === 2 && <Ionicons name="checkmark-circle" size={20} color="#B0BEF7" />}
        </View>
        <View style={{ borderBottomWidth: 3, borderBottomColor: currentStep === 2 ? '#002EE5' : '#B0BEF7', paddingVertical: currentStep === 1 ? 3 : 6, width: currentStep === 2 ? '85%' : '15%', alignItems: 'center' }}>
          {currentStep === 2 && <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: "#002EE5" }}>Employment Information</Text>}
          {currentStep === 1 && <View style={{ borderWidth: 1, borderColor: '#B0BEF7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 }}><Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: "#B0BEF7" }}>2</Text></View>}
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.formContent}>

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name <Text style={styles.red}>*</Text></Text>
                <TextInput style={styles.input} placeholder="enter..." value={firstName} onChangeText={setFirstName} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Other Names <Text style={styles.red}>*</Text></Text>
                <TextInput style={styles.input} placeholder="enter..." value={otherNames} onChangeText={setOtherNames} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name <Text style={styles.red}>*</Text></Text>
                <TextInput style={styles.input} placeholder="enter..." value={lastName} onChangeText={setLastName} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth <Text style={styles.red}>*</Text></Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Day')}>
                      <Text style={dobDay ? styles.inputText : styles.placeholderText}>{dobDay || 'Day'}</Text>
                      <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Month')}>
                      <Text style={dobMonth ? styles.inputText : styles.placeholderText}>{dobMonth || 'Month'}</Text>
                      <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {renderDropdown('Day', days, dobDay, setDobDay)}
              {renderDropdown('Month', months, dobMonth, setDobMonth)}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number <Text style={styles.red}>*</Text></Text>
                <TextInput style={styles.input} placeholder="enter..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address <Text style={styles.red}>*</Text></Text>
                <TextInput style={styles.input} placeholder="enter..." value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Gender')}>
                  <Text style={gender ? styles.inputText : styles.placeholderText}>{gender || 'select...'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              {renderDropdown('Gender', genderOptions, gender, setGender)}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Relationship')}>
                  <Text style={relationship ? styles.inputText : styles.placeholderText}>
                    {relationshipOptions.find(opt => opt.value === relationship)?.label || relationship || 'select...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              {renderDropdown('Relationship', relationshipOptions, relationship, setRelationship)}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Upload Your Passport Photograph <Text style={styles.red}>*</Text></Text>
                <View style={styles.passportContainer}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.iconCircle}>
                      <Ionicons name="image-outline" size={32} color="#fff" />
                    </View>
                  )}
                  <Text style={styles.helperText}>Maximum size of 5mb, accept only JPG, JPEG, and PNG</Text>
                  <View style={styles.photoButtons}>
                    <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
                      <Text style={styles.photoBtnText}>Snap</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoBtn} onPress={handleChoosePhoto}>
                      <Text style={styles.photoBtnText}>Choose file</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Employment Info */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employment Status <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Employment Status')}>
                  <Text style={employmentStatus ? styles.inputText : styles.placeholderText}>{employmentStatus || 'select...'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              {renderDropdown('Employment Status', employmentOptions, employmentStatus, setEmploymentStatus)}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title <Text style={styles.optional}>(Optional)</Text></Text>
                <TextInput style={styles.input} placeholder="enter..." value={jobTitle} onChangeText={setJobTitle} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employer Name <Text style={styles.optional}>(Optional)</Text></Text>
                <TextInput style={styles.input} placeholder="enter..." value={employerName} onChangeText={setEmployerName} />
              </View>
            </View>
          )}

        </ScrollView>

        <View style={styles.footer}>
          {currentStep === 1 ? (
            // Step 1 only has "Add Member" blocked? No, typically "Next" or just validate. 
            // Design images don't clearly show a "Next" button on Step 1, but "Add Family Member" text. 
            // But Step 2 is clearly separate. Assuming a "Next" mechanics or single list.
            // Wait, Image 1 has progress bar "2" circle. It's multi-step. 
            // Let's look for the bottom button. Image 2 shows "Add Member" at bottom.
            // I'll put a "Next" button for Step 1.
            <TouchableOpacity style={styles.mainButton} onPress={handleNext}>
              <Text style={styles.mainButtonText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.mainButton} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>Add Member</Text>}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccess}
        title="Family Member Added Successfully!"
        message="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        primaryButtonText="Close"
        secondaryButtonText="Add New Family Member"
        onPrimaryPress={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
        onSecondaryPress={handleReset}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    // borderBottomWidth: 2,
    // borderBottomColor: '#002EE5',
    // gap: 8,
  },
  progressTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // padding: 16,
    borderBottomWidth: 1, borderColor: '#002EE5'
    // borderBottomWidth: 2,
    // borderBottomColor: 'transparent',
  },
  progressTabActive: {
    // styles for active tab indicator if needed, 
    // but design shows the blue line across the whole active section 
    // actually the blue line seems to be under the active text only or step 1/2.
  },
  progressText: {
    color: '#002EE5',
    fontSize: 14,
    fontWeight: '600',
  },
  progressTextActive: {
    color: '#002EE5',
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
  red: { color: '#EF4444' },
  optional: { color: '#9CA3AF', fontSize: 12 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 12 },
  dropdownInput: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: { fontSize: 14, color: '#000' },
  placeholderText: { fontSize: 14, color: '#9CA3AF' },
  passportContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginBottom: 16
  },
  previewImage: {
    width: 100, height: 100, borderRadius: 50, marginBottom: 16,
  },
  helperText: {
    fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row', gap: 12,
  },
  photoBtn: {
    paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff'
  },
  photoBtnText: {
    fontSize: 13, fontWeight: '600', color: '#002EE5',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  mainButton: {
    backgroundColor: '#E5E7EB', // Disabled gray by default until filled? Or blue? Image shows Light Gray until filled? 
    // Image 2 shows "Add Member" as Gray. I'll make it Blue for usability in code, or Gray if invalid.
    // Let's use gray for now to match design visual
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  // Dropdown Modal Styles
  dropdownOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20,
  },
  dropdownContent: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: 400,
  },
  dropdownHeader: {
    fontSize: 14, color: '#EF4444', marginBottom: 12,
  },
  dropdownItem: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between'
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14, color: '#374151',
  },
  dropdownItemTextActive: {
    color: '#002EE5', fontWeight: '600',
  },
});

