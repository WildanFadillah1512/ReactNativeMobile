// File: src/navigation/types.ts
// Ini adalah satu-satunya tempat untuk mendefinisikan tipe navigasi Anda.

// Impor tipe-tipe dasar navigasi
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Impor tipe-tipe yang dibutuhkan oleh parameter navigasi
// (Tipe-tipe ini sekarang diimpor di sini, bukan di App.tsx)
import type { Address, ApiSeller, CheckoutRentalItem } from '../types';

// ===================================================================
// 1. Definisi Root Stack Param List (Dipindahkan dari App.tsx)
// ===================================================================
export type RootStackParamList = {
    Home: {
        activeTabId?: 'home' | 'explore' | 'profile' | 'saved'; // Sesuaikan tab
    } | undefined;

    // 'Detail' sekarang HANYA menerima 'productId' (angka).
    Detail: {
        productId: number;
    };

    // Produk & checkout (Menggunakan CheckoutRentalItem - Tipe terformat)
    Checkout: {
        items: CheckoutRentalItem[];
        selectedAddressId?: number;
    };
    Address: {
        currentAddressId?: number;
        items: CheckoutRentalItem[]; // Butuh 'items' untuk kembali ke Checkout
    };
    Success: undefined;

    // Manajemen alamat (Menggunakan Address)
    AddAddress: undefined;
    EditAddress: { address: Address };

    // Chat & profil seller
    Chat: {
        sellerId: number;
        sellerName: string;
        itemId?: number;
        sellerAvatar?: string | null; // <-- FIX: Sesuai dengan ApiSeller (bisa null)
    };

    // 'SellerProfile' sekarang menerima 'ApiSeller' (tipe baru dari API).
    SellerProfile: { seller: ApiSeller }; // <-- FIX: Menggunakan ApiSeller

    // Review, favorit, keranjang
    AllReviews: { itemId: number; productName: string };
    Saved: undefined;
    Cart: undefined;

    // Pencarian
    SearchHistory: undefined;
    SearchResults: { query: string };

    // Notifikasi
    Notifications: undefined;
};

// ===================================================================
// 2. Tipe Helper (Juga dipindahkan dari App.tsx)
// ===================================================================
// Tipe ini akan Anda impor di setiap screen untuk hook useNavigation dan useRoute

export type RootStackNavigationProp<T extends keyof RootStackParamList = 'Home'> = 
  NativeStackNavigationProp<RootStackParamList, T>;
  
export type RootStackRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>;