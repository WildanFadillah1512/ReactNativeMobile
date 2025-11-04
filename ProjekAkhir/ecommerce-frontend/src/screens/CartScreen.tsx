import React, { useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
    ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; 
import { useCart } from '../context/CartContext'; 
import type { ApiProduct, CartEntry } from '../types';
import { formatCurrency } from '../utils/riceParse'; 
import { COLORS } from '../config/theme';
import { BASE_URL } from '../config/api';


const CustomCheckbox: React.FC<{ value: boolean; onValueChange: () => void; }> = ({ value, onValueChange }) => (
    <TouchableOpacity onPress={onValueChange} style={styles.checkboxBase}>
        {value && <Icon name="check" size={14} color={COLORS.primary} />}
    </TouchableOpacity>
);

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

const buildImageUri = (filename?: string | null) => {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
    return `${BASE_URL}/images/${filename}`;
};

type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;

interface CartListItemProps {
    cartEntry: CartEntry; 
    onRemove: (id: number) => void;
    onPressItem: (item: ApiProduct) => void; 
    onToggleSelect: (id: number) => void;
    onUpdateDuration: (id: number, duration: number) => void;
}
const CartListItem: React.FC<CartListItemProps> = ({
    cartEntry, onRemove, onPressItem, onToggleSelect, onUpdateDuration
}) => {
    const { item, selected, duration } = cartEntry;
    const MIN_DURATION = 1;
    const MAX_DURATION = 30; 

    const imageUri = buildImageUri(item.imageUrl);

    return (
        <View style={[styles.itemContainer, selected && styles.itemContainerSelected]}>
            <CustomCheckbox
                value={selected}
                onValueChange={() => onToggleSelect(item.id)}
            />

            <TouchableOpacity onPress={() => onPressItem(item)} activeOpacity={0.7} style={styles.imageTouchable}>
                <Image
                    source={imageUri ? { uri: imageUri } : require('../assets/images/placeholder.png')} // Sesuaikan path placeholder
                    style={styles.itemImage}
                />
            </TouchableOpacity>

            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemSeller}>oleh {item.seller.name}</Text>
                {/* Tampilkan Harga Terformat dari angka */}
                <Text style={styles.itemPrice}>
                    <Text style={styles.priceHighlight}>{formatCurrency(item.price)}</Text>
                    {item.period ? ` ${item.period}` : ''}
                </Text>
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

            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item.id)}>
                <Icon name="trash-o" size={20} color={COLORS.danger} />
            </TouchableOpacity>
        </View>
    );
};


