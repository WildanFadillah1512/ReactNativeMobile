// File: src/screens/SellerProfileScreen.tsx (Refactored)

import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
// --- PERBAIKAN 1: Impor tipe terpusat ---
import type { ApiProduct } from '../types';
// --- AKHIR PERBAIKAN 1 ---


// =======================================================
// 🚀 KONSTANTA
// =======================================================
const API_URL = 'http://10.95.21.143:3000';

// --- PERBAIKAN 2: Pindahkan COLORS ke atas ---
const COLORS = {
    background: '#0f172a',
    card: '#1e293b',
    textPrimary: 'white',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    border: '#e2e8f0', // Border terang dari style Anda
    primary: '#06b6d4',
    cyan: '#22d3ee',
};
// --- AKHIR PERBAIKAN 2 ---


// --- PERBAIKAN 3: Tambahkan Helper buildImageUri ---
// (Helper ini idealnya ada di file utils terpisah)
const buildImageUri = (filename?: string | null): string | null => {
    if (!filename) return null;
    // Jika sudah URL lengkap, kembalikan
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    // Jika hanya nama file, tambahkan API_URL
    return `${API_URL}/images/${filename}`;
};
// --- AKHIR PERBAIKAN 3 ---


// Tipe navigasi
type SellerProfileScreenProps = NativeStackScreenProps<
    RootStackParamList,
    'SellerProfile'
>;

// Dimensi layar untuk grid
const { width: screenWidth } = Dimensions.get('window');

