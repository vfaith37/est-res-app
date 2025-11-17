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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VisitorsStackParamList } from '@/types/navigation';
import { useCreateVisitorMutation } from '@/store/api/visitorsApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { haptics } from '@/utils/haptics';

type CreateVisitorScreenNavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'CreateVisitor'
>;

type Props = {
  navigation: CreateVisitorScreenNavigationProp;
};

export default function CreateVisitorScreen({ navigation }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [visitorNum, setVisitorNum] = useState('1');
  const [visitDate, setVisitDate] = useState(new Date());
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);

  const [createVisitor, { isLoading }] = useCreateVisitorMutation();

  const handleSubmit = async () => {
    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !purpose) {
      haptics.error();
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      haptics.error();
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate visitor number
    const visitorCount = parseInt(visitorNum, 10);
    if (isNaN(visitorCount) || visitorCount < 0) {
      haptics.error();
      Alert.alert('Error', 'Please enter a valid number of visitors');
      return;
    }

    if (!residentId) {
      haptics.error();
      Alert.alert('Error', 'Unable to identify resident. Please log in again.');
      return;
    }

    try {
      haptics.light();

      // Format date as YYYY-MM-DD for backend
      const formattedDate = visitDate.toISOString().split('T')[0];

      const visitor = await createVisitor({
        residentId,
        firstName,
        lastName,
        email,
        phone,
        arriveDate: formattedDate,
        visitorNum: visitorCount,
        purpose,
      }).unwrap();

      haptics.success();
      Alert.alert('Success', 'Visitor pass created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('VisitorQR', { visitorId: visitor.id }),
        },
      ]);
    } catch (error: any) {
      haptics.error();
      if (__DEV__) {
        console.error('Create visitor error:', error);
      }
      Alert.alert('Error', error?.data?.message || 'Failed to create visitor pass');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                First Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
                autoCapitalize="words"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Last Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="visitor@example.com"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="08012345678"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            {/* Purpose */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Purpose of Visit <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Personal visit, Delivery, Business"
                value={purpose}
                onChangeText={setPurpose}
                editable={!isLoading}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Number of Visitors */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Number of Visitors <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1, 2, 3"
                value={visitorNum}
                onChangeText={setVisitorNum}
                keyboardType="number-pad"
                editable={!isLoading}
              />
              <Text style={styles.helperText}>
                How many people will be visiting?
              </Text>
            </View>

            {/* Arrival Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Arrival Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowVisitDatePicker(true)}
                disabled={isLoading}
              >
                <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                <Text style={styles.dateText}>
                  {visitDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showVisitDatePicker && (
                <DateTimePicker
                  value={visitDate}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowVisitDatePicker(false);
                    if (selectedDate) {
                      setVisitDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Visitor Pass</Text>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
  },
  form: {
    gap: 20,
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  typeTextActive: {
    color: '#fff',
  },
  typeSubtext: {
    fontSize: 12,
    color: '#007AFF',
  },
  typeSubtextActive: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  helperText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  timeSlotButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#000',
  },
  timeSlotTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});