// src/screens/CartScreen.tsx
import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
// Anda mungkin perlu Checkbox dari library eksternal atau buat komponen kustom
// Contoh: import CheckBox from '@react-native-community/checkbox';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App'; // Pastikan path benar
import { useCart } from '../context/CartContext'; // Pastikan path benar
// Import TIPE BARU CartEntry dan CheckoutRentalItem
import type { RentalItem, CartEntry } from '../types'; // Pastikan path benar
import { parsePrice, formatCurrency } from '../utils/riceParse'; // Pastikan path benar

// --- Define COLORS locally if not imported ---
const COLORS = {
    background: '#0f172a',
    card: '#1e293b',
    textPrimary: 'white',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    primary: '#06b6d4', // Biru-Toska
    danger: '#ef4444', // Merah
    border: '#334155', // Abu-abu gelap untuk border/bg
    // ... add other colors if used in styles ...
};
// --- End COLORS ---


// --- Komponen Checkbox Kustom (Contoh Sederhana) ---
// Ganti dengan library jika Anda punya (@react-native-community/checkbox)
const CustomCheckbox: React.FC<{ value: boolean; onValueChange: () => void; }> = ({ value, onValueChange }) => (
    <TouchableOpacity onPress={onValueChange} style={styles.checkboxBase}>
        {value && <Icon name="check" size={14} color={COLORS.primary} />}
    </TouchableOpacity>
);
// ---------------------------------------------

// --- Komponen Stepper (Contoh Definisi - pindahkan ke file terpisah jika perlu) ---
interface StepperProps { value: number; onIncrement: () => void; onDecrement: () => void; min: number; max: number; }
const Stepper: React.FC<StepperProps> = ({ value, onIncrement, onDecrement, min, max }) => (
     <View style={styles.stepperContainer}>
         <TouchableOpacity style={[styles.stepperButton, value === min && styles.stepperButtonDisabled]} onPress={onDecrement} disabled={value === min}>
             <Text style={[styles.stepperText, value === min && styles.stepperTextDisabled]}>-</Text>
         </TouchableOpacity>
         <Text style={styles.stepperValue}>{value}</Text>
         <TouchableOpacity style={[styles.stepperButton, value === max && styles.stepperButtonDisabled]} onPress={onIncrement} disabled={value === max}>
             <Text style={[styles.stepperText, value === max && styles.stepperTextDisabled]}>+</Text>
         </TouchableOpacity>
     </View>
);
// ---------------------------------------------


type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;

// Komponen untuk satu item di keranjang (DIPERBARUI TOTAL)
interface CartListItemProps {
    cartEntry: CartEntry; // Terima CartEntry utuh
    onRemove: (id: number) => void;
    onPressItem: (item: RentalItem) => void; // Untuk navigasi ke detail
    onToggleSelect: (id: number) => void;
    onUpdateDuration: (id: number, duration: number) => void;
}
const CartListItem: React.FC<CartListItemProps> = ({
    cartEntry, onRemove, onPressItem, onToggleSelect, onUpdateDuration
}) => {
    const { item, selected, duration } = cartEntry;
    const MIN_DURATION = 1;
    const MAX_DURATION = 30; // Sesuaikan jika perlu

    return (
        // Highlight jika item terpilih
        <View style={[styles.itemContainer, selected && styles.itemContainerSelected]}>
            {/* Checkbox */}
            <CustomCheckbox
                value={selected}
                onValueChange={() => onToggleSelect(item.id)}
            />

            {/* Gambar (tetap bisa diklik untuk ke detail) */}
            <TouchableOpacity onPress={() => onPressItem(item)} activeOpacity={0.7} style={styles.imageTouchable}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
            </TouchableOpacity>

            {/* Detail Item & Stepper Duration */}
            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemSeller}>oleh {item.seller.name}</Text>
                <Text style={styles.itemPrice}>
                    <Text style={styles.priceHighlight}>{item.price}</Text>
                    {item.period}
                </Text>
                {/* Stepper untuk durasi */}
                <View style={styles.stepperWrapper}>
                     <Stepper
                         value={duration}
                         onIncrement={() => onUpdateDuration(item.id, duration + 1)}
                         onDecrement={() => onUpdateDuration(item.id, duration - 1)}
                         min={MIN_DURATION}
                         max={MAX_DURATION}
                     />
                </View>
            </View>

            {/* Tombol Hapus */}
            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item.id)}>
                <Icon name="trash-o" size={20} color={COLORS.danger} />
            </TouchableOpacity>
        </View>
    );
};


