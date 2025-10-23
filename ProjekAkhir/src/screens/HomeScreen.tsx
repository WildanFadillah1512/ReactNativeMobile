// File: HomeScreen.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, ScrollView, TextInput,
    StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useIsFocused, type RouteProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
// FIX: Pastikan path ke data produk benar
import { allRentalProducts } from '../data/product'; // Pastikan nama file 'products.ts' atau 'product.ts'
import type { RentalItem } from '../types';
import { useLikes } from '../context/LikeContext';
import { useCart } from '../context/CartContext'; // Import useCart yang sudah diupdate

// Import Gambar Lokal
const LogoImage = require('../assets/images/logo.png'); // Pastikan path benar

type TabId = 'home' | 'explore' | 'saved' | 'profile';
type HomeRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const homeScreenItems = allRentalProducts;

// --- Define COLORS ---
const COLORS = {
    background: '#0f172a',
    card: '#1e293b',
    textPrimary: 'white',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    primary: '#06b6d4', // Biru-Toska
    danger: '#ef4444', // Merah
    border: '#334155', // Abu-abu gelap
    // FIX: Tambahkan warna bintang
    starActive: '#facc15', // Kuning untuk rating aktif
    // Category colors (match getCategoryInfo)
    trending: '#f97316',
    outdoor: '#14b8a6',
    elektronik: '#6366f1',
    perlengkapan: '#eab308',
    kendaraan: '#ef4444',
    defaultCategory: '#cbd5e1',
};
// --- End COLORS ---


