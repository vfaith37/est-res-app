import { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCreateEmergencyMutation } from '@/store/api/emergencyApi';
import { haptics } from '@/utils/haptics';

export default function ReportEmergencyScreen({ navigation }: any) {
  const [type, setType] = useState<'fire' | 'medical' | 'security' | 'other'>('security');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [createEmergency, { isLoading }] = useCreateEmergencyMutation();

  const emergencyTypes = [
    { value: 'fire', label: 'Fire', icon: 'flame', color: '#FF3B30' },
    { value: 'medical', label: 'Medical', icon: 'medical', color: '#FF9500' },
    { value: 'security', label: 'Security', icon: 'shield', color: '#002EE5' },
    { value: 'other', label: 'Other', icon: 'alert-circle', color: '#8E8E93' },
  ];

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      haptics.error();
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      haptics.heavy();
      await createEmergency({
        type,
        title,
        description,
        location,
      }).unwrap();

      haptics.success();
      Alert.alert(
        'Emergency Reported',
        'Your emergency has been reported. Help is on the way!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      haptics.error();
      Alert.alert('Error', error?.data?.message || 'Failed to report emergency');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <Text style={styles.alertText}>
              For life-threatening emergencies, call 911 immediately
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Emergency Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeContainer}>
                {emergencyTypes.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.typeButton,
                      type === t.value && {
                        backgroundColor: t.color,
                        borderColor: t.color
                      },
                    ]}
                    onPress={() => {
                      haptics.medium();
                      setType(t.value as any);
                    }}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={t.icon as any}
                      size={32}
                      color={type === t.value ? '#fff' : t.color}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        type === t.value && styles.typeTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Brief description of emergency"
                value={title}
                onChangeText={setTitle}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Provide detailed information about the emergency"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Exact location of emergency"
                value={location}
                onChangeText={setLocation}
                editable={!isLoading}
              />
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
              <>
                <Ionicons name="warning" size={20} color="#fff" />
                <Text style={styles.buttonText}>Report Emergency</Text>
              </>
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FF3B3020',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  typeTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 10,
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
