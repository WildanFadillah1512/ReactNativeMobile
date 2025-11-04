import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAddress } from '../context/AddressContext'; // <-- Gunakan hook 'useAddress'
import { COLORS } from '../config/theme';

type AddAddressScreenProps = NativeStackScreenProps<RootStackParamList, 'AddAddress'>;

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

export default function AddAddressScreen({ navigation }: AddAddressScreenProps) {
  // --- 1. Panggil hook 'useAddress' ---
  const { addAddress } = useAddress();
  
  // --- 2. Sesuaikan State dengan schema.prisma ---
  const [label, setLabel] = useState('');
  const [receiverName, setReceiverName] = useState(''); // Ganti 'name'
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState(''); // Ganti 'fullAddress'
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Validasi form
  const validateForm = () => {
    if (!label || !receiverName || !phone || !street || !city || !province || !postalCode) {
      Alert.alert("Form Tidak Lengkap", "Mohon isi semua field yang diperlukan.");
      return false;
    }
    return true;
  };

  // --- 3. Sesuaikan fungsi 'handleSave' ---
  const handleSaveAddress = async () => {
    if (!validateForm() || isLoading) return;

    setIsLoading(true);

    // Buat objek baru sesuai tipe NewAddressData di context
    const newAddressData = {
      label,
      receiverName,
      phone,
      street,
      city,
      province,
      postalCode,
    };

    try {
      const success = await addAddress(newAddressData);
      
      if (success) {
        Alert.alert("Sukses", "Alamat baru berhasil disimpan.");
        navigation.goBack(); // Kembali ke AddressScreen
      }
      // Jika gagal, context akan otomatis menampilkan Alert error
      
    } catch (error) {
      // Ini sebagai fallback jika promise reject (seharusnya tidak terjadi)
      console.error("Gagal menyimpan alamat:", error);
      Alert.alert("Error", "Gagal menyimpan alamat baru.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Alamat Baru</Text>
        <View style={styles.headerButton} /> 
      </View>

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
          onPress={handleSaveAddress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Alamat</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- 4. Sesuaikan StyleSheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerButton: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
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

