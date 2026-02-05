import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, RefreshControl, Alert, StatusBar } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, isValid } from 'date-fns';
import {
  useGetDomesticStaffQuery,
  useDeleteDomesticStaffMutation
} from '@/store/api/householdApi';
import { haptics } from '@/utils/haptics';
import ScreenHeaderWithStats from '@/components/ScreenHeaderWithStats';
import FilterModal from '@/components/FilterModal';

export default function DomesticStaffListScreen() {
  const navigation = useNavigation<any>();
  const { data: staff = [], isLoading, refetch, isFetching } = useGetDomesticStaffQuery();
  const [deleteStaff] = useDeleteDomesticStaffMutation();

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleFilterApply = (status: string | null) => {
    setFilterStatus(status);
  };

  // Stats Logic - Mocking Live-In/Out for now as it's not in API
  const totalStaff = staff.length;
  // TODO: Replace with real data when available. Assuming random check or default to false if missing.
  // Visual placeholder logic: If name length is odd -> Live-In (Just for demo variety if field missing)
  // In real app, check (s as any).isLiveIn
  const liveInStaff = staff.filter(s => (s as any).isLiveIn).length;
  const liveOutStaff = totalStaff - liveInStaff;

  const sections = useMemo(() => {
    let filtered = staff;

    // 1. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }

    // 2. Status Filter
    if (filterStatus) {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    // Group by Date Added (createdAt)
    const groups: { [key: string]: typeof staff[0][] } = {};

    filtered.forEach(member => {
      let dateKey = 'Unknown Date';
      if (member.createdAt) {
        try {
          const date = parseISO(member.createdAt);
          if (isValid(date)) {
            dateKey = format(date, 'EEEE MM/dd/yyyy');
          }
        } catch (e) {
          // fallback
        }
      }
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(member);
    });

    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date],
    }));
  }, [staff, searchQuery, filterStatus]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Staff', `Remove ${name} from domestic staff?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            haptics.medium();
            await deleteStaff(id).unwrap();
            haptics.success();
            Alert.alert('Success', 'Staff member removed');
          } catch (error: any) {
            haptics.error();
            Alert.alert('Error', error?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleAddStaff = () => {
    haptics.medium();
    navigation.navigate('AddDomesticStaff');
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderStaff = ({ item }: { item: typeof staff[0] }) => {
    // Mock Live-In status check
    const isLiveIn = (item as any).isLiveIn;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('EditDomesticStaff', { staff: item });
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.liveStatus}>{isLiveIn ? 'Live-In' : 'Live-Out'}</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{item.role}</Text>
          </View>
          <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.label}>Date Added</Text>
            <Text style={styles.value}>
              {item.createdAt ? format(parseISO(item.createdAt), 'MM/dd/yyyy') : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={[styles.cardRow, { marginTop: 12 }]}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Phone number</Text>
            <Text style={styles.value}>{item.phone}</Text>
          </View>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusArchived]}>
            <Text style={[styles.statusText, item.status === 'active' ? styles.statusTextActive : styles.statusTextArchived]}>
              {item.status === 'active' ? 'Active' : 'Archived'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Header Action
  const handleBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScreenHeaderWithStats
        title="Domestic Staff List"
        onBack={handleBack}
        onAdd={handleAddStaff}
        addButtonLabel="Add"
        stats={[
          { label: 'Total Domestic\nStaff', value: totalStaff },
          { label: 'Live-In Staff', value: liveInStaff },
          { label: 'Live-Out Staff', value: liveOutStaff },
        ]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterVisible(true)}
      />

      <View style={styles.content}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderStaff}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No domestic staff found</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Placeholder for FAB action (e.g., delete mode or quick actions)
          haptics.light();
        }}
      >
        <Ionicons name="alert-circle-outline" size={28} color="#fff" />
      </TouchableOpacity>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleFilterApply}
        onReset={() => setFilterStatus(null)}
        currentStatus={filterStatus}
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
  sectionHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  liveStatus: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusActive: {
    backgroundColor: '#DCFCE7', // Light green
  },
  statusArchived: {
    backgroundColor: '#FEE2E2', // Light red
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextArchived: {
    color: '#DC2626',
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
