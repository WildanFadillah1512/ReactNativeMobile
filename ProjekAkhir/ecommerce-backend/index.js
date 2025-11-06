// --- Impor Library ---
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- 1. IMPOR MODUL BARU UNTUK SOCKET.IO ---
const http = require('http');
const { Server } = require("socket.io");

// --- Impor middleware dari file terpisah ---
const authMiddleware = require('./authMiddleware');
const adminMiddleware = require('./adminMiddleware');

// --- Inisialisasi ---
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

// --- 2. BUAT HTTP SERVER & BUNGKUS 'app' ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Izinkan semua koneksi (sesuaikan untuk produksi)
    methods: ["GET", "POST"]
  }
});
// ----------------------------------------

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===================================
// === RUTE AUTENTIKASI (USER) ===
// ===================================
// (Rute /register, /login, /me Anda sudah benar)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password diperlukan' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email sudah terdaftar' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword },
        });
        res.status(201).json({
            message: 'User berhasil dibuat',
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,                 
            { expiresIn: '7d' } 
        );
        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; 
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true, role: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});


// ===================================
// === RUTE PRODUK & SELLER (PUBLIK) ===
// ===================================
// (Rute /products, /products/trending, /products/:id, /sellers/:id/products sudah benar)
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({ include: { seller: true } });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
});
app.get('/api/products/trending', async (req, res) => {
    try {
        const trendingProducts = await prisma.product.findMany({
            where: { trending: true },
            take: 6,
            include: { seller: true },
        });
        res.status(200).json(trendingProducts);
    } catch (error) {
        console.error("Error fetching trending products:", error);
        res.status(500).json({ error: 'Gagal mengambil produk trending' });
    }
});
app.get('/api/products/:id', async (req, res) => {
    const { id: idParam } = req.params;
    const productId = parseInt(idParam)
    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Format ID produk tidak valid' });
    }
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { seller: true },
        });
        if (!product) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error(`Error fetching product with ID ${productId}:`, error);
        res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
});
app.get('/api/sellers/:id/products', async (req, res) => {
    const { id: idParam } = req.params;
    const sellerId = parseInt(idParam);
    if (isNaN(sellerId)) {
        return res.status(400).json({ error: 'Format ID seller tidak valid' });
    }
    try {
        const sellerExists = await prisma.seller.findUnique({ where: { id: sellerId } });
        if (!sellerExists) {
            return res.status(404).json({ error: `Seller with ID ${sellerId} not found` });
        }
        const products = await prisma.product.findMany({
            where: { sellerId: sellerId },
            include: { seller: true },
        });
        res.status(200).json(products);
    } catch (error) {
        console.error(`Error fetching products for seller ID ${sellerId}:`, error);
        res.status(500).json({ error: 'Gagal mengambil produk seller' });
    }
});

// --- RUTE UNTUK MEMBACA ULASAN (PUBLIK) ---
app.get('/api/products/:id/reviews', async (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Format ID produk tidak valid' });
  }
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { 
          select: { name: true, id: true } 
        }
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Gagal mengambil ulasan" });
  }
});
// --- AKHIR BLOK ULASAN PUBLIK ---


// ===================================
// === RUTE FITUR SPESIFIK USER (PRIVAT) ===
// ===================================

// --- RUTE UNTUK "LIKES" (SAVEDPRODUCT) ---
app.get('/api/likes', authMiddleware, async (req, res) => {
  const userId = req.user.userId; 
  try {
    const savedProducts = await prisma.savedProduct.findMany({
      where: { userId: userId },
      include: { 
        product: { include: { seller: true } } 
      }
    });
    res.json(savedProducts.map(sp => sp.product));
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ message: "Gagal mengambil data likes" });
  }
});
app.post('/api/likes', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;
  if (typeof productId !== 'number') {
    return res.status(400).json({ message: "productId (number) diperlukan" });
  }
  try {
    const existingLike = await prisma.savedProduct.findUnique({
      where: { userId_productId: { userId, productId } }
    });
    if (existingLike) {
      await prisma.savedProduct.delete({ where: { id: existingLike.id } });
      res.status(200).json({ liked: false, message: 'Produk dihapus dari simpanan' });
    } else {
      await prisma.savedProduct.create({ data: { userId: userId, productId: productId } });
      res.status(201).json({ liked: true, message: 'Produk disimpan' });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Gagal memproses like/unlike" });
  }
});

// --- RUTE UNTUK "KERANJANG" (CARTITEM) ---
app.get('/api/cart', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: { 
        product: { include: { seller: true } } 
      },
      orderBy: { id: 'asc' }
    });
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Gagal mengambil data keranjang" });
  }
});
app.post('/api/cart', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { productId, duration = 1 } = req.body;
  if (typeof productId !== 'number') {
    return res.status(400).json({ message: "productId (number) diperlukan" });
  }
  try {
    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } }
    });
    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { duration: duration },
        include: { product: { include: { seller: true } } }
      });
      res.status(200).json({ message: 'Durasi item diupdate', item: updatedItem });
    } else {
      const newItem = await prisma.cartItem.create({
        data: { userId: userId, productId: productId, duration: duration },
        include: { product: { include: { seller: true } } }
      });
      res.status(201).json({ message: 'Item ditambahkan ke keranjang', item: newItem });
    }
  } catch (error) {
    console.error("Error adding/updating cart:", error);
    res.status(500).json({ message: "Gagal memproses keranjang" });
  }
});
app.delete('/api/cart/:productId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).json({ message: "Format productId tidak valid" });
  }
  try {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } }
    });
    res.status(200).json({ message: 'Item dihapus dari keranjang' });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Gagal menghapus item" });
  }
});
app.delete('/api/cart', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    await prisma.cartItem.deleteMany({ where: { userId: userId } });
    res.status(200).json({ message: 'Keranjang dikosongkan' });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Gagal mengosongkan keranjang" });
  }
});

