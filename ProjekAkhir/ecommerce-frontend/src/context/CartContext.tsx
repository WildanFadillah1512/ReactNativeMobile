import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiProduct, CartEntry, CheckoutRentalItem } from '../types';
import { formatCurrency } from '../utils/riceParse'; 
import { API_URL } from '../config/api'; 

interface CartContextType {
    cartEntries: CartEntry[]; 
    addToCart: (item: ApiProduct) => Promise<boolean>; 
    removeFromCart: (itemId: number) => Promise<void>;
    isInCart: (itemId: number) => boolean;
    clearCart: () => Promise<void>;
    isLoading: boolean;
    toggleItemSelection: (itemId: number) => Promise<void>;
    updateItemDuration: (itemId: number, duration: number) => Promise<void>;
    getSelectedItemsForCheckout: () => CheckoutRentalItem[];
}

const CART_STORAGE_KEY = 'shoppingCartEntries_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadCartEntries = async () => {
            setIsLoading(true);
            try {
                const storedEntriesString = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (storedEntriesString) {
                    const loadedEntries: CartEntry[] = JSON.parse(storedEntriesString);
                    if (Array.isArray(loadedEntries)) {
                        const validatedEntries = loadedEntries.filter(entry =>
                            entry?.item && // Cek null/undefined
                            typeof entry.selected === 'boolean' &&
                            typeof entry.duration === 'number' &&
                            typeof entry.item.price === 'number' && 
                            typeof entry.item.id === 'number' 
                        ).map(entry => ({
                            ...entry,
                            duration: Math.max(1, entry.duration || 1)
                        }));
                        setCartEntries(validatedEntries);
                    } else {
                        console.warn("Invalid cart data structure found (not an array), resetting.");
                        await AsyncStorage.removeItem(CART_STORAGE_KEY);
                        setCartEntries([]);
                    }
                } else {
                    setCartEntries([]);
                }
            } catch (error) {
                console.error("Failed to load/parse cart entries:", error);
                try {
                    await AsyncStorage.removeItem(CART_STORAGE_KEY);
                } catch (clearError) {
                    console.error("Failed to clear corrupted cart storage:", clearError);
                }
                setCartEntries([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadCartEntries();
    }, []); 
    const saveCartEntries = async (updatedEntries: CartEntry[]) => {
        try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedEntries));
        } catch (error) {
            console.error("Failed to save cart entries:", error);
            throw error; 
        }
    };
    const isInCart = (itemId: number): boolean => {
        return cartEntries.some(entry => entry.item.id === itemId);
    };
    const addToCart = async (itemToAdd: ApiProduct): Promise<boolean> => {
        if (isInCart(itemToAdd.id)) {
            console.log('Item already in cart:', itemToAdd.name);
            return false; 
        }
        const newEntry: CartEntry = {
            item: itemToAdd, 
            selected: true,  
            duration: 1,  
        };

        const updatedCart = [...cartEntries, newEntry];
        const previousCart = cartEntries;

        try {
            setCartEntries(updatedCart); 
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