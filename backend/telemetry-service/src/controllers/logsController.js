const pool = require("../config/database");

exports.getLogs = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const dbQuery = `
      SELECT * FROM logs
      ORDER BY waktu DESC
      LIMIT 500
    `;

    const result = await client.query(dbQuery);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Gagal mengambil data logs:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  } finally {
    if (client) client.release();
  }
};
