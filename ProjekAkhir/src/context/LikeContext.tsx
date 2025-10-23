// src/context/LikeContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LikeContextType {
  likedIds: number[];
  toggleLike: (itemId: number) => Promise<void>;
  isLoading: boolean;
}

const LIKE_STORAGE_KEY = 'likedProductIds';

const LikeContext = createContext<LikeContextType | undefined>(undefined);

export const LikeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load liked IDs from storage on mount
  useEffect(() => {
    const loadLikedIds = async () => {
      setIsLoading(true);
      try {
        const storedIdsString = await AsyncStorage.getItem(LIKE_STORAGE_KEY);
        if (storedIdsString) {
          setLikedIds(JSON.parse(storedIdsString));
        }
      } catch (error) {
        console.error("Failed to load liked IDs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLikedIds();
  }, []);

  // Function to toggle like status and save to storage
  const toggleLike = async (itemId: number) => {
    let updatedIds: number[];
    if (likedIds.includes(itemId)) {
      updatedIds = likedIds.filter(id => id !== itemId); // Unlike
    } else {
      updatedIds = [...likedIds, itemId]; // Like
    }

    try {
      setLikedIds(updatedIds); // Update state first for immediate UI feedback
      await AsyncStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(updatedIds));
    } catch (error) {
      console.error("Failed to save liked IDs:", error);
      // Optional: Rollback state if saving fails
      setLikedIds(likedIds);
      throw error; // Re-throw error if needed
    }
  };

  return (
    <LikeContext.Provider value={{ likedIds, toggleLike, isLoading }}>
      {children}
    </LikeContext.Provider>
  );
};

// Custom hook to use the context
export const useLikes = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikeProvider');
  }
  return context;
};