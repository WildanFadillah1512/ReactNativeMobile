// ecommerce-backend/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
  // Middleware ini HARUS dijalankan SETELAH authMiddleware,
  // sehingga kita bisa mengakses 'req.user'
  
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Lolos, dia adalah admin
  } else {
    // Jika bukan admin, tolak akses
    return res.status(403).json({ message: 'Akses ditolak! Hanya untuk Admin.' });
  }
};

module.exports = adminMiddleware;
