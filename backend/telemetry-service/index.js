require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const logsRoutes = require("./src/routes/logsRoutes");
const { initSensorService } = require("./src/services/logsService");

const app = express();
const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

app.use("/", logsRoutes);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/ws/telemetry" });

initSensorService(wss);

app.listen(PORT, HOST, () => {
    console.log(`Telemetry Service berjalan di http://${HOST}:${PORT}`);
});
