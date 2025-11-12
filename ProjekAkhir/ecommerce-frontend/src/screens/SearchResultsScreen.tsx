import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Image,
    FlatList,
    Modal, Pressable, TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, type RouteProp, useNavigation } from '@react-navigation/native';
// Tipe navigasi Anda sudah benar di sini
import type { RootStackParamList, RootStackNavigationProp } from '../navigation/types'; 
import type { ApiProduct, ApiSeller } from '../types';
import { COLORS } from '../config/theme';
import apiClient, { BASE_URL } from '../config/api';

// (Helper: SORT_OPTIONS, RATING_OPTIONS, buildImageUri, formatPrice, getCategoryInfo, formatToRupiah, parseRupiah SUDAH BENAR)
const SORT_OPTIONS: { id: SortOptionId; label: string }[] = [
    { id: 'relevan', label: 'Paling Relevan' },
    { id: 'hargaAsc', label: 'Harga Terendah' },
    { id: 'hargaDesc', label: 'Harga Tertinggi' },
    { id: 'ratingDesc', label: 'Rating Tertinggi' },
];
const RATING_OPTIONS = [4, 3, 2, 1];
const buildImageUri = (filename?: string | null): string | null => {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    return `${BASE_URL}/images/${filename}`;
};
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

// =======================================================
// 🔌 TIPE NAVIGASI
// =======================================================
type SearchResultsRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type SortOptionId = 'relevan' | 'hargaAsc' | 'hargaDesc' | 'ratingDesc';

// (Tipe ExtendedProduct sudah dihapus, ini benar)

// ================================================================
// 🧩 KOMPONEN-KOMPONEN KECIL (PRESENTATIONAL)
// ================================================================

// ----------------------------------------------------------------
// Komponen Kartu Produk (Sudah Benar)
// ----------------------------------------------------------------
type ProductCardProps = { item: ApiProduct; onPress: () => void };
const ProductCard: React.FC<ProductCardProps> = React.memo(({ item, onPress }) => {
    const { icon, color } = getCategoryInfo(item.category);
    const imageUrl = buildImageUri(item.imageUrl);
    const displayRating = item.ratingAvg ?? null;
    const displayCount = item.reviewsCount ?? null;

    return (
        <TouchableOpacity style={styles.productCardContainer} onPress={onPress} activeOpacity={0.8}>
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.productCardImage}
                    resizeMode="cover"
                    onError={(e) => console.log('Image Load Error (Search Results):', e.nativeEvent.error, imageUrl)}
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
                        <Text style={styles.ratingText}>
                            {displayRating !== null ? (displayRating).toFixed(1) : 'Baru'}
                        </Text>
                        <Text style={styles.reviewCountText}>
                            {displayCount !== null ? ` (${displayCount})` : ''}
                        </Text>
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
    const avatarUrl = buildImageUri(shop.avatar);
    
    return (
        <TouchableOpacity style={styles.shopCardContainer} onPress={onPress} activeOpacity={0.8}>
             <Image 
                source={avatarUrl ? { uri: avatarUrl } : require('../assets/images/avatar-placeholder.png')} 
                style={styles.shopLogo} 
             />
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
// Komponen No Results (Sudah Benar)
// ----------------------------------------------------------------
const NoResultsView: React.FC<{ query: string }> = ({ query }) => {
    return (
        <View style={styles.noResultsContainer}>
            <Icon name="frown-o" size={40} color={COLORS.textMuted} style={styles.iconMargin} />
            <Text style={styles.noResultsText}>{query.trim().length > 0 ? `Tidak ada hasil untuk "${query}".` : 'Tidak ada hasil.'}</Text>
            <Text style={styles.noResultsTextSmall}>Coba periksa ejaan atau gunakan kata kunci yang lebih umum.</Text>
        </View>
    );
};

// ----------------------------------------------------------------
// Komponen Header (Sudah Benar)
// ----------------------------------------------------------------
type SearchHeaderProps = {
    query: string;
    submittedQuery: string;
    onQueryChange: (text: string) => void;
    onSearchSubmit: () => void;
    activeTab: 'produk' | 'toko';
    productCount: number;
    shopCount: number;
    isFilterActive: boolean;
    onBack: () => void;
    onTabChange: (tab: 'produk' | 'toko') => void;
    onSortPress: () => void;
    onFilterPress: () => void;
};
const SearchResultsHeader: React.FC<SearchHeaderProps> = React.memo(({
    query, submittedQuery, onQueryChange, onSearchSubmit,
    activeTab, productCount, shopCount, isFilterActive,
    onBack, onTabChange, onSortPress, onFilterPress
}) => {
    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.searchBarContainer}>
                    <Icon name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        value={query}
                        onChangeText={onQueryChange}
                        onSubmitEditing={onSearchSubmit}
                        placeholder="Cari produk atau toko..."
                        placeholderTextColor={COLORS.textMuted}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>
            
            <Text style={styles.showingResultsText}>
                Menampilkan hasil untuk: <Text style={styles.queryHighlight}>"{submittedQuery}"</Text>
            </Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabButton, activeTab === 'produk' && styles.tabButtonActive]} onPress={() => onTabChange('produk')}>
                    <Text style={[styles.tabText, activeTab === 'produk' && styles.tabTextActive]}>Produk ({productCount})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabButton, activeTab === 'toko' && styles.tabButtonActive]} onPress={() => onTabChange('toko')}>
                    <Text style={[styles.tabText, activeTab === 'toko' && styles.tabTextActive]}>Toko ({shopCount})</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.filterSortBar}>
                <TouchableOpacity style={styles.filterButton} onPress={onSortPress}>
                    <Icon name="sort-amount-desc" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.filterButtonText}>Urutkan</Text>
                </TouchableOpacity>
                <View style={styles.filterSeparator} />
                <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
                    <Icon name="filter" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.filterButtonText}>Filter</Text>
                    {isFilterActive && <View style={styles.filterActiveDot} />}
                </TouchableOpacity>
            </View>
        </>
    );
});

