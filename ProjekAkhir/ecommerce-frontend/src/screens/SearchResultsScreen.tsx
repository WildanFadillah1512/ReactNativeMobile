// File: src/screens/SearchResultsScreen.tsx (Refactored with Search Bar)

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

import { useRoute, type RouteProp, useNavigation } from '@react-navigation/native';
import type { RootStackParamList, RootStackNavigationProp } from '../../App';
import type { ApiProduct, ApiSeller } from '../types';


// =======================================================
// 🚀 KONSTANTA
// =======================================================
const API_URL = 'http://10.95.21.143:3000';

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

const SORT_OPTIONS: { id: SortOptionId; label: string }[] = [
    { id: 'relevan', label: 'Paling Relevan' },
    { id: 'hargaAsc', label: 'Harga Terendah' },
    { id: 'hargaDesc', label: 'Harga Tertinggi' },
    { id: 'ratingDesc', label: 'Rating Tertinggi' },
];

const RATING_OPTIONS = [4, 3, 2, 1];

// =======================================================
// 🛠️ FUNGSI HELPER
// =======================================================
const buildImageUri = (filename?: string | null): string | null => {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    return `${API_URL}/images/${filename}`;
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

// ================================================================
// 🧩 KOMPONEN-KOMPONEN KECIL (PRESENTATIONAL)
// ================================================================

// ----------------------------------------------------------------
// Komponen Kartu Produk
// ----------------------------------------------------------------
type ProductCardProps = { item: ApiProduct; onPress: () => void };
const ProductCard: React.FC<ProductCardProps> = React.memo(({ item, onPress }) => {
    const { icon, color } = getCategoryInfo(item.category);
    const imageUrl = buildImageUri(item.imageUrl);
    
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
                        <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// ----------------------------------------------------------------
// Komponen Kartu Toko
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
// Komponen No Results
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
// Komponen Header
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
// Komponen Modal Urutkan
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
// Komponen Modal Filter
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
    const [searchQuery, setSearchQuery] = useState(route.params.query);
    const [submittedQuery, setSubmittedQuery] = useState(route.params.query);

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
        if (!lowerCaseQuery) return allProducts; // Jika query kosong, tampilkan semua
        return allProducts.filter(item =>
            item.name.toLowerCase().includes(lowerCaseQuery) ||
            item.description.toLowerCase().includes(lowerCaseQuery) ||
            (item.category && item.category.toLowerCase().includes(lowerCaseQuery)) ||
            (item.location && item.location.toLowerCase().includes(lowerCaseQuery))
        );
    }, [submittedQuery, allProducts]);

    // 2. Filter by applied filters & Sort
    const displayedProducts = useMemo(() => {
        let items = queryFilteredResults.filter(item =>
            (appliedSelectedCategories.length === 0 || (item.category && appliedSelectedCategories.includes(item.category))) &&
            (appliedLocations.length === 0 || (item.location && appliedLocations.includes(item.location))) &&
            (appliedMinPrice === null || item.price >= appliedMinPrice) &&
            (appliedMaxPrice === null || item.price <= appliedMaxPrice) &&
            (appliedMinRating === null || (item.rating && item.rating >= appliedMinRating))
        );

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

    // 3. Filter shops by query
    const filteredShops = useMemo(() => {
        const lowerCaseQuery = submittedQuery.toLowerCase().trim();
        if (!lowerCaseQuery) return allSellers;
        return allSellers.filter(shop =>
            shop.name.toLowerCase().includes(lowerCaseQuery) ||
            (shop.bio && shop.bio.toLowerCase().includes(lowerCaseQuery))
        );
    }, [submittedQuery, allSellers]);

    // --- Handlers (Modal & Navigation) ---
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
        // Sync temp state with applied state before opening
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

    // Handler baru untuk submit search
    const handleSearchSubmit = useCallback(() => {
        if (searchQuery.trim().length > 0) {
            setSubmittedQuery(searchQuery);
        } else {
            setSubmittedQuery(''); // Set ke string kosong jika input kosong
        }
    }, [searchQuery]);

    const handleNavigateToDetail = useCallback((item: ApiProduct) => {
        navigation.navigate('Detail', { productId: item.id });
    }, [navigation]);

    const handleNavigateToShop = useCallback((shop: ApiSeller) => {
        navigation.navigate('SellerProfile', { seller: shop });
    }, [navigation]);

    const isFilterActive = useMemo(() =>
        appliedSelectedCategories.length > 0 || appliedLocations.length > 0 ||
        appliedMinPrice !== null || appliedMaxPrice !== null || appliedMinRating !== null,
    [appliedSelectedCategories, appliedLocations, appliedMinPrice, appliedMaxPrice, appliedMinRating]);
    
    
    // --- Render Logic ---
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
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    ListEmptyComponent={<NoResultsView query={submittedQuery} />}
                    initialNumToRender={6}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {filteredShops.length > 0
                        ? filteredShops.map(shop => <ShopCard key={shop.id} shop={shop} onPress={() => handleNavigateToShop(shop)} />)
                        : <NoResultsView query={submittedQuery} />
                    }
                </ScrollView>
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
// 🎨 STYLES (DIRAPIKAN & DIKELOMPOKKAN)
// ================================================================
const styles = StyleSheet.create({
    // --- 1. Core Layout & Loading/Error ---
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 300, // Pastikan mengisi ruang
    },
    noResultsText: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    noResultsTextSmall: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    iconMargin: {
        marginBottom: 12,
    },

    // --- 2. Header, Search Bar & Tabs ---
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1, // Tambahkan border di bawah header
        borderBottomColor: COLORS.border,
    },
    backButton: { 
        marginRight: 12, 
        padding: 4 
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 8,
        height: 40,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        paddingLeft: 12,
        paddingRight: 8,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        paddingVertical: 8,
        paddingRight: 12,
    },
    showingResultsText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
        paddingHorizontal: 16,
        paddingBottom: 10,
        paddingTop: 10, // Beri jarak
    },
    queryHighlight: { 
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    tabContainer: { 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.border, 
        marginHorizontal: 16 
    },
    tabButton: { 
        flex: 1, 
        paddingVertical: 12, 
        alignItems: 'center', 
        borderBottomWidth: 2, 
        borderBottomColor: 'transparent' 
    },
    tabButtonActive: { 
        borderBottomColor: COLORS.primary 
    },
    tabText: { 
        color: COLORS.textMuted, 
        fontWeight: '600' 
    },
    tabTextActive: { 
        color: COLORS.primary 
    },

    // --- 3. Filter/Sort Bar ---
    filterSortBar: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        backgroundColor: COLORS.background, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.border, 
        paddingVertical: 10 
    },
    filterButton: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    filterButtonText: { 
        color: COLORS.textSecondary, 
        marginLeft: 6, 
        fontSize: 14 
    },
    filterSeparator: { 
        width: 1, 
        height: '80%', 
        backgroundColor: COLORS.border 
    },
    filterActiveDot: { 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: COLORS.primary, 
        marginLeft: 6 
    },

    // --- 4. Product Grid (ProductCard) ---
    gridContainer: { 
        paddingHorizontal: 12, 
        paddingTop: 16, 
        paddingBottom: 16 
    },
    productCardContainer: { 
        flex: 0.5, 
        backgroundColor: COLORS.card, 
        margin: 4, 
        borderRadius: 8, 
        overflow: 'hidden', 
        borderWidth: 1, 
        borderColor: COLORS.border 
    },
    productCardImage: { 
        width: '100%', 
        height: 120, 
    },
    productImagePlaceholder: { 
        width: '100%', 
        height: 120, 
        backgroundColor: COLORS.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    productCardBody: { 
        padding: 10, 
        flex: 1, 
        justifyContent: 'space-between' 
    },
    productCardTitle: { 
        color: COLORS.textPrimary, 
        fontSize: 14, 
        fontWeight: '600', 
        marginBottom: 4 
    },
    locationRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 6 
    },
    locationText: { 
        color: COLORS.textMuted, 
        fontSize: 11, 
        marginLeft: 4, 
        flex: 1 
    },
    categoryTag: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 6, 
        paddingVertical: 2, 
        borderRadius: 4, 
        alignSelf: 'flex-start', 
        marginBottom: 8 
    },
    categoryText: { 
        fontSize: 10, 
        fontWeight: 'bold', 
        marginLeft: 4 
    },
    productCardFooter: { 
        marginTop: 8 
    },
    priceText: { 
        fontSize: 12, 
        color: COLORS.textMuted 
    },
    priceHighlight: { 
        color: COLORS.primary, 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    pricePeriod: { 
        fontSize: 12, 
        color: COLORS.textMuted 
    },
    ratingBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        alignSelf: 'flex-end', 
        marginTop: 4 
    },
    ratingText: { 
        color: COLORS.textPrimary, 
        fontSize: 12, 
        marginLeft: 4, 
        fontWeight: '500' 
    },
    
    // --- 5. Shop List (ShopCard) ---
    listContainer: { 
        paddingHorizontal: 16, 
        paddingTop: 16,
        paddingBottom: 16,
    },
    shopCardContainer: { 
        flexDirection: 'row', 
        backgroundColor: COLORS.card, 
        borderRadius: 8, 
        padding: 12, 
        marginBottom: 12, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: COLORS.border 
    },
    shopLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: COLORS.border,
    },
    shopInfoContainer: {
        flex: 1,
    },
    shopName: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    shopBio: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginTop: 2,
        marginBottom: 8,
    },
    shopStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    shopStatText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginLeft: 5,
    },
    shopArrow: {
        marginLeft: 10,
    },

    // --- 6. Common Modal Styles ---
    modalBackdrop: {
        flex: 1,
        backgroundColor: COLORS.backdrop,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },

    // --- 7. Sort Modal ---
    sortModalContent: {
        paddingBottom: 30, // Ruang aman di bawah
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    optionText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    optionTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },

    // --- 8. Filter Modal ---
    filterModalContent: {
        maxHeight: '80%',
    },
    filterScroll: {
        // ScrollView di dalam modal
    },
    filterSectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    chipTextActive: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    priceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInput: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: COLORS.textPrimary,
        fontSize: 14,
    },
    priceSeparator: {
        color: COLORS.textMuted,
        marginHorizontal: 10,
    },
    ratingFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ratingButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        marginHorizontal: 4,
    },
    ratingButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    ratingButtonText: {
        color: COLORS.starActive,
        marginLeft: 6,
        fontWeight: '600',
    },
    ratingButtonTextActive: {
        color: COLORS.textPrimary,
    },
    filterScrollSpacer: {
        height: 20, // Beri jarak di akhir scroll
    },
    filterFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 16,
        marginTop: 16,
        paddingBottom: 10, // Ruang aman
    },
    resetButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderColor: COLORS.border,
        borderWidth: 1,
        marginRight: 8,
    },
    resetButtonText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        marginLeft: 8,
    },
    applyButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
});