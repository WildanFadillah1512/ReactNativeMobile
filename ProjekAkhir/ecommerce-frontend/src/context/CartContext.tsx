// File: src/context/CartContext.tsx (FINAL - Menerima ApiProduct, Konversi saat Checkout)

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- PERBAIKAN 1: Import Tipe yang Benar ---
// Kita butuh 'ApiProduct' (untuk menerima), 'CartEntry' (untuk menyimpan),
// dan 'CheckoutRentalItem' (untuk mengirim ke checkout).
// Hapus 'RentalItem' karena tidak dipakai lagi di context ini.
import type { ApiProduct, CartEntry, CheckoutRentalItem } from '../types';
// Kita juga butuh 'formatCurrency' untuk konversi saat checkout.
import { formatCurrency } from '../utils/riceParse'; // (Asumsi nama file: priceParse)
// --- AKHIR PERBAIKAN 1 ---

// Tentukan URL API untuk konversi gambar saat checkout
const API_URL = 'http://10.95.21.143:3000'; // Sesuaikan jika perlu

// --- PERBAIKAN 2: Perbarui Tipe Context ---
interface CartContextType {
    cartEntries: CartEntry[]; // State menyimpan CartEntry (yang berisi ApiProduct)
    // 'addToCart' sekarang menerima 'ApiProduct'
    addToCart: (item: ApiProduct) => Promise<boolean>; // <-- FIX
    removeFromCart: (itemId: number) => Promise<void>;
    isInCart: (itemId: number) => boolean;
    clearCart: () => Promise<void>;
    isLoading: boolean;
    toggleItemSelection: (itemId: number) => Promise<void>;
    updateItemDuration: (itemId: number, duration: number) => Promise<void>;
    // Fungsi ini MENGEMBALIKAN tipe CheckoutRentalItem (terformat)
    getSelectedItemsForCheckout: () => CheckoutRentalItem[];
}
// --- AKHIR PERBAIKAN 2 ---

