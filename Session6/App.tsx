import React from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import layar Anda
import MovieListScreen from './src/screens/MovieListScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
// (BARU) Impor layar-layar Lagu
import SongListScreen, { Song } from './src/screens/SongListScreen'; // <-- Impor 'Song'
import SongDetailScreen from './src/screens/SongDetailScreen'; // <-- Impor layar baru

// --- Mendefinisikan Tipe Parameter Navigasi ---

// (1) Tipe untuk Movie Stack
export type RootStackParamList = {
  MovieList: undefined;
  MovieDetail: { id: string; title?: string };
};

// (2) TIPE BARU untuk Song Stack
export type SongStackParamList = {
  SongList: undefined;
  SongDetail: { song: Song }; // <-- Kita akan mengirim seluruh objek 'song'
};

// (3) Tipe untuk Tab Utama
type RootTabParamList = {
  Movies: undefined; // Merujuk ke MovieStack
  Songs: undefined;  // Merujuk ke SongStack
};

// --- Membuat Navigator ---
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const SongStackNav = createNativeStackNavigator<SongStackParamList>(); // <-- Stack baru untuk Lagu

// --- Sub-Navigator untuk Movie (Stack) ---
// (Tidak ada perubahan di sini)
const MovieStack = () => (
  <Stack.Navigator
    initialRouteName="MovieList"
    screenOptions={{
      headerStyle: { backgroundColor: '#222' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="MovieList"
      component={MovieListScreen}
      options={{ title: 'Studio Ghibli Films' }}
    />
    <Stack.Screen
      name="MovieDetail"
      component={MovieDetailScreen}
      options={({ route }) => ({
        title: route.params?.title || 'Movie Detail',
      })}
    />
  </Stack.Navigator>
);

// --- (BARU) Sub-Navigator untuk Song (Stack) ---
// Dibuat agar 'SongList' bisa navigasi ke 'SongDetail'
const SongStack = () => (
  <SongStackNav.Navigator
    initialRouteName="SongList"
    screenOptions={{
      headerStyle: { backgroundColor: '#222' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <SongStackNav.Screen 
      name="SongList" 
      component={SongListScreen} 
      options={{ title: 'Top Songs' }} 
    />
    <SongStackNav.Screen
      name="SongDetail"
      component={SongDetailScreen}
      options={({ route }) => ({
        // Judul header diambil dari parameter 'song' yang dikirim
        title: route.params.song.title,
      })}
    />
  </SongStackNav.Navigator>
);

// --- Root App (Tab Navigator) ---
const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#aaa',
          tabBarStyle: {
            backgroundColor: '#222',
            paddingBottom: 5,
            height: 60,
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, size }) => {
            let iconName = 'radio-button-on'; // Ikon default
            if (route.name === 'Movies') {
              iconName = 'theaters'; // Ikon bioskop/film
            } else if (route.name === 'Songs') {
              iconName = 'headphones'; // Ikon headphone
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        {/* Tab pertama (Movies) */}
        <Tab.Screen
          name="Movies"
          component={MovieStack}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'MovieList';
            const shouldHideTabBar = routeName === 'MovieDetail';
            return {
              tabBarStyle: {
                display: shouldHideTabBar ? 'none' : 'flex',
                backgroundColor: '#222',
                paddingBottom: 5,
                height: 60,
              },
            };
          }}
        />

        {/* Tab kedua (Songs) - DIGANTI */}
        <Tab.Screen
          name="Songs"
          component={SongStack} // <-- Gunakan SongStack, bukan SongListScreen
          options={({ route }) => {
            // Logika yang sama untuk menyembunyikan tab bar di detail
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'SongList';
            const shouldHideTabBar = routeName === 'SongDetail';
            return {
              tabBarStyle: {
                display: shouldHideTabBar ? 'none' : 'flex',
                backgroundColor: '#222',
                paddingBottom: 5,
                height: 60,
              },
            };
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;