import { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetEmergenciesQuery,
  Emergency,
} from '@/store/api/emergencyApi';
import { haptics } from '@/utils/haptics';

type FilterStatus = 'all' | 'active' | 'responded' | 'resolved';
type FilterDate = 'all' | 'today' | 'week' | 'month';

interface EmergencySection {
  title: string;
  data: Emergency[];
}

export default function SecurityEmergenciesScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [dateFilter, setDateFilter] = useState<FilterDate>('all');

  const { data: emergencies, isLoading, refetch } = useGetEmergenciesQuery({});

  const filteredEmergencies = useMemo(() => {
    if (!emergencies || !Array.isArray(emergencies)) return [];

    let filtered = [...emergencies];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    if (dateFilter === 'today') {
      filtered = filtered.filter((e) => new Date(e.createdAt) >= today);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter((e) => new Date(e.createdAt) >= weekAgo);
    } else if (dateFilter === 'month') {
      filtered = filtered.filter((e) => new Date(e.createdAt) >= monthAgo);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [emergencies, statusFilter, dateFilter, searchQuery]);

  // Group emergencies by date
  const groupedEmergencies = useMemo(() => {
    const groups: { [key: string]: Emergency[] } = {};

    filteredEmergencies.forEach((emergency) => {
      const date = new Date(emergency.createdAt);
      const dateKey = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(emergency);
    });

    // Convert to sections array and sort by date (most recent first)
    return Object.entries(groups)
      .map(([title, data]) => ({
        title,
        data: data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data[0].createdAt);
        const dateB = new Date(b.data[0].createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [filteredEmergencies]);

  const getStatusLabel = (status: Emergency['status']) => {
    switch (status) {
      case 'active':
        return 'Unresolved';
      case 'responded':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const getStatusColor = (status: Emergency['status']) => {
    switch (status) {
      case 'active':
        return '#FF3B30';
      case 'responded':
        return '#FF9500';
      case 'resolved':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getTypeIcon = (type: Emergency['type']) => {
    switch (type) {
      case 'fire':
        return 'flame';
      case 'medical':
        return 'medical';
      case 'security':
        return 'shield';
      default:
        return 'alert-circle';
    }
  };

  const renderEmergencyCard = ({ item }: { item: Emergency }) => {
    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          haptics.light();
          // TODO: Navigate to emergency details
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: `${statusColor}15` }]}>
            <Ionicons name={getTypeIcon(item.type)} size={20} color={statusColor} />
          </View>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.emergencyTitle}>{item.title}</Text>
            <Text style={styles.emergencyType}>{item.type.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.footerText}>
              {new Date(item.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="person-outline" size={14} color="#8E8E93" />
            <Text style={styles.footerText}>{item.reportedByName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: EmergencySection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionHeaderCount}>
        {section.data.length} {section.data.length === 1 ? 'emergency' : 'emergencies'}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-done-circle-outline" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No Emergencies Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
          ? 'Try adjusting your filters'
          : 'All clear! No emergencies reported'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergencies</Text>
        <TouchableOpacity
          style={styles.raiseButton}
          onPress={() => {
            haptics.medium();
            navigation.navigate('ReportEmergency');
          }}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.raiseButtonText}>Raise Emergency</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search emergencies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                setSearchQuery('');
              }}
            >
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            (statusFilter !== 'all' || dateFilter !== 'all') && styles.filterButtonActive,
          ]}
          onPress={() => {
            haptics.light();
            setShowFilterModal(true);
          }}
        >
          <Ionicons
            name="filter"
            size={20}
            color={statusFilter !== 'all' || dateFilter !== 'all' ? '#fff' : '#002EE5'}
          />
        </TouchableOpacity>
      </View>

      {/* Emergencies List */}
      <SectionList
        sections={groupedEmergencies}
        renderItem={renderEmergencyCard}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          groupedEmergencies.length === 0 && styles.listContentCentered,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#002EE5"
          />
        }
        stickySectionHeadersEnabled
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              haptics.light();
              setShowFilterModal(false);
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Emergencies</Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowFilterModal(false);
                }}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Status Filter */}
              <Text style={styles.filterSectionTitle}>By Status</Text>
              <View style={styles.filterOptionsContainer}>
                {(['all', 'active', 'responded', 'resolved'] as FilterStatus[]).map(
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
                          : status === 'active'
                            ? 'Unresolved'
                            : status === 'responded'
                              ? 'In Progress'
                              : 'Resolved'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Date Filter */}
              <Text style={[styles.filterSectionTitle, styles.filterSectionSpacing]}>
                By Date
              </Text>
              <View style={styles.filterOptionsContainer}>
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
            </ScrollView>

            {/* Clear Filters Button */}
            {(statusFilter !== 'all' || dateFilter !== 'all') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  haptics.light();
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                <Text style={styles.clearFiltersButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
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
  raiseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  raiseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    gap: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#002EE5',
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentCentered: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  sectionHeaderCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  emergencyType: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScroll: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterSectionSpacing: {
    marginTop: 24,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  filterOptionActive: {
    backgroundColor: '#002EE5',
    borderColor: '#002EE5',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  clearFiltersButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

