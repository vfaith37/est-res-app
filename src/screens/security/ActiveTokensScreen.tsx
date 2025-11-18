import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Visitor } from '@/store/api/visitorsApi';
import ValidatedVisitorBottomSheet from '@/components/ValidatedVisitorBottomSheet';
import { haptics } from '@/utils/haptics';

// TODO: Create API endpoint to get all active tokens for security
// For now, using placeholder implementation
export default function ActiveTokensScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // TODO: Replace with actual API call
  // const { data: activeTokens, isLoading, refetch } = useGetActiveTokensQuery();
  const activeTokens: Visitor[] = []; // Placeholder
  const isLoading = false;

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: Implement actual refetch
    // refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleVisitorPress = (visitor: Visitor) => {
    haptics.light();
    setSelectedVisitor(visitor);
    setShowBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setSelectedVisitor(null);
  };

  const handleSuccess = () => {
    Alert.alert('Success', 'Visitor checked out successfully', [
      {
        text: 'OK',
        onPress: () => {
          handleCloseBottomSheet();
          handleRefresh();
        },
      },
    ]);
  };

  const renderVisitorCard = ({ item }: { item: Visitor }) => {
    // Calculate check-in time (for now using createdAt as placeholder)
    // TODO: Use actual check-in timestamp from backend
    const checkInTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleVisitorPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color="#007AFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.visitorName}>{item.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color="#8E8E93" />
              <Text style={styles.phoneNumber}>{item.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#8E8E93" />
              <Text style={styles.checkInTime}>Checked in at {checkInTime}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={80} color="#C7C7CC" />
      </View>
      <Text style={styles.emptyTitle}>No Active Visitors</Text>
      <Text style={styles.emptySubtitle}>
        There are currently no checked-in visitors
      </Text>
      <Text style={styles.emptyHint}>
        Use the Home tab to scan QR codes or enter tokens manually
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Active Tokens</Text>
        <Text style={styles.headerSubtitle}>
          {activeTokens.length} visitor{activeTokens.length !== 1 ? 's' : ''} currently checked in
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      <FlatList
        data={activeTokens}
        renderItem={renderVisitorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          activeTokens.length === 0 && styles.listContentCentered,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
      />

      {/* Visitor Details Bottom Sheet */}
      <ValidatedVisitorBottomSheet
        visible={showBottomSheet}
        visitor={selectedVisitor}
        onClose={handleCloseBottomSheet}
        onSuccess={handleSuccess}
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
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  listContentCentered: {
    flex: 1,
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkInTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
