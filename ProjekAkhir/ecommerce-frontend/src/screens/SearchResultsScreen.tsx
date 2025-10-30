// File: src/screens/SearchResultsScreen.tsx (FIXED)

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Image,
    FlatList,
    Modal, Pressable, TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

import { useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
// --- PERBAIKAN: Hapus import 'RentalItem' dan 'Seller' karena tidak lagi digunakan ---
// import type { RentalItem, Seller } from '../types';
// --- AKHIR PERBAIKAN ---

// =======================================================
// TENTUKAN URL API ANDA
const API_URL = 'http://10.95.21.143:3000';
// =======================================================

// --- Tipe Data dari API ---
// (Idealnya, tipe ini ada di src/types.ts dan diimpor)
type ApiSeller = {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  rating: number | null;
  itemsRented: number | null;
};

type ApiProduct = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  category: string | null;
  rating: number | null;
  reviews: number | null;
  trending: boolean;
  location: string | null;
  period: string | null;
  seller: ApiSeller;
};
// --- End Tipe Baru ---

// --- Define COLORS ---
const COLORS = {
    background: '#0f172a',
    card: '#1e293b',
    textPrimary: 'white',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    primary: '#06b6d4',
    border: '#334155',
    starActive: '#facc15',
    backdrop: 'rgba(0, 0, 0, 0.6)',
};
// --- End COLORS ---

// --- Fungsi Helper (Tidak Berubah) ---
const formatPrice = (price: number): string => {
    if (isNaN(price)) return '0';
    return price.toLocaleString('id-ID');
};
const getCategoryInfo = (cat: string | null) => {
    switch (cat) {
        case 'Outdoor': return { icon: 'tree', color: '#14b8a6' };
        case 'Elektronik': return { icon: 'camera', color: '#6366f1' };
        case 'Perlengkapan': return { icon: 'wrench', color: '#eab308' };
        case 'Kendaraan': return { icon: 'bicycle', color: '#ef4444' };
        default: return { icon: 'tag', color: COLORS.textSecondary };
    }
};
const formatToRupiah = (angka: string | number): string => {
    const numStr = String(angka).replace(/[^0-9]/g, '');
    if (!numStr) return '';
    const num = typeof angka === 'number' ? angka : parseInt(numStr, 10);
    if (isNaN(num)) return '';
    return 'Rp ' + num.toLocaleString('id-ID');
};
const parseRupiah = (rupiah: string): number | null => {
    const numStr = rupiah.replace(/[^0-9]/g, '');
    if (!numStr) return null;
    const num = parseInt(numStr, 10);
    return isNaN(num) ? null : num;
};
// --- End Helper ---

// --- Tipe (Tidak Berubah) ---
type SearchResultsRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SearchResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;
type SortOptionId = 'relevan' | 'hargaAsc' | 'hargaDesc' | 'ratingDesc';
const SORT_OPTIONS: { id: SortOptionId; label: string }[] = [
    { id: 'relevan', label: 'Paling Relevan' },
    { id: 'hargaAsc', label: 'Harga Terendah' },
    { id: 'hargaDesc', label: 'Harga Tertinggi' },
    { id: 'ratingDesc', label: 'Rating Tertinggi' },
];
const RATING_OPTIONS = [4, 3, 2, 1];
// --- End Tipe ---


