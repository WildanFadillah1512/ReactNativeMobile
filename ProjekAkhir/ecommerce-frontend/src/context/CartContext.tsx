import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  ReactNode,
  useCallback 
} from 'react';
import { Alert } from 'react-native';
import apiClient, { BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';
// Impor ini sudah benar (mengambil dari 'kamus utama')
import type { ApiProduct, CartEntry, CheckoutRentalItem } from '../types'; 
import { formatCurrency } from '../utils/riceParse'; 

// Tipe DbCartItem (Sudah Benar)
interface DbCartItem {
  id: number;
  duration: number;
  product: ApiProduct;
}

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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn } = useAuth();

    // (useEffect, isInCart, addToCart, removeFromCart, clearCart, updateItemDuration, toggleItemSelection)
    // ... (Semua fungsi ini sudah benar) ...
    useEffect(() => {
        const loadCartEntries = async () => {
            if (isLoggedIn) {
                setIsLoading(true);
                try {
                    const response = await apiClient.get('/cart');
                    
                    if (Array.isArray(response.data)) {
                        const loadedEntries: CartEntry[] = response.data.map((dbItem: DbCartItem) => ({
                            item: dbItem.product,
                            duration: dbItem.duration,
                            selected: true
                        }));
                        setCartEntries(loadedEntries);
                    }
                } catch (error) {
                    console.error("Gagal memuat keranjang:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setCartEntries([]);
                setIsLoading(false);
            }
        };
        loadCartEntries();
    }, [isLoggedIn]);
    
    const isInCart = useCallback((itemId: number): boolean => {
        return cartEntries.some(entry => entry.item.id === itemId);
    }, [cartEntries]);

    const addToCart = useCallback(async (itemToAdd: ApiProduct): Promise<boolean> => {
        if (!isLoggedIn) {
            Alert.alert("Login Diperlukan", "Anda harus login untuk menambah barang.");
            return false;
        }
        if (isInCart(itemToAdd.id)) {
            console.log('Item already in cart:', itemToAdd.name);
            return false; 
        }
        
        const newEntry: CartEntry = { item: itemToAdd, selected: true, duration: 1 };
        const previousCart = cartEntries;
        setCartEntries(prev => [...prev, newEntry]);

        try {
            await apiClient.post('/cart', {
                productId: itemToAdd.id,
                duration: 1 
            });
            return true;
        } catch (error) {
            console.error("Gagal menambah ke keranjang:", error);
            setCartEntries(previousCart);
            Alert.alert("Error", "Gagal menambah ke keranjang.");
            return false;
        }
    }, [isLoggedIn, isInCart, cartEntries]);

    const removeFromCart = useCallback(async (itemIdToRemove: number) => {
        if (!isLoggedIn) return;
        
        const previousCart = cartEntries;
        const updatedCart = cartEntries.filter(entry => entry.item.id !== itemIdToRemove);
        setCartEntries(updatedCart);

        try {
            await apiClient.delete(`/cart/${itemIdToRemove}`);
        } catch (error) {
            console.error("Gagal menghapus dari keranjang:", error);
            setCartEntries(previousCart);
            Alert.alert("Error", "Gagal menghapus item.");
        }
    }, [isLoggedIn, cartEntries]);

    const clearCart = useCallback(async () => {
        if (!isLoggedIn) return;

        const previousCart = cartEntries;
        setCartEntries([]);
        
        try {
            await apiClient.delete('/cart');
        } catch (error) {
            console.error("Gagal mengosongkan keranjang:", error);
            setCartEntries(previousCart);
            Alert.alert("Error", "Gagal mengosongkan keranjang.");
        }
    }, [isLoggedIn, cartEntries]);

    const updateItemDuration = useCallback(async (itemId: number, duration: number) => {
        if (!isLoggedIn) return;

        const newDuration = Math.max(1, Math.floor(duration));
        
        const previousCart = cartEntries;
        const updatedCart = cartEntries.map(entry =>
            entry.item.id === itemId ? { ...entry, duration: newDuration } : entry
        );
        setCartEntries(updatedCart);

        try {
            await apiClient.post('/cart', {
                productId: itemId,
                duration: newDuration
            });
        } catch (error) {
            console.error("Gagal update durasi:", error);
            setCartEntries(previousCart);
            Alert.alert("Error", "Gagal memperbarui durasi.");
        }
    }, [isLoggedIn, cartEntries]);

    const toggleItemSelection = useCallback(async (itemId: number) => {
        setCartEntries(prevCart => 
            prevCart.map(entry =>
                entry.item.id === itemId ? { ...entry, selected: !entry.selected } : entry
            )
        );
    }, []);

    // --- DI SINI PERBAIKANNYA ---
    const getSelectedItemsForCheckout = useCallback((): CheckoutRentalItem[] => {
        return cartEntries
            .filter(entry => entry.selected) 
            .map(entry => {
                const product = entry.item; 
                
                const imageUri = product.imageUrl 
                    ? `${BASE_URL}/images/${product.imageUrl}` 
                    : null;

                const checkoutItem: CheckoutRentalItem = {
                    ...product,
                    price: formatCurrency(product.price),
                    image: imageUri
                        ? { uri: imageUri } 
                        : require('../assets/images/placeholder.png'),
                    duration: entry.duration,
                    category: product.category ?? 'Lainnya',
                    location: product.location ?? 'Lokasi tidak diketahui',
                    period: product.period ?? '', 
                    
                    // --- 1. GUNAKAN NAMA PROPERTI BARU ---
                    rating: product.ratingAvg ?? 0,
                    reviews: product.reviewsCount ?? 0, 
                    // ---------------------------------
                    
                    seller: {
                        ...product.seller,
                        avatar: product.seller.avatar ?? '', 
                        bio: product.seller.bio ?? '',
                        rating: product.seller.rating ?? 0,
                        itemsRented: product.seller.itemsRented ?? 0,
                    }
                };
                return checkoutItem;
            });
    }, [cartEntries]);

    return (
        <CartContext.Provider value={{
            cartEntries, 
            addToCart, 
            removeFromCart,
            isInCart,
            clearCart,
            isLoading,
            toggleItemSelection,
            updateItemDuration,
            getSelectedItemsForCheckout 
        }}>
            {children}
        </CartContext.Provider>
    );
};

// (useCart hook sudah benar)
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};