import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { useGetPendingPaymentsQuery } from '@/store/api/paymentsApi';
import { useGetVisitorsQuery } from '@/store/api/visitorsApi';
import { useGetMaintenanceRequestsQuery } from '@/store/api/maintenanceApi';
import { useGetNotificationsQuery } from '@/store/api/notificationsApi';
import { haptics } from '@/utils/haptics';

export default function HomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  
  const { data: pendingPayments, refetch: refetchPayments, isFetching: isFetchingPayments } = 
    useGetPendingPaymentsQuery();
  
  const { data: upcomingVisitors, refetch: refetchVisitors, isFetching: isFetchingVisitors } = 
    useGetVisitorsQuery({ status: 'approved', limit: 5 });
  
  const { data: maintenanceRequests, refetch: refetchMaintenance, isFetching: isFetchingMaintenance } = 
    useGetMaintenanceRequestsQuery({ status: 'pending' });
  
  const { data: unreadCount } = useGetNotificationsQuery({ unreadOnly: true });

  const handleRefresh = () => {
    haptics.light();
    refetchPayments();
    refetchVisitors();
    refetchMaintenance();
  };

  const isRefreshing = isFetchingPayments || isFetchingVisitors || isFetchingMaintenance;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}!</Text>
            <Text style={styles.unit}>Unit {user?.unit}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            {unreadCount && unreadCount.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{upcomingVisitors?.length || 0}</Text>
            <Text style={styles.statLabel}>Upcoming Visitors</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="build-outline" size={24} color="#FF9500" />
            <Text style={styles.statNumber}>{maintenanceRequests?.length || 0}</Text>
            <Text style={styles.statLabel}>Pending Issues</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="card-outline" size={24} color="#FF3B30" />
            <Text style={styles.statNumber}>{pendingPayments?.length || 0}</Text>
            <Text style={styles.statLabel}>Due Payments</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <QuickActionCard
              icon="person-add-outline"
              title="New Visitor"
              color="#007AFF"
              onPress={() => {}}
            />
            <QuickActionCard
              icon="build-outline"
              title="Report Issue"
              color="#FF9500"
              onPress={() => {}}
            />
            <QuickActionCard
              icon="card-outline"
              title="Pay Bills"
              color="#34C759"
              onPress={() => {}}
            />
            <QuickActionCard
              icon="calendar-outline"
              title="Book Amenity"
              color="#5856D6"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {upcomingVisitors && upcomingVisitors.length > 0 ? (
            upcomingVisitors.slice(0, 3).map((visitor) => (
              <View key={visitor.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons name="person" size={20} color="#007AFF" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{visitor.name}</Text>
                  <Text style={styles.activitySubtitle}>
                    {new Date(visitor.visitDate).toLocaleDateString()} • {visitor.timeSlot}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionCard({ icon, title, color, onPress }: any) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={() => {
        haptics.light();
        onPress();
      }}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
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
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    padding: 20,
  },
});