require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const historyRoutes = require("./src/routes/historyRoutes");
const { initSensorService } = require("./src/services/sensorService");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.use("/", historyRoutes);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/ws/telemetry" });

initSensorService(wss);

server.listen(PORT, () => {
  console.log(`telemetry Service berjalan di port internal ${PORT}`);
});
