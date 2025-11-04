import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// --- 1. IMPOR TAB NAVIGATOR BARU ---
import MainTabNavigator from './MainTabNavigator';

// --- 2. IMPOR LAYAR AUTH & LAYAR NON-TAB LAINNYA ---
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
// HomeScreen, NotificationScreen, & ProfileScreen DIHAPUS dari sini
// karena mereka sudah ada di dalam MainTabNavigator
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

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        // --- 3. UBAH INITIAL ROUTE KE "Main" ---
        initialRouteName="Main" 
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Group
          screenOptions={{
            animation: 'slide_from_right',
          }}>
          
          {/* --- 4. DAFTARKAN TAB NAVIGATOR SEBAGAI SATU LAYAR --- */}
          <Stack.Screen name="Main" component={MainTabNavigator} />
          
          {/* --- 5. HAPUS LAYAR YANG SUDAH PINDAH KE TAB --- */}
          {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
          {/* <Stack.Screen name="Notifications" component={NotificationScreen} /> */}
          {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}

          {/* --- 6. SISAKAN SEMUA LAYAR NON-TAB DI SINI --- */}
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
          {/* Screen Notifikasi ada di Tab, jadi hapus dari sini jika ada */}
          
        </Stack.Group>
        
        {/* Grup Modal Anda sudah benar */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});