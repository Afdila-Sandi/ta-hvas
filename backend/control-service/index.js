require("dotenv").config();

const http = require("http");
const express = require("express");
const { initControlService } = require("./src/services/controlService");

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.use(express.json());

const server = http.createServer(app);
const controlWss = require("ws").Server;

initControlService(server, app);

server.listen(PORT, HOST, () => {
  console.log(`Control Service berjalan di http://${HOST}:${PORT}`);
});
