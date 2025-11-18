import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetEmergenciesQuery } from '@/store/api/emergencyApi';
import { haptics } from '@/utils/haptics';

type FilterStatus = 'all' | 'active' | 'responded' | 'resolved';

export default function EmergencyListScreen({ navigation }: any) {
  const { data: emergencies, isLoading, refetch, isFetching } = useGetEmergenciesQuery({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filteredEmergencies = useMemo(() => {
    if (!emergencies || !Array.isArray(emergencies)) return [];
    let filtered = [...emergencies];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [emergencies, statusFilter, searchQuery]);

  const getTypeIcon = (type: string) => {
    const icons: any = {
      fire: 'flame',
      medical: 'medical',
      security: 'shield',
      other: 'alert-circle',
    };
    return icons[type] || 'alert-circle';
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      fire: '#FF3B30',
      medical: '#FF9500',
      security: '#007AFF',
      other: '#8E8E93',
    };
    return colors[type] || '#8E8E93';
  };

  const getStatusColor = (status: string) => {
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

  const renderEmergency = ({ item }: any) => (
    <TouchableOpacity
      style={styles.emergencyCard}
      onPress={() => {
        haptics.light();
        // navigation.navigate('EmergencyDetails', { emergencyId: item.id });
      }}
    >
      <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
        <Ionicons name={getTypeIcon(item.type)} size={28} color={getTypeColor(item.type)} />
      </View>

      <View style={styles.emergencyContent}>
        <View style={styles.emergencyHeader}>
          <Text style={styles.emergencyTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.emergencyDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.emergencyMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>
              Reported by: {item.reportedByName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const activeFiltersCount = statusFilter !== 'all' ? 1 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Reports</Text>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => {
            haptics.heavy();
            navigation.navigate('ReportEmergency');
          }}
        >
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.reportButtonText}>Report Emergency</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search emergencies..."
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

      <FlatList
        data={filteredEmergencies}
        renderItem={renderEmergency}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#34C759" />
            <Text style={styles.emptyText}>No emergency reports</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your estate is safe'}
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
              <Text style={styles.modalTitle}>Filter Emergencies</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
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
                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                  setStatusFilter('all');
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    gap: 12,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 10,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  emergencyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
    lineHeight: 20,
  },
  emergencyMeta: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginTop: 16,
    color: '#000',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#34C759',
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