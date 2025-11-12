import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  type RootStackParamList,
  type MainTabParamList,
  type RootStackNavigationProp,
} from '../navigation/types';

import { COLORS } from '../config/theme';
import apiClient from '../config/api';
import { useAuth } from '../context/AuthContext';

type NotificationType = 'order' | 'promo' | 'chat' | 'system' | 'rating';

interface ApiNotification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTo: string | null;
}

const getNotificationType = (item: ApiNotification): NotificationType => {
  if (item.linkTo) {
    if (item.linkTo.startsWith('rental:')) return 'order';
    if (item.linkTo.startsWith('chat:')) return 'chat';
    if (item.linkTo.startsWith('product:')) return 'rating';
  }
  if (item.title.toLowerCase().includes('promo')) return 'promo';
  if (item.title.toLowerCase().includes('pesan')) return 'chat';
  if (item.title.toLowerCase().includes('sewa')) return 'order';
  return 'system';
};

const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
  switch (type) {
    case 'order': return { name: 'cube', color: COLORS.success };
    case 'promo': return { name: 'tag', color: COLORS.warning };
    case 'chat': return { name: 'comments', color: COLORS.info };
    case 'rating': return { name: 'star', color: COLORS.starActive };
    default: return { name: 'cog', color: COLORS.textMuted };
  }
};

const formatRelativeTime = (timestampString: string): string => {
  const timestamp = new Date(timestampString).getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  if (diffInSeconds < 60) return 'Baru saja';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(todayStart.getDate() - 1);
  const pastDate = new Date(timestamp);

  if (pastDate >= todayStart) return `${diffInHours}j lalu`;
  if (pastDate >= yesterdayStart) return 'Kemarin';
  return pastDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
};

interface GroupedNotifications { title: string; data: ApiNotification[]; }

const groupNotificationsByDate = (notifications: ApiNotification[]): GroupedNotifications[] => {
  const groups: { [key: string]: ApiNotification[] } = { 'Hari Ini': [], Kemarin: [], Sebelumnya: [] };
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(todayStart.getDate() - 1);

  notifications.forEach(notif => {
    const notifTime = new Date(notif.createdAt).getTime();
    if (notifTime >= todayStart.getTime()) groups['Hari Ini'].push(notif);
    else if (notifTime >= yesterdayStart.getTime()) groups.Kemarin.push(notif);
    else groups.Sebelumnya.push(notif);
  });

  Object.keys(groups).forEach(key =>
    groups[key].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  const sections: GroupedNotifications[] = [];
  if (groups['Hari Ini'].length) sections.push({ title: 'Hari Ini', data: groups['Hari Ini'] });
  if (groups.Kemarin.length) sections.push({ title: 'Kemarin', data: groups.Kemarin });
  if (groups.Sebelumnya.length) sections.push({ title: 'Sebelumnya', data: groups.Sebelumnya });
  return sections;
};

interface NotificationCardProps { item: ApiNotification; onPress: (item: ApiNotification) => void; }
const NotificationCard: React.FC<NotificationCardProps> = React.memo(({ item, onPress }) => {
  const type = getNotificationType(item);
  const iconInfo = getNotificationIcon(type);
  const relativeTime = formatRelativeTime(item.createdAt);

  return (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {!item.read && <View style={styles.unreadDot} />}
      <View style={[styles.iconContainer, { backgroundColor: `${iconInfo.color}30` }]}>
        <Icon name={iconInfo.name} size={20} color={iconInfo.color} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.timeText}>{relativeTime}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );
});

const renderSeparator = () => <View style={styles.separator} />;

type NotificationScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Notifications'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function NotificationScreen({}: NotificationScreenProps) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!isLoggedIn) {
      setIsLoading(false);
      setNotifications([]);
      return;
    }

    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Gagal mengambil notifikasi:', error);
      Alert.alert('Error', 'Gagal memuat notifikasi.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const onRefresh = () => fetchNotifications(true);
  const groupedNotifications = useMemo(() => groupNotificationsByDate(notifications), [notifications]);

  // ✅ Saat notifikasi ditekan → update ke backend & simpan ke state
  const handleNotificationPress = useCallback(async (item: ApiNotification) => {
    try {
      await apiClient.put(`/notifications/${item.id}/read`); // ✅ tandai di backend
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n)); // ✅ update lokal
    } catch (error) {
      console.warn('Gagal update status read:', error);
    }

    const type = getNotificationType(item);
    const linkId = item.linkTo ? item.linkTo.split(':')[1] : null;

    switch (type) {
      case 'order':
        if (linkId) navigation.navigate('RentalHistory');
        break;
      case 'chat':
        if (linkId) {
          navigation.navigate('Chat', {
            sellerId: Number(linkId),
            sellerName: item.title.replace('Pesan Baru dari ', ''),
          });
        }
        break;
      case 'rating':
        if (linkId) navigation.navigate('Detail', { productId: Number(linkId) });
        break;
      case 'promo':
        Alert.alert('Promo', item.message);
        break;
      default: break;
    }
  }, [navigation]);

  // ✅ Tombol "Baca Semua"
  const handleMarkAllRead = useCallback(async () => {
    Alert.alert('Konfirmasi', 'Tandai semua notifikasi sebagai sudah dibaca?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya',
        onPress: async () => {
          try {
            await apiClient.put('/notifications/mark-all-read'); // ✅ tandai semua di backend
            setNotifications(prev => prev.map(n => ({ ...n, read: true }))); // ✅ update lokal
          } catch (error) {
            console.warn('Gagal tandai semua:', error);
          }
        },
      },
    ]);
  }, []);

  const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerButtonPlaceholder} />
          <Text style={styles.headerTitle}>Notifikasi</Text>
          <View style={styles.headerButtonPlaceholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="sign-in" size={60} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Silakan login untuk melihat notifikasi Anda.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerButtonPlaceholder} />
        <Text style={styles.headerTitle}>Notifikasi</Text>
        {hasUnread ? (
          <TouchableOpacity style={styles.markAllReadButton} onPress={handleMarkAllRead}>
            <Text style={styles.markAllReadText}>Baca Semua</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButtonPlaceholder} />
        )}
      </View>

      <View style={styles.listContainerWrapper}>
        {isLoading && notifications.length === 0 ? (
          <ActivityIndicator style={styles.loadingIndicator} size="large" color={COLORS.primary} />
        ) : (
          <SectionList
            sections={groupedNotifications}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <NotificationCard item={item} onPress={handleNotificationPress} />}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Icon name="bell-slash-o" size={60} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>Belum ada notifikasi baru.</Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  headerButtonPlaceholder: { width: 80, alignItems: 'flex-start' },
  markAllReadButton: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, width: 80, alignItems: 'flex-end' },
  markAllReadText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
  listContainerWrapper: { flex: 1 },
  listContent: { flexGrow: 1, paddingBottom: 20 },
  sectionHeader: {
    paddingTop: 16, paddingBottom: 8, paddingHorizontal: 16,
    fontSize: 14, fontWeight: '600', color: COLORS.textMuted,
    backgroundColor: COLORS.background, textTransform: 'uppercase',
  },
  notificationCard: {
    flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: COLORS.card, alignItems: 'center', position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#3a2d3e',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 15,
    flexShrink: 1,
    marginRight: 8,
  },
  timeText: { color: COLORS.textMuted, fontSize: 12 },
  messageText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 19 },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 16, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  loadingIndicator: { marginTop: 30 },
});
