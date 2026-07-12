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
    const { tempat_sampling, parameter_uji, perusahaan, waktu_mulai, kondisi_cuaca } = req.body;

    if (!tempat_sampling || !parameter_uji || !perusahaan || !waktu_mulai || !kondisi_cuaca) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    if (tempat_sampling.length > 255 || parameter_uji.length > 255 || perusahaan.length > 255 || kondisi_cuaca.length > 255) {
      return res.status(400).json({ success: false, message: "Input melebihi batas panjang yang diizinkan" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
    if (!dateRegex.test(waktu_mulai)) {
      return res.status(400).json({ success: false, message: "Format waktu_mulai tidak valid (ISO 8601)" });
    }

    client = await pool.connect();

    const cekAktif = await client.query(
      `SELECT id FROM sampling WHERE waktu_mulai + INTERVAL '24 hours' > NOW() AND teknisi_id != $1`,
      [req.user.id]
    );
    if (cekAktif.rows.length > 0) {
      return res.status(403).json({ success: false, message: "Sedang ada sesi sampling aktif dari teknisi lain. Silakan tunggu hingga sesi selesai." });
    }

    const dbQuery = `
      INSERT INTO sampling (teknisi_id, nama_teknisi, tempat_sampling, parameter_uji, perusahaan, kondisi_cuaca, waktu_mulai)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await client.query(dbQuery, [
      req.user.id,
      req.user.nama || req.user.username,
      tempat_sampling,
      parameter_uji,
      perusahaan,
      kondisi_cuaca,
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

exports.getActiveSession = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const mySession = await client.query(
      `SELECT * FROM sampling WHERE teknisi_id = $1 AND waktu_mulai + INTERVAL '24 hours' > NOW() ORDER BY waktu_mulai DESC LIMIT 1`,
      [req.user.id]
    );
    const otherSession = await client.query(
      `SELECT * FROM sampling WHERE teknisi_id != $1 AND waktu_mulai + INTERVAL '24 hours' > NOW() ORDER BY waktu_mulai DESC LIMIT 1`,
      [req.user.id]
    );
    return res.status(200).json({
      active: mySession.rows.length > 0,
      session: mySession.rows.length > 0 ? mySession.rows[0] : null,
      blocked_by_other: otherSession.rows.length > 0,
      other_session: otherSession.rows.length > 0 ? otherSession.rows[0] : null,
    });
  } catch (error) {
    console.error("Gagal mengecek sesi aktif:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  } finally {
    if (client) client.release();
  }
};

exports.updateSamplingSession = async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { tempat_sampling, parameter_uji, perusahaan, kondisi_cuaca, waktu_mulai } = req.body;

    if (!tempat_sampling || !parameter_uji || !perusahaan || !kondisi_cuaca || !waktu_mulai) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    if (tempat_sampling.length > 255 || parameter_uji.length > 255 || perusahaan.length > 255 || kondisi_cuaca.length > 255) {
      return res.status(400).json({ success: false, message: "Input melebihi batas panjang yang diizinkan" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
    if (!dateRegex.test(waktu_mulai)) {
      return res.status(400).json({ success: false, message: "Format waktu_mulai tidak valid (ISO 8601)" });
    }

    client = await pool.connect();

    let dbQuery;
    let queryParams;

    if (req.user.role === "admin") {
      dbQuery = `
        UPDATE sampling SET tempat_sampling = $1, parameter_uji = $2, perusahaan = $3, kondisi_cuaca = $4, waktu_mulai = $5
        WHERE id = $6 RETURNING *
      `;
      queryParams = [tempat_sampling, parameter_uji, perusahaan, kondisi_cuaca, waktu_mulai, id];
    } else {
      dbQuery = `
        UPDATE sampling SET tempat_sampling = $1, parameter_uji = $2, perusahaan = $3, kondisi_cuaca = $4, waktu_mulai = $5
        WHERE id = $6 AND teknisi_id = $7 RETURNING *
      `;
      queryParams = [tempat_sampling, parameter_uji, perusahaan, kondisi_cuaca, waktu_mulai, id, req.user.id];
    }

    const result = await client.query(dbQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Sesi sampling tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Gagal mengupdate sesi sampling:", error.message);
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
