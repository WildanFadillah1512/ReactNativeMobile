import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Impor dari struktur proyek Anda
import { COLORS } from '../config/theme';
import apiClient, { BASE_URL } from '../config/api';

// Impor Tipe Navigasi
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ApiProduct } from '../types';

// Tipe untuk data baru dari API
type Category = { id: number; name: string; imageUrl: string };
type Location = { name: string; imageUrl: string };
type Promotion = { id: number; title: string; imageUrl: string; query: string };

type ExploreScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

const { width } = Dimensions.get('window');

// ================================================================
// 🚀 KOMPONEN BARU: ImageWithFallback
// ================================================================
/**
 * Komponen ini secara otomatis beralih ke gambar placeholder
 * jika gambar utama (dari server lokal Anda) gagal dimuat.
 * Ini MEMPERBAIKI bug gambar Anda yang tidak muncul.
 */
interface ImageWithFallbackProps {
  sourceUrl: string | null | undefined;
  style: object;
  // Gambar placeholder jika 'sourceUrl' gagal atau null
  placeholderType?: 'product' | 'category' | 'location';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  sourceUrl,
  style,
  placeholderType = 'product',
}) => {
  const [hasError, setHasError] = useState(false);

  let placeholderImage = 'https://source.unsplash.com/400x400/?product';
  if (placeholderType === 'category') {
    placeholderImage = 'https://source.unsplash.com/400x400/?abstract';
  } else if (placeholderType === 'location') {
    placeholderImage = 'https://source.unsplash.com/400x400/?city';
  }

  // Tentukan URI yang akan dirender
  // 1. Jika tidak ada sourceUrl, gunakan placeholder.
  // 2. Jika ada error, gunakan placeholder.
  // 3. Jika ada sourceUrl dan tidak error, gunakan sourceUrl.
  const uriToRender = !sourceUrl || hasError 
    ? placeholderImage 
    : sourceUrl.startsWith('http') 
      ? sourceUrl // Ini untuk URL eksternal (Unsplash, dll)
      : `${BASE_URL}/images/${sourceUrl}`; // Ini untuk gambar lokal Anda

  return (
    <Image
      source={{ uri: uriToRender }}
      style={style}
      onError={() => {
        // Jika gagal (misal: 404), set error ke true
        if (!hasError) setHasError(true);
      }}
    />
  );
};

// ================================================================
// 🚀 KOMPONEN BARU: Section
// ================================================================
/**
 * Komponen ini merapikan layout Anda dengan membuat
 * header section yang konsisten, lengkap dengan tombol "Lihat Semua".
 * Ini MEMPERBAIKI layout yang "acak-acakan".
 */
interface SectionProps {
  title: string;
  onSeeAllPress?: () => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, onSeeAllPress, children }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAllPress && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>Lihat Semua {'>'}</Text>
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);

// --- KOMPONEN KARTU KECIL (Disesuaikan) ---

const PromotionBanner: React.FC<{ item: Promotion; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <ImageBackground
      source={{ uri: item.imageUrl || 'https://via.placeholder.com/300' }}
      style={styles.promoBanner}
      imageStyle={styles.promoImageStyle}
    >
      <View style={styles.cardOverlay} />
      <Text style={styles.promoTitle}>{item.title}</Text>
    </ImageBackground>
  </TouchableOpacity>
);

const CategoryCard: React.FC<{ item: Category; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <ImageWithFallback
      sourceUrl={item.imageUrl}
      style={styles.categoryImage}
      placeholderType="category"
    />
    <Text style={styles.categoryTitle}>{item.name}</Text>
  </TouchableOpacity>
);

const LocationCard: React.FC<{ item: Location; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <ImageBackground
      source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
      style={styles.locationCard}
      imageStyle={styles.cardImageStyle}
    >
      <View style={styles.cardOverlay} />
      <Text style={styles.cardTitle}>{item.name}</Text>
    </ImageBackground>
  </TouchableOpacity>
);

const SmallProductCard: React.FC<{ item: ApiProduct; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress}>
    <ImageWithFallback
      sourceUrl={item.imageUrl}
      style={styles.productImage}
      placeholderType="product"
    />
    <View style={styles.productCardBody}>
      <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>Rp{item.price.toLocaleString('id-ID')}</Text>
    </View>
  </TouchableOpacity>
);

// --- KOMPONEN UTAMA ---

