import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  SectionList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// --- Impor Tipe (Sudah Benar) ---
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// --- 1. [PENYESUAIAN] Impor tipe navigasi Root ---
import { 
  type RootStackParamList, 
  type MainTabParamList,
  type RootStackNavigationProp // Impor tipe helper navigasi
} from '../navigation/types'; 

import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api'; 
import { COLORS } from '../config/theme';
// Hapus: import type { RootStackNavigationProp } from '../navigation/types';

// Tipe data
type ApiUser = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
};

const DefaultAvatar = require('../assets/images/logo.png');

// --- Komponen Loading (Sudah Benar) ---
const LoadingView = () => (
  <View style={styles.fullScreenCenter}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

// --- Komponen LoggedOut (Sudah Benar) ---
const LoggedOutView = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  return (
    <View style={styles.fullScreenCenter}>
      <View style={styles.loggedOutCard}>
        <Image source={DefaultAvatar} style={styles.logo} />
        <Text style={styles.loggedOutTitle}>Anda Belum Login</Text>
        <Text style={styles.loggedOutSubtitle}>
          Login atau daftar untuk melihat profil, riwayat sewa, dan lainnya.
        </Text>
        <TouchableOpacity
          style={styles.loggedOutButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loggedOutButtonText}>Login atau Daftar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Komponen MenuItem (Sudah Benar) ---
const MenuItem: React.FC<{
  icon: string;
  text: string;
  onPress: () => void;
}> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.gridIconContainer}>
      <FeatherIcon name={icon} size={22} color={COLORS.primary} />
    </View>
    <Text style={styles.gridItemText}>{text}</Text>
    <Icon name="chevron-right" size={14} color={COLORS.textMuted} />
  </TouchableOpacity>
);

const renderItemSeparator = () => <View style={styles.divider} />;
const renderSectionSeparator = () => <View style={styles.sectionSeparator} />;

// --- Tipe Props (Sudah Benar) ---
type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

/**
 * Komponen Utama: ProfileScreen
 */
export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { isLoggedIn, logout } = useAuth();
  const isFocused = useIsFocused();
  
  // --- 2. [PENYESUAIAN] Gunakan tipe navigasi yang benar ---
  // Kita gunakan 'navigation' dari props untuk navigasi antar tab,
  // tapi kita juga bisa gunakan 'useNavigation' untuk navigasi stack.
  const stackNavigation = useNavigation<RootStackNavigationProp>();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // fetchProfileData (Sudah Benar)
  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Gagal memuat profil:', error);
      if ((error as any).response?.status === 401) {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]); 

  // useEffect (Sudah Benar)
  useEffect(() => {
    if (isLoggedIn && isFocused) {
      fetchProfileData();
    } else {
      setIsLoading(false);
      setUser(null);
    }
  }, [isLoggedIn, isFocused, fetchProfileData]);

  // handleLogout (Sudah Benar)
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Logout',
          style: 'destructive',
          onPress: async () => { await logout(); },
        },
      ]
    );
  };

  // --- 3. [PENYESUAIAN] Data untuk SectionList ---
  // Menggunakan 'stackNavigation' untuk pindah layar
  const menuSections = [
    {
      title: 'Akun Saya',
      data: [
        {
          key: 'address',
          icon: 'map-pin',
          text: 'Alamat Pengiriman',
          // 'items: []' adalah placeholder jika AddressScreen membutuhkannya
          onPress: () => stackNavigation.navigate('Address', { items: [] }), 
        },
        {
          key: 'saved',
          icon: 'heart',
          text: 'Barang Tersimpan',
          onPress: () => stackNavigation.navigate('Saved'),
        },
        {
          key: 'history',
          icon: 'file-text', // Anda bisa ganti ke 'history' dari FontAwesome
          text: 'Riwayat Sewa',
          // --- INI PERUBAHANNYA ---
          onPress: () => stackNavigation.navigate('RentalHistory'),
        },
      ],
    },
    {
      title: 'Bantuan & Pengaturan',
      data: [
        {
          key: 'notifications',
          icon: 'bell',
          text: 'Notifikasi',
          // 'navigation.navigate' di sini akan pindah tab
          onPress: () => navigation.navigate('Notifications'),
        },
        {
          key: 'support',
          icon: 'message-circle',
          text: 'Pusat Bantuan',
          onPress: () => stackNavigation.navigate('Chat', {
            sellerId: 999, // ID khusus untuk Support
            sellerName: 'PakeSewa Support',
          }),
        },
      ],
    },
  ];

  // --- Logika Render Utama (Sudah Benar) ---
  if (isLoading) {
    return <LoadingView />;
  }

  if (!isLoggedIn || !user) {
    return <LoggedOutView />;
  }

  // --- Tampilan Utama (Logged In) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* HEADER TETAP (FIXED) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
      </View>
      
      <SectionList
        sections={menuSections}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponentStyle={styles.listHeader} 
        
        // --- Header Pengguna ---
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <Image 
              source={DefaultAvatar}
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name || 'Nama Belum Diatur'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <FeatherIcon name="edit-2" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        }
        
        // --- Judul Seksi ---
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        
        // --- Item Menu ---
        renderItem={({ item }) => (
          <MenuItem
            icon={item.icon}
            text={item.text}
            onPress={item.onPress}
          />
        )}
        
        ItemSeparatorComponent={renderItemSeparator}
        SectionSeparatorComponent={renderSectionSeparator}
        
        // --- Tombol Logout di Paling Bawah ---
        ListFooterComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FeatherIcon name="log-out" size={20} color={COLORS.danger} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

// --- STYLESHEET (Tidak ada perubahan) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16, 
  },
  listHeader: {
    paddingTop: 0,
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
  },
  profileHeader: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.border,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    paddingTop: 8, 
  },
  menuItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card, 
  },
  gridIconContainer: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gridItemText: { 
    color: COLORS.textPrimary,
    fontSize: 16,
    flex: 1,
  },
  divider: { 
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 72, 
  },
  sectionSeparator: {
    height: 16, 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 18,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  loggedOutCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    marginBottom: 20,
  },
  loggedOutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  loggedOutSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  loggedOutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 24,
  },
  loggedOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});