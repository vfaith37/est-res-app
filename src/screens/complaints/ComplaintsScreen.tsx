import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, isValid } from 'date-fns';
import { useGetComplaintsQuery, Complaint } from '@/store/api/complaintsApi';
import { haptics } from '@/utils/haptics';
import ScreenHeaderWithStats from '@/components/ScreenHeaderWithStats';
import FilterModal from '@/components/FilterModal';

export default function ComplaintsScreen() {
  const navigation = useNavigation<any>();
  const { data: response, isLoading, refetch, isFetching } = useGetComplaintsQuery();

  const complaints = response?.data || [];
  const summary = response?.summary || { total: 0, resolved: 0, in_progress: 0, pending: 0 };

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleFilterApply = (status: string | null) => {
    setFilterStatus(status);
  };

  const sections = useMemo(() => {
    let filtered = [...complaints];

    // 1. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (filterStatus) {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Group by Date
    const groups: { [key: string]: Complaint[] } = {};

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

    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date],
    }));
  }, [complaints, searchQuery, filterStatus]);

  const handleSubmit = () => {
    haptics.medium();
    navigation.navigate('SubmitComplaint');
  };

  const handleBack = () => navigation.goBack();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Unresolved', color: '#FEE2E2', textColor: '#DC2626' }; // Red
      case 'in_progress': return { label: 'In Progress', color: '#FEF9C3', textColor: '#CA8A04' }; // Yellow
      case 'resolved': return { label: 'Resolved', color: '#DCFCE7', textColor: '#16A34A' }; // Green
      default: return { label: status, color: '#E5E7EB', textColor: '#374151' };
    }
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderComplaint = ({ item }: { item: Complaint }) => {
    const statusConfig = getStatusConfig(item.status);
    const dateCreated = item.createdAt
      ? format(parseISO(item.createdAt), 'MM/dd/yyyy')
      : '';

    // Capitalize Category
    const categoryDisplay = item.category.charAt(0).toUpperCase() + item.category.slice(1);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('ComplaintDetails', { complaint: item })
        }}
      >
        <View style={styles.cardHeader}>
          {/* Title */}
          <Text style={styles.cardTitle}>{item.title}</Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={[styles.cardRow, { marginTop: 12 }]}>
          {/* Left: Category */}
          <View style={styles.infoCol}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{item.category === 'maintenance' ? 'General' : categoryDisplay}</Text>
          </View>

          {/* Right: Date Created */}
          <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.label}>Date Created</Text>
            <Text style={styles.value}>{dateCreated}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScreenHeaderWithStats
        title="Complaints"
        onBack={handleBack}
        onAdd={handleSubmit}
        addButtonLabel="Add"
        stats={[
          { label: 'Total Complaint', value: summary.total },
          { label: 'Complaint\nResolved', value: summary.resolved },
          { label: 'Complaint in\nProgress', value: summary.in_progress },
        ]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterVisible(true)}
      />

      <View style={styles.content}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderComplaint}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No complaints found</Text>
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
    borderRadius: 8,
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
    color: '#9CA3AF', // lighter gray for label
    marginBottom: 2,
    fontWeight: '500',
  },
  value: {
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

