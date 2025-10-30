const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path'); // <-- Tambahkan ini untuk path

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json()); // Penting! Agar bisa baca req.body

// === Konfigurasi Static Files (Untuk Gambar) ===
// Sajikan file dari folder 'public' di root backend
// Contoh: Request ke http://localhost:3000/images/nama-gambar.jpg
// akan mengambil file dari ecommerce-backend/public/images/nama-gambar.jpg
app.use(express.static(path.join(__dirname, 'public'))); // <-- Tambahkan ini

// === API ENDPOINTS ===

/**
 * 1. GET /api/products
 * (Untuk HomeScreen, SearchResultsScreen, SavedScreen)
 * Mengambil SEMUA produk + data seller
 */
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: true, // Ambil data relasi seller
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching all products:", error); // Lebih spesifik
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});

/**
 * 5. GET /api/products/trending <<-- URUTAN BENAR (SEBELUM /:id)
 * (Untuk SearchHistoryScreen)
 * Mengambil produk yang TRENDING + data seller
 */
app.get('/api/products/trending', async (req, res) => {
  try {
    const trendingProducts = await prisma.product.findMany({
      where: { trending: true },
      take: 6, // Ambil 6 teratas
      include: { seller: true },
    });
    res.status(200).json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error); // Lebih spesifik
    // Perbaiki pesan error agar sesuai endpoint
    res.status(500).json({ error: 'Gagal mengambil produk trending' });
  }
});


/**
 * 2. GET /api/products/:id <<-- URUTAN BENAR (SETELAH /trending)
 * (Untuk DetailScreen - NANTI)
 * Mengambil SATU produk berdasarkan ID + data seller
 * --- SUDAH DIPERBAIKI (Validasi ID) ---
 */
app.get('/api/products/:id', async (req, res) => {
  const { id: idParam } = req.params; // Ambil ID dari URL, ganti nama biar jelas

  // --- PERBAIKAN START ---
  const productId = parseInt(idParam); // Parse ke integer DULU

  // Cek apakah hasil parsing valid (bukan NaN)
  if (isNaN(productId)) {
    // Jika tidak valid, kirim error 400
    return res.status(400).json({ error: 'Format ID produk tidak valid' });
  }
  // --- PERBAIKAN END ---

  try {
    const product = await prisma.product.findUnique({
      // Gunakan integer yang sudah divalidasi
      where: { id: productId },
      include: {
        seller: true, // Ambil data relasi seller
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    res.status(200).json(product);
  } catch (error) {
    // Log error spesifik untuk endpoint ini
    console.error(`Error fetching product with ID ${productId}:`, error);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});


/**
 * 3. POST /api/products
 * (Untuk fitur tambah produk - NANTI)
 * Membuat produk baru
 * --- SUDAH DIPERBAIKI (Validasi Input & Seller) ---
 */
app.post('/api/products', async (req, res) => {
  try {
    // Ambil SEMUA data dari body, termasuk sellerId
    const {
      name, price, description, imageUrl, category, rating,
      reviews, trending, location, period, sellerId
    } = req.body;

    // Validasi sederhana
    if (!name || typeof price !== 'number' || typeof sellerId !== 'number') { // Perbaiki validasi
        return res.status(400).json({ error: 'Name (string), price (number), and sellerId (number) are required' });
    }

    // Pastikan seller ada sebelum membuat produk
    const sellerExists = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!sellerExists) {
        return res.status(400).json({ error: `Seller with ID ${sellerId} not found` });
    }

    const newProduct = await prisma.product.create({
      data: {
        name, price, description, imageUrl, category, rating,
        reviews, trending, location, period,
        // Cara menghubungkan ke seller yang sudah ada
        seller: {
          connect: { id: sellerId }
        }
      },
    });
    res.status(201).json(newProduct); // 201 = Created
  } catch (error) {
     console.error("Error creating product:", error); // Lebih spesifik
    res.status(500).json({ error: 'Gagal membuat produk baru' });
  }
});

/**
 * 4. GET /api/sellers/:id/products
 * (Untuk SellerProfileScreen)
 * Mengambil semua produk DARI SATU SELLER + data seller
 * --- SUDAH DIPERBAIKI (Validasi ID) ---
 */
app.get('/api/sellers/:id/products', async (req, res) => {
  const { id: idParam } = req.params; // Ambil ID seller dari URL

  // --- PERBAIKAN START ---
  const sellerId = parseInt(idParam); // Parse ID seller

  // Validasi ID seller
  if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Format ID seller tidak valid' });
  }
  // --- PERBAIKAN END ---

  try {
    // Optional: Cek dulu apakah seller ada
    const sellerExists = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!sellerExists) {
        return res.status(404).json({ error: `Seller with ID ${sellerId} not found` });
    }

    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerId, // Filter produk berdasarkan sellerId yang valid
      },
      include: {
        seller: true, // Sertakan juga data sellernya
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(`Error fetching products for seller ID ${sellerId}:`, error); // Lebih spesifik
    res.status(500).json({ error: 'Gagal mengambil produk seller' });
  }
});


// === (Tambahkan Rute Auth di Sini Nanti) ===
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// app.post('/api/auth/register', ...);
// app.post('/api/auth/login', ...);


// ======================

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});