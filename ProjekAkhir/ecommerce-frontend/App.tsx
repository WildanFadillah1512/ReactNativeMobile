// File: App.tsx (FINAL - RootStackParamList Diperbaiki dengan ApiSeller)

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 🧭 Import semua screen
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import AddressScreen from './src/screens/AddressScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import AddAddressScreen from './src/screens/AddAddressScreen';
import EditAddressScreen from './src/screens/EditAddressScreen';
import ChatScreen from './src/screens/ChatScreen';
import SellerProfileScreen from './src/screens/SellerProfileScreen';
import AllReviewsScreen from './src/screens/AllReviewsScreen';
import SavedScreen from './src/screens/SavedScreen';
import CartScreen from './src/screens/CartScreen';
import SearchHistoryScreen from './src/screens/SearchHistoryScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import NotificationScreen from './src/screens/NotificationScreen';

// 🧩 Import context
import { AddressProvider } from './src/context/AddressContext';
import { ChatProvider } from './src/context/ChatContext';
import { ReviewProvider } from './src/context/ReviewContext';
import { LikeProvider } from './src/context/LikeContext';
import { CartProvider } from './src/context/CartContext';

// --- PERBAIKAN 1: IMPORT TIPE YANG BENAR ---
// Impor ApiSeller (baru), Address, CheckoutRentalItem.
// Hapus Seller (lama) dan RentalItem (lama).
import type { Address, ApiSeller, CheckoutRentalItem } from './src/types'; // Pastikan path ke types.ts benar
// --- AKHIR PERBAIKAN 1 ---


// --- PERBAIKAN 2: DEFINISI NAVIGASI UTAMA (RootStackParamList - FINAL) ---
export type RootStackParamList = {
    Home: {
        activeTabId?: 'home' | 'explore' | 'profile'; // Tambahkan 'saved' jika perlu
    } | undefined;

    // 'Detail' sekarang HANYA menerima 'productId' (angka).
    Detail: {
        productId: number;
    };

    // Produk & checkout (Menggunakan CheckoutRentalItem - Tipe terformat, sudah benar)
    Checkout: {
        items: CheckoutRentalItem[];
        selectedAddressId?: number;
    };
    Address: {
        currentAddressId?: number;
        items: CheckoutRentalItem[]; // Butuh 'items' untuk kembali ke Checkout
    };
    Success: undefined;

    // Manajemen alamat (Menggunakan Address - Sudah benar)
    AddAddress: undefined;
    EditAddress: { address: Address };

    // Chat & profil seller
    Chat: {
        sellerId: number;
        sellerName: string;
        itemId?: number;
        sellerAvatar?: string | null; // <-- FIX: Sesuaikan dengan ApiSeller (bisa null)
    };

    // 'SellerProfile' sekarang menerima 'ApiSeller' (tipe baru dari API).
    SellerProfile: { seller: ApiSeller }; // <-- FIX: Menggunakan ApiSeller

    // Review, favorit, keranjang (Parameter sudah benar)
    AllReviews: { itemId: number; productName: string };
    Saved: undefined;
    Cart: undefined;

    // Pencarian (Parameter sudah benar)
    SearchHistory: undefined;
    SearchResults: { query: string };

    // Notifikasi (Parameter sudah benar)
    Notifications: undefined;
};
// --- AKHIR PERBAIKAN 2 ---

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        // Rantai Provider Anda sudah terstruktur dengan baik
        <CartProvider>
            <LikeProvider>
                <ChatProvider>
                    <AddressProvider>
                        <ReviewProvider>
                            <NavigationContainer>
                                <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
                                <Stack.Navigator
                                    initialRouteName="Home"
                                    screenOptions={{
                                        headerShown: false,
                                        animation: 'slide_from_right', // Atau 'fade'
                                    }}
                                >
                                    {/* Definisi Stack Screen Anda sudah lengkap */}
                                    <Stack.Screen name="Home" component={HomeScreen} />
                                    <Stack.Screen name="SearchHistory" component={SearchHistoryScreen} />
                                    <Stack.Screen name="SearchResults" component={SearchResultsScreen} />

                                    <Stack.Screen name="Detail" component={DetailScreen} />
                                    <Stack.Screen name="Address" component={AddressScreen} />
                                    <Stack.Screen name="Checkout" component={CheckoutScreen} />
                                    <Stack.Screen name="Success" component={SuccessScreen} />

                                    <Stack.Screen name="AddAddress" component={AddAddressScreen} />
                                    <Stack.Screen name="EditAddress" component={EditAddressScreen} />

                                    <Stack.Screen name="Chat" component={ChatScreen} />
                                    <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />

                                    <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
                                    <Stack.Screen name="Saved" component={SavedScreen} />
                                    <Stack.Screen name="Cart" component={CartScreen} />
                                    <Stack.Screen name="Notifications" component={NotificationScreen} />

                                </Stack.Navigator>
                            </NavigationContainer>
                        </ReviewProvider>
                    </AddressProvider>
                </ChatProvider>
            </LikeProvider>
        </CartProvider>
    );
}