// Key storage Anda sudah bagus (v1)
const CART_STORAGE_KEY = 'shoppingCartEntries_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State ini sudah benar (menggunakan 'CartEntry' baru dari types.ts)
    const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart entries
    useEffect(() => {
        const loadCartEntries = async () => {
            setIsLoading(true);
            try {
                const storedEntriesString = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (storedEntriesString) {
                    const loadedEntries: CartEntry[] = JSON.parse(storedEntriesString);
                    // Validasi struktur dan tipe data
                    if (Array.isArray(loadedEntries)) {
                        // --- PERBAIKAN 3: Validasi Data Lebih Kuat ---
                        // Pastikan data lama (dengan price: string) tidak lolos
                        const validatedEntries = loadedEntries.filter(entry =>
                            entry?.item && // Cek null/undefined
                            typeof entry.selected === 'boolean' &&
                            typeof entry.duration === 'number' &&
                            typeof entry.item.price === 'number' && // VALIDASI TIPE HARGA!
                            typeof entry.item.id === 'number' // Validasi dasar lainnya
                        ).map(entry => ({
                            ...entry,
                            duration: Math.max(1, entry.duration || 1) // Pastikan durasi valid
                        }));
                        // --- AKHIR PERBAIKAN 3 ---
                        setCartEntries(validatedEntries);
                    } else {
                        // Jika struktur data tidak valid (bukan array), hapus storage
                        console.warn("Invalid cart data structure found (not an array), resetting.");
                        await AsyncStorage.removeItem(CART_STORAGE_KEY);
                        setCartEntries([]);
                    }
                } else {
                    // Belum ada data di storage
                    setCartEntries([]);
                }
            } catch (error) {
                // Jika gagal parse JSON atau error lain, hapus storage
                console.error("Failed to load/parse cart entries:", error);
                try {
                    await AsyncStorage.removeItem(CART_STORAGE_KEY);
                } catch (clearError) {
                    console.error("Failed to clear corrupted cart storage:", clearError);
                }
                setCartEntries([]); // Fallback ke array kosong
            } finally {
                setIsLoading(false);
            }
        };
        loadCartEntries();
    }, []); // Hanya run sekali saat mount

    // Helper untuk menyimpan state ke storage (Sudah Benar)
    const saveCartEntries = async (updatedEntries: CartEntry[]) => {
        try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedEntries));
        } catch (error) {
            console.error("Failed to save cart entries:", error);
            throw error; // Lempar ulang error
        }
    };

    // Cek apakah item ada di keranjang (Sudah Benar)
    const isInCart = (itemId: number): boolean => {
        return cartEntries.some(entry => entry.item.id === itemId);
    };

    // --- PERBAIKAN 4: 'addToCart' Menerima 'ApiProduct' ---
    const addToCart = async (itemToAdd: ApiProduct): Promise<boolean> => {
        if (isInCart(itemToAdd.id)) {
            console.log('Item already in cart:', itemToAdd.name);
            // Anda bisa tambahkan logika lain di sini jika item sudah ada,
            // misalnya, memperbarui durasi atau selection state,
            // tapi untuk sekarang kita kembalikan false saja.
            return false; // Kembalikan false karena tidak *menambah* item baru
        }

        // 'newEntry' sekarang dengan benar menyimpan 'ApiProduct' murni
        // Sesuai dengan definisi CartEntry yang sudah diperbaiki di types.ts
        const newEntry: CartEntry = {
            item: itemToAdd, // itemToAdd adalah ApiProduct
            selected: true,  // Default terpilih saat ditambahkan
            duration: 1,     // Default durasi 1 hari/unit
        };

        const updatedCart = [...cartEntries, newEntry];
        const previousCart = cartEntries; // Simpan state sebelumnya untuk rollback

        try {
            setCartEntries(updatedCart); // Update state lokal (UI)
            await saveCartEntries(updatedCart); // Simpan ke AsyncStorage
            return true; // Berhasil menambah
        } catch (error) {
            setCartEntries(previousCart); // Rollback state jika penyimpanan gagal
            throw error; // Lempar error agar bisa ditangani di komponen pemanggil
        }
    };
    // --- AKHIR PERBAIKAN 4 ---

    // Hapus item dari keranjang (Logika filter sudah benar)
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

    // Kosongkan keranjang (Logika sudah benar)
    const clearCart = async () => {
        const previousCart = cartEntries;
        try {
            setCartEntries([]);
            await AsyncStorage.removeItem(CART_STORAGE_KEY); // Hapus juga dari storage
        } catch (error) {
            setCartEntries(previousCart); // Rollback
            throw error;
        }
    };

    // Mengubah status terpilih (centang) item (Logika map sudah benar)
    const toggleItemSelection = async (itemId: number) => {
        const updatedCart = cartEntries.map(entry =>
            entry.item.id === itemId ? { ...entry, selected: !entry.selected } : entry
        );
        const previousCart = cartEntries;
        try {
            setCartEntries(updatedCart);
            await saveCartEntries(updatedCart);
        } catch (error) {
            setCartEntries(previousCart); // Rollback
            throw error;
        }
    };

    // Mengubah durasi item di keranjang (Logika map & validasi sudah benar)
    const updateItemDuration = async (itemId: number, duration: number) => {
        const newDuration = Math.max(1, Math.floor(duration)); // Pastikan integer >= 1
        const updatedCart = cartEntries.map(entry =>
            entry.item.id === itemId ? { ...entry, duration: newDuration } : entry
        );
        const previousCart = cartEntries;
        try {
            setCartEntries(updatedCart);
            await saveCartEntries(updatedCart);
        } catch (error) {
            setCartEntries(previousCart); // Rollback
            throw error;
        }
    };

    // --- PERBAIKAN 5: Konversi Data di 'getSelectedItemsForCheckout' ---
    // Fungsi ini bertindak sebagai "Adapter" antara data internal (ApiProduct)
    // dan data yang dibutuhkan oleh CheckoutScreen (CheckoutRentalItem).
    const getSelectedItemsForCheckout = (): CheckoutRentalItem[] => {
        return cartEntries
            .filter(entry => entry.selected) // 1. Filter item yang dipilih
            .map(entry => {                 // 2. Ubah setiap CartEntry menjadi CheckoutRentalItem
                const product = entry.item; // Ini adalah ApiProduct (data murni)

                // Buat objek CheckoutRentalItem (data terformat)
                const checkoutItem: CheckoutRentalItem = {
                    // Salin semua properti dasar dari ApiProduct
                    ...product,

                    // --- Konversi/Format Properti yang Berbeda ---

                    // Ubah 'price: number' menjadi 'price: string' terformat
                    price: formatCurrency(product.price),

                    // Ubah 'imageUrl: string|null' menjadi 'image: ImageSourcePropType'
                    image: product.imageUrl
                        ? { uri: `${API_URL}/images/${product.imageUrl}` } // Buat URI jika ada
                        : require('../assets/images/placeholder.png'), // Fallback ke placeholder jika null (Sesuaikan path!)

                    // Tambahkan 'duration' dari CartEntry
                    duration: entry.duration,

                    // --- Pastikan Properti Lain Sesuai & Tangani Null ---
                    // (Ini penting jika CheckoutRentalItem mewarisi dari RentalItem yang
                    // mungkin tidak mengizinkan null untuk properti tertentu)
                    category: product.category ?? 'Lainnya',
                    location: product.location ?? 'Lokasi tidak diketahui',
                    period: product.period ?? '', // Pastikan string, bukan null
                    rating: product.rating ?? 0,   // Pastikan number, bukan null
                    reviews: product.reviews ?? 0, // Pastikan number, bukan null

                    // Pastikan properti seller juga ditangani jika API mengembalikan null
                    // (CheckoutRentalItem mewarisi seller dari RentalItem -> ApiSeller)
                    seller: {
                        ...product.seller,
                        // Ganti nilai null dari ApiSeller dengan default yang sesuai
                        // jika CheckoutRentalItem/RentalItem tidak mengizinkan null
                        avatar: product.seller.avatar ?? '', // Ganti null avatar dengan string kosong
                        bio: product.seller.bio ?? '',
                        rating: product.seller.rating ?? 0,
                        itemsRented: product.seller.itemsRented ?? 0,
                    }
                };
                return checkoutItem;
            });
    };
    // --- AKHIR PERBAIKAN 5 ---

    // Memberikan state dan fungsi ke komponen anak
    return (
        <CartContext.Provider value={{
            cartEntries, // State yang berisi CartEntry[] (dengan item: ApiProduct)
            addToCart,   // Fungsi yang menerima ApiProduct
            removeFromCart,
            isInCart,
            clearCart,
            isLoading,
            toggleItemSelection,
            updateItemDuration,
            getSelectedItemsForCheckout // Fungsi yang mengembalikan CheckoutRentalItem[] (terformat)
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook untuk menggunakan context (Sudah Benar)
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};