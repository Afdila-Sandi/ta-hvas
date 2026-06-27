const pool = require("../config/database");

exports.getLogs = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const limit = Math.min(parseInt(req.query.limit) || 500, 1000);
    const offset = parseInt(req.query.offset) || 0;

    const dbQuery = `
      SELECT id, waktu, suhu_bme, kelembaban_bme, tekanan, status_pompa, suhu_dht, kelembaban_dht, kebisingan
      FROM logs
      ORDER BY waktu DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await client.query(dbQuery, [limit, offset]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Gagal mengambil data logs:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  } finally {
    if (client) client.release();
  }
};
