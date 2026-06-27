require("dotenv").config();

const http = require("http");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet());

app.use(express.json({ limit: "1mb" }));

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak permintaan, coba lagi nanti" },
});
app.use(limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak percobaan login, coba lagi nanti" },
});
app.use("/api/auth/login", loginLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth-service:5001",
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
    onError: (err, req, res) => {
      console.error("[GATEWAY] Auth Service error:", err.message);
      res.status(502).json({ success: false, message: "Auth Service tidak tersedia" });
    },
  }),
);

app.use(
  "/api/telemetry",
  createProxyMiddleware({
    target: "http://telemetry-service:5002",
    changeOrigin: true,
    pathRewrite: { "^/api/telemetry": "" },
    onError: (err, req, res) => {
      console.error("[GATEWAY] Telemetry Service error:", err.message);
      res.status(502).json({ success: false, message: "Telemetry Service tidak tersedia" });
    },
  }),
);

app.use(
  "/api/control",
  createProxyMiddleware({
    target: "http://control-service:5003",
    changeOrigin: true,
    pathRewrite: { "^/api/control": "/" },
    onError: (err, req, res) => {
      console.error("[GATEWAY] Control Service error:", err.message);
      res.status(502).json({ success: false, message: "Control Service tidak tersedia" });
    },
  }),
);

const wsTelemetryProxy = createProxyMiddleware({
  target: "http://telemetry-service:5002",
  changeOrigin: true,
  ws: true,
});

const wsControlProxy = createProxyMiddleware({
  target: "http://control-service:5003",
  changeOrigin: true,
  ws: true,
});

app.use("/api/ws/telemetry", wsTelemetryProxy);
app.use("/api/ws/control", wsControlProxy);

app.use((err, req, res, next) => {
  console.error("[GATEWAY] Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
});

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/api/ws/telemetry")) {
    wsTelemetryProxy.upgrade(req, socket, head);
  } else if (req.url.startsWith("/api/ws/control")) {
    wsControlProxy.upgrade(req, socket, head);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Gateway listen on 0.0.0.0:${PORT}`),
);
