import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetEstateVendorsQuery } from '@/store/api/estateVendorsApi';
import { haptics } from '@/utils/haptics';
import type { EstateVendor } from '@/store/api/estateVendorsApi';

export default function EstateVendorsScreen() {
  const { data, isLoading, refetch, isFetching } = useGetEstateVendorsQuery();

  const handleCall = (phone: string, vendorName: string) => {
    haptics.light();
    Alert.alert('Call Vendor', `Call ${vendorName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => {
          Linking.openURL(`tel:${phone}`);
        },
      },
    ]);
  };

  const handleWhatsApp = (whatsappNo: string, vendorName: string) => {
    haptics.light();
    if (!whatsappNo || whatsappNo === 'Only') {
      Alert.alert('WhatsApp', 'WhatsApp number not available');
      return;
    }
    Linking.openURL(`whatsapp://send?phone=${whatsappNo}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mini':
        return '#34C759'; // Green
      case 'medium':
        return '#FF9500'; // Orange
      case 'large':
        return '#007AFF'; // Blue
      default:
        return '#8E8E93'; // Gray
    }
  };

  const renderVendor = ({ item }: { item: EstateVendor }) => (
    <View style={styles.vendorCard}>
      <View style={styles.vendorHeader}>
        <View style={styles.shopInfo}>
          <View style={styles.shopNameRow}>
            <Ionicons name="storefront" size={20} color="#007AFF" style={styles.shopIcon} />
            <Text style={styles.shopName}>{item.shopname}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.shopcategory) + '20' }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor(item.shopcategory) }]}>
              {item.shopcategory}
            </Text>
          </View>
        </View>
        <Text style={styles.vendorId}>{item.vendorid}</Text>
      </View>

      <View style={styles.vendorDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="male-female-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.gender}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.zone} - {item.addr}</Text>
        </View>

        {item.bizregno && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>Reg: {item.bizregno}</Text>
          </View>
        )}

        {item.descr && item.descr !== '1test' && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{item.descr}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCall(item.fone, item.shopname)}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.whatsappButton]}
          onPress={() => handleWhatsApp(item.whatsappno, item.shopname)}
          disabled={!item.whatsappno || item.whatsappno === 'Only'}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {data?.summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.summary.total_vendor}</Text>
            <Text style={styles.summaryLabel}>Total Vendors</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.summary.active_vendor}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.summary.currMth_vendor_knt}</Text>
            <Text style={styles.summaryLabel}>This Month</Text>
          </View>
        </View>
      )}

      <FlatList
        data={data?.data || []}
        renderItem={renderVendor}
        keyExtractor={(item) => item.vendorid}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No vendors found</Text>
            <Text style={styles.emptySubtext}>Estate vendors will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vendorHeader: {
    marginBottom: 12,
  },
  shopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopIcon: {
    marginRight: 8,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  vendorId: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  vendorDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
});
