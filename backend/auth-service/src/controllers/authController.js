const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari pengguna
    const dbQuery = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(dbQuery, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username tidak terdaftar",
      });
    }

    const user = result.rows[0];

    // Verifikasi kata sandi
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    // Buat JWT
    const SECRET_KEY = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.peran,
      },
      SECRET_KEY,
      { expiresIn: "24h" },
    );

    // Kirim respon
    return res.status(200).json({
      success: true,
      message: "Otentikasi berhasil",
      token: token,
      role: user.peran,
    });
  } catch (error) {
    console.error("Error login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada peladen",
    });
  }
};

// register
exports.register = async (req, res) => {
  const { username, password, nama, peran } = req.body;

  // validasi peran
  if (!["teknisi", "admin"].includes(peran)) {
    return res.status(400).json({
      success: false,
      message: "Peran harus 'teknisi' atau 'admin'",
    });
  }

  try {
    // Cek apakah username sudah ada
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    if (checkUser.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Username sudah digunakan" });
    }

    // Hash kata sandi baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database
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
    console.error("Error register:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada peladen saat membuat pengguna",
    });
  }
};
// Fungsi untuk mengambil data profil diri sendiri
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

  // Validasi peran
  if (peran && !["teknisi", "admin"].includes(peran)) {
    return res
      .status(400)
      .json({ success: false, message: "Peran harus 'teknisi' atau 'admin'" });
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
    return res
      .status(500)
      .json({
        success: false,
        message: "Terjadi kesalahan pada peladen saat memperbarui pengguna.",
      });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res
      .status(403)
      .json({
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
    return res
      .status(500)
      .json({
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Username tersebut sudah digunakan.",
        });
    }

    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan peladen." });
  }
};