// ----------------------------------------------------------------
// Komponen Modal Urutkan (Sudah Benar)
// ----------------------------------------------------------------
type SortModalProps = {
    visible: boolean;
    onClose: () => void;
    selectedSort: SortOptionId;
    onSelectSort: (id: SortOptionId) => void;
};
const SortModal: React.FC<SortModalProps> = React.memo(({ visible, onClose, selectedSort, onSelectSort }) => {
    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
             <Pressable style={styles.modalBackdrop} onPress={onClose}>
                 <View style={[styles.modalContent, styles.sortModalContent]}>
                     <View style={styles.modalHeader}>
                         <Text style={styles.modalTitle}>Urutkan Berdasarkan</Text>
                         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                             <Icon name="times" size={20} color={COLORS.textMuted} />
                         </TouchableOpacity>
                     </View>
                     <FlatList
                         data={SORT_OPTIONS} keyExtractor={(item) => item.id}
                         renderItem={({ item }) => {
                             const isActive = selectedSort === item.id;
                             return (
                                 <TouchableOpacity style={styles.optionButton} onPress={() => onSelectSort(item.id)}>
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
});

// ----------------------------------------------------------------
// Komponen Modal Filter (Sudah Benar)
// ----------------------------------------------------------------
type FilterModalProps = {
    visible: boolean;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
    availableCategories: string[];
    availableLocations: string[];
    overallMinPrice: number;
    overallMaxPrice: number;
    tempState: {
        categories: string[];
        locations: string[];
        minPrice: string;
        maxPrice: string;
        minRating: number | null;
    };
    onTempStateChange: {
        toggleCategory: (c: string) => void;
        toggleLocation: (l: string) => void;
        setMinPrice: (p: string) => void;
        setMaxPrice: (p: string) => void;
        setMinRating: (r: number | null) => void;
    };
};
const FilterModal: React.FC<FilterModalProps> = React.memo(({
    visible, onClose, onApply, onReset, availableCategories, availableLocations,
    overallMinPrice, overallMaxPrice, tempState, onTempStateChange
}) => {
    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <Pressable style={styles.modalBackdrop} onPress={onClose}>
                <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, styles.filterModalContent]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="times" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
                        {/* Kategori */}
                        <Text style={styles.filterSectionTitle}>Kategori</Text>
                        <View style={styles.chipContainer}>
                            {availableCategories.map(c => { const s = tempState.categories.includes(c); return (
                                <TouchableOpacity key={c} style={[styles.chip, s && styles.chipActive]} onPress={() => onTempStateChange.toggleCategory(c)}>
                                    <Text style={[styles.chipText, s && styles.chipTextActive]}>{c}</Text>
                                </TouchableOpacity>
                            );})}
                        </View>
                        {/* Lokasi */}
                        <Text style={styles.filterSectionTitle}>Lokasi</Text>
                        <View style={styles.chipContainer}>
                            {availableLocations.map(l => { const s = tempState.locations.includes(l); return (
                                <TouchableOpacity key={l} style={[styles.chip, s && styles.chipActive]} onPress={() => onTempStateChange.toggleLocation(l)}>
                                    <Text style={[styles.chipText, s && styles.chipTextActive]}>{l}</Text>
                                </TouchableOpacity>
                            );})}
                        </View>
                        {/* Batas Harga */}
                        <Text style={styles.filterSectionTitle}>Batas Harga</Text>
                        <View style={styles.priceRangeContainer}>
                            <TextInput style={styles.priceInput} placeholder={`Min (${formatToRupiah(overallMinPrice)})`} placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={tempState.minPrice} onChangeText={t => onTempStateChange.setMinPrice(formatToRupiah(t))}/>
                            <Text style={styles.priceSeparator}>-</Text>
                            <TextInput style={styles.priceInput} placeholder={`Maks (${formatToRupiah(overallMaxPrice)})`} placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={tempState.maxPrice} onChangeText={t => onTempStateChange.setMaxPrice(formatToRupiah(t))}/>
                        </View>
                        {/* Penilaian Minimum */}
                        <Text style={styles.filterSectionTitle}>Penilaian Minimum</Text>
                        <View style={styles.ratingFilterContainer}>
                            {RATING_OPTIONS.map(r => { const s = tempState.minRating === r; return (
                                <TouchableOpacity key={r} style={[styles.ratingButton, s && styles.ratingButtonActive]} onPress={() => onTempStateChange.setMinRating(s ? null : r)}>
                                    <Icon name="star" size={14} color={s ? COLORS.textPrimary : COLORS.starActive} />
                                    <Text style={[styles.ratingButtonText, s && styles.ratingButtonTextActive]}>{r}+</Text>
                                </TouchableOpacity>
                            );})}
                        </View>
                        <View style={styles.filterScrollSpacer} />
                    </ScrollView>
                    {/* Footer Tombol */}
                    <View style={styles.filterFooter}>
                        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                            <Text style={styles.applyButtonText}>Terapkan</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});


// ================================================================
// KOMPONEN UTAMA (CONTAINER)
// ================================================================
export default function SearchResultsScreen() {
    // --- Hooks ---
    const navigation = useNavigation<RootStackNavigationProp>();
    const route = useRoute<SearchResultsRouteProp>();
    
    // --- State ---
    // --- PERBAIKAN A: Beri nilai default string kosong ('') jika param query undefined ---
    const [searchQuery, setSearchQuery] = useState(route.params.query ?? '');
    const [submittedQuery, setSubmittedQuery] = useState(route.params.query ?? '');
    
    const [activeTab, setActiveTab] = useState<'produk' | 'toko'>('produk');
    
    // Data state
    const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
    const [allSellers, setAllSellers] = useState<ApiSeller[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [isSortModalVisible, setSortModalVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    // Sort & Filter state
    const [selectedSort, setSelectedSort] = useState<SortOptionId>('relevan');
    
    // Filter state (TEMP)
    const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
    const [tempSelectedLocations, setTempSelectedLocations] = useState<string[]>([]);
    const [tempMinPrice, setTempMinPrice] = useState<string>('');
    const [tempMaxPrice, setTempMaxPrice] = useState<string>('');
    const [tempMinRating, setTempMinRating] = useState<number | null>(null);

    // Filter state (APPLIED)
    const [appliedSelectedCategories, setAppliedSelectedCategories] = useState<string[]>([]);
    const [appliedLocations, setAppliedLocations] = useState<string[]>([]);
    const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
    const [appliedMinRating, setAppliedMinRating] = useState<number | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/products');
                
                // --- PERBAIKAN B (Logic Bug): Ekstrak array dari 'response.data.products' ---
                const products: ApiProduct[] = response.data.products || []; 
                setAllProducts(products);

                // Ekstrak seller unik (Logika ini sudah benar)
                const sellerMap = new Map<number, ApiSeller>();
                products.forEach(p => {
                    if (p.seller && !sellerMap.has(p.seller.id)) {
                        sellerMap.set(p.seller.id, p.seller);
                    }
                });
                setAllSellers(Array.from(sellerMap.values()));

            } catch (err: any) {
                console.error("Failed to fetch data:", err);
                const message = err.response?.data?.message || err.message || "Gagal memuat data.";
                if (err.code === 'ERR_NETWORK') {
                    Alert.alert("Error Koneksi", `Tidak dapat terhubung ke server.\nPastikan server backend (${BASE_URL}) berjalan.`);
                } else {
                    Alert.alert("Error Memuat Data", message);
                }
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []); // Hanya fetch sekali saat mount

    // --- Memoized Logic (Filtering & Sorting) ---
    const availableCategories = useMemo(() => Array.from(new Set(allProducts.map(p => p.category).filter(Boolean) as string[])), [allProducts]);
    const availableLocations = useMemo(() => Array.from(new Set(allProducts.map(p => p.location).filter(Boolean) as string[])), [allProducts]);
    const { overallMinPrice, overallMaxPrice } = useMemo(() => {
        if (allProducts.length === 0) return { overallMinPrice: 0, overallMaxPrice: 0 };
        const prices = allProducts.map(p => p.price);
        if (prices.length === 0) return { overallMinPrice: 0, overallMaxPrice: 0 };
        return { overallMinPrice: Math.min(...prices), overallMaxPrice: Math.max(...prices) };
    }, [allProducts]);

    // 1. Filter by query
    const queryFilteredResults = useMemo(() => {
        const lowerCaseQuery = submittedQuery.toLowerCase().trim();
        
        // --- PERBAIKAN C (Error 'categoryId'): Gunakan 'categoryName' dari route params ---
        const categoryNameFilter = route.params.categoryName;

        if (!lowerCaseQuery && !categoryNameFilter) {
            return allProducts; // Tampilkan semua jika tidak ada query atau filter kategori
        }

        return allProducts.filter(item => {
            // Cek filter Kategori dari Navigasi (ExploreScreen)
            const categoryMatch = !categoryNameFilter || item.category === categoryNameFilter;

            // Cek filter Query Teks (Search Bar)
            const queryMatch = !lowerCaseQuery || (
                item.name.toLowerCase().includes(lowerCaseQuery) ||
                (item.description && item.description.toLowerCase().includes(lowerCaseQuery)) ||
                (item.category && item.category.toLowerCase().includes(lowerCaseQuery)) ||
                (item.location && item.location.toLowerCase().includes(lowerCaseQuery))
            );
            
            return categoryMatch && queryMatch;
        });
    // --- PERBAIKAN C (lanjutan): Update dependency array ---
    }, [submittedQuery, allProducts, route.params.categoryName]);

    // 2. Filter by applied filters & Sort (Logika sorting sudah benar)
    const displayedProducts = useMemo(() => {
        let items = queryFilteredResults.filter(item => {
            const ratingValue = item.ratingAvg ?? 0; 
            return (
                (appliedSelectedCategories.length === 0 || (item.category && appliedSelectedCategories.includes(item.category))) &&
                (appliedLocations.length === 0 || (item.location && appliedLocations.includes(item.location))) &&
                (appliedMinPrice === null || item.price >= appliedMinPrice) &&
                (appliedMaxPrice === null || item.price <= appliedMaxPrice) &&
                (appliedMinRating === null || ratingValue >= appliedMinRating)
            );
        });

        if (selectedSort !== 'relevan') {
            items = [...items];
            switch (selectedSort) {
                case 'hargaAsc': items.sort((a, b) => a.price - b.price); break;
                case 'hargaDesc': items.sort((a, b) => b.price - a.price); break;
                case 'ratingDesc': items.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0)); break;
            }
        }
        return items;
    }, [queryFilteredResults, selectedSort, appliedSelectedCategories, appliedLocations, appliedMinPrice, appliedMaxPrice, appliedMinRating]);

    // 3. Filter shops by query (Sudah Benar)
    const filteredShops = useMemo(() => {
        const lowerCaseQuery = submittedQuery.toLowerCase().trim();
        if (!lowerCaseQuery) return allSellers;
        return allSellers.filter(shop =>
            shop.name.toLowerCase().includes(lowerCaseQuery) ||
            (shop.bio && shop.bio.toLowerCase().includes(lowerCaseQuery))
        );
    }, [submittedQuery, allSellers]);

    // --- Handlers (Modal & Navigation) ---
    // (Semua handler: toggleChipFilter, handleApplyFilters, handleResetFilters, handleOpenFilter, handleSelectSort, handleSearchSubmit SUDAH BENAR)
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
        setTempSelectedCategories(appliedSelectedCategories); 
        setTempSelectedLocations(appliedLocations);
        setTempMinPrice(appliedMinPrice !== null ? formatToRupiah(appliedMinPrice) : '');
        setTempMaxPrice(appliedMaxPrice !== null ? formatToRupiah(appliedMaxPrice) : '');
        setTempMinRating(appliedMinRating);
        setFilterModalVisible(true);
    }, [appliedSelectedCategories, appliedLocations, appliedMinPrice, appliedMaxPrice, appliedMinRating]);
    const handleSelectSort = useCallback((sortId: SortOptionId) => {
        setSelectedSort(sortId); setSortModalVisible(false);
    }, []);
    const handleSearchSubmit = useCallback(() => {
        if (searchQuery.trim().length > 0) {
            setSubmittedQuery(searchQuery);
        } else {
            setSubmittedQuery('');
        }
    }, [searchQuery]);

    const handleNavigateToDetail = useCallback((item: ApiProduct) => {
        navigation.navigate('Detail', { productId: item.id });
    }, [navigation]);

    const handleNavigateToShop = useCallback((seller: ApiSeller) => {
        navigation.navigate('SellerProfile', { seller: seller });
    }, [navigation]);

    const isFilterActive = useMemo(() =>
        appliedSelectedCategories.length > 0 || appliedLocations.length > 0 ||
        appliedMinPrice !== null || appliedMaxPrice !== null || appliedMinRating !== null,
    [appliedSelectedCategories, appliedLocations, appliedMinPrice, appliedMaxPrice, appliedMinRating]);
    
    
    // --- Render Logic ---
    // (headerProps sekarang aman dari error 'undefined')
    const headerProps = {
        query: searchQuery,
        submittedQuery: submittedQuery,
        onQueryChange: setSearchQuery,
        onSearchSubmit: handleSearchSubmit,
        activeTab, 
        productCount: displayedProducts.length,
        shopCount: filteredShops.length,
        isFilterActive,
        onBack: () => navigation.goBack(),
        onTabChange: setActiveTab,
        onSortPress: () => setSortModalVisible(true),
        onFilterPress: handleOpenFilter,
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <SearchResultsHeader {...headerProps} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <SearchResultsHeader {...headerProps} />
                <View style={styles.loadingContainer}>
                    <Icon name="exclamation-triangle" size={40} color={COLORS.textMuted} style={styles.iconMargin} />
                    <Text style={styles.noResultsText}>Oops! Terjadi Kesalahan</Text>
                    <Text style={styles.noResultsTextSmall}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // --- Main Render ---
    return (
        <SafeAreaView style={styles.container}>
            <SearchResultsHeader {...headerProps} />
            
            {activeTab === 'produk' ? (
                <FlatList
                    data={displayedProducts}
                    renderItem={({ item }) => <ProductCard item={item} onPress={() => handleNavigateToDetail(item)} />}
                    keyExtractor={item => `prod-${item.id.toString()}`}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    ListEmptyComponent={<NoResultsView query={submittedQuery} />}
                    initialNumToRender={6}
                    columnWrapperStyle={styles.listColumnWrapper} 
                />
            ) : (
                <FlatList 
                    data={filteredShops}
                    renderItem={({ item }) => <ShopCard shop={item} onPress={() => handleNavigateToShop(item)} />}
                    keyExtractor={item => `shop-${item.id.toString()}`}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<NoResultsView query={submittedQuery} />}
                />
            )}
            
            <SortModal 
                visible={isSortModalVisible}
                onClose={() => setSortModalVisible(false)}
                selectedSort={selectedSort}
                onSelectSort={handleSelectSort}
            />
            
            <FilterModal 
                visible={isFilterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                availableCategories={availableCategories}
                availableLocations={availableLocations}
                overallMinPrice={overallMinPrice}
                overallMaxPrice={overallMaxPrice}
                tempState={{
                    categories: tempSelectedCategories,
                    locations: tempSelectedLocations,
                    minPrice: tempMinPrice,
                    maxPrice: tempMaxPrice,
                    minRating: tempMinRating,
                }}
                onTempStateChange={{
                    toggleCategory: (c) => toggleChipFilter(c, setTempSelectedCategories),
                    toggleLocation: (l) => toggleChipFilter(l, setTempSelectedLocations),
                    setMinPrice: setTempMinPrice,
                    setMaxPrice: setTempMaxPrice,
                    setMinRating: setTempMinRating,
                }}
            />
        </SafeAreaView>
    );
}

