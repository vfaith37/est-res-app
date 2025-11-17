import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VisitorsStackParamList } from '@/types/navigation';
import { useGetVisitorsQuery } from '@/store/api/visitorsApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { haptics } from '@/utils/haptics';

type VisitorsListScreenNavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'VisitorsList'
>;

type Props = {
  navigation: VisitorsListScreenNavigationProp;
};

export default function VisitorsListScreen({ navigation }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId || '';

  const { data: visitors, isLoading, refetch, isFetching } = useGetVisitorsQuery(residentId, {
    skip: !residentId, // Skip the query if residentId is not available
  });

  const handleRefresh = () => {
    haptics.light();
    refetch();
  };

  const handleCreateVisitor = () => {
    haptics.medium();
    navigation.navigate('CreateVisitor');
  };

  const handleVisitorPress = (visitorId: string) => {
    haptics.light();
    navigation.navigate('VisitorQR', { visitorId });
  };

  const renderVisitor = ({ item }: any) => {
    const isGuest = item.type === 'guest';
    const iconName = isGuest ? 'bed' : 'person';
    const iconColor = isGuest ? '#FF9500' : '#007AFF';
    const iconBgColor = isGuest ? '#FF950020' : '#007AFF20';

    // Calculate duration for guests (can be negative if departure before arrival)
    const durationDays = isGuest && item.departureDate
      ? Math.ceil(
          (new Date(item.departureDate).getTime() - new Date(item.visitDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    const duration = durationDays !== null && durationDays !== 0
      ? durationDays > 0
        ? `${durationDays} ${durationDays === 1 ? 'night' : 'nights'}`
        : null // Don't show duration if departure is before arrival
      : null;

    return (
      <TouchableOpacity
        style={styles.visitorCard}
        onPress={() => handleVisitorPress(item.id)}
      >
        <View style={[styles.visitorIcon, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.visitorContent}>
          <View style={styles.visitorNameRow}>
            <Text style={styles.visitorName}>{item.name}</Text>
            <Text style={styles.visitorType}>
              {isGuest ? '🛏️ Guest' : '👤 Visitor'}
            </Text>
          </View>
          <Text style={styles.visitorDetails}>
            {new Date(item.visitDate).toLocaleDateString()}
            {isGuest && item.departureDate && (
              <> → {new Date(item.departureDate).toLocaleDateString()}{duration && <> ({duration})</>}</>
            )}
          </Text>
          {item.visitorNum > 0 && (
            <Text style={styles.visitorDetails}>
              {item.visitorNum} {item.visitorNum === 1 ? 'person' : 'people'}
            </Text>
          )}
          <Text style={styles.visitorPurpose}>{item.purpose}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={visitors}
        renderItem={renderVisitor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No visitors yet</Text>
            <Text style={styles.emptySubtext}>Create your first visitor pass</Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.fab} onPress={handleCreateVisitor}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return '#34C759';
    case 'revoked':
      return '#FF3B30';
    case 'expired':
      return '#8E8E93';
    // Legacy status values
    case 'approved':
      return '#34C759';
    case 'pending':
      return '#FF9500';
    case 'checked-in':
      return '#007AFF';
    default:
      return '#8E8E93';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
  },
  visitorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  visitorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  visitorContent: {
    flex: 1,
  },
  visitorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  visitorType: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  visitorDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  visitorPurpose: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#8E8E93',
  },
});