export default function SellerProfileScreen({
    route,
    navigation,
}: SellerProfileScreenProps) {
    
    // Dapatkan 'seller' langsung dari params.
    const { seller } = route.params;

    const [allSellerProducts, setAllSellerProducts] = useState<ApiProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect untuk mengambil data produk seller dari API
    useEffect(() => {
        const fetchSellerProducts = async () => {
            if (!seller || typeof seller.id !== 'number') {
                Alert.alert('Error', 'Data penjual tidak valid.');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/api/sellers/${seller.id}/products`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Fetch Seller Products Error:', errorText);
                    throw new Error(`Gagal mengambil data (${response.status})`);
                }
                const data: ApiProduct[] = await response.json();
                setAllSellerProducts(data);
            } catch (error) {
                console.error("Fetch Error:", error);
                Alert.alert('Error Jaringan', error instanceof Error ? error.message : 'Tidak bisa terhubung ke server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellerProducts();
    }, [seller]); // Jalankan ulang jika objek seller berubah

    // --- Memoized Logic (Filter, Kategori, dll) ---
    const displayedSellerProducts = useMemo(
        () => allSellerProducts.slice(0, 10), // Ambil 10 pertama
        [allSellerProducts]
    );

    const categories = useMemo(() => {
        const uniqueCategories = new Set(allSellerProducts.map(item => item.category).filter(Boolean) as string[]);
        return ['Semua', ...Array.from(uniqueCategories)];
    }, [allSellerProducts]);

    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'Semua') return displayedSellerProducts;
        return displayedSellerProducts.filter(item => item.category === selectedCategory);
    }, [displayedSellerProducts, selectedCategory]);

    
    // --- Render Functions ---

    // Render satu produk di grid
    const renderProduct = ({ item }: { item: ApiProduct }) => {
        // --- PERBAIKAN 4: Gunakan buildImageUri ---
        const imageUrl = buildImageUri(item.imageUrl);
        
        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => {
                    // Navigasi HANYA menggunakan 'productId'
                    navigation.push('Detail', { productId: item.id });
                }}
            >
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                        onError={(e) => console.log('Image Load Error (Seller Profile):', e.nativeEvent.error, imageUrl)}
                    />
                ) : (
                    <View style={styles.productImagePlaceholder}>
                        <Icon name="photo" size={40} color={COLORS.card} />
                    </View>
                )}

                <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.productPrice}>
                    {`Rp ${item.price.toLocaleString('id-ID')}${item.period || ''}`}
                </Text>
            </TouchableOpacity>
        );
    };

    // --- Main Render ---

    // Tampilkan loading spinner
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                 <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={22} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{seller.name}</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.cyan} />
                </View>
            </SafeAreaView>
        );
    }

    // --- PERBAIKAN 5: Gunakan buildImageUri untuk Avatar ---
    const sellerAvatarUrl = buildImageUri(seller.avatar);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <FlatList
                ListHeaderComponent={
                    <>
                        {/* HERO SECTION (Data dari route.params) */}
                        <View style={styles.hero}>
                            {/* Header ditaruh di dalam ListHeaderComponent */}
                            <View style={styles.header}>
                                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                    <Icon name="arrow-left" size={22} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>{seller.name}</Text>
                                <View style={styles.headerSpacer} />
                            </View>
                            
                            <Image
                                source={sellerAvatarUrl ? { uri: sellerAvatarUrl } : require('../assets/images/avatar-placeholder.png')}
                                style={styles.avatar}
                                onError={() => console.log("Gagal memuat avatar seller")}
                            />
                            <Text style={styles.sellerName}>{seller.name}</Text>
                            <Text style={styles.sellerSubtitle}>
                                {`Toko terpercaya • ${(seller.rating ?? 0).toFixed(1)}⭐`}
                            </Text>
                            <TouchableOpacity
                                style={styles.chatButton}
                                onPress={() =>
                                    navigation.navigate('Chat', {
                                        sellerId: seller.id,
                                        sellerName: seller.name,
                                        // --- PERBAIKAN 6: Kirim URL avatar yang sudah valid ---
                                        sellerAvatar: sellerAvatarUrl || undefined,
                                    })
                                }
                            >
                                <Icon name="comments" color="white" size={16} />
                                <Text style={styles.chatButtonText}>Chat Penjual</Text>
                            </TouchableOpacity>
                        </View>

                        {/* STATS */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{allSellerProducts.length.toString()}</Text>
                                <Text style={styles.statLabel}>Produk</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{`${seller.itemsRented ?? 0}+`}</Text>
                                <Text style={styles.statLabel}>Disewa</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{(seller.rating ?? 0).toFixed(1)}</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                        </View>

                        {/* BIO */}
                        <View style={styles.bioBox}>
                            <Text style={styles.sectionTitle}>Tentang Toko</Text>
                            <Text style={styles.bioText}>{seller.bio || 'Tidak ada deskripsi.'}</Text>
                        </View>

                        {/* KATEGORI PRODUK */}
                        {categories.length > 1 && (
                            <>
                                <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
                                    Kategori Produk
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.categoryScroll}
                                >
                                    {categories.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryButton,
                                                selectedCategory === cat && styles.categoryButtonActive,
                                            ]}
                                            onPress={() => setSelectedCategory(cat)}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryText,
                                                    selectedCategory === cat && styles.categoryTextActive,
                                                ]}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* PESAN SAAT KATEGORI KOSONG */}
                        {filteredProducts.length === 0 && selectedCategory !== 'Semua' && (
                            <Text style={styles.noProductText}>
                                Tidak ada produk dalam kategori '{selectedCategory}'.
                            </Text>
                        )}

                        {/* JUDUL DAFTAR PRODUK */}
                        {filteredProducts.length > 0 && (
                            <Text style={[styles.sectionTitle, styles.productListTitle]}>
                                {selectedCategory === 'Semua' ? 'Produk Toko' : `Produk ${selectedCategory}`} ({filteredProducts.length})
                            </Text>
                        )}
                    </>
                } // Akhir ListHeaderComponent
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    allSellerProducts.length === 0 ? (
                        <Text style={styles.noProductText}>
                            Penjual ini belum memiliki produk.
                        </Text>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}


// =======================================================
// 🎨 STYLES (DIRAPIKAN & DIKELOMPOKKAN)
// =======================================================
const styles = StyleSheet.create({
    // --- 1. Core Layout & Loading ---
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background 
    },
    loadingContainer: { 
        flex: 1, // Gunakan flex 1 agar mengisi sisa ruang
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.background, 
    },

    // --- 2. Header (Sekarang bagian dari Hero) ---
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        // Hapus border, karena sekarang menyatu dengan hero
        // borderBottomWidth: 1, 
        // borderColor: COLORS.border, 
        width: '100%', // Pastikan lebar penuh di dalam hero
        position: 'absolute', // Posisikan di atas hero
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10, // Pastikan di atas
    },
    backButton: { 
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.3)', // Latar belakang agar terlihat
        borderRadius: 20,
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: COLORS.textPrimary,
        // Judul sekarang di tengah (backButton dan spacer menyeimbangkan)
    },
    headerSpacer: { 
        width: 30 // Sesuaikan dengan ukuran backButton
    },

    // --- 3. Hero Section (Info Penjual) ---
    hero: { 
        alignItems: 'center', 
        paddingVertical: 24, 
        paddingHorizontal: 16, 
        backgroundColor: COLORS.card, 
        paddingTop: 80, // Beri ruang untuk header absolut
    },
    avatar: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        borderWidth: 3, 
        borderColor: COLORS.primary, 
        marginBottom: 12 
    },
    sellerName: { 
        color: COLORS.textPrimary, 
        fontSize: 22, 
        fontWeight: 'bold', 
        textAlign: 'center', 
    },
    sellerSubtitle: { 
        color: COLORS.textMuted, 
        fontSize: 14, 
        marginTop: 4, 
        textAlign: 'center', 
    },
    chatButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.primary, 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderRadius: 10, 
        marginTop: 16, 
    },
    chatButtonText: { 
        color: 'white', 
        marginLeft: 8, 
        fontWeight: '600', 
        fontSize: 14, 
    },

    // --- 4. Stats Row ---
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        paddingVertical: 20, 
        paddingHorizontal: 16, 
        backgroundColor: COLORS.background 
    },
    statBox: { 
        alignItems: 'center', 
        flex: 1 
    },
    statValue: { 
        color: COLORS.cyan, 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    statLabel: { 
        color: COLORS.textMuted, 
        fontSize: 13, 
        marginTop: 4 
    },

    // --- 5. Bio Section ---
    bioBox: { 
        backgroundColor: COLORS.card, 
        marginHorizontal: 16, 
        borderRadius: 12, 
        padding: 16, 
    },
    bioText: { 
        color: COLORS.textSecondary, 
        fontSize: 14, 
        lineHeight: 20 
    },

    // --- 6. Category Filter ---
    categoryScroll: { 
        paddingHorizontal: 16, 
        paddingBottom: 10, 
    },
    categoryButton: { 
        borderWidth: 1, 
        borderColor: COLORS.border, 
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        borderRadius: 20, 
        marginRight: 10, 
        height: 40, 
        justifyContent: 'center', 
        backgroundColor: COLORS.card 
    },
    categoryButtonActive: { 
        backgroundColor: COLORS.primary, 
        borderColor: COLORS.primary, 
    },
    categoryText: { 
        color: COLORS.textMuted, 
        fontSize: 14 
    },
    categoryTextActive: { 
        color: COLORS.textPrimary, 
        fontWeight: '600' 
    },
    
    // --- 7. Product List / Grid ---
    listContent: { 
        paddingBottom: 16, 
        paddingTop: 0 
    },
    columnWrapper: { 
        justifyContent: 'space-between', 
        paddingHorizontal: 16 
    },
    productCard: { 
        backgroundColor: COLORS.card, 
        borderRadius: 12, 
        marginBottom: 16, 
        width: screenWidth / 2 - 24, // (lebar layar / 2) - (paddingWrapper / 2)
        overflow: 'hidden', 
    },
    productImagePlaceholder: { 
        width: '100%', 
        height: 120, 
        backgroundColor: COLORS.background, // Latar belakang placeholder
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    productImage: { 
        width: '100%', 
        height: 120, 
    },
    productName: { 
        color: COLORS.textPrimary, 
        fontSize: 14, 
        fontWeight: '600', 
        paddingHorizontal: 10, 
        marginTop: 8, 
        marginBottom: 4, 
        height: 36, // Paksa 2 baris
    },
    productPrice: { 
        color: COLORS.cyan, 
        fontSize: 13, 
        paddingHorizontal: 10, 
        paddingBottom: 10, 
    },

    // --- 8. Utility & Shared Styles ---
    sectionTitle: { 
        color: COLORS.textPrimary, 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 8, 
    },
    // Varian sectionTitle dengan margin horizontal & atas
    sectionTitleSpacing: { 
        marginHorizontal: 16, 
        marginTop: 24, 
        marginBottom: 16 
    },
    // Varian sectionTitle untuk judul list produk
    productListTitle: { 
        marginHorizontal: 16, 
        marginBottom: 16, 
        fontSize: 16, 
        color: COLORS.textPrimary, 
        fontWeight: '600', 
    },
    // Teks untuk state kosong (tidak ada produk)
    noProductText: { 
        color: COLORS.textMuted, 
        textAlign: 'center', 
        marginTop: 20, 
        marginBottom: 20, 
        paddingHorizontal: 16, 
        fontSize: 14, 
    },
});