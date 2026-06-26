require("dotenv").config();

const http = require("http");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

console.log("api gateway");

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth-service:5001",
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
  }),
);

app.use(
  "/api/telemetry",
  createProxyMiddleware({
    target: "http://telemetry-service:5002",
    changeOrigin: true,
    pathRewrite: { "^/api/telemetry": "" },
  }),
);

app.use(
  "/api/control",
  createProxyMiddleware({
    target: "http://control-service:5003",
    changeOrigin: true,
    pathRewrite: { "^/api/control": "/" },
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `[GATEWAY] Meneruskan perintah Relay ke Control Service: ${proxyReq.path}`,
      );
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

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/api/ws/telemetry")) {
    wsTelemetryProxy.upgrade(req, socket, head);
  } else if (req.url.startsWith("/api/ws/control")) {
    wsControlProxy.upgrade(req, socket, head);
  }
});

server.listen(5000, "0.0.0.0", () =>
  console.log("Gateway listen on 0.0.0.0:5000"),
);
