import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useCreateDomesticStaffMutation } from '@/store/api/householdApi';
import { haptics } from '@/utils/haptics';
import SuccessModal from '@/components/SuccessModal';

export default function AddDomesticStaffScreen() {
  const navigation = useNavigation<any>();

  // Steps: 1 = Personal, 2 = Employment
  const [currentStep, setCurrentStep] = useState(1);

  // Form State - Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');

  // DOB Dropdown States
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');

  const [photo, setPhoto] = useState<string | null>(null);

  // Form State - Employment
  const [role, setRole] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workFrequency, setWorkFrequency] = useState('');
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  // Dropdown States
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [createStaff, { isLoading }] = useCreateDomesticStaffMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  // Options
  const genderOptions = ['Male', 'Female'];
  const staffRoles = ['Cook', 'Cleaner', 'Driver', 'Gardener', 'Security', 'Nanny', 'Housekeeper', 'Other'];
  const employmentTypeOptions = ['Live-In', 'Live-Out'];
  const workFrequencyOptions = ['Weekdays', 'Weekends', 'Full Week', 'Custom Days'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const toggleWorkDay = (day: string) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter(d => d !== day));
    } else {
      setWorkDays([...workDays, day]);
    }
    haptics.selection();
  };

  const validateStep1 = () => {
    if (!firstName || !lastName || !dobDay || !dobMonth || !phone || !email || !gender) {
      Alert.alert('Missing Fields', 'Please fill all required fields in this section.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!role || !employmentType || !startDate || !workFrequency) {
      Alert.alert('Missing Fields', 'Please select role, employment type, start date and work days.');
      return false;
    }
    if (workFrequency === 'Custom Days' && workDays.length === 0) {
      Alert.alert('Missing Fields', 'Please select at least one work day.');
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
      const currentYear = new Date().getFullYear();
      // Note: Using current year for DOB as requested in previous tasks, 
      // but typically staff DOB might need year. Sticking to 'similar design' constraint.
      const formattedDob = `${currentYear}-${monthIndex.toString().padStart(2, '0')}-${dobDay}`;

      await createStaff({
        firstName,
        lastName,
        gender: gender as 'Male' | 'Female',
        dateOfBirth: formattedDob,
        phone,
        email,
        photo: photo || undefined,
        role,
        employmentType: employmentType as 'Live-In' | 'Live-Out',
        workDays: workDays.length > 0 ? workDays : undefined,
        startDate: startDate?.toISOString(),
      }).unwrap();

      haptics.success();
      setShowSuccess(true);
    } catch (err: any) {
      haptics.error();
      Alert.alert('Error', err?.data?.message || 'Failed to add staff');
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setCurrentStep(1);
    setFirstName('');
    setLastName('');
    setDobDay('');
    setDobMonth('');
    setPhone('');
    setEmail('');
    setGender('');
    setPhoto(null);
    setRole('');
    setEmploymentType('');
    setWorkDays([]);
    setStartDate(new Date());
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

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Domestic Staff</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
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
                <Text style={styles.label}>Upload Passport Photograph <Text style={styles.red}>*</Text></Text>
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
                <Text style={styles.label}>Role <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Role')}>
                  <Text style={role ? styles.inputText : styles.placeholderText}>{role || 'select...'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              {renderDropdown('Role', staffRoles, role, setRole)}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employment Type <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Employment Type')}>
                  <Text style={employmentType ? styles.inputText : styles.placeholderText}>{employmentType || 'select...'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              {renderDropdown('Employment Type', employmentTypeOptions, employmentType, setEmploymentType)}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employment Start Date <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity
                  style={styles.dropdownInput}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={startDate ? styles.inputText : styles.placeholderText}>{formatDate(startDate)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartDatePicker(false);
                      if (selectedDate) setStartDate(selectedDate);
                    }}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Work Days <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Work Frequency')}>
                  <Text style={workFrequency ? styles.inputText : styles.placeholderText}>{workFrequency || 'select...'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              {renderDropdown('Work Frequency', workFrequencyOptions, workFrequency, (val) => {
                setWorkFrequency(val);
                if (val === 'Weekdays') {
                  setWorkDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
                } else if (val === 'Weekends') {
                  setWorkDays(['Saturday', 'Sunday']);
                } else if (val === 'Full Week') {
                  setWorkDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
                } else if (val === 'Custom Days') {
                  setWorkDays([]);
                }
              })}

              {workFrequency === 'Custom Days' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Select Days</Text>
                  <TouchableOpacity style={styles.dropdownInput} onPress={() => setActiveDropdown('Custom Days')}>
                    <Text style={styles.inputText}>Select Days</Text>
                    <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                  </TouchableOpacity>

                  {/* Custom Multi-select Dropdown */}
                  <Modal visible={activeDropdown === 'Custom Days'} transparent animationType="fade">
                    <TouchableOpacity style={styles.dropdownOverlay} onPress={() => setActiveDropdown(null)}>
                      <View style={styles.dropdownContent}>
                        <Text style={styles.dropdownHeader}>Select Days</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                          {weekDays.map((day, index) => {
                            const isSelected = workDays.includes(day);
                            return (
                              <TouchableOpacity
                                key={index}
                                style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                                onPress={() => toggleWorkDay(day)}
                              >
                                <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>{day}</Text>
                                {isSelected && <Ionicons name="checkmark" size={20} color="#002EE5" />}
                              </TouchableOpacity>
                            )
                          })}
                        </ScrollView>
                      </View>
                    </TouchableOpacity>
                  </Modal>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {workDays.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={styles.selectedDayChip}
                        onPress={() => toggleWorkDay(day)}
                      >
                        <Text style={styles.selectedDayText}>{day}</Text>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

            </View>
          )}

        </ScrollView>

        <View style={styles.footer}>
          {currentStep === 1 ? (
            <TouchableOpacity style={styles.mainButton} onPress={handleNext}>
              <Text style={styles.mainButtonText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.mainButton} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainButtonText}>Add Staff</Text>}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccess}
        title="Domestic Staff Added Successfully!"
        message="The staff member has been added to your household."
        primaryButtonText="Close"
        secondaryButtonText="Add Another Staff"
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
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
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
  dayButton: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF', borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 12, fontWeight: '600', color: '#000',
  },
  dayTextActive: {
    color: '#fff',
  },
  selectedDayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002EE5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  selectedDayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
