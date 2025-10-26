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
import { haptics } from '@/utils/haptics';

type CreateVisitorScreenNavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'CreateVisitor'
>;

type Props = {
  navigation: CreateVisitorScreenNavigationProp;
};

export default function CreateVisitorScreen({ navigation }: Props) {
  const [type, setType] = useState<'guest' | 'visitor'>('guest');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [visitDate, setVisitDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [timeSlot, setTimeSlot] = useState('10:00-12:00');
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showCheckOutDatePicker, setShowCheckOutDatePicker] = useState(false);

  const [createVisitor, { isLoading }] = useCreateVisitorMutation();

  const handleSubmit = async () => {
    if (!name || !phone || !purpose) {
      haptics.error();
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (type === 'visitor' && checkOutDate <= visitDate) {
      haptics.error();
      Alert.alert('Error', 'Check-out date must be after visit date');
      return;
    }

    try {
      haptics.light();
      const visitor = await createVisitor({
        name,
        phone,
        purpose,
        vehicleNumber: vehicleNumber || undefined,
        visitDate: visitDate.toISOString(),
        checkOutDate: type === 'visitor' ? checkOutDate.toISOString() : undefined,
        timeSlot,
        type,
      }).unwrap();

      haptics.success();
      Alert.alert('Success', 'Guest pass created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('VisitorQR', { visitorId: visitor.id }),
        },
      ]);
    } catch (error: any) {
      haptics.error();
      Alert.alert('Error', error?.data?.message || 'Failed to create guest pass');
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
            {/* Guest Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Guest Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'guest' && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    haptics.light();
                    setType('guest');
                  }}
                  disabled={isLoading}
                >
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={type === 'guest' ? '#fff' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      type === 'guest' && styles.typeTextActive,
                    ]}
                  >
                    Guest
                  </Text>
                  <Text
                    style={[
                      styles.typeSubtext,
                      type === 'guest' && styles.typeSubtextActive,
                    ]}
                  >
                    Single Day
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'visitor' && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    haptics.light();
                    setType('visitor');
                  }}
                  disabled={isLoading}
                >
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={type === 'visitor' ? '#fff' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      type === 'visitor' && styles.typeTextActive,
                    ]}
                  >
                    Visitor
                  </Text>
                  <Text
                    style={[
                      styles.typeSubtext,
                      type === 'visitor' && styles.typeSubtextActive,
                    ]}
                  >
                    Multiple Days
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter guest name"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            {/* Phone */}
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
                placeholder="e.g., Personal visit, Delivery"
                value={purpose}
                onChangeText={setPurpose}
                editable={!isLoading}
              />
            </View>

            {/* Vehicle Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., ABC-123"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                autoCapitalize="characters"
                editable={!isLoading}
              />
            </View>

            {/* Visit Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {type === 'guest' ? 'Visit Date' : 'Check-In Date'}{' '}
                <Text style={styles.required}>*</Text>
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
                      // Adjust checkout date if it's before new visit date
                      if (type === 'visitor' && checkOutDate <= selectedDate) {
                        setCheckOutDate(
                          new Date(selectedDate.getTime() + 86400000)
                        );
                      }
                    }
                  }}
                />
              )}
            </View>

            {/* Check-Out Date (Only for Visitors) */}
            {type === 'visitor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Check-Out Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowCheckOutDatePicker(true)}
                  disabled={isLoading}
                >
                  <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                  <Text style={styles.dateText}>
                    {checkOutDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showCheckOutDatePicker && (
                  <DateTimePicker
                    value={checkOutDate}
                    mode="date"
                    minimumDate={
                      new Date(visitDate.getTime() + 86400000)
                    }
                    onChange={(event, selectedDate) => {
                      setShowCheckOutDatePicker(false);
                      if (selectedDate) {
                        setCheckOutDate(selectedDate);
                      }
                    }}
                  />
                )}
                <Text style={styles.helperText}>
                  Duration:{' '}
                  {Math.ceil(
                    (checkOutDate.getTime() - visitDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </Text>
              </View>
            )}

            {/* Time Slot */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Arrival Time <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.timeSlotContainer}>
                {[
                  '09:00-12:00',
                  '12:00-15:00',
                  '15:00-18:00',
                  '18:00-21:00',
                ].map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlotButton,
                      timeSlot === slot && styles.timeSlotButtonActive,
                    ]}
                    onPress={() => {
                      haptics.light();
                      setTimeSlot(slot);
                    }}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        timeSlot === slot && styles.timeSlotTextActive,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              <Text style={styles.buttonText}>Create Guest Pass</Text>
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