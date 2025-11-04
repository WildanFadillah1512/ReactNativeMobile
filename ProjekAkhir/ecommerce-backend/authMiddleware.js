// ecommerce-backend/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Akses ditolak: Token tidak disediakan' });
  }

  try {
    // Verifikasi token menggunakan secret key Anda
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tempelkan data user (payload) ke request agar bisa dipakai di controller
    // 'payload' ini akan berisi { userId: ..., email: ..., role: '...' }
    req.user = payload; 
    
    next(); // Lolos! Lanjut ke controller

  } catch (err) {
    // Tangani jika token error atau expired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token sudah kedaluwarsa' });
    }
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

module.exports = verifyToken;