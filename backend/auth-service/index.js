require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');
const authRoutes = require("./src/routes/authRoutes");
const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true 
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.use("/", authRoutes);

app.listen(PORT, HOST, () => {
    console.log(`Auth Service berjalan di http://${HOST}:${PORT}`);
    console.log(`Menerima koneksi CORS dari: ${process.env.FRONTEND_URL}`);
});