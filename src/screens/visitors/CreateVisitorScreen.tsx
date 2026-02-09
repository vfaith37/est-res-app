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
  Modal,
} from 'react-native';
import { toast } from 'sonner-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { VisitorsStackParamList } from '@/types/navigation';
import {
  useCreateVisitorMutation,
  useEditVisitorMutation,
  useGetGuestCategoryListQuery,
  CreateVisitorRequest,
} from '@/store/api/visitorsApi';
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

export default function CreateVisitorScreen({ navigation, route }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId || '';
  const initialType = route.params?.initialType;
  const mode = route.params?.mode || 'create';
  const editingVisitor = route.params?.visitor;

  // State
  const [type, setType] = useState<'guest' | 'visitor'>(initialType || 'visitor');

  // Common Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Visitor Specific
  const [visitorNum, setVisitorNum] = useState('0');
  const [visitDate, setVisitDate] = useState(new Date());
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [purpose, setPurpose] = useState(''); // "Reason for Visit"

  // Guest Specific
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [visitorRelationship, setVisitorRelationship] = useState(''); // Default or empty? Image implies select.
  // Actually image shows "select...". I should start with empty string if strict?
  // But I'll keep default to avoid validation error for now, or change to '' and validate.
  // Image shows "select...", so I will set initial to '' and validate.

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000));
  const [guestNote, setGuestNote] = useState(''); // "Optional Note"

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Event Guest Specific
  const [eventTitle, setEventTitle] = useState('');
  const [eventGuests, setEventGuests] = useState<any[]>([]);
  const [currentGuest, setCurrentGuest] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    email: '',
    phone: ''
  });
  // Track which gender dropdown is open (main visitor/guest or current event guest addition)
  // Reusing isGenderDropdownOpen for both but logic needs to know context if needed?
  // Actually, for the "Add Guest" form inside Event, we can use the same modal state if we share the setter.
  // But wait, existing gender state `gender` is for single guest. `currentGuest.gender` is for the list.
  // Let's us separate state or just update `currentGuest` when modal confirms.
  const [isEventGenderDropdownOpen, setIsEventGenderDropdownOpen] = useState(false);

  const guestCategory = route.params?.guestCategory;

  // Modal State
  const [isRelationshipDropdownOpen, setIsRelationshipDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
  const [editVisitor, { isLoading: isEditing }] = useEditVisitorMutation();
  const isLoading = isCreating || isEditing;
  const { data: relationshipCategories = [] } = useGetGuestCategoryListQuery();

  // Populate form if editing
  React.useEffect(() => {
    if (mode === 'edit' && editingVisitor) {
      setType(editingVisitor.type);
      setFirstName(editingVisitor.name.split(' ')[0] || '');
      setLastName(editingVisitor.name.split(' ')[1] || '');
      setPhone(editingVisitor.phone);
      setEmail(editingVisitor.email);
      setVisitorNum(editingVisitor.visitorNum.toString());

      if (editingVisitor.visitDate) {
        setVisitDate(new Date(editingVisitor.visitDate));
        setStartDate(new Date(editingVisitor.visitDate));
      }

      if (editingVisitor.departureDate) {
        setEndDate(new Date(editingVisitor.departureDate));
      }

      if (editingVisitor.type === 'visitor') {
        setPurpose(editingVisitor.purpose);
      } else {
        setGuestNote(editingVisitor.purpose);
        // Try to match relationship from categories if possible, or leave as is
        // visitorRelationship is just a string, so we can set it.
        // But we don't have it on Visitor type directly?
        // Wait, Visitor type has `visitorRelationship`? No, let's check visitorsApi.ts
      }
    }
  }, [mode, editingVisitor]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: mode === 'edit'
        ? (type === 'guest' ? 'Edit Guest' : 'Edit Token')
        : (type === 'guest' ? 'Create Guest' : 'Generate New Token')
    });
  }, [navigation, type, mode]);

  const handleSubmit = async () => {
    // Validate required fields based on Type
    if (type === 'visitor') {
      if (!firstName || !lastName || !purpose || !phone) {
        haptics.error();
        toast.error('Please fill in all required fields');
        return;
      }
    } else {
      // Guest Validation
      if (guestCategory !== 'Event') {
        if (!firstName || !lastName || !visitorRelationship || !gender || !eventTitle) {
          haptics.error();
          toast.error('Please fill in all required fields');
          return;
        }
      }
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        haptics.error();
        toast.error('Please enter a valid email address');
        return;
      }
    }

    // Validate duration for guests
    if (type === 'guest') {
      const startDay = startDate.toISOString().split('T')[0];
      const endDay = endDate.toISOString().split('T')[0];

      if (startDay === endDay) {
        haptics.error();
        toast.error('Duration End Date must be different from Start Date');
        return;
      }
    }

    if (!residentId) {
      haptics.error();
      toast.error('Unable to identify resident. Please log in again.');
      return;
    }

    try {
      haptics.light();

      const formattedArriveDate = type === 'visitor'
        ? visitDate.toISOString().split('T')[0]
        : startDate.toISOString().split('T')[0];

      const formattedDepartureDate = type === 'guest'
        ? endDate.toISOString().split('T')[0]
        : undefined;

      // START Event Handling
      if (type === 'guest' && guestCategory === 'Event') {
        if (!eventTitle) {
          toast.error('Please enter Event Title');
          return;
        }
        if (eventGuests.length === 0) {
          toast.error('Please add at least one guest');
          return;
        }

        // Helper to format payload
        const payload: CreateVisitorRequest = {
          residentId,
          tokenType: 'One-Off',
          visitorMainCategory: 'Event Guest',
          eventTitle: eventTitle,
          additionnote: 'Event: ' + eventTitle,
          durationnStartDate: formattedArriveDate,
          durationEndDate: formattedDepartureDate || formattedArriveDate,
          eventVisitors: eventGuests,
          visitorNum: eventGuests.length,
        };

        const visitor = await createVisitor(payload).unwrap();
        haptics.success();

        toast.success('Event Guests Added Successfully');
        navigation.replace('VisitorQR', { visitor });
        return;
      }
      // END Event Handling

      const finalPurpose = type === 'visitor' ? purpose : (guestNote || 'Personal Visit');
      const parsedNum = parseInt(visitorNum, 10);
      const isCasualGuest = type === 'guest' && guestCategory === 'Casual';
      const finalVisitorNum = type === 'visitor'
        ? (isNaN(parsedNum) ? 1 : parsedNum)
        : (isCasualGuest ? 0 : 1);

      let resultVisitor: any;

      if (mode === 'edit' && editingVisitor) {
        // Edit Mode
        const updates = {
          residentid: residentId,
          visitFirstname: firstName,
          visitLastname: lastName,
          email,
          phoneno: phone,
          arrivedate: formattedArriveDate,
          departuredate: formattedDepartureDate,
          visitorNum: finalVisitorNum,
          visitReason: finalPurpose,
          tokenType: (type === 'visitor' ? 'One-Off' : 'Re-Usable') as "One-Off" | "Re-Usable",
          visitorMainCategory: guestCategory as any || 'Casual',
          visitorRelationship: type === 'guest' ? visitorRelationship : undefined,
          // Handle Event updates if necessary (not fully implemented in UI above yet for edit)
        };

        resultVisitor = await editVisitor({
          tokenId: editingVisitor.id,
          updates
        }).unwrap();

        haptics.success();
        haptics.success();
        toast.success('Visitor Updated Successfully');
        navigation.goBack();

      } else {
        // Create Mode
        // Create Mode
        const payload: any = {
          residentId,
          firstName,
          lastName,
          email,
          phone,
          arriveDate: formattedArriveDate,
          departureDate: formattedDepartureDate,
          visitorNum: finalVisitorNum,
          purpose: finalPurpose,
          tokenType: type === 'visitor' ? 'One-Off' : 'Re-Usable',
        };

        if (type === 'visitor') {
          // One-Off Payload Construction
          payload.visitorMainCategory = 'Visitor';
          payload.gender = gender || 'Male'; // Default to Male if not captured, or should we expose gender for visitors? User payload has it.
          // Removing fields not relevant to One-Off if they exist
          delete payload.departureDate;
          delete payload.visitorRelationship;
        } else {
          // Re-Usable (Guest) Payload Construction
          payload.visitorMainCategory = isCasualGuest ? 'Casual Guest' : 'Visitor';
          payload.visitorRelationship = visitorRelationship;
          payload.additionnote = guestNote || 'Personal Visit';
          payload.gender = gender;
          payload.durationnStartDate = formattedArriveDate;
          payload.durationEndDate = formattedDepartureDate;
        }

        resultVisitor = await createVisitor(payload).unwrap();

        haptics.success();
        const message = type === 'guest'
          ? 'Guest ID Generated Successfully'
          : 'Visitor Token Generated Successfully';

        toast.success(message);
        navigation.replace('VisitorQR', { visitor: resultVisitor });
      }

    } catch (error: any) {
      haptics.error();
    }
  };

  const handleAddGuest = () => {
    if (!currentGuest.firstName || !currentGuest.lastName) {
      toast.error('Please enter Guest Name');
      return;
    }
    setEventGuests([...eventGuests, currentGuest]);
    setCurrentGuest({
      firstName: '',
      lastName: '',
      gender: 'Male',
      email: '',
      phone: ''
    });
  };

  const handleRemoveGuest = (index: number) => {
    const newGuests = [...eventGuests];
    newGuests.splice(index, 1);
    setEventGuests(newGuests);
  };



  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
      {/* Event Guest Form */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{type === 'guest' ? 'Create Guest (Multiple usage)' : 'Generate New Token (One time usage)'}</Text>
        <Ionicons name="close" size={24} color="#000" onPress={() => navigation.goBack()} />
      </View>
      {type === 'guest' && guestCategory === 'Event' ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.form}>

              {/* Event Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Event Title <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter..."
                  placeholderTextColor="#A0A0A0"
                  value={eventTitle}
                  onChangeText={setEventTitle}
                />
              </View>

              {/* Dates */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration Start Date <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateText}>{format(startDate, 'dd/MM/yyyy')}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration End Date <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateText}>{format(endDate, 'dd/MM/yyyy')}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Add Guest Container */}
              <View style={[styles.card, { padding: 16, borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 12 }]}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Guest First Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="enter..."
                    placeholderTextColor="#A0A0A0"
                    value={currentGuest.firstName}
                    onChangeText={(t) => setCurrentGuest({ ...currentGuest, firstName: t })}
                  />
                </View>
                <View style={[styles.inputGroup, { marginTop: 12 }]}>
                  <Text style={styles.label}>Guest Last Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="enter..."
                    placeholderTextColor="#A0A0A0"
                    value={currentGuest.lastName}
                    onChangeText={(t) => setCurrentGuest({ ...currentGuest, lastName: t })}
                  />
                </View>

                <View style={[styles.inputGroup, { marginTop: 12 }]}>
                  <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setIsEventGenderDropdownOpen(true)}
                  >
                    <Text style={styles.dropdownText}>{currentGuest.gender || 'select...'}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { marginTop: 12 }]}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#A0A0A0"
                    value={currentGuest.email}
                    onChangeText={(t) => setCurrentGuest({ ...currentGuest, email: t })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={[styles.inputGroup, { marginTop: 12 }]}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="enter..."
                    placeholderTextColor="#A0A0A0"
                    value={currentGuest.phone}
                    onChangeText={(t) => setCurrentGuest({ ...currentGuest, phone: t })}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.secondaryButton, { marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}
                  onPress={handleAddGuest}
                >
                  <Ionicons name="add" size={18} color="#002EE5" />
                  <Text style={styles.secondaryButtonText}>Add Guest</Text>
                </TouchableOpacity>
              </View>

              {/* Guest List */}
              {eventGuests.map((guest, index) => (
                <View key={index} style={[styles.card, { padding: 16, backgroundColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                  <View>
                    <Text style={{ fontWeight: '600', fontSize: 16 }}>{guest.firstName} {guest.lastName}</Text>
                    <Text style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{guest.gender}</Text>
                    {guest.email ? <Text style={{ color: '#666', fontSize: 13 }}>{guest.email}</Text> : null}
                    {guest.phone ? <Text style={{ color: '#666', fontSize: 13 }}>{guest.phone}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveGuest(index)}>
                    <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}

            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || eventGuests.length === 0) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading || eventGuests.length === 0}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate ID</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.form}>
              {/* VISITOR FORM */}
              {type === 'visitor' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Visitor First Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={firstName}
                      onChangeText={setFirstName}
                      editable={!isLoading}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Visitor Last Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={lastName}
                      onChangeText={setLastName}
                      editable={!isLoading}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="example@gmail.com"
                      placeholderTextColor="#A0A0A0"
                      value={email}
                      onChangeText={setEmail}
                      editable={!isLoading}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Reason for Visit <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={purpose}
                      onChangeText={setPurpose}
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Arrival Date</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowVisitDatePicker(true)}
                      disabled={isLoading}
                    >
                      <Text style={styles.dateText}>
                        {visitDate.toLocaleDateString('en-GB')}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </TouchableOpacity>
                    {showVisitDatePicker && (
                      <DateTimePicker
                        value={visitDate}
                        mode="date"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowVisitDatePicker(false);
                          if (selectedDate) setVisitDate(selectedDate);
                        }}
                      />
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Number of additional Visitor(s)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      placeholderTextColor="#A0A0A0"
                      value={visitorNum}
                      onChangeText={setVisitorNum}
                      keyboardType="number-pad"
                      editable={!isLoading}
                    />
                  </View>
                </>
              )}

              {/* GUEST FORM */}
              {type === 'guest' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Events/Visit Title <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Birthday Party"
                      placeholderTextColor="#A0A0A0"
                      value={eventTitle}
                      onChangeText={setEventTitle}
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Guest First Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={firstName}
                      onChangeText={setFirstName}
                      editable={!isLoading}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Guest Last Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={lastName}
                      onChangeText={setLastName}
                      editable={!isLoading}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Relationship <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setIsRelationshipDropdownOpen(true)}
                      disabled={isLoading}
                    >
                      <Text style={[styles.dropdownText, !visitorRelationship && styles.placeholderText]}>
                        {visitorRelationship ? visitorRelationship.replace(/_/g, ' ') : 'select...'}
                      </Text>
                      <Ionicons name="chevron-down-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Gender <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setIsGenderDropdownOpen(true)}
                      disabled={isLoading}
                    >
                      <Text style={styles.dropdownText}>
                        {gender || 'select...'}
                      </Text>
                      <Ionicons name="chevron-down-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="example@gmail.com"
                      placeholderTextColor="#A0A0A0"
                      value={email}
                      onChangeText={setEmail}
                      editable={!isLoading}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Duration Start Date <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowStartDatePicker(true)}
                      disabled={isLoading}
                    >
                      <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
                        {startDate ? startDate.toLocaleDateString('en-GB') : 'select...'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker
                        value={startDate}
                        mode="date"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(false);
                          if (selectedDate) setStartDate(selectedDate);
                        }}
                      />
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Duration End Date <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowEndDatePicker(true)}
                      disabled={isLoading}
                    >
                      <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
                        {endDate ? endDate.toLocaleDateString('en-GB') : 'select...'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker
                        value={endDate}
                        mode="date"
                        minimumDate={startDate}
                        onChange={(event, selectedDate) => {
                          setShowEndDatePicker(false);
                          if (selectedDate) setEndDate(selectedDate);
                        }}
                      />
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Optional Note <Text style={{ fontWeight: 'normal', color: '#8E8E93' }}>(Optional)</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="enter..."
                      placeholderTextColor="#A0A0A0"
                      value={guestNote}
                      onChangeText={setGuestNote}
                      editable={!isLoading}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </>
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
                  {mode === 'edit' ? 'Update Token' : (type === 'guest' ? 'Generate ID' : 'Generate Token')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Modals */}
      <Modal
        visible={isRelationshipDropdownOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRelationshipDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsRelationshipDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Relationship</Text>
              <TouchableOpacity onPress={() => setIsRelationshipDropdownOpen(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {relationshipCategories.map((category: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalOption}
                  onPress={() => {
                    setVisitorRelationship(category.name);
                    setIsRelationshipDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      visitorRelationship === category.name && styles.modalOptionTextActive,
                    ]}
                  >
                    {category.name.replace(/_/g, ' ')}
                  </Text>
                  {visitorRelationship === category.name && (
                    <Ionicons name="checkmark" size={20} color="#002EE5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isGenderDropdownOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsGenderDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsGenderDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setIsGenderDropdownOpen(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View>
              {['Male', 'Female'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    setGender(option as 'Male' | 'Female');
                    setIsGenderDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, gender === option && styles.modalOptionTextActive]}>
                    {option}
                  </Text>
                  {gender === option && (
                    <Ionicons name="checkmark" size={20} color="#002EE5" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    // backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 14,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#8E8E93',
  },
  footer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  button: {
    backgroundColor: '#002EE5',
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
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '60%',
    minHeight: 300,
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
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
    textTransform: 'capitalize',
  },
  modalOptionTextActive: {
    color: '#002EE5',
    fontWeight: '600',
  },
  // New Styles
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  secondaryButtonText: {
    color: '#002EE5',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryContainer: {
    padding: 16,
    gap: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  categoryOptionActive: {
    borderColor: '#002EE5',
    backgroundColor: '#F0F8FF',
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },
  textContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  categoryTitleActive: {
    color: '#002EE5',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categorySubtitleActive: {
    color: '#5D9CEC', // Lighter blue for subtitle
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#002EE5',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  textButton: {
    alignItems: 'center',
    padding: 12,
  },
  textButtonLabel: {
    color: '#002EE5',
    fontSize: 16,
  }
});