// ----------------------------------------------------------------
// Komponen Kartu Produk (Sudah Benar - Menggunakan URL)
// ----------------------------------------------------------------
type ProductCardProps = { item: ApiProduct; onPress: () => void };
const ProductCard: React.FC<ProductCardProps> = React.memo(({ item, onPress }) => {
    const { icon, color } = getCategoryInfo(item.category);
    return (
        <TouchableOpacity style={styles.productCardContainer} onPress={onPress} activeOpacity={0.8}>
            {item.imageUrl ? (
              <Image
                source={{ uri: `${API_URL}/images/${item.imageUrl}` }}
                style={styles.productCardImage}
                resizeMode="cover"
                onError={(e) => console.log('Image Load Error (Search Results):', e.nativeEvent.error, `${API_URL}/images/${item.imageUrl}`)}
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Icon name="photo" size={40} color={COLORS.border} />
              </View>
            )}

            <View style={styles.productCardBody}>
                <View>
                    <Text style={styles.productCardTitle} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.locationRow}>
                        <Icon name="map-marker" size={12} color={COLORS.textMuted} />
                        <Text style={styles.locationText} numberOfLines={1}>{item.location || 'Lokasi tidak diketahui'}</Text>
                    </View>
                    <View style={[styles.categoryTag, { backgroundColor: `${color}20` }]}>
                        <Icon name={icon} size={10} color={color} />
                        <Text style={[styles.categoryText, { color: color }]}>{item.category || 'Lainnya'}</Text>
                    </View>
                </View>
                <View style={styles.productCardFooter}>
                    <Text style={styles.priceText}>
                        <Text style={styles.priceHighlight}>Rp{formatPrice(item.price)}</Text>
                        <Text style={styles.pricePeriod}>{item.period || ''}</Text>
                    </Text>
                    <View style={styles.ratingBox}>
                        <Icon name="star" size={10} color={COLORS.starActive} />
                        <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// ----------------------------------------------------------------
// Komponen Kartu Toko (Sudah Benar)
// ----------------------------------------------------------------
type ShopCardProps = { shop: ApiSeller; onPress: () => void };
const ShopCard: React.FC<ShopCardProps> = React.memo(({ shop, onPress }) => {
    return (
        <TouchableOpacity style={styles.shopCardContainer} onPress={onPress} activeOpacity={0.8}>
             {/* Gunakan URL avatar langsung jika ada, atau undefined */}
             <Image source={{ uri: shop.avatar || undefined }} style={styles.shopLogo} />
             <View style={styles.shopInfoContainer}>
                 <Text style={styles.shopName}>{shop.name}</Text>
                 <Text style={styles.shopBio} numberOfLines={2}>{shop.bio || 'Tidak ada bio.'}</Text>
                 <View style={styles.shopStatsRow}>
                     <View style={styles.shopStatItem}>
                         <Icon name="star" size={12} color={COLORS.starActive} />
                         <Text style={styles.shopStatText}>{shop.rating?.toFixed(1) || 'N/A'} Rating</Text>
                     </View>
                     <View style={styles.shopStatItem}>
                         <Icon name="history" size={12} color={COLORS.textMuted} />
                         <Text style={styles.shopStatText}>{shop.itemsRented || 0} Tersewa</Text>
                     </View>
                 </View>
             </View>
             <Icon name="chevron-right" size={14} color={COLORS.textMuted} style={styles.shopArrow} />
         </TouchableOpacity>
     );
});

// ----------------------------------------------------------------
// Komponen No Results (Tidak Berubah)
// ----------------------------------------------------------------
const NoResultsView: React.FC<{ query: string }> = ({ query }) => {
    return (
        <View style={styles.noResultsContainer}>
            <Icon name="frown-o" size={40} color={COLORS.textMuted} style={styles.iconMargin} />
            <Text style={styles.noResultsText}>Tidak ada hasil untuk "{query}".</Text>
            <Text style={styles.noResultsTextSmall}>Coba periksa ejaan atau gunakan kata kunci yang lebih umum.</Text>
        </View>
    );
};


// ================================================================
// KOMPONEN UTAMA
// ================================================================
export default function SearchResultsScreen({ navigation }: SearchResultsScreenProps) {
    const route = useRoute<SearchResultsRouteProp>();
    const { query } = route.params;

    const [activeTab, setActiveTab] = useState<'produk' | 'toko'>('produk');

    // State (Tidak Berubah)
    const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
    const [allSellers, setAllSellers] = useState<ApiSeller[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSortModalVisible, setSortModalVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedSort, setSelectedSort] = useState<SortOptionId>('relevan');
    const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
    const [tempSelectedLocations, setTempSelectedLocations] = useState<string[]>([]);
    const [tempMinPrice, setTempMinPrice] = useState<string>('');
    const [tempMaxPrice, setTempMaxPrice] = useState<string>('');
    const [tempMinRating, setTempMinRating] = useState<number | null>(null);
    const [appliedSelectedCategories, setAppliedSelectedCategories] = useState<string[]>([]);
    const [appliedLocations, setAppliedLocations] = useState<string[]>([]);
    const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
    const [appliedMinRating, setAppliedMinRating] = useState<number | null>(null);

    // useEffect fetch data (Tidak Berubah)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Ganti '/api/products' dengan endpoint pencarian Anda jika ada
                // Untuk sekarang, kita filter di client side
                const response = await fetch(`${API_URL}/api/products`);
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                const data: ApiProduct[] = await response.json();
                setAllProducts(data);

                // Ekstrak seller unik
                const sellerMap = new Map<number, ApiSeller>();
                data.forEach(p => {
                    if (p.seller && !sellerMap.has(p.seller.id)) {
                        sellerMap.set(p.seller.id, p.seller);
                    }
                });
                setAllSellers(Array.from(sellerMap.values()));

            } catch (err) {
                console.error("Failed to fetch data:", err);
                const message = err instanceof Error ? err.message : "Gagal memuat data. Periksa koneksi.";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []); // Hanya fetch sekali saat mount

    // useMemo (Tidak Berubah)
    const availableCategories = useMemo(() => Array.from(new Set(allProducts.map(p => p.category).filter(Boolean) as string[])), [allProducts]);
    const availableLocations = useMemo(() => Array.from(new Set(allProducts.map(p => p.location).filter(Boolean) as string[])), [allProducts]);
    const { overallMinPrice, overallMaxPrice } = useMemo(() => {
        if (allProducts.length === 0) return { overallMinPrice: 0, overallMaxPrice: 0 };
        const prices = allProducts.map(p => p.price);
        if (prices.length === 0) return { overallMinPrice: 0, overallMaxPrice: 0 };
        return { overallMinPrice: Math.min(...prices), overallMaxPrice: Math.max(...prices) };
    }, [allProducts]);
    const queryFilteredResults = useMemo(() => {
        const lowerCaseQuery = query.toLowerCase().trim();
        if (!lowerCaseQuery) return allProducts; // Jika query kosong, tampilkan semua (difilter nanti)
        return allProducts.filter(item =>
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            item.description.toLowerCase().includes(lowerCaseQuery) ||
            (item.category && item.category.toLowerCase().includes(lowerCaseQuery)) ||
            (item.location && item.location.toLowerCase().includes(lowerCaseQuery))
        );
     }, [query, allProducts]);
    const displayedProducts = useMemo(() => {
        // Mulai dari hasil yang sudah difilter berdasarkan query
        let items = queryFilteredResults.filter(item =>
            (appliedSelectedCategories.length === 0 || (item.category && appliedSelectedCategories.includes(item.category))) &&
            (appliedLocations.length === 0 || (item.location && appliedLocations.includes(item.location))) &&
            (appliedMinPrice === null || item.price >= appliedMinPrice) &&
            (appliedMaxPrice === null || item.price <= appliedMaxPrice) &&
            (appliedMinRating === null || (item.rating && item.rating >= appliedMinRating))
        );

        // Lakukan sorting
        if (selectedSort !== 'relevan') {
            items = [...items]; // Buat salinan untuk disortir
            switch (selectedSort) {
                case 'hargaAsc': items.sort((a, b) => a.price - b.price); break;
                case 'hargaDesc': items.sort((a, b) => b.price - a.price); break;
                case 'ratingDesc': items.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            }
        }
        return items;
     }, [queryFilteredResults, selectedSort, appliedSelectedCategories, appliedLocations, appliedMinPrice, appliedMaxPrice, appliedMinRating]);
    const filteredShops = useMemo(() => {
        const lowerCaseQuery = query.toLowerCase().trim();
        if (!lowerCaseQuery) return allSellers;
        return allSellers.filter(shop =>
            shop.name.toLowerCase().includes(lowerCaseQuery) ||
            (shop.bio && shop.bio.toLowerCase().includes(lowerCaseQuery))
        );
     }, [query, allSellers]);

    // Handlers Modal (Tidak Berubah)
    const toggleChipFilter = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
     }, []);
    const handleApplyFilters = useCallback(() => {
        setAppliedSelectedCategories(tempSelectedCategories);
        setAppliedLocations(tempSelectedLocations);
        setAppliedMinPrice(parseRupiah(tempMinPrice));
        setAppliedMaxPrice(parseRupiah(tempMaxPrice));
        setAppliedMinRating(tempMinRating);
        setFilterModalVisible(false);
     }, [tempSelectedCategories, tempSelectedLocations, tempMinPrice, tempMaxPrice, tempMinRating]);
    const handleResetFilters = useCallback(() => {
        setTempSelectedCategories([]); setTempSelectedLocations([]);
        setTempMinPrice(''); setTempMaxPrice(''); setTempMinRating(null);
        setAppliedSelectedCategories([]); setAppliedLocations([]);
        setAppliedMinPrice(null); setAppliedMaxPrice(null); setAppliedMinRating(null);
        setFilterModalVisible(false);
     }, []);
    const handleOpenFilter = useCallback(() => {
        setTempSelectedCategories(appliedSelectedCategories); setTempSelectedLocations(appliedLocations);
        setTempMinPrice(appliedMinPrice !== null ? formatToRupiah(appliedMinPrice) : '');
        setTempMaxPrice(appliedMaxPrice !== null ? formatToRupiah(appliedMaxPrice) : '');
        setTempMinRating(appliedMinRating);
        setFilterModalVisible(true);
     }, [appliedSelectedCategories, appliedLocations, appliedMinPrice, appliedMaxPrice, appliedMinRating]);
    const handleSelectSort = useCallback((sortId: SortOptionId) => {
        setSelectedSort(sortId); setSortModalVisible(false);
     }, []);

    // --- PERBAIKAN: Hapus fungsi 'convertToLegacyItem' ---
    // Fungsi ini tidak lagi diperlukan karena DetailScreen mengambil datanya sendiri.
    // const convertToLegacyItem = ... (DIHAPUS)
    // --- AKHIR PERBAIKAN ---

    // --- Navigasi ---
    const handleNavigateToDetail = useCallback((item: ApiProduct) => {
        // --- PERBAIKAN: Kirim 'productId' sesuai RootStackParamList ---
        navigation.navigate('Detail', { productId: item.id });
        // --- AKHIR PERBAIKAN ---
    }, [navigation]);

    const handleNavigateToShop = useCallback((shop: ApiSeller) => {
        // --- PERBAIKAN: Hapus cast 'as Seller' ---
        // RootStackParamList untuk 'SellerProfile' harus didefinisikan
        // untuk menerima tipe yang strukturnya sama dengan 'ApiSeller'
        navigation.navigate('SellerProfile', { seller: shop });
        // --- AKHIR PERBAIKAN ---
    }, [navigation]);

    // --- Render (Tidak Berubah) ---
    const isFilterActive = useMemo(() =>
        appliedSelectedCategories.length > 0 || appliedLocations.length > 0 ||
        appliedMinPrice !== null || appliedMaxPrice !== null || appliedMinRating !== null,
     [appliedSelectedCategories, appliedLocations, appliedMinPrice, appliedMaxPrice, appliedMinRating]);
    
    const renderHeader = () => {
        return (
            <>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        Hasil untuk: <Text style={styles.queryHighlight}>"{query}"</Text>
                    </Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={[styles.tabButton, activeTab === 'produk' && styles.tabButtonActive]} onPress={() => setActiveTab('produk')}>
                        <Text style={[styles.tabText, activeTab === 'produk' && styles.tabTextActive]}>Produk ({displayedProducts.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tabButton, activeTab === 'toko' && styles.tabButtonActive]} onPress={() => setActiveTab('toko')}>
                        <Text style={[styles.tabText, activeTab === 'toko' && styles.tabTextActive]}>Toko ({filteredShops.length})</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.filterSortBar}>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setSortModalVisible(true)}>
                        <Icon name="sort-amount-desc" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.filterButtonText}>Urutkan</Text>
                    </TouchableOpacity>
                    <View style={styles.filterSeparator} />
                    <TouchableOpacity style={styles.filterButton} onPress={handleOpenFilter}>
                        <Icon name="filter" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.filterButtonText}>Filter</Text>
                        {isFilterActive && <View style={styles.filterActiveDot} />}
                    </TouchableOpacity>
                </View>
            </>
        );
     };
    const renderSortModal = () => {
        return (
            <Modal animationType="slide" transparent={true} visible={isSortModalVisible} onRequestClose={() => setSortModalVisible(false)}>
                 <Pressable style={styles.modalBackdrop} onPress={() => setSortModalVisible(false)}>
                     <View style={[styles.modalContent, styles.sortModalContent]}>
                         <View style={styles.modalHeader}>
                             <Text style={styles.modalTitle}>Urutkan Berdasarkan</Text>
                             <TouchableOpacity onPress={() => setSortModalVisible(false)} style={styles.closeButton}>
                                 <Icon name="times" size={20} color={COLORS.textMuted} />
                             </TouchableOpacity>
                         </View>
                         <FlatList
                             data={SORT_OPTIONS} keyExtractor={(item) => item.id}
                             renderItem={({ item }) => {
                                 const isActive = selectedSort === item.id;
                                 return (
                                     <TouchableOpacity style={styles.optionButton} onPress={() => handleSelectSort(item.id)}>
                                         <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{item.label}</Text>
                                         {isActive && <Icon name="check" size={16} color={COLORS.primary} />}
                                     </TouchableOpacity>
                                 );
                             }}
                         />
                     </View>
                 </Pressable>
             </Modal>
        );
     };
    const renderFilterModal = () => {
        return (
            <Modal animationType="slide" transparent={true} visible={isFilterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                 <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)}>
                      <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, styles.filterModalContent]}>
                         <View style={styles.modalHeader}>
                             <Text style={styles.modalTitle}>Filter</Text>
                             <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.closeButton}>
                                 <Icon name="times" size={20} color={COLORS.textMuted} />
                             </TouchableOpacity>
                         </View>
                         <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
                             {/* Kategori */}
                            <Text style={styles.filterSectionTitle}>Kategori</Text>
                             <View style={styles.chipContainer}>
                                 {availableCategories.map(c => { const s = tempSelectedCategories.includes(c); return (
                                     <TouchableOpacity key={c} style={[styles.chip, s && styles.chipActive]} onPress={() => toggleChipFilter(c, setTempSelectedCategories)}>
                                         <Text style={[styles.chipText, s && styles.chipTextActive]}>{c}</Text>
                                     </TouchableOpacity>
                                 );})}
                             </View>
                             {/* Lokasi */}
                             <Text style={styles.filterSectionTitle}>Lokasi</Text>
                             <View style={styles.chipContainer}>
                                 {availableLocations.map(l => { const s = tempSelectedLocations.includes(l); return (
                                     <TouchableOpacity key={l} style={[styles.chip, s && styles.chipActive]} onPress={() => toggleChipFilter(l, setTempSelectedLocations)}>
                                    <Text style={[styles.chipText, s && styles.chipTextActive]}>{l}</Text>
                                     </TouchableOpacity>
                                 );})}
                             </View>
                             {/* Batas Harga */}
                             <Text style={styles.filterSectionTitle}>Batas Harga</Text>
                             <View style={styles.priceRangeContainer}>
                                 <TextInput style={styles.priceInput} placeholder={`Min (${formatToRupiah(overallMinPrice)})`} placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={tempMinPrice} onChangeText={t => setTempMinPrice(formatToRupiah(t))}/>
                                 <Text style={styles.priceSeparator}>-</Text>
                                 <TextInput style={styles.priceInput} placeholder={`Maks (${formatToRupiah(overallMaxPrice)})`} placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={tempMaxPrice} onChangeText={t => setTempMaxPrice(formatToRupiah(t))}/>
                          </View>
                             {/* Penilaian Minimum */}
                             <Text style={styles.filterSectionTitle}>Penilaian Minimum</Text>
                             <View style={styles.ratingFilterContainer}>
                                 {RATING_OPTIONS.map(r => { const s = tempMinRating === r; return (
                                     <TouchableOpacity key={r} style={[styles.ratingButton, s && styles.ratingButtonActive]} onPress={() => setTempMinRating(s ? null : r)}>
                                         <Icon name="star" size={14} color={s ? COLORS.textPrimary : COLORS.starActive} />
                                         <Text style={[styles.ratingButtonText, s && styles.ratingButtonTextActive]}>{r}+</Text>
                                     </TouchableOpacity>
                                 );})}
                             </View>
                             <View style={styles.filterScrollSpacer} />
                       </ScrollView>
                         {/* Footer Tombol */}
                         <View style={styles.filterFooter}>
                             <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
                              <Text style={styles.resetButtonText}>Reset</Text>
                             </TouchableOpacity>
                             <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                                 <Text style={styles.applyButtonText}>Terapkan</Text>
                             </TouchableOpacity>
                         </View>
                      </Pressable>
                 </Pressable>
             </Modal>
      );
     };

    // Render Loading & Error (Tidak Berubah)
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
     }
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <Icon name="exclamation-triangle" size={40} color={COLORS.textMuted} style={styles.iconMargin} />
                    <Text style={styles.noResultsText}>Oops! Terjadi Kesalahan</Text>
                    <Text style={styles.noResultsTextSmall}>{error}</Text>
                </View>
            </SafeAreaView>
        );
     }

    // Render Utama (Tidak Berubah)
    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {activeTab === 'produk' ? (
                <FlatList
                    data={displayedProducts}
                    renderItem={({ item }) => <ProductCard item={item} onPress={() => handleNavigateToDetail(item)} />}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    ListEmptyComponent={<NoResultsView query={query} />}
                    initialNumToRender={6}
                    maxToRenderPerBatch={8}
                    windowSize={10}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {filteredShops.length > 0
                        ? filteredShops.map(shop => <ShopCard key={shop.id} shop={shop} onPress={() => handleNavigateToShop(shop)} />)
                        : <NoResultsView query={query} />
                    }
                </ScrollView>
            )}
            {renderSortModal()}
            {renderFilterModal()}
        </SafeAreaView>
    );
}

