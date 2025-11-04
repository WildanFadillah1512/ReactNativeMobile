import type { RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- 1. SESUAIKAN IMPOR ---
// Hapus 'Address' dari sini, karena kita akan definisikan di bawah
import type { ApiSeller, CheckoutRentalItem } from '../types'; 

// --- 2. DEFINISIKAN TIPE 'ADDRESS' BARU ---
// Tipe ini sekarang cocok dengan schema.prisma dan API backend Anda
export type Address = {
  id: number;
  label: string;
  receiverName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
  createdAt: string; // Prisma mengembalikan DateTime sebagai string ISO
  userId: number;
};

// --- 3. Tipe Bottom Tab Navigator (Sudah Benar) ---
export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// --- 4. Tipe Root Stack Navigator (Disesuaikan) ---
export type RootStackParamList = {
  // --- LAYAR AUTENTIKASI ---
  Login: undefined;
  Register: undefined;

  // --- LAYAR MAIN APP (BERISI TAB) ---
  Main: NavigatorScreenParams<MainTabParamList>; 

  // --- LAYAR STACK LAINNYA ---
  Detail: {
    productId: number;
  };
  Checkout: {
    items: CheckoutRentalItem[];
    selectedAddressId?: number;
  };
  Address: {
    currentAddressId?: number;
    // 'items' dibuat opsional (?) karena tidak selalu dikirim
    // (misal, saat navigasi dari ProfileScreen)
    items?: CheckoutRentalItem[]; 
  };
  Success: undefined;

  AddAddress: undefined;
  EditAddress: { 
    // 'address' sekarang menggunakan tipe 'Address' baru yang kita definisikan di atas
    address: Address 
  };
  Chat: {
    sellerId: number;
    sellerName: string;
    itemId?: number;
    sellerAvatar?: string | null;
  };
  SellerProfile: { seller: ApiSeller };
  AllReviews: { itemId: number; productName: string };
  Saved: undefined;
  Cart: undefined;
  SearchHistory: undefined;
  SearchResults: { query: string };
};


// --- Tipe Helper (Sudah Benar) ---
export type RootStackNavigationProp<
  T extends keyof RootStackParamList = 'Main', 
> = NativeStackNavigationProp<RootStackParamList, T>;

export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;

