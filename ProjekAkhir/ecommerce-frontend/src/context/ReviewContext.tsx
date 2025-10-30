// src/context/ReviewContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 1. Import data ulasan awal DAN tipe UserReview
import { initialProductReviews } from '../data/reviews';
import type { UserReview } from '../types'; // Atau import dari '../data/reviews' jika tipe ada di sana

// Tipe AllReviews (Tetap Sama)
interface AllReviews {
  [itemId: number]: UserReview[];
}

// Tipe Context (Tetap Sama)
interface ReviewContextType {
  loading: boolean;
  getReviewsForItem: (itemId: number) => UserReview[];
  addReviewForItem: (itemId: number, rating: number, comment: string) => Promise<void>;
}

// Ganti Kunci Penyimpanan untuk menghindari konflik data lama
const REVIEW_STORAGE_KEY = 'allProductReviews_v3';

// Buat context
const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

// Buat Provider
export const ReviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 2. Set state awal dari initialProductReviews
  const [reviews, setReviews] = useState<AllReviews>(initialProductReviews);
  const [loading, setLoading] = useState(true);

  // Load ulasan saat komponen dimuat
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const storedReviewsString = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
        const storedReviews = storedReviewsString ? JSON.parse(storedReviewsString) : {};

        // 3. Gabungkan data awal dengan data tersimpan
        // Data tersimpan (dari AsyncStorage) lebih diutamakan
        const mergedReviews = { ...initialProductReviews }; // Mulai dengan data awal

        // Timpa atau tambahkan data dari storage
        Object.keys(storedReviews).forEach(itemIdStr => {
          const itemId = parseInt(itemIdStr, 10);
          if (!isNaN(itemId) && Array.isArray(storedReviews[itemId])) {
            // Ambil ulasan unik (berdasarkan ID ulasan) dari gabungan storage dan initial
            const combined = [...storedReviews[itemId], ...(initialProductReviews[itemId] || [])];
            const uniqueReviewsMap = new Map<number, UserReview>();
            combined.forEach(review => {
              if (review && typeof review.id === 'number') { // Pastikan review valid
                 uniqueReviewsMap.set(review.id, review);
              }
            });
             mergedReviews[itemId] = Array.from(uniqueReviewsMap.values());
          }
        });

        setReviews(mergedReviews); // Set state dengan data gabungan

      } catch (error) {
        console.error("Gagal memuat ulasan:", error);
        setReviews(initialProductReviews); // Fallback ke data awal jika error
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  // Fungsi getReviewsForItem (Tetap Sama)
  const getReviewsForItem = (itemId: number): UserReview[] => {
    return (reviews[itemId] || []).sort((a, b) => b.timestamp - a.timestamp);
  };

  // Fungsi addReviewForItem (Update nama & avatar)
  const addReviewForItem = async (itemId: number, rating: number, comment: string) => {
    const newReview: UserReview = {
      id: Date.now(),
      itemId: itemId,
      // --- FIX: Gunakan nama pengguna yang ditentukan ---
      name: 'wildan1512',
      avatar: `https://i.pravatar.cc/150?u=wildan1512`, // Gunakan avatar yang konsisten
      rating: rating,
      comment: comment,
      timestamp: Date.now(),
    };

    const existingReviews = reviews[itemId] || [];
    const updatedReviewsForItem = [newReview, ...existingReviews]; // Tambah di awal
    const updatedAllReviews = { ...reviews, [itemId]: updatedReviewsForItem };

    try {
      setReviews(updatedAllReviews); // Update state
      // Simpan ke AsyncStorage
      await AsyncStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(updatedAllReviews));
    } catch (error) {
      console.error("Gagal menyimpan ulasan:", error);
      // Rollback state jika gagal
      setReviews(reviews);
      throw error; // Lempar error agar bisa ditangani di layar
    }
  };

  return (
    <ReviewContext.Provider value={{ loading, getReviewsForItem, addReviewForItem }}>
      {children}
    </ReviewContext.Provider>
  );
};

// Hook kustom (Tetap Sama)
export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};