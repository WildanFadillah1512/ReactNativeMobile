// File: src/context/AddressContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Address } from '../types'; // ✅ Impor dari src/types.ts agar konsisten di semua file

// ================================
// 🧩 Tipe untuk Address Context
// ================================
interface AddressContextType {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (updatedAddress: Address) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  getAddressById: (id: number) => Address | undefined;
  loading: boolean;
}

// ================================
// 🔑 Context dan Data Awal
// ================================
const AddressContext = createContext<AddressContextType | undefined>(undefined);

const ADDRESS_STORAGE_KEY = 'userAddresses_v1'; // Gunakan versi jika struktur berubah

// Data awal (opsional)
const initialAddresses: Address[] = [
  {
    id: 1,
    label: 'Rumah',
    name: 'Budi Santoso',
    phone: '(+62) 812-3456-7890',
    fullAddress:
      'Jl. Merdeka No. 45, RT 05/RW 02, Cilandak, Jakarta Selatan, 12430',
    latitude: -6.295,
    longitude: 106.78,
  },
];

// ================================
// 🏠 Provider Component
// ================================
export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // 🔹 Load alamat dari AsyncStorage
  // ------------------------------
  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true);
      try {
        const stored = await AsyncStorage.getItem(ADDRESS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setAddresses(parsed);
          } else {
            console.warn('Invalid address data, resetting...');
            setAddresses(initialAddresses);
            await AsyncStorage.setItem(
              ADDRESS_STORAGE_KEY,
              JSON.stringify(initialAddresses)
            );
          }
        } else {
          // Jika kosong → pakai data awal
          setAddresses(initialAddresses);
          await AsyncStorage.setItem(
            ADDRESS_STORAGE_KEY,
            JSON.stringify(initialAddresses)
          );
        }
      } catch (e) {
        console.error('Failed to load addresses:', e);
        setAddresses(initialAddresses);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, []);

  // ------------------------------
  // 🔹 Simpan alamat ke AsyncStorage
  // ------------------------------
  const saveAddresses = async (updated: Address[]) => {
    try {
      await AsyncStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save addresses:', e);
      throw e;
    }
  };

  // ------------------------------
  // ➕ Tambah alamat baru
  // ------------------------------
  const addAddress = async (newData: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      id: Date.now(),
      ...newData,
      latitude: newData.latitude ?? 0,
      longitude: newData.longitude ?? 0,
    };

    const updated = [...addresses, newAddress];
    const previous = addresses;
    try {
      setAddresses(updated);
      await saveAddresses(updated);
    } catch (e) {
      console.error('Failed to save new address:', e);
      setAddresses(previous);
    }
  };

  // ------------------------------
  // ✏️ Perbarui alamat
  // ------------------------------
  const updateAddress = async (updatedAddress: Address) => {
    const updated = addresses.map((addr) =>
      addr.id === updatedAddress.id ? updatedAddress : addr
    );
    const previous = addresses;
    try {
      setAddresses(updated);
      await saveAddresses(updated);
    } catch (e) {
      console.error('Failed to update address:', e);
      setAddresses(previous);
    }
  };

  // ------------------------------
  // ❌ Hapus alamat
  // ------------------------------
  const deleteAddress = async (id: number) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    const previous = addresses;
    try {
      setAddresses(updated);
      await saveAddresses(updated);
    } catch (e) {
      console.error('Failed to delete address:', e);
      setAddresses(previous);
    }
  };

  // ------------------------------
  // 🔍 Ambil alamat berdasarkan ID
  // ------------------------------
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
        updateAddress,
        deleteAddress,
        getAddressById,
        loading,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

// ================================
// ⚡ Custom Hook untuk akses context
// ================================
export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within an AddressProvider');
  }
  return context;
};
