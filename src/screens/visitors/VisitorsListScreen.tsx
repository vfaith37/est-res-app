import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VisitorsStackParamList } from '@/types/navigation';
import { useGetVisitorsQuery } from '@/store/api/visitorsApi';
import { haptics } from '@/utils/haptics';

type VisitorsListScreenNavigationProp = NativeStackNavigationProp<
  VisitorsStackParamList,
  'VisitorsList'
>;

type Props = {
  navigation: VisitorsListScreenNavigationProp;
};

export default function VisitorsListScreen({ navigation }: Props) {
  const { data: visitors, isLoading, refetch, isFetching } = useGetVisitorsQuery({ limit: 50 });

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

  const renderVisitor = ({ item }: any) => (
    <TouchableOpacity
      style={styles.visitorCard}
      onPress={() => handleVisitorPress(item.id)}
    >
      <View style={styles.visitorIcon}>
        <Ionicons name="person" size={24} color="#007AFF" />
      </View>
      
      <View style={styles.visitorContent}>
        <Text style={styles.visitorName}>{item.name}</Text>
        <Text style={styles.visitorDetails}>
          {new Date(item.visitDate).toLocaleDateString()} • {item.timeSlot}
        </Text>
        <Text style={styles.visitorPurpose}>{item.purpose}</Text>
      </View>
      
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{item.status}</Text>
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
  switch (status) {
    case 'approved':
      return '#34C759';
    case 'pending':
      return '#FF9500';
    case 'checked-in':
      return '#007AFF';
    case 'expired':
      return '#8E8E93';
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
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
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