require("dotenv").config();

const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const logsRoutes = require("./src/routes/logsRoutes");
const samplingRoutes = require("./src/routes/samplingRoutes");
const { initSensorService } = require("./src/services/logsService");

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.use(express.json());

app.use("/", logsRoutes);
app.use("/", samplingRoutes);

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
