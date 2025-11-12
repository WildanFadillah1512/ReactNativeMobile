import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- 1. Impor tipe dari 'navigation/types' ---
import { RootStackParamList } from '../navigation/types'; 
import { useAddress } from '../context/AddressContext';
import { COLORS } from '../config/theme';

type EditAddressScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditAddress'
>;

// Komponen Input Kustom (agar rapi)
const FormInput = ({ label, value, onChangeText, placeholder, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      {...props}
    />
  </View>
);

export default function EditAddressScreen({
  route,
  navigation,
}: EditAddressScreenProps) {
  // Ambil alamat yang akan diedit dari parameter navigasi
  const { address } = route.params;

  // --- 2. Panggil hook 'useAddress' ---
  const { updateAddress } = useAddress();
  const [isLoading, setIsLoading] = useState(false);

  // --- 3. Sesuaikan State dengan schema.prisma ---
  // Kita isi state awal dengan data 'address' dari route.params
  const [label, setLabel] = useState(address.label);
  const [receiverName, setReceiverName] = useState(address.receiverName);
  const [phone, setPhone] = useState(address.phone);
  const [street, setStreet] = useState(address.street);
  const [city, setCity] = useState(address.city);
  const [province, setProvince] = useState(address.province);
  const [postalCode, setPostalCode] = useState(address.postalCode);

  const validateForm = () => {
    if (!label || !receiverName || !phone || !street || !city || !province || !postalCode) {
      Alert.alert("Form Tidak Lengkap", "Mohon isi semua field yang diperlukan.");
      return false;
    }
    return true;
  };

  // --- 4. Sesuaikan fungsi 'handleSaveChanges' ---
  const handleSaveChanges = async () => {
    if (!validateForm() || isLoading) return;

    setIsLoading(true);

    // Buat objek baru (bertipe NewAddressData)
    const updatedData = {
      label,
      receiverName,
      phone,
      street,
      city,
      province,
      postalCode,
      // Properti di bawah ini tidak ada di NewAddressData, jadi jangan dikirim
      // name: '', 
      // fullAddress: '', 
    };

    try {
      // Panggil 'updateAddress' dari context dengan ID dan data baru
      const success = await updateAddress(address.id, updatedData);
      
      if (success) {
        Alert.alert("Berhasil", "Perubahan alamat telah disimpan.", [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
      // Jika gagal, context akan otomatis menampilkan Alert error
      
    } catch (error) {
      console.error('Gagal memperbarui alamat:', error);
      Alert.alert(
        'Gagal',
        'Terjadi kesalahan saat menyimpan perubahan. Coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Alamat</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* --- 5. Sesuaikan Form Input --- */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Info Kontak</Text>
        <View style={styles.card}>
          <FormInput
            label="Label Alamat"
            value={label}
            onChangeText={setLabel}
            placeholder="Contoh: Rumah, Kantor"
          />
          <FormInput
            label="Nama Penerima"
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="Nama Lengkap Penerima"
          />
          <FormInput
            label="Nomor HP"
            value={phone}
            onChangeText={setPhone}
            placeholder="0812..."
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Detail Alamat</Text>
        <View style={styles.card}>
          <FormInput
            label="Jalan"
            value={street}
            onChangeText={setStreet}
            placeholder="Nama jalan, nomor rumah, RT/RW"
            multiline
          />
          <FormInput
            label="Kota/Kabupaten"
            value={city}
            onChangeText={setCity}
            placeholder="Contoh: Jakarta Selatan"
          />
          <FormInput
            label="Provinsi"
            value={province}
            onChangeText={setProvince}
            placeholder="Contoh: DKI Jakarta"
          />
          <FormInput
            label="Kode Pos"
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="12345"
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
      </ScrollView>

      {/* Tombol Simpan */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- 6. Ganti Stylesheet (dari AddAddressScreen) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  headerSpacer: { width: 40 },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  footer: {
    backgroundColor: COLORS.card,
    padding: 16,
    paddingBottom: 24, // Beri jarak lebih untuk safe area
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: { backgroundColor: COLORS.textMuted },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});