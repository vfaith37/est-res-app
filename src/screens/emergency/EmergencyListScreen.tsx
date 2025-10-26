import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetEmergenciesQuery } from '@/store/api/emergencyApi';
import { haptics } from '@/utils/haptics';

export default function EmergencyListScreen({ navigation }: any) {
  const { data: emergencies, isLoading, refetch, isFetching } = useGetEmergenciesQuery({});

  const getTypeIcon = (type: string) => {
    const icons: any = {
      fire: 'flame',
      medical: 'medical',
      security: 'shield',
      other: 'alert-circle',
    };
    return icons[type] || 'alert-circle';
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      fire: '#FF3B30',
      medical: '#FF9500',
      security: '#007AFF',
      other: '#8E8E93',
    };
    return colors[type] || '#8E8E93';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#FF3B30';
      case 'responded':
        return '#FF9500';
      case 'resolved':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const renderEmergency = ({ item }: any) => (
    <TouchableOpacity
      style={styles.emergencyCard}
      onPress={() => {
        haptics.light();
        // navigation.navigate('EmergencyDetails', { emergencyId: item.id });
      }}
    >
      <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
        <Ionicons name={getTypeIcon(item.type)} size={28} color={getTypeColor(item.type)} />
      </View>

      <View style={styles.emergencyContent}>
        <View style={styles.emergencyHeader}>
          <Text style={styles.emergencyTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.emergencyDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.emergencyMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>
              Reported by: {item.reportedByName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Reports</Text>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => {
            haptics.heavy();
            navigation.navigate('ReportEmergency');
          }}
        >
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.reportButtonText}>Report Emergency</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={emergencies}
        renderItem={renderEmergency}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#34C759" />
            <Text style={styles.emptyText}>No emergency reports</Text>
            <Text style={styles.emptySubtext}>Your estate is safe</Text>
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
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 10,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  emergencyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
    lineHeight: 20,
  },
  emergencyMeta: {
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
    color: '#34C759',
    marginTop: 8,
  },
});