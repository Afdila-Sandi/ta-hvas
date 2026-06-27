require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const authRoutes = require("./src/routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";

app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", authRoutes);

app.use((err, req, res, next) => {
  console.error("[AUTH] Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

app.listen(PORT, HOST, () => {
    console.log(`Auth Service berjalan di http://${HOST}:${PORT}`);
});