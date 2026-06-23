require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser');
const authRoutes = require("./src/routes/authRoutes");
const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use("/", authRoutes);

app.listen(PORT, HOST, () => {
    console.log(`Auth Service berjalan di http://${HOST}:${PORT}`);
});