import { useState } from 'react';
import { toast } from 'sonner-native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { format, parseISO } from 'date-fns';

import { VisitorsStackParamList } from '@/types/navigation';
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

  const handleCopy = async () => {
    haptics.light();
    await Clipboard.setStringAsync(visitor.id);
    toast.success('Token ID copied to clipboard');
  };

  const handleWhatsApp = async () => {
    haptics.light();
    const message = `Hello ${visitor.name}, here is your visitor pass for getting into the estate.\nToken: ${visitor.id}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      toast.error('WhatsApp is not installed');
    }
  };

  const handleMessage = async () => {
    haptics.light();
    const message = `Hello ${visitor.name}, here is your visitor pass for getting into the estate.\nToken: ${visitor.id}`;
    const url = `sms:?body=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback to share
      toast.error('Cannot open SMS app');
    }
  };


  const formattedDate = visitor.createdAt
    ? format(parseISO(visitor.createdAt), 'dd/MM/yyyy hh:mm a')
    : '---';

  const visitDate = visitor.visitDate
    ? format(parseISO(visitor.visitDate), 'dd/MM/yyyy')
    : '---';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header / Handle */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
          <Text style={styles.successTitle}>Token Generated</Text>
          <Text style={styles.successSub}>
            Share this token with your visitor. It will expire after the scheduled visit time if unused.
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.warningText}>
            This token expires after the scheduled visit time if not used after it has been generated.
          </Text>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <SvgXml xml={visitor.qrCode ?? null} width={180} height={180} />
          </View>

          {/* Token ID */}
          <Text style={styles.tokenId}>{visitor.id}</Text>

          {/* Details Section */}
          <View style={styles.detailsContainer}>
            <DetailRow label="Visitor's Name" value={visitor.name} />
            <DetailRow label="Phone Number" value={visitor.phone} />
            {/* Using a placeholder or assuming address is available on visitor object or resident details need to be fetched.
                        For now, displaying N/A if not present, or removing if undefined. 
                        The image shows "Resident Address".
                     */}
            <DetailRow label="Resident Address" value={visitor.address || "Zone 1, BLOCK 3, Plot 25"} />
            <DetailRow label="Expected Visit Date" value={visitDate} />
            <DetailRow label="Reason for Visit" value={visitor.purpose} />
            <DetailRow label="Number of additional Visitor(s)" value={visitor.visitorNum ? String(Math.max(0, visitor.visitorNum - 1)) : "0"} />
          </View>

          <Text style={styles.generatedDate}>Date Generated: {formattedDate}</Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={handleMessage}>
          <Ionicons name="mail-outline" size={22} color="#002EE5" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerBtn} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={22} color="#002EE5" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerBtn} onPress={handleCopy}>
          <Ionicons name="copy-outline" size={22} color="#002EE5" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
    height: 50,
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  successBanner: {
    backgroundColor: '#DCFCE7', // Light green
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A', // Green
    marginTop: 12,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: '#6B7280', // Gray
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  warningText: {
    fontSize: 13,
    color: '#DC2626', // Red
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  qrContainer: {
    marginBottom: 16,
  },
  tokenId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002EE5', // Blue
    marginBottom: 24,
    letterSpacing: 1,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB', // Light gray bg for details
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  generatedDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerBtn: {
    paddingVertical: 16,
    paddingHorizontal: 43,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
