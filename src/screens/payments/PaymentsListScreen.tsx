import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, isValid } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useGetPaymentsQuery, Payment } from '@/store/api/paymentsApi';
import ScreenHeaderWithStats, { StatItem } from '@/components/ScreenHeaderWithStats';
import FilterModal from '@/components/FilterModal';
import { haptics } from '@/utils/haptics';

export default function PaymentsListScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { data: payments = [], isLoading, refetch, isFetching } = useGetPaymentsQuery({});

  const handleBack = () => navigation.goBack();
  const handlePayDue = () => {
    haptics.light();
    // Navigate to payment flow
  };

  const sections = useMemo(() => {
    let filtered = Array.isArray(payments) ? [...payments] : [];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(q) ||
        (p.invoiceId && p.invoiceId.includes(q))
      );
    }

    // Filter
    if (filter !== 'all') {
      filtered = filtered.filter(p => {
        if (filter === 'pending') return p.status === 'pending'; // 'pending' covers pending payment/review
        if (filter === 'paid') return p.status === 'paid';
        if (filter === 'overdue') return p.status === 'overdue' || p.status === 'cancelled'; // mapping cancelled to overdue or similar if needed
        return true;
      });
    }

    const groups: { [key: string]: Payment[] } = {};

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
  }, [payments, searchQuery, filter]);


  const stats: StatItem[] = [
    { label: 'Total Amount Paid', value: 'â‚¦500,000' },
    { label: 'Current Monthly Paid', value: 'â‚¦8,000' },
    { label: 'Total Paid', value: '20' },
  ];

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'paid': return { bg: '#DCFCE7', text: '#16A34A', label: 'Paid' };
      case 'pending': return { bg: '#FEF9C3', text: '#CA8A04', label: 'Pending Payment' };
      case 'overdue': return { bg: '#FEE2E2', text: '#DC2626', label: 'Denied' }; // Using Denied color for overdue/cancelled as per design red badge
      case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626', label: 'Denied' };
      default: return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  const renderPayment = ({ item }: { item: Payment }) => {
    const statusStyle = getStatusBadgeStyle(item.status);
    const dateAdded = item.createdAt ? format(parseISO(item.createdAt), 'MM/dd/yyyy') : 'N/A';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          haptics.light();
          navigation.navigate('PaymentDetails', { paymentId: item.id });
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.description}</Text>
          <Text style={styles.amount}>â‚¦{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.cardRow}>
          <View>
            <Text style={styles.label}>Due ID</Text>
            <Text style={styles.value}>{item.dueId || item.id}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>Date Added</Text>
            <Text style={styles.value}>{dateAdded}</Text>
          </View>
        </View>

        <View style={[styles.cardRow, { marginTop: 12 }]}>
          <View>
            <Text style={styles.label}>Invoice ID</Text>
            <Text style={styles.value}>{item.invoiceId || 'N/A'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScreenHeaderWithStats
        title="Dues & Payments"
        // onBack removed as this is a main tab screen
        onAdd={handlePayDue}
        addButtonLabel="Pay Due"
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterVisible(true)}
        buttonStyle={{ backgroundColor: '#0044C0' }} // Blue button
      />

      <View style={styles.content}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderPayment}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payments found</Text>
            </View>
          }
        />
      </View>

      {/* Mock FAB for "Outstanding/Urgent" if needed, just matching image red circle */}
      <TouchableOpacity style={styles.fab} onPress={() => haptics.light()}>
        <Ionicons name="alert-circle-outline" size={32} color="#fff" />
      </TouchableOpacity>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={(status) => {
          if (status) setFilter(status as any);
        }}
        onReset={() => setFilter('all')}
        currentStatus={filter === 'all' ? null : filter}
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
    paddingBottom: 80, // for FAB
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    color: '#6B7280', // Gray-500
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Gray-200
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626', // Red-600
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