// ================================================================
// STYLES
// ================================================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { marginRight: 12, padding: 4 },
    headerTitle: { fontSize: 18, color: COLORS.textSecondary, flex: 1, fontWeight: '600' },
    queryHighlight: { color: COLORS.textPrimary },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, marginHorizontal: 16 },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabButtonActive: { borderBottomColor: COLORS.primary },
    tabText: { color: COLORS.textMuted, fontWeight: '600' },
    tabTextActive: { color: COLORS.primary },
    filterSortBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 10 },
    filterButton: { flexDirection: 'row', alignItems: 'center' },
    filterButtonText: { color: COLORS.textSecondary, marginLeft: 6, fontSize: 14 },
    filterSeparator: { width: 1, height: '80%', backgroundColor: COLORS.border },
    filterActiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 6 },

    // Grid (Produk)
    gridContainer: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 16 },
    productCardContainer: { flex: 0.5, backgroundColor: COLORS.card, margin: 4, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    productCardImage: { width: '100%', height: 120, backgroundColor: COLORS.border },
    productImagePlaceholder: { width: '100%', height: 120, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
    productCardBody: { padding: 10, flex: 1, justifyContent: 'space-between' },
    productCardTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    locationText: { color: COLORS.textMuted, fontSize: 11, marginLeft: 4, flex: 1 },
    categoryTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
    categoryText: { fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
    productCardFooter: { marginTop: 'auto' },
    priceText: { fontSize: 12, color: COLORS.textMuted },
    priceHighlight: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
    pricePeriod: { fontSize: 12, color: COLORS.textMuted },
    ratingBox: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
    ratingText: { color: COLORS.textPrimary, fontSize: 12, marginLeft: 4, fontWeight: '500' },
   
    // List (Toko)
    listContainer: { paddingHorizontal: 16, paddingTop: 16 },
    shopCardContainer: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 8, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    shopLogo: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: COLORS.border },
    shopInfoContainer: { flex: 1 },
    shopName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    shopBio: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8 },
    shopStatsRow: { flexDirection: 'row', alignItems: 'center' },
    shopStatItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
    shopStatText: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 4 },
    shopArrow: { marginLeft: 10 },

    // Loading & No Results
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noResultsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: 40 },
    iconMargin: { marginBottom: 12 },
    noResultsText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', textAlign: 'center' },
    noResultsTextSmall: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginTop: 8 },

    // Modals (Sort & Filter)
    modalBackdrop: { flex: 1, backgroundColor: COLORS.backdrop, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '80%' },
    sortModalContent: { maxHeight: '50%' },
    filterModalContent: { flex: 0.8 }, // Ambil 80% tinggi layar
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 12 },
    modalTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
    closeButton: { padding: 4 },

    // Sort Modal
    optionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    optionText: { color: COLORS.textSecondary, fontSize: 16 },
    optionTextActive: { color: COLORS.primary, fontWeight: 'bold' },

    // Filter Modal
    filterScroll: { flex: 1 },
    filterSectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 12 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, marginBottom: 8 },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontSize: 13 },
    chipTextActive: { color: COLORS.textPrimary, fontWeight: 'bold' },

    priceRangeContainer: { flexDirection: 'row', alignItems: 'center' },
    priceInput: { flex: 1, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, color: COLORS.textPrimary, fontSize: 14 },
    priceSeparator: { color: COLORS.textMuted, marginHorizontal: 10, fontSize: 16 },

    ratingFilterContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    ratingButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginHorizontal: 4, backgroundColor: COLORS.background },
    ratingButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    ratingButtonText: { color: COLORS.textSecondary, marginLeft: 6, fontSize: 14 },
    ratingButtonTextActive: { color: COLORS.textPrimary, fontWeight: 'bold' },
    filterScrollSpacer: { height: 20 },

    filterFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 12 },
    resetButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
    resetButtonText: { color: COLORS.textPrimary, fontWeight: 'bold' },
    applyButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginLeft: 8, backgroundColor: COLORS.primary },
    applyButtonText: { color: COLORS.textPrimary, fontWeight: 'bold' },
});