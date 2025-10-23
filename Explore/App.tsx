import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import TicketScreen from './src/screens/TicketScreen'; // Pastikan import ini benar

// Definisikan tipe parameter untuk setiap layar
export type RootStackParamList = {
  Onboarding: undefined; // Tidak ada parameter
  HomeTabs: undefined; // Merujuk ke HomeScreen, tidak ada parameter awal
  Detail: { item: any }; // Menerima parameter 'item'
  Tickets: undefined; // Tidak ada parameter
};

// Buat stack navigator dengan tipe yang sudah didefinisikan
const Stack = createNativeStackNavigator<RootStackParamList>();

// Komponen utama App
const App = () => {
  return (
    // Bungkus semua navigasi dalam NavigationContainer
    <NavigationContainer>
      {/* Atur status bar global */}
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Navigator utama */}
      <Stack.Navigator
        initialRouteName="Onboarding" // Layar awal
        screenOptions={{
          headerShown: false, // Sembunyikan header default
        }}
      >
        {/* Daftarkan setiap layar sebagai Stack.Screen */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="HomeTabs" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Tickets" component={TicketScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;