export default function CartScreen({ navigation }: CartScreenProps) {
  // Ambil state dan fungsi baru dari context
  const {
      cartEntries, // Gunakan cartEntries
      removeFromCart,
      isLoading,
      clearCart,
      toggleItemSelection, // Fungsi baru
      updateItemDuration, // Fungsi baru
      getSelectedItemsForCheckout // Fungsi baru
  } = useCart();

  // Hitung total HANYA untuk item yang TERPILIH dan jumlahnya
  const { selectedItemsCount, totalPrice } = useMemo(() => {
    let count = 0;
    let total = 0;
    cartEntries.forEach(entry => {
        if (entry.selected) { // Cek status 'selected'
            count++;
            // Kalikan harga per unit dengan durasi terpilih
            total += parsePrice(entry.item.price) * entry.duration;
        }
    });
    return { selectedItemsCount: count, totalPrice: total };
  }, [cartEntries]); // Kalkulasi ulang jika cartEntries berubah

  // Fungsi remove dan clear (tetap sama)
  const handleRemoveItem = (id: number) => {
      Alert.alert( "Hapus Item", "Anda yakin ingin menghapus item ini?",
          [ { text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: async () => { try { await removeFromCart(id); } catch (error) { console.error("Gagal menghapus item:", error); Alert.alert("Gagal", "Tidak dapat menghapus item."); } } } ] );
  };
  const handleClearCart = () => {
      if (cartEntries.length === 0) return;
      Alert.alert( "Kosongkan Keranjang", "Anda yakin ingin menghapus semua item?",
          [ { text: "Batal", style: "cancel" }, { text: "Ya, Hapus Semua", style: "destructive", onPress: async () => { try { await clearCart(); } catch (error) { console.error("Gagal mengosongkan keranjang:", error); Alert.alert("Gagal", "Tidak dapat mengosongkan keranjang."); } } } ] );
  };

  // Navigasi ke Detail (tetap sama)
  const handleNavigateToDetail = (item: RentalItem) => { navigation.push('Detail', { item }); };

  // --- Fungsi Checkout Baru ---
  const handleCheckoutSelected = () => {
      const itemsToCheckout = getSelectedItemsForCheckout(); // Ambil item terpilih dari context
      if (itemsToCheckout.length === 0) {
          Alert.alert("Belum Ada Item Dipilih", "Centang item yang ingin Anda sewa terlebih dahulu.");
          return;
      }
      console.log("Proceeding to checkout with selected items:", itemsToCheckout.map(it=> ({id: it.id, duration: it.duration}))); // Log ID dan durasi saja
      // Navigasi ke Checkout dengan ARRAY items
      navigation.navigate('Checkout', { items: itemsToCheckout });
  };
  // -------------------------

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header (Judul update otomatis berdasarkan cartEntries.length) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keranjang Saya ({cartEntries.length} Item)</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCart} disabled={cartEntries.length === 0}>
           <Icon name="trash" size={20} color={cartEntries.length > 0 ? COLORS.danger : "#475569"} />
        </TouchableOpacity>
      </View>

      {/* Konten Daftar Item */}
      {isLoading ? ( <View style={styles.centerContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View> )
       : (
        <FlatList
          // Gunakan cartEntries
          data={cartEntries}
          renderItem={({ item: cartEntry }) => ( // item di sini adalah CartEntry
            <CartListItem
                cartEntry={cartEntry} // Kirim CartEntry utuh
                onRemove={handleRemoveItem}
                onPressItem={handleNavigateToDetail} // Ganti nama prop
                onToggleSelect={toggleItemSelection} // Kirim fungsi toggle
                onUpdateDuration={updateItemDuration} // Kirim fungsi update durasi
             />
          )}
          keyExtractor={(cartEntry) => cartEntry.item.id.toString()} // Key dari item.id
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="shopping-bag" size={60} color="#475569" />
              <Text style={styles.emptyTitle}>Keranjang Anda Kosong</Text>
              <Text style={styles.emptySubtitle}>Ayo cari barang menarik lainnya untuk disewa!</Text>
               <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Home')}>
                   <Text style={styles.browseButtonText}>Cari Barang Sekarang</Text>
               </TouchableOpacity>
            </View>
          }
          // Penting: Bantu FlatList mendeteksi perubahan dalam objek di array
          extraData={cartEntries.map(e => `${e.item.id}-${e.selected}-${e.duration}`)}
        />
      )}

      {/* Footer / Tombol Checkout (Diperbarui) */}
      {!isLoading && cartEntries.length > 0 && (
          <View style={styles.footer}>
              <View style={styles.summaryRow}>
                  {/* Tampilkan jumlah item TERPILIH */}
                  <Text style={styles.summaryLabel}>Total ({selectedItemsCount} item dipilih):</Text>
                  {/* Tampilkan Total Harga TERPILIH */}
                  <Text style={styles.summaryTotal}>{formatCurrency(totalPrice)}</Text>
              </View>
              {/* Tombol Checkout Selected */}
              <TouchableOpacity
                  style={[styles.checkoutButton, selectedItemsCount === 0 && styles.checkoutButtonDisabled]}
                  onPress={handleCheckoutSelected}
                  disabled={selectedItemsCount === 0} // Disable jika tidak ada yang dipilih
              >
                  <Text style={styles.checkoutButtonText}>
                      Checkout ({selectedItemsCount}) {/* Tampilkan jumlah terpilih */}
                  </Text>
              </TouchableOpacity>
          </View>
      )}
    </SafeAreaView>
  );
}

