import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import apiClient, { BASE_URL } from '../config/api'; // Pastikan BASE_URL diimpor
import { COLORS } from '../config/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

// Tipe ini harus cocok dengan model Prisma Anda
type RentalItem = {
  id: number;
  productName: string;
  productPrice: number;
  duration: number;
  imageUrl: string | null;
};
type Rental = {
  id: number;
  createdAt: string;
  totalPrice: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  items: RentalItem[];
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Komponen kecil untuk setiap item dalam pesanan
const RentalProductItem: React.FC<{item: RentalItem}> = ({ item }) => (
  <View style={styles.productItem}>
    <Image 
      // Perbaiki URL gambar untuk mengambil dari folder 'public/images' di server
      source={{ uri: item.imageUrl ? `${BASE_URL}/images/${item.imageUrl}` : 'https://via.placeholder.com/100' }} 
      style={styles.productImage} 
    />
    <View style={styles.productDetails}>
      <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
      <Text style={styles.productDuration}>Durasi: {item.duration} hari</Text>
      <Text style={styles.productPrice}>Rp{item.productPrice.toLocaleString('id-ID')}</Text>
    </View>
  </View>
);

// Komponen kartu pesanan
const RentalCard: React.FC<{ item: Rental }> = ({ item }) => {
  // Fungsi untuk mendapatkan style badge berdasarkan status
  const getStatusStyle = () => {
    switch (item.status) {
      case 'ACTIVE': return styles.ACTIVE;
      case 'COMPLETED': return styles.COMPLETED;
      case 'CANCELLED': return styles.CANCELLED;
      default: return styles.PENDING;
    }
  };

  return (
    <View style={styles.rentalCard}>
      {/* Header Kartu: ID Pesanan & Tanggal */}
      <View style={styles.cardHeader}>
        <Text style={styles.rentalId}>Pesanan #{item.id}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</Text>
      </View>

      {/* Body Kartu: Daftar Produk */}
      <View style={styles.itemBody}>
        {item.items.map(product => (
          <RentalProductItem key={product.id} item={product} />
        ))}
      </View>

      {/* Footer Kartu: Status & Total Harga */}
      <View style={styles.cardFooter}>
         <View style={[styles.statusBadge, getStatusStyle()]}>
            <Text style={styles.statusText}>{item.status}</Text>
         </View>
        <Text style={styles.totalPrice}>
          Total: Rp{item.totalPrice.toLocaleString('id-ID')}
        </Text>
      </View>
    </View>
  );
};


export default function RentalHistoryScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil data riwayat
  const fetchHistory = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setIsLoading(true);
    try {
      const response = await apiClient.get('/rentals/history');
      setRentals(response.data);
    } catch (error) {
      console.error(error);
      // Anda bisa menambahkan Alert di sini jika mau
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gunakan useFocusEffect untuk auto-refresh saat layar ini dibuka
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );
  
  // Fungsi untuk pull-to-refresh
  const onRefresh = () => fetchHistory(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
       {/* Header Kustom */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Sewa</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tampilan Loading Awal */}
      {isLoading && rentals.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={rentals}
          renderItem={({ item }) => <RentalCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="history" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Anda belum memiliki riwayat sewa.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.textPrimary 
  },
  headerSpacer: { 
    width: 40 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { 
    padding: 16 
  },
  rentalCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  rentalId: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary 
  },
  date: { 
    fontSize: 14, 
    color: COLORS.textMuted 
  },
  itemBody: { 
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Jarak antar produk
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.border,
  },
  productDetails: {
    flex: 1,
  },
  productName: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    fontWeight: '600' 
  },
  productDuration: { 
    fontSize: 12, 
    color: COLORS.textMuted, 
    marginTop: 2 
  },
  productPrice: { 
    fontSize: 14, 
    color: COLORS.textPrimary, 
    marginTop: 2, 
    fontWeight: '500' 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background, // Sedikit beda
  },
  totalPrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.primary 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { 
    textAlign: 'center', 
    color: COLORS.textMuted, 
    marginTop: 16,
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { 
    color: 'white', 
    fontWeight: '600', 
    fontSize: 12 
  },
  // Asumsi Anda memiliki warna-warna ini di theme.ts
  ACTIVE: { backgroundColor: COLORS.primary }, 
  COMPLETED: { backgroundColor: COLORS.success || '#22c55e' },
  PENDING: { backgroundColor: COLORS.textMuted },
  CANCELLED: { backgroundColor: COLORS.danger || '#ef4444' },
});