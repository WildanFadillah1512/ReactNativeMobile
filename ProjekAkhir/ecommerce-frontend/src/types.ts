import type { ImageSourcePropType } from 'react-native';

/**
 * Tipe data untuk Seller (Toko/Penjual)
 * Sesuai dengan model 'Seller' di Prisma.
 */
export interface ApiSeller {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  rating: number | null;
  itemsRented: number | null;
  // createdAt dan updatedAt bisa ditambahkan jika frontend perlu
}

/**
 * Tipe data untuk Produk
 * Sesuai dengan model 'Product' di Prisma.
 * Ini adalah "sumber kebenaran" data dari API.
 */
export interface ApiProduct {
  id: number;
  name: string;
  price: number; // Dari API, harga adalah angka
  description: string;
  imageUrl: string | null;
  category: string | null;
  rating: number | null;
  reviews: number | null;
  trending: boolean;
  location: string | null;
  period: string | null;
  seller: ApiSeller; // Relasi ke Seller
  // createdAt dan updatedAt bisa ditambahkan
}

/**
 * Tipe data untuk Review/Ulasan.
 * (Nantinya ini akan menjadi model 'Review' di Prisma)
 */
export interface Review {
  id: number;
  itemId: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  timestamp: number; // Sebaiknya gunakan tipe 'Date' atau string ISO
}

/**
 * Tipe data untuk item di dalam Keranjang (Cart)
 * Menggunakan ApiProduct sebagai data dasarnya.
 */
export interface CartEntry {
  item: ApiProduct;
  selected: boolean;
  duration: number; // Durasi sewa
}

/**
 * Tipe data untuk Alamat Pengguna.
 * (Nantinya ini akan menjadi model 'Address' di Prisma)
 */
export interface Address {
  id: number;
  label: string;
  name: string;
  phone: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}
export interface RentalItem {
  id: number;
  name: string;
  category: string;
  description: string;
  image: ImageSourcePropType; // Berbeda dari ApiProduct (imageUrl: string)
  rating: number;
  reviews: number;
  trending: boolean;
  price: string; // Berbeda dari ApiProduct (price: number)
  period: string;
  location: string;
  seller: ApiSeller;
}
export interface CheckoutRentalItem extends RentalItem {
  duration: number;
}