// Styles (TAMBAHKAN STYLE BARU & PERBAIKI YANG LAMA)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, },
    backButton: { padding: 4, width: 35, alignItems: 'flex-start' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
    clearButton: { padding: 4, width: 35, alignItems: 'flex-end' },
    listContent: { paddingHorizontal: 16, paddingTop: 16, flexGrow: 1, paddingBottom: 120 /* Lebih banyak ruang untuk footer */},
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 80, },
    emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', textAlign: 'center', marginTop: 20, marginBottom: 8, },
    emptySubtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 20, },
    browseButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, },
    browseButtonText: { color: 'white', fontSize: 14, fontWeight: '600', },

    // --- Style Item Keranjang Diperbarui ---
    itemContainer: {
        backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 10,
        marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
    },
    itemContainerSelected: { borderColor: COLORS.primary, }, // Highlight jika terpilih
    checkboxBase: { // Style untuk checkbox kustom
        width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    imageTouchable: { /* Tidak perlu style khusus */ },
    itemImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: COLORS.border, marginRight: 12, },
    itemDetails: { flex: 1, marginRight: 10, justifyContent: 'center', },
    itemName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
    itemSeller: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6 },
    itemPrice: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
    priceHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, marginRight: 4 },
    stepperWrapper:{ alignItems: 'flex-start', }, // Stepper mulai dari kiri
    itemActions: { /* Hanya untuk tombol Hapus sekarang */ justifyContent: 'center'}, // Pusatkan tombol hapus
    removeButton: { padding: 8, marginLeft: 5, }, // Tombol hapus

    // --- Style Stepper (jika didefinisikan di sini) ---
    stepperContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 5, },
    stepperButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, },
    stepperButtonDisabled: { backgroundColor: COLORS.border, },
    stepperText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', },
    stepperTextDisabled: { color: COLORS.textMuted, },
    stepperValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', paddingHorizontal: 12, minWidth: 40, textAlign: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border, height: 30, lineHeight: 30, },

    // --- Footer Diperbarui ---
    footer: { borderTopWidth: 1, borderColor: COLORS.border, padding: 16, backgroundColor: COLORS.card, },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, },
    summaryLabel: { color: COLORS.textSecondary, fontSize: 14, },
    summaryTotal: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', },
    checkoutButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', },
    checkoutButtonDisabled: { backgroundColor: COLORS.border, }, // Style saat disabled
    checkoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
    // footerNote tidak dipakai lagi
    loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center', },
});