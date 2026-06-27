const pool = require("../config/database");

exports.getSamplingSessions = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    let dbQuery;
    let queryParams = [];

    if (req.user.role === "admin") {
      dbQuery = "SELECT * FROM sampling ORDER BY dibuat_pada DESC";
    } else {
      dbQuery = "SELECT * FROM sampling WHERE teknisi_id = $1 ORDER BY dibuat_pada DESC";
      queryParams = [req.user.id];
    }

    const result = await client.query(dbQuery, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Gagal mengambil data sampling:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  } finally {
    if (client) client.release();
  }
};

exports.createSamplingSession = async (req, res) => {
  let client;
  try {
    const { tempat_sampling, parameter_uji, perusahaan, waktu_mulai } = req.body;

    if (!tempat_sampling || !parameter_uji || !perusahaan || !waktu_mulai) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    if (tempat_sampling.length > 255 || parameter_uji.length > 255 || perusahaan.length > 255) {
      return res.status(400).json({ success: false, message: "Input melebihi batas panjang yang diizinkan" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
    if (!dateRegex.test(waktu_mulai)) {
      return res.status(400).json({ success: false, message: "Format waktu_mulai tidak valid (ISO 8601)" });
    }

    client = await pool.connect();

    const dbQuery = `
      INSERT INTO sampling (teknisi_id, nama_teknisi, tempat_sampling, parameter_uji, perusahaan, waktu_mulai)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await client.query(dbQuery, [
      req.user.id,
      req.user.nama || req.user.username,
      tempat_sampling,
      parameter_uji,
      perusahaan,
      waktu_mulai,
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Gagal membuat sesi sampling:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  } finally {
    if (client) client.release();
  }
};

exports.deleteSamplingSession = async (req, res) => {
  let client;
  try {
    const { id } = req.params;

    client = await pool.connect();

    let dbQuery;
    let queryParams;

    if (req.user.role === "admin") {
      dbQuery = "DELETE FROM sampling WHERE id = $1 RETURNING id";
      queryParams = [id];
    } else {
      dbQuery = "DELETE FROM sampling WHERE id = $1 AND teknisi_id = $2 RETURNING id";
      queryParams = [id, req.user.id];
    }

    const result = await client.query(dbQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Sesi sampling tidak ditemukan" });
    }

    res.status(200).json({ success: true, message: "Sesi sampling berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus sesi sampling:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  } finally {
    if (client) client.release();
  }
};
