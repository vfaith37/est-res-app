import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useCheckInVisitorMutation, useValidateVisitorTokenMutation } from '@/store/api/visitorsApi';
import { haptics } from '@/utils/haptics';

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [entryToken, setEntryToken] = useState('');

  const [validateVisitorToken, { isLoading: isValidating }] = useValidateVisitorTokenMutation();
  const [checkInVisitor, { isLoading: isCheckingIn }] = useCheckInVisitorMutation();

  const isLoading = isValidating || isCheckingIn;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isLoading) return;

    setScanned(true);
    haptics.medium();

    try {
      // Step 1: Validate token and get visitor details
      const visitor = await validateVisitorToken({ token: data }).unwrap();

      // Step 2: Check in the visitor
      await checkInVisitor({ tokenId: visitor.id }).unwrap();

      haptics.success();

      Alert.alert(
        'Check-In Successful',
        `${visitor.name} has been checked in.\nType: ${visitor.type === 'guest' ? 'Guest' : 'Visitor'}${visitor.address ? `\nUnit: ${visitor.address}` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        'Check-In Failed',
        error?.data?.message || 'Invalid QR code or pass expired',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );
    }
  };

  const handleManualEntry = async () => {
    if (!entryToken.trim()) {
      haptics.error();
      Alert.alert('Error', 'Please enter an entry token');
      return;
    }

    try {
      haptics.light();

      // Step 1: Validate token and get visitor details
      const visitor = await validateVisitorToken({ token: entryToken.trim() }).unwrap();

      // Step 2: Check in the visitor
      await checkInVisitor({ tokenId: visitor.id }).unwrap();

      haptics.success();

      Alert.alert(
        'Check-In Successful',
        `${visitor.name} has been checked in.\nType: ${visitor.type === 'guest' ? 'Guest' : 'Visitor'}${visitor.address ? `\nUnit: ${visitor.address}` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowManualEntry(false);
              setEntryToken('');
            },
          },
        ]
      );
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        'Check-In Failed',
        error?.data?.message || 'Invalid entry token or pass expired'
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.messageText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-outline" size={64} color="#8E8E93" />
          <Text style={styles.messageText}>No access to camera</Text>
          <Text style={styles.subMessageText}>
            Please enable camera permission in settings
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Guest Pass</Text>
        <Text style={styles.subtitle}>
          Position QR code within the frame to scan
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.footer}>
        {scanned && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.rescanButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => {
            haptics.light();
            setShowManualEntry(true);
          }}
        >
          <Ionicons name="keypad-outline" size={20} color="#007AFF" />
          <Text style={styles.manualButtonText}>Enter Token Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntry}
        animationType="slide"
        transparent
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual Entry</Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowManualEntry(false);
                  setEntryToken('');
                }}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter the 6-digit entry token provided by the guest
            </Text>

            <TextInput
              style={styles.tokenInput}
              placeholder="Enter token"
              value={entryToken}
              onChangeText={setEntryToken}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleManualEntry}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Check In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#007AFF',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
  },
  manualButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  subMessageText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  tokenInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});