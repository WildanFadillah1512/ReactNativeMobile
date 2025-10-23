// File: App.tsx

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

// 🧩 Import context & types
import { AddressProvider } from './src/context/AddressContext';
import { ChatProvider } from './src/context/ChatContext';
import { ReviewProvider } from './src/context/ReviewContext';
import { LikeProvider } from './src/context/LikeContext';
import { CartProvider } from './src/context/CartContext';
// Import types DARI types.ts (asumsi Address didefinisikan di types.ts juga)
import type { Address, RentalItem, Seller, CheckoutRentalItem } from './src/types';

// 🚀 Definisi navigasi utama — sudah support single & multiple items
export type RootStackParamList = {
  Home: {
    activeTabId?: 'home' | 'explore' | 'profile';
  } | undefined;

  Detail: { item: RentalItem };

  // ✅ Checkout bisa dari Detail (1 item, dikirim sbg array) atau Cart (banyak item)
  Checkout: {
    items: CheckoutRentalItem[]; // Selalu array
    selectedAddressId?: number;
  };

  // ✅ Address menerima array items untuk dikirim kembali
  Address: {
    currentAddressId?: number;
    items: CheckoutRentalItem[]; // Selalu array
  };

  Success: undefined;
  AddAddress: undefined;
  EditAddress: { address: Address }; // Pastikan tipe Address konsisten

  Chat: {
    sellerId: number;
    sellerName: string;
    itemId?: number; // Asumsi ID tetap number
    sellerAvatar?: string;
  };

  SellerProfile: { seller: Seller };

  AllReviews: { itemId: number; productName: string }; // Asumsi ID tetap number

  Saved: undefined;
  Cart: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
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
                    animation: 'fade',
                  }}
                >
                  {/* Halaman utama */}
                  <Stack.Screen name="Home" component={HomeScreen} />

                  {/* Produk & checkout */}
                  <Stack.Screen name="Detail" component={DetailScreen} />
                  <Stack.Screen name="Address" component={AddressScreen} />
                  <Stack.Screen name="Checkout" component={CheckoutScreen} />
                  <Stack.Screen name="Success" component={SuccessScreen} />

                  {/* Manajemen alamat */}
                  <Stack.Screen name="AddAddress" component={AddAddressScreen} />
                  <Stack.Screen name="EditAddress" component={EditAddressScreen} />

                  {/* Chat & profil seller */}
                  <Stack.Screen name="Chat" component={ChatScreen} />
                  <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />

                  {/* Review, favorit, keranjang */}
                  <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
                  <Stack.Screen name="Saved" component={SavedScreen} />
                  <Stack.Screen name="Cart" component={CartScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </ReviewProvider>
          </AddressProvider>
        </ChatProvider>
      </LikeProvider>
    </CartProvider>
  );
}