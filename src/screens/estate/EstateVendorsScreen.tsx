import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Linking, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetEstateVendorsQuery } from '@/store/api/estateVendorsApi';
import { haptics } from '@/utils/haptics';
import type { EstateVendor } from '@/store/api/estateVendorsApi';

type FilterCategory = 'all' | 'mini' | 'medium' | 'large';

export default function EstateVendorsScreen() {
  const { data, isLoading, refetch, isFetching } = useGetEstateVendorsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filteredVendors = useMemo(() => {
    if (!data?.data) return [];
    let filtered = [...data.data];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (vendor) => vendor.shopcategory.toLowerCase() === categoryFilter
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vendor) =>
          vendor.shopname.toLowerCase().includes(query) ||
          vendor.name.toLowerCase().includes(query) ||
          vendor.zone.toLowerCase().includes(query) ||
          vendor.addr.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data?.data, categoryFilter, searchQuery]);

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

  const activeFiltersCount = categoryFilter !== 'all' ? 1 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#C7C7CC"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && styles.filterButtonActive,
          ]}
          onPress={() => {
            haptics.light();
            setShowFilterModal(true);
          }}
        >
          <Ionicons
            name="filter"
            size={20}
            color={activeFiltersCount > 0 ? '#fff' : '#007AFF'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
        data={filteredVendors}
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
            <Text style={styles.emptySubtext}>
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Estate vendors will appear here'}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Vendors</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterOptions}>
                {(['all', 'mini', 'medium', 'large'] as FilterCategory[]).map(
                  (category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterOption,
                        categoryFilter === category && styles.filterOptionActive,
                      ]}
                      onPress={() => {
                        haptics.light();
                        setCategoryFilter(category);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          categoryFilter === category && styles.filterOptionTextActive,
                        ]}
                      >
                        {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  haptics.light();
                  setCategoryFilter('all');
                }}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  haptics.success();
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
