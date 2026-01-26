import { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedTextInput as TextInput } from "@/components/ThemedTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  Notification,
} from '@/store/api/notificationsApi';
import { haptics } from '@/utils/haptics';

type FilterStatus = 'all' | 'new' | 'opened';
type FilterDate = 'all' | 'today' | 'week' | 'month';

interface NotificationSection {
  title: string;
  data: Notification[];
}

export default function EnhancedNotificationsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [dateFilter, setDateFilter] = useState<FilterDate>('all');

  const { data: notifications, isLoading, refetch } = useGetNotificationsQuery({});
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const filteredNotifications = useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return [];

    let filtered = notifications.map(notif => ({
      ...notif,
      status: (notif.read ? 'opened' : 'new') as 'new' | 'opened',
    }));

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((n) => n.status === statusFilter);
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    if (dateFilter === 'today') {
      filtered = filtered.filter((n) => new Date(n.createdAt) >= today);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter((n) => new Date(n.createdAt) >= weekAgo);
    } else if (dateFilter === 'month') {
      filtered = filtered.filter((n) => new Date(n.createdAt) >= monthAgo);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, statusFilter, dateFilter, searchQuery]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};

    filteredNotifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const dateKey = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    // Convert to sections array and sort by date (most recent first)
    return Object.entries(groups)
      .map(([title, data]) => ({
        title,
        data: data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data[0].createdAt);
        const dateB = new Date(b.data[0].createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [filteredNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    haptics.light();

    // Mark as read if it's new
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate to details
    navigation.navigate('NotificationDetails', { notification });
  };

  const handleMarkAllAsRead = async () => {
    try {
      haptics.light();
      await markAllAsRead().unwrap();
      haptics.success();
    } catch (error) {
      haptics.error();
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'announcement':
        return 'megaphone';
      case 'visitor':
        return 'people';
      case 'maintenance':
        return 'build';
      case 'payment':
        return 'card';
      case 'emergency':
        return 'alert-circle';
      case 'amenity':
        return 'fitness';
      default:
        return 'notifications';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'announcement':
        return '#007AFF';
      case 'visitor':
        return '#5856D6';
      case 'maintenance':
        return '#FF9500';
      case 'payment':
        return '#34C759';
      case 'emergency':
        return '#FF3B30';
      case 'amenity':
        return '#AF52DE';
      default:
        return '#8E8E93';
    }
  };

  const renderNotificationCard = ({ item }: { item: Notification }) => {
    const typeColor = getTypeColor(item.type);
    const isNew = item.status === 'new';

    return (
      <TouchableOpacity
        style={[styles.card, isNew && styles.cardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: `${typeColor}15` }]}>
            <Ionicons name={getTypeIcon(item.type)} size={20} color={typeColor} />
          </View>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>
              {new Date(item.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {isNew && <View style={styles.newBadge} />}
        </View>

        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>

        {item.attachment && (
          <View style={styles.attachmentIndicator}>
            <Ionicons name="attach" size={14} color="#8E8E93" />
            <Text style={styles.attachmentText}>Attachment</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: NotificationSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionHeaderCount}>
        {section.data.length} {section.data.length === 1 ? 'notification' : 'notifications'}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
          ? 'Try adjusting your filters'
          : "You're all caught up!"}
      </Text>
    </View>
  );

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllButtonText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                setSearchQuery('');
              }}
            >
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            (statusFilter !== 'all' || dateFilter !== 'all') && styles.filterButtonActive,
          ]}
          onPress={() => {
            haptics.light();
            setShowFilterModal(true);
          }}
        >
          <Ionicons
            name="filter"
            size={20}
            color={statusFilter !== 'all' || dateFilter !== 'all' ? '#fff' : '#007AFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <SectionList
        sections={groupedNotifications}
        renderItem={renderNotificationCard}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          groupedNotifications.length === 0 && styles.listContentCentered,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#007AFF"
          />
        }
        stickySectionHeadersEnabled
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              haptics.light();
              setShowFilterModal(false);
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Notifications</Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowFilterModal(false);
                }}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Status Filter */}
              <Text style={styles.filterSectionTitle}>By Status</Text>
              <View style={styles.filterOptionsContainer}>
                {(['all', 'new', 'opened'] as FilterStatus[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      haptics.light();
                      setStatusFilter(status);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        statusFilter === status && styles.filterOptionTextActive,
                      ]}
                    >
                      {status === 'all' ? 'All' : status === 'new' ? 'New' : 'Opened'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Filter */}
              <Text style={[styles.filterSectionTitle, styles.filterSectionSpacing]}>
                By Date
              </Text>
              <View style={styles.filterOptionsContainer}>
                {(['all', 'today', 'week', 'month'] as FilterDate[]).map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.filterOption,
                      dateFilter === date && styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      haptics.light();
                      setDateFilter(date);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        dateFilter === date && styles.filterOptionTextActive,
                      ]}
                    >
                      {date === 'all'
                        ? 'All Time'
                        : date === 'today'
                          ? 'Today'
                          : date === 'week'
                            ? 'This Week'
                            : 'This Month'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Clear Filters Button */}
            {(statusFilter !== 'all' || dateFilter !== 'all') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  haptics.light();
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                <Text style={styles.clearFiltersButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
    color: '#007AFF',
    marginTop: 4,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentCentered: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  sectionHeaderCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  newBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  attachmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  attachmentText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScroll: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterSectionSpacing: {
    marginTop: 24,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  clearFiltersButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