// ================================================================
// STYLES
// ================================================================
const styles = StyleSheet.create({
    
    // ================================================================
    // 1. BASE LAYOUT & CONTAINERS
    // ================================================================
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    
    centerAlign: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    
    loadingText: {
        marginTop: 12,
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
    
    iconMargin: {
        marginBottom: 16,
    },
    
    // ================================================================
    // 2. HEADER SECTION
    // ================================================================
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    
    backButton: {
        marginRight: 12,
        padding: 8,
        borderRadius: 8,
    },
    
    // ================================================================
    // 3. SEARCH BAR
    // ================================================================
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    
    searchIcon: {
        marginRight: 10,
    },
    
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        color: COLORS.textPrimary,
        fontSize: 15,
    },
    
    showingResultsText: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        fontSize: 13,
        color: COLORS.textMuted,
        backgroundColor: COLORS.card,
    },
    
    queryHighlight: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    
    // ================================================================
    // 4. TAB NAVIGATION
    // ================================================================
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        elevation: 1,
    },
    
    tabButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    
    tabButtonActive: {
        borderBottomColor: COLORS.primary,
    },
    
    tabText: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '500',
    },
    
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    
    // ================================================================
    // 5. FILTER & SORT BAR
    // ================================================================
    filterSortBar: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    
    filterButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    
    filterSeparator: {
        width: 1,
        height: '60%',
        backgroundColor: COLORS.border,
        alignSelf: 'center',
    },
    
    filterActiveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: 8,
    },
    
    // ================================================================
    // 6. LIST LAYOUT
    // ================================================================
    listContainer: {
        padding: 12,
    },
    
    gridContainer: {
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    
    listColumnWrapper: {
        justifyContent: 'space-between',
    },
    
    // ================================================================
    // 7. EMPTY STATE
    // ================================================================
    noResultsContainer: {
        flex: 1,
        paddingVertical: 100,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    noResultsText: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 8,
    },
    
    noResultsTextSmall: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    
    // ================================================================
    // 8. PRODUCT CARD - REDESIGNED FOR MOBILE
    // ================================================================
    productCardContainer: {
        width: '48%',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    
    // Product Image Section
    productCardImage: {
        height: 140,
        width: '100%',
        backgroundColor: COLORS.border,
    },
    
    productImagePlaceholder: {
        height: 140,
        width: '100%',
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Product Content Body
    productCardBody: {
        padding: 10,
    },
    
    productCardTitle: {
        color: COLORS.textPrimary,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 6,
        minHeight: 36,
    },
    
    // Location Row
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    
    locationText: {
        color: COLORS.textMuted,
        fontSize: 11,
        marginLeft: 4,
        flex: 1,
    },
    
    // Footer Section - FIXED LAYOUT
    productCardFooter: {
        flexDirection: 'column',
        gap: 8,
    },
    
    // Price Row (Full Width)
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    
    priceText: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginRight: 4,
    },
    
    priceHighlight: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    
    pricePeriod: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginLeft: 2,
    },
    
    // Rating Row (Full Width, Separated)
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    ratingText: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
    },
    
    reviewCountText: {
        color: COLORS.textMuted,
        fontSize: 11,
        marginLeft: 6,
    },
    
    // Legacy Category Tag (kept for compatibility)
    categoryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4,
    },
    
    // ================================================================
    // 9. SHOP CARD - REDESIGNED FOR MOBILE
    // ================================================================
    shopCardContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.card,
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    
    // Shop Logo
    shopLogo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 14,
        backgroundColor: COLORS.border,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    
    // Shop Info Container
    shopInfoContainer: {
        flex: 1,
        marginRight: 12,
    },
    
    shopName: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        lineHeight: 22,
    },
    
    shopBio: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 10,
    },
    
    // Shop Stats Row
    shopStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    
    shopStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    
    shopStatText: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500',
    },
    
    shopArrow: {
        alignSelf: 'center',
    },
    
    // ================================================================
    // 10. MODAL BASE STYLES
    // ================================================================
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'flex-end',
    },
    
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 34,
    },
    
    sortModalContent: {
        minHeight: 300,
    },
    
    filterModalContent: {
        maxHeight: '88%',
    },
    
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    
    modalTitle: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    
    closeButton: {
        padding: 8,
        borderRadius: 20,
    },
    
    // ================================================================
    // 11. SORT MODAL OPTIONS
    // ================================================================
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    
    optionText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    
    optionTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    
    // ================================================================
    // 12. FILTER MODAL - SCROLL CONTENT
    // ================================================================
    filterScroll: {
        // biarkan ukurannya natural
    },
    
    filterScrollSpacer: {
        height: 24,
    },
    
    filterSectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 14,
        marginTop: 16,
    },
    
    // ================================================================
    // 13. FILTER CHIPS (Categories/Conditions)
    // ================================================================
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    
    chip: {
        backgroundColor: COLORS.background,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    
    chipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    
    // ================================================================
    // 14. PRICE RANGE FILTER
    // ================================================================
    priceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    
    priceInput: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        paddingHorizontal: 14,
        height: 48,
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    
    priceSeparator: {
        color: COLORS.textMuted,
        marginHorizontal: 12,
        fontSize: 18,
        fontWeight: '700',
    },
    
    // ================================================================
    // 15. RATING FILTER BUTTONS
    // ================================================================
    ratingFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    
    ratingButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        paddingVertical: 12,
        marginHorizontal: 5,
    },
    
    ratingButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    
    ratingButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 6,
    },
    
    ratingButtonTextActive: {
        color: '#FFFFFF',
    },
    
    // ================================================================
    // 16. FILTER MODAL FOOTER (Reset & Apply)
    // ================================================================
    filterFooter: {
        flexDirection: 'row',
        paddingTop: 20,
        marginTop: 16,
        borderTopWidth: 1,
        borderColor: COLORS.border,
    },
    
    resetButton: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    
    resetButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    
    applyButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginLeft: 10,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});