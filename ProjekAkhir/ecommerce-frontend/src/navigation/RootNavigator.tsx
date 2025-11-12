import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Mengimpor hook 'useAuth'
import { useAuth } from '../context/AuthContext';

// 2. Impor Tab Navigator
import MainTabNavigator from './MainTabNavigator';

// 3. Impor semua layar aplikasi lainnya
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
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

// --- [BARU] Impor layar Riwayat Sewa ---
import RentalHistoryScreen from '../screens/RentalHistoryScreen';

// 4. Impor tipe Root Stack
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
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}>
        
        {/* GRUP 1: LAYAR APLIKASI UTAMA */}
        <Stack.Group
          screenOptions={{
            animation: 'slide_from_right',
          }}>
          
          <Stack.Screen name="Main" component={MainTabNavigator} />
          
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

          {/* --- [BARU] Daftarkan layar Riwayat Sewa --- */}
          <Stack.Screen name="RentalHistory" component={RentalHistoryScreen} />
          
        </Stack.Group>
        
        {/* GRUP 2: LAYAR MODAL (AUTENTIKASI) */}
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
    backgroundColor: '#ffffff', // Ganti dengan warna background tema Anda
  },
});