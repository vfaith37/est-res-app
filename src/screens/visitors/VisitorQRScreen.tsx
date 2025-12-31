import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { VisitorsStackParamList } from '@/types/navigation';
import { useRevokeVisitorMutation } from '@/store/api/visitorsApi';
import { haptics } from '@/utils/haptics';

type NavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'VisitorQR'
>;
type RouteProps = RouteProp<VisitorsStackParamList, 'VisitorQR'>;

type Props = {
  navigation: NavigationProp;
  route: RouteProps;
};

export default function VisitorQRScreen({ navigation, route }: Props) {
  const { visitor } = route.params;

  const [revokeVisitor, { isLoading: isRevoking }] =
    useRevokeVisitorMutation();

  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const isRevoked = visitor.status === 'Revoked';
  const canRevoke = visitor.status === 'Un-Used';

  const openRevokeModal = () => {
    haptics.light();
    setShowRevokeModal(true);
  };

  const closeRevokeModal = () => {
    setShowRevokeModal(false);
  };

  const handleConfirmRevoke = async () => {
    try {
      haptics.medium();
      await revokeVisitor({ tokenId: visitor.id }).unwrap();
      haptics.success();
      closeRevokeModal();
      navigation.goBack();
    } catch {
      haptics.error();
    }
  };

  const handleShare = async () => {
    haptics.light();
    await Share.share({
      message: `Visitor Pass for ${visitor.name}\nToken ID: ${visitor.id}`,
    });
  };

  const handleShareOption = async (option: 'email' | 'whatsapp' | 'copy') => {
    haptics.light();
    // For now just share normal text, extended logic can be added later
    await Share.share({
      message: `Visitor Pass: ${visitor.id}\nFor: ${visitor.name}`,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* QR CARD */}
        <View style={styles.resultCard}>
          <View style={styles.successHeader}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Guest ID Generated</Text>
            <Text style={styles.successSubtitle}>
              Share this code with your guest. It can be used multiple times until the end of the validity period.
            </Text>
          </View>

          <View style={styles.qrContainer}>
            <QRCode value={visitor.qrCode} size={200} />
            <Text style={styles.tokenCode}>{visitor.id}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guest Name</Text>
              <Text style={styles.detailValue}>{visitor.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Resident Address</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {visitor.address || 'Zone 1, BLOCK 3, Plot 25'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Relationship</Text>
              <Text style={styles.detailValue}>
                {(visitor as any).visitorRelationship || 'Guest'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Validity Period</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {new Date(visitor.visitDate).toLocaleDateString('en-GB')} – {visitor.departureDate ? new Date(visitor.departureDate).toLocaleDateString('en-GB') : new Date(visitor.visitDate).toLocaleDateString('en-GB')}
              </Text>
            </View>
            <Text style={styles.generatedDate}>
              Date Generated: {new Date(visitor.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          </View>
        </View>
      </View>

      {/* FOOTER Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShareOption('email')}>
          <Ionicons name="mail-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShareOption('whatsapp')}>
          <Ionicons name="logo-whatsapp" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShareOption('copy')}>
          <Ionicons name="copy-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Keep modal logic just in case, though unused in UI */}
      <Modal
        visible={showRevokeModal}
        transparent
        animationType="slide"
        onRequestClose={closeRevokeModal}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={closeRevokeModal}
        />
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    // padding: 20, // Padding inside handled by children
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  successHeader: {
    backgroundColor: '#E8F5E9', // Light green bg
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C7E34', // Darker green
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  tokenCode: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF', // Blue color from design
    letterSpacing: 1,
  },
  detailsContainer: {
    backgroundColor: '#F9F9F9',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  generatedDate: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
