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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import { Modal } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { VisitorsStackParamList } from '@/types/navigation';
import { useCreateVisitorMutation } from '@/store/api/visitorsApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { haptics } from '@/utils/haptics';

type CreateVisitorScreenNavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'CreateVisitor'
>;

type CreateVisitorScreenRouteProp = RouteProp<VisitorsStackParamList, 'CreateVisitor'>;

type Props = {
  navigation: CreateVisitorScreenNavigationProp;
  route: CreateVisitorScreenRouteProp;
};

interface EventVisitor {
  visitorName: string;
  gender: 'Male' | 'Female';
  fone: string;
  email: string;
}

export default function CreateVisitorScreen({ navigation, route }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId || '';
  const initialType = route.params?.initialType;

  // If initialType is provided, use it, otherwise default to 'visitor'
  const [type, setType] = useState<'guest' | 'visitor'>(initialType || 'visitor');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [visitorNum, setVisitorNum] = useState('1');
  const [visitDate, setVisitDate] = useState(new Date());
  const [departureDate, setDepartureDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false);

  // New fields for extended functionality
  const [visitorCategory, setVisitorCategory] = useState<'Casual' | 'Event'>('Casual');
  const [eventTitle, setEventTitle] = useState('');
  const [visitorRelationship, setVisitorRelationship] = useState('PERSONAL_GUESTS');
  const [eventVisitors, setEventVisitors] = useState<EventVisitor[]>([]);

  // Modal State
  const [isAddGuestModalVisible, setIsAddGuestModalVisible] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestGender, setNewGuestGender] = useState<'Male' | 'Female'>('Male');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');

  const [createVisitor, { isLoading }] = useCreateVisitorMutation();

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/vnd.ms-excel'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const { uri } = result.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(sheet);

      if (data && data.length > 0) {
        // Map columns to our structure.
        // Assuming columns: Name, Gender, Phone, Email
        // Or closely matching keys.
        const mappedVisitors: EventVisitor[] = data.map((row) => ({
          visitorName: row['Name'] || row['name'] || row['Visitor Name'] || row['visitorName'] || '',
          gender: (row['Gender'] || row['gender'] || 'Male'), // Default to Male if missing
          fone: (row['Phone'] || row['phone'] || row['fone'] || row['Mobile'] || '').toString(),
          email: row['Email'] || row['email'] || '',
        })).filter(v => v.visitorName && v.fone); // Basic validation

        if (mappedVisitors.length > 0) {
          setEventVisitors((prev) => [...prev, ...mappedVisitors]);
          haptics.success();
          Alert.alert('Success', `Imported ${mappedVisitors.length} guests.`);
        } else {
          Alert.alert('Error', 'No valid guests found in file. Ensure columns are: Name, Gender, Phone, Email');
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import file');
    }
  };

  const handleAddGuest = () => {
    if (!newGuestName || !newGuestPhone) {
      Alert.alert('Error', 'Name and Phone are required');
      return;
    }
    setEventVisitors(prev => [...prev, {
      visitorName: newGuestName,
      gender: newGuestGender,
      fone: newGuestPhone,
      email: newGuestEmail
    }]);
    setNewGuestName('');
    setNewGuestPhone('');
    setNewGuestEmail('');
    setNewGuestGender('Male');
    setIsAddGuestModalVisible(false);
  };

  const removeGuest = (index: number) => {
    setEventVisitors(prev => prev.filter((_, i) => i !== index));
    haptics.light();
  };

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

    // Validate event fields
    if (visitorCategory === 'Event' && !eventTitle.trim()) {
      haptics.error();
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    // Validate departure date for guests (must be different day, not same day)
    if (type === 'guest') {
      const arrivalDay = visitDate.toISOString().split('T')[0];
      const departureDay = departureDate.toISOString().split('T')[0];

      if (arrivalDay === departureDay) {
        haptics.error();
        Alert.alert('Error', 'Departure date must be different from arrival date');
        return;
      }
    }

    if (!residentId) {
      haptics.error();
      Alert.alert('Error', 'Unable to identify resident. Please log in again.');
      return;
    }

    try {
      haptics.light();

      // Format dates as YYYY-MM-DD for backend
      const formattedArriveDate = visitDate.toISOString().split('T')[0];
      const formattedDepartureDate = type === 'guest'
        ? departureDate.toISOString().split('T')[0]
        : undefined;

      const visitor = await createVisitor({
        residentId,
        firstName,
        lastName,
        email,
        phone,
        arriveDate: formattedArriveDate,
        departureDate: formattedDepartureDate,
        visitorNum: visitorCount,
        purpose,
        type,
        visitorMainCategory: visitorCategory,
        visitorRelationship,
        eventTitle: visitorCategory === 'Event' ? eventTitle : '',
        eventVisitors: visitorCategory === 'Event' ? eventVisitors : [],
      }).unwrap();

      haptics.success();
      const message = type === 'guest'
        ? 'Guest pass created successfully'
        : 'Visitor pass created successfully';
      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('VisitorQR', { visitor }),
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
            {/* Guest/Visitor Type Selection - Only show if NO initialType was provided (context mode) */}
            {!initialType && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Type <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.typeContainer}>
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
                      name="person-outline"
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
                      Day Visit Only
                    </Text>
                  </TouchableOpacity>

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
                      name="bed-outline"
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
                      Overnight Stay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    visitorCategory === 'Casual' && styles.segmentButtonActive,
                  ]}
                  onPress={() => {
                    haptics.light();
                    setVisitorCategory('Casual');
                  }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      visitorCategory === 'Casual' && styles.segmentTextActive,
                    ]}
                  >
                    Casual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    visitorCategory === 'Event' && styles.segmentButtonActive,
                  ]}
                  onPress={() => {
                    haptics.light();
                    setVisitorCategory('Event');
                  }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      visitorCategory === 'Event' && styles.segmentTextActive,
                    ]}
                  >
                    Event
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Event Title (Only for Event) */}
            {visitorCategory === 'Event' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Event Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Birthday Party, House Warming"
                  value={eventTitle}
                  onChangeText={setEventTitle}
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Event Guests Section */}
            {visitorCategory === 'Event' && (
              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.label}>Guest List ({eventVisitors.length})</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={handleImport} style={styles.iconButton}>
                      <Ionicons name="document-text-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsAddGuestModalVisible(true)} style={styles.iconButton}>
                      <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {eventVisitors.length === 0 ? (
                  <Text style={styles.placeholderText}>No guests added yet. Add manually or import from Excel/CSV.</Text>
                ) : (
                  <View style={styles.guestList}>
                    {eventVisitors.map((guest, index) => (
                      <View key={index} style={styles.guestItem}>
                        <View style={styles.guestInfo}>
                          <Text style={styles.guestName}>{guest.visitorName}</Text>
                          <Text style={styles.guestDetails}>{guest.gender} • {guest.fone}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeGuest(index)}>
                          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

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
                      // Adjust departure date if it's the same day as new arrival date
                      if (type === 'guest') {
                        const newArrivalDay = selectedDate.toISOString().split('T')[0];
                        const currentDepartureDay = departureDate.toISOString().split('T')[0];

                        if (newArrivalDay === currentDepartureDay) {
                          // Set departure to next day if they're the same
                          setDepartureDate(
                            new Date(selectedDate.getTime() + 86400000)
                          );
                        }
                      }
                    }
                  }}
                />
              )}
            </View>

            {/* Departure Date (Only for Guests) */}
            {type === 'guest' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Departure Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDepartureDatePicker(true)}
                  disabled={isLoading}
                >
                  <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                  <Text style={styles.dateText}>
                    {departureDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showDepartureDatePicker && (
                  <DateTimePicker
                    value={departureDate}
                    mode="date"
                    onChange={(event, selectedDate) => {
                      setShowDepartureDatePicker(false);
                      if (selectedDate) {
                        setDepartureDate(selectedDate);
                      }
                    }}
                  />
                )}
                <Text style={styles.helperText}>
                  {(() => {
                    const days = Math.ceil(
                      (departureDate.getTime() - visitDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                    );
                    if (days > 0) {
                      return `Duration: ${days} ${days === 1 ? 'night' : 'nights'}`;
                    } else if (days < 0) {
                      return `Note: Departure is ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} before arrival`;
                    } else {
                      return 'Departure and arrival are on the same day';
                    }
                  })()}
                </Text>
              </View>
            )}
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
              <Text style={styles.buttonText}>
                {type === 'guest' ? 'Create Guest Pass' : 'Create Visitor Pass'}
              </Text>
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 2,
    height: 36,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    color: '#000',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  placeholderText: {
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  guestList: {
    gap: 8,
  },
  guestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  guestDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
    gap: 20
  }
});