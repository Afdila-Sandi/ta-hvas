require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const { initControlService } = require("./src/services/controlService");

const app = express();
const PORT = process.env.PORT || 5003;
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

initControlService(server, app);

app.listen(PORT, HOST, () => {
  console.log(`Control Service berjalan di http://${HOST}:${PORT}`);
});
