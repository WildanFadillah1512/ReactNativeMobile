import React, { useState, useMemo } from 'react'; // Import useMemo
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView, // Keep ScrollView for horizontal categories
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
// 1. Import Tipe RentalItem dan Data Asli dari file data/products.ts
import type { RentalItem } from '../../src/types'; // Sesuaikan path jika perlu
// --- FIX: Import data dari file terpisah ---
import { allRentalProducts } from '../data/product'; // Pastikan path ini benar

const { width } = Dimensions.get('window');

type SellerProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'SellerProfile'>;

export default function SellerProfileScreen({ route, navigation }: SellerProfileScreenProps) {
  const { seller } = route.params;

  // Filter SEMUA produk asli dari data terpisah berdasarkan ID penjual
  const allSellerProducts = useMemo(
    () => allRentalProducts.filter(item => item.seller.id === seller.id), // Gunakan allRentalProducts
    [seller.id]
  );

  // Ambil maksimal 10 produk pertama
  const sellerProducts = useMemo(
    () => allSellerProducts.slice(0, 10), // Batasi hanya 10 produk
    [allSellerProducts]
  );

  // Buat daftar kategori dinamis dari 10 produk ini + "Semua"
  const categories = useMemo(() => {
    const uniqueCategories = new Set(sellerProducts.map(item => item.category));
    const validCategories = Array.from(uniqueCategories).filter(cat => cat);
    return ['Semua', ...validCategories];
  }, [sellerProducts]);

  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Filter 10 produk penjual berdasarkan kategori yang dipilih
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Semua') {
      return sellerProducts;
    }
    return sellerProducts.filter(item => item.category === selectedCategory);
  }, [sellerProducts, selectedCategory]);

  // renderProduct (Sudah benar)
  const renderProduct = ({ item }: { item: RentalItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.push('Detail', { item: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>{item.price}{item.period}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header (Sudah benar) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{seller.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Gunakan FlatList sebagai root scroll view */}
      <FlatList
        ListHeaderComponent={
          <>
            {/* HERO SECTION (Sudah benar) */}
            <View style={styles.hero}>
              <Image source={{ uri: seller.avatar }} style={styles.avatar} />
              <Text style={styles.sellerName}>{seller.name}</Text>
              <Text style={styles.sellerSubtitle}>Toko terpercaya • {seller.rating.toFixed(1)}⭐</Text>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() =>
                  navigation.navigate('Chat', {
                    sellerId: seller.id,
                    sellerName: seller.name,
                    sellerAvatar: seller.avatar,
                  })
                }
              >
                <Icon name="comments" color="white" size={16} />
                <Text style={styles.chatButtonText}>Chat Penjual</Text>
              </TouchableOpacity>
            </View>

            {/* STATS (Sudah benar menggunakan allSellerProducts.length) */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{allSellerProducts.length}</Text>
                <Text style={styles.statLabel}>Produk</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{seller.itemsRented}+</Text>
                <Text style={styles.statLabel}>Disewa</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{seller.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>

            {/* BIO (Sudah benar) */}
            <View style={styles.bioBox}>
              <Text style={styles.sectionTitle}>Tentang Toko</Text>
              <Text style={styles.bioText}>{seller.bio}</Text>
            </View>

            {/* KATEGORI PRODUK (Sudah benar, dinamis dari 10 produk) */}
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
                  {categories.map((cat) => (
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

            {/* Pesan jika kategori kosong (Sudah benar) */}
            {filteredProducts.length === 0 && selectedCategory !== 'Semua' && (
                <Text style={styles.noProductText}>Tidak ada produk dalam kategori '{selectedCategory}'.</Text>
            )}
             {/* Judul sebelum daftar produk (Sudah benar) */}
             {filteredProducts.length > 0 && (
                <Text style={[styles.sectionTitle, styles.productListTitle]}>
                    {selectedCategory === 'Semua' ? 'Produk Toko' : `Produk ${selectedCategory}`} ({filteredProducts.length})
                </Text>
             )}
          </>
        }
        // Data untuk FlatList utama (maks 10, sudah difilter)
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        // Pesan jika tidak ada produk sama sekali (Sudah benar)
        ListEmptyComponent={
          allSellerProducts.length === 0 ? (
            <Text style={styles.noProductText}>Penjual ini belum memiliki produk.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

// Styles (Tetap Sama)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#1e293b', },
    backButton: { padding: 4, },
    headerTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
    headerSpacer: { width: 22 + 8 },
    // Hero Section
    hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, backgroundColor: '#1e293b' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#06b6d4' },
    sellerName: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
    sellerSubtitle: { color: '#94a3b8', fontSize: 14, marginTop: 4, textAlign: 'center' },
    chatButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#06b6d4', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 16, },
    chatButtonText: { color: 'white', marginLeft: 8, fontWeight: '600', fontSize: 14 },
    // Stats
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 16 },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { color: '#22d3ee', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    // Bio
    bioBox: { backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 12, padding: 16 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    bioText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
    // Kategori
    sectionTitleSpacing: { marginHorizontal: 16, marginTop: 24, marginBottom: 16 },
    categoryScroll: { paddingHorizontal: 16, marginBottom: 10, flexGrow: 0 },
    categoryButton: { borderWidth: 1, borderColor: '#334155', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, height: 40, justifyContent: 'center', },
    categoryButtonActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4', },
    categoryText: { color: '#94a3b8', fontSize: 14, },
    categoryTextActive: { color: 'white', fontWeight: '600', },
    // Judul Daftar Produk
     productListTitle: { marginHorizontal: 16, marginBottom: 16, fontSize: 16, color: 'white', fontWeight: '600', },
    // Produk Grid
    columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 16 },
    listContent: { paddingBottom: 16, paddingTop: 0 },
    productCard: { backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 16, width: (width / 2) - 24, overflow: 'hidden', },
    productImage: { width: '100%', height: 120 },
    productName: { color: 'white', fontSize: 14, fontWeight: '600', paddingHorizontal: 10, marginTop: 8, marginBottom: 4 },
    productPrice: { color: '#22d3ee', fontSize: 13, paddingHorizontal: 10, paddingBottom: 10 },
    noProductText: { color: '#94a3b8', textAlign: 'center', marginTop: 10, marginBottom: 20, paddingHorizontal: 16, fontSize: 14, },
});