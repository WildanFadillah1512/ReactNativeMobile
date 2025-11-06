// File: src/screens/SavedScreen.tsx (FINAL - No ESLint Warning + Auto Refresh)

import React, { useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import type { ApiProduct } from '../types';
import { useLikes } from '../context/LikeContext';
import apiClient, { BASE_URL } from '../config/api';
import { COLORS } from '../config/theme';

const { width } = Dimensions.get('window');

type SavedScreenProps = NativeStackScreenProps<RootStackParamList, 'Saved'>;

// --- Komponen Card Produk ---
interface SavedItemCardProps {
    item: ApiProduct;
    onUnlike: (id: number) => void;
    onPress: (item: ApiProduct) => void;
}

const SavedItemCard: React.FC<SavedItemCardProps> = ({ item, onUnlike, onPress }) => (
    <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
    >
        {item.imageUrl ? (
            <Image
                source={{ uri: `${BASE_URL}/images/${item.imageUrl}` }}
                style={styles.image}
                resizeMode="cover"
                onError={(e) =>
                    console.log('Image Load Error (Saved):', e.nativeEvent.error)
                }
            />
        ) : (
            <View style={styles.imagePlaceholder}>
                <Icon name="photo" size={40} color={COLORS.border} />
            </View>
        )}

        <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onUnlike(item.id)}
            onPressOut={(e) => e.stopPropagation()}
            activeOpacity={0.7}
        >
            <Icon name="heart" size={18} color={COLORS.danger} />
        </TouchableOpacity>

        <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
            </Text>

            <View style={styles.locationRow}>
                <Icon name="map-marker" size={12} color={COLORS.textMuted} />
                <Text style={styles.locationText}>
                    {item.location || 'Lokasi tidak diketahui'}
                </Text>
            </View>

            <View style={styles.priceRow}>
                <Text style={styles.priceText}>
                    <Text style={styles.priceHighlight}>
                        Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                    {item.period || ''}
                </Text>
                <View style={styles.ratingBox}>
                    <Icon name="star" size={11} color={COLORS.starActive} />
                    <Text style={styles.ratingText}>
                        {(item.ratingAvg ?? 0).toFixed(1)}
                    </Text>
                    <Text style={styles.reviewCount}>
                        {' '}
                        ({item.reviewsCount ?? 0})
                    </Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

// --- Komponen Utama ---
export default function SavedScreen({ navigation }: SavedScreenProps) {
    const { likedIds, toggleLike, isLoading: likesLoading } = useLikes();
    const [allApiProducts, setAllApiProducts] = useState<ApiProduct[]>([]);
    const [isLoadingApi, setIsLoadingApi] = useState(true);

    // Fetch data produk dari API
    const fetchAllProducts = useCallback(async () => {
        try {
            setIsLoadingApi(true);
            const response = await apiClient.get('/products');
            setAllApiProducts(response.data);
        } catch (error: any) {
            console.error('Gagal fetch semua produk:', error);
            const errorMessage = error.message || 'Gagal memuat data produk.';
            if (error.code === 'ERR_NETWORK') {
                Alert.alert(
                    'Error Koneksi',
                    `Tidak dapat terhubung ke server.\nPastikan server backend (${BASE_URL}) berjalan.`
                );
            } else {
                Alert.alert('Error Memuat Data', errorMessage);
            }
        } finally {
            setIsLoadingApi(false);
        }
    }, []); // ⬅️ Tidak ada dependency (karena tidak pakai variabel luar)

    // Auto refresh saat layar difokuskan
    useFocusEffect(
        useCallback(() => {
            fetchAllProducts();
        }, [fetchAllProducts])
    );

    // Filter produk yang disimpan
    const savedItems = useMemo(
        () => allApiProducts.filter((item) => likedIds.includes(item.id)),
        [likedIds, allApiProducts]
    );

    // Handler untuk unlike
    const handleUnlike = async (id: number) => {
        try {
            await toggleLike(id);
            // Refresh data agar langsung update
            fetchAllProducts();
        } catch (error) {
            console.error('Gagal unlike:', error);
            Alert.alert('Gagal', 'Tidak dapat menghapus dari simpanan.');
        }
    };

    // Navigasi ke detail produk
    const handleNavigateToDetail = (item: ApiProduct) => {
        navigation.navigate('Detail', { productId: item.id });
    };

    const isLoading = likesLoading || isLoadingApi;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={22} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Barang Disimpan</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Konten */}
            {isLoading ? (
                <ActivityIndicator
                    style={styles.loadingIndicator}
                    size="large"
                    color={COLORS.primary}
                />
            ) : (
                <FlatList
                    data={savedItems}
                    renderItem={({ item }) => (
                        <SavedItemCard
                            item={item}
                            onUnlike={handleUnlike}
                            onPress={handleNavigateToDetail}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon
                                name="heart-o"
                                size={60}
                                color={COLORS.textMuted}
                            />
                            <Text style={styles.emptyText}>
                                Anda belum menyimpan barang apapun.
                            </Text>
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() =>
                                    navigation.navigate('Main', {
                                        screen: 'Home',
                                    })
                                }
                            >
                                <Text style={styles.browseButtonText}>
                                    Mulai Cari Barang
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

// --- Style ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    backButton: {
        padding: 4,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    headerSpacer: { width: 40 },
    listContent: { padding: 16, flexGrow: 1 },
    columnWrapper: { justifyContent: 'space-between' },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        marginBottom: 16,
        width: width / 2 - 24,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        width: '100%',
        height: 130,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: { width: '100%', height: 130 },
    likeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    cardBody: { padding: 10 },
    cardTitle: {
        color: COLORS.textPrimary,
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    locationText: {
        color: COLORS.textMuted,
        fontSize: 11,
        marginLeft: 5,
        flexShrink: 1,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    priceText: {
        fontSize: 12,
        color: COLORS.textMuted,
        flexShrink: 1,
        marginRight: 4,
    },
    priceHighlight: {
        color: COLORS.cyan,
        fontWeight: 'bold',
        fontSize: 15,
        marginRight: 3,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    ratingText: { color: COLORS.textPrimary, fontSize: 10, marginLeft: 3 },
    reviewCount: { color: COLORS.textMuted, fontSize: 10 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
        lineHeight: 22,
    },
    browseButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    browseButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
