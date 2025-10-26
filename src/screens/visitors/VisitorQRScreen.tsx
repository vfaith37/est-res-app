import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { VisitorsStackParamList } from '@/types/navigation';
import { 
  useGetVisitorQuery, 
  useRevokeVisitorMutation, 
  useShareVisitorPassMutation 
} from '@/store/api/visitorsApi';
import { haptics } from '@/utils/haptics';

type VisitorQRScreenNavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'VisitorQR'
>;

type VisitorQRScreenRouteProp = RouteProp<VisitorsStackParamList, 'VisitorQR'>;

type Props = {
  navigation: VisitorQRScreenNavigationProp;
  route: VisitorQRScreenRouteProp;
};

export default function VisitorQRScreen({ navigation, route }: Props) {
  const { visitorId } = route.params;
  const { data: visitor, isLoading } = useGetVisitorQuery(visitorId);
  const [revokeVisitor, { isLoading: isRevoking }] = useRevokeVisitorMutation();
  const [sharePass] = useShareVisitorPassMutation();

  const handleShare = async () => {
    if (!visitor) return;

    try {
      haptics.light();
      
      const duration = visitor.type === 'visitor' && visitor.checkOutDate
        ? `\nDuration: ${new Date(visitor.visitDate).toLocaleDateString()} - ${new Date(visitor.checkOutDate).toLocaleDateString()}`
        : '';

      await Share.share({
        message: `Guest Pass for ${visitor.name}\n` +
          `Type: ${visitor.type === 'guest' ? 'Single Day Guest' : 'Multiple Days Visitor'}\n` +
          `Visit Date: ${new Date(visitor.visitDate).toLocaleDateString()}` +
          duration +
          `\nTime: ${visitor.timeSlot}\n` +
          `Entry Token: ${visitor.entryToken}\n` +
          `QR Code: ${visitor.qrCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRevoke = () => {
    if (!visitor) return;

    Alert.alert(
      'Revoke Guest Pass',
      'Are you sure you want to revoke this guest pass? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.medium();
              await revokeVisitor(visitor.id).unwrap();
              haptics.success();
              Alert.alert('Success', 'Guest pass revoked successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              haptics.error();
              Alert.alert('Error', error?.data?.message || 'Failed to revoke guest pass');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!visitor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Guest pass not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isRevoked = visitor.status === 'revoked';
  const canRevoke = ['pending', 'approved'].includes(visitor.status);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Ionicons
            name={visitor.type === 'guest' ? 'person' : 'people'}
            size={16}
            color="#007AFF"
          />
          <Text style={styles.typeBadgeText}>
            {visitor.type === 'guest' ? 'Single Day Guest' : 'Multiple Days Visitor'}
          </Text>
        </View>

        {/* QR Code */}
        <View style={[styles.qrContainer, isRevoked && styles.qrContainerRevoked]}>
          {isRevoked ? (
            <View style={styles.revokedOverlay}>
              <Ionicons name="close-circle" size={80} color="#FF3B30" />
              <Text style={styles.revokedText}>REVOKED</Text>
            </View>
          ) : (
            <QRCode value={visitor.qrCode} size={250} />
          )}
        </View>

        {/* Entry Token */}
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>Entry Token</Text>
          <Text style={styles.tokenValue}>{visitor.entryToken}</Text>
          <Text style={styles.tokenHelper}>Security can use this token for manual entry</Text>
        </View>

        {/* Guest Info */}
        <View style={styles.infoCard}>
          <Text style={styles.name}>{visitor.name}</Text>
          <Text style={styles.phone}>{visitor.phone}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailText}>
                {new Date(visitor.visitDate).toLocaleDateString()}
                {visitor.type === 'visitor' && visitor.checkOutDate &&
                  ` - ${new Date(visitor.checkOutDate).toLocaleDateString()}`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailText}>{visitor.timeSlot}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailText}>{visitor.purpose}</Text>
            </View>

            {visitor.vehicleNumber && (
              <View style={styles.detailRow}>
                <Ionicons name="car-outline" size={20} color="#8E8E93" />
                <Text style={styles.detailText}>{visitor.vehicleNumber}</Text>
              </View>
            )}
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(visitor.status) }]}>
            <Text style={styles.statusText}>{visitor.status.toUpperCase()}</Text>
          </View>
        </View>

        {!isRevoked && (
          <Text style={styles.instructionText}>
            Show this QR code to security at the gate or provide the entry token
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {!isRevoked && (
          <>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#007AFF" />
              <Text style={styles.shareButtonText}>Share Pass</Text>
            </TouchableOpacity>

            {canRevoke && (
              <TouchableOpacity
                style={[styles.revokeButton, isRevoking && styles.revokeButtonDisabled]}
                onPress={handleRevoke}
                disabled={isRevoking}
              >
                {isRevoking ? (
                  <ActivityIndicator color="#FF3B30" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
                    <Text style={styles.revokeButtonText}>Revoke Pass</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return '#34C759';
    case 'pending':
      return '#FF9500';
    case 'checked-in':
      return '#007AFF';
    case 'checked-out':
      return '#8E8E93';
    case 'expired':
      return '#8E8E93';
    case 'revoked':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  typeBadgeText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrContainerRevoked: {
    opacity: 0.5,
    position: 'relative',
  },
  revokedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  revokedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 10,
  },
  tokenCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  tokenLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tokenHelper: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  phone: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailsContainer: {
    gap: 12,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  revokeButtonDisabled: {
    opacity: 0.6,
  },
  revokeButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
  },
});