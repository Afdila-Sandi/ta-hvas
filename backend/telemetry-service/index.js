require("dotenv").config();

const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const logsRoutes = require("./src/routes/logsRoutes");
const { initSensorService } = require("./src/services/logsService");

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.use(express.json());

app.use("/", logsRoutes);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/api/ws/telemetry" });

initSensorService(wss);

server.listen(PORT, HOST, () => {
  console.log(`Telemetry Service berjalan di http://${HOST}:${PORT}`);
});
