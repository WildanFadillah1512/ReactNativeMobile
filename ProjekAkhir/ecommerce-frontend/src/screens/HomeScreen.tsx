// --- IMPORTS ---
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StatusBar, // Tambahkan StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; 
import { ApiProduct } from '../types';
import { useLikes } from '../context/LikeContext';
import { useCart } from '../context/CartContext';
import { COLORS } from '../config/theme';
import apiClient from '../config/api'; // BASE_URL akan diambil dari sini
import { useAuth } from '../context/AuthContext';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';
import { ProductCard } from '../components/ProductCard'; // Gunakan ProductCard yang sudah ada
import { useIsFocused } from '@react-navigation/native';

const LogoImage = require('../assets/images/logo.png');

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>, 
  NativeStackScreenProps<RootStackParamList>
>;

// === Kategori Icon ===
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

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { isLoggedIn } = useAuth();
  // --- PERBAIKAN 1: Hapus isLoading global, ganti dengan state lokal ---
  const { likedIds, toggleLike } = useLikes();
  const { cartEntries, addToCart } = useCart();
  // Ambil isLoading global sekali saja untuk badge keranjang
  const { isLoading: isCartContextLoading } = useCart(); 

  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ApiProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Trending');
  const contentScrollViewRef = useRef<ScrollView>(null);
  const categories = ['Trending', 'Outdoor', 'Elektronik', 'Perlengkapan', 'Kendaraan'];

  const isFocused = useIsFocused();

  // --- PERBAIKAN 2: State loading per-item ---
  // Ini akan melacak ID produk yang sedang di-like atau ditambah ke keranjang
  const [loadingLikeId, setLoadingLikeId] = useState<number | null>(null);
  const [loadingCartId, setLoadingCartId] = useState<number | null>(null);

  // === Fetch Data Produk (Auto Refresh Saat Halaman Fokus) ===
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingProducts(true);
        const [allRes, trendingRes] = await Promise.all([
          apiClient.get('/products'),
          apiClient.get('/products/trending'),
        ]);

        // --- PERBAIKAN 3: Ekstrak array dari 'response.data.products' ---
        setAllProducts(allRes.data.products || []);
        // '/products/trending' mengembalikan array langsung, jadi ini sudah benar
        setTrendingProducts(trendingRes.data || []); 

      } catch (error: any) {
        console.error("HomeScreen Gagal fetch data:", error);
        const errorMessage = error.message || "Gagal memuat data produk.";
        if (error.code === 'ERR_NETWORK') {
          Alert.alert(
            "Error Koneksi",
            `Tidak dapat terhubung ke server.\nPastikan server backend berjalan.`
          );
        } else {
          Alert.alert("Error Memuat Data", errorMessage);
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (isFocused) {
      fetchInitialData(); // ✅ Fetch ulang saat kembali ke Home
    }
  }, [isFocused]);

  // === Filter Produk Berdasarkan Kategori ===
  const filteredItems = useMemo(() => {
    if (isLoadingProducts) return [];
    if (selectedCategory === 'Trending') {
      return trendingProducts;
    }
    return allProducts.filter(item => item.category === selectedCategory);
  }, [selectedCategory, allProducts, trendingProducts, isLoadingProducts]);

  const promptLogin = useCallback(() => {
    navigation.navigate('Login'); 
  }, [navigation]);

  // --- PERBAIKAN 4: Update handler untuk menggunakan state loading lokal ---
  const handleAddToCart = useCallback(async (item: ApiProduct) => {
    if (!isLoggedIn) {
      promptLogin();
      return;
    }
    setLoadingCartId(item.id); // Mulai loading untuk item ini
    try {
      const added = await addToCart(item);
      if (added) {
        Alert.alert("Ditambahkan", `${item.name} berhasil ditambahkan ke keranjang.`);
      } else {
        Alert.alert("Sudah di Keranjang", `${item.name} sudah ada. Lihat keranjang?`,
          [
            { text: "Tidak", style: "cancel" },
            { text: "Ya, Lihat", onPress: () => navigation.navigate('Cart') }
          ]
        );
      }
    } catch (error) {
      console.error("Gagal menambahkan ke keranjang:", error);
      Alert.alert("Gagal", "Tidak dapat menambahkan item.");
    } finally {
      setLoadingCartId(null); // Selesai loading
    }
  }, [isLoggedIn, promptLogin, addToCart, navigation]);
  
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    contentScrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNavigateToDetail = (item: ApiProduct) => {
    navigation.navigate('Detail', { productId: item.id });
  };

  // --- PERBAIKAN 5: Update handler untuk menggunakan state loading lokal ---
  const handleLikePress = useCallback(async (id: number) => {
    if (!isLoggedIn) {
      promptLogin();
      return;
    }
    setLoadingLikeId(id); // Mulai loading untuk item ini
    try { 
      await toggleLike(id); 
    } catch (error) {
      console.error("Gagal toggle like:", error);
      Alert.alert("Gagal", "Tidak dapat memperbarui favorit.");
    } finally {
      setLoadingLikeId(null); // Selesai loading
    }
  }, [isLoggedIn, promptLogin, toggleLike]);

  const handleSearchPress = () => { navigation.navigate('SearchHistory'); };

  // === Render Header Icons ===
  const renderHeaderIcons = () => {
    if (isLoggedIn) {
      return (
        <View style={styles.headerIconsRight}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Saved')}
          >
            <Icon name="heart-o" color={COLORS.textPrimary} size={22} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, styles.cartButton]} 
            onPress={() => navigation.navigate('Cart')} 
          >
            <Icon name="shopping-cart" color="white" size={22} />
            {!isCartContextLoading && cartEntries.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartEntries.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.headerIconsRight}>
          <TouchableOpacity 
            style={styles.authButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.authButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.authButton, styles.registerButton]} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.authButtonTextRegister}>Daftar</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  // === Render Utama ===
  return (
    // --- PERBAIKAN 6: Ganti SafeAreaView ke style yang benar ---
    // SafeAreaView harus membungkus seluruh layar
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.card} />
      {/* Header Statis */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoTitleContainer}>
            <Image source={LogoImage} style={styles.logoImage} />
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>PakeSewa</Text>
              <Text style={styles.subtitle}>Sewa barang yang anda butuhkan</Text>
            </View>
          </View>
          {renderHeaderIcons()} 
        </View>

        <TouchableOpacity style={styles.searchBox} onPress={handleSearchPress} activeOpacity={0.8}>
          <Icon name="search" color={COLORS.textMuted} size={16} style={styles.searchIcon} />
          <Text style={styles.searchInputPlaceholder}>Cari barang...</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => handleCategoryChange(cat)}
              style={[
                styles.categoryButton,
                selectedCategory === cat && { backgroundColor: getCategoryInfo(cat).color },
              ]}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Konten Scrollable */}
      <ScrollView style={styles.content} ref={contentScrollViewRef}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Icon name={getCategoryInfo(selectedCategory).icon} color={getCategoryInfo(selectedCategory).color} size={16} />
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'Trending' ? ' Barang Populer' : ` ${selectedCategory}`}
            </Text>
          </View>
        </View>

        {isLoadingProducts ? (
          <ActivityIndicator style={styles.loadingIndicator} size="large" color={COLORS.primary} />
        ) : filteredItems.length > 0 ? (
          // --- PERBAIKAN 7: Gunakan state loading lokal ---
          filteredItems.map((item) => ( 
            <ProductCard
              key={item.id}
              item={item}
              isLiked={likedIds.includes(item.id)}
              onPress={handleNavigateToDetail}
              onLike={handleLikePress}
              onAddToCart={handleAddToCart}
              // Kirim status loading spesifik untuk item ini
              likesLoading={loadingLikeId === item.id}
              cartLoading={loadingCartId === item.id}
            />
          ))
        ) : (
          <Text style={styles.noItemsText}>Tidak ada barang yang tersedia untuk kategori ini.</Text>
        )}

        <View style={styles.contentSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  authButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  authButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  registerButton: { backgroundColor: 'white' },
  authButtonTextRegister: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  // --- PERBAIKAN 6: Layout diperbaiki ---
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  // contentWrapper dihapus karena tidak perlu
  header: { 
    paddingHorizontal: 16, 
    paddingTop: 16, // Padding ini aman di dalam SafeAreaView
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderColor: COLORS.border,
    backgroundColor: COLORS.card, // Header memiliki background sendiri
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  logoTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 15 
  },
  logoImage: { 
    width: 38, 
    height: 38, 
    borderRadius: 10, 
    marginRight: 10, 
    backgroundColor: COLORS.card 
  },
  titleTextContainer: { 
    flexDirection: 'column', 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary 
  },
  subtitle: { 
    fontSize: 11, 
    color: COLORS.textMuted, 
    marginTop: 1 
  },
  headerIconsRight: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    backgroundColor: COLORS.card, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartButton: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary,
  },
  cartBadge: { 
    position: 'absolute', 
    top: -3, 
    right: -3, 
    backgroundColor: COLORS.danger, 
    borderRadius: 8, 
    width: 16, 
    height: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10 
  },
  cartBadgeText: { 
    color: 'white', 
    fontSize: 9, 
    fontWeight: 'bold' 
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.background,
    borderRadius: 12, 
    paddingHorizontal: 12, 
    marginBottom: 16, 
    height: 44,
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
  categoryScroll: { 
    paddingBottom: 4 
  },
  categoryButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    height: 38, 
    justifyContent: 'center',
  },
  categoryText: { 
    color: COLORS.textSecondary, 
    fontSize: 13, 
    fontWeight: '500' 
  },
  categoryTextActive: { 
    color: COLORS.textPrimary, // Seharusnya putih atau warna kontras
    fontWeight: '600' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16, 
    marginTop: 16 
  },
  sectionTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  sectionTitle: { 
    color: COLORS.textPrimary, 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  noItemsText: { 
    color: COLORS.textMuted, 
    textAlign: 'center', 
    marginTop: 40, 
    fontSize: 14 
  },
  contentSpacer: { 
    height: 20 
  },
  loadingIndicator: { 
    marginTop: 50 
  },
});