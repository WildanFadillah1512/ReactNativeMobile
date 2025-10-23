// File: src/screens/EditAddressScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { useAddresses } from '../context/AddressContext';
import type { Address } from '../types'; // ✅ gunakan tipe global yang konsisten

type EditAddressScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditAddress'
>;

export default function EditAddressScreen({
  route,
  navigation,
}: EditAddressScreenProps) {
  // Ambil alamat yang akan diedit dari parameter navigasi
  const { address } = route.params;

  // State untuk setiap field
  const [label, setLabel] = useState(address.label);
  const [name, setName] = useState(address.name);
  const [phone, setPhone] = useState(address.phone);
  const [fullAddress, setFullAddress] = useState(address.fullAddress);

  const { updateAddress } = useAddresses();

  const handleSaveChanges = async () => {
    if (!label.trim() || !name.trim() || !phone.trim() || !fullAddress.trim()) {
      Alert.alert('Form Tidak Lengkap', 'Mohon isi semua kolom yang tersedia.');
      return;
    }

    // ✅ Buat objek alamat baru dengan tipe lengkap
    const updatedAddress: Address = {
      id: address.id,
      label,
      name,
      phone,
      fullAddress,
      latitude: address.latitude ?? 0,
      longitude: address.longitude ?? 0,
    };

    try {
      await updateAddress(updatedAddress);
      Alert.alert('Berhasil', 'Perubahan alamat telah disimpan.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Gagal memperbarui alamat:', error);
      Alert.alert(
        'Gagal',
        'Terjadi kesalahan saat menyimpan perubahan. Coba lagi.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Alamat</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Form */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.inputLabel}>
          Label Alamat (Contoh: Rumah, Kantor)
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Label Alamat"
            placeholderTextColor="#94a3b8"
            value={label}
            onChangeText={setLabel}
          />
        </View>

        <Text style={styles.inputLabel}>Nama Penerima</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.inputLabel}>Nomor Telepon</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nomor Telepon Aktif"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Text style={styles.inputLabel}>Alamat Lengkap</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
            placeholderTextColor="#94a3b8"
            multiline
            value={fullAddress}
            onChangeText={setFullAddress}
          />
        </View>
      </ScrollView>

      {/* Tombol Simpan */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleSaveChanges}
        >
          <Text style={styles.confirmButtonText}>Simpan Perubahan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================
// 🎨 STYLES
// ============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  headerSpacer: { width: 40 },
  scrollContent: { padding: 16 },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textAreaContainer: {
    height: 120,
  },
  input: {
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#1e293b',
  },
  confirmButton: {
    backgroundColor: '#06b6d4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
