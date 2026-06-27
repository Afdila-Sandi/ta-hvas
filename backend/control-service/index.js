require("dotenv").config();

const http = require("http");
const express = require("express");
const helmet = require("helmet");
const { initControlService } = require("./src/services/controlService");

const app = express();
const PORT = process.env.PORT || 5003;
const HOST = process.env.HOST || "0.0.0.0";

app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const server = http.createServer(app);

initControlService(server, app);

app.use((err, req, res, next) => {
  console.error("[CONTROL] Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

server.listen(PORT, HOST, () => {
  console.log(`Control Service berjalan di http://${HOST}:${PORT}`);
});
