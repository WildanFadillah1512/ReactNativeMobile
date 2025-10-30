// File: ./src/types.ts (FINAL - Disesuaikan dengan ApiProduct & ApiSeller)

import type { ImageSourcePropType } from 'react-native';

// ==========================
// 🚀 API Data Types (Single Source of Truth)
// ==========================
// Tipe ini mewakili data MURNI dari backend Anda.
// Semua state utama (di Context, HomeScreen, DetailScreen) HARUS menggunakan ini.

export interface ApiSeller {
    id: number;
    name: string;
    avatar: string | null; // <-- Bisa null dari API
    bio: string | null;    // <-- Bisa null dari API
    rating: number | null; // <-- Bisa null dari API
    itemsRented: number | null; // <-- Bisa null dari API
}

export interface ApiProduct {
    id: number;
    name: string;
    price: number; // <-- PENTING: number (angka murni)
    description: string;
    imageUrl: string | null; // <-- Nama file gambar (bisa null)
    category: string | null; // <-- Bisa null dari API
    rating: number | null;   // <-- Bisa null dari API
    reviews: number | null;  // <-- Bisa null dari API
    trending: boolean;
    location: string | null; // <-- Bisa null dari API
    period: string | null;   // <-- Bisa null dari API
    seller: ApiSeller; // <-- Menggunakan ApiSeller yang benar
}


// ==========================
// 🧺 Cart Entry Definition (FIXED)
// ==========================
// Ini adalah struktur data yang disimpan di CartContext.
// HARUS menggunakan ApiProduct agar kalkulasi harga benar.
export interface CartEntry {
    item: ApiProduct; // <-- FIX: Menggunakan ApiProduct, bukan RentalItem
    selected: boolean;
    duration: number;
}


// ==========================
// ⭐ User Review Definition
// ==========================
// (Tidak diubah, diasumsikan sudah benar)
export interface UserReview {
    id: number;
    itemId: number; // ID produk yang direview
    name: string;
    avatar: string; // URL avatar reviewer
    rating: number; // 1-5
    comment: string;
    timestamp: number;
}


// ==========================
// 📍 Address Definition
// ==========================
// (Tidak diubah, diasumsikan sudah benar)
export interface Address {
    id: number;
    label: string;
    name: string;
    phone: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
}


// =============================================
//  legacy / Formatted UI Types
// =============================================
// Tipe-tipe di bawah ini adalah tipe "lama" atau tipe yang sudah
// diformat KHUSUS untuk ditampilkan di UI tertentu (misal: CheckoutScreen).
// Hindari penggunaan tipe ini untuk state utama atau kalkulasi.

// Tipe 'Seller' lama tidak diperlukan lagi, gunakan ApiSeller.
// export interface Seller { ... }

// Tipe RentalItem lama (price: string, image: ImageSourcePropType)
// Ini adalah tipe data TERFORMAT.
export interface RentalItem {
    id: number;
    name: string;
    category: string;
    description: string;
    image: ImageSourcePropType; // <-- Tipe untuk komponen <Image>
    rating: number;
    reviews: number;
    trending: boolean;
    price: string; // <-- PENTING: string (misal: "Rp 50.000")
    period: string;
    location: string;
    seller: ApiSeller; // <-- Disesuaikan menggunakan ApiSeller
}

// Tipe CheckoutRentalItem (bergantung pada RentalItem)
// Ini digunakan oleh CheckoutScreen.
export interface CheckoutRentalItem extends RentalItem {
    duration: number;
}