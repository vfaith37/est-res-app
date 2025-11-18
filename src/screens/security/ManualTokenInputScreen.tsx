import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useValidateVisitorTokenMutation } from '@/store/api/visitorsApi';
import { Visitor } from '@/store/api/visitorsApi';
import ValidatedVisitorBottomSheet from '@/components/ValidatedVisitorBottomSheet';
import { haptics } from '@/utils/haptics';

export default function ManualTokenInputScreen() {
  const [token, setToken] = useState('');
  const [validatedVisitor, setValidatedVisitor] = useState<Visitor | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [validateToken, { isLoading }] = useValidateVisitorTokenMutation();

  const handleValidate = async () => {
    if (!token.trim()) {
      haptics.error();
      Alert.alert('Error', 'Please enter a token');
      return;
    }

    try {
      haptics.light();
      const visitor = await validateToken({ token: token.trim() }).unwrap();
      haptics.success();
      setValidatedVisitor(visitor);
      setShowBottomSheet(true);
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        'Validation Failed',
        error?.data?.message || 'Invalid token or token has expired'
      );
    }
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setToken('');
    setValidatedVisitor(null);
  };

  const handleSuccess = () => {
    Alert.alert(
      'Success',
      `Visitor ${validatedVisitor?.status === 'In-Use' ? 'checked out' : 'checked in'} successfully`
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="keypad" size={48} color="#007AFF" />
          </View>
          <Text style={styles.title}>Manual Token Entry</Text>
          <Text style={styles.subtitle}>
            Enter the visitor token provided by the guest or resident to validate and check them in
          </Text>
        </View>

        {/* Token Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>Visitor Token</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter token (e.g., TT1000000051)"
              value={token}
              onChangeText={setToken}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={handleValidate}
            />
            {token.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setToken('');
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.validateButton, isLoading && styles.validateButtonDisabled]}
            onPress={handleValidate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.validateButtonText}>Validate Token</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.helpTitle}>How to use</Text>
          </View>
          <View style={styles.helpItem}>
            <View style={styles.helpBullet}>
              <Text style={styles.helpBulletText}>1</Text>
            </View>
            <Text style={styles.helpText}>
              Request the visitor token from the guest
            </Text>
          </View>
          <View style={styles.helpItem}>
            <View style={styles.helpBullet}>
              <Text style={styles.helpBulletText}>2</Text>
            </View>
            <Text style={styles.helpText}>
              Enter the token in the field above
            </Text>
          </View>
          <View style={styles.helpItem}>
            <View style={styles.helpBullet}>
              <Text style={styles.helpBulletText}>3</Text>
            </View>
            <Text style={styles.helpText}>
              Tap "Validate Token" to verify and view details
            </Text>
          </View>
          <View style={styles.helpItem}>
            <View style={styles.helpBullet}>
              <Text style={styles.helpBulletText}>4</Text>
            </View>
            <Text style={styles.helpText}>
              Check in the visitor once validated
            </Text>
          </View>
        </View>
      </View>

      {/* Validated Visitor Bottom Sheet */}
      <ValidatedVisitorBottomSheet
        visible={showBottomSheet}
        visitor={validatedVisitor}
        onClose={handleCloseBottomSheet}
        onSuccess={handleSuccess}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  validateButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validateButtonDisabled: {
    opacity: 0.6,
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  helpBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpBulletText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    paddingTop: 2,
  },
});
