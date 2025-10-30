// File: src/screens/SavedScreen.tsx (FINAL - Fetch data, Kirim productId)

import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image, // Pastikan Image diimpor
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
// --- PERBAIKAN 1: Hapus import 'RentalItem' ---
// import type { RentalItem } from '../types';
// Import tipe API yang benar
import type { ApiProduct } from '../types'; // (Asumsi sudah ada di ../types)
// --- AKHIR PERBAIKAN 1 ---
import { useLikes } from '../context/LikeContext';

// URL API (Pastikan benar)
const API_URL = 'http://10.95.21.143:3000';

// Tipe ApiSeller & ApiProduct (Sudah Benar, bisa dihapus jika diimpor dari ../types)
// type ApiSeller = { ... };
// type ApiProduct = { ... };

const { width } = Dimensions.get('window');

// Tipe Props Navigasi (Sudah Benar)
type SavedScreenProps = NativeStackScreenProps<RootStackParamList, 'Saved'>;

// Warna (Sudah Benar)
const COLORS = {
    background: '#0f172a',
    card: '#1e293b',
    textPrimary: 'white',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    primary: '#06b6d4', // Warna utama (biru-toska)
    cyan: '#22d3ee',   // Warna alternatif (cyan)
    danger: '#ef4444', // Merah untuk unlike
    border: '#334155',
    starActive: '#facc15', // Kuning bintang
};

// Interface untuk Props SavedItemCard (Sudah Benar)
interface SavedItemCardProps {
    item: ApiProduct; // <-- Terima ApiProduct
    onUnlike: (id: number) => void;
    onPress: (item: ApiProduct) => void; // <-- Terima ApiProduct
}

// Komponen Card Item (Sudah Benar - Tampilkan data ApiProduct)
const SavedItemCard: React.FC<SavedItemCardProps> = ({ item, onUnlike, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
        {/* Gambar dari URL */}
        {item.imageUrl ? (
            <Image
                source={{ uri: `${API_URL}/images/${item.imageUrl}` }}
                style={styles.image}
                resizeMode="cover"
                onError={(e) => console.log('Image Load Error (Saved):', e.nativeEvent.error)}
             />
        ) : (
            <View style={styles.imagePlaceholder}>
                 <Icon name="photo" size={40} color={COLORS.border} />
            </View>
        )}
        {/* Tombol Unlike */}
        <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onUnlike(item.id)}
            onPressOut={(e) => e.stopPropagation()} // Cegah klik card
            activeOpacity={0.7}
        >
            <Icon name="heart" size={18} color={COLORS.danger} />
        </TouchableOpacity>
        {/* Card Body */}
        <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <View style={styles.locationRow}>
                <Icon name="map-marker" size={12} color={COLORS.textMuted} />
                <Text style={styles.locationText}>{item.location || 'Lokasi tidak diketahui'}</Text>
            </View>
            <View style={styles.priceRow}>
                 {/* Harga (format dari angka) */}
                 <Text style={styles.priceText}>
                     <Text style={styles.priceHighlight}>Rp {item.price.toLocaleString('id-ID')}</Text>
                     {item.period || ''}
                 </Text>
                 <View style={styles.ratingBox}>
                     <Icon name="star" size={11} color={COLORS.starActive} />
                     <Text style={styles.ratingText}>{(item.rating ?? 0).toFixed(1)}</Text>
                 </View>
            </View>
        </View>
    </TouchableOpacity>
);


