require("dotenv").config();

const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const helmet = require("helmet");

const logsRoutes = require("./src/routes/logsRoutes");
const samplingRoutes = require("./src/routes/samplingRoutes");
const { initSensorService } = require("./src/services/logsService");

const app = express();
const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST || "0.0.0.0";

app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", logsRoutes);
app.use("/", samplingRoutes);

app.use((err, req, res, next) => {
  console.error("[TELEMETRY] Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/api/ws/telemetry" });

initSensorService(wss);

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
});

wss.on("close", () => clearInterval(interval));

server.listen(PORT, HOST, () => {
  console.log(`Telemetry Service berjalan di http://${HOST}:${PORT}`);
});
