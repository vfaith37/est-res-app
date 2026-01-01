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

  return (
    <>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          {/* TYPE BADGE */}
          <View style={styles.typeBadge}>
            <Ionicons name="person" size={14} color="#007AFF" />
            <Text style={styles.typeBadgeText}>Visitor Pass</Text>
          </View>

          {/* QR CARD */}
          <View style={styles.qrCard}>
            <QRCode value={visitor.qrCode} size={220} />
            <View style={styles.qrMeta}>
              <Text style={styles.tokenLabel}>TOKEN ID</Text>
              <Text style={styles.tokenValue}>{visitor.id}</Text>
            </View>
          </View>

          {/* STATUS */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(visitor.status) },
            ]}
          >
            <Text style={styles.statusText}>{visitor.status}</Text>
          </View>

          {/* INFO */}
          <View style={styles.infoCard}>
            <Text style={styles.name}>{visitor.name}</Text>
            <Text style={styles.subtle}>{visitor.phone}</Text>
            <Text style={styles.subtle}>{visitor.email}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          {!isRevoked && (
            <>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Share Pass</Text>
              </TouchableOpacity>

              {canRevoke && (
                <TouchableOpacity
                  style={styles.dangerBtn}
                  onPress={openRevokeModal}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#FF3B30"
                  />
                  <Text style={styles.dangerBtnText}>Revoke Pass</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </SafeAreaView>

      {/* ================= REVOKE MODAL ================= */}
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

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>
            Are you sure you want to revoke this token for{' '}
            <Text style={{ fontWeight: '700' }}>{visitor.name}</Text>?
            It will become invalid immediately and cannot be used for
            entry.
          </Text>

          {/* <Text style={styles.modalText}>
            It will become invalid immediately and cannot be used for
            entry.
          </Text> */}

          <Text style={styles.modalQuestion}>
            Do you want to Revoke this Token?
          </Text>

          <View style={styles.modalActions}>

            <TouchableOpacity
              style={styles.modalRevoke}
              onPress={handleConfirmRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalRevokeText}>
                  Yes, revoke
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={closeRevokeModal}
            >
              <Text style={styles.modalCancelText}>No, cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      {/* ================================================ */}
    </>
  );
}

/* ---------------- HELPERS ---------------- */

function getStatusColor(status: string) {
  switch (status) {
    case 'Un-Used':
      return '#34C759';
    case 'Revoked':
      return '#FF3B30';
    case 'Used':
      return '#8E8E93';
    default:
      return '#8E8E93';
  }
}

/* ---------------- STYLES ---------------- */

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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    marginBottom: 16,
  },
  typeBadgeText: {
    fontWeight: '600',
    color: '#007AFF',
  },

  qrCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
  },
  qrMeta: {
    marginTop: 16,
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  tokenValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 3,
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtle: {
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },

  footer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },

  primaryBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  dangerBtn: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dangerBtnText: {
    color: '#FF3B30',
    fontWeight: '600',
  },

  /* ---------- MODAL ---------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalQuestion: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  modalCancel: {
    padding: 14,
    borderRadius: 25,
    // backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalRevoke: {
    padding: 14,
    borderRadius: 25,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  modalRevokeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