export default function ExploreScreen() {
  const navigation = useNavigation<ExploreScreenNavigationProp>();

  // State untuk semua data
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newProducts, setNewProducts] = useState<ApiProduct[]>([]);
  
  // State UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [promoRes, catRes, locRes, newProdRes] = await Promise.all([
        apiClient.get('/promotions'),
        apiClient.get('/categories'),
        apiClient.get('/locations/popular'),
        apiClient.get('/products/newest'),
      ]);

      setPromotions(promoRes.data.promotions || []);
      setCategories(catRes.data.categories || []);
      setLocations(locRes.data.locations || []);
      setNewProducts(newProdRes.data.products || []);

    } catch (err) {
      console.error('Failed to fetch explore data:', err);
      setError('Gagal memuat data. Tarik untuk menyegarkan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  
  // --- Handler Navigasi ---
  const handleSearchPress = () => navigation.navigate('SearchHistory');
  const handleCategoryPress = (category: Category) => navigation.navigate('SearchResults', { categoryName: category.name });
  const handleLocationPress = (location: Location) => navigation.navigate('SearchResults', { query: location.name });
  const handlePromotionPress = (promotion: Promotion) => navigation.navigate('SearchResults', { query: promotion.query });
  const handleProductPress = (product: ApiProduct) => navigation.navigate('Detail', { productId: product.id });
  
  // Handler "Lihat Semua"
  const handleSeeAllCategories = () => {
    // Di sini Anda bisa navigasi ke layar grid kategori
    // (Untuk saat ini, kita bisa log saja)
    console.log("Navigasi ke Semua Kategori");
  };
  const handleSeeAllNewest = () => {
    navigation.navigate('SearchResults', { query: '' }); // Tampilkan semua produk
  };

  // --- Render Komponen ---
  
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.searchBox} 
        onPress={handleSearchPress} 
        activeOpacity={0.8}
      >
        <Icon name="search" color={COLORS.textMuted} size={16} style={styles.searchIcon} />
        <Text style={styles.searchInputPlaceholder}>Cari barang, kategori, atau lokasi...</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isLoading && categories.length === 0) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />;
    }
    if (error && !isLoading) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    return (
      <>
        {/* --- Bagian Promosi --- */}
        {promotions.length > 0 && (
          <FlatList
            data={promotions}
            renderItem={({ item }) => (
              <PromotionBanner item={item} onPress={() => handlePromotionPress(item)} />
            )}
            keyExtractor={(item) => `promo-${item.id}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoList}
          />
        )}

        {/* --- Bagian Kategori --- */}
        {categories.length > 0 && (
          <Section title="Jelajahi Kategori" onSeeAllPress={handleSeeAllCategories}>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <CategoryCard item={item} onPress={() => handleCategoryPress(item)} />
              )}
              keyExtractor={(item) => `cat-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </Section>
        )}

        {/* --- Bagian Lokasi --- */}
        {locations.length > 0 && (
          <Section title="Lokasi Populer">
            <FlatList
              data={locations}
              renderItem={({ item }) => (
                <LocationCard item={item} onPress={() => handleLocationPress(item)} />
              )}
              keyExtractor={(item) => `loc-${item.name}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </Section>
        )}

        {/* --- Bagian Produk Terbaru --- */}
        {newProducts.length > 0 && (
          <Section title="Barang Terbaru" onSeeAllPress={handleSeeAllNewest}>
            <FlatList
              data={newProducts}
              renderItem={({ item }) => (
                <SmallProductCard item={item} onPress={() => handleProductPress(item)} />
              )}
              keyExtractor={(item) => `prod-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </Section>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={fetchData} 
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary}
          />
        }
      >
        {renderHeader()}
        {renderContent()}
        <View style={styles.scrollSpacer} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES BARU ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card,
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInputPlaceholder: { 
    color: COLORS.textMuted, 
    flex: 1, 
    fontSize: 14 
  },
  // --- Section ---
  sectionContainer: {
    marginTop: 24, // Jarak antar section
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8, // Beri jarak di akhir list
  },
  // --- Kartu Promosi ---
  promoList: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  promoBanner: {
    width: width - 32, // Lebar penuh dikurangi padding
    height: 140,
    borderRadius: 16,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  promoImageStyle: {
    borderRadius: 16,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // --- Kartu Kategori (Dibuat Rapi) ---
  categoryCard: {
    width: 90, // Ukuran tetap
    height: 90, // Ukuran tetap
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  // --- Kartu Lokasi ---
  locationCard: {
    width: 160, // Ukuran tetap
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  cardImageStyle: {
    borderRadius: 12,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  // --- Kartu Produk Kecil (Dibuat Rapi) ---
  productCard: {
    width: 150, // Ukuran tetap
    marginRight: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.border,
  },
  productCardBody: {
    padding: 10,
    flex: 1, // Agar body mengisi sisa ruang
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1, // Dorong harga ke bawah
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4, // Beri jarak dari judul
  },
  // --- Lain-lain ---
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: COLORS.textMuted,
    paddingHorizontal: 20,
  },
  loadingIndicator: {
    marginTop: 40,
  },
  scrollSpacer: {
    height: 30,
  },
});