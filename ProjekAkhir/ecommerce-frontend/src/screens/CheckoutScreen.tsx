// File: src/screens/CheckoutScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAddresses } from '../context/AddressContext';
import type { Address, CheckoutRentalItem } from '../types';
import { parsePrice, formatCurrency } from '../utils/riceParse';
import { COLORS } from '../config/theme';

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const vaOptions = [
  { id: 'bca', name: 'BCA Virtual Account' },
  { id: 'mandiri', name: 'Mandiri Virtual Account' },
  { id: 'bri', name: 'BRI Virtual Account' },
  { id: 'bni', name: 'BNI Virtual Account' },
];

const eWalletOptions = [
  { id: 'gopay', name: 'GoPay' },
  { id: 'ovo', name: 'OVO' },
  { id: 'dana', name: 'DANA' },
  { id: 'shopeepay', name: 'ShopeePay' },
];

export default function CheckoutScreen({ route, navigation }: CheckoutScreenProps) {
  const { items, selectedAddressId: initialSelectedAddressId } = route.params as {
    items: CheckoutRentalItem[];
    selectedAddressId?: number;
  };

  const { loading, getAddressById } = useAddresses();

  // === STATE ===
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(
    initialSelectedAddressId
  );
  const [paymentMethod, setPaymentMethod] = useState<'va' | 'ewallet'>('va');
  const [selectedOption, setSelectedOption] = useState<string>('bca');

  // === Update alamat ketika kembali dari AddressScreen ===
  useEffect(() => {
    if (route.params?.selectedAddressId) {
      setSelectedAddressId(route.params.selectedAddressId);
    }
  }, [route.params?.selectedAddressId]);

  // === Ambil detail alamat ===
  const selectedAddress: Address | undefined = useMemo(() => {
    return selectedAddressId ? getAddressById(selectedAddressId) : undefined;
  }, [selectedAddressId, getAddressById]);

  // === Biaya tetap ===
  const serviceFee = 5000;
  const deposit = 25000;

  // === Perhitungan total semua item ===
  const { subtotal, totalCost } = useMemo(() => {
    let totalSub = 0;
    items.forEach((it) => {
      const pPerUnit = parsePrice(it.price);
      totalSub += pPerUnit * it.duration;
    });
    const total = totalSub + serviceFee + deposit;
    return { subtotal: totalSub, totalCost: total };
  }, [items]);

  // === Ganti metode pembayaran ===
  const handlePaymentMethodChange = (method: 'va' | 'ewallet') => {
    setPaymentMethod(method);
    if (method === 'va' && vaOptions.length > 0) setSelectedOption(vaOptions[0].id);
    else if (method === 'ewallet' && eWalletOptions.length > 0)
      setSelectedOption(eWalletOptions[0].id);
  };

  // === Konfirmasi pesanan ===
  const handleConfirmOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Alamat Belum Dipilih', 'Silakan pilih alamat pengiriman terlebih dahulu.');
      return;
    }

    console.log('✅ Order Confirmed:', {
      items,
      selectedAddress,
      paymentMethod,
      selectedOption,
      totalCost,
    });

    navigation.navigate('Success');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Sewa</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Barang Sewaan */}
        <Text style={styles.sectionTitle}>Barang Sewaan</Text>
        {items.map((it) => (
          <View key={it.id} style={styles.itemSummaryCard}>
            <Image source={it.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{it.name}</Text>
              <Text style={styles.itemLocation}>{it.location}</Text>
              <Text style={styles.itemPrice}>
                {`${it.price}${it.period}`} × {it.duration} {it.period.substring(1)}
              </Text>
            </View>
          </View>
        ))}

        {/* Alamat Pengiriman */}
        <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
        <TouchableOpacity
          style={styles.addressCard}
          onPress={() =>
            navigation.navigate('Address', {
              currentAddressId: selectedAddressId,
              items: items,
            })
          }
          activeOpacity={0.7}
        >
          {selectedAddress ? (
            <>
              <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>{selectedAddress.label}</Text>
                <View style={styles.changeButtonContainer}>
                  <Text style={styles.changeButtonText}>Ubah</Text>
                  <Icon
                    name="chevron-right"
                    size={14}
                    color={COLORS.primary}
                    style={styles.changeIcon}
                  />
                </View>
              </View>
              <View style={styles.addressBody}>
                <Text style={styles.addressName}>{selectedAddress.name}</Text>
                <Text style={styles.addressDetail}>{selectedAddress.phone}</Text>
                <Text style={styles.addressDetail}>{selectedAddress.fullAddress}</Text>
              </View>
            </>
          ) : (
            <View style={styles.addressPlaceholder}>
              <Icon name="map-marker" size={18} color={COLORS.textMuted} />
              <Text style={styles.addressPlaceholderText}>Pilih Alamat Pengiriman</Text>
              <Icon name="chevron-right" size={14} color={COLORS.textMuted} />
            </View>
          )}
        </TouchableOpacity>

        {/* Metode Pembayaran */}
        <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[styles.paymentButton, paymentMethod === 'va' && styles.paymentActive]}
            onPress={() => handlePaymentMethodChange('va')}
          >
            <Icon
              name="credit-card"
              size={20}
              color={paymentMethod === 'va' ? 'white' : COLORS.textMuted}
            />
            <Text style={[styles.paymentText, paymentMethod === 'va' && styles.paymentTextActive]}>
              Virtual Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentButton, paymentMethod === 'ewallet' && styles.paymentActive]}
            onPress={() => handlePaymentMethodChange('ewallet')}
          >
            <Icon
              name="mobile"
              size={22}
              color={paymentMethod === 'ewallet' ? 'white' : COLORS.textMuted}
            />
            <Text
              style={[styles.paymentText, paymentMethod === 'ewallet' && styles.paymentTextActive]}
            >
              E-Wallet
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Opsi Pembayaran */}
        <View style={styles.paymentListContainer}>
          {(paymentMethod === 'va' ? vaOptions : eWalletOptions).map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.paymentListItem}
              onPress={() => setSelectedOption(option.id)}
            >
              <Text style={styles.paymentListText}>{option.name}</Text>
              <Icon
                name={selectedOption === option.id ? 'check-circle' : 'circle-thin'}
                size={20}
                color={selectedOption === option.id ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Rincian Biaya */}
        <Text style={styles.sectionTitle}>Rincian Biaya</Text>
        <View style={styles.costDetailsCard}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal</Text>
            <Text style={styles.costValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Biaya Layanan</Text>
            <Text style={styles.costValue}>{formatCurrency(serviceFee)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Deposit (Jaminan)</Text>
            <Text style={styles.costValue}>{formatCurrency(deposit)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.costRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPriceInfo}>
          <Text style={styles.footerTotalLabel}>Total Bayar</Text>
          <Text style={styles.footerTotalValue}>{formatCurrency(totalCost)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedAddress && styles.confirmButtonDisabled]}
          onPress={handleConfirmOrder}
          disabled={!selectedAddress}
        >
          <Text style={styles.confirmButtonText}>Konfirmasi & Bayar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  scrollContent: { padding: 16, paddingBottom: 24 },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
  },
  itemSummaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: 'bold' },
  itemLocation: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  itemPrice: { color: COLORS.primary, fontSize: 13, fontWeight: '600', marginTop: 8 },
  addressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  changeButtonContainer: { flexDirection: 'row', alignItems: 'center' },
  changeButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  changeIcon: { marginLeft: 4 },
  addressBody: { marginTop: 4 },
  addressName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  addressDetail: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  addressPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressPlaceholderText: { color: COLORS.textMuted, fontSize: 14, flex: 1, marginLeft: 10 },
  paymentOptions: { flexDirection: 'row', marginBottom: 10 },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  paymentText: { color: COLORS.textMuted, marginLeft: 8, fontWeight: '600', fontSize: 13 },
  paymentTextActive: { color: 'white' },
  paymentListContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  paymentListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  paymentListText: { color: COLORS.textSecondary, fontSize: 14 },
  costDetailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  costLabel: { color: COLORS.textSecondary, fontSize: 14 },
  costValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.card,
    backgroundColor: COLORS.background,
  },
  footerPriceInfo: { flex: 1, marginRight: 10 },
  footerTotalLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 2 },
  footerTotalValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexShrink: 1,
  },
  confirmButtonDisabled: { backgroundColor: COLORS.border, opacity: 0.7 },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
