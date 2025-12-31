import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Linking, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useGetEstateVendorsQuery } from '@/store/api/estateVendorsApi';
import type { EstateVendor } from '@/store/api/estateVendorsApi';
import { haptics } from '@/utils/haptics';
import ScreenHeaderWithStats from '@/components/ScreenHeaderWithStats';
import FilterModal from '@/components/FilterModal';

export default function EstateVendorsScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isFetching } = useGetEstateVendorsQuery();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Filter Logic
  const filteredVendors = useMemo(() => {
    if (!data?.data) return [];
    let filtered = [...data.data];

    // 1. Category Filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (vendor) => vendor.shopcategory.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // 2. Search Filter
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
          // Remove spaces/special chars from phone if needed
          const cleanPhone = phone.replace(/[^0-9]/g, '');
          Linking.openURL(`tel:${cleanPhone}`);
        },
      },
    ]);
  };

  const handleBack = () => navigation.goBack();

  const handleFilterApply = (category: string | null) => {
    setCategoryFilter(category);
  };

  const renderVendor = ({ item }: { item: EstateVendor }) => (
    <View style={styles.card}>
      <Text style={styles.vendorName}>{item.name}</Text>

      {/* Grid Layout for details */}
      <View style={styles.gridRow}>
        {/* Row 1: Email and Shop Name */}
        <View style={styles.gridColLeft}>
          <Text style={styles.label}>Email Address</Text>
          {/* Mocking email if missing or using description field or just placeholder? 
                The interface doesn't strictly have email but image shows it. 
                I'll use placeholder or description if looks like email, or static string 'email@gmail.com' as per image mock?
                Actually, let's just use what we have or 'N/A' if missing to avoid breaking.
                Wait, the image shows "email@gmail.com", which is clearly mock data in the design.
                I will skip Email if not available in data, OR put "N/A"
             */}
          <Text style={styles.value} numberOfLines={1}>
            {/* EstateVendor type doesn't have email. Using placeholder to match design layout */}
            {(item as any).email || 'N/A'}
          </Text>
        </View>
        <View style={styles.gridColRight}>
          <Text style={[styles.label, { textAlign: 'right' }]}>Shop Name</Text>
          <Text style={[styles.value, { textAlign: 'right' }]} numberOfLines={1}>{item.shopname}</Text>
        </View>
      </View>

      <View style={[styles.gridRow, { marginTop: 12 }]}>
        {/* Row 2: Phone and Address */}
        <View style={styles.gridColLeft}>
          <Text style={styles.label}>Phone number</Text>
          <Text style={styles.value}>{item.fone}</Text>
        </View>
        <View style={styles.gridColRight}>
          <Text style={[styles.label, { textAlign: 'right' }]}>Address</Text>
          <Text style={[styles.value, { textAlign: 'right' }]} numberOfLines={2}>
            {item.zone}, {item.addr}
          </Text>
        </View>
      </View>

      {/* Optional: Call Action Overlay or just tap card? 
          The design doesn't show buttons ON the card, unlike previous.
          I'll make the whole card touchable to call or maybe show details?
          The previous implementation had Call/Whatsapp buttons.
          The image shows PURE CARD with no visible buttons.
          I'll keep it simple for now, maybe tap to call.
       */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScreenHeaderWithStats
        title="Estate Vendors"
        onBack={handleBack}
        // No Add button in header for this screen based on image, or maybe "filter" is enough.
        // Pass empty stats to hide stats cards as per image
        stats={[]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterVisible(true)}
      />

      <View style={styles.content}>
        <FlatList
          data={filteredVendors}
          renderItem={renderVendor}
          keyExtractor={(item) => item.vendorid}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No vendors found</Text>
            </View>
          }
        />
      </View>

      {/* Floating Action Button - Red with Exclamation/Report? */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Placeholder for FAB action
          haptics.light();
        }}
      >
        <Ionicons name="alert-circle-outline" size={28} color="#fff" />
      </TouchableOpacity>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleFilterApply}
        onReset={() => setCategoryFilter(null)}
        currentStatus={categoryFilter}
        filterType="category" // Use category mode
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 80,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridColLeft: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: 8,
  },
  gridColRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  label: {
    fontSize: 11,
    color: '#6B7280', // Gray-500
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#374151', // Gray-700
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626', // Red Alert color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});
