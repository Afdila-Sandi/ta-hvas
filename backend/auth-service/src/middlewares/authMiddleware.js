const jwt = require("jsonwebtoken");

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
    
    req.user = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Token tidak valid atau sudah kadaluarsa." 
    });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: "Akses Terlarang! Hanya Admin yang diizinkan." 
    });
  }
  next(); 
};