export default function CartScreen({ navigation }: CartScreenProps) {
    const {
        cartEntries,
        removeFromCart,
        isLoading,
        clearCart,
        toggleItemSelection,
        updateItemDuration,
        getSelectedItemsForCheckout
    } = useCart();

    const { selectedItemsCount, totalPrice } = useMemo(() => {
        let count = 0;
        let total = 0;
        cartEntries.forEach(entry => {
            if (entry.selected) {
                count++;
                total += entry.item.price * entry.duration; 
            }
        });
        return { selectedItemsCount: count, totalPrice: total };
    }, [cartEntries]); 
    const handleRemoveItem = (id: number) => {
        Alert.alert( "Hapus Item", "Yakin hapus item ini?",
            [ { text: "Batal"}, { text: "Hapus", style: "destructive", onPress: async () => { try { await removeFromCart(id); } 
                catch (error) {
                console.error("Gagal fetch semua produk:", error);
            } finally {
                Alert.alert("Gagal", "Tidak dapat menghapus."); }}}] );
    };
    const handleClearCart = () => {
        if (cartEntries.length === 0) return;
        Alert.alert( "Kosongkan Keranjang", "Yakin hapus semua item?",
            [ { text: "Batal"}, { text: "Ya, Hapus Semua", style: "destructive", onPress: async () => { try { await clearCart(); } 
                catch (error) {
                console.error("Gagal fetch semua produk:", error);
                // Alert.alert("Error", "Gagal memuat data produk.");
            } finally {
                Alert.alert("Gagal", "Tidak dapat mengosongkan keranjang."); }}}] );
    };

    // --- PERBAIKAN 7: Navigasi ke Detail - Kirim productId ---
    const handleNavigateToDetail = (item: ApiProduct) => { // <-- FIX: Terima ApiProduct
        // Kirim productId sesuai RootStackParamList
        navigation.push('Detail', { productId: item.id }); // <-- FIX: Kirim productId
    };
    // --- AKHIR PERBAIKAN 7 ---

    // handleCheckoutSelected (Sudah Benar - Context yang konversi)
    const handleCheckoutSelected = () => {
        const itemsToCheckout = getSelectedItemsForCheckout(); // Ini sudah CheckoutRentalItem[]
        if (itemsToCheckout.length === 0) {
            Alert.alert("Belum Ada Item Dipilih", "Centang item yang ingin Anda sewa.");
            return;
        }
        // Kirim CheckoutRentalItem[] ke layar Checkout
        navigation.navigate('Checkout', { items: itemsToCheckout });
    };

    // --- RENDER --- (Sudah Benar)
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header (Sudah Benar) */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={22} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Keranjang Saya ({cartEntries.length} Item)</Text>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearCart} disabled={cartEntries.length === 0}>
                   <Icon name="trash" size={20} color={cartEntries.length > 0 ? COLORS.danger : "#475569"} />
                </TouchableOpacity>
            </View>

            {/* Konten (Sudah Benar) */}
            {isLoading ? ( <View style={styles.centerContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View> )
            : (
                <FlatList
                    data={cartEntries} // Data adalah CartEntry[] (dengan item: ApiProduct)
                    renderItem={({ item: cartEntry }) => (
                        <CartListItem
                            cartEntry={cartEntry} // Kirim CartEntry
                            onRemove={handleRemoveItem}
                            onPressItem={handleNavigateToDetail} // Handler sudah diperbaiki
                            onToggleSelect={toggleItemSelection}
                            onUpdateDuration={updateItemDuration}
                        />
                    )}
                    keyExtractor={(cartEntry) => cartEntry.item.id.toString()} // Key dari item.id
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="shopping-bag" size={60} color="#475569" />
                            <Text style={styles.emptyTitle}>Keranjang Anda Kosong</Text>
                            <Text style={styles.emptySubtitle}>Ayo cari barang menarik lainnya!</Text>
                               <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
                                   <Text style={styles.browseButtonText}>Cari Barang Sekarang</Text>
                               </TouchableOpacity>
                        </View>
                    }
                    // extraData membantu FlatList merender ulang saat selection/duration berubah
                    extraData={cartEntries.map(e => `${e.item.id}-${e.selected}-${e.duration}`)}
                />
            )}

            {/* Footer (Sudah Benar - Menampilkan total terformat) */}
            {!isLoading && cartEntries.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total ({selectedItemsCount} item dipilih):</Text>
                        {/* Tampilkan total harga terformat */}
                        <Text style={styles.summaryTotal}>{formatCurrency(totalPrice)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutButton, selectedItemsCount === 0 && styles.checkoutButtonDisabled]}
                        onPress={handleCheckoutSelected}
                        disabled={selectedItemsCount === 0}
                    >
                        <Text style={styles.checkoutButtonText}>
                            Checkout ({selectedItemsCount})
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

// Styles (Tidak ada perubahan signifikan, sudah bagus)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, },
    backButton: { padding: 4, width: 35, alignItems: 'flex-start' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
    clearButton: { padding: 4, width: 35, alignItems: 'flex-end' },
    listContent: { paddingHorizontal: 16, paddingTop: 16, flexGrow: 1, paddingBottom: 120 /* Ruang untuk footer */},
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, }, // Untuk loading indicator
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 80, },
    emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', textAlign: 'center', marginTop: 20, marginBottom: 8, },
    emptySubtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 20, },
    browseButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, },
    browseButtonText: { color: 'white', fontSize: 14, fontWeight: '600', },
    itemContainer: {
        backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 10,
        marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', // Border default transparan
    },
    itemContainerSelected: { borderColor: COLORS.primary, }, // Border saat selected
    checkboxBase: {
        width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    imageTouchable: { /* Tidak perlu style khusus, ukuran di Image */ },
    itemImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: COLORS.border, marginRight: 12, },
    itemDetails: { flex: 1, marginRight: 10, justifyContent: 'center', },
    itemName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
    itemSeller: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6 },
    itemPrice: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
    priceHighlight: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, marginRight: 4 },
    stepperWrapper:{ alignItems: 'flex-start', marginTop: 4 }, // Beri sedikit jarak atas
    removeButton: { padding: 8, marginLeft: 5, alignSelf: 'center' }, // Pusatkan tombol hapus vertikal
    stepperContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 5, },
    stepperButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, },
    stepperButtonDisabled: { backgroundColor: COLORS.border, },
    stepperText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', },
    stepperTextDisabled: { color: COLORS.textMuted, },
    stepperValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', paddingHorizontal: 12, minWidth: 40, textAlign: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border, height: 30, lineHeight: 30, },
    footer: { borderTopWidth: 1, borderColor: COLORS.border, padding: 16, backgroundColor: COLORS.card, }, // Background card agar kontras
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, },
    summaryLabel: { color: COLORS.textSecondary, fontSize: 14, },
    summaryTotal: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', },
    checkoutButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', },
    checkoutButtonDisabled: { backgroundColor: COLORS.border, opacity: 0.7 }, // Opacity saat disabled
    checkoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
});