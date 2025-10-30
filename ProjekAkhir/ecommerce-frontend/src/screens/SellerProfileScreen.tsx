// File: src/screens/SellerProfileScreen.tsx (FIXED)

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

// --- PERBAIKAN: Hapus impor 'RentalItem' dan 'Seller' ---
// Tipe-tipe ini tidak lagi dibutuhkan
// import type { RentalItem, Seller } from '../../src/types';
// --- AKHIR PERBAIKAN ---

// =======================================================
// Tentukan URL API ANDA
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
  seller: ApiSeller; // Perhatikan, seller di dalam produk juga harus 'ApiSeller'
};
// --- End Tipe Baru ---


type SellerProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SellerProfile'
>;

export default function SellerProfileScreen({
  route,
  navigation,
}: SellerProfileScreenProps) {
  
  // --- PERBAIKAN: Dapatkan 'seller' langsung dari params.
  // Tipe 'ApiSeller' sudah diinfer dari 'SellerProfileScreenProps'
  const { seller } = route.params;
  // --- AKHIR PERBAIKAN ---

  const [allSellerProducts, setAllSellerProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect untuk mengambil data produk seller dari API
  useEffect(() => {
    const fetchSellerProducts = async () => {
      // Pastikan seller dan seller.id ada
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

  // Logika useMemo (Tidak berubah)
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

  // --- PERBAIKAN: Hapus fungsi 'convertToLegacyItem' ---
  // Fungsi ini tidak lagi diperlukan karena DetailScreen mengambil datanya sendiri via ID.
  // const convertToLegacyItem = ... (DIHAPUS)
  // --- AKHIR PERBAIKAN ---

  // Render satu produk di grid
  const renderProduct = ({ item }: { item: ApiProduct }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        // --- PERBAIKAN: Navigasi menggunakan 'productId' ---
        navigation.push('Detail', { productId: item.id });
        // --- AKHIR PERBAIKAN ---
      }}
    >
      {/* --- Gambar URL (Sudah Benar) --- */}
      {item.imageUrl ? (
        <Image
          source={{ uri: `${API_URL}/images/${item.imageUrl}` }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(e) => console.log('Image Load Error (Seller Profile):', e.nativeEvent.error, `${API_URL}/images/${item.imageUrl}`)}
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Icon name="photo" size={40} color={COLORS.border} />
        </View>
      )}
      {/* --- AKHIR GAMBAR --- */}

      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>
        {`Rp ${item.price.toLocaleString('id-ID')}${item.period || ''}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header (Tidak berubah) */}
      <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{seller.name}</Text>
          <View style={styles.headerSpacer} />
      </View>

      {/* Tampilkan loading spinner */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22d3ee" />
        </View>
      ) : (
        /* Tampilkan konten utama jika tidak loading */
        <FlatList
          ListHeaderComponent={
            <>
              {/* HERO SECTION (Data dari route.params) */}
              <View style={styles.hero}>
                <Image
                  // --- PERBAIKAN GAMBAR: Bangun URL Avatar ---
                  // Asumsi avatar adalah URL lengkap atau nama file.
                  // Jika avatar adalah nama file, gunakan buildImageUri helper.
                  // Untuk saat ini, kita anggap 'seller.avatar' adalah URL LENGKAP
                  // atau null/undefined.
                  source={seller.avatar ? { uri: seller.avatar } : require('../assets/images/avatar-placeholder.png')}
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
                      sellerAvatar: seller.avatar || undefined,
                    })
                   }
                >
                  <Icon name="comments" color="white" size={16} />
                  <Text style={styles.chatButtonText}>Chat Penjual</Text>
                </TouchableOpacity>
              </View>

              {/* STATS (Tidak berubah) */}
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

              {/* BIO (Tidak berubah) */}
              <View style={styles.bioBox}>
                <Text style={styles.sectionTitle}>Tentang Toko</Text>
                <Text style={styles.bioText}>{seller.bio || 'Tidak ada deskripsi.'}</Text>
              </View>

              {/* KATEGORI PRODUK (Tidak berubah) */}
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

              {/* PESAN SAAT KATEGORI KOSONG (Tidak berubah) */}
              {filteredProducts.length === 0 && selectedCategory !== 'Semua' && (
                  <Text style={styles.noProductText}>
                    Tidak ada produk dalam kategori '{selectedCategory}'.
                  </Text>
                )}

              {/* JUDUL DAFTAR PRODUK (Tidak berubah) */}
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
      )}
    </SafeAreaView>
   );
}

const { width: screenWidth } = Dimensions.get('window');

// --- Define COLORS (Lokal untuk Styles) ---

const COLORS = {
  background: '#0f172a',
  card: '#1e293b',
  textPrimary: 'white',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  primary: '#06b6d4',
  cyan: '#22d3ee',
};
// --- End COLORS ---

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border, },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  headerSpacer: { width: 30 },
  hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, backgroundColor: COLORS.card, }, // Card bg for hero
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primary, marginBottom: 12 },
  sellerName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', textAlign: 'center', },
  sellerSubtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 4, textAlign: 'center', },
  chatButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 16, },
  chatButtonText: { color: 'white', marginLeft: 8, fontWeight: '600', fontSize: 14, },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 16, backgroundColor: COLORS.background }, // Bg default
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { color: COLORS.cyan, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  bioBox: { backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 12, padding: 16, },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8, },
  bioText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  sectionTitleSpacing: { marginHorizontal: 16, marginTop: 24, marginBottom: 16 },
  categoryScroll: { paddingHorizontal: 16, paddingBottom: 10, flexGrow: 0 },
  categoryButton: { borderWidth: 1, borderColor: COLORS.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, height: 40, justifyContent: 'center', backgroundColor: COLORS.card }, // card bg
  categoryButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, },
  categoryText: { color: COLORS.textMuted, fontSize: 14 },
  categoryTextActive: { color: COLORS.textPrimary, fontWeight: '600' },
  productListTitle: { marginHorizontal: 16, marginBottom: 16, fontSize: 16, color: COLORS.textPrimary, fontWeight: '600', },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 16 }, // Padding untuk spasi antar kolom
  listContent: { paddingBottom: 16, paddingTop: 0 }, // Atur padding list
  productCard: { backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 16, width: screenWidth / 2 - 24, // Lebar kartu = (lebar layar / 2) - (total padding horizontal / 2) - margin
    overflow: 'hidden', },
  productImagePlaceholder: { width: '100%', height: 120, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', },
  productImage: { width: '100%', height: 120, }, // Style untuk gambar dari URL
  productName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', paddingHorizontal: 10, marginTop: 8, marginBottom: 4, height: 36, // Beri tinggi tetap untuk 2 baris
  },
  productPrice: { color: COLORS.cyan, fontSize: 13, paddingHorizontal: 10, paddingBottom: 10, },
  noProductText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 20, marginBottom: 20, paddingHorizontal: 16, fontSize: 14, },
});