import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PaymentsStackParamList } from '@/types/navigation';
import { useGetPaymentsQuery, useGetPaymentSummaryQuery } from '@/store/api/paymentsApi';
import { haptics } from '@/utils/haptics';

type PaymentsListScreenNavigationProp = NativeStackNavigationProp<
  PaymentsStackParamList,
  'PaymentsList'
>;

type Props = {
  navigation: PaymentsListScreenNavigationProp;
};

export default function PaymentsListScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const { data: payments, isLoading, refetch, isFetching } = useGetPaymentsQuery({});
  const { data: summary } = useGetPaymentSummaryQuery();

  const handleRefresh = () => {
    haptics.light();
    refetch();
  };

  const handlePaymentPress = (paymentId: string) => {
    haptics.light();
    navigation.navigate('PaymentDetails', { paymentId });
  };

  const filteredPayments = Array.isArray(payments)
    ? payments.filter((payment) => {
        if (filter === 'all') return true;
        return payment.status === filter;
      })
    : [];

  const renderPayment = ({ item }: any) => (
    <TouchableOpacity style={styles.paymentCard} onPress={() => handlePaymentPress(item.id)}>
      <View style={[styles.paymentIcon, { backgroundColor: getTypeColor(item.type) }]}>
        <Ionicons name={getTypeIcon(item.type)} size={24} color="#fff" />
      </View>

      <View style={styles.paymentContent}>
        <Text style={styles.paymentTitle}>{item.description}</Text>
        <Text style={styles.paymentType}>{item.type.replace('_', ' ')}</Text>
        <Text style={styles.paymentDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>

      <View style={styles.paymentRight}>
        <Text style={styles.paymentAmount}>₦{item.amount.toLocaleString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Summary Cards */}
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Due</Text>
            <Text style={styles.summaryAmount}>₦{summary.pending.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryAmount, { color: '#34C759' }]}>
              ₦{summary.paid.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={[styles.summaryAmount, { color: '#FF3B30' }]}>
              ₦{summary.overdue.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'paid', 'overdue'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => {
              haptics.light();
              setFilter(f);
            }}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function getTypeIcon(type: string) {
  const icons: any = {
    service_charge: 'home',
    utility: 'flash',
    amenity: 'fitness',
    fine: 'warning',
    other: 'card',
  };
  return icons[type] || 'card';
}

function getTypeColor(type: string) {
  const colors: any = {
    service_charge: '#007AFF',
    utility: '#FF9500',
    amenity: '#34C759',
    fine: '#FF3B30',
    other: '#8E8E93',
  };
  return colors[type] || '#8E8E93';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return '#34C759';
    case 'pending':
      return '#FF9500';
    case 'overdue':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentType: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  paymentDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
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
    color: '#8E8E93',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#8E8E93',
  },
});