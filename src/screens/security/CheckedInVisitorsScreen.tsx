import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetVisitorsQuery, useCheckOutVisitorMutation } from '@/store/api/visitorsApi';
import { haptics } from '@/utils/haptics';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function CheckedInVisitorsScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId || '';

  const { data: visitors, isLoading, refetch, isFetching } = useGetVisitorsQuery({
    residentId,
    status: 'checked-in',
  }, { skip: !residentId });
  const [checkOutVisitor, { isLoading: isCheckingOut }] = useCheckOutVisitorMutation();

  const handleCheckOut = (visitorId: string, name: string) => {
    Alert.alert('Check Out', `Check out ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check Out',
        onPress: async () => {
          try {
            haptics.medium();
            await checkOutVisitor({ tokenId: visitorId }).unwrap();
            haptics.success();
            Alert.alert('Success', `${name} has been checked out`);
          } catch (error: any) {
            haptics.error();
            Alert.alert('Error', error?.data?.message || 'Failed to check out visitor');
          }
        },
      },
    ]);
  };

  const renderVisitor = ({ item }: any) => (
    <View style={styles.visitorCard}>
      <View style={styles.visitorInfo}>
        <View style={styles.visitorHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={item.type === 'guest' ? 'person' : 'people'}
              size={24}
              color="#007AFF"
            />
          </View>
          <View style={styles.visitorDetails}>
            <Text style={styles.visitorName}>{item.name}</Text>
            <Text style={styles.visitorUnit}>Unit: {item.residentName}</Text>
            <Text style={styles.visitorType}>
              {item.type === 'guest' ? 'Guest (Single Day)' : 'Visitor (Multiple Days)'}
            </Text>
          </View>
        </View>

        <View style={styles.visitorMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color="#8E8E93" />
            <Text style={styles.metaText}>
              Checked in: {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>
          {item.vehicleNumber && (
            <View style={styles.metaRow}>
              <Ionicons name="car-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{item.vehicleNumber}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkOutButton}
        onPress={() => handleCheckOut(item.id, item.name)}
        disabled={isCheckingOut}
      >
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Checked-In Visitors</Text>
        <Text style={styles.count}>{visitors?.visitors.length || 0} active</Text>
      </View>

      <FlatList
        data={visitors?.visitors}
        renderItem={renderVisitor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No checked-in visitors</Text>
          </View>
        }
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listContent: {
    padding: 16,
  },
  visitorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  visitorInfo: {
    flex: 1,
  },
  visitorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  visitorDetails: {
    flex: 1,
  },
  visitorName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  visitorUnit: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  visitorType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  visitorMeta: {
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
  checkOutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF3B3020',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
});