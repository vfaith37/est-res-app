import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, isValid } from 'date-fns';
import {
  useGetFamilyMembersQuery,
  useDeleteFamilyMemberMutation,
  FamilyMember
} from '@/store/api/householdApi';
import { haptics } from '@/utils/haptics';
import ScreenHeaderWithStats from '@/components/ScreenHeaderWithStats';
import FilterModal from '@/components/FilterModal';

export default function FamilyMembersListScreen() {
  const navigation = useNavigation<any>();
  const { data: members = [], isLoading, refetch, isFetching } = useGetFamilyMembersQuery();
  const [deleteMember] = useDeleteFamilyMemberMutation();
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const totalMembers = members.length;
  const archivedMembers = members.filter(m => m.status === 'inactive').length;

  // Filter State
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleFilterApply = (status: string | null) => {
    setFilterStatus(status);
  };

  const sections = useMemo(() => {
    let filtered = members;

    // 1. Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.includes(q)
      );
    }

    // 2. Status Filter
    if (filterStatus) {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    // Group by Date Added (createdAt)
    const groups: { [key: string]: FamilyMember[] } = {};

    filtered.forEach(member => {
      let dateKey = 'Unknown Date';
      if (member.createdAt) {
        try {
          const date = parseISO(member.createdAt);
          if (isValid(date)) {
            dateKey = format(date, 'EEEE MM/dd/yyyy');
          }
        } catch (e) {
          // keep default
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
  }, [members, searchQuery, filterStatus]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Family Member', `Remove ${name} from your household?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            haptics.medium();
            await deleteMember(id).unwrap();
            haptics.success();
            Alert.alert('Success', 'Family member removed');
          } catch (error: any) {
            haptics.error();
            Alert.alert('Error', error?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleAddMember = () => {
    haptics.medium();
    navigation.navigate('AddFamilyMember');
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderMember = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={() => navigation.navigate('EditFamilyMember', { member: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardRole}>{item.relationship}</Text>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{item.email || 'N/A'}</Text>
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

  // Header Action
  const handleBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScreenHeaderWithStats
        title="Family Members List"
        onBack={handleBack}
        onAdd={handleAddMember}
        addButtonLabel="Add"
        stats={[
          { label: 'Total Family Members', value: totalMembers },
          { label: 'Archived Family\nMembers', value: archivedMembers }
        ]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterVisible(true)}
      />

      <View style={styles.content}>
        {/* List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No family members found</Text>
            </View>
          }
        />
      </View>

      {/* Floating Action Button (Red Alert) */}
      <TouchableOpacity style={styles.fab}>
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
    backgroundColor: '#F9FAFB', // Light gray background
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 80,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  cardRole: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusArchived: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  statusTextArchived: {
    color: '#C62828',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D32F2F', // Red
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
  },
});