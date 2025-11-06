import type { ImageSourcePropType } from 'react-native';

/**
 * Tipe data untuk Seller (Toko/Penjual)
 * (Ini sudah sesuai dengan Prisma)
 */
export interface ApiSeller {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  rating: number | null;
  itemsRented: number | null;
}

/**
 * Tipe data untuk Produk
 * Sesuai dengan model 'Product' di Prisma.
 * Ini adalah "sumber kebenaran" data dari API.
 */
export interface ApiProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  category: string | null;

  // --- 1. PENYESUAIAN ULASAN & RATING ---
  // Ganti field dummy dengan field kumulatif dari schema.prisma
  ratingAvg: number | null;   // <-- Ganti dari 'rating'
  reviewsCount: number | null; // <-- Ganti dari 'reviews'
  // ------------------------------------

  trending: boolean;
  location: string | null;
  period: string | null;
  seller: ApiSeller; // Relasi ke Seller
  // createdAt dan updatedAt bisa ditambahkan jika perlu
  createdAt: string;
  updatedAt: string;
  sellerId: number;
}

/**
 * Tipe data untuk Review/Ulasan.
 * Sesuai dengan API GET /api/products/:id/reviews
 */
export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string; // Ini string tanggal ISO
  
  // Relasi ke user yang menulis
  user: {
    id: number;
    name: string | null;
  };
  
  // Hapus field dummy:
  // itemId: number;
  // name: string;
  // avatar: string;
  // timestamp: number;
}

/**
 * Tipe data untuk item di dalam Keranjang (Cart)
 * (Ini sudah benar, 'item: ApiProduct' akan otomatis diperbarui)
 */
export interface CartEntry {
  item: ApiProduct;
  selected: boolean;
  duration: number; // Durasi sewa
}

/**
 * Tipe data untuk Alamat Pengguna.
 * Sesuai dengan model 'Address' di Prisma.
 */
export interface Address {
  id: number;
  label: string;
  // --- 2. PENYESUAIAN ALAMAT ---
  receiverName: string; // <-- Ganti 'name'
  phone: string;
  street: string;     // <-- Ganti 'fullAddress'
  city: string;       // <-- Field baru
  province: string;   // <-- Field baru
  postalCode: string; // <-- Field baru
  isPrimary: boolean; // <-- Field baru
  userId: number;     // <-- Field baru
  createdAt: string;
  // -----------------------------
  // Hapus latitude/longitude jika tidak ada di schema
  // latitude?: number;
  // longitude?: number;
}

/**
 * Tipe data untuk UI (Sudah Benar)
 * Tipe ini digunakan oleh komponen, datanya sudah dipetakan.
 */
export interface RentalItem {
  id: number;
  name: string;
  category: string;
  description: string;
  image: ImageSourcePropType;
  rating: number;  // Ini diisi dari ApiProduct.ratingAvg
  reviews: number; // Ini diisi dari ApiProduct.reviewsCount
  trending: boolean;
  price: string; 
  period: string;
  location: string;
  seller: ApiSeller;
}

/**
 * Tipe data untuk Checkout (Sudah Benar)
 */
export interface CheckoutRentalItem extends RentalItem {
  duration: number;
}