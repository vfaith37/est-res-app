import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity, RefreshControl, Image,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VisitorsStackParamList } from '@/types/navigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useGetVisitorsQuery } from '@/store/api/visitorsApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { haptics } from '@/utils/haptics';
import { format, parseISO, isSameDay } from 'date-fns';

type VisitorsListScreenNavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'VisitorsList'
>;
type VisitorsListScreenRouteProp = RouteProp<VisitorsStackParamList, 'VisitorsList'>;

type Props = {
  navigation: VisitorsListScreenNavigationProp;
  route: VisitorsListScreenRouteProp;
};

type TabType = 'tokens' | 'guests';

export default function VisitorsListScreen({ navigation, route }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId || '';
  const [activeTab, setActiveTab] = useState<TabType>('tokens');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const handleFilterPress = () => {
    haptics.medium();
    setFilterModalVisible(true);
  };

  const handleResetFilter = () => {
    setFilterStatus(undefined);
  };


  const { data: visitorsData, isLoading, refetch, isFetching } = useGetVisitorsQuery(
    { residentId, status: filterStatus },
    {
      skip: !residentId,
    }
  );

  const visitors = visitorsData?.visitors || [];
  const stats = visitorsData?.stats;

  const handleRefresh = () => {
    haptics.light();
    refetch();
  };

  const handleCreateVisitor = () => {
    haptics.medium();
    navigation.navigate('CreateVisitor');
  };

  const handleVisitorPress = (visitor: any) => {
    haptics.light();
    navigation.navigate('VisitorQR', { visitor });
  };

  // Group visitors by date for SectionList
  const sections = useMemo(() => {
    if (!visitors || activeTab !== 'tokens') return [];

    // 1. Filter by Search Query
    const searchFiltered = visitors.filter((v: any) => {
      const query = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(query) ||
        v.purpose.toLowerCase().includes(query) ||
        v.status.toLowerCase().includes(query)
      );
    });

    // 2. Filter by Type (Token vs Guest)
    const typeFiltered = searchFiltered.filter((v: any) => v.type !== 'guest');

    const grouped = typeFiltered.reduce((acc: any, visitor: any) => {
      const dateKey = format(parseISO(visitor.visitDate), 'EEEE dd/MM/yyyy');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(visitor);
      return acc;
    }, {});

    return Object.keys(grouped).map((date) => ({
      title: date,
      data: grouped[date],
    }));
  }, [visitors, activeTab, searchQuery]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'un-used':
      case 'unused':
        return { bg: '#FEF9C3', text: '#CA8A04' }; // Yellowish
      case 'in-use':
      case 'in use':
        return { bg: '#DBEAFE', text: '#2563EB' }; // Blueish
      case 'used':
        return { bg: '#DCFCE7', text: '#16A34A' }; // Greenish
      case 'revoked':
        return { bg: '#FEE2E2', text: '#DC2626' }; // Reddish
      case 'expired':
        return { bg: '#F3F4F6', text: '#4B5563' }; // Greyish
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const renderStatsCard = (label: string, value: number) => (
    <View style={styles.statsCard}>
      <Text style={styles.statsLabel}>{label}</Text>
      <Text style={styles.statsValue}>{value}</Text>
    </View>
  );

  const renderVisitorCard = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleVisitorPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.visitorName}>{item.name}</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>{item.email || 'N/A'}</Text>
          </View>
          <View style={[styles.infoColumn, { alignItems: 'flex-end' }]}>
            <Text style={styles.label}>Expected Visit Date</Text>
            <Text style={styles.value}>{format(parseISO(item.visitDate), 'dd/MM/yyyy')}</Text>
          </View>
        </View>

        <View style={[styles.cardRow, { marginTop: 12 }]}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Reason for Visit</Text>
            <Text style={styles.value}>{item.purpose}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'tokens' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('tokens')}
          >
            <Text style={[styles.toggleText, activeTab === 'tokens' && styles.toggleTextActive]}>Tokens</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'guests' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('guests')}
          >
            <Text style={[styles.toggleText, activeTab === 'guests' && styles.toggleTextActive]}>Guests</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={handleCreateVisitor}>
          <Text style={styles.generateBtnText}>Generate Token</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      {activeTab === 'tokens' && stats && (
        <View style={styles.statsContainer}>
          {renderStatsCard('Total Tokens\nGenerated', stats.total)}
          {renderStatsCard('Total Unused\nTokens', stats.unused)}
          {renderStatsCard('Total In Use', stats.inUse)}
        </View>
      )}

      {/* Search & Filter Section */}
      {activeTab === 'tokens' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, filterStatus && styles.filterBtnActive]}
            onPress={handleFilterPress}
          >
            <Ionicons name="filter" size={20} color={filterStatus ? "#fff" : "#6B7280"} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {activeTab === 'tokens' ? (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderVisitorCard}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="documents-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyText}>No tokens found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || filterStatus ? "Try adjusting your filters" : "Generate a token to get started"}
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="bed-outline" size={80} color="#D1D5DB" />
            <Text style={styles.placeholderText}>Guest Management</Text>
            <Text style={styles.placeholderSubtext}>Coming soon...</Text>
          </View>
        )}
      </View>

      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>

            {['All Status', 'Un-Used', 'In-Use', 'Used', 'Revoked', 'Expired'].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalOption}
                onPress={() => {
                  setFilterStatus(status === 'All Status' ? undefined : status);
                  setFilterModalVisible(false);
                  haptics.light();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  ((status === 'All Status' && !filterStatus) || filterStatus === status) && styles.modalOptionTextActive
                ]}>
                  {status}
                </Text>
                {((status === 'All Status' && !filterStatus) || filterStatus === status) && (
                  <Ionicons name="checkmark" size={20} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  toggleBtnActive: {
    backgroundColor: '#111827', // Dark/Black for active
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalOptionTextActive: {
    color: '#2563EB',
  },
  generateBtn: {
    backgroundColor: '#2563EB', // Blue
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoColumn: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6B7280',
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
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
