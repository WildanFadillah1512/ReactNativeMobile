import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  ReactNode,
  useCallback 
} from 'react';
import { Alert } from 'react-native';
import apiClient from '../config/api';
import { useAuth } from './AuthContext';
import type { ApiProduct } from '../types';

interface LikeContextType {
  likedIds: number[];
  toggleLike: (itemId: number) => Promise<void>;
  isLoading: boolean;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

export const LikeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchLikes = async () => {
      if (isLoggedIn) {
        setIsLoading(true);
        try {
          // --- PERBAIKAN: Hapus '/api' ---
          const response = await apiClient.get('/likes'); // DARI: '/api/likes'
          
          if (Array.isArray(response.data)) {
            setLikedIds(response.data.map((product: ApiProduct) => product.id));
          }
        } catch (error) {
          console.error("Gagal fetch likes:", error); // Ini yang muncul di screenshot
        } finally {
          setIsLoading(false);
        }
      } else {
        setLikedIds([]);
        setIsLoading(false);
      }
    };
    fetchLikes();
  }, [isLoggedIn]);

  const toggleLike = useCallback(async (productId: number) => {
    if (!isLoggedIn) {
      Alert.alert("Login Diperlukan", "Anda harus login untuk menyukai barang.");
      return;
    }

    const isCurrentlyLiked = likedIds.includes(productId);
    const optimisticLikedIds = isCurrentlyLiked
      ? likedIds.filter(id => id !== productId)
      : [...likedIds, productId];
      
    setLikedIds(optimisticLikedIds);

    try {
      // --- PERBAIKAN: Hapus '/api' ---
      await apiClient.post('/likes', { productId }); // DARI: '/api/likes'
    } catch (error) {
      console.error("Failed to toggle like on API:", error);
      setLikedIds(likedIds); // Rollback
      Alert.alert("Error", "Gagal menyimpan perubahan. Silakan coba lagi.");
    }
  }, [isLoggedIn, likedIds]);

  return (
    <LikeContext.Provider value={{ likedIds, toggleLike, isLoading }}>
      {children}
    </LikeContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikeProvider');
  }
  return context;
};