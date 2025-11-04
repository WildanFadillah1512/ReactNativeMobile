import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { COLORS } from '../config/theme'; 

// --- 1. IMPOR TIPE ---
import { type MainTabParamList } from './types'; 
// --- IMPOR BARU UNTUK TIPE ROUTE ---
import type { RouteProp } from '@react-navigation/native';

// Impor semua layar yang akan jadi TAB
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
// import ExploreScreen from '../screens/ExploreScreen';

// --- 2. BERIKAN TIPE KE NAVIGATOR ---
const Tab = createBottomTabNavigator<MainTabParamList>();

// Komponen placeholder (Sudah benar di luar)
const ExploreScreenPlaceholder = () => (
  <View style={styles.placeholderContainer}> 
    <Text>Explore Screen</Text>
  </View>
);
type ScreenOptionsProps = {
  route: RouteProp<MainTabParamList, keyof MainTabParamList>;
};

// Tentukan tipe untuk props tabBarIcon
type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const getScreenOptions = ({ route }: ScreenOptionsProps) => ({
  // 'tabBarIcon' masih sebuah fungsi, tapi ini adalah pola yang
  // diterima React Navigation. Linter sekarang seharusnya puas
  // karena 'getScreenOptions' (induknya) sudah stabil.
  tabBarIcon: ({ focused, color, size: _size }: TabBarIconProps) => { 
    let iconName: string; 
    const iconSize = focused ? 26 : 22; 

    switch (route.name) {
      case 'Home':
        iconName = 'cube';
        break;
      case 'Explore':
        iconName = 'search';
        break;
      case 'Notifications':
        iconName = focused ? 'bell' : 'bell-o';
        break;
      case 'Profile':
        iconName = focused ? 'user' : 'user-o';
        break;
    }
    return <Icon name={iconName} size={iconSize} color={color} />;
  },
  
  // Opsi lainnya tetap sama
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.textMuted,
  tabBarShowLabel: true,
  tabBarStyle: {
    backgroundColor: COLORS.background, 
    borderTopColor: COLORS.border,
  },
});
// --- AKHIR BLOK FUNGSI BARU ---


export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      // --- 4. GUNAKAN REFERENSI FUNGSI YANG STABIL ---
      screenOptions={getScreenOptions} 
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }} 
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreenPlaceholder} 
        options={{ title: 'Explorer' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{ title: 'Notif' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});