import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PaymentsStackParamList } from '@/types/navigation';
import { useGetPaymentQuery, useInitiatePaymentMutation } from '@/store/api/paymentsApi';
import { haptics } from '@/utils/haptics';

type PaymentDetailsScreenNavigationProp = NativeStackNavigationProp<
  PaymentsStackParamList,
  'PaymentDetails'
>;

type PaymentDetailsScreenRouteProp = RouteProp<PaymentsStackParamList, 'PaymentDetails'>;

type Props = {
  navigation: PaymentDetailsScreenNavigationProp;
  route: PaymentDetailsScreenRouteProp;
};

export default function PaymentDetailsScreen({ navigation, route }: Props) {
  const { paymentId } = route.params;
  const { data: payment, isLoading } = useGetPaymentQuery(paymentId);
  const [initiatePayment, { isLoading: isInitiating }] = useInitiatePaymentMutation();

  const handlePayNow = async () => {
    if (!payment) return;

    try {
      haptics.medium();
      const result = await initiatePayment({
        paymentId: payment.id,
        amount: payment.amount,
        paymentMethod: 'card',
      }).unwrap();

      haptics.success();
      Alert.alert('Payment Initiated', 'Redirecting to payment gateway...', [
        { text: 'OK', onPress: () => console.log('Payment URL:', result.paymentUrl) },
      ]);
    } catch (error: any) {
      haptics.error();
      Alert.alert('Error', error?.data?.message || 'Failed to initiate payment');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Payment not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Due</Text>
          <Text style={styles.amount}>₦{payment.amount.toLocaleString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
            <Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{payment.description}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{payment.type.replace('_', ' ')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>
              {new Date(payment.dueDate).toLocaleDateString()}
            </Text>
          </View>

          {payment.paidDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid Date</Text>
              <Text style={styles.detailValue}>
                {new Date(payment.paidDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {payment.transactionId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{payment.transactionId}</Text>
            </View>
          )}

          {payment.paymentMethod && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{payment.paymentMethod}</Text>
            </View>
          )}
        </View>

        {payment.invoiceUrl && (
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="download-outline" size={20} color="#007AFF" />
            <Text style={styles.downloadText}>Download Invoice</Text>
          </TouchableOpacity>
        )}

        {payment.receiptUrl && (
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons name="receipt-outline" size={20} color="#007AFF" />
            <Text style={styles.downloadText}>Download Receipt</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {payment.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, isInitiating && styles.payButtonDisabled]}
            onPress={handlePayNow}
            disabled={isInitiating}
          >
            <Text style={styles.payButtonText}>
              {isInitiating ? 'Processing...' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
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
  scrollContent: {
    padding: 16,
  },
  amountCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  downloadText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#8E8E93',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#FF3B30',
    fontSize: 16,
  },
});