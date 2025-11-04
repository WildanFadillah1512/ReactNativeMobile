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
  // ScrollView, // <-- Tidak terpakai, diganti SectionList
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
import { type RootStackParamList, type MainTabParamList } from '../navigation/types';

import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api'; 
import { COLORS } from '../config/theme';
import type { RootStackNavigationProp } from '../navigation/types';

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

// --- PERBAIKAN LINTER: Buat referensi komponen yang stabil ---
const renderItemSeparator = () => <View style={styles.divider} />;
const renderSectionSeparator = () => <View style={styles.sectionSeparator} />;
// -----------------------------------------------------------

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
      } else {
        // Jangan tampilkan alert, cukup log
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

  // --- Data untuk SectionList (Sudah Benar) ---
  const menuSections = [
    {
      title: 'Akun Saya',
      data: [
        {
          key: 'address',
          icon: 'map-pin',
          text: 'Alamat Pengiriman',
          onPress: () => navigation.navigate('Address', { items: [] }),
        },
        {
          key: 'saved',
          icon: 'heart',
          text: 'Barang Tersimpan',
          onPress: () => navigation.navigate('Saved'),
        },
        {
          key: 'history',
          icon: 'file-text',
          text: 'Riwayat Sewa',
          onPress: () => Alert.alert('Segera Hadir', 'Halaman riwayat sewa sedang disiapkan.'),
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
          onPress: () => navigation.navigate('Notifications'),
        },
        {
          key: 'support',
          icon: 'message-circle',
          text: 'Pusat Bantuan',
          onPress: () => navigation.navigate('Chat', {
            sellerId: 999,
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
        // --- PERBAIKAN LINTER: Gunakan style dari StyleSheet ---
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
        
        // --- PERBAIKAN LINTER: Gunakan referensi stabil ---
        ItemSeparatorComponent={renderItemSeparator}
        
        // --- PERBAIKAN LINTER: Gunakan referensi stabil ---
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

// --- STYLESHEET (Dengan tambahan) ---
const styles = StyleSheet.create({
  // --- Container Utama ---
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
  
  // --- PERBAIKAN LINTER: Style untuk ListHeader ---
  listHeader: {
    paddingTop: 0, // <-- Memindahkan inline style ke sini
  },

  // --- Tampilan Full Screen ---
  fullScreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
  },

  // --- Header Profil (ListHeaderComponent) ---
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
  
  // --- Seksi & Item Menu ---
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

  // --- Tombol Logout (ListFooterComponent) ---
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
  
  // --- Tampilan Logged Out ---
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
})