const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

//rute publik
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);

//rute privat (butuh token)
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, authController.updateOwnProfile);
router.post("/logout", verifyToken, authController.logout);

//rute admin
router.post("/register", verifyToken, isAdmin, authController.register);
router.get("/users", verifyToken, isAdmin, authController.getUsers);
router.put("/users/:id", verifyToken, isAdmin, authController.updateUser);
router.delete("/users/:id", verifyToken, isAdmin, authController.deleteUser);

module.exports = router;
