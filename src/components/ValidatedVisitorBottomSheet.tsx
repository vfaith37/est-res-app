import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Visitor } from '@/store/api/visitorsApi';
import {
  useCheckInVisitorMutation,
  useCheckOutVisitorMutation,
} from '@/store/api/visitorsApi';
import { haptics } from '@/utils/haptics';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ValidatedVisitorBottomSheetProps {
  visible: boolean;
  visitor: Visitor | null;
  residentName?: string;
  residentAddress?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ValidatedVisitorBottomSheet({
  visible,
  visitor,
  residentName,
  residentAddress,
  onClose,
  onSuccess,
}: ValidatedVisitorBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInVisitorMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutVisitorMutation();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visitor) return null;

  const isCheckedIn = visitor.status === 'In-Use';
  const isLoading = isCheckingIn || isCheckingOut;

  const handleCheckIn = async () => {
    try {
      haptics.light();
      await checkIn({ tokenId: visitor.id }).unwrap();
      haptics.success();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      haptics.error();
      console.error('Check-in failed:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      haptics.light();
      await checkOut({ tokenId: visitor.id }).unwrap();
      haptics.success();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      haptics.error();
      console.error('Check-out failed:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            haptics.light();
            onClose();
          }}
        />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isCheckedIn ? '#34C759' : '#FF9500',
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {isCheckedIn ? 'Checked In' : 'Pending'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                onClose();
              }}
            >
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Visitor Information */}
            <Text style={styles.sectionTitle}>Visitor Information</Text>

            <InfoRow
              icon="person"
              label="Visitor's Name"
              value={visitor.name}
            />
            <InfoRow
              icon="call"
              label="Phone Number"
              value={visitor.phone}
            />
            <InfoRow
              icon="document-text"
              label="Reason for Visit"
              value={visitor.purpose}
            />
            <InfoRow
              icon="calendar"
              label="Expected Visit Date"
              value={new Date(visitor.visitDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            />
            {visitor.departureDate && (
              <InfoRow
                icon="calendar-outline"
                label="Departure Date"
                value={new Date(visitor.departureDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            )}
            <InfoRow
              icon="people"
              label="Number of Additional Visitor(s)"
              value={visitor.visitorNum > 1 ? `${visitor.visitorNum - 1}` : '0'}
            />
            <InfoRow
              icon="time"
              label="Date Generated"
              value={new Date(visitor.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />

            {/* Resident Information */}
            <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
              Resident Information
            </Text>

            <InfoRow
              icon="home"
              label="Resident Name"
              value={residentName || 'N/A'}
            />
            <InfoRow
              icon="location"
              label="Resident Address"
              value={residentAddress || visitor.address || 'N/A'}
            />
            <InfoRow
              icon="card"
              label="Token ID"
              value={visitor.id}
            />
          </ScrollView>

          {/* Footer with Action Button */}
          <View style={styles.footer}>
            {isCheckedIn ? (
              <TouchableOpacity
                style={[styles.button, styles.buttonCheckOut]}
                onPress={handleCheckOut}
                disabled={isLoading}
              >
                {isCheckingOut ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Check Out</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonCheckIn]}
                onPress={handleCheckIn}
                disabled={isLoading}
              >
                {isCheckingIn ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Check In</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color="#007AFF" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  sectionTitleSpacing: {
    marginTop: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    paddingTop: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 10,
  },
  buttonCheckIn: {
    backgroundColor: '#34C759',
  },
  buttonCheckOut: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
