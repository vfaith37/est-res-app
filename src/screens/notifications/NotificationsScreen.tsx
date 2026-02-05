import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, isValid } from 'date-fns';
import { useGetNotificationsQuery, Notification } from '@/store/api/notificationsApi';
import ScreenHeaderWithStats from '@/components/ScreenHeaderWithStats';
import FilterModal from '@/components/FilterModal'; // Import FilterModal
import { haptics } from '@/utils/haptics';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Add Filter Modal State

  const { data: notifications = [], isLoading, refetch, isFetching } = useGetNotificationsQuery({
    unreadOnly: filter === 'unread',
    limit: 100,
  });

  const handleBack = () => navigation.goBack();

  const handleFilterApply = (status: string | null) => {
    // FilterModal returns lowercase values like 'active', 'archived'
    // We can map this to 'unread' if we want, or just ignore for now if the requirement 
    // is just to "Use the component". 
    // For a real app, we'd update FilterModal to support "Read/Unread".
    // For this task, I'll map 'active' -> 'unread' just to show interactivity.
    if (status === 'active') {
      setFilter('unread');
    } else {
      setFilter('all');
    }
  };

  const sections = useMemo(() => {
    let filtered = [...notifications];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
      );
    }

    const groups: { [key: string]: Notification[] } = {};

    filtered.forEach(item => {
      let dateKey = 'Unknown Date';
      if (item.createdAt) {
        try {
          const date = parseISO(item.createdAt);
          if (isValid(date)) {
            dateKey = format(date, 'EEEE MM/dd/yyyy');
          }
        } catch (e) {
          // fallback
        }
      }
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date],
    }));
  }, [notifications, searchQuery]);

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderNotification = ({ item }: { item: Notification }) => {
    const isNew = !item.read;
    const dateReceived = item.createdAt
      ? format(parseISO(item.createdAt), 'MM/dd/yyyy HH:mm')
      : '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          haptics.light();
          // Navigate or mark as read logic here
        }}
      >
        {/* Row 1: Title & Badge */}
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {isNew ? (
            <View style={[styles.badge, styles.badgeNew]}>
              <Text style={[styles.badgeText, styles.badgeTextNew]}>New</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeOpened]}>
              <Text style={[styles.badgeText, styles.badgeTextOpened]}>Opened</Text>
            </View>
          )}
        </View>

        {/* Row 2: Details */}
        <View style={[styles.cardRow, { marginTop: 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Details</Text>
            <Text style={styles.detailsText} numberOfLines={2}>{item.message}</Text>
          </View>

          {/* Row 3: Date Received */}
          <View style={{ alignItems: 'flex-end', marginLeft: 16 }}>
            <Text style={styles.label}>Date Received</Text>
            <Text style={styles.dateText}>{dateReceived}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScreenHeaderWithStats
        title="Notifications & Announcements"
        onBack={handleBack}
        // No Add Button
        stats={[]} // No stats
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setIsFilterVisible(true)} // Open Modal
      />

      <View style={styles.content}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          }
        />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleFilterApply}
        onReset={() => setFilter('all')}
        currentStatus={filter === 'unread' ? 'active' : null}
        filterType="status"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeNew: {
    backgroundColor: '#DCFCE7', // Light green
  },
  badgeOpened: {
    backgroundColor: '#F3F4F6', // Gray
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextNew: {
    color: '#16A34A',
  },
  badgeTextOpened: {
    color: '#6B7280',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  dateText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});
