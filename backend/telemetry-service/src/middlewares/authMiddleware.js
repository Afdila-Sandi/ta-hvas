const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("[AUTH] Header diterima:", authHeader ? "Ada" : "TIDAK ADA");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[AUTH] Semua headers:", JSON.stringify(req.headers));
    return res
      .status(401)
      .json({ success: false, message: "Akses ditolak. Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("[AUTH] JWT verify gagal:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Token tidak valid atau sudah kadaluarsa." });
  }
};