export default function HomeScreen({ navigation }: HomeScreenProps) {
    const route = useRoute<HomeRouteProp>();
    const isFocused = useIsFocused();
    const routeActiveTabId = route.params?.activeTabId;

    const [activeTab, setActiveTab] = useState<TabId>(routeActiveTabId || 'home');

    useEffect(() => {
        if (isFocused && routeActiveTabId) {
            setActiveTab(routeActiveTabId);
        }
    }, [isFocused, routeActiveTabId]);

    // Context Hooks
    const { likedIds, toggleLike, isLoading: likesLoading } = useLikes();
    const { cartEntries, addToCart, isLoading: cartLoading } = useCart();

    const [selectedCategory, setSelectedCategory] = useState<string>('Trending');
    const contentScrollViewRef = useRef<ScrollView>(null);
    const categories = ['Trending', 'Outdoor', 'Elektronik', 'Perlengkapan', 'Kendaraan'];

    // --- FIX: Implementasi logika filter ---
    const filteredItems = useMemo(() => {
        if (selectedCategory === 'Trending') {
            return homeScreenItems.filter(item => item.trending);
        }
        return homeScreenItems.filter(item => item.category === selectedCategory);
    }, [selectedCategory]);
    // ------------------------------------

    // --- FIX: Implementasi logika getCategoryInfo ---
    const getCategoryInfo = (cat: string) => { // 'cat' sekarang digunakan
        switch (cat) {
            case 'Trending': return { icon: 'line-chart', color: COLORS.trending };
            case 'Outdoor': return { icon: 'tree', color: COLORS.outdoor };
            case 'Elektronik': return { icon: 'camera', color: COLORS.elektronik };
            case 'Perlengkapan': return { icon: 'wrench', color: COLORS.perlengkapan };
            case 'Kendaraan': return { icon: 'bicycle', color: COLORS.kendaraan };
            default: return { icon: 'tag', color: COLORS.defaultCategory };
        }
    };
    // -------------------------------------------

    // Add to Cart and Navigate
    const handleAddToCartAndNavigate = async (item: RentalItem) => {
        try {
            const added = await addToCart(item);
            if (added) {
                Alert.alert("Ditambahkan", `${item.name} berhasil ditambahkan ke keranjang.`);
            } else {
                Alert.alert( "Sudah di Keranjang", `${item.name} sudah ada. Lihat keranjang?`,
                    [ { text: "Tidak", style: "cancel" }, { text: "Ya, Lihat", onPress: () => navigation.navigate('Cart') } ]
                );
            }
        } catch (error) {
            console.error("Gagal menambahkan ke keranjang:", error);
            Alert.alert("Gagal", "Tidak dapat menambahkan item.");
        }
    };

    // Ganti Kategori
    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        contentScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };
    // Navigasi Detail
    const handleNavigateToDetail = (item: RentalItem) => { navigation.navigate('Detail', { item }); };
    // Handle Like
    const handleLikePress = async (id: number) => {
        try { await toggleLike(id); } catch (error) {
            console.error("Gagal update like:", error);
            Alert.alert("Gagal", "Tidak dapat menyimpan perubahan suka.");
        }
     };


    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
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
                         <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Buka Notifikasi')}>
                             <Icon name="bell-o" color="white" size={22} />
                         </TouchableOpacity>
                         <TouchableOpacity style={[styles.iconButton, styles.cartButton]} onPress={() => navigation.navigate('Cart')} >
                             <Icon name="shopping-cart" color="white" size={22} />
                             {/* Gunakan cartEntries.length */}
                             {!cartLoading && cartEntries.length > 0 && (
                                 <View style={styles.cartBadge}>
                                     <Text style={styles.cartBadgeText}>{cartEntries.length}</Text>
                                 </View>
                             )}
                         </TouchableOpacity>
                     </View>
                </View>
                <View style={styles.searchBox}>
                   <Icon name="search" color={COLORS.textMuted} size={16} style={styles.searchIcon} />
                   <TextInput placeholder="Cari barang..." placeholderTextColor={COLORS.textMuted} style={styles.searchInput} />
                </View>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                     {categories.map((cat) => (
                         <TouchableOpacity
                             key={cat} onPress={() => handleCategoryChange(cat)}
                             // FIX: Gunakan warna dari getCategoryInfo
                             style={[ styles.categoryButton, selectedCategory === cat && { backgroundColor: getCategoryInfo(cat).color }, ]}
                         >
                             <Text style={[ styles.categoryText, selectedCategory === cat && styles.categoryTextActive ]}>{cat}</Text>
                         </TouchableOpacity>
                     ))}
                 </ScrollView>
            </View>

            {/* Main Content */}
            <ScrollView style={styles.content} ref={contentScrollViewRef}>
                 <View style={styles.sectionHeader}>
                     <View style={styles.sectionTitleRow}>
                         {/* FIX: Gunakan icon dan color */}
                         <Icon name={getCategoryInfo(selectedCategory).icon} color={getCategoryInfo(selectedCategory).color} size={16} />
                         <Text style={styles.sectionTitle}>
                             {selectedCategory === 'Trending' ? ' Barang Populer' : ` ${selectedCategory}` }
                         </Text>
                     </View>
                 </View>

                {/* Item List */}
                {(likesLoading || cartLoading) ? (
                    <ActivityIndicator style={styles.loadingIndicator} size="large" color={COLORS.primary} />
                // --- FIX: Gunakan filteredItems.length ---
                ) : filteredItems.length > 0 ? (
                    filteredItems.map((item: RentalItem) => (
                        <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleNavigateToDetail(item)} activeOpacity={0.8} >
                            <Image source={{ uri: item.image }} style={styles.image} />
                             {/* Badges */}
                             <View style={[styles.categoryBadge, styles.categoryBadgeRight, { backgroundColor: getCategoryInfo(item.category).color }]}>
                                 <Icon name={getCategoryInfo(item.category).icon} color="white" size={10} />
                                 <Text style={styles.badgeText}> {item.category}</Text>
                             </View>
                             {item.trending && ( <View style={styles.trendingBadge}><Icon name="line-chart" color="white" size={10} /><Text style={styles.badgeText}> Trending</Text></View> )}

                            {/* Like Button */}
                            <TouchableOpacity style={styles.likeButton} onPress={() => handleLikePress(item.id)} onPressOut={(e) => e.stopPropagation()} activeOpacity={0.7} >
                                <Icon name="heart" size={18} color={likedIds.includes(item.id) ? COLORS.danger : 'white'} />
                            </TouchableOpacity>

                            {/* Card Body */}
                            <View style={styles.cardBody}>
                                 <View style={styles.cardHeader}>
                                     <View style={styles.cardTitleContainer}>
                                         <Text style={styles.cardTitle}>{item.name}</Text>
                                         <View style={styles.locationRow}><Icon name="map-marker" size={14} color={COLORS.textMuted} /><Text style={styles.locationText}>{item.location}</Text></View>
                                     </View>
                                     {/* FIX: Gunakan COLORS.starActive */}
                                     <View style={styles.ratingBox}><Icon name="star" size={12} color={COLORS.starActive} /><Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text></View>
                                 </View>
                                 <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                                 <View style={styles.cardFooter}>
                                     <Text style={styles.categoryTag}>{item.category}</Text>
                                     <View style={styles.reviewRow}><Icon name="users" size={12} color={COLORS.textMuted} /><Text style={styles.reviewText}> {item.reviews} ulasan</Text></View>
                                 </View>
                                 <View style={styles.cardDivider}/>
                                 <View style={styles.priceActionRow}>
                                     <Text style={styles.priceText}><Text style={styles.priceHighlight}>{item.price}</Text>{item.period}</Text>
                                     <View style={styles.actionButtonsContainer}>
                                         <TouchableOpacity style={styles.cartIconContainer} onPress={() => handleAddToCartAndNavigate(item)} onPressOut={(e) => e.stopPropagation()} activeOpacity={0.7} >
                                             <Icon name="cart-plus" color={COLORS.primary} size={20} />
                                         </TouchableOpacity>
                                         <View style={styles.rentButton}>
                                             <Text style={styles.rentButtonText}>Sewa</Text>
                                             <Icon name="chevron-right" color="white" size={14} />
                                         </View>
                                     </View>
                                 </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : ( <Text style={styles.noItemsText}>Tidak ada barang dalam kategori ini.</Text> )}

                <View style={styles.contentSpacer} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                 {[ { icon: 'cube', id: 'home' as TabId }, { icon: 'compass', id: 'explore' as TabId }, { icon: 'heart', id: 'saved' as TabId }, { icon: 'user', id: 'profile' as TabId }, ].map(navItem => (
                     <TouchableOpacity key={navItem.id}
                        onPress={() => {
                            if (navItem.id === 'home' || navItem.id === 'explore') setActiveTab(navItem.id);
                            else if (navItem.id === 'saved') navigation.navigate('Saved');
                            // else handle profile
                        }} style={styles.navItem} >
                         <Icon name={navItem.icon} color={activeTab === navItem.id ? COLORS.primary : COLORS.textMuted} size={22} />
                     </TouchableOpacity>
                 ))}
            </View>
        </SafeAreaView>
    );
}

// Styles
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
    searchInput: { color: COLORS.textPrimary, flex: 1, fontSize: 14 },
    categoryScroll: { paddingBottom: 4 },
    categoryButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 10, height: 38, justifyContent: 'center', },
    categoryText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
    categoryTextActive: { color: COLORS.textPrimary, fontWeight: '600' },
    content: { flex: 1, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 16, },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', marginLeft: 8 },
    linkText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
    card: { backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', },
    image: { width: '100%', height: 180 },
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
    bottomNav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderColor: COLORS.card, paddingTop: 10, paddingBottom: 8, backgroundColor: COLORS.background, },
    navItem: { alignItems: 'center', flex: 1 },
    noItemsText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14, },
    contentSpacer: { height: 60 },
    loadingIndicator: { marginTop: 50 },
});