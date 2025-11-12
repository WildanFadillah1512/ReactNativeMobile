import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
// HAPUS: import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 1. SESUAIKAN IMPOR TIPE ---
// Impor dari file 'navigation/types.ts' yang sudah benar
import type { Address } from '../navigation/types'; 

// --- 2. IMPOR DEPENDENSI BARU ---
import apiClient from '../config/api';
import { useAuth } from './AuthContext'; // Untuk mengecek status login

// ================================
// 🧩 Tipe untuk Address Context
// ================================

// Tipe ini sekarang akan benar secara otomatis karena 'Address' di atas sudah benar
type NewAddressData = Omit<Address, 'id' | 'createdAt' | 'userId' | 'isPrimary'>;

interface AddressContextType {
  addresses: Address[];
  addAddress: (addressData: NewAddressData) => Promise<boolean>; 
  // --- 3. TAMBAHKAN KEMBALI 'updateAddress' ---
  updateAddress: (id: number, addressData: NewAddressData) => Promise<boolean>;
  deleteAddress: (id: number) => Promise<void>;
  getAddressById: (id: number) => Address | undefined;
  loading: boolean;
  refreshAddresses: () => Promise<void>; 
}

// ================================
// 🔑 Context dan Data Awal
// ================================
const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isLoggedIn } = useAuth();

  // (Fungsi 'refreshAddresses' sudah benar)
  const refreshAddresses = useCallback(async () => {
    if (isLoggedIn) {
      setLoading(true);
      try {
        const response = await apiClient.get('/addresses');
        if (Array.isArray(response.data)) {
          setAddresses(response.data);
        }
      } catch (e) {
        console.error('Failed to load addresses:', e);
        Alert.alert("Error", "Gagal memuat daftar alamat.");
      } finally {
        setLoading(false);
      }
    } else {
      setAddresses([]);
      setLoading(false);
    }
  }, [isLoggedIn]);

  // (useEffect sudah benar)
  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  // (Fungsi 'addAddress' sudah benar)
  const addAddress = useCallback(async (newData: NewAddressData): Promise<boolean> => {
    if (!isLoggedIn) {
      Alert.alert("Login Diperlukan", "Anda harus login untuk menambah alamat.");
      return false;
    }
    try {
      await apiClient.post('/addresses', newData);
      await refreshAddresses(); 
      return true;
    } catch (e) {
      console.error('Failed to save new address:', e);
      Alert.alert("Error", "Gagal menyimpan alamat baru.");
      return false;
    }
  }, [isLoggedIn, refreshAddresses]);

  // --- 4. TAMBAHKAN KEMBALI FUNGSI 'updateAddress' ---
  const updateAddress = useCallback(async (id: number, newData: NewAddressData): Promise<boolean> => {
    if (!isLoggedIn) {
      Alert.alert("Login Diperlukan");
      return false;
    }
    
    // Optimistic Update: Perbarui state UI dulu
    const previousAddresses = addresses;
    setAddresses(prev => 
      prev.map(addr => 
        // Temukan alamat yg di-edit, ganti datanya dengan 'newData'
        addr.id === id ? { ...addr, ...newData } : addr 
      )
    );

    try {
      // Panggil API (baseURL.../api + /addresses/123)
      await apiClient.put(`/addresses/${id}`, newData);
      return true; // Sukses
      
    } catch (error) {
      console.error('Failed to update address:', error);
      // Rollback jika API gagal
      setAddresses(previousAddresses); 
      Alert.alert("Error", "Gagal memperbarui alamat.");
      return false; // Gagal
    }
  }, [isLoggedIn, addresses]); // Tambahkan 'addresses' sebagai dependensi

  // (Fungsi 'deleteAddress' sudah benar)
  const deleteAddress = useCallback(async (id: number) => {
    if (!isLoggedIn) return;

    const previousAddresses = addresses;
    setAddresses(prev => prev.filter((addr) => addr.id !== id));

    try {
      await apiClient.delete(`/addresses/${id}`);
    } catch (e) {
      console.error('Failed to delete address:', e);
      setAddresses(previousAddresses); 
      Alert.alert("Error", "Gagal menghapus alamat.");
    }
  }, [isLoggedIn, addresses]);

  // (Fungsi 'getAddressById' sudah benar)
  const getAddressById = useCallback(
    (id: number): Address | undefined => {
      return addresses.find((addr) => addr.id === id);
    },
    [addresses]
  );
  
  // ------------------------------
  // 🧾 Provider Value
  // ------------------------------
  return (
    <AddressContext.Provider
      value={{
        addresses,
        addAddress,
        updateAddress, // <-- TAMBAHKAN INI
        deleteAddress,
        getAddressById,
        loading,
        refreshAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

// ================================
// ⚡ Custom Hook untuk akses context
// ================================
export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};