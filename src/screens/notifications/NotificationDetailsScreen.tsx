import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/store/api/notificationsApi';
import { haptics } from '@/utils/haptics';

interface NotificationDetailsScreenProps {
  route: {
    params: {
      notification: Notification;
    };
  };
  navigation: any;
}

export default function NotificationDetailsScreen({
  route,
  navigation,
}: NotificationDetailsScreenProps) {
  const { notification } = route.params;

  const handleOpenAttachment = async () => {
    if (!notification.attachment) return;

    try {
      haptics.light();
      const supported = await Linking.canOpenURL(notification.attachment);
      if (supported) {
        await Linking.openURL(notification.attachment);
      } else {
        Alert.alert('Error', 'Cannot open this attachment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open attachment');
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
        return '#002EE5';
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

  const typeColor = getTypeColor(notification.type);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Icon */}
        <View style={styles.headerIconContainer}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: `${typeColor}15` },
            ]}
          >
            <Ionicons
              name={getTypeIcon(notification.type)}
              size={48}
              color={typeColor}
            />
          </View>
        </View>

        {/* Type Badge */}
        <View style={styles.typeBadgeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeBadgeText}>
              {notification.type.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{notification.title}</Text>

        {/* Date Sent */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date Sent</Text>
            <Text style={styles.infoValue}>
              {new Date(notification.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Attachment */}
        {notification.attachment && (
          <View style={styles.attachmentSection}>
            <View style={styles.attachmentHeader}>
              <Ionicons name="attach" size={20} color="#8E8E93" />
              <Text style={styles.attachmentLabel}>Attachment</Text>
            </View>
            <TouchableOpacity
              style={styles.attachmentCard}
              onPress={handleOpenAttachment}
            >
              <View style={styles.attachmentIconContainer}>
                <Ionicons name="document-attach" size={32} color="#002EE5" />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName}>View Attachment</Text>
                <Text style={styles.attachmentAction}>Tap to open</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        )}

        {/* Message */}
        <View style={styles.messageSection}>
          <Text style={styles.messageLabel}>Message</Text>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{notification.message}</Text>
          </View>
        </View>

        {/* Additional Data (if any) */}
        {notification.data && Object.keys(notification.data).length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.dataLabel}>Additional Information</Text>
            <View style={styles.dataCard}>
              {Object.entries(notification.data).map(([key, value]) => (
                <View key={key} style={styles.dataRow}>
                  <Text style={styles.dataKey}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                  </Text>
                  <Text style={styles.dataValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  attachmentSection: {
    marginBottom: 24,
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attachmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  attachmentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#002EE515',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  attachmentAction: {
    fontSize: 14,
    color: '#002EE5',
  },
  messageSection: {
    marginBottom: 24,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  dataSection: {
    marginBottom: 24,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  dataRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dataKey: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});

