const jwt = require("jsonwebtoken");

// Middleware 1: Mengecek apakah pengguna memiliki token yang valid
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "Akses Ditolak. Token tidak ditemukan." 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const SECRET_KEY = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Simpan data hasil ekstrak token (id, username, role) ke object request
    req.user = decoded; 
    next(); // Silakan masuk ke controller
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Token tidak valid atau sudah kadaluarsa." 
    });
  }
};

// Middleware 2: Mengecek apakah pengguna tersebut adalah Admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: "Akses Terlarang! Hanya Admin yang diizinkan." 
    });
  }
  next(); // Silakan masuk ke controller
};