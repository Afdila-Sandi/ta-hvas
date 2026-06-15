const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// RUTE PUBLIK (Tanpa Middleware) 
router.post("/login", authController.login);

// 1. Ambil Profil Sendiri (Hanya butuh login / verifyToken)
router.get("/profile", verifyToken, authController.getProfile);

// 2. Tambah Pengguna Baru (Butuh login DAN harus Admin)
router.post("/register", verifyToken, isAdmin, authController.register);

// 3. Lihat Daftar Pengguna (Butuh login DAN harus Admin)
router.get("/users", verifyToken, isAdmin, authController.getUsers);

module.exports = router;