// --- RUTE UNTUK "ALAMAT" (ADDRESS) ---
app.get('/api/addresses', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Gagal mengambil data alamat" });
  }
});
app.post('/api/addresses', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { label, street, city, province, postalCode, phone, receiverName } = req.body;
  if (!label || !street || !city || !province || !postalCode || !phone || !receiverName) {
    return res.status(400).json({ message: "Semua field alamat diperlukan" });
  }
  try {
    const newAddress = await prisma.address.create({
      data: { ...req.body, userId: userId }
    });
    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ message: "Gagal menyimpan alamat" });
  }
});
app.delete('/api/addresses/:id', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const addressId = parseInt(req.params.id);
  if (isNaN(addressId)) {
    return res.status(400).json({ message: "ID Alamat tidak valid" });
  }
  try {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: userId }
    });
    if (!address) {
      return res.status(404).json({ message: "Alamat tidak ditemukan atau bukan milik Anda" });
    }
    await prisma.address.delete({ where: { id: addressId } });
    res.status(200).json({ message: "Alamat berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Gagal menghapus alamat" });
  }
});
app.put('/api/addresses/:id', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const addressId = parseInt(req.params.id);
  if (isNaN(addressId)) {
    return res.status(400).json({ message: "ID Alamat tidak valid" });
  }
  const { label, street, city, province, postalCode, phone, receiverName } = req.body;
  if (!label || !street || !city || !province || !postalCode || !phone || !receiverName) {
    return res.status(400).json({ message: "Semua field alamat diperlukan" });
  }
  try {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: userId }
    });
    if (!address) {
      return res.status(404).json({ message: "Alamat tidak ditemukan atau bukan milik Anda" });
    }
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { label, street, city, province, postalCode, phone, receiverName }
    });
    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Gagal memperbarui alamat" });
  }
});
// --- AKHIR BLOK ALAMAT ---

// --- RUTE UNTUK "ULASAN" (REVIEW) ---
app.post('/api/products/:id/reviews', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const productId = parseInt(req.params.id);
  const { rating, comment } = req.body;

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Format ID produk tidak valid' });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating (angka 1-5) diperlukan" });
  }
  
  try {
    const [newReview] = await prisma.$transaction([
      prisma.review.create({
        data: {
          rating: rating,
          comment: comment,
          userId: userId,
          productId: productId
        }
      }),
      prisma.$executeRaw`
        UPDATE "Product"
        SET "ratingAvg" = (
              SELECT AVG(rating)
              FROM "Review"
              WHERE "productId" = ${productId}
            ),
            "reviewsCount" = (
              SELECT COUNT(id)
              FROM "Review"
              WHERE "productId" = ${productId}
            )
        WHERE id = ${productId};
      `
    ]);
    
    res.status(201).json(newReview);
    
  } catch (error) {
    if (error.code === 'P2002') { 
      return res.status(409).json({ message: "Anda sudah pernah memberi ulasan untuk produk ini" });
    }
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Gagal menyimpan ulasan" });
  }
});
// --- AKHIR BLOK ULASAN ---

// ===================================
// === RUTE ADMIN (DILINDUNGI) ===
// ===================================
app.post('/api/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
        name, price, description, imageUrl, category, rating,
        reviews, trending, location, period, sellerId
    } = req.body;

    if (!name || typeof price !== 'number' || typeof sellerId !== 'number') {
        return res.status(400).json({ error: 'Name (string), price (number), and sellerId (number) are required' });
    }
    const sellerExists = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!sellerExists) {
        return res.status(400).json({ error: `Seller with ID ${sellerId} not found` });
    }
    
    const newProduct = await prisma.product.create({
        data: {
            name, price, description, imageUrl, category, 
            ratingAvg: rating || 0, // <-- Gunakan field baru
            reviewsCount: reviews || 0, // <-- Gunakan field baru
            trending, location, period,
            seller: {
                connect: { id: sellerId }
            }
        },
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: 'Gagal membuat produk baru' });
  }
});

// ===================================
// === 3. LOGIKA CHAT REAL-TIME (SOCKET.IO) ===
// ===================================
io.on('connection', (socket) => {
  console.log('🔌 Seorang pengguna terhubung:', socket.id);

  // 'join_room' akan dipanggil oleh frontend saat membuka ChatScreen
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} bergabung ke room ${roomId}`);
  });

  // 'send_message' dipanggil saat user menekan tombol kirim
  socket.on('send_message', (data) => {
    // 'data' akan berisi: { roomId, message, senderId, ... }
    
    // (Opsional: Simpan 'data.message' ke database Prisma di sini)

    // Kirim pesan ke SEMUA orang di room itu (termasuk pengirim)
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Pengguna terputus:', socket.id);
  });
});

// --- 4. Menjalankan Server ---
// HAPUS: app.listen(port, () => { ... });

// GANTI DENGAN:
server.listen(port, () => {
    console.log(`🚀 Server berjalan (Express + Socket.IO) di http://localhost:${port}`);
});