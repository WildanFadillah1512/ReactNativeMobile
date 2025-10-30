// File: src/screens/AddressScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- IMPORTS INTI ---
import type { RootStackParamList } from '../../App';

import { useAddresses } from '../context/AddressContext';
// --- AKHIR IMPORTS ---

// Palet warna global
const COLORS = {
  background: '#0f172a',
  card: '#1e293b',
  textPrimary: 'white',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  primary: '#06b6d4',
  cyan: '#22d3ee',
  danger: '#ef4444',
  border: '#334155',
};

// Props tipe layar
type AddressScreenProps = NativeStackScreenProps<RootStackParamList, 'Address'>;

export default function AddressScreen({ route, navigation }: AddressScreenProps) {
  const { currentAddressId, items } = route.params;
  const { addresses, loading, deleteAddress } = useAddresses();

  const [selectedId, setSelectedId] = useState<number | undefined>(currentAddressId);
  const isAddressSelected = selectedId !== undefined;

  // === Fungsi: Konfirmasi alamat ===
  const handleConfirmAddress = () => {
    if (!isAddressSelected) {
      Alert.alert('Perhatian', 'Pilih salah satu alamat pengiriman.');
      return;
    }

    if (!items || items.length === 0) {
      Alert.alert('Error', 'Detail barang tidak ditemukan. Tidak dapat melanjutkan.');
      console.error(
        "AddressScreen: 'items' array is missing or empty when confirming address."
      );
      navigation.navigate('Cart');
      return;
    }

    navigation.navigate('Checkout', {
      items: items,
      selectedAddressId: selectedId as number,
    });
  };

  // === Fungsi: Hapus alamat ===
  const handleDelete = (id: number) => {
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
            console.error('Gagal menghapus alamat:', error);
            Alert.alert('Gagal', 'Tidak dapat menghapus alamat.');
          }
        },
      },
    ]);
  };

  // === Tampilan Loading ===
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

  // === Tampilan Utama ===
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilih Alamat</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tombol Tambah Alamat */}
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Icon name="plus" size={16} color={COLORS.cyan} />
          <Text style={styles.addNewButtonText}>Tambah Alamat Baru</Text>
        </TouchableOpacity>

        {/* Daftar Alamat */}
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="map-marker" size={50} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Belum ada alamat tersimpan.</Text>
            <Text style={styles.emptySubText}>Tambahkan alamat baru untuk melanjutkan.</Text>
          </View>
        ) : (
          addresses.map((address) => {
            const isSelected = selectedId === address.id;
            return (
              <View
                key={address.id}
                style={[styles.addressCard, isSelected && styles.selectedAddressCard]}
              >
                {/* Pilih Alamat */}
                <TouchableOpacity
                  onPress={() => setSelectedId(address.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressTitle}>{address.label}</Text>
                    {isSelected && (
                      <Icon name="check-circle" size={20} color={COLORS.cyan} />
                    )}
                  </View>
                  <View style={styles.addressBody}>
                    <Text style={styles.addressName}>{address.name}</Text>
                    <Text style={styles.addressDetail}>{address.phone}</Text>
                    <Text style={styles.addressDetail}>{address.fullAddress}</Text>
                  </View>
                </TouchableOpacity>

                {/* Aksi Edit & Hapus */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditAddress', { address })}
                  >
                    <Icon name="pencil" size={14} color={COLORS.textMuted} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(address.id)}
                  >
                    <Icon name="trash" size={14} color={COLORS.danger} />
                    <Text
                      style={[styles.actionButtonText, styles.deleteButtonText]}
                    >
                      Hapus
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !isAddressSelected && styles.disabledConfirmButton,
          ]}
          onPress={handleConfirmAddress}
          disabled={!isAddressSelected}
        >
          <Text style={styles.confirmButtonText}>Konfirmasi Alamat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// === Styles ===
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
    borderColor: COLORS.card,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  headerSpacer: { width: 40 },
  scrollContent: { padding: 16, flexGrow: 1 },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  addNewButtonText: {
    color: COLORS.cyan,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingTop: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedAddressCard: { borderColor: COLORS.primary },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  addressTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  addressBody: { paddingHorizontal: 16, paddingBottom: 16 },
  addressName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressDetail: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
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
    borderColor: COLORS.card,
    backgroundColor: COLORS.background,
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
    minHeight: 200,
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
});
