const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

//login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username dan password harus diisi" });
  }

  try {
    const dbQuery = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(dbQuery, [username]);

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Username atau password salah" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Username atau password salah" });
    }

    const SECRET_KEY = process.env.JWT_SECRET;
    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    //token 15 menit
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.peran, nama: user.nama },
      SECRET_KEY,
      { expiresIn: "15m" },
    );

    //refresh token 24 Jam
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: "24h",
    });

    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.id,
    ]);

    res.cookie("hvas_refresh_token", refreshToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: "none", 
      maxAge: 24 * 60 * 60 * 1000, 
    });

    //respon
    return res.status(200).json({
      success: true,
      message: "Otentikasi berhasil",
      accessToken: accessToken,
      role: user.peran,
    });
  } catch (error) {
    console.error("Error login:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada peladen" });
  }
};

//refresh token 
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.hvas_refresh_token;

  if (!refreshToken) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Sesi tidak ditemukan atau cookie hilang.",
      });
  }

  try {
    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const dbQuery =
      "SELECT refresh_token, username, nama, peran FROM users WHERE id = $1";
    const result = await pool.query(dbQuery, [decoded.id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    const user = result.rows[0];

    //single session
    if (user.refresh_token !== refreshToken) {
      res.clearCookie("hvas_refresh_token");
      return res.status(403).json({
        success: false,
        message:
          "Sesi telah digantikan oleh perangkat lain. Silakan login kembali.",
      });
    }

    const SECRET_KEY = process.env.JWT_SECRET;
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: user.username, role: user.peran, nama: user.nama },
      SECRET_KEY,
      { expiresIn: "15m" },
    );

    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refresh token:", error.message);
    res.clearCookie("hvas_refresh_token"); 
    return res.status(403).json({
      success: false,
      message:
        "Refresh token kedaluwarsa atau tidak valid. Silakan login ulang.",
    });
  }
};

//logout
exports.logout = async (req, res) => {
  try {
    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [
      req.user.id,
    ]);

    res.clearCookie("hvas_refresh_token");

    return res.status(200).json({ success: true, message: "Logout berhasil." });
  } catch (error) {
    console.error("Error logout:", error.message);
    return res
      .status(500)
      .json({
        success: false,
        message: "Terjadi kesalahan peladen saat logout.",
      });
  }
};

// register
exports.register = async (req, res) => {
  const { username, password, nama, peran } = req.body;

  if (!username || !password || !nama || !peran) {
    return res.status(400).json({
      success: false,
      message: "Semua field harus diisi",
    });
  }

  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Username harus 3-50 karakter",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password minimal 6 karakter",
    });
  }

  if (nama.length < 1 || nama.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Nama harus 1-100 karakter",
    });
  }

  if (!["teknisi", "admin", "penyelia"].includes(peran)) {
    return res.status(400).json({
      success: false,
      message: "Peran harus 'teknisi', 'admin', atau 'penyelia'",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertQuery = `
      INSERT INTO users (username, password_hash, nama, peran) 
      VALUES ($1, $2, $3, $4) RETURNING id, username, peran
    `;
    const result = await pool.query(insertQuery, [
      username,
      hashedPassword,
      nama,
      peran,
    ]);

    return res.status(201).json({
      success: true,
      message: "Pengguna baru berhasil ditambahkan",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Username sudah digunakan",
      });
    }
    console.error("Error register:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada peladen saat membuat pengguna",
    });
  }
};

//fungsi profil
exports.getProfile = async (req, res) => {
  try {
    const dbQuery = "SELECT id, username, nama, peran FROM users WHERE id = $1";
    const result = await pool.query(dbQuery, [req.user.id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error mengambil profil:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan peladen" });
  }
};

exports.getUsers = async (req, res) => {
  const { role } = req.query;

  try {
    let dbQuery =
      "SELECT id, username, nama, peran FROM users ORDER BY nama ASC";
    let queryParams = [];

    if (role) {
      if (!["teknisi", "admin", "penyelia"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role tidak valid",
        });
      }
      dbQuery =
        "SELECT id, username, nama, peran FROM users WHERE peran = $1 ORDER BY nama ASC";
      queryParams = [role];
    }

    const result = await pool.query(dbQuery, queryParams);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error mengambil daftar pengguna:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada peladen" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, nama, peran, password } = req.body;

  const userId = Number(id);
  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID pengguna tidak valid",
    });
  }

  if (!username || !nama) {
    return res.status(400).json({
      success: false,
      message: "Username dan nama harus diisi",
    });
  }

  if (peran && !["teknisi", "admin", "penyelia"].includes(peran)) {
    return res
      .status(400)
      .json({ success: false, message: "Peran harus 'teknisi', 'admin', atau 'penyelia'" });
  }

  if (password && password.trim() !== "" && password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password minimal 6 karakter",
    });
  }

  try {
    const checkUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (checkUser.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    let updateQuery;
    let queryParams;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      updateQuery = `
        UPDATE users 
        SET username = $1, nama = $2, peran = $3, password_hash = $4 
        WHERE id = $5 RETURNING id, username, nama, peran
      `;
      queryParams = [username, nama, peran, hashedPassword, id];
    } else {
      updateQuery = `
        UPDATE users 
        SET username = $1, nama = $2, peran = $3 
        WHERE id = $4 RETURNING id, username, nama, peran
      `;
      queryParams = [username, nama, peran, id];
    }

    const result = await pool.query(updateQuery, queryParams);
    return res.status(200).json({
      success: true,
      message: "Data pengguna berhasil diperbarui.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error update user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada peladen saat memperbarui pengguna.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const userId = Number(id);
  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID pengguna tidak valid",
    });
  }

  if (userId === req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Anda tidak dapat menghapus akun Anda sendiri!",
    });
  }

  try {
    const deleteQuery = "DELETE FROM users WHERE id = $1 RETURNING id";
    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Pengguna berhasil dihapus." });
  } catch (error) {
    console.error("Error delete user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada peladen saat menghapus pengguna.",
    });
  }
};

exports.updateOwnProfile = async (req, res) => {
  const userId = req.user.id;
  const { nama, username, newPassword } = req.body;

  try {
    let updateQuery;
    let queryParams;

    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ success: false, message: "Kata sandi minimal 6 karakter." });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      updateQuery = `
        UPDATE users 
        SET nama = $1, username = $2, password_hash = $3 
        WHERE id = $4 RETURNING id, nama, username
      `;
      queryParams = [nama, username, hashedPassword, userId];
    } else {
      updateQuery = `
        UPDATE users 
        SET nama = $1, username = $2 
        WHERE id = $3 RETURNING id, nama, username
      `;
      queryParams = [nama, username, userId];
    }

    const result = await pool.query(updateQuery, queryParams);

    return res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error update profile:", error.message);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Username tersebut sudah digunakan.",
      });
    }

    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan peladen." });
  }
};
