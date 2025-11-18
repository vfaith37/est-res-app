import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/utils/haptics';

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'resolved';
type FilterDate = 'all' | 'today' | 'week' | 'month';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'noise' | 'security' | 'cleanliness' | 'other';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  residentName?: string;
  residentAddress?: string;
}

interface ComplaintsScreenProps {
  navigation: any;
}

export default function ComplaintsScreen({ navigation }: ComplaintsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [dateFilter, setDateFilter] = useState<FilterDate>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TODO: Replace with actual API call
  const mockComplaints: Complaint[] = [
    {
      id: '1',
      title: 'Broken Street Light',
      description: 'Street light near Block A not working for 3 days',
      category: 'maintenance',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      residentName: 'John Doe',
      residentAddress: 'Block A, Unit 12',
    },
    {
      id: '2',
      title: 'Loud Music at Night',
      description: 'Neighbor playing loud music past midnight',
      category: 'noise',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      residentName: 'Jane Smith',
      residentAddress: 'Block B, Unit 5',
    },
  ];

  const complaints = mockComplaints;

  const handleRefresh = async () => {
    haptics.light();
    setIsRefreshing(true);
    // TODO: Refetch complaints from API
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSubmitComplaint = () => {
    haptics.light();
    navigation.navigate('SubmitComplaint');
  };

  const handleComplaintPress = (complaint: Complaint) => {
    haptics.light();
    navigation.navigate('ComplaintDetails', { complaint });
  };

  const handleFilterPress = () => {
    haptics.light();
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    haptics.success();
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    haptics.light();
    setStatusFilter('all');
    setDateFilter('all');
  };

  const filteredComplaints = useMemo(() => {
    if (!complaints || !Array.isArray(complaints)) return [];
    let filtered = [...complaints];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      filtered = filtered.filter((c) => {
        const complaintDate = new Date(c.createdAt);
        complaintDate.setHours(0, 0, 0, 0);
        return complaintDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((c) => new Date(c.createdAt) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((c) => new Date(c.createdAt) >= monthAgo);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [complaints, statusFilter, dateFilter, searchQuery]);

  // Group complaints by date
  const groupedComplaints = useMemo(() => {
    const groups: { [key: string]: Complaint[] } = {};

    filteredComplaints.forEach((complaint) => {
      const date = new Date(complaint.createdAt);
      const dateKey = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(complaint);
    });

    return Object.entries(groups)
      .map(([title, data]) => ({
        title,
        data,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data[0].createdAt);
        const dateB = new Date(b.data[0].createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [filteredComplaints]);

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'in_progress':
        return '#007AFF';
      case 'resolved':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const getCategoryIcon = (category: Complaint['category']) => {
    switch (category) {
      case 'maintenance':
        return 'build';
      case 'noise':
        return 'volume-high';
      case 'security':
        return 'shield';
      case 'cleanliness':
        return 'trash';
      default:
        return 'alert-circle';
    }
  };

  const renderComplaintCard = ({ item }: { item: Complaint }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.complaintCard}
        onPress={() => handleComplaintPress(item)}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.categoryIcon, { backgroundColor: `${statusColor}20` }]}
          >
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={24}
              color={statusColor}
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.complaintTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusText}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.complaintDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.complaintMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>
                  {new Date(item.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const activeFiltersCount = [
    statusFilter !== 'all',
    dateFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Complaints</Text>
          <Text style={styles.headerSubtitle}>
            {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitComplaint}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search complaints..."
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
          onPress={handleFilterPress}
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

      {/* Complaints List */}
      <SectionList
        sections={groupedComplaints}
        renderItem={renderComplaintCard}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No complaints found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Submit your first complaint'}
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
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Complaints</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {(['all', 'pending', 'in_progress', 'resolved'] as FilterStatus[]).map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        statusFilter === status && styles.filterOptionActive,
                      ]}
                      onPress={() => {
                        haptics.light();
                        setStatusFilter(status);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          statusFilter === status && styles.filterOptionTextActive,
                        ]}
                      >
                        {status === 'all'
                          ? 'All'
                          : status === 'in_progress'
                          ? 'In Progress'
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Date Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date</Text>
              <View style={styles.filterOptions}>
                {(['all', 'today', 'week', 'month'] as FilterDate[]).map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.filterOption,
                      dateFilter === date && styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      haptics.light();
                      setDateFilter(date);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        dateFilter === date && styles.filterOptionTextActive,
                      ]}
                    >
                      {date === 'all'
                        ? 'All Time'
                        : date === 'today'
                        ? 'Today'
                        : date === 'week'
                        ? 'This Week'
                        : 'This Month'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
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
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  complaintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  complaintTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  complaintDescription: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 8,
  },
  complaintMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
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
