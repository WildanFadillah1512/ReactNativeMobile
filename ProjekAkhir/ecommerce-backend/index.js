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
    origin: "*",
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
// (Kode Autentikasi Anda sudah benar)
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
// (Urutan sudah benar)
app.get('/api/products/trending', async (_req, res) => {
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
app.get('/api/products/newest', async (_req, res) => {
    try {
        const newestProducts = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { seller: true }
        });
        res.json({ products: newestProducts });
    } catch (error) {
        console.error("Error fetching newest products:", error);
        res.status(500).json({ error: 'Gagal mengambil produk terbaru' });
    }
});
app.get('/api/products', async (req, res) => {
    try {
        if (req.query.filter === 'popular') {
            const popularProducts = await prisma.product.findMany({
                orderBy: { ratingAvg: 'desc' }, 
                take: 10,
                include: { seller: true }
            });
            return res.status(200).json({ products: popularProducts });
        }
        
        const products = await prisma.product.findMany({ include: { seller: true } });
        res.status(200).json({ products });
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ error: 'Gagal mengambil data produk' });
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
            include: { 
                seller: true,
                reviews: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            },
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
app.get('/api/categories', async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({});
        res.json({ categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: 'Gagal mengambil kategori' });
    }
});
app.get('/api/promotions', async (_req, res) => {
    try {
        const promotions = await prisma.promotion.findMany({
            take: 5,
            orderBy: { id: 'desc' }
        });
        res.json({ promotions });
    } catch (error) {
        console.error("Error fetching promotions:", error);
        res.json({ promotions: [] });
    }
});
app.get('/api/locations/popular', async (_req, res) => {
    try {
        const popularLocations = await prisma.product.groupBy({
            by: ['location'],
            _count: { location: true },
            where: { location: { not: null } },
            orderBy: { _count: { location: 'desc' } },
            take: 8
        });
        const locations = popularLocations.map(l => ({
            name: l.location,
            imageUrl: 'https://via.placeholder.com/150'
        }));
        res.json({ locations });
    } catch (error) {
        console.error("Error fetching popular locations:", error);
        res.status(500).json({ error: 'Gagal mengambil lokasi populer' });
    }
});

// ===================================
// === RUTE FITUR SPESIFIK USER (PRIVAT) ===
// ===================================
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

// ================================================================
// === 🚀 [PERBAIKAN] RUTE UNTUK CHECKOUT, RIWAYAT, & NOTIFIKASI ===
// ================================================================

// --- [BARU] RUTE UNTUK RIWAYAT SEWA ---
app.get('/api/rentals/history', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const rentals = await prisma.rental.findMany({
      where: { userId: userId },
      include: {
        items: true, // Ambil juga barang-barang di dalamnya
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rentals);
  } catch (error) {
    console.error("Error fetching rental history:", error);
    res.status(500).json({ message: "Gagal mengambil riwayat sewa" });
  }
});

// --- [BARU] RUTE UNTUK NOTIFIKASI ---
app.get('/api/notifications', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Batasi 50 notif terbaru
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Gagal mengambil notifikasi" });
  }
});

// --- [BARU] RUTE UNTUK CONTEXT NOTIFIKASI (Hitungan & Tandai Terbaca) ---
app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const count = await prisma.notification.count({
      where: { 
        userId: userId,
        read: false 
      },
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Gagal mengambil hitungan notifikasi" });
  }
});

