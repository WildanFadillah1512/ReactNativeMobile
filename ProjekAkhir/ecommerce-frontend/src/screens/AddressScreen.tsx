import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Address } from '../navigation/types';
// Ganti 'useAddresses' ke 'useAddress' (singular)
import { useAddress } from '../context/AddressContext';
import { COLORS } from '../config/theme';
import { useIsFocused } from '@react-navigation/native';

type AddressScreenProps = NativeStackScreenProps<RootStackParamList, 'Address'>;

// Komponen Kartu Alamat (Sudah Benar)
const AddressCard: React.FC<{
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ address, isSelected, onSelect, onDelete, onEdit }) => {
  return (
    <View style={[styles.addressCard, isSelected && styles.selectedAddressCard]}>
      <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressTitle}>{address.label}</Text>
          {isSelected && (
            <Icon name="check-circle" size={20} color={COLORS.cyan} />
          )}
        </View>
        <View style={styles.addressBody}>
          <Text style={styles.addressName}>{address.receiverName}</Text>
          <Text style={styles.addressDetail}>{address.phone}</Text>
          <Text style={styles.addressDetail}>{address.street}</Text>
          <Text style={styles.addressDetail}>
            {`${address.city}, ${address.province} ${address.postalCode}`}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
        >
          <FeatherIcon name="edit-2" size={14} color={COLORS.textMuted} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <FeatherIcon name="trash-2" size={14} color={COLORS.danger} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Hapus
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- FIX 1: Definisikan separator sebagai fungsi stabil di luar ---
const renderItemSeparator = () => <View style={styles.itemSeparator} />;

// --- FIX 3: Definisikan ListEmptyComponent sebagai komponen stabil ---
const ListEmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <FeatherIcon name="map-pin" size={50} color={COLORS.textMuted} />
    <Text style={styles.emptyText}>Belum ada alamat tersimpan.</Text>
    <Text style={styles.emptySubText}>Tambahkan alamat baru untuk melanjutkan.</Text>
  </View>
);


export default function AddressScreen({ route, navigation }: AddressScreenProps) {
  const isSelectMode = !!route.params?.items;
  const itemsToCheckout = route.params?.items;

  const { addresses, loading, deleteAddress, refreshAddresses } = useAddress();
  
  const [selectedId, setSelectedId] = useState<number | undefined>(route.params?.currentAddressId);
  const isFocused = useIsFocused();

  // Refresh Otomatis (Sudah Benar)
  useEffect(() => {
    if (isFocused) {
      refreshAddresses();
    }
  }, [isFocused, refreshAddresses]);

  
  // (Fungsi handleConfirmAddress sudah benar)
  const handleConfirmAddress = () => {
    if (selectedId === undefined) {
      Alert.alert('Perhatian', 'Pilih salah satu alamat pengiriman.');
      return;
    }
    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      Alert.alert('Error', 'Detail barang tidak ditemukan.');
      navigation.navigate('Cart');
      return;
    }
    navigation.navigate('Checkout', {
      items: itemsToCheckout,
      selectedAddressId: selectedId,
    });
  };

  // --- FIX 3: Bungkus 'handleDelete' dengan 'useCallback' ---
  const handleDelete = useCallback((id: number) => {
    Alert.alert('Hapus Alamat', 'Yakin ingin menghapus alamat ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
            if (selectedId === id) {
              setSelectedId(undefined);
            }
          } catch (error) {
            console.error('Gagal menghapus alamat dari layar:', error);
          }
        },
      },
    ]);
  }, [deleteAddress, selectedId]); // <-- Tambahkan dependensi
  
  // --- FIX 2 & 3: Bungkus 'handleEdit' dengan 'useCallback' & fix parameter ---
  const handleEdit = useCallback((_address: Address) => { // <-- Ganti 'address'
     Alert.alert("Fitur \"Edit\" belum dibuat", "Kita perlu API PUT /addresses/:id dulu.");
     // navigation.navigate('EditAddress', { address: _address });
  }, []); // <-- Tidak ada dependensi

  // --- FIX 3: Bungkus 'renderItem' dengan 'useCallback' & tambahkan deps ---
  const renderItem = useCallback(({ item }: { item: Address }) => {
    const isSelected = selectedId === item.id;
    return (
      <AddressCard
        address={item}
        isSelected={isSelected}
        onSelect={() => setSelectedId(item.id)}
        onDelete={() => handleDelete(item.id)} // <-- Panggil 'handleDelete'
        onEdit={() => handleEdit(item)}     // <-- Panggil 'handleEdit'
      />
    );
  }, [selectedId, handleDelete, handleEdit]); // <-- Tambahkan 'handleDelete' & 'handleEdit'

  // --- FIX 3: Bungkus 'ListHeaderComponent' dengan 'useCallback' ---
  const renderListHeader = useCallback(() => (
    <TouchableOpacity
      style={styles.addNewButton}
      onPress={() => navigation.navigate('AddAddress')}
    >
      <FeatherIcon name="plus" size={16} color={COLORS.primary} />
      <Text style={styles.addNewButtonText}>Tambah Alamat Baru</Text>
    </TouchableOpacity>
  ), [navigation]);


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat Alamat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isSelectMode ? "Pilih Alamat" : "Alamat Saya"}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        // --- FIX 4: Casting 'addresses' untuk mengatasi type mismatch ---
        data={addresses as Address[]}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContent}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={ListEmptyComponent}
        ItemSeparatorComponent={renderItemSeparator}
      />
      
      {isSelectMode && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedId === undefined && styles.disabledConfirmButton,
            ]}
            onPress={handleConfirmAddress}
            disabled={selectedId === undefined}
          >
            <Text style={styles.confirmButtonText}>Konfirmasi Alamat</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// --- STYLESHEET (Disesuaikan) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.textMuted, fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { width: 40, height: 24, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { padding: 16, flexGrow: 1 },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  addNewButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.card, 
    overflow: 'hidden',
  },
  selectedAddressCard: { borderColor: COLORS.primary },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, 
    paddingTop: 16, 
    paddingHorizontal: 16,
  },
  addressTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  addressBody: { paddingHorizontal: 16, paddingBottom: 16 },
  addressName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6, 
  },
  addressDetail: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  actionButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  actionButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: { borderLeftWidth: 1, borderColor: COLORS.border },
  deleteButtonText: { color: COLORS.danger },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border, 
    backgroundColor: COLORS.card, 
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledConfirmButton: { backgroundColor: COLORS.border, opacity: 0.7 },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    minHeight: 250, 
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  // --- FIX 1: Pindahkan inline style ke sini ---
  itemSeparator: {
    height: 16,
  },
});
