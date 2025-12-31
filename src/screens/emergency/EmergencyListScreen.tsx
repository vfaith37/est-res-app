import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, isValid } from 'date-fns';
import { useGetEmergenciesQuery } from '@/store/api/emergencyApi';
import { haptics } from '@/utils/haptics';
import ScreenHeaderWithStats from '@/components/ScreenHeaderWithStats';
import FilterModal from '@/components/FilterModal';
import type { Emergency } from '@/store/api/emergencyApi';

export default function EmergencyListScreen() {
  const navigation = useNavigation<any>();
  const { data: emergencies = [], isLoading, refetch, isFetching } = useGetEmergenciesQuery({});

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleFilterApply = (status: string | null) => {
    setFilterStatus(status);
  };

  const sections = useMemo(() => {
    let filtered = [...emergencies];

    // 1. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (filterStatus) {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // Group by Date
    const groups: { [key: string]: Emergency[] } = {};

    filtered.forEach(item => {
      let dateKey = 'Unknown Date';
      if (item.createdAt) {
        try {
          const date = parseISO(item.createdAt);
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
      groups[dateKey].push(item);
    });

    // Sort dates descending (newest first) or ascending? usually list is descending.
    // The design shows one date "Tuesday 12/10/2024".
    // I will sort keys to be sure.

    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date],
    }));
  }, [emergencies, searchQuery, filterStatus]);

  const handleRaiseEmergency = () => {
    haptics.heavy(); // Heavy impact for emergency
    navigation.navigate('ReportEmergency');
  };

  const handleBack = () => navigation.goBack();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Unresolved', color: '#FEE2E2', textColor: '#DC2626' }; // Red
      case 'responded': return { label: 'In Progress', color: '#FEF9C3', textColor: '#CA8A04' }; // Yellow
      case 'resolved': return { label: 'Resolved', color: '#DCFCE7', textColor: '#16A34A' }; // Green
      default: return { label: status, color: '#E5E7EB', textColor: '#374151' };
    }
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderEmergency = ({ item }: { item: Emergency }) => {
    const statusConfig = getStatusConfig(item.status);
    const dateReported = item.createdAt
      ? format(parseISO(item.createdAt), 'MM/dd/yyyy')
      : '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to details if needed
          // navigation.navigate('EmergencyDetails', { id: item.id })
        }}
      >
        <View style={styles.cardRow}>
          {/* Left: Title */}
          <Text style={styles.cardTitle}>{item.title}</Text>

          {/* Right: Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={[styles.cardRow, { marginTop: 4, alignItems: 'flex-start' }]}>
          {/* Left: Description */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          {/* Right: Date */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>Date Reported</Text>
            <Text style={styles.dateText}>{dateReported}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScreenHeaderWithStats
        title="Emergencies"
        onBack={handleBack}
        onAdd={handleRaiseEmergency}
        addButtonLabel="Raise"
        buttonStyle={{ backgroundColor: '#DC2626' }} // Custom Red Button
        stats={[]} // No stats per design
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterVisible(true)}
      />

      <View style={styles.content}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderEmergency}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No emergency reports</Text>
            </View>
          }
        />
      </View>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleFilterApply}
        onReset={() => setFilterStatus(null)}
        currentStatus={filterStatus}
        filterType="status"
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
    paddingBottom: 40,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8, // Design card radius looks a bit smaller/standard
    padding: 16,
    marginBottom: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  dateText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
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