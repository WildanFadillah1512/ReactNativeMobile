import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

// --- 1. IMPOR TIPE BARU UNTUK PROPS ---
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type RootStackParamList, type MainTabParamList } from '../navigation/types';

import { COLORS } from '../config/theme';
// --- End COLORS ---

// Definisi tipe (Biarkan, sudah benar)
type NotificationType = 'order' | 'promo' | 'chat' | 'system' | 'rating';
interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    relatedId?: number | string;
}

// Data Dummy (Biarkan, sudah benar)
const dummyNotifications: NotificationItem[] = [
    { id: '1', type: 'order', title: 'Pesanan #INV123 Dikirim', message: 'Estimasi tiba besok. Lacak pengiriman Anda.', timestamp: Date.now() - 2 * 60 * 60 * 1000, read: false, relatedId: 123 },
    { id: '2', type: 'promo', title: 'Promo Akhir Pekan!', message: 'Diskon hingga 50% untuk kategori Outdoor.', timestamp: Date.now() - 5 * 60 * 60 * 1000, read: false },
    { id: '3', type: 'chat', title: 'Pesan Baru dari SewaKameraPro', message: 'Halo kak, barangnya ready...', timestamp: Date.now() - 25 * 60 * 60 * 1000, read: false, relatedId: 102 }, // Ubah ke number
    { id: '4', type: 'system', title: 'Update Kebijakan Privasi', message: 'Kami telah memperbarui kebijakan privasi kami.', timestamp: Date.now() - 28 * 60 * 60 * 1000, read: true },
    { id: '5', type: 'order', title: 'Pesanan #INV11 Selesai', message: 'Jangan lupa berikan rating untuk penyewa.', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, read: true, relatedId: 11 },
    { id: '6', type: 'rating', title: 'Rating Diterima', message: 'Anda menerima rating 5 bintang dari penyewa Sepeda Gunung.', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, read: true, relatedId: 1 },
];

// Helper Functions (Biarkan, sudah benar)
const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
    switch (type) {
        case 'order': return { name: 'cube', color: COLORS.success };
        case 'promo': return { name: 'tag', color: COLORS.warning };
        case 'chat': return { name: 'comments', color: COLORS.info };
        case 'rating': return { name: 'star', color: COLORS.starActive };
        case 'system': default: return { name: 'cog', color: COLORS.textMuted };
    }
};

const formatRelativeTime = (timestamp: number): string => {
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

interface GroupedNotifications { title: string; data: NotificationItem[]; }

const groupNotificationsByDate = (notifications: NotificationItem[]): GroupedNotifications[] => {
    const groups: { [key: string]: NotificationItem[] } = { 'Hari Ini': [], Kemarin: [], Sebelumnya: [] };
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(todayStart.getDate() - 1);

    notifications.forEach(notif => {
        if (notif.timestamp >= todayStart.getTime()) groups['Hari Ini'].push(notif);
        else if (notif.timestamp >= yesterdayStart.getTime()) groups.Kemarin.push(notif);
        else groups.Sebelumnya.push(notif);
    });

    Object.keys(groups).forEach(key => groups[key].sort((a, b) => b.timestamp - a.timestamp));

    const sections: GroupedNotifications[] = [];
    if (groups['Hari Ini'].length) sections.push({ title: 'Hari Ini', data: groups['Hari Ini'] });
    if (groups.Kemarin.length) sections.push({ title: 'Kemarin', data: groups.Kemarin });
    if (groups.Sebelumnya.length) sections.push({ title: 'Sebelumnya', data: groups.Sebelumnya });
    return sections;
};

// Komponen NotificationCard (Biarkan, sudah benar)
interface NotificationCardProps { item: NotificationItem; onPress: (item: NotificationItem) => void; }
const NotificationCard: React.FC<NotificationCardProps> = React.memo(({ item, onPress }) => {
    const iconInfo = getNotificationIcon(item.type);
    const relativeTime = formatRelativeTime(item.timestamp);

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
            {item.read && <View style={styles.readOverlay} />}
        </TouchableOpacity>
    );
});

const renderSeparator = () => <View style={styles.separator} />;

// --- TIPE PROPS ---
type NotificationScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Notifications'>, // Tipe untuk Tab
  NativeStackScreenProps<RootStackParamList>      // Tipe untuk Stack
>;

export default function NotificationScreen({ navigation }: NotificationScreenProps) {
    const [notifications, setNotifications] = useState<NotificationItem[]>(dummyNotifications);
    const [isLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
            setNotifications(dummyNotifications);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const groupedNotifications = useMemo(() => groupNotificationsByDate(notifications), [notifications]);

    const handleNotificationPress = useCallback((item: NotificationItem) => {
        if (!item.read) {
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
        }
        
        // --- PERBAIKAN: Hapus komentar untuk menggunakan 'navigation' ---
        switch (item.type) {
            case 'order': 
                // Ganti dengan navigasi order Anda
                // navigation.navigate('OrderDetail', { orderId: item.relatedId }); 
                Alert.alert('Navigasi (Order)', `ID: ${item.relatedId}`); 
                break;
            case 'chat': 
                // Pastikan 'relatedId' sesuai dengan tipe 'Chat'
                // Tipe Anda mengharapkan sellerId, sellerName, dll.
                // Anda mungkin perlu mengambil info chat dulu
                // Untuk sekarang, kita navigasi dengan data dummy:
                if (typeof item.relatedId === 'number' || typeof item.relatedId === 'string') {
                     // Asumsi relatedId 102 adalah sellerId
                     navigation.navigate('Chat', { 
                        sellerId: Number(item.relatedId) || 999, 
                        sellerName: item.title.replace('Pesan Baru dari ', '') 
                    });
                } else {
                    Alert.alert('Navigasi (Chat)', `ID: ${item.relatedId}`); 
                }
                break;
            case 'promo': 
                Alert.alert('Navigasi (Promo)', `Membuka promo`); 
                break;
            case 'rating': 
                // Pastikan relatedId adalah number
                if (typeof item.relatedId === 'number') {
                    navigation.navigate('Detail', { productId: item.relatedId });
                } else {
                    Alert.alert('Navigasi (Rating)', `Produk ID: ${item.relatedId}`); 
                }
                break;
            default: break;
        }
    }, [navigation]); // <-- 'navigation' sekarang digunakan, jadi tambahkan ke dependensi

    const handleMarkAllRead = useCallback(() => {
        Alert.alert("Konfirmasi", "Tandai semua notifikasi sebagai sudah dibaca?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Ya", onPress: () => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }
                }
            ]
        );
    }, []);

    const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}> 
            {/* Header */}
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
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <NotificationCard item={item} onPress={handleNotificationPress} />}
                        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={renderSeparator}
                        ListEmptyComponent={!isLoading ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="bell-slash-o" size={60} color={COLORS.textMuted} />
                                <Text style={styles.emptyText}>Belum ada notifikasi baru.</Text>
                            </View>
                        ) : null}
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
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
    unreadCard: { borderLeftWidth: 3, borderLeftColor: COLORS.primary }, 
    loadingIndicator: { marginTop: 30 }, 
    unreadDot: { position: 'absolute', top: 12, left: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.unreadDot, zIndex: 1 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    textContainer: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    titleText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15, flexShrink: 1, marginRight: 8 },
    timeText: { color: COLORS.textMuted, fontSize: 12 },
    messageText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 19 },
    separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 },
    readOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.readOverlay },
    emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 300 },
    emptyText: { color: COLORS.textMuted, fontSize: 16, textAlign: 'center', marginTop: 16, lineHeight: 22 },
});