export default function SavedScreen({ navigation }: SavedScreenProps) {
    // Hooks & State (Sudah Benar)
    const { likedIds, toggleLike, isLoading: likesLoading } = useLikes();
    const [allApiProducts, setAllApiProducts] = useState<ApiProduct[]>([]);
    const [isLoadingApi, setIsLoadingApi] = useState(true);

    // Fetch Data (Sudah Benar)
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setIsLoadingApi(true);
                const response = await fetch(`${API_URL}/api/products`);
                if (!response.ok) { throw new Error(`Fetch error (${response.status})`); }
                const data: ApiProduct[] = await response.json();
                setAllApiProducts(data);
            } catch (error) {
                console.error("Gagal fetch semua produk:", error);
                // Alert.alert("Error", "Gagal memuat data produk.");
            } finally {
                setIsLoadingApi(false);
            }
        };
        fetchAllProducts();
    }, []); // Fetch sekali

    // Filter savedItems (Sudah Benar)
    const savedItems = useMemo(
        () => allApiProducts.filter(item => likedIds.includes(item.id)),
        [likedIds, allApiProducts]
    );

    // Unlike Handler (Sudah Benar)
    const handleUnlike = async (id: number) => {
        try {
            await toggleLike(id);
        } catch (error) {
            console.error("Gagal unlike:", error);
            Alert.alert("Gagal", "Tidak dapat menghapus dari simpanan.");
        }
    };

    // --- PERBAIKAN 2: Hapus fungsi 'convertToLegacyItem' ---
    // Fungsi ini tidak lagi diperlukan karena kita mengirim productId ke DetailScreen.
    // const convertToLegacyItem = (item: ApiProduct): RentalItem => { ... };
    // --- AKHIR PERBAIKAN 2 ---

    // --- PERBAIKAN 3: Perbaiki navigasi ke Detail ---
    const handleNavigateToDetail = (item: ApiProduct) => { // 'item' adalah ApiProduct
        // Hapus kode lama yang mengirim 'item':
        // const legacyItem = convertToLegacyItem(item);
        // navigation.navigate('Detail', { item: legacyItem });

        // Kirim 'productId' saja, sesuai dengan RootStackParamList
        navigation.navigate('Detail', { productId: item.id });
    };
    // --- AKHIR PERBAIKAN 3 ---

    // Loading State Gabungan (Sudah Benar)
    const isLoading = likesLoading || isLoadingApi;

    // --- RENDER --- (Sudah Benar)
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header (Sudah Benar) */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                       <Icon name="arrow-left" size={22} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Barang Disimpan</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Konten (Sudah Benar) */}
            {isLoading ? (
                 <ActivityIndicator style={styles.loadingIndicator} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={savedItems} // Data adalah ApiProduct[]
                    renderItem={({ item }) => ( // item adalah ApiProduct
                        <SavedItemCard
                            item={item} // Kirim ApiProduct
                            onUnlike={handleUnlike}
                            onPress={handleNavigateToDetail} // Handler sudah diperbaiki
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={ // Komponen jika daftar kosong
                        <View style={styles.emptyContainer}>
                            <Icon name="heart-o" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>Anda belum menyimpan barang apapun.</Text>
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => navigation.navigate('Home')} // Navigasi ke Home
                            >
                                <Text style={styles.browseButtonText}>Mulai Cari Barang</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
            {/* SafeAreaView untuk bottom tidak diperlukan jika tidak ada Bottom Nav */}
        </SafeAreaView>
    );
}

// Styles (Tidak ada perubahan signifikan, sudah bagus)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border,
    },
    backButton: { padding: 4, width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start'}, // Perbesar area klik
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
    headerSpacer: { width: 40 }, // Sesuaikan agar simetris
    listContent: { padding: 16, flexGrow: 1 }, // flexGrow agar emptyContainer bisa di tengah
    columnWrapper: { justifyContent: 'space-between' },
    card: {
        backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 16,
        width: (width / 2) - 24, // Kalkulasi lebar kolom (padding 16*2, gap antar kolom misal 16)
        overflow: 'hidden',
    },
    imagePlaceholder: {
        width: '100%', height: 130, backgroundColor: COLORS.background, // Tinggi gambar
        justifyContent: 'center', alignItems: 'center',
    },
    image: { width: '100%', height: 130 }, // Style untuk gambar URL
    likeButton: {
        position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', zIndex: 10,
    },
    cardBody: { padding: 10 },
    cardTitle: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 14, marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    locationText: { color: COLORS.textMuted, fontSize: 11, marginLeft: 5, flexShrink: 1 }, // flexShrink jika lokasi panjang
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, },
    priceText: { fontSize: 12, color: COLORS.textMuted, flexShrink: 1, marginRight: 4 }, // flexShrink jika harga+period panjang
    priceHighlight: { color: COLORS.cyan, fontWeight: 'bold', fontSize: 15, marginRight: 3 },
    ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.border, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, },
    ratingText: { color: COLORS.textPrimary, fontSize: 10, marginLeft: 3 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 50 }, // Padding bawah agar tidak terlalu mepet
    emptyText: { color: COLORS.textMuted, fontSize: 16, textAlign: 'center', marginTop: 16, marginBottom: 24, lineHeight: 22, },
    browseButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, },
    browseButtonText: { color: 'white', fontSize: 14, fontWeight: '600', },
    loadingIndicator: {
        flex: 1, // Mengisi ruang saat loading
        justifyContent: 'center',
        alignItems: 'center',
    },
});