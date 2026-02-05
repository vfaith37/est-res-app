import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaintenanceStackParamList } from '@/types/navigation';
import { useGetMaintenanceRequestsQuery } from '@/store/api/maintenanceApi';
import { haptics } from '@/utils/haptics';

type MaintenanceListScreenNavigationProp = NativeStackNavigationProp<
  MaintenanceStackParamList,
  'MaintenanceList'
>;

type Props = {
  navigation: MaintenanceListScreenNavigationProp;
};

export default function MaintenanceListScreen({ navigation }: Props) {
  const { data: requests, isLoading, refetch, isFetching } = useGetMaintenanceRequestsQuery({});

  const handleRefresh = () => {
    haptics.light();
    refetch();
  };

  const handleCreateRequest = () => {
    haptics.medium();
    navigation.navigate('ReportIssue');
  };

  const renderRequest = ({ item }: any) => (
    <View style={styles.requestCard}>
      <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) }]}>
        <Ionicons name={getCategoryIcon(item.category)} size={24} color="#fff" />
      </View>

      <View style={styles.requestContent}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.requestDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
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
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="build-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No maintenance requests</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateRequest}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getCategoryIcon(category: string) {
  const icons: any = {
    plumbing: 'water',
    electrical: 'flash',
    cleaning: 'sparkles',
    carpentry: 'hammer',
    hvac: 'snow',
    other: 'construct',
  };
  return icons[category] || 'construct';
}

function getCategoryColor(category: string) {
  const colors: any = {
    plumbing: '#002EE5',
    electrical: '#FF9500',
    cleaning: '#34C759',
    carpentry: '#8E8E93',
    hvac: '#5856D6',
    other: '#FF3B30',
  };
  return colors[category] || '#8E8E93';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return '#FF9500';
    case 'assigned':
      return '#002EE5';
    case 'in-progress':
      return '#5856D6';
    case 'completed':
      return '#34C759';
    case 'cancelled':
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
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestContent: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
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
    backgroundColor: '#002EE5',
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
    color: '#8E8E93',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#8E8E93',
  },
});
