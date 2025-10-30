// File: src/navigation/RootNavigator.tsx
// File ini HANYA bertanggung jawab untuk mendefinisikan tumpukan (stack) navigasi

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 🧭 Import semua screen yang dibutuhkan
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AddressScreen from '../screens/AddressScreen';
import SuccessScreen from '../screens/SuccessScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import EditAddressScreen from '../screens/EditAddressScreen';
import ChatScreen from '../screens/ChatScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import AllReviewsScreen from '../screens/AllReviewsScreen';
import SavedScreen from '../screens/SavedScreen';
import CartScreen from '../screens/CartScreen';
import SearchHistoryScreen from '../screens/SearchHistoryScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import NotificationScreen from '../screens/NotificationScreen';

// Impor tipe RootStackParamList dari file types
import type { RootStackParamList } from './types';

// Buat Stack Navigator di sini
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        // Pindahkan semua logika <Stack.Navigator> ke sini
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            {/* Definisi Stack Screen */}
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
    );
}