app.put('/api/notifications/mark-all-read', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
    res.status(200).json({ message: "Semua notifikasi ditandai terbaca" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Gagal menandai notifikasi" });
  }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  try {
    const notif = await prisma.notification.updateMany({
      where: {
        id: Number(id),
        userId: userId,
      },
      data: { read: true },
    });
    res.status(200).json({ message: "Notifikasi ditandai sebagai terbaca" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Gagal menandai notifikasi" });
  }
});


// --- [PERBAIKAN LOGIKA] RUTE UTAMA UNTUK CHECKOUT ---
app.post('/api/checkout', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  // 'items' adalah array CheckoutRentalItem[] dari frontend
  const { addressJson, totalPrice, items } = req.body; 

  if (!addressJson || !totalPrice) {
    return res.status(400).json({ message: "Alamat dan total harga diperlukan" });
  }

  // Validasi 'items' yang dikirim dari frontend
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Tidak ada item untuk di-checkout." });
  }

  try {
    // Kita tidak lagi membaca dari `prisma.cartItem`.
    // Kita PERCAYA pada array 'items' yang dikirim oleh frontend.
    
    const newRental = await prisma.$transaction(async (tx) => {
      
      const rental = await tx.rental.create({
        data: {
          userId: userId,
          totalPrice: totalPrice,
          address: JSON.stringify(addressJson),
          status: 'ACTIVE',
        },
      });

      // Ambil data produk asli dari DB untuk memastikan harga dll valid
      const productIds = items.map(item => item.id);
      const productsFromDb = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { seller: true } // Perlu sellerId
      });

      // Ubah ke format Map untuk pencarian mudah
      const productMap = new Map(productsFromDb.map(p => [p.id, p]));

      // Siapkan data RentalItem berdasarkan 'items' dari req.body
      const rentalItemsData = items.map(item => {
        const product = productMap.get(item.id);
        if (!product) {
          // Ini akan membatalkan transaksi jika ada ID produk yang tidak valid
          throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
        }
        
        return {
          rentalId: rental.id,
          productId: product.id,
          productName: product.name,
          productPrice: product.price, // Ambil harga asli dari DB, bukan string
          imageUrl: product.imageUrl,
          duration: item.duration,
          sellerId: product.sellerId, // Ambil sellerId dari produk DB
        };
      });

      // 5. Buat semua RentalItem
      await tx.rentalItem.createMany({
        data: rentalItemsData,
      });

      // 6. Buat Notifikasi untuk user
      const newNotification = await tx.notification.create({
        data: {
          userId: userId,
          title: "Sewa Berhasil! 🥳",
          message: `Pesanan sewa Anda #${rental.id} telah dikonfirmasi.`,
          linkTo: `rental:${rental.id}`,
        },
      });
      
      // 7. Hapus HANYA item yang di-checkout dari keranjang
      await tx.cartItem.deleteMany({
        where: { 
          userId: userId,
          productId: { in: productIds } // Hanya hapus yang ada di pesanan
        },
      });

      return { rental, newNotification };
    });

    // --- BAGIAN REALTIME (Socket.IO) ---
    io.to(`user_room_${userId}`).emit('new_notification', newRental.newNotification);
    
    res.status(201).json({ 
      message: "Checkout berhasil", 
      rental: newRental.rental 
    });

  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat checkout" });
  }
});


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
            ratingAvg: rating || 0,
            reviewsCount: reviews || 0,
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
// === RUTE CHAT (REST API) ===
// ===================================
app.post('/api/chat/conversations', authMiddleware, async (req, res) => {
    const { sellerId } = req.body;
    const userId = req.user.userId;
    if (typeof sellerId !== 'number') {
        return res.status(400).json({ message: "sellerId (number) diperlukan" });
    }
    try {
        let conversation = await prisma.conversation.findUnique({
            where: { userId_sellerId: { userId, sellerId } },
            include: { seller: { select: { name: true, image: true } } }
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId: userId,
                    sellerId: sellerId,
                },
                include: { seller: { select: { name: true, image: true } } }
            });
        }
        res.status(200).json(conversation);
    } catch (error) {
        console.error("Error finding or creating conversation:", error);
        res.status(500).json({ message: "Gagal memproses percakapan" });
    }
});
app.get('/api/chat/conversations', authMiddleware, async (req, res) => {
    const { userId, role } = req.user;
    try {
        const whereClause = (role === 'USER')
            ? { userId: userId }
            : { userId: userId };
        const conversations = await prisma.conversation.findMany({
            where: whereClause,
            include: {
                seller: { select: { name: true, image: true } },
                user: { select: { name: true } },
                _count: { select: { messages: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Gagal mengambil daftar percakapan" });
    }
});
app.get('/api/chat/conversations/:id/messages', authMiddleware, async (req, res) => {
    const conversationId = req.params.id;
    const userId = req.user.userId;
    try {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: userId 
            }
        });
        if (!conversation) {
            return res.status(404).json({ message: "Percakapan tidak ditemukan atau Anda tidak memiliki akses" });
        }
        const messages = await prisma.message.findMany({
            where: { conversationId: conversationId },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { name: true, id: true } } }
        });
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Gagal mengambil pesan" });
    }
});


// ===================================
// === 3. LOGIKA REAL-TIME (SOCKET.IO) ===
// ===================================
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ 
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true }
    });
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    socket.user = user;
    next();
  } catch (error) {
    console.log("Socket auth error:", error.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Seorang pengguna terhubung: ${socket.id} (User ID: ${socket.user.id})`);
  
  // --- [BARU] Tambahkan user ke room pribadinya untuk notifikasi ---
  socket.join(`user_room_${socket.user.id}`);
  // -------------------------------------------------------------

  // 'join_room' untuk chat
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.name} (Socket ${socket.id}) bergabung ke room ${roomId}`);
  });
  
  // 'send_message' untuk chat
  socket.on('send_message', async (data) => {
    const { conversationId, content } = data;
    const { id: senderId, role: senderRole } = socket.user;
    if (!conversationId || !content) {
        socket.emit("chat_error", { message: "conversationId dan content diperlukan" });
        return;
    }
    try {
        const newMessage = await prisma.message.create({
            data: {
                content: content,
                senderId: senderId,
                senderRole: senderRole,
                conversationId: conversationId
            },
            include: {
                user: { select: { name: true, id: true } }
            }
        });
        io.to(conversationId).emit('receive_message', newMessage);
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
    } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("chat_error", { message: "Gagal mengirim pesan" });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Pengguna terputus: ${socket.id} (User ID: ${socket.user.id})`);
  });
});

// --- 4. Menjalankan Server ---
server.listen(port, () => {
    console.log(`🚀 Server berjalan (Express + Socket.IO) di http://localhost:${port}`);
});