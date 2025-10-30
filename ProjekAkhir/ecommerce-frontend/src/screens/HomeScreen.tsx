// File: HomeScreen.tsx (FINAL - Fetch /trending, Kirim productId, Kirim ApiProduct ke Cart)

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, ScrollView,
    StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useIsFocused, type RouteProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import type { ApiProduct } from '../types'; // Impor tipe API yang benar
import { useLikes } from '../context/LikeContext';
import { useCart } from '../context/CartContext'; // useCart sekarang menyediakan addToCart(ApiProduct)
import { COLORS } from '../config/theme';
import { API_URL } from '../config/api';

const LogoImage = require('../assets/images/logo.png');

type TabId = 'home' | 'explore' | 'saved' | 'profile';
type HomeRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;



export default function HomeScreen({ navigation }: HomeScreenProps) {
    // Hooks Navigasi & Context (Sudah Benar)
    const route = useRoute<HomeRouteProp>();
    const isFocused = useIsFocused();
    const routeActiveTabId = route.params?.activeTabId;
    const [activeTab, setActiveTab] = useState<TabId>(routeActiveTabId || 'home');
    useEffect(() => {
        if (isFocused && routeActiveTabId) {
            setActiveTab(routeActiveTabId);
        }
    }, [isFocused, routeActiveTabId]);
    const { likedIds, toggleLike, isLoading: likesLoading } = useLikes();
    const { cartEntries, addToCart, isLoading: cartLoading } = useCart(); // addToCart menerima ApiProduct

    // --- PERBAIKAN 2: State Data API - Tambah trendingProducts ---
    const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<ApiProduct[]>([]); // <-- State baru
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    // --- AKHIR PERBAIKAN 2 ---

    // State UI (Sudah Benar)
    const [selectedCategory, setSelectedCategory] = useState<string>('Trending');
    const contentScrollViewRef = useRef<ScrollView>(null);
    const categories = ['Trending', 'Outdoor', 'Elektronik', 'Perlengkapan', 'Kendaraan'];

    // --- PERBAIKAN 3: useEffect Fetch Data - Ambil /trending ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoadingProducts(true);
                // Ambil kedua endpoint secara paralel
                const [allRes, trendingRes] = await Promise.all([
                    fetch(`${API_URL}/api/products`),
                    fetch(`${API_URL}/api/products/trending`) // <-- Fetch trending
                ]);

                // Cek respons
                if (!allRes.ok) {
                    const errorText = await allRes.text();
                    throw new Error(`Gagal fetch semua produk (${allRes.status}): ${errorText}`);
                }
                if (!trendingRes.ok) {
                    const errorText = await trendingRes.text();
                    throw new Error(`Gagal fetch trending (${trendingRes.status}): ${errorText}`);
                }

                // Parse JSON
                const allData: ApiProduct[] = await allRes.json();
                const trendingData: ApiProduct[] = await trendingRes.json();

                // Set state
                setAllProducts(allData);
                setTrendingProducts(trendingData); // <-- Simpan data trending

            } catch (error) {
                console.error("HomeScreen Gagal fetch data:", error);
                const errorMessage = error instanceof Error ? error.message : "Gagal memuat data produk.";

                // Tampilkan Alert Error (handling koneksi sudah bagus)
                if (errorMessage.includes('Network request failed')) {
                     Alert.alert("Error Koneksi", `Tidak dapat terhubung ke server.\nPastikan server backend (${API_URL}) berjalan.`);
                } else {
                     Alert.alert("Error Memuat Data", errorMessage);
                }
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchInitialData();
    }, []); // Dependensi kosong, fetch sekali saat mount
    // --- AKHIR PERBAIKAN 3 ---

    // --- PERBAIKAN 4: Filter Items - Gunakan trendingProducts ---
    const filteredItems = useMemo(() => {
        if (isLoadingProducts) return []; // Jangan filter jika masih loading awal

        if (selectedCategory === 'Trending') {
            return trendingProducts; // <-- Langsung kembalikan data trending
        }

        // Filter 'allProducts' untuk kategori lain
        return allProducts.filter(item => item.category === selectedCategory);

    // Tambahkan dependensi yang benar
    }, [selectedCategory, allProducts, trendingProducts, isLoadingProducts]);
    // --- AKHIR PERBAIKAN 4 ---

    // Helper Kategori (Sudah Benar)
    const getCategoryInfo = (cat: string | null) => {
        switch (cat) {
            case 'Trending': return { icon: 'line-chart', color: COLORS.trending };
            case 'Outdoor': return { icon: 'tree', color: COLORS.outdoor };
            case 'Elektronik': return { icon: 'camera', color: COLORS.elektronik };
            case 'Perlengkapan': return { icon: 'wrench', color: COLORS.perlengkapan };
            case 'Kendaraan': return { icon: 'bicycle', color: COLORS.kendaraan };
            default: return { icon: 'tag', color: COLORS.defaultCategory };
        }
    };

    // --- PERBAIKAN 5: Hapus fungsi 'convertToLegacyItem' ---
    // Fungsi ini tidak lagi diperlukan dan menyebabkan error.
    // const convertToLegacyItem = (item: ApiProduct): RentalItem => { ... };
    // --- AKHIR PERBAIKAN 5 ---


    // --- Handler Aksi ---

    // --- PERBAIKAN 6: handleAddToCartAndNavigate - Kirim ApiProduct ---
    const handleAddToCartAndNavigate = async (item: ApiProduct) => { // 'item' adalah ApiProduct
        // Hapus konversi lama:
        // const legacyItem = convertToLegacyItem(item);
        try {
            // Kirim 'item' (ApiProduct) asli ke context
            const added = await addToCart(item); // <-- Langsung kirim item

            if (added) {
                Alert.alert("Ditambahkan", `${item.name} berhasil ditambahkan ke keranjang.`);
            } else {
                Alert.alert("Sudah di Keranjang", `${item.name} sudah ada. Lihat keranjang?`,
                    [{ text: "Tidak", style: "cancel" }, { text: "Ya, Lihat", onPress: () => navigation.navigate('Cart') }]
                );
            }
        } catch (error) {
            console.error("Gagal menambahkan ke keranjang:", error);
            Alert.alert("Gagal", "Tidak dapat menambahkan item.");
        }
    };
    // --- AKHIR PERBAIKAN 6 ---

    // handleCategoryChange (Sudah Benar)
    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        contentScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    // --- PERBAIKAN 7: handleNavigateToDetail - Kirim productId ---
    const handleNavigateToDetail = (item: ApiProduct) => { // 'item' adalah ApiProduct
        // Hapus konversi lama:
        // const legacyItem = convertToLegacyItem(item);
        // navigation.navigate('Detail', { item: legacyItem });

        // Kirim ID-nya saja, sesuai RootStackParamList
        navigation.navigate('Detail', { productId: item.id });
    };
    // --- AKHIR PERBAIKAN 7 ---

    // handleLikePress (Sudah Benar)
    const handleLikePress = async (id: number) => {
        try { await toggleLike(id); } catch (error) {
            console.error("Gagal toggle like:", error);
            Alert.alert("Gagal", "Tidak dapat memperbarui favorit.");
        }
    };
    // handleSearchPress (Sudah Benar)
    const handleSearchPress = () => { navigation.navigate('SearchHistory'); };


    // === RENDER ===
    // Logika render sudah benar: menampilkan gambar dari URL, harga dari angka,
    // dan memanggil handler yang sudah diperbaiki.
    return (
        <SafeAreaView style={styles.container}>
            {/* Header (UI Sudah Benar) */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.logoTitleContainer}>
                        <Image source={LogoImage} style={styles.logoImage} />
                        <View style={styles.titleTextContainer}>
                            <Text style={styles.title}>PakeSewa</Text>
                            <Text style={styles.subtitle}>Sewa barang yang anda butuhkan</Text>
                        </View>
                    </View>
                    <View style={styles.headerIconsRight}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Saved')}>
                            <Icon name="heart-o" color="white" size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, styles.cartButton]} onPress={() => navigation.navigate('Cart')} >
                            <Icon name="shopping-cart" color="white" size={22} />
                            {!cartLoading && cartEntries.length > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{cartEntries.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.searchBox} onPress={handleSearchPress} activeOpacity={0.8}>
                    <Icon name="search" color={COLORS.textMuted} size={16} style={styles.searchIcon} />
                    <Text style={styles.searchInputPlaceholder}>Cari barang...</Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat} onPress={() => handleCategoryChange(cat)}
                            style={[ styles.categoryButton, selectedCategory === cat && { backgroundColor: getCategoryInfo(cat).color }, ]}
                        >
                            <Text style={[ styles.categoryText, selectedCategory === cat && styles.categoryTextActive ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main Content */}
            <ScrollView style={styles.content} ref={contentScrollViewRef}>
                {/* Section Header (Sudah Benar) */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Icon name={getCategoryInfo(selectedCategory).icon} color={getCategoryInfo(selectedCategory).color} size={16} />
                        <Text style={styles.sectionTitle}>
                            {selectedCategory === 'Trending' ? ' Barang Populer' : ` ${selectedCategory}` }
                        </Text>
                    </View>
                </View>

                {/* Item List (Rendering sudah benar) */}
                {isLoadingProducts ? (
                    <ActivityIndicator style={styles.loadingIndicator} size="large" color={COLORS.primary} />
                ) : filteredItems.length > 0 ? (
                    filteredItems.map((item: ApiProduct) => ( // item adalah ApiProduct
                        <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleNavigateToDetail(item)} activeOpacity={0.8} >

                            {/* Gambar dari URL */}
                            {item.imageUrl ? (
                                <Image
                                source={{ uri: `${API_URL}/images/${item.imageUrl}` }}
                                style={styles.image}
                                resizeMode="cover"
                                onError={(e) => console.log('HomeScreen Image Load Error:', e.nativeEvent.error)}
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Icon name="photo" size={50} color={COLORS.border} />
                                </View>
                            )}

                            {/* Badges */}
                            <View style={[styles.categoryBadge, styles.categoryBadgeRight, { backgroundColor: getCategoryInfo(item.category).color }]}>
                                <Icon name={getCategoryInfo(item.category).icon} color="white" size={10} />
                                <Text style={styles.badgeText}> {item.category || 'Lainnya'}</Text>
                            </View>
                            {item.trending && ( <View style={styles.trendingBadge}><Icon name="line-chart" color="white" size={10} /><Text style={styles.badgeText}> Trending</Text></View> )}

                            {/* Like Button */}
                            <TouchableOpacity
                                style={styles.likeButton}
                                onPress={() => handleLikePress(item.id)}
                                onPressOut={(e) => e.stopPropagation()}
                                activeOpacity={0.7}
                                disabled={likesLoading}
                            >
                                {likesLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.danger} />
                                ) : (
                                    <Icon name="heart" size={18} color={likedIds.includes(item.id) ? COLORS.danger : 'white'} />
                                )}
                            </TouchableOpacity>

                            {/* Card Body */}
                            <View style={styles.cardBody}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitleContainer}>
                                        <Text style={styles.cardTitle}>{item.name}</Text>
                                        <View style={styles.locationRow}>
                                            <Icon name="map-marker" size={14} color={COLORS.textMuted} />
                                            <Text style={styles.locationText}>{item.location || 'Lokasi tidak diketahui'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.ratingBox}>
                                        <Icon name="star" size={12} color={COLORS.starActive} />
                                        <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
                                    </View>
                                </View>
                                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.categoryTag}>{item.category || 'Lainnya'}</Text>
                                    <View style={styles.reviewRow}>
                                        <Icon name="users" size={12} color={COLORS.textMuted} />
                                        <Text style={styles.reviewText}> {item.reviews || 0} ulasan</Text>
                                    </View>
                                </View>
                                <View style={styles.cardDivider}/>
                                <View style={styles.priceActionRow}>
                                    {/* Harga (format dari angka) */}
                                    <Text style={styles.priceText}>
                                        <Text style={styles.priceHighlight}>Rp {item.price.toLocaleString('id-ID')}</Text>
                                        {item.period ? ` ${item.period}` : ''}
                                    </Text>
                                    <View style={styles.actionButtonsContainer}>
                                        {/* Tombol Cart (memanggil handler yang sudah diperbaiki) */}
                                        <TouchableOpacity
                                            style={styles.cartIconContainer}
                                            onPress={() => handleAddToCartAndNavigate(item)} // <-- Panggil handler yg benar
                                            onPressOut={(e) => e.stopPropagation()}
                                            activeOpacity={0.7}
                                            disabled={cartLoading}
                                        >
                                           {cartLoading ? (
                                                <ActivityIndicator size="small" color={COLORS.primary} />
                                            ) : (
                                                <Icon name="cart-plus" color={COLORS.primary} size={20} />
                                            )}
                                        </TouchableOpacity>
                                        {/* Tombol Sewa (memanggil handler yang sudah diperbaiki) */}
                                        <TouchableOpacity style={styles.rentButton} onPress={() => handleNavigateToDetail(item)}> 
                                            <Text style={styles.rentButtonText}>Sewa</Text>
                                            <Icon name="chevron-right" color="white" size={14} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    // Tampilkan pesan jika tidak ada item setelah loading selesai
                    !isLoadingProducts && <Text style={styles.noItemsText}>Tidak ada barang yang tersedia untuk kategori ini.</Text>
                )}
                {/* Spacer agar tidak tertutup bottom nav */}
                <View style={styles.contentSpacer} />
            </ScrollView>

            {/* Bottom Nav (UI Sudah Benar) */}
            <View style={styles.bottomNav}>
                {[
                    { icon: 'cube', id: 'home' as TabId },
                    { icon: 'compass', id: 'explore' as TabId },
                    { icon: 'bell-o', id: 'saved' as TabId }, // Icon bell untuk notifikasi
                    { icon: 'user', id: 'profile' as TabId },
                ].map(navItem => (
                    <TouchableOpacity key={navItem.id}
                        onPress={() => {
                            if (navItem.id === 'home' || navItem.id === 'explore') {
                                setActiveTab(navItem.id);
                                if (navItem.id === 'home' && activeTab === 'home') {
                                    contentScrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                }
                            }
                            else if (navItem.id === 'saved') {
                                // Ganti navigasi 'saved' ke Notifications (sesuai App.tsx)
                                navigation.navigate('Notifications');
                            }
                            // else handle profile (misal: navigation.navigate('Profile'))
                        }}
                        style={styles.navItem} >
                        <Icon name={navItem.icon} color={activeTab === navItem.id ? COLORS.primary : COLORS.textMuted} size={22} />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

// Styles (Tidak ada perubahan signifikan, sudah bagus)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderColor: COLORS.border },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    logoTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 15, },
    logoImage: { width: 38, height: 38, borderRadius: 10, marginRight: 10, backgroundColor: COLORS.card, },
    titleTextContainer: {},
    title: { fontSize: 20, fontWeight: 'bold', color: '#67e8f9', lineHeight: 22, },
    subtitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 1, },
    headerIconsRight: { flexDirection: 'row', alignItems: 'center', },
    iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginLeft: 10, },
    cartButton: { backgroundColor: COLORS.primary, },
    cartBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: COLORS.danger, borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', zIndex: 10, },
    cartBadgeText: { color: 'white', fontSize: 9, fontWeight: 'bold', },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, height: 44, },
    searchIcon: { marginRight: 10 },
    searchInputPlaceholder: { color: COLORS.textMuted, flex: 1, fontSize: 14, paddingVertical: 10, },
    categoryScroll: { paddingBottom: 4 },
    categoryButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 10, height: 38, justifyContent: 'center', },
    categoryText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
    categoryTextActive: { color: COLORS.textPrimary, fontWeight: '600' },
    content: { flex: 1, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 16, },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', marginLeft: 8 },
    card: { backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', },
    imagePlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.background, // Sedikit beda dari card
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
       width: '100%',
       height: 180,
    },
    categoryBadge: { position: 'absolute', top: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, zIndex: 10, },
    categoryBadgeRight: { right: 12, },
    trendingBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249, 115, 22, 0.8)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, zIndex: 10, },
    badgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
    likeButton: { position: 'absolute', top: 132, right: 12, backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 18, width: 36, height: 36, justifyContent: 'center', alignItems: 'center', zIndex: 10, },
    cardBody: { padding: 14 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    cardTitleContainer: { flex: 1, marginRight: 8 },
    cardTitle: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 17, marginBottom: 2 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationText: { color: COLORS.textMuted, fontSize: 12, marginLeft: 6 },
    ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.border, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, },
    ratingText: { color: COLORS.textPrimary, fontSize: 12, marginLeft: 4 },
    description: { color: COLORS.textSecondary, fontSize: 13, marginVertical: 8, lineHeight: 19 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, },
    categoryTag: { backgroundColor: COLORS.border, color: COLORS.textSecondary, fontSize: 11, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, overflow: 'hidden', },
    reviewRow: { flexDirection: 'row', alignItems: 'center' },
    reviewText: { color: COLORS.textMuted, fontSize: 11, marginLeft: 4 },
    cardDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12, },
    priceActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    actionButtonsContainer: { flexDirection: 'row', alignItems: 'center', },
    priceText: { fontSize: 13, color: COLORS.textMuted },
    priceHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 18, marginRight: 4 },
    cartIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: 8, },
    rentButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, },
    rentButtonText: { color: 'white', fontSize: 13, fontWeight: '600', marginRight: 6 },
    bottomNav: {
        flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1,
        borderColor: COLORS.card, paddingTop: 10, backgroundColor: COLORS.background, paddingBottom: 5
    },
    navItem: { alignItems: 'center', flex: 1, paddingBottom: 5 },
    noItemsText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14, },
    contentSpacer: { height: 60 },
    loadingIndicator: { marginTop: 50 },
});