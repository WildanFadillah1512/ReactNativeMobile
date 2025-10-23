// src/context/CartContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import TIPE BARU CartEntry dan CheckoutRentalItem
import type { RentalItem, CartEntry, CheckoutRentalItem } from '../types';

// Tipe Baru untuk Context
interface CartContextType {
  cartEntries: CartEntry[]; // State menyimpan CartEntry
  addToCart: (item: RentalItem) => Promise<boolean>;
  removeFromCart: (itemId: number) => Promise<void>;
  isInCart: (itemId: number) => boolean;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  // --- Fungsi Baru ---
  toggleItemSelection: (itemId: number) => Promise<void>;
  updateItemDuration: (itemId: number, duration: number) => Promise<void>;
  getSelectedItemsForCheckout: () => CheckoutRentalItem[]; // Helper
}

// Ganti versi key karena struktur data berubah
const CART_STORAGE_KEY = 'shoppingCartEntries_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State sekarang menyimpan array CartEntry
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart entries dari storage
  useEffect(() => {
    const loadCartEntries = async () => {
      setIsLoading(true);
      try {
        const storedEntriesString = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedEntriesString) {
          const loadedEntries: CartEntry[] = JSON.parse(storedEntriesString);
          // Validasi sederhana: pastikan itu array
          if (Array.isArray(loadedEntries)) {
              // Pastikan setiap entry memiliki properti yang diharapkan
              const validatedEntries = loadedEntries.filter(entry =>
                  entry && entry.item && typeof entry.selected === 'boolean' && typeof entry.duration === 'number'
              ).map(entry => ({ // Set default jika perlu (misal, jika durasi tidak valid)
                  ...entry,
                  duration: Math.max(1, entry.duration || 1) // Pastikan durasi minimal 1
              }));
              setCartEntries(validatedEntries);
          } else {
              console.warn("Invalid cart data found, resetting.");
              await AsyncStorage.removeItem(CART_STORAGE_KEY);
              setCartEntries([]);
          }
        } else {
            setCartEntries([]); // Belum ada data
        }
      } catch (error) {
        console.error("Failed to load cart entries:", error);
        setCartEntries([]); // Fallback jika error
      } finally {
        setIsLoading(false);
      }
    };
    loadCartEntries();
  }, []); // Hanya run sekali saat mount

  // Helper untuk menyimpan state ke storage
  const saveCartEntries = async (updatedEntries: CartEntry[]) => {
      try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedEntries));
      } catch (error) {
           console.error("Failed to save cart entries:", error);
           throw error; // Lempar ulang error untuk rollback
      }
  };


  // Cek apakah item ada di keranjang
  const isInCart = (itemId: number): boolean => {
    return cartEntries.some(entry => entry.item.id === itemId);
  };

  // Tambah item ke keranjang (sebagai CartEntry)
  const addToCart = async (itemToAdd: RentalItem): Promise<boolean> => {
    if (isInCart(itemToAdd.id)) {
      console.log('Item already in cart:', itemToAdd.name);
      // Opsi: Anda bisa memilih untuk otomatis mencentang item yang sudah ada
      // toggleItemSelection(itemToAdd.id);
      return false; // Kembalikan false karena tidak *menambah* item baru
    }
    // Buat CartEntry baru
    const newEntry: CartEntry = {
        item: itemToAdd,
        selected: true, // Default terpilih saat ditambahkan
        duration: 1,     // Default durasi 1
    };
    const updatedCart = [...cartEntries, newEntry];
    const previousCart = cartEntries; // Untuk rollback

    try {
      setCartEntries(updatedCart);
      await saveCartEntries(updatedCart);
      return true; // Berhasil menambah
    } catch (error) {
      setCartEntries(previousCart); // Rollback
      throw error; // Lempar error
    }
  };

  // Hapus item dari keranjang (berdasarkan itemId)
  const removeFromCart = async (itemIdToRemove: number) => {
    const updatedCart = cartEntries.filter(entry => entry.item.id !== itemIdToRemove);
    const previousCart = cartEntries;
    try {
      setCartEntries(updatedCart);
      await saveCartEntries(updatedCart);
    } catch (error) {
      setCartEntries(previousCart); // Rollback
      throw error;
    }
  };

  // Kosongkan keranjang
  const clearCart = async () => {
      const previousCart = cartEntries;
      try {
          setCartEntries([]);
          await AsyncStorage.removeItem(CART_STORAGE_KEY);
      } catch (error) {
          setCartEntries(previousCart); // Rollback
          throw error;
      }
  };

  // --- FUNGSI BARU UNTUK SELEKSI & DURASI ---

  // Mengubah status terpilih (centang) item
  const toggleItemSelection = async (itemId: number) => {
      const updatedCart = cartEntries.map(entry =>
          entry.item.id === itemId ? { ...entry, selected: !entry.selected } : entry
      );
      const previousCart = cartEntries;
      try {
          setCartEntries(updatedCart); // Update UI dulu
          await saveCartEntries(updatedCart); // Baru simpan
      } catch (error) {
          setCartEntries(previousCart); // Rollback jika gagal simpan
          throw error;
      }
  };

  // Mengubah durasi item di keranjang
  const updateItemDuration = async (itemId: number, duration: number) => {
      // Validasi durasi minimal 1
      const newDuration = Math.max(1, Math.floor(duration)); // Pastikan integer >= 1
      const updatedCart = cartEntries.map(entry =>
          entry.item.id === itemId ? { ...entry, duration: newDuration } : entry
      );
      const previousCart = cartEntries;
       try {
          setCartEntries(updatedCart); // Update UI
          await saveCartEntries(updatedCart); // Simpan
      } catch (error) {
          setCartEntries(previousCart); // Rollback
          throw error;
      }
  };

  // Helper untuk mendapatkan item terpilih dalam format CheckoutRentalItem
  const getSelectedItemsForCheckout = (): CheckoutRentalItem[] => {
      return cartEntries
          .filter(entry => entry.selected) // Ambil yang dicentang
          .map(entry => ({
              ...entry.item, // Salin properti RentalItem
              duration: entry.duration, // Tambahkan durasi dari CartEntry
          }));
  };
  // --- AKHIR FUNGSI BARU ---


  return (
    <CartContext.Provider value={{
        cartEntries, // Kirim state baru
        addToCart,
        removeFromCart,
        isInCart,
        clearCart,
        isLoading,
        // Kirim fungsi-fungsi baru
        toggleItemSelection,
        updateItemDuration,
        getSelectedItemsForCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook (Tetap Sama)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};