import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { 
  useGetDomesticStaffQuery, 
  useUpdateStaffStatusMutation,
  useDeleteDomesticStaffMutation 
} from '@/store/api/householdApi';
import { haptics } from '@/utils/haptics';

export default function DomesticStaffListScreen() {
  const navigation = useNavigation<any>();
  const { data: staff, isLoading, refetch, isFetching } = useGetDomesticStaffQuery({});
  const [updateStatus] = useUpdateStaffStatusMutation();
  const [deleteStaff] = useDeleteDomesticStaffMutation();

  const handleToggleStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    Alert.alert(
      `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Staff`,
      `${newStatus === 'active' ? 'Activate' : 'Deactivate'} ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'active' ? 'Activate' : 'Deactivate',
          onPress: async () => {
            try {
              haptics.medium();
              await updateStatus({ id, status: newStatus as 'active' | 'inactive' }).unwrap();
              haptics.success();
            } catch (error: any) {
              haptics.error();
              Alert.alert('Error', error?.data?.message || 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Staff', `Remove ${name} from domestic staff?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            haptics.medium();
            await deleteStaff(id).unwrap();
            haptics.success();
            Alert.alert('Success', 'Staff member removed');
          } catch (error: any) {
            haptics.error();
            Alert.alert('Error', error?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleAddStaff = () => {
    haptics.medium();
    navigation.navigate('AddDomesticStaff');
  };

  const renderStaff = ({ item }: any) => (
    <View style={styles.staffCard}>
      <View style={styles.staffHeader}>
        <View style={[styles.avatar, item.status === 'inactive' && styles.avatarInactive]}>
          <Ionicons 
            name="person" 
            size={24} 
            color={item.status === 'active' ? '#fff' : '#8E8E93'} 
          />
        </View>
        
        <View style={styles.staffInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.staffName, item.status === 'inactive' && styles.inactiveText]}>
              {item.name}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'active' ? '#34C759' : '#8E8E93' }
            ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.staffRole}>{item.role}</Text>
          <Text style={styles.staffContact}>{item.phone}</Text>
        </View>
      </View>

      <View style={styles.staffDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>ID: {item.idNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            Started: {new Date(item.startDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            Emergency: {item.emergencyContact} ({item.emergencyPhone})
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleStatus(item.id, item.status, item.name)}
        >
          <Ionicons 
            name={item.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'} 
            size={20} 
            color="#007AFF" 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            haptics.light();
            // navigation.navigate('EditDomesticStaff', { staffId: item.id });
          }}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={staff}
        renderItem={renderStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No domestic staff added</Text>
            <Text style={styles.emptySubtext}>Add staff members for record keeping</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddStaff}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
  },
  staffCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInactive: {
    backgroundColor: '#E5E5EA',
  },
  staffInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
  },
  inactiveText: {
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  staffRole: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  staffContact: {
    fontSize: 12,
    color: '#8E8E93',
  },
  staffDetails: {
    gap